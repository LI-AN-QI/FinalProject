let express = require('express');
let app = express();

app.use(express.json()); 
app.use('/', express.static('public'));


let score = [];
//Connect to the mongo DB
const { Database } = require("quickmongo");
// const db = new Database("mongodb+srv://al8286:al8286@cluster0.pksu4yn.mongodb.net/?retryWrites=true&w=majority");
const db = new Database("mongodb+srv://DB_USERNAME:DB_PASSWORD@cluster0.pksu4yn.mongodb.net/?retryWrites=true&w=majority");
db.on("ready", () => {
    console.log("Connected to the database");
});
db.connect(); 


app.post('/Detail',(req,res)=>{
    // console.log(req.body);
    let obj = {
        Name: req.body.name,
        Score: req.body.score
    };
console.log(obj);
    db.push("score",obj);
    res.json(obj);
});


app.get('/CheckDetail',(req,res)=>{
    db.get("score").then(Data =>{
        let obj = {data: Data};
        res.json(obj);
    });
    
});



app.listen(3000, ()=> {
    console.log('listening at localhost:3000');
})