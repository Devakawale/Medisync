import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import medisyncLogo from "../assets/medisync-logo.jpeg";

function Registration() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

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

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------
    // Validation
    // -----------------------------

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // -----------------------------
    // Get existing accounts
    // -----------------------------

    const accounts = JSON.parse(
      localStorage.getItem("medisync_accounts") || "[]"
    );

    // -----------------------------
    // Check duplicate email
    // -----------------------------

    const existingAccount = accounts.find(
      (account) =>
        account.email === normalizedEmail
    );

    if (existingAccount) {
      setError(
        "An account with this email already exists."
      );
      return;
    }

    // -----------------------------
    // Hash password
    // -----------------------------

    const passwordHash = await hashPassword(password);

    // -----------------------------
    // Create account
    // -----------------------------

    const newAccount = {
      id: crypto.randomUUID(),
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    // -----------------------------
    // Save account
    // -----------------------------

    localStorage.setItem(
      "medisync_accounts",
      JSON.stringify([
        ...accounts,
        newAccount,
      ])
    );

    // -----------------------------
    // Go to login
    // -----------------------------

    navigate("/login", {
      replace: true,
      state: {
        message:
          "Account created successfully. Please sign in.",
      },
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="login-logo">
            <img
              src={medisyncLogo}
              alt="MediSync"
            />
          </div>

          <p className="eyebrow">
            MediSync
          </p>

          <h1>
            Create your account
          </h1>

          <p>
            Start managing your medicines and
            healthcare schedule in one place.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}

          <div className="form-group">
            <label htmlFor="register-name">
              Full name
            </label>

            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          {/* Email */}

          <div className="form-group">
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}

          <div className="form-group">
            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}

          <div className="form-group">
            <label htmlFor="register-confirm-password">
              Confirm password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Enter password again"
              autoComplete="new-password"
            />
          </div>

          {/* Submit */}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
          >
            Create account
          </button>
        </form>

        <div className="auth-footer">
          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Registration;