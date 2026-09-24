const ignoreWords=[

"hospital",
"clinic",
"address",
"phone",
"mobile",
"patient",
"doctor",
"diagnosis",
"follow up"

];


export function analyzePrescription(text){


 const lines =
 text
 .split("\n")
 .map(x=>x.trim())
 .filter(Boolean);



 const usefulLines =
 lines.filter(line=>{


 const lower =
 line.toLowerCase();


 return !ignoreWords.some(
 word=>lower.includes(word)
 );


 });



 return usefulLines;


}