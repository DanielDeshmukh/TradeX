import { useNavigate } from "react-router-dom";

export default function NetworkErrorPage({ onRetry }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E15] text-white p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Network Error</h1>
        <p className="text-content-secondary mb-6">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/main-page")}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-content-secondary hover:text-white hover:border-white/20 transition"
          >
            Go to Dashboard
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-brand rounded-lg text-white hover:bg-brand-hover transition"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
