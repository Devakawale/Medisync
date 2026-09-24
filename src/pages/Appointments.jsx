import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import ProfileButton from "../components/ProfileButton";

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 20H8L19 9C20.1 7.9 20.1 6.1 19 5C17.9 3.9 16.1 3.9 15 5L4 16V20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.5 6.5L17.5 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 7H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M9 7V4H15V7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M7 7L8 20H16L17 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 11V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M14 11V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [doctor, setDoctor] = useState("");
  const [hospital, setHospital] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("medisync_appointments") || "[]"
    );

    setAppointments(saved);
  }, []);

  function saveAppointments(updated) {
    setAppointments(updated);

    localStorage.setItem(
      "medisync_appointments",
      JSON.stringify(updated)
    );
  }

  /*
    Automatically formats doctor names.

    Examples:
    Sharma          -> Dr. Sharma
    dr sharma      -> Dr. Sharma
    Dr. Sharma     -> Dr. Sharma
    DR. SHARMA     -> Dr. Sharma
    Dr Dr Sharma   -> Dr. Sharma
  */
  function formatDoctorName(value) {
    let cleaned = value.trim();

    if (!cleaned) {
      return "";
    }

    cleaned = cleaned.replace(/\s+/g, " ");

    cleaned = cleaned.replace(
      /^(dr\.?\s*)+/i,
      ""
    );

    cleaned = cleaned.trim();

    if (!cleaned) {
      return "";
    }

    return `Dr. ${cleaned}`;
  }

  function resetForm() {
    setDoctor("");
    setHospital("");
    setDate("");
    setTime("");
    setNotes("");
    setError("");
    setEditingId(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formattedDoctor = formatDoctorName(doctor);

    if (!formattedDoctor) {
      setError("Please enter doctor name.");
      return;
    }

    if (!date) {
      setError("Please select appointment date.");
      return;
    }

    if (!time) {
      setError("Please select appointment time.");
      return;
    }

    if (editingId) {
      const updated = appointments.map((appointment) =>
        appointment.id === editingId
          ? {
              ...appointment,
              doctor: formattedDoctor,
              hospital: hospital.trim(),
              date,
              time,
              notes: notes.trim(),
            }
          : appointment
      );

      saveAppointments(updated);
    } else {
      const appointment = {
        id: crypto.randomUUID(),
        doctor: formattedDoctor,
        hospital: hospital.trim(),
        date,
        time,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };

      saveAppointments([
        ...appointments,
        appointment,
      ]);
    }

    closeForm();
  }

  function editAppointment(appointment) {
    setEditingId(appointment.id);

    /*
      If an older appointment was saved without "Dr.",
      the form still gets the clean doctor name.
    */
    const cleanDoctor = appointment.doctor
      ? appointment.doctor
          .replace(/^(dr\.?\s*)+/i, "")
          .trim()
      : "";

    setDoctor(cleanDoctor);
    setHospital(appointment.hospital || "");
    setDate(appointment.date || "");
    setTime(appointment.time || "");
    setNotes(appointment.notes || "");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteAppointment(id) {
    const updated = appointments.filter(
      (appointment) => appointment.id !== id
    );

    saveAppointments(updated);
  }

  function formatDate(value) {
    if (!value) return "";

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(value) {
    if (!value) return "";

    const [hours, minutes] = value.split(":");
    const hourNumber = Number(hours);

    const suffix =
      hourNumber >= 12 ? "PM" : "AM";

    const displayHour =
      hourNumber % 12 === 0
        ? 12
        : hourNumber % 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  return (
    <>
      <main className="app-page appointments-page">
        <header className="page-header">
          <div>
            <h1>Appointments</h1>
          </div>

          <ProfileButton />
        </header>

        {showForm && (
          <section className="form-section appointment-form">
            <h2>
              {editingId
                ? "Edit appointment"
                : "New appointment"}
            </h2>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="doctor">
                  Doctor name
                </label>

                <input
                  id="doctor"
                  type="text"
                  value={doctor}
                  onChange={(e) =>
                    setDoctor(e.target.value)
                  }
                  placeholder="e.g. Sharma"
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="hospital">
                  Hospital / Clinic
                </label>

                <input
                  id="hospital"
                  type="text"
                  value={hospital}
                  onChange={(e) =>
                    setHospital(e.target.value)
                  }
                  placeholder="Hospital or clinic name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="appointment-date">
                    Date
                  </label>

                  <input
                    id="appointment-date"
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="appointment-time">
                    Time
                  </label>

                  <input
                    id="appointment-time"
                    type="time"
                    value={time}
                    onChange={(e) =>
                      setTime(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="appointment-notes">
                  Notes
                </label>

                <textarea
                  id="appointment-notes"
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Optional notes"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingId
                    ? "Update Appointment"
                    : "Save Appointment"}
                </button>
              </div>
            </form>
          </section>
        )}

        {appointments.length === 0 ? (
          <section className="empty-card">
            <div className="empty-icon">📅</div>

            <h2>No appointments scheduled</h2>

            <p>
              Add your upcoming doctor or healthcare
              appointments here.
            </p>

            {!showForm && (
              <button
                className="primary-button"
                onClick={openAddForm}
              >
                Add Appointment
              </button>
            )}
          </section>
        ) : (
          <section className="appointment-table">
            {appointments.map((appointment) => (
              <article
                className="appointment-row"
                key={appointment.id}
              >
                <div className="appointment-row-main">
                  <div className="appointment-doctor">
                    <strong>
                      {formatDoctorName(
                        appointment.doctor
                      )}
                    </strong>
                  </div>

                  <div className="appointment-time">
                    <ClockIcon />

                    <div>
                      <strong>
                        {formatTime(
                          appointment.time
                        )}
                      </strong>

                      <span>
                        {formatDate(
                          appointment.date
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="appointment-edit-button"
                    onClick={() =>
                      editAppointment(
                        appointment
                      )
                    }
                    aria-label={`Edit ${formatDoctorName(
                      appointment.doctor
                    )}`}
                    title="Edit appointment"
                  >
                    <EditIcon />
                  </button>
                </div>

                <div className="appointment-row-secondary">
                  <div className="appointment-hospital">
                    {appointment.hospital ||
                      "Hospital / Clinic not added"}
                  </div>

                  <div className="appointment-note">
                    {appointment.notes || (
                      <span className="muted-text">
                        No note
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="appointment-delete-button"
                    onClick={() =>
                      deleteAppointment(
                        appointment.id
                      )
                    }
                    aria-label={`Delete ${formatDoctorName(
                      appointment.doctor
                    )}`}
                    title="Delete appointment"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        <button
          type="button"
          className="floating-add-button"
          onClick={() => {
            if (showForm) {
              closeForm();
            } else {
              openAddForm();
            }
          }}
          aria-label={
            showForm
              ? "Close appointment form"
              : "Add appointment"
          }
          title={
            showForm
              ? "Close"
              : "Add appointment"
          }
        >
          {showForm ? "×" : "+"}
        </button>
      </main>

      <BottomNav />
    </>
  );
}

export default Appointments;