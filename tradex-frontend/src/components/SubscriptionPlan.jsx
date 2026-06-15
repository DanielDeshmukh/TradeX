import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { toast } from "react-toastify";

function SubscriptionPlan({ user }) {
  const [plans, setPlans] = useState([
    {
      name: "Basic",
      base_amount: 199,
      features: [
        "15 Trades per day",
        `₹${Math.floor(199 * 0.2)} Add-on 10 Trades per day`,
        "5 alerts per day",
      ],
    },
    {
      name: "Pro",
      base_amount: 499,
      features: [
        "30 Trades per day",
        `₹${Math.floor(499 * 0.2)} Add-on 20 Trades per day`,
        "10 alerts per day",
      ],
    },
    {
      name: "Elite",
      base_amount: 999,
      features: [
        "50 Trades per day",
        `₹${Math.floor(999 * 0.2)} Add-on 30 Trades per day`,
        "20 alerts per day",
      ],
    },
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCurrentPlan = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("current_plan")
        .eq("id", user.id)
        .single();

      if (error) {
        toast.error(`Failed to fetch current plan: ${error.message}`, {
          style: { background: "#1f1f1f", color: "#ff6b6b" },
        });
        return;
      }

      setPlans((prevPlans) =>
        prevPlans.map((p) => ({ ...p, current: p.name === data.current_plan }))
      );
    };

    fetchCurrentPlan();
  }, [user]);

  const assignPlanToUser = async (planName) => {
    if (!user?.id) {
      toast.error("No user provided. Cannot assign plan.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
      return;
    }

    setPlans((prevPlans) =>
      prevPlans.map((p) => ({ ...p, current: p.name === planName }))
    );

    const { error } = await supabase
      .from("profiles")
      .update({ current_plan: planName })
      .eq("id", user.id);

    if (error) {
      toast.error(`Failed to update plan: ${error.message}`, {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } else {
      toast.success(`Plan "${planName}" assigned successfully!`, {
        style: { background: "#1f1f1f", color: "#4ade80" },
      });
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-6 text-white">Subscription Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-5 border ${
              plan.current
                ? "border-brand bg-surface-elevated"
                : "border-white/10 bg-surface"
            } flex flex-col`}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xl font-semibold text-white">{plan.name}</h4>
              {plan.current && (
                <span className="text-green-400 text-sm">Current</span>
              )}
            </div>

            <p className="text-purple-400 font-medium mb-4">
              ₹{plan.base_amount}/mo
            </p>

            <ul className="text-sm text-gray-300 space-y-2 mb-4">
              {plan.features.map((feature, i) => (
                <li key={i}>• {feature}</li>
              ))}
            </ul>

            <button
              className={`mt-auto py-2 rounded-md text-sm font-medium transition ${
                plan.current
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "btn-primary hover:opacity-90"
              }`}
              disabled={plan.current}
              onClick={() => assignPlanToUser(plan.name)}
            >
              {plan.current ? "Current Plan" : `Select ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionPlan;
