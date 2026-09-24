import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import medisyncLogo from "../assets/medisync-logo.jpeg";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registrationMessage =
    location.state?.message || "";

  async function hashPassword(value) {
    const data = new TextEncoder().encode(value);

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      data
    );

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) =>
        byte.toString(16).padStart(2, "0")
      )
      .join("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    const accounts = JSON.parse(
      localStorage.getItem("medisync_accounts") || "[]"
    );

    const normalizedEmail =
      email.trim().toLowerCase();

    const account = accounts.find(
      (item) =>
        item.email === normalizedEmail
    );

    if (!account) {
      setError(
        "No account found with this email."
      );
      return;
    }

    const passwordHash =
      await hashPassword(password);

    if (
      passwordHash !== account.passwordHash
    ) {
      setError("Incorrect password.");
      return;
    }

    localStorage.setItem(
      "medisync_session",
      JSON.stringify({
        email: normalizedEmail,
        loggedInAt:
          new Date().toISOString(),
      })
    );

    const profileKey =
      `medisync_profile_${normalizedEmail}`;

    localStorage.setItem(
      profileKey,
      JSON.stringify({
        name: account.name || "",
        email: normalizedEmail,
      })
    );

    navigate("/home", {
      replace: true,
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">

        {/* MediSync Logo */}
        <div className="auth-brand">
          <div className="login-logo">
            <img
              src={medisyncLogo}
              alt="MediSync"
            />
          </div>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to manage your medicines,
            appointments and reminders.
          </p>
        </div>

        {registrationMessage && (
          <div className="alert alert-success">
            {registrationMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
          >
            Sign in
          </button>

        </form>

        <div className="auth-footer">
          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create account
          </Link>
        </div>

      </section>
    </main>
  );
}

export default Login;