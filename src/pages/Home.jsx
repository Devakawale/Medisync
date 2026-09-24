import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

function Home() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const savedMedicines = JSON.parse(
      localStorage.getItem("medisync_medicines") || "[]"
    );

    const savedAppointments = JSON.parse(
      localStorage.getItem("medisync_appointments") || "[]"
    );

    setMedicines(savedMedicines);
    setAppointments(savedAppointments);

    const session = JSON.parse(
      localStorage.getItem("medisync_session") || "null"
    );

    const loggedInEmail = session?.email
      ?.trim()
      .toLowerCase();

    if (loggedInEmail) {
      const profileKey = `medisync_profile_${loggedInEmail}`;

      const savedProfile = JSON.parse(
        localStorage.getItem(profileKey) || "null"
      );

      if (savedProfile?.name?.trim()) {
        setUserName(savedProfile.name.trim());
      }
    }
  }, []);

  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(
        `${appointment.date}T${appointment.time}`
      );

      return appointmentDate >= new Date();
    })
    .sort((a, b) => {
      const first = new Date(
        `${a.date}T${a.time}`
      );

      const second = new Date(
        `${b.date}T${b.time}`
      );

      return first - second;
    });

  function formatAppointmentDate(date) {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <>
      <main className="app-page">
        <header className="home-header">
          <div>
            <h1>MediSync</h1>
          </div>

          <button
            className="profile-circle"
            onClick={() => navigate("/profile")}
            title={userName || "Profile"}
          >
            <span className="profile-name-text">
              {userName || "M"}
            </span>
          </button>
        </header>

        <section className="welcome-card">
          <p className="eyebrow">
            Medication overview
          </p>

          <h2>
            Stay on top of your medicines.
          </h2>

          <p>
            Keep your medication schedule organized
            and never miss an important dose.
          </p>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Today's Medicines</h2>

            <span>{medicines.length}</span>
          </div>

          {medicines.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">💊</div>

              <h3>No medicines added</h3>

              <p>
                Add your first medicine to start
                building your schedule.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/medicines/add")
                }
              >
                Add Medicine
              </button>
            </div>
          ) : (
            <div className="medicine-preview-list">
              {medicines.slice(0, 3).map((medicine) => (
                <div
                  className="medicine-preview"
                  key={medicine.id}
                >
                  <div>
                    <strong>{medicine.name}</strong>

                    <p>{medicine.dosage}</p>
                  </div>

                  <span>
                    {medicine.times?.[0] || "--:--"}
                  </span>
                </div>
              ))}

              {medicines.length > 3 && (
                <button
                  className="text-button"
                  onClick={() =>
                    navigate("/medicines")
                  }
                >
                  View all medicines →
                </button>
              )}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Upcoming Appointments</h2>

            <button
              className="text-button"
              onClick={() =>
                navigate("/appointments")
              }
            >
              View all
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="empty-card compact">
              <h3>No appointments scheduled</h3>

              <p>
                Your upcoming appointments will
                appear here.
              </p>

              <button
                className="secondary-button"
                onClick={() =>
                  navigate("/appointments")
                }
              >
                Add Appointment
              </button>
            </div>
          ) : (
            <div className="appointment-preview-list">
              {upcomingAppointments
                .slice(0, 2)
                .map((appointment) => (
                  <button
                    className="appointment-preview"
                    key={appointment.id}
                    onClick={() =>
                      navigate("/appointments")
                    }
                  >
                    <div className="appointment-date-box">
                      <strong>
                        {formatAppointmentDate(
                          appointment.date
                        )}
                      </strong>

                      <span>
                        {appointment.time}
                      </span>
                    </div>

                    <div>
                      <strong>
                        {appointment.doctor}
                      </strong>

                      <p>
                        {appointment.hospital ||
                          "Healthcare appointment"}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </>
  );
}

export default Home;