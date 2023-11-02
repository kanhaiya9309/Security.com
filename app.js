//jshint esversion:6

require('dotenv').config()
const express =  require ('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
//const encryption = require("mongoose-encryption");
// const hash = require('MD5');
const bcrypt = require('bcrypt');
const saltRounds = 10;




mongoose.connect('mongodb://127.0.0.1/Security', {
     useUnifiedTopology: true, 
     useNewUrlParser: true,  }
     )

const userPass = new mongoose.Schema( {
    email:{ type: String, required: true } ,
    password:{ type: String, required: true }
}) 

// const secret = process.env.SECRET;

// userPass.plugin(encryption,{secret:secret,encryptedFields:['password']});



const UserPass = new mongoose.model('UserPass',userPass);


const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true})) ;
app.set('view engine','ejs') ;
const port = 3000 ;


app.get("/",function(req,res){
    res.render('home.ejs');
})


app.get("/login",function(req,res){
    res.render('login.ejs');
})

app.get("/register",function(req,res){
    res.render('register.ejs');
})


app.get("/secrets",function(req,res){
    res.render('secrets.ejs');
})


app.get("/submit",function(req,res){
  res.render('submit.ejs');
})


app.post('/register',function(req,res){
    // const userEmail = req.body.username;
    // const userPass = req.body.password;

   bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        const userDetails =  new  UserPass ({
          email : req.body.username ,
          password : hash
        })
          userDetails.save()
          res.redirect('/secrets')
      });
  });

 })

app.post('/login',function(req,res){
  const userName = req.body.username;
  const password = req .body.password;
 
  
  UserPass.findOne({email:userName})
  .then((foundUser)=>{
    bcrypt.compare(password, foundUser.password, function(err, result) {
      if(result==true){
        res.render("secrets");
      }else{
        console.log("UserName and Pass is Wrong ")
      }
   });
    // if(foundUser.password === password){
    //     res.render("secrets");
    //     // console.log(foundUser.password);
    // }else{
      
    // }
  })
  .catch((err)=>{
    console.log(err)
  })
})  

// console.log(process.env) 
app.listen(port ,()=>{
    console.log(`Server is started on port ${port} ` );
})





