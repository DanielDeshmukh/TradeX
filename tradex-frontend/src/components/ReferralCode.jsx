import React, { useState } from 'react';

function ReferralCode() {
  const [copied, setCopied] = useState(false);
  const referral = {
    code: "TRADX-DANIEL-27A3",
  
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referral.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#232323] p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Referral Code</h3>

      <div className="space-y-2">
        <div className="bg-[#1a1a1a] px-4 py-2 rounded-lg flex justify-between items-center">
          <span className="text-purple-300 font-mono">{referral.code}</span>
          <button
            onClick={copyToClipboard}
            className="text-sm text-purple-400 hover:text-purple-200"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

       
      </div>
    </div>
  );
}
export default ReferralCode;