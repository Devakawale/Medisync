import { createWorker } from "tesseract.js";


export async function scanPrescription(image) {

  const worker = await createWorker("eng");


  await worker.setParameters({
    tessedit_pageseg_mode: "6",
    preserve_interword_spaces: "1",
  });


  const result = await worker.recognize(image);


  await worker.terminate();


  return result.data.text;
}