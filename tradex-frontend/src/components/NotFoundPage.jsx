import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E15] text-white p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-8xl font-bold text-brand/20">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-content-secondary mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-content-secondary hover:text-white hover:border-white/20 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/main-page")}
            className="px-4 py-2 bg-brand rounded-lg text-white hover:bg-brand-hover transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
