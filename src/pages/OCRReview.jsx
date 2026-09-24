import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../components/BottomNav";
import ProfileButton from "../components/ProfileButton";

function OCRReview() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    const detected = JSON.parse(
      localStorage.getItem(
        "medisync_detected_medicines"
      ) || "[]"
    );

    const text =
      localStorage.getItem(
        "medisync_ocr_text"
      ) || "";

    const formattedMedicines = Array.isArray(
      detected
    )
      ? detected.map((medicine, index) => ({
          id:
            medicine.id ||
            medicine.medicineId ||
            `ocr-${Date.now()}-${index}`,

          name:
            medicine.name ||
            medicine.brandName ||
            medicine.genericName ||
            "",

          genericName:
            medicine.genericName ||
            "",

          dosage:
            medicine.dosage ||
            medicine.strength ||
            "",

          dosageForm:
            medicine.dosageForm ||
            "",

          manufacturer:
            medicine.manufacturer ||
            "",

          frequency:
            medicine.frequency ||
            "",

          mealRelation:
            medicine.mealRelation ||
            "",

          duration:
            medicine.duration ||
            "",

          confidence:
            medicine.confidence ||
            "Needs verification",

          confidenceScore:
            medicine.confidenceScore ||
            0,

          sourceText:
            medicine.sourceText ||
            "",

          medicineId:
            medicine.medicineId ||
            "",
        }))
      : [];

    setMedicines(formattedMedicines);
    setRawText(text);
  }, []);

  function updateMedicine(
    id,
    field,
    value
  ) {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id
          ? {
              ...medicine,
              [field]: value,
            }
          : medicine
      )
    );
  }

  function deleteMedicine(id) {
    setMedicines((current) =>
      current.filter(
        (medicine) =>
          medicine.id !== id
      )
    );
  }

  function getConfidenceClass(
    confidence
  ) {
    const value =
      String(confidence || "")
        .toLowerCase();

    if (value === "high") {
      return "ocr-confidence high";
    }

    if (value === "medium") {
      return "ocr-confidence medium";
    }

    return "ocr-confidence low";
  }

  function saveMedicines() {
    if (medicines.length === 0) {
      return;
    }

    /*
      IMPORTANT:
      OCR medicines are NOT saved automatically.
      This function runs only after the user
      explicitly presses Confirm & Save.
    */

    const old = JSON.parse(
      localStorage.getItem(
        "medisync_medicines"
      ) || "[]"
    );

    const verifiedMedicines =
      medicines
        .filter(
          (medicine) =>
            medicine.name?.trim()
        )
        .map((medicine) => ({
          ...medicine,

          name:
            medicine.name.trim(),

          reminderEnabled:
            medicine.reminderEnabled ??
            true,

          source:
            "prescription-ocr",

          verified:
            true,

          verifiedAt:
            new Date().toISOString(),
        }));

    localStorage.setItem(
      "medisync_medicines",
      JSON.stringify([
        ...old,
        ...verifiedMedicines,
      ])
    );

    /*
      Clear temporary OCR data
      only after successful confirmation.
    */

    localStorage.removeItem(
      "medisync_detected_medicines"
    );

    localStorage.removeItem(
      "medisync_ocr_result"
    );

    localStorage.removeItem(
      "medisync_ocr_text"
    );

    navigate("/medicines");
  }

  return (
    <>
      <main className="app-page">

        {/* -------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------- */}

        <header className="page-header">
          <div>
            <h1>
              Confirm Medicines
            </h1>

            <p className="page-subtitle">
              Review the medicines detected
              from your prescription before saving.
            </p>
          </div>

          <ProfileButton />
        </header>

        {/* -------------------------------------- */}
        {/* DETECTED MEDICINES */}
        {/* -------------------------------------- */}

        <section className="form-section">

          <h2>
            Detected Medicines
          </h2>

          <p>
            Please verify every medicine,
            dose, frequency, meal timing and
            duration before confirming.
          </p>

          {medicines.length === 0 ? (
            <div className="empty-card">

              <h3>
                No medicines found
              </h3>

              <p>
                The prescription could not be
                confidently matched with the
                medicine database.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    "/prescription"
                  )
                }
              >
                Scan Again
              </button>

            </div>
          ) : (
            <div className="medicine-table-wrapper">

              <table className="medicine-table">

                <thead>
                  <tr>

                    <th>
                      Medicine
                    </th>

                    <th>
                      Generic
                    </th>

                    <th>
                      Dose
                    </th>

                    <th>
                      Form
                    </th>

                    <th>
                      Frequency
                    </th>

                    <th>
                      Meal
                    </th>

                    <th>
                      Duration
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {medicines.map(
                    (medicine) => (
                      <tr
                        key={
                          medicine.id
                        }
                      >

                        {/* MEDICINE */}

                        <td>

                          <input
                            value={
                              medicine.name ||
                              ""
                            }
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Medicine name"
                          />

                          {medicine.sourceText && (
                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "5px",
                                opacity:
                                  0.65,
                              }}
                            >
                              OCR:{" "}
                              {
                                medicine.sourceText
                              }
                            </small>
                          )}

                        </td>

                        {/* GENERIC */}

                        <td>

                          <input
                            value={
                              medicine.genericName ||
                              ""
                            }
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "genericName",
                                e.target.value
                              )
                            }
                            placeholder="Generic name"
                          />

                        </td>

                        {/* DOSE */}

                        <td>

                          <input
                            value={
                              medicine.dosage ||
                              ""
                            }
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "dosage",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 500 mg"
                          />

                        </td>

                        {/* FORM */}

                        <td>

                          <input
                            value={
                              medicine.dosageForm ||
                              ""
                            }
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "dosageForm",
                                e.target.value
                              )
                            }
                            placeholder="Tablet"
                          />

                        </td>

                        {/* FREQUENCY */}

                        <td>

                          <input
                            value={
                              medicine.frequency ||
                              ""
                            }
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "frequency",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Once daily"
                          />

                        </td>

                        {/* MEAL */}

                        <td>

                          <select
                            value={
                              medicine.mealRelation ||
                              ""
                            }
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "mealRelation",
                                e.target.value
                              )
                            }
                          >

                            <option value="">
                              Select
                            </option>

                            <option value="After meal">
                              After meal
                            </option>

                            <option value="Before meal">
                              Before meal
                            </option>

                            <option value="With meal">
                              With meal
                            </option>

                            <option value="Empty stomach">
                              Empty stomach
                            </option>

                            <option value="Verify">
                              Verify
                            </option>

                          </select>

                        </td>

                        {/* DURATION */}

                        <td>

                          <input
                            value={
                              medicine.duration ||
                              ""
                            }
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 5 days"
                          />

                        </td>

                        {/* CONFIDENCE */}

                        <td>

                          <span
                            className={getConfidenceClass(
                              medicine.confidence
                            )}
                          >
                            {
                              medicine.confidence ||
                              "Needs verification"
                            }
                          </span>

                          {medicine.confidenceScore >
                            0 && (
                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "5px",
                                opacity:
                                  0.65,
                              }}
                            >
                              Match:{" "}
                              {
                                medicine.confidenceScore
                              }%
                            </small>
                          )}

                        </td>

                        {/* REMOVE */}

                        <td>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              deleteMedicine(
                                medicine.id
                              )
                            }
                          >
                            Remove
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* -------------------------------------- */}
        {/* OCR TEXT */}
        {/* -------------------------------------- */}

        <section className="form-section">

          <details>

            <summary>
              View OCR Text
            </summary>

            <textarea
              value={rawText}
              readOnly
            />

          </details>

        </section>

        {/* -------------------------------------- */}
        {/* CONFIRM */}
        {/* -------------------------------------- */}

        {medicines.length > 0 && (
          <section className="form-section">

            <div
              className="empty-card"
              style={{
                marginTop: "10px",
              }}
            >

              <h3>
                Ready to save?
              </h3>

              <p>
                Make sure every detected
                medicine is correct before
                confirming.
              </p>

              <button
                className="primary-button"
                onClick={saveMedicines}
              >
                Confirm & Save Medicines
              </button>

            </div>

          </section>
        )}

      </main>

      <BottomNav />
    </>
  );
}

export default OCRReview;