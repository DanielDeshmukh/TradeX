import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { toast } from "react-toastify";

function ReferralCode() {
  const [session, setSession] = useState(null);
  const [codes, setCodes] = useState([]);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const MAX_PER_YEAR = 3;

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session || null);
      if (session?.user) await fetchCodes(session.user.id);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s || null);
      if (s?.user) fetchCodes(s.user.id);
      else {
        setCodes([]);
        setTotalGenerated(0);
      }
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const fetchCodes = async (userIdParam) => {
    setLoading(true);
    try {
      const userId = userIdParam || session?.user?.id;
      if (!userId) {
        setCodes([]);
        setTotalGenerated(0);
        return;
      }

      const { count, error: countError } = await supabase
        .from("referral_codes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", new Date(new Date().getFullYear(), 0, 1).toISOString());

      if (countError) throw countError;
      setTotalGenerated(count ?? 0);

      const { data, error } = await supabase
        .from("referral_codes")
        .select("id, code, created_at")
        .eq("user_id", userId)
        .eq("used", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      toast.error(`Error fetching codes: ${err.message}`, {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerateLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("generate-referral", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: "generate" }
      });

      if (error) throw error;

      await fetchCodes(session.user.id);
      toast.success(`Generated: ${data?.code}`, {
        style: { background: "#1f1f1f", color: "#4ade80" },
      });
    } catch (err) {
      toast.error(err.message, {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleUseCode = async () => {
    const trimmedCode = redeemCode.trim();
    if (!trimmedCode) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const { error } = await supabase.functions.invoke("use-referral", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { code: trimmedCode }
      });

      if (error) throw error;

      toast.success("Referral used successfully!", {
        style: { background: "#1f1f1f", color: "#4ade80" },
      });
      setRedeemCode("");
      await fetchCodes(session.user.id);
    } catch (err) {
      toast.error(err.message, {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!", {
        style: { background: "#1f1f1f", color: "#4ade80" },
      });
    } catch {
      toast.error("Failed to copy", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    }
  };

  const remaining = Math.max(0, MAX_PER_YEAR - totalGenerated);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Referral Codes</h3>

      <div className="mb-3 text-sm text-content-secondary">
        Generated:{" "}
        <span className="font-semibold text-white">{totalGenerated}</span> / {MAX_PER_YEAR}
        {remaining === 0 ? (
          <span className="ml-2 text-yellow-400">Limit reached for this year</span>
        ) : (
          <span className="ml-2 text-bullish-muted">You can generate {remaining} more</span>
        )}
      </div>

      <div className="space-y-2">
        {loading && <div className="text-sm text-content-secondary">Loading...</div>}
        {!loading && codes.length === 0 && (
          <div className="text-sm text-content-secondary">No active referral codes. Generate one.</div>
        )}

        {codes.map((c) => (
          <div
            key={c.id}
            className="bg-surface-input px-4 py-2 rounded-lg flex justify-between items-center hover:bg-surface-elevated transition"
          >
            <span className="text-white font-mono">{c.code}</span>
            <button
              onClick={() => copyToClipboard(c.code)}
              className="text-sm text-brand hover:text-brand-hover transition"
            >
              Copy
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={generateLoading || remaining <= 0}
          className="btn-primary hover:opacity-90 px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition"
        >
          {generateLoading ? "Generating..." : "Generate New Code"}
        </button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Enter referral code to redeem"
          value={redeemCode}
          onChange={(e) => setRedeemCode(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-surface-input text-white border border-brand"
        />
        <button
          onClick={handleUseCode}
          disabled={loading || !redeemCode.trim()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition"
        >
          {loading ? "Using..." : "Use Referral"}
        </button>
      </div>
    </div>
  );
}

export default ReferralCode;
