//jshint esversion:6

const express =  require ('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');



mongoose.connect('mongodb://127.0.0.1/Security', {
     useUnifiedTopology: true, 
     useNewUrlParser: true,  }
     )

const userPass = new mongoose.Schema( {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}) 


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
    const userEmail = req.body.username;
    const userPass = req.body.password ;

    const userDetails =  new  UserPass({
    email : userEmail ,
    password : userPass
  })
    
    userDetails.save()
    res.redirect('/secrets')
   
 })

app.post('/login',function(req,res){
  const userName = req.body.username;
  const password = req .body.password;

  UserPass.findOne({email:userName})
  .then((foundUser)=>{
    if(foundUser.password === password){
        res.render("secrets");
        console.log(foundUser.password);
    }else{
      console.log("UserName and Pass is Wrong ")
    }
  })
  .catch((err)=>{
    console.log(err)
  })
})  


app.listen(port ,()=>{
    console.log(`Server is started on port ${port} ` );
})





