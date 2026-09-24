import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../components/BottomNav";
import ProfileButton from "../components/ProfileButton";

import { preprocessImage } from "../services/ocr/imageProcessor";
import { runOCR } from "../services/ocr/ocrEngine";
import { extractMatchedMedicines } from "../utils/medicineMatcher";

function PrescriptionScan() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImage(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleScan() {
    if (!image) {
      setError("Please upload prescription image");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // --------------------------------------------
      // STEP 1 — PREPROCESS IMAGE
      // --------------------------------------------

      const processedImage =
        await preprocessImage(image);

      // --------------------------------------------
      // STEP 2 — RUN OCR
      // --------------------------------------------

      const ocrResult =
        await runOCR(processedImage);

      console.log(
        "OCR RESULT:",
        ocrResult
      );

      // --------------------------------------------
      // STEP 3 — PREPARE OCR LINES
      // --------------------------------------------

      const ocrLines =
        (ocrResult.lines || [])
          .map((line) => {
            if (typeof line === "string") {
              return line;
            }

            return (
              line?.text ||
              line?.lineText ||
              line?.content ||
              ""
            );
          })
          .map((line) => line.trim())
          .filter(Boolean);

      /*
        Fallback:
        Agar OCR engine ne lines nahi di,
        to cleaned OCR text ko lines mein divide karenge.
      */

      const fallbackLines =
        ocrLines.length > 0
          ? ocrLines
          : (
              ocrResult.cleanedText ||
              ocrResult.rawText ||
              ""
            )
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);

      console.log(
        "OCR LINES:",
        fallbackLines
      );

      // --------------------------------------------
      // STEP 4 — DATABASE-BASED MEDICINE MATCHING
      // --------------------------------------------

      const detectedMedicines =
        extractMatchedMedicines(
          fallbackLines
        );

      console.log(
        "DATABASE MATCHED MEDICINES:",
        detectedMedicines
      );

      // --------------------------------------------
      // STEP 5 — SAVE COMPLETE OCR RESULT
      // --------------------------------------------

      localStorage.setItem(
        "medisync_ocr_result",
        JSON.stringify(ocrResult)
      );

      // --------------------------------------------
      // STEP 6 — SAVE RAW/CLEAN OCR TEXT
      // --------------------------------------------

      localStorage.setItem(
        "medisync_ocr_text",
        ocrResult.cleanedText ||
          ocrResult.rawText ||
          ""
      );

      // --------------------------------------------
      // STEP 7 — SAVE DATABASE MATCHES
      // --------------------------------------------

      localStorage.setItem(
        "medisync_detected_medicines",
        JSON.stringify(
          detectedMedicines
        )
      );

      // --------------------------------------------
      // STEP 8 — OPEN REVIEW SCREEN
      // --------------------------------------------

      navigate(
        "/prescription/review"
      );
    } catch (err) {
      console.error(
        "Prescription scan failed:",
        err
      );

      setError(
        "Unable to read prescription. Please try a clearer image."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="app-page">
        <header className="page-header">
          <div>
            <h1>
              Scan Prescription
            </h1>
          </div>

          <ProfileButton />
        </header>

        <section className="empty-card">
          <div className="empty-icon">
            📷
          </div>

          <h2>
            Upload prescription
          </h2>

          <p>
            Upload a clear prescription image
            to detect medicines.
          </p>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
          />

          {preview && (
            <img
              src={preview}
              alt="Prescription preview"
              style={{
                width: "100%",
                marginTop: "20px",
                borderRadius: "16px",
              }}
            />
          )}

          {image && (
            <p>
              Selected: {image.name}
            </p>
          )}

          {error && (
            <p className="alert alert-danger">
              {error}
            </p>
          )}

          <button
            className="primary-button"
            onClick={handleScan}
            disabled={loading}
          >
            {loading
              ? "Reading prescription..."
              : "Scan Prescription"}
          </button>
        </section>
      </main>

      <BottomNav />
    </>
  );
}

export default PrescriptionScan;