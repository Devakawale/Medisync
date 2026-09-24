import {
  cleanRawText
} from "./helpers";



export async function preprocessImage(file) {

  return new Promise((resolve,reject)=>{


    const img = new Image();


    const reader = new FileReader();



    reader.onload = () => {

      img.src = reader.result;

    };



    reader.onerror = reject;



    img.onload = () => {


      const scale = 2.5;


      const canvas =
        document.createElement("canvas");



      canvas.width =
        img.width * scale;


      canvas.height =
        img.height * scale;




      const ctx =
        canvas.getContext("2d");




      ctx.imageSmoothingEnabled = true;

      ctx.imageSmoothingQuality = "high";



      // upscale

      ctx.drawImage(

        img,

        0,

        0,

        canvas.width,

        canvas.height

      );






      const imageData =
        ctx.getImageData(

          0,

          0,

          canvas.width,

          canvas.height

        );



      const data =
        imageData.data;





      for(
        let i=0;
        i<data.length;
        i+=4
      ){



        let gray =

        (
          data[i] * 0.299 +

          data[i+1] * 0.587 +

          data[i+2] * 0.114

        );





        // contrast enhancement

        gray =
        ((gray - 128) * 1.35) + 128;



        gray =
        Math.max(
          0,
          Math.min(
            255,
            gray
          )
        );




        data[i]=gray;

        data[i+1]=gray;

        data[i+2]=gray;



      }






      ctx.putImageData(

        imageData,

        0,

        0

      );






      canvas.toBlob(

        blob=>{


          if(!blob){

            reject(
              new Error(
                "Image processing failed"
              )
            );

            return;

          }



          resolve(blob);



        },


        "image/png",

        1

      );




    };



    reader.readAsDataURL(file);



  });



}