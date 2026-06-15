import { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import ContactInfo from "../components/ContactInfo";
import SubscriptionPlan from "../components/SubscriptionPlan";
import ReferralCode from "../components/ReferralCode";
import ProfilePageSkeleton from "./ProfilePageSkeleton";
import ActivityHeatmap from "../components/ActivityHeatmap";
import Header from "./Header";
import supabase from "../lib/supabase";

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

  if (loading)
    return <ProfilePageSkeleton />;
  if (!user)
    return <p className="text-center mt-10 text-content-secondary">User not logged in.</p>;

  return (
    <div className="min-h-screen bg-[#0B0E15] text-white p-4 sm:p-6">
      <Header />

      <div className="mt-10 w-full max-w-6xl mx-auto rounded-2xl shadow-lg shadow-brand/20
                      bg-bg-secondary/70 backdrop-blur-md p-4 sm:p-8 space-y-6 sm:space-y-8">
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
            className="px-4 py-2 bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] 
                       hover:opacity-90 rounded-lg font-semibold shadow-lg transition w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
