import React from 'react';

 function ProfileHeader() {
  const user = {
    name: "Daniel Deshmukh",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=daniel123",
  };

  return (
    <div className="flex items-center gap-6">
      <img
        src={user.avatarUrl}
        alt="User Avatar"
        className="w-20 h-20 rounded-full border-4 border-purple-600"
      />
      <div>
        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <button className="mt-2 px-4 py-1 bg-purple-700 hover:bg-purple-800 rounded-md text-sm font-medium">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
export default ProfileHeader;