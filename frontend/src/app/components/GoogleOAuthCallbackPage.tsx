import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../lib/api";

export function GoogleOAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the token from URL hash (set by backend)
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const token = hash.get("token");
        const callbackError = hash.get("error");
        const returnTo = hash.get("returnTo");

        if (callbackError) {
          setError(`Authentication failed: ${callbackError}`);
          return;
        }

        if (!token) {
          setError("No authentication token received");
          return;
        }

        // Store token
        setAuthToken(token);

        // Redirect to a safe in-app path.
        const destination =
          returnTo && returnTo.startsWith("/")
            ? returnTo
            : "/dashboard";

        navigate(destination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Callback processing failed");
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EA]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#83311A] mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 bg-[#E85D2A] text-white rounded-lg hover:bg-[#d4531f] transition-colors"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1EA]">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E85D2A] rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
          <div className="w-12 h-12 bg-[#F5F1EA] rounded-full"></div>
        </div>
        <h1 className="text-2xl font-bold text-[#83311A] mb-2">Completing Sign In</h1>
        <p className="text-gray-600">Please wait while we authenticate you...</p>
      </div>
    </div>
  );
}
