import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfileButton() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const session = JSON.parse(
      localStorage.getItem("medisync_session") || "null"
    );

    const loggedInEmail = session?.email
      ?.trim()
      .toLowerCase();

    if (!loggedInEmail) {
      setUserName("");
      return;
    }

    const profileKey = `medisync_profile_${loggedInEmail}`;

    const savedProfile = JSON.parse(
      localStorage.getItem(profileKey) || "null"
    );

    if (savedProfile?.name?.trim()) {
      setUserName(savedProfile.name.trim());
    } else {
      setUserName("");
    }
  }, []);

  return (
    <button
      type="button"
      className="profile-circle"
      onClick={() => navigate("/profile")}
      title={userName || "Profile"}
      aria-label="Open profile"
    >
      <span className="profile-name-text">
        {userName || "M"}
      </span>
    </button>
  );
}

export default ProfileButton;