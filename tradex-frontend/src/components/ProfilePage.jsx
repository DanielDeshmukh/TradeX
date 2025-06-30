import ProfileHeader from '../components/ProfileHeader';
import ContactInfo from '../components/ContactInfo';
import SecuritySettings from '../components/SecuritySettings';
import SubscriptionPlan from '../components/SubscriptionPlan';
import ReferralCode from '../components/ReferralCode';
import ActivityHeatmap from '../components/ActivityHeatmap';
import Header from './Header';

function ProfilePage()  {
  return (
    <div className="p-6 bg-[#0F1117] text-white min-h-screen">
        <Header/>
      <div className="w-full rounded-xl shadow-lg bg-[#0F1117] p-8 space-y-8">
        <ProfileHeader />
        <ContactInfo />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecuritySettings />
          <ReferralCode />
        </div>
        <SubscriptionPlan />
        <ActivityHeatmap />
        <div className="text-right">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfilePage;