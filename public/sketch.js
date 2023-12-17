let entryPopup = document.getElementById('entryPopup');
let startButton = document.getElementById('startButton');
let uploadButton = document.getElementById('uploadButton');
let replayButton = document.getElementById('replayButton');
let endgame = document.getElementById('endgame');
let gameStarted = false; //check the status of lose.mp3
let upload = document.getElementById('uploadPopup')
let close = document.getElementById('close')



window.addEventListener('load', () => {
  //////////////////////////////////Code for upload game score/////////////////////////////////
  document.getElementById('uploadButton').addEventListener('click', () => {

    //Get the user input content (name & title)
    let name = document.getElementById('username').value;
    let score = gameTime;

    //Create an object to save the canvas content & user input 
    let obj = {
      "name": name,
      "score": score
    };

    //Post the object to the database
    let jsonData = JSON.stringify(obj);
    fetch('/Detail', {
      method: 'POST',
      headers: {
        "Content-type": "application/json"
      },
      body: jsonData
    })
      .then(response => response.json())
      .then(data => { console.log(data) })

    //Sucessfully uploaded notification & close window
    upload.style.display = 'block';
    close.addEventListener('click', function () {
      upload.style.display = 'none';
    });
  });


  ///////////////////////////Code for fetching user name and score from database, and show them in order///////////////////////
  fetch('/CheckDetail')
    .then(resp => resp.json())
    .then(data => {
      console.log(data.data);

      // Sort the scorces, FOR EXAMPLE:
      // 1   TOM    32s <red background>
      // 2   ALICE  18s <orange background>
      // 3   PETER  10s <the followings are in purple>
      // 4   JACK    6s
      if (data.data && data.data.length > 0) {
        data.data.sort((a, b) => b.Score - a.Score);
        for (let i = 0; i < data.data.length; i++) {
          let name = data.data[i].Name;
          let score = data.data[i].Score;

          // Create a <div> to contain Name and Title
          let infoDiv = document.createElement('div');
          infoDiv.className = 'info-container'; // add a css class name to control the style

          // Create a <span> to contain numbering
          let numberingSpan = document.createElement('span');
          numberingSpan.className = 'numbering'; // add a class for numbering
          numberingSpan.textContent = (i + 1) + '.'; // Add numbering (starting from 1)
          infoDiv.appendChild(numberingSpan);

          // Create a <h1> and get data from the database to store name
          let nameElement = document.createElement('h1');
          nameElement.innerHTML = name;
          infoDiv.appendChild(nameElement);

          // Create a <h2> and get data from the database to store score
          let scoreElement = document.createElement('h2');
          scoreElement.innerHTML = score + 's'; // Add 's' after the score
          scoreElement.className = 'score'; // add a class name for right alignment
          infoDiv.appendChild(scoreElement);

          // Add the new <div> into the id="score"
          document.getElementById('score').appendChild(infoDiv);

          //Add different style to No.1 and No.2
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


/////////////////////////////////////////////////Code for functions///////////////////////////////////////////
// when user click start button, start the game
startButton.addEventListener('click', function () {
  entryPopup.style.display = 'none';
  startGame();
});

// entry popup window
window.onload = function () {
  entryPopup.style.display = 'block';
};

// when user click replay button, start the game
replayButton.addEventListener('click', function () {
  endgame.style.display = 'none';
  startGame();
  hasPlayed = false;
});



///////////////// P5 CODE //////////////////

let video;
let poseNet;
let pose;
let bounceBall;
let speed = 4; // initial speed of bouncing ball
let maxRadius = 250; // max radius of bouncing ball
let bounceSound;
let bgm;
let lose;
let hasPlayed = false; // check the status of lose.mp3 
let bounceBallImage;
let AAA;


//TIMER:
let timerInterval;
let gameTime = 0;
let yellowBall;


function preload() {
  //sound effects
  bounceSound = loadSound('Bounce.mp3');
  bgm = loadSound('bgm.mp3')
  lose = loadSound('lose.mp3')
  //bouncingball & user(nose) image
  bounceBallImage = loadImage('planet.png');
  AAA = loadImage('AAA.png');
}

function playBounceSound() {
  bounceSound.play();
}


//Capture the vedio and recognize the nose position to control the game
function setup() {
  createCanvas(640, 480).position(windowWidth / 2 - 324, windowHeight / 2 - 240);
  video = createCapture(VIDEO).position(windowWidth / 2 - 324, windowHeight / 2 - 240);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  bounceBall = new BounceBall(width / 2, height / 2, 40, color(0, 255, 0)); // initial radius: 40
  bounceBall.speed *= 2; // initial velocity * 2
}



//Reset gametime, ball status, game status, timer
function startGame() {
  gameTime = 0;
  bounceBall.reset();
  timerInterval = setInterval(updateTimer, 1000);
  gameStarted = true;
  bgm.loop();
}

//Timer
function updateTimer() {
  gameTime++;
  displayGameTime();
}

//Timer on user interface
function displayGameTime() {
  textSize(32);
  fill('#f4ef95');
  stroke('#000000');
  strokeWeight(3);
  text("Game Time: " + gameTime, 50, 50);
}

//Endgame, bgm, score upload
function endGame() {
  bgm.pause();
  clearInterval(timerInterval);
  let yourscoreElement = document.getElementById('yourscore');
  yourscoreElement.innerHTML = gameTime + '<span class="small-text">s</span>';
  console.log("You have persisted for：" + gameTime + "seconds");
  endgame.style.display = 'block';
  //check the status of 'gameover', so that it won't play repeatly
  if (!hasPlayed) {
    lose.play();
    hasPlayed = true;
  }
}

//Face posiyion capture & game mechanism : end the game when user's nose touch the bouncing ball
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
  scale(-1, 1);//Mirroring the Video 
  image(video, 0, 0);
  if (pose) {
    let noseDistance = dist(bounceBall.x, bounceBall.y, pose.nose.x, pose.nose.y);//distance between nose and bouncing ball
    image(AAA, pose.nose.x - 33, pose.nose.y - 33, 66, 66); //image on user's nose

    //start the game
    if (gameStarted === true) {
      bounceBall.display();
      bounceBall.move();
      bounceBall.checkEdges();
    };

    // end the game if nose is out of the screen
    if (pose.nose.x > width || pose.nose.x < 0 || pose.nose.y > height || pose.nose.y < 0) {
      bounceBall.stop();
      endGame();
    };

    //end the game if nose touches bouncing ball
    if (noseDistance < bounceBall.r) {
      bounceBall.stop();
      endGame();
    };
  }

  //display real-time gametime while user is playing
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

  //Code for displaying the user (nose image)
  display() {
    image(bounceBallImage, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);//nose image
  }

  //Code for bouncing ball speed and radius change
  move() {
    if (!this.stopped) {
      this.x += this.xSpeed - random(1, 2);
      this.y += this.ySpeed - random(1, 2);//add a random speed increase to the bouncing ball after each bounce
      if (this.r < maxRadius) {
        this.r += 0.1; // radius change
      }
    }
  }

  //Code for bouncing and sound effect
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

  //Code for stop the bouncing ball
  stop() {
    this.stopped = true;
  }

  //code for reset bouncing ball status to start a new game
  reset() {
    this.x = random(0, width);
    this.y = random(0, height);
    this.r = 40;
    this.stopped = false;
  }
}
