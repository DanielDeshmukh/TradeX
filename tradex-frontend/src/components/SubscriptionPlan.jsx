import React from 'react';

function SubscriptionPlan() {
    
    const plans = [
        {
            name: "Basic",
            price: "₹199/mo",
            features: [
                "15 Trades per day",
                "Add-on 10 Trades",
                "5 alert notification per day"
            ],
            current: false
        },
        {
            name: "Pro",
            price: "₹499/mo",
            features: [
                "30 Trader per day",
                "Add-on 20 Trades",
                "10 alert notification per day",

            ],
            current: false
        },
        {
            name: "Elite",
            price: "₹1,999/mo",
            features: [
                "50 Trades per day",
                "Add-on 30 Trades",
                "20 alert notification per day",

            ],
            current: true
        }
    ];

    return (
        <div className="bg-[#232323] p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-6">Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`rounded-xl p-5 border ${plan.current
                                ? "border-purple-500 bg-[#1e1e2e]"
                                : "border-gray-600 bg-[#1a1a1a]"
                            }`}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xl font-semibold text-white">{plan.name}</h4>
                            {plan.current && (
                                <span className="text-xs text-green-400 bg-green-900 px-2 py-0.5 rounded-full">
                                    Current
                                </span>
                            )}
                        </div>
                        <p className="text-purple-400 font-medium mb-4">{plan.price}</p>
                        <ul className="text-sm text-gray-300 space-y-2 mb-4">
                            {plan.features.map((feature, idx) => (
                                <li key={idx}>• {feature}</li>
                            ))}
                        </ul>
                        {!plan.current && (
                            <button className="w-full mt-auto bg-purple-700 hover:bg-purple-800 py-2 text-sm rounded-md">
                                Upgrade to {plan.name}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
export default SubscriptionPlan;