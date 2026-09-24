function cleanLine(line) {
  return line
    .replace(/[|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


function isMedicineLine(line) {

  const upper = line.toUpperCase();


  const medicineKeywords = [
    "TAB",
    "TABLET",
    "CAP",
    "CAPSULE",
    "SYP",
    "SYRUP",
    "INJ",
    "INJECTION",
    "DROP",
    "MG",
    "MCG",
    "ML"
  ];


  return medicineKeywords.some(
    keyword => upper.includes(keyword)
  );
}



function extractDosage(text){

  const match = text.match(
    /\b\d+\s?(mg|ml|mcg|gm)\b/i
  );


  return match
    ? match[0]
    : "As prescribed";
}



function detectFrequency(text){

  const upper=text.toUpperCase();


  if(
    upper.includes("1-1-1") ||
    upper.includes("TDS") ||
    upper.includes("THREE")
  ){
    return "Three times daily";
  }


  if(
    upper.includes("1-0-1") ||
    upper.includes("BD") ||
    upper.includes("TWICE")
  ){
    return "Twice daily";
  }


  if(
    upper.includes("1 OD") ||
    upper.includes("OD") ||
    upper.includes("ONCE")
  ){
    return "Once daily";
  }


  if(
    upper.includes("SOS")
  ){
    return "SOS";
  }


  return "As prescribed";
}



function detectDuration(text){

  const match=text.match(
    /\d+\s?(day|days|week|weeks)/i
  );


  return match
    ? match[0]
    : "";
}



export function parseMedicines(ocrText){


  const lines =
    ocrText
      .split("\n")
      .map(cleanLine)
      .filter(
        line => line.length > 2
      );



  const medicines=[];



  for(let i=0;i<lines.length;i++){


    if(isMedicineLine(lines[i])){


      const medicineBlock =
      [
        lines[i],
        lines[i+1] || "",
        lines[i+2] || ""
      ]
      .join(" ");



      medicines.push({

        id:crypto.randomUUID(),

        name:lines[i],

        dosage:
          extractDosage(
            medicineBlock
          ),

        times:[
          "09:00"
        ],

        frequency:
          detectFrequency(
            medicineBlock
          ),

        mealRelation:
          medicineBlock
          .toUpperCase()
          .includes("BEFORE")
          ?
          "Before meal"
          :
          "After meal",


        duration:
          detectDuration(
            medicineBlock
          ),


        reminderEnabled:true

      });

    }

  }



  return medicines;

}