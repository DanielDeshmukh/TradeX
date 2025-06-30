import React, { useState } from 'react';

function SecuritySettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [has2FA, setHas2FA] = useState(false);

  const handlePasswordChange = () => {
    if (password === confirm && password.length >= 6) {
      console.log("Password updated:", password);
      setIsEditing(false);
      setPassword("");
      setConfirm("");
    } else {
      alert("Passwords must match and be at least 6 characters.");
    }
  };

  return (
    <div className="bg-[#232323] p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Security Settings</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#1a1a1a] text-white border border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#1a1a1a] text-white border border-purple-500"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Save Password
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-400">*********</p>
        )}

        <div className="flex justify-between items-center mt-6">
          <label className="text-sm text-gray-300">Two-Factor Authentication</label>
          <button
            onClick={() => setHas2FA(!has2FA)}
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              has2FA ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            {has2FA ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default SecuritySettings;