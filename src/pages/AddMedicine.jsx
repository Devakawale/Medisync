import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import BottomNav from "../components/BottomNav";
import ProfileButton from "../components/ProfileButton";
import { scheduleMedicineReminders } from "../services/remindersService";

function AddMedicine() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [times, setTimes] = useState(["08:00"]);
  const [mealRelation, setMealRelation] =
    useState("After meal");
  const [duration, setDuration] = useState("");
  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const saved = JSON.parse(
      localStorage.getItem("medisync_medicines") || "[]"
    );

    const medicine = saved.find(
      (item) => item.id === editId
    );

    if (!medicine) {
      setError("Medicine could not be found.");
      return;
    }

    setName(medicine.name || "");
    setDosage(medicine.dosage || "");
    setFrequency(
      medicine.frequency || "Once daily"
    );

    setTimes(
      Array.isArray(medicine.times) &&
        medicine.times.length > 0
        ? medicine.times
        : ["08:00"]
    );

    setMealRelation(
      medicine.mealRelation || "After meal"
    );

    setDuration(medicine.duration || "");

    setReminderEnabled(
      medicine.reminderEnabled ?? true
    );
  }, [editId, isEditing]);

  function addTime() {
    setTimes((current) => [
      ...current,
      "12:00",
    ]);
  }

  function removeTime(index) {
    if (times.length === 1) {
      return;
    }

    setTimes((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  }

  function updateTime(index, value) {
    setTimes((current) =>
      current.map((time, i) =>
        i === index ? value : time
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(
        "Please enter medicine name."
      );
      return;
    }

    if (!dosage.trim()) {
      setError("Please enter dosage.");
      return;
    }

    if (times.some((time) => !time)) {
      setError(
        "Please select a time for every schedule."
      );
      return;
    }

    const existing = JSON.parse(
      localStorage.getItem(
        "medisync_medicines"
      ) || "[]"
    );

    if (isEditing) {
      const medicineExists = existing.some(
        (item) => item.id === editId
      );

      if (!medicineExists) {
        setError(
          "Medicine could not be found."
        );
        return;
      }

      const updated = existing.map(
        (medicine) => {
          if (medicine.id !== editId) {
            return medicine;
          }

          return {
            ...medicine,

            name: name.trim(),
            dosage: dosage.trim(),
            frequency,
            times,
            mealRelation,
            duration: duration.trim(),
            reminderEnabled,

            updatedAt:
              new Date().toISOString(),
          };
        }
      );

      localStorage.setItem(
        "medisync_medicines",
        JSON.stringify(updated)
      );

      /*
       * Rebuild native Android medicine
       * notifications immediately after editing.
       */
      await scheduleMedicineReminders();

      navigate("/medicines");
      return;
    }

    const medicine = {
      id: crypto.randomUUID(),

      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times,
      mealRelation,
      duration: duration.trim(),
      reminderEnabled,

      createdAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      "medisync_medicines",
      JSON.stringify([
        ...existing,
        medicine,
      ])
    );

    /*
     * Schedule native Android reminders
     * immediately after adding the medicine.
     */
    await scheduleMedicineReminders();

    navigate("/medicines");
  }

  return (
    <>
      <main className="app-page">

        <header className="page-header">
          <div>
            <p className="eyebrow">
              Medication management
            </p>

            <h1>
              {isEditing
                ? "Edit Medicine"
                : "Add Medicine"}
            </h1>
          </div>

          <ProfileButton />
        </header>

        <form onSubmit={handleSubmit}>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <section className="form-section">

            <h2>
              Medicine details
            </h2>

            <div className="form-group">

              <label htmlFor="medicine-name">
                Medicine name
              </label>

              <input
                id="medicine-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Paracetamol"
              />

            </div>

            <div className="form-group">

              <label htmlFor="dosage">
                Dosage
              </label>

              <input
                id="dosage"
                type="text"
                value={dosage}
                onChange={(e) =>
                  setDosage(e.target.value)
                }
                placeholder="e.g. 500 mg"
              />

            </div>

          </section>

          <section className="form-section">

            <h2>
              Schedule
            </h2>

            <div className="form-group">

              <label htmlFor="frequency">
                Frequency
              </label>

              <select
                id="frequency"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value)
                }
              >
                <option>
                  Once daily
                </option>

                <option>
                  Twice daily
                </option>

                <option>
                  Three times daily
                </option>

                <option>
                  Four times daily
                </option>

                <option>
                  As needed
                </option>

                <option>
                  Weekly
                </option>
              </select>

            </div>

            <div className="form-group">

              <label>
                Medication times
              </label>

              <div className="time-list">

                {times.map(
                  (time, index) => (
                    <div
                      className="time-row"
                      key={index}
                    >

                      <input
                        type="time"
                        value={time}
                        onChange={(e) =>
                          updateTime(
                            index,
                            e.target.value
                          )
                        }
                      />

                      {times.length > 1 && (
                        <button
                          type="button"
                          className="remove-time-btn"
                          onClick={() =>
                            removeTime(index)
                          }
                          aria-label="Remove time"
                        >
                          ×
                        </button>
                      )}

                    </div>
                  )
                )}

              </div>

              <button
                type="button"
                className="add-time-btn"
                onClick={addTime}
              >
                + Add another time
              </button>

            </div>

            <div className="form-group">

              <label htmlFor="meal">
                Meal relation
              </label>

              <select
                id="meal"
                value={mealRelation}
                onChange={(e) =>
                  setMealRelation(
                    e.target.value
                  )
                }
              >
                <option>
                  Before meal
                </option>

                <option>
                  With meal
                </option>

                <option>
                  After meal
                </option>

                <option>
                  Anytime
                </option>
              </select>

            </div>

            <div className="form-group">

              <label htmlFor="duration">
                Duration
              </label>

              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) =>
                  setDuration(
                    e.target.value
                  )
                }
                placeholder="e.g. 5 days"
              />

            </div>

          </section>

          <section className="form-section">

            <div className="toggle-row">

              <div className="toggle-content">

                <h3>
                  Medicine reminder
                </h3>

                <p>
                  Enable reminders for scheduled
                  medicine times.
                </p>

              </div>

              <label className="toggle">

                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) =>
                    setReminderEnabled(
                      e.target.checked
                    )
                  }
                />

                <span className="toggle-slider"></span>

              </label>

            </div>

          </section>

          <div className="form-actions">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate("/medicines")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing
                ? "Save Changes"
                : "Save Medicine"}
            </button>

          </div>

        </form>

      </main>

      <BottomNav />
    </>
  );
}

export default AddMedicine;