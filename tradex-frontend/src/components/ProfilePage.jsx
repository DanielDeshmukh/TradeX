import { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import ContactInfo from "../components/ContactInfo";
import SubscriptionPlan from "../components/SubscriptionPlan";
import ReferralCode from "../components/ReferralCode";
import ActivityHeatmap from "../components/ActivityHeatmap";
import Header from "./Header";
import  supabase  from "../lib/supabase"; 

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("User signed out successfully");
      window.location.href = "/register";
    }
  } catch (err) {
    console.error("Unexpected error signing out:", err);
  }
};

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } else {
        setUser(data.user || null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (!user) return <p className="text-center mt-10">User not logged in.</p>;

  return (
    <div className="p-4 sm:p-6 bg-[#0F1117] text-white min-h-screen">
      <Header />
      <div className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-[#0F1117] p-4 sm:p-8 space-y-6 sm:space-y-8">
        <ProfileHeader user={user} />
        <ContactInfo user={user} />
        <ReferralCode user={user} />
        <SubscriptionPlan user={user} />
        <div className="overflow-x-auto">
          <ActivityHeatmap user={user} />
        </div>
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={signOut}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
