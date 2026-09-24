import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../components/BottomNav";
import ProfileButton from "../components/ProfileButton";

function Medicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] =
    useState([]);

  useEffect(() => {
    loadMedicines();
  }, []);

  function loadMedicines() {
    const saved = JSON.parse(
      localStorage.getItem(
        "medisync_medicines"
      ) || "[]"
    );

    setMedicines(saved);
  }

  function deleteMedicine(id) {
    const medicine = medicines.find(
      (item) => item.id === id
    );

    if (!medicine) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${medicine.name}?`
    );

    if (!confirmed) {
      return;
    }

    const updated = medicines.filter(
      (item) => item.id !== id
    );

    setMedicines(updated);

    localStorage.setItem(
      "medisync_medicines",
      JSON.stringify(updated)
    );
  }

  function editMedicine(id) {
    navigate(
      `/medicines/add?edit=${encodeURIComponent(id)}`
    );
  }

  function openScanner() {
    navigate("/prescription");
  }

  function openAddMedicine() {
    navigate("/medicines/add");
  }

  return (
    <>
      <main className="app-page">

        <header className="page-header">

          <div>
            <h1>
              Medicines
            </h1>
          </div>

          <ProfileButton />

        </header>

        {medicines.length === 0 ? (

          <section className="empty-card medicine-empty">

            <div className="empty-icon">
              💊
            </div>

            <h2>
              No medicines yet
            </h2>

            <p>
              Add your first medicine manually
              or scan a prescription.
            </p>

            <button
              className="primary-button"
              onClick={openAddMedicine}
            >
              Add Medicine
            </button>

            <button
              className="secondary-button"
              onClick={openScanner}
            >
              Scan Prescription
            </button>

          </section>

        ) : (

          <section className="medicine-list">

            {medicines.map(
              (medicine) => (

                <article
                  className="medicine-card"
                  key={medicine.id}
                >

                  <div className="medicine-card-top">

                    <div className="medicine-icon">
                      💊
                    </div>

                    <div className="medicine-main">

                      <h2>
                        {medicine.name}
                      </h2>

                      <p>
                        {medicine.dosage}
                      </p>

                    </div>

                  </div>

                  <div className="medicine-details">

                    <div>
                      <span>
                        Schedule
                      </span>

                      <strong>
                        {medicine.times?.join(
                          " • "
                        ) || "Not set"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Frequency
                      </span>

                      <strong>
                        {medicine.frequency ||
                          "Not set"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Meal
                      </span>

                      <strong>
                        {medicine.mealRelation ||
                          "Not set"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Duration
                      </span>

                      <strong>
                        {medicine.duration ||
                          "Not set"}
                      </strong>
                    </div>

                  </div>

                  <div className="medicine-actions">

                    <span
                      className={
                        medicine.reminderEnabled
                          ? "reminder-status enabled"
                          : "reminder-status"
                      }
                    >
                      {medicine.reminderEnabled
                        ? "Reminder enabled"
                        : "Reminder off"}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          editMedicine(
                            medicine.id
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          deleteMedicine(
                            medicine.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>

              )
            )}

          </section>

        )}

        <section className="prescription-card">

          <div>

            <p className="eyebrow">
              Prescription
            </p>

            <h2>
              Have a prescription?
            </h2>

            <p>
              Scan or upload it and review
              extracted medicine information.
            </p>

          </div>

          <button
            className="secondary-button"
            onClick={openScanner}
          >
            Scan Prescription
          </button>

        </section>

        <button
          type="button"
          className="floating-add-button"
          onClick={openAddMedicine}
          aria-label="Add medicine"
          title="Add medicine"
        >
          +
        </button>

      </main>

      <BottomNav />
    </>
  );
}

export default Medicines;