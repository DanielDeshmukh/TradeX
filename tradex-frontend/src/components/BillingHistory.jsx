import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

const DUMMY_BILLING = [
  { id: 1, date: "2026-06-01", amount: 499, status: "paid", description: "Pro Plan - Monthly" },
  { id: 2, date: "2026-05-01", amount: 499, status: "paid", description: "Pro Plan - Monthly" },
  { id: 3, date: "2026-04-01", amount: 499, status: "paid", description: "Pro Plan - Monthly" },
  { id: 4, date: "2026-03-01", amount: 499, status: "paid", description: "Pro Plan - Monthly" },
];

const statusBadge = {
  paid: { variant: "success", label: "Paid" },
  pending: { variant: "warning", label: "Pending" },
  failed: { variant: "danger", label: "Failed" },
};

export default function BillingHistory() {
  const [billing, setBilling] = useState(DUMMY_BILLING);
  const [nextBilling, setNextBilling] = useState("2026-07-01");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) return;
        const res = await supabase.functions.invoke("billing-history", {
          body: { user_id: data.user.id },
        });
        if (res?.data?.billing) setBilling(res.data.billing);
        if (res?.data?.next_billing_date) setNextBilling(res.data.next_billing_date);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-content">Billing History</h2>
        {nextBilling && (
          <span className="text-xs text-content-secondary">
            Next billing: <span className="text-brand font-medium">{new Date(nextBilling).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
        </div>
      ) : billing.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-content-secondary text-sm">No billing history yet</p>
        </Card>
      ) : (
        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-content-secondary text-xs uppercase tracking-wider bg-surface-input/50">
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-right px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {billing.map((item) => {
                  const badge = statusBadge[item.status] || statusBadge.paid;
                  return (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-surface-input/30 transition-colors">
                      <td className="px-4 py-3 text-content font-mono text-xs">
                        {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-content-secondary">{item.description}</td>
                      <td className="px-4 py-3 text-right text-content font-mono">₹{item.amount}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
