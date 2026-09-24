export function checkImageQuality(file) {

  return new Promise((resolve)=>{


    const img = new Image();

    const reader = new FileReader();



    reader.onload = () => {

      img.src = reader.result;

    };



    img.onload = () => {


      let issues = [];



      const width = img.width;
      const height = img.height;



      // Only very small images reject karo
      if(width < 500 || height < 500){

        issues.push(
          "Image resolution is very low"
        );

      }





      const canvas =
        document.createElement("canvas");


      canvas.width = width;

      canvas.height = height;



      const ctx =
        canvas.getContext("2d");



      ctx.drawImage(
        img,
        0,
        0
      );



      const imageData =
        ctx.getImageData(
          0,
          0,
          width,
          height
        );



      const data =
        imageData.data;



      let brightness = 0;



      for(
        let i=0;
        i<data.length;
        i+=4
      ){

        brightness +=
        (
          data[i] +
          data[i+1] +
          data[i+2]
        ) / 3;

      }



      brightness =
      brightness /
      (data.length / 4);






      if(brightness < 40){

        issues.push(
          "Image is too dark"
        );

      }




      if(brightness > 250){

        issues.push(
          "Image is overexposed"
        );

      }





      resolve({

        good:
          issues.length === 0,


        issues

      });



    };



    reader.readAsDataURL(file);



  });


}