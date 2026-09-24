import { NavLink } from "react-router-dom";

/* =========================
   HOME ICON
========================= */
function HomeIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="30"
      height="30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 21.5L24 7L41 21.5V39C41 40.1 40.1 41 39 41H9C7.9 41 7 40.1 7 39V21.5Z"
        fill="#4F7CFF"
      />

      <path
        d="M18 41V27H30V41"
        fill="#FFFFFF"
      />

      <path
        d="M24 7L41 21.5"
        stroke="#315FEA"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M24 7L7 21.5"
        stroke="#315FEA"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* =========================
   MEDICINE ICON
========================= */
function MedicineIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="30"
      height="30"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Capsule body */}
      <rect
        x="9"
        y="16"
        width="30"
        height="16"
        rx="8"
        fill="#A855F7"
        transform="rotate(-45 24 24)"
      />

      {/* Capsule second half */}
      <path
        d="M24.2 12.7L35.5 24L24.2 35.3"
        fill="#EC4899"
        transform="rotate(-45 24 24)"
      />

      {/* Capsule divider */}
      <path
        d="M24 13.5V34.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        transform="rotate(-45 24 24)"
      />
    </svg>
  );
}

/* =========================
   SCAN ICON
========================= */
function ScanIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="31"
      height="31"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 7H9C7.9 7 7 7.9 7 9V14"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 7H39C40.1 7 41 7.9 41 9V14"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M7 34V39C7 40.1 7.9 41 9 41H14"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M41 34V39C41 40.1 40.1 41 39 41H34"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M16 24H32"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="24"
        cy="24"
        r="2.5"
        fill="#FFFFFF"
      />
    </svg>
  );
}


/* =========================
   APPOINTMENT ICON
========================= */
function AppointmentIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="30"
      height="30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="7"
        y="10"
        width="34"
        height="32"
        rx="7"
        fill="#FF9F43"
      />

      <path
        d="M7 18H41V15C41 12.2 38.8 10 36 10H12C9.2 10 7 12.2 7 15V18Z"
        fill="#FF7A30"
      />

      <rect
        x="14"
        y="5"
        width="4"
        height="10"
        rx="2"
        fill="#FF7A30"
      />

      <rect
        x="30"
        y="5"
        width="4"
        height="10"
        rx="2"
        fill="#FF7A30"
      />

      <circle
        cx="16"
        cy="25"
        r="2.2"
        fill="#FFFFFF"
      />

      <circle
        cx="24"
        cy="25"
        r="2.2"
        fill="#FFFFFF"
      />

      <circle
        cx="32"
        cy="25"
        r="2.2"
        fill="#FFFFFF"
      />

      <circle
        cx="16"
        cy="33"
        r="2.2"
        fill="#FFFFFF"
      />

      <circle
        cx="24"
        cy="33"
        r="2.2"
        fill="#FFFFFF"
      />

      <circle
        cx="32"
        cy="33"
        r="2.2"
        fill="#FFFFFF"
      />
    </svg>
  );
}


/* =========================
   PHARMACY ICON
========================= */
function PharmacyIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="30"
      height="30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 13C10 10.8 11.8 9 14 9H34C36.2 9 38 10.8 38 13V39H10V13Z"
        fill="#20B486"
      />

      <path
        d="M8 17H40"
        stroke="#0D8F6D"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M17 26H31"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M24 19V33"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M15 39H33"
        stroke="#087F68"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* =========================
   BOTTOM NAV
========================= */
function BottomNav() {
  return (
    <nav className="bottom-nav">

      {/* HOME */}
      <NavLink
        to="/home"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        aria-label="Home"
      >
        <span className="nav-icon home-icon">
          <HomeIcon />
        </span>
      </NavLink>


      {/* MEDICINES */}
      <NavLink
        to="/medicines"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        aria-label="Medicines"
      >
        <span className="nav-icon medicine-icon">
          <MedicineIcon />
        </span>
      </NavLink>


      {/* SCAN */}
      <NavLink
        to="/prescription"
        className={({ isActive }) =>
          isActive
            ? "nav-item scan-button active"
            : "nav-item scan-button"
        }
        aria-label="Scan prescription"
      >
        <div className="scan-circle">
          <ScanIcon />
        </div>
      </NavLink>


      {/* APPOINTMENTS */}
      <NavLink
        to="/appointments"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        aria-label="Appointments"
      >
        <span className="nav-icon appointment-icon">
          <AppointmentIcon />
        </span>
      </NavLink>


      {/* PHARMACY */}
      <NavLink
        to="/pharmacy"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        aria-label="Pharmacy"
      >
        <span className="nav-icon pharmacy-icon">
          <PharmacyIcon />
        </span>
      </NavLink>

    </nav>
  );
}

export default BottomNav;