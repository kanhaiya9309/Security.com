//jshint esversion:6

require('dotenv').config()
const express =  require ('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const passport =require('passport');
const passportLocalMongoose =require('passport-local-mongoose');
const API = process.env.API ;
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true})) ;
app.set('view engine','ejs') ;
const port = 5500 ;



app.use(session({
  secret:"our little secret",
  resave:false,
  saveUninitialized:false,
}))

app.use(passport.initialize());
app.use(passport.session());




mongoose.connect('mongodb://localhost:27017/Security')


 const personalDetails  = new mongoose.Schema( {
      username : String ,
      email : String ,
      phone : Number ,
      info : String
    }) 


 const personalDetail = new mongoose.model('personalDetail',personalDetails);
    


const userPass = new mongoose.Schema( {
  username : { type: String },
  password: { type: String ,},
  userInfo  : personalDetails ,
  googleId : String 
}) 


userPass.plugin(passportLocalMongoose);
    
userPass.plugin(findOrCreate);

const userdetail = new mongoose.model('userdetail',userPass);



// // use static authenticate method of model in LocalStrategy

passport.use(new LocalStrategy(userdetail.authenticate()));

// use static serialize and deserialize of model for passport session support
// passport.serializeUser(userdetail.serializeUser());
// passport.deserializeUser(userdetail.deserializeUser());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


passport.use(new GoogleStrategy({
  clientID:     process.env.CLIENT_ID ,
  clientSecret: process.env.CLIENT_SECRET ,
  callbackURL: "http://localhost:5500/auth/google/netflix",
  useProfileUrl: "https://www.googleapis.com/oauth2/v3/userinfo" ,
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done)
 {
   console.log(profile)
  userdetail.findOrCreate({ googleId: profile.id ,
    username: profile.displayName}, function (err, user) {
    return done(err, user);
  });
}
));



app.get("/",function(req,res){
    res.render("home.ejs")
})

app.get("/auth/google", passport.authenticate('google', { scope: ["profile"] }));


app.get("/auth/google/netflix",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/netflix");
  });


app.get("/login",function(req,res){
    res.render('login.ejs');
})

app.get("/register",function(req,res){
    res.render('register.ejs');
})



app.get("/logout",function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})
app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
     userdetail.findById(req.user.id)
    .then((founduser)=>{
      res.render("secrets",{userwithInfo:founduser.userInfo})
      }) 
    .catch((err)=>{
     console.log(err)
     })
       } else{
         res.redirect("/login");
      }
 })

app.get("/netflix",function(req,res){
  if(req.isAuthenticated()){
   res.sendFile(__dirname + "/public/home.html");
      } else{
        res.redirect("/login");
      }
})


app.get("/submit",function(req,res){
  res.render("submit.ejs");
})



app.post("/submit",function(req,res){
const userInfo = new personalDetail({
   username : req.body.name ,
   email : req.body.email ,
   phone : req.body.phone ,
   info : req.body.info 
 })
   userInfo.save();

  userdetail.findById(req.user.id)
     .then((foundUser)=>{
      if(foundUser){
        foundUser.userInfo = userInfo ;
        if( foundUser.save()){
          res.redirect("/")
        } else{
          console.log("sorry any problem ")
        }
       }
     })
     .catch((err)=>{
     console.log(err);
     })
 })

app.post('/register',function(req,res){

  const Username = req.body.username;
  const Userpassword = req.body.password;

  console.log(Username,Userpassword);

   userdetail.register(new userdetail({username:Username}), Userpassword)
   .then((user)=>{
    passport.authenticate("local")(req,res , function(){
    res.redirect("/netflix")
    })
   })
   .catch((err)=>{
   console.log(err);
   res.redirect("/register")
   })
})
  

app.post('/login',function(req,res){
 
  const user = new userdetail ({
    username: req.body.username,
    password:req.body.password
  })
 

  req.login(user,function(err){
    if(err){
      console.log(err)
    }else{
      passport.authenticate("local")(req,res,function(){
        if(passport.authenticate){
          res.redirect("/netflix");
        }else{
          alert("Username and Password not match")
        }
      })
    }
  })

})  



app.listen(port ,()=>{
    console.log(`Server is started on port ${port} ` );
})





