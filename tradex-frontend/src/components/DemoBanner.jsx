import { isDemoMode } from "../lib/supabase";

export default function DemoBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-black text-center py-2 px-4 text-sm font-medium">
      <span className="mr-2">⚠️</span>
      Demo Mode — Using mock data. Configure Supabase in .env for full functionality.
      <span className="ml-2">⚠️</span>
    </div>
  );
}
