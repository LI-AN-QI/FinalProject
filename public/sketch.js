let entryPopup = document.getElementById('entryPopup');
let startButton = document.getElementById('startButton');
let uploadButton = document.getElementById('uploadButton');
let replayButton = document.getElementById('replayButton');
let endgame = document.getElementById('endgame');

let gameStarted = false; //check the status of lose.mp3


let upload = document.getElementById('uploadPopup')
let close = document.getElementById('close')



window.addEventListener('load',()=>{

    document.getElementById('uploadButton').addEventListener('click',()=>{
        //Get the user input content (name & title)
        let name = document.getElementById('username').value;
        let score = gameTime;

        //Create an object to save the canvas content & user input 
        let obj = {
            //call the function saveDrawing to get the return of the canvas content as string data 
            "name":name,
            "score":score
        };
        console.log(obj);

         //Post the object to the database
        let jsonData = JSON.stringify(obj);
        fetch('/Detail',{
            method:'POST',
            headers:{
            "Content-type":"application/json"
            },
            body: jsonData
        })
        .then(response => response.json())
        .then(data=>{console.log(data)})

        //upload popup window
        upload.style.display = 'block';

        close.addEventListener('click',function(){

          //Close uploaded
          upload.style.display = 'none';
        })
        



    });





    
    //Fetch from database
    fetch('/CheckDetail')
    .then(resp=> resp.json())
    .then(data => {
        console.log(data.data);


   // sort the scorces
   if (data.data && data.data.length > 0) {
    data.data.sort((a, b) => b.Score - a.Score);


        for(let i=0;i<data.data.length;i++) {                     
        
          let name = data.data[i].Name;
          let score = data.data[i].Score;
  



            // Create a <div> to contain Name and Title
             let infoDiv = document.createElement('div');
             infoDiv.className = 'info-container'; // add a css clss name to control the style
 
             // Create a <span> for the numbering
             let numberingSpan = document.createElement('span');
             numberingSpan.className = 'numbering'; // add a class for numbering
            numberingSpan.textContent = (i + 1) + '.'; // Add numbering (starting from 1)
             infoDiv.appendChild(numberingSpan);
          
            // Create a <h1> and get data from the database
            let nameElement = document.createElement('h1');
            nameElement.innerHTML = name;
            infoDiv.appendChild(nameElement);
 
            // Create a <h2> and get data from the database
            let scoreElement = document.createElement('h2');
            scoreElement.innerHTML = score + 's'; // Add 's' after the score
            scoreElement.className = 'score'; // add a class name for right alignment
            infoDiv.appendChild(scoreElement);
 
             // Add the new <div> into the id="score"
             document.getElementById('score').appendChild(infoDiv);
          
           if (i === 0) {
        infoDiv.classList.add('first-row');
          } else if (i === 1) {
        infoDiv.classList.add('second-row');
          }
        }


      } else {
        // notification for "nodata"
        let noDataElement = document.createElement('p');
        noDataElement.innerHTML = "No data available.";
        document.getElementById('score').appendChild(noDataElement);
    }


    })

})





//////////////////////////////////////////////////////////
// when user click start button
startButton.addEventListener('click', function() {
    entryPopup.style.display = 'none'
    startGame(); 
});

// entry popup window
window.onload = function() {
    entryPopup.style.display = 'block';
};

// when user click replay button
replayButton.addEventListener('click',function(){
    endgame.style.display = 'none';
    startGame(); 
  hasPlayed = false;

})



/////////////////p5

let video;
let poseNet;
let pose;
let bounceBall;
let speed = 4; // initial speed of bouncing ball
let maxRadius = 250; // max radius of bouncing ball
let bounceSound;
let bgm;
let lose;
// check the status of lose.mp3 
let hasPlayed = false;
let bounceBallImage;
let AAA;


//TIMER:
let timerInterval; 
let gameTime = 0; 
let yellowBall;


function preload(){
 
  //bouncing sound effect
  bounceSound = loadSound('Bounce.mp3');
  bgm = loadSound('bgm.mp3')
  lose = loadSound('lose.mp3')
  // bouncingball image
  bounceBallImage = loadImage('planet.png');
  AAA = loadImage('AAA.png');
}

function playBounceSound(){
  bounceSound.play();
}


function setup() {
  createCanvas(648, 480).position(windowWidth / 2 - 324, windowHeight / 2 - 240);

  video = createCapture(VIDEO).position(windowWidth / 2 - 324, windowHeight / 2 - 240);

  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  bounceBall = new BounceBall(width / 2, height / 2, 40, color(0, 255, 0)); // initial radius: 40
  bounceBall.speed *= 2; // initial velocity * 2
}




function startGame() {
  gameTime = 0;

  bounceBall.reset();

  // Timer
  timerInterval = setInterval(updateTimer, 1000);
  gameStarted = true; 
  bgm.loop();
}







function updateTimer() {
  gameTime++;
  displayGameTime();
}

function displayGameTime() {
  textSize(32);
  fill('#f4ef95');
  
    stroke('#000000');
    strokeWeight(3);

  text("Game Time: " + gameTime, 50, 50);
}

function endGame() {
//stop bgm
bgm.pause();
  
    
  clearInterval(timerInterval);


let yourscoreElement = document.getElementById('yourscore');
yourscoreElement.innerHTML = gameTime + '<span class="small-text">s</span>';
console.log("You have persisted for：" + gameTime + "seconds");
endgame.style.display = 'block';




  if (!hasPlayed) {
    lose.play();
    hasPlayed = true;
  }
  
}
  
  





function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    if (pose) {
      let nose = createVector(pose.nose.x, pose.nose.y);
      let distance = dist(nose.x, nose.y, bounceBall.x, bounceBall.y);
      if (distance < bounceBall.r) {
        bounceBall.stop();
        endGame();
       
      }
    }
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}


function draw() {
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);


  if (pose) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let noseDistance = dist(bounceBall.x, bounceBall.y, pose.nose.x, pose.nose.y);

    image(AAA,pose.nose.x-33, pose.nose.y-33,66,66);

    if(gameStarted === true){
        bounceBall.display();
        bounceBall.move();
        bounceBall.checkEdges();
    };
    
// end the game if nose is out of the screen
    if (pose.nose.x > width || pose.nose.x < 0 || pose.nose.y > height || pose.nose.y < 0) {
      bounceBall.stop();
      endGame();
      
    }

    
    if (noseDistance < bounceBall.r) {
      bounceBall.stop();
      endGame();
     
    }
  }


  translate(width, 0);
  scale(-1, 1);
  textFont('Silkscreen', 32);
  displayGameTime();


}





class BounceBall {
  constructor(x, y, r, col) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col;
    this.speed = speed;
    this.xSpeed = this.speed;
    this.ySpeed = this.speed;
    this.stopped = false;
  }

  display() {
//nose image
    image(bounceBallImage, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
  }

  move() {
    if (!this.stopped) {
      this.x += this.xSpeed-random(1,2);
      this.y += this.ySpeed-random(1,2);

      if (this.r < maxRadius) {
        this.r += 0.1; // radius change
      }
    }
  }

  checkEdges() {
    if (this.x > width - this.r) {
    this.x = width - this.r; 
    this.xSpeed *= -1; 
    playBounceSound(); 
  } else if (this.x < this.r) {
    this.x = this.r; 
    this.xSpeed *= -1; 
    playBounceSound(); 
  }

  if (this.y > height - this.r) {
    this.y = height - this.r; 
    this.ySpeed *= -1; 
    playBounceSound(); 
  } else if (this.y < this.r) {
    this.y = this.r; 
    this.ySpeed *= -1; 
    playBounceSound(); 
  }
    
  }

  stop() {
    this.stopped = true;
  }


  reset() {
    this.x = random(0,width);
    this.y = random(0,height);
    this.r = 40; 
    this.stopped = false;
  }
}
