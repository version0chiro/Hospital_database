//all the modules that i need for this

require('dotenv').config();
const express = require('express'); //used for server making
const ejs = require('ejs');//used to apply javascript into html code
const findOrCreate = require('mongoose-findorcreate');
const bcrypt = require("bcrypt");
const saltRounds = 15;
const lodash = require('lodash');//used for text variations
const mongoose = require('mongoose');//Database manager
const bodyParser = require('body-parser');//used to recives data from forms

//connecting the mongoose local data base with the story
//mongoose.connect("mongodb+srv://admin-sachin:Sachin@123@cluster0-pf7ee.mongodb.net/hospitalDB", {useNewUrlParser: true});
mongoose.connect("mongodb://localhost:27017/hospitalDB", {
  useNewUrlParser: true
});



//schema decides all the data in the data base
const paitentSchema={
  paitentID:Number,
  name:String,
  age:Number,
  height:Number,
  weight:Number,
  diesease:String,
  review:String,
  bloodPressureCount:[Number],
  heartRateCount:[Number]
};

//for logins
const userSchema = new mongoose.Schema({
  email:String,
  password:String
});


//making a model
const Paitent=mongoose.model("Paitents",paitentSchema);

//new model for users
const User = new mongoose.model("User", userSchema);

let token= false;

//making app for express
const app = express();

//using ejs as the view engine
app.set('view engine','ejs');

//allowing body parser to use urlencoded
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/",(req,res)=>{
  res.redirect("/login");
})

//the login section
app.get("/login", function(req, res){
  token=false;
  res.render("login");
});

app.get("/register", function(req, res){
  token=false
  res.render("register");
});

app.post("/register", function(req, res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser =  new User({
      email: req.body.username,
      password: hash
    });
    newUser.save(function(err){
      if (err) {
        console.log(err);
      } else {
        token=true;
        res.redirect("/data");
      }
    });
  });

});

app.post("/login", function(req, res){
  token=false;
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            token=true;
            res.redirect("/data");
          }
        });
      }
    }
  });
});





//the main program
app.get("/dataEntry",function(req,res){
  res.render("dataEntry");
});

app.post("/dataEntry",function(req,res){
  const name=req.body.name1;
  const age=req.body.age;
  const height=req.body.height;
  const weight=req.body.weight;
  const disease=req.body.disease;
  const review=req.body.review;
  const paitent = new Paitent({
    paitentID:req.body.ID,
    name:name,
    age:age,
    height:height,
    weight:weight,
    diesease:disease,
    review:review,
    bloodPressureCount:0,
    heartRateCount:0
  })
  paitent.save();
  res.redirect("/dataEntry");
});

var length;

app.post("/:inputName/:bloodPressure/:heartRate",function(req,res){
  console.log("entered");
  const name=req.params.inputName;
  const bloodPressure=req.params.bloodPressure;
  const heartRate=req.params.heartRate;
  Paitent.findOne({name:name},function(err,foundList){
    foundList.bloodPressureCount.push(bloodPressure);
    foundList.heartRateCount.push(heartRate);
    foundList.save();
    res.send("updated bloodPressure");
  })
});

app.get("/data",function(req,res){
  if(token===true){
    Paitent.estimatedDocumentCount({},function(err,count){
    length=count;
  })

  Paitent.find({},function(err,paitent)
  {
    res.render("data",{
    paitents: paitent,
    length:length
  });
});
}
else{
  console.log("please login");
  res.redirect("/login");

}
});

app.get("/data/:name",function(req,res){
  Paitent.estimatedDocumentCount({},function(err,count){
    length=count;
  })
  console.log(req.params.name);
  Paitent.find({name:req.params.name},function(err,paitent)
  {
    res.render("perticularData",{
    paitents: paitent,
    length:length,
    pName:req.params.name
  });
});
});

app.listen(process.env.PORT ||3000,function(){
  console.log("server started at port 3000");
})
