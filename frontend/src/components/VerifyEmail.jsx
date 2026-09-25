import React, { useEffect, useState, useRef } from "react";
import { authAPI } from "../services/api";

const VerifyEmail = ({ token }) => {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent React StrictMode from sending the verification request twice
    if (hasVerified.current) return;

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    hasVerified.current = true;

    const verify = async () => {
      try {
        const response = await authAPI.verifyEmail(token);

        setStatus("success");
        setMessage(response.data.message);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Email verification failed."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">

      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 w-full max-w-md text-center">

        {status === "verifying" && (
          <>
            <div className="text-4xl mb-4">⏳</div>

            <h1 className="text-2xl font-bold text-white mb-3">
              Verifying Email...
            </h1>

            <p className="text-gray-400">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>

            <h1 className="text-2xl font-bold text-green-400 mb-3">
              Email Verified!
            </h1>

            <p className="text-gray-300 mb-6">
              {message}
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
            >
              Go to Sign In
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>

            <h1 className="text-2xl font-bold text-red-400 mb-3">
              Verification Failed
            </h1>

            <p className="text-gray-300 mb-6">
              {message}
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
            >
              Back to Sign In
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;