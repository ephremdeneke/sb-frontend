import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailLooksValid = useMemo(() => {
    if (!email) return false;
    // simple UX check; not meant as strict validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <form
        onSubmit={onSubmit}
        className="w-80 bg-orange-500 rounded-lg p-5 space-y-4"
      >
        <h1 className="text-white text-center font-semibold text-lg">
          Forgot password
        </h1>

        <p className="text-sm text-orange-50 text-center">
          Enter your email and we’ll send reset instructions (front-end only).
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 rounded-lg outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitted}
        />

        {submitted ? (
          <p className="text-sm text-orange-50 text-center">
            If an account exists for <span className="font-semibold">{email}</span>
            , you’ll receive reset instructions.
          </p>
        ) : (
          <button
            type="submit"
            disabled={!emailLooksValid}
            className="w-full bg-orange-900 text-white py-2 rounded-lg hover:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send reset link
          </button>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-white underline underline-offset-2 hover:opacity-90"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

