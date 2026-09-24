import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalNotifications } from "@capacitor/local-notifications";

import BottomNav from "../components/BottomNav";
import { scheduleTestNotification } from "../services/remindersService";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = JSON.parse(
      localStorage.getItem("medisync_session") || "null"
    );

    const loggedInEmail = session?.email?.trim().toLowerCase();

    if (!loggedInEmail) {
      navigate("/login", { replace: true });
      return;
    }

    const profileKey = `medisync_profile_${loggedInEmail}`;

    const accountProfile = JSON.parse(
      localStorage.getItem(profileKey) || "null"
    );

    if (accountProfile) {
      const savedProfile = {
        name: accountProfile.name || "",
        email: loggedInEmail,
      };

      setProfile(savedProfile);
      setName(savedProfile.name);
      setEmail(savedProfile.email);

      return;
    }

    const oldProfile = JSON.parse(
      localStorage.getItem("medisync_profile") || "null"
    );

    if (oldProfile) {
      const migratedProfile = {
        name: oldProfile.name || "",
        email: loggedInEmail,
      };

      localStorage.setItem(
        profileKey,
        JSON.stringify(migratedProfile)
      );

      setProfile(migratedProfile);
      setName(migratedProfile.name);
      setEmail(migratedProfile.email);

      return;
    }

    const newProfile = {
      name: "",
      email: loggedInEmail,
    };

    setProfile(newProfile);
    setName("");
    setEmail(loggedInEmail);
  }, [navigate]);

  function showMessage(text, duration = 3000) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, duration);
  }

  function saveProfile(event) {
    event.preventDefault();

    const session = JSON.parse(
      localStorage.getItem("medisync_session") || "null"
    );

    const loggedInEmail = session?.email?.trim().toLowerCase();

    if (!loggedInEmail) {
      navigate("/login", { replace: true });
      return;
    }

    const updated = {
      name: name.trim(),
      email: loggedInEmail,
    };

    const profileKey = `medisync_profile_${loggedInEmail}`;

    localStorage.setItem(
      profileKey,
      JSON.stringify(updated)
    );

    setProfile(updated);
    setEmail(loggedInEmail);
    setEditing(false);

    showMessage("Profile saved successfully.", 2500);
  }

  async function enableNotifications() {
    try {
      const currentPermission =
        await LocalNotifications.checkPermissions();

      if (currentPermission.display === "granted") {
        showMessage("Notifications are already enabled.");
        return;
      }

      const permission =
        await LocalNotifications.requestPermissions();

      if (permission.display === "granted") {
        showMessage("Notifications enabled successfully.");
      } else {
        showMessage(
          "Notification permission was not granted."
        );
      }
    } catch (error) {
      console.error(
        "Native notification permission error:",
        error
      );

      showMessage(
        "Unable to enable notifications."
      );
    }
  }

  async function testNativeNotification() {
    try {
      const permission =
        await LocalNotifications.checkPermissions();

      if (permission.display !== "granted") {
        const requested =
          await LocalNotifications.requestPermissions();

        if (requested.display !== "granted") {
          showMessage(
            "Please allow notifications first."
          );
          return;
        }
      }

      const result =
        await scheduleTestNotification(10);

      if (result?.success) {
        showMessage(
          "Test notification scheduled. Check your phone in 10 seconds.",
          5000
        );
      } else {
        console.error(
          "Test notification failed:",
          result
        );

        showMessage(
          "Unable to schedule test notification."
        );
      }
    } catch (error) {
      console.error(
        "Native test notification error:",
        error
      );

      showMessage(
        "Native notification test failed."
      );
    }
  }

  function logout() {
    localStorage.removeItem("medisync_session");
    navigate("/login", { replace: true });
  }

  const initials =
    profile.name
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M";

  return (
    <>
      <main className="app-page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Account</p>

            <h1>Profile</h1>
          </div>
        </header>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        <section className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {initials}
            </div>

            <div>
              <h2 className="profile-name">
                {profile.name || "Your profile"}
              </h2>

              <p className="profile-email">
                {profile.email ||
                  "Add your email address"}
              </p>
            </div>
          </div>
        </section>

        {editing ? (
          <section className="form-section">
            <h2>Edit profile</h2>

            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label htmlFor="profile-name">
                  Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">
                  Email
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setName(profile.name || "");
                    setEmail(profile.email || "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="profile-card">
            <div className="profile-menu">
              <button
                className="profile-menu-item"
                onClick={() => setEditing(true)}
              >
                <span>Edit profile</span>
                <span>›</span>
              </button>

              <button
                className="profile-menu-item"
                onClick={enableNotifications}
              >
                <span>
                  Enable notifications
                </span>

                <span>›</span>
              </button>

              <button
                className="profile-menu-item"
                onClick={testNativeNotification}
              >
                <span>
                  Test notification
                </span>

                <span>›</span>
              </button>

              <button
                className="profile-menu-item"
                onClick={() =>
                  navigate("/medicines")
                }
              >
                <span>Manage medicines</span>
                <span>›</span>
              </button>

              <button
                className="profile-menu-item"
                onClick={logout}
              >
                <span
                  style={{ color: "#dc2626" }}
                >
                  Log out
                </span>

                <span
                  style={{ color: "#dc2626" }}
                >
                  ›
                </span>
              </button>
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </>
  );
}

export default Profile;