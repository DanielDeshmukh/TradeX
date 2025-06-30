import React, { useState } from 'react';

function ContactInfo() {
  const [email, setEmail] = useState("deshmukhdaniel2005@gmail.com");
  const [phone, setPhone] = useState("+91 927-009-3027");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    console.log("Saved:", { email, phone });
    setIsEditing(false);
  };

  return (
    <div className="bg-[#232323] p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <button
          className="text-sm text-purple-400 hover:text-purple-300"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            disabled={!isEditing}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 rounded-md bg-[#1a1a1a] text-white border ${
              isEditing ? "border-purple-500" : "border-transparent"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Phone</label>
          <input
            type="text"
            disabled={!isEditing}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-3 py-2 rounded-md bg-[#1a1a1a] text-white border ${
              isEditing ? "border-purple-500" : "border-transparent"
            }`}
          />
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
export default ContactInfo;