/*
 helpers.js

 Generic OCR utilities.

 Important:
 - Does not guess medicine names
 - Does not auto-correct medical words
 - Only cleans formatting/noise
 - Keeps confidence information
*/


export function buildLinesFromTesseractData(data) {


  if(!data){
    return [];
  }



  let rawLines = [];



  // Tesseract structured lines

  if(data.lines){

    rawLines = data.lines;

  }


  else if(data.blocks){


    rawLines =
      data.blocks.flatMap(block =>

        block.paragraphs

        ?

        block.paragraphs.flatMap(
          paragraph =>
          paragraph.lines || []
        )

        :

        []

      );

  }





  if(rawLines.length){


    return rawLines

    .map(line => ({


      text:
      normalizeSpacing(
        line.text || ""
      ),


      confidence:
      roundConfidence(
        line.confidence
      )


    }))


    .filter(
      line =>
      line.text.length > 0
    );


  }






  // fallback

  return (data.text || "")

  .split("\n")

  .map(text => ({


    text:
    normalizeSpacing(text),


    confidence:
    roundConfidence(
      data.confidence
    )


  }))


  .filter(
    line =>
    line.text.length > 0
  );


}








export function normalizeSpacing(text){


  return text

  .replace(/[ \t]+/g," ")

  .replace(/\s+$/g,"")

  .trim();


}








export function cleanRawText(rawText){


  if(!rawText){

    return "";

  }





  return rawText

  .split("\n")


  .map(line =>

    normalizeSpacing(line)

  )


  .map(line =>

    removeIsolatedNoiseSymbols(line)

  )


  .filter(
    line =>
    line.length > 0
  )


  .join("\n");


}








export function removeIsolatedNoiseSymbols(line){


  return line

  .split(" ")

  .filter(token =>

    !/^[|_~`^*"'.]{1,3}$/.test(token)

  )


  .join(" ")

  .trim();


}








export function roundConfidence(confidence){


  if(
    typeof confidence !== "number"
    ||
    Number.isNaN(confidence)
  ){

    return 0;

  }





  return Math.round(

    Math.min(

      100,

      Math.max(
        0,
        confidence
      )

    )

  );


}








export function computeOverallConfidence(
  lines,
  fallbackConfidence
){


  if(
    lines &&
    lines.length > 0
  ){


    const total =

    lines.reduce(

      (sum,line)=>

      sum + line.confidence,

      0

    );



    return roundConfidence(

      total / lines.length

    );


  }




  return roundConfidence(
    fallbackConfidence
  );


}








export function isLowConfidence(
  line,
  threshold = 60
){


  return (

    !line

    ||

    typeof line.confidence !== "number"

    ||

    line.confidence < threshold

  );


}








export function tokenizeLine(text){


  if(!text){

    return [];

  }



  return text

  .split(" ")

  .filter(
    token =>
    token.length > 0
  );


}