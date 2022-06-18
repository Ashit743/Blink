console.log(Notification.permission);

function showNotification1(){
  const notification = new Notification("You forgot to blink",{
    body:'blinking is important to health'
  })  ;
  }


  function showNotification2(){
    const notification = new Notification("Hey take a break!",{
      body:'Do an activity that uses a different part of the brain than was being used for work, which allows the part of the brain being used for work to rest.'
    })  ;
    }






const video = document.getElementById('video')
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/facemodels'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/facemodels'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/facemodels'),
    faceapi.nets.faceExpressionNet.loadFromUri('/facemodels')
  ]).then(startVideo)
  
  function startVideo() {
  
    if (navigator.userAgent.match(/iPhone|iPad|Android/)) { ///iPhone|Android.+Mobile/
      console.log("Mobile");
       video.width = 400; //1080;
  
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(localMediaStream => {
        if ('srcObject' in video) {
          video.srcObject = localMediaStream;
        } else {
          video.src = window.URL.createObjectURL(localMediaStream);
        }
        video.play();
      })
      .catch(err => {
        console.error(`Not available!!!!`, err);
      });
  
    } 
    else {
      console.log("PC");
      navigator.getUserMedia(
          { video: {} },
          stream => video.srcObject = stream,
          err => console.error(err)
        )    
    }
    console.log("video:"+[video.width, video.height]);
  

  }
  
  video.addEventListener('play', () => {

    var canvas_bg = document.createElement("canvas");
    canvas_bg.width = video.width;
    canvas_bg.height = video.height;
    document.body.append(canvas_bg)
    var ctx_bg = canvas_bg.getContext('2d');
    // ctx_bg.fillStyle = "rgb(0,0,0)";
    // ctx_bg.fillRect(0, 0, video.width, video.height/2);
  
    var canvas_face = document.createElement("canvas");
    canvas_face.width = video.width;
    canvas_face.height = video.height;
    var ctx_face = canvas_face.getContext('2d');
  
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    var timeS = Date.now()
    var t1 = performance.now();
    var irisC = [];
    let nowBlinking = false;
    let blinkCount = 0;
    let flag=0
   setInterval(async () => {
      //const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      //faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  
      //console.log(resizedDetections);
      const landmarks = resizedDetections[0].landmarks;
      //console.log(landmarks);
      const landmarkPositions = landmarks.positions;
  
      //--- Iric mark ---//
      ctx_bg.clearRect(0, 0, canvas_bg.width, canvas_bg.height)
      var x_ = landmarkPositions[38-1].x
      var y_ = landmarkPositions[38-1].y
      var w_ = landmarkPositions[39-1].x - landmarkPositions[38-1].x
      var h_ = landmarkPositions[42-1].y - landmarkPositions[38-1].y
      ctx_bg.fillStyle = "rgb(255,0,0)";
      ctx_bg.fillRect(x_, y_, w_, h_)
  
      x_ = landmarkPositions[44-1].x
      y_ = landmarkPositions[44-1].y
      w_ = landmarkPositions[45-1].x - landmarkPositions[44-1].x
      h_ = landmarkPositions[48-1].y - landmarkPositions[44-1].y
      ctx_bg.fillRect(x_, y_, w_, h_)
  
      //--- Face mask ---//
  
      //--- Iris value ---//
      ctx_face.clearRect(0, 0, canvas_face.width, canvas_face.height)
      ctx_face.drawImage(video, 0, 0, video.width, video.height);
      var frame = ctx_face.getImageData(0, 0, video.width, video.height);
      var p_ = Math.floor(x_+w_/2) + Math.floor(y_+h_/2) * video.width
      var v_ = Math.floor( (frame.data[p_*4+0] + frame.data[p_*4+1] + frame.data[p_*4+2])/3 );
      console.log("irisC:"+v_);
  
      irisC.push(v_);
      
      if(irisC.length>100){
          irisC.shift();
      }//
  
      let meanIrisC = irisC.reduce(function(sum, element){
        return sum + element;
      }, 0);
      meanIrisC = meanIrisC / irisC.length;
      let vThreshold = 1.3;
  
      let currentIrisC = irisC[irisC.length-1];
      if(irisC.length==100){
         if(nowBlinking==false){
            if(currentIrisC>=meanIrisC*vThreshold){
                nowBlinking = true;
            }
         }
         else{
            if(currentIrisC<meanIrisC*vThreshold){
                nowBlinking = false;
                blinkCount += 1;
            }
         }

      }
  
      // var ctx = canvas.getContext('2d');
      var t2 = performance.now();//ms
      var timeS2 = Date.now()
      // ctx.font = "48px serif";
      // ctx.fillText("FPS:"+ Math.floor(1000.0/(t2-t1)), 10, 50);
      // ctx.fillText("Count:"+blinkCount, 10, 100);
      t1 = t2;
      
      if((timeS2-timeS)>300000){ //5mins
         if(blinkCount<200){
          // console.log('plz blink');
          if (Notification.permission === "granted") {
            showNotification1()
          } else if (Notification.permission !== "denied") {
             Notification.requestPermission().then(permission => {
                console.log(permission);
             });
          } 
          if (flag<4){
            flag+=1
          }        
          else{
            showNotification2()
            flag = 0
          } 
        }
        timeS=timeS2;
        blinkCount=0
      }

      console.log(t1,t2,blinkCount,timeS2-timeS,flag)
      let Blinkk = document.getElementById('blinkkk')
      var value = blinkCount
      Blinkk.innerHTML = value
    }, 0)
  
  }
  )