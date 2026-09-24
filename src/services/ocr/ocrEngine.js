import { createWorker } from "tesseract.js";

import {
  buildLinesFromTesseractData,
  cleanRawText,
  computeOverallConfidence
} from "./helpers";



async function performOCR(image, mode){


  const worker = await createWorker("eng", 1, { logger: m => console.log(m) });


  await worker.setParameters({

    tessedit_pageseg_mode: mode,

    preserve_interword_spaces:"1"

  });



  const result =
    await worker.recognize(image);



  await worker.terminate();



  return result.data;

}




export async function runOCR(image){


  const results = [];



  try {


    // Different OCR layouts

    const modes = [
      "6",
      "11",
      "12"
    ];



    for(const mode of modes){


      const data =
        await performOCR(
          image,
          mode
        );



      results.push(data);


    }





    // choose best confidence

    const bestResult =

      results.sort(

        (a,b)=>

        b.confidence -
        a.confidence

      )[0];






    const rawText =
      bestResult.text || "";




    const cleanedText =
      cleanRawText(rawText);





    const lines =
      buildLinesFromTesseractData(
        bestResult
      );





    const confidence =
      computeOverallConfidence(

        lines,

        bestResult.confidence

      );







    return {


      rawText,


      cleanedText,


      confidence,


      lines,


      source:"tesseract-multipass"


    };




  }

  catch(error){


    console.error(
      "OCR failed",
      error
    );



    throw error;


  }



}