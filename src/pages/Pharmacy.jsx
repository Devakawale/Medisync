import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import ProfileButton from "../components/ProfileButton";

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [requests, setRequests] = useState([]);

  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedMedicines = JSON.parse(
      localStorage.getItem("medisync_medicines") || "[]"
    );

    const savedRequests = JSON.parse(
      localStorage.getItem("medisync_refill_requests") || "[]"
    );

    setMedicines(savedMedicines);
    setRequests(savedRequests);
  }, []);

  function requestRefill() {
    if (!selectedMedicine) {
      setMessage("Please select a medicine first.");
      return;
    }

    const medicine = medicines.find(
      (item) => item.id === selectedMedicine
    );

    if (!medicine) return;

    const request = {
      id: crypto.randomUUID(),
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      status: "Requested",
      createdAt: new Date().toISOString(),
    };

    const updated = [request, ...requests];

    setRequests(updated);

    localStorage.setItem(
      "medisync_refill_requests",
      JSON.stringify(updated)
    );

    setSelectedMedicine("");
    setMessage(
      `Refill request created for ${medicine.name}.`
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function findPharmacy() {
    window.open(
      "https://www.google.com/maps/search/pharmacy+near+me",
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <main className="app-page">
        <header className="page-header">
          <div>
            <h1>Pharmacy</h1>
          </div>

          <ProfileButton />
        </header>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        <section className="pharmacy-card">
          <div className="pharmacy-icon">⌕</div>

          <div>
            <p className="eyebrow">
              Nearby pharmacies
            </p>

            <h2>Find a pharmacy</h2>

            <p>
              Search for pharmacies near your current
              location.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={findPharmacy}
          >
            Find Pharmacy
          </button>
        </section>

        <section className="pharmacy-card">
          <p className="eyebrow">Refill</p>

          <h2>Request a medicine refill</h2>

          {medicines.length === 0 ? (
            <>
              <p>
                Add a medicine first before creating a
                refill request.
              </p>

              <button
                className="secondary-button"
                onClick={() =>
                  (window.location.href =
                    "/medicines/add")
                }
              >
                Add Medicine
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="refill-medicine">
                  Select medicine
                </label>

                <select
                  id="refill-medicine"
                  value={selectedMedicine}
                  onChange={(event) =>
                    setSelectedMedicine(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select a medicine
                  </option>

                  {medicines.map((medicine) => (
                    <option
                      key={medicine.id}
                      value={medicine.id}
                    >
                      {medicine.name} —{" "}
                      {medicine.dosage}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="primary-button"
                onClick={requestRefill}
              >
                Request Refill
              </button>
            </>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Refill requests</h2>

            <span>{requests.length}</span>
          </div>

          {requests.length === 0 ? (
            <div className="empty-card compact">
              <h3>No refill requests</h3>

              <p>
                Your refill requests will appear here.
              </p>
            </div>
          ) : (
            <div className="refill-list">
              {requests.map((request) => (
                <article
                  className="refill-card"
                  key={request.id}
                >
                  <div>
                    <strong>
                      {request.medicineName}
                    </strong>

                    <p>{request.dosage}</p>
                  </div>

                  <span className="badge badge-success">
                    {request.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </>
  );
}

export default Pharmacy;