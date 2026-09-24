import medicineDatabase from "../data/medicineDatabase";

/**
 * MediSync Medicine Matcher
 *
 * Purpose:
 * OCR se aayi prescription lines ko medicine database
 * ke against match karna.
 *
 * IMPORTANT:
 * Match hone ka matlab automatically clinically confirmed
 * medicine nahi hai. OCRReview mein user verification required hai.
 */

// ---------------------------------------------------------
// Basic text normalization
// ---------------------------------------------------------

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[|]/g, "i")
    .replace(/[{}[\]()]/g, " ")
    .replace(/[,:;]+/g, " ")
    .replace(/[_+=]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------
// Remove dosage/strength information for name comparison
// Example:
// "Azee 1000 mg" -> "azee"
// ---------------------------------------------------------

function removeStrength(text = "") {
  return normalizeText(text)
    .replace(
      /\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|gm|ml|iu|%|units?)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------
// Convert database cell into array
// Handles comma / semicolon / slash separated values.
// ---------------------------------------------------------

function toArray(value = "") {
  if (!value) return [];

  return String(value)
    .split(/[,;|/]+/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

// ---------------------------------------------------------
// Generate searchable values from one medicine record
// ---------------------------------------------------------

function getSearchValues(medicine) {
  const values = [];

  const fields = [
    "brand_name",
    "generic_name",
    "generic_name_2",
    "generic_name_3",
    "brand_aliases",
    "generic_abbreviations",
    "common_abbreviations",
    "doctor_short_forms",
    "prescription_forms",
    "spoken_short_forms",
    "ocr_variants",
    "ocr_misspellings",
    "spacing_variants",
    "punctuation_variants",
    "starting_letter_forms",
    "partial_name_forms",
  ];

  fields.forEach((field) => {
    const value = medicine[field];

    if (!value) return;

    toArray(value).forEach((item) => {
      if (item && !values.includes(item)) {
        values.push(item);
      }
    });
  });

  return values;
}

// ---------------------------------------------------------
// Character similarity
// ---------------------------------------------------------

function levenshteinDistance(a, b) {
  const first = String(a);
  const second = String(b);

  if (first === second) return 0;

  if (!first.length) return second.length;
  if (!second.length) return first.length;

  const previous = Array(second.length + 1);

  for (let j = 0; j <= second.length; j++) {
    previous[j] = j;
  }

  for (let i = 1; i <= first.length; i++) {
    const current = [i];

    for (let j = 1; j <= second.length; j++) {
      const insertCost = current[j - 1] + 1;
      const deleteCost = previous[j] + 1;
      const replaceCost =
        previous[j - 1] + (first[i - 1] === second[j - 1] ? 0 : 1);

      current[j] = Math.min(
        insertCost,
        deleteCost,
        replaceCost
      );
    }

    for (let j = 0; j <= second.length; j++) {
      previous[j] = current[j];
    }
  }

  return previous[second.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;

  if (a === b) return 1;

  if (a.includes(b) || b.includes(a)) {
    const shorter = Math.min(a.length, b.length);
    const longer = Math.max(a.length, b.length);

    if (longer > 0 && shorter / longer >= 0.55) {
      return 0.9;
    }
  }

  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  if (!maxLength) return 0;

  return 1 - distance / maxLength;
}

// ---------------------------------------------------------
// Strength extraction
// ---------------------------------------------------------

function extractStrength(text = "") {
  const match = String(text).match(
    /\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml|iu|%)\b/i
  );

  if (!match) return "";

  return `${match[1]} ${match[2]}`;
}

// ---------------------------------------------------------
// Dosage form extraction
// ---------------------------------------------------------

function extractDosageForm(text = "") {
  const lower = normalizeText(text);

  const forms = [
    ["tablet", ["tablet", "tab"]],
    ["capsule", ["capsule", "cap"]],
    ["syrup", ["syrup", "syp"]],
    ["injection", ["injection", "inj"]],
    ["drops", ["drops", "drop"]],
    ["cream", ["cream"]],
    ["ointment", ["ointment", "oint"]],
    ["gel", ["gel"]],
    ["suspension", ["suspension", "susp"]],
    ["solution", ["solution"]],
    ["powder", ["powder"]],
    ["inhaler", ["inhaler"]],
  ];

  for (const [form, aliases] of forms) {
    if (aliases.some((alias) => lower.includes(alias))) {
      return form;
    }
  }

  return "";
}

// ---------------------------------------------------------
// Score one database medicine against one OCR line
// ---------------------------------------------------------

function scoreMedicine(line, medicine) {
  const normalizedLine = normalizeText(line);
  const nameOnlyLine = removeStrength(line);

  if (!normalizedLine) return 0;

  const searchValues = getSearchValues(medicine);

  if (!searchValues.length) return 0;

  let bestScore = 0;

  for (const value of searchValues) {
    if (!value) continue;

    const normalizedValue = normalizeText(value);
    const valueWithoutStrength = removeStrength(value);

    // Exact full match
    if (normalizedLine === normalizedValue) {
      bestScore = Math.max(bestScore, 1);
      continue;
    }

    // Exact name after removing strength
    if (
      nameOnlyLine &&
      valueWithoutStrength &&
      nameOnlyLine === valueWithoutStrength
    ) {
      bestScore = Math.max(bestScore, 0.97);
      continue;
    }

    // OCR line contains known medicine name
    if (
      normalizedLine.includes(normalizedValue) &&
      normalizedValue.length >= 4
    ) {
      bestScore = Math.max(bestScore, 0.94);
      continue;
    }

    // Known name contains OCR text
    if (
      normalizedValue.includes(nameOnlyLine) &&
      nameOnlyLine.length >= 4
    ) {
      bestScore = Math.max(bestScore, 0.86);
      continue;
    }

    // Fuzzy comparison
    const score = similarity(
      nameOnlyLine,
      valueWithoutStrength || normalizedValue
    );

    bestScore = Math.max(bestScore, score);
  }

  return bestScore;
}

// ---------------------------------------------------------
// Human-readable confidence
// ---------------------------------------------------------

function getConfidence(score) {
  if (score >= 0.95) return "High";
  if (score >= 0.85) return "Medium";
  if (score >= 0.75) return "Needs verification";

  return "Low";
}

// ---------------------------------------------------------
// Main matcher
// ---------------------------------------------------------

export function matchMedicineLine(line) {
  const cleanLine = String(line || "").trim();

  if (!cleanLine) {
    return null;
  }

  const candidates = medicineDatabase
    .map((medicine) => {
      const score = scoreMedicine(cleanLine, medicine);

      return {
        medicine,
        score,
      };
    })
    .filter((candidate) => candidate.score >= 0.75)
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) {
    return null;
  }

  const best = candidates[0];
  const medicine = best.medicine;

  const extractedStrength =
    extractStrength(cleanLine) ||
    medicine.default_strength ||
    medicine.strength ||
    "";

  const extractedForm =
    extractDosageForm(cleanLine) ||
    medicine.default_form ||
    medicine.dosage_form ||
    "";

  return {
    medicineId: medicine.medicine_id || "",
    brandName: medicine.brand_name || "",
    genericName: medicine.generic_name || "",
    strength: extractedStrength,
    dosageForm: extractedForm,
    manufacturer: medicine.manufacturer || "",

    sourceText: cleanLine,

    confidence: getConfidence(best.score),
    confidenceScore: Math.round(best.score * 100),

    alternatives: candidates.slice(1, 4).map((candidate) => ({
      medicineId: candidate.medicine.medicine_id || "",
      brandName: candidate.medicine.brand_name || "",
      genericName: candidate.medicine.generic_name || "",
      score: Math.round(candidate.score * 100),
    })),
  };
}

// ---------------------------------------------------------
// Match multiple OCR lines
// ---------------------------------------------------------

export function matchMedicineLines(lines = []) {
  const results = [];

  for (const line of lines) {
    const match = matchMedicineLine(line);

    if (!match) continue;

    results.push(match);
  }

  return results;
}

// ---------------------------------------------------------
// Filter obvious prescription metadata/noise
// ---------------------------------------------------------

export function isLikelyPrescriptionNoise(line = "") {
  const text = normalizeText(line);

  if (!text) return true;

  const noisePatterns = [
    /^patient\b/,
    /^doctor\b/,
    /^dr\b/,
    /^address\b/,
    /^phone\b/,
    /^mobile\b/,
    /^date\b/,
    /^age\b/,
    /^gender\b/,
    /^diagnosis\b/,
    /^hospital\b/,
    /^clinic\b/,
    /^follow\s*up\b/,
    /^advice\b/,
    /^signature\b/,
    /^rx\b$/,
  ];

  return noisePatterns.some((pattern) =>
    pattern.test(text)
  );
}

// ---------------------------------------------------------
// Final OCR → medicine pipeline
// ---------------------------------------------------------

export function extractMatchedMedicines(lines = []) {
  const cleanedLines = lines
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .filter((line) => !isLikelyPrescriptionNoise(line));

  const matches = matchMedicineLines(cleanedLines);

  // Remove duplicate medicines detected on multiple OCR passes
  const unique = [];

  const seen = new Set();

  for (const match of matches) {
    const key =
      match.medicineId ||
      `${match.brandName}|${match.genericName}|${match.strength}`
        .toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(match);
  }

  return unique;
}