import { useNavigate } from "react-router-dom";

export default function AuthErrorPage({ message }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E15] text-white p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-bearish"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-content-secondary mb-6">
          {message || "Your session has expired or you're not authorized to access this page."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/landing-page")}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-content-secondary hover:text-white hover:border-white/20 transition"
          >
            Go to Landing Page
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-brand rounded-lg text-white hover:bg-brand-hover transition"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
