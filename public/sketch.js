let entryPopup = document.getElementById('entryPopup');
let startButton = document.getElementById('startButton');
let uploadButton = document.getElementById('uploadButton');
let replayButton = document.getElementById('replayButton');
let endgame = document.getElementById('endgame');

let gameStarted = false; // 添加一个标志，表示游戏是否已经开始


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

        //upload成功弹窗
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


   // 检查是否存在数据
   if (data.data && data.data.length > 0) {
    // 按分数降序排列
    data.data.sort((a, b) => b.Score - a.Score);


        for(let i=0;i<data.data.length;i++) {                     
        
          let name = data.data[i].Name;
          let score = data.data[i].Score;
  



             // Create a <div> to contain Name and Title
             let infoDiv = document.createElement('div');
             infoDiv.className = 'info-container'; // add a css clss name to control the style
 
 
            // Create a <h1> and get data from the database
            let nameElement = document.createElement('h1');
            nameElement.innerHTML = name;
            infoDiv.appendChild(nameElement);
 
            // Create a <h2> and get data from the database
            let scoreElement = document.createElement('h2');
            scoreElement.innerHTML = score;
            infoDiv.appendChild(scoreElement);
 
             // Add the new <div> into the id="score"
             document.getElementById('score').appendChild(infoDiv);
        }


      } else {
        // 如果没有数据，显示一个提示消息
        let noDataElement = document.createElement('p');
        noDataElement.innerHTML = "No data available.";
        document.getElementById('score').appendChild(noDataElement);
    }


    })

})





//////////////////////////////////////////////////////////
// 当用户点击 "开始" 按钮时
startButton.addEventListener('click', function() {
    entryPopup.style.display = 'none'// 隐藏弹窗
    startGame(); // 开始游戏
});

// 在页面加载时显示弹窗
window.onload = function() {
    entryPopup.style.display = 'block';
};

//当用户点击“Replay"按钮时
replayButton.addEventListener('click',function(){
    endgame.style.display = 'none';// 隐藏弹窗
    startGame(); // 开始游戏

})



/////////////////p5

let video;
let poseNet;
let pose;
let bounceBall;
let speed = 4; // initial velocity： 4
let maxRadius = 250; // max radius: 150
let bounceSound;
let bgm;
let lose;


//TIMER:
let timerInterval; // 定义计时器变量
let gameTime = 0; // 游戏时间（秒）

let yellowBallImage; // 保存黄色小球的图片对象



function preload(){
  // yellowBallImage = loadImage('Star.png');
  yellowBallImage = loadImage('Star.png', () => {
    console.log('图像加载完成');
  });

  //弹跳音效
  bounceSound = loadSound('Bounce.mp3');
  bgm = loadSound('bgm.mp3')
  lose = loadSound('lose.mp3')

}

function playBounceSound(){
  bounceSound.play();
}


function setup() {
  createCanvas(648, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  bounceBall = new BounceBall(width / 2, height / 2, 40, color(0, 255, 0)); // initial radius: 40
  bounceBall.speed *= 2; // initial velocity * 2
  setTimeout(() => {

    createYellowBall();
  }, 3000);


}


function createYellowBall() {
  // 随机生成黄色小球的位置
  let x = random(width);
  let y = random(height);

  // 在画布上显示黄色小球图片
  displayYellowBall(x, y);

  // 在5秒后调用函数隐藏黄色小球
  setTimeout(() => {
    hideYellowBall();
  }, 5000);
}

function displayYellowBall(x, y) {
  // 显示图片
  image(yellowBallImage, x, y,400,400);
}

function hideYellowBall() {
  // 清除画布上的内容，可以根据具体情况调整
  clear();
  // 在这里可以添加其他隐藏黄色小球的逻辑
}


function generateYellowBall() {
  // 随机生成黄色小球的位置
  let yellowBall = new BounceBall(random(width), random(height), 20, color(255, 255, 0));
  yellowBall.displayForSeconds(5); // 显示黄色小球5秒
  yellowBalls.push(yellowBall); // 将黄色小球添加到数组中
}


function startGame() {
  // 开始游戏时，重置游戏时间和显示

  gameTime = 0;

  bounceBall.reset(); // 重置绿球位置和状态

  // 设置周期性计时器，每1000毫秒（1秒）执行一次updateTimer函数
  timerInterval = setInterval(updateTimer, 1000);
  gameStarted = true; // 设置游戏开始标志
  bgm.play();
}







function updateTimer() {
  // 计时器更新函数，在每秒触发
  gameTime++;
  displayGameTime();
}

function displayGameTime() {
  // 将游戏时间显示在画布上
  
  textSize(32);
  fill(0);
  text("Game Time: " + gameTime, 50, 50);
}

function endGame() {
//stop bgm
bgm.pause();


  // 游戏结束时清除计时器
  clearInterval(timerInterval);

// 将游戏时间显示在 id="yourscore" 的 div 元素中
let yourscoreElement = document.getElementById('yourscore');
yourscoreElement.innerHTML = gameTime ;

  console.log("You have persisted for：" + gameTime + "seconds");
  endgame.style.display = 'block';

    // 播放 "lose.mp3"
    document.getElementById('lose').play();
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
    // let eyeDistance = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    let noseDistance = dist(bounceBall.x, bounceBall.y, pose.nose.x, pose.nose.y);
    fill(255, 0, 0);
    ellipse(pose.nose.x, pose.nose.y, 20);

    if(gameStarted === true){
        bounceBall.display();
        bounceBall.move();
        bounceBall.checkEdges();
    };
    
// 如果红球消失在屏幕上，结束游戏
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
  // 设置字体
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
    fill(this.col);
    ellipse(this.x, this.y, this.r * 2);
  }

  move() {
    if (!this.stopped) {
      this.x += this.xSpeed-random(0,0.5);
      this.y += this.ySpeed-random(0,0.5);
      if (this.r < maxRadius) {
        this.r += 0.05; // 每帧增加半径直到达到最大半径
      }
    }
  }

  checkEdges() {
    if (this.x > width - this.r) {
    this.x = width - this.r; // 将 x 设置为画布右边缘
    this.xSpeed *= -1; // 反转 x 速度
    playBounceSound(); // 播放音效
  } else if (this.x < this.r) {
    this.x = this.r; // 将 x 设置为画布左边缘
    this.xSpeed *= -1; // 反转 x 速度
    playBounceSound(); // 播放音效
  }

  if (this.y > height - this.r) {
    this.y = height - this.r; // 将 y 设置为画布底边缘
    this.ySpeed *= -1; // 反转 y 速度
    playBounceSound(); // 播放音效
  } else if (this.y < this.r) {
    this.y = this.r; // 将 y 设置为画布顶边缘
    this.ySpeed *= -1; // 反转 y 速度
    playBounceSound(); // 播放音效
  }
    
  }

  stop() {
    this.stopped = true;
  }


  reset() {
    this.x = random(0,width);
    this.y = random(0,height);
    this.r = 40; // 初始半径
    this.stopped = false;
  }
}
