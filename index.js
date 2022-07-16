const express = require('express')
const mySecret = process.env['MONGO_URI']
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const { Schema } = mongoose;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

mongoose.connect(mySecret, {
useNewUrlParser: true,
useUnifiedTopology: true },
() => { console.log("Connected to MONGO BONGO DB")}
)




const userSchema = new Schema({
username: {
type: String,
required: true},
count: Number,
log: [{
description: String,
duration: Number,
date: {type: String, required: false},
_id: false
}]
});

const User = mongoose.model("User", userSchema);


app.get("/", (req, res) => {
res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req,res)=>{
var user = new User({
    username: req.body.username
});
user.save(function(err,data){
if(err) return console.error(err);
res.send({
    username: data.username,
    _id: data._id
})
})
});

app.get("/api/users", (req,res)=>{
User.find({}, function(err,list){
    if(err){
    console.log(err)
    }
    else{
    res.send(list)
    }
})
});

const dateValidation = (input) =>{
if(input === undefined){
return new Date().toDateString()
}
else {
return new Date(input).toDateString()
}
};

app.post("/api/users/:_id/exercises", (req,res)=>{
let exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: dateValidation(req.body.date)
    };
User.findOneAndUpdate ({_id: req.params._id}, exercise, {new: true}, (err,data)=>{
if(err){
    res.send({
    error: err
    })
}  
else{
data.log.push(exercise);
    console.log("saving exercise")
    data.save();
    res.send({
    username: data.username,
    _id: req.params._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
})
}})
});

app.get("/api/users/:_id/logs", (req, res) => {
User.findById(req.params._id, (error, result) => {
if (!error) {
    let resObj = result;

    if (req.query.from || req.query.to) {
    let fromDateFormat = yyyy-mm-dd;
    let fromDate = new Date(0);
    let toDateFormat = yyyy-mm-dd;
    let toDate = new Date();

    if (req.query.from) {
        fromDate = new Date(req.query.from);
    }

    if (req.query.to) {
        toDate = new Date(req.query.to);
    }

    fromDate = fromDate.getTime();
    toDate = toDate.getTime();

    resObj.log = resObj.log.filter(session => {
        let sessionDate = new Date(session.date).getTime();

        return sessionDate >= fromDate && sessionDate <= toDate;
    });
    }

    if (req.query.limit) {
      let limit = integer;
    resObj.log = resObj.log.slice(0, req.query.limit);
    }

    resObj = resObj.toJSON();
    resObj["count"] = result.log.length;
    res.json(resObj);
}
});
});

app.post("/api/users/view", (req, res) => {
console.log(req.body);
User.findById(req.body._id, (error, result) => {
if (!error) {
    let resObj = result;

    if (req.body.from || req.body.to) {
    let fromDate = new Date(0);
    let toDate = new Date();

    if (req.body.from) {
        fromDate = new Date(req.body.from);
    }

    if (req.body.to) {
        toDate = new Date(req.body.to);
    }

    fromDate = fromDate.getTime();
    toDate = toDate.getTime();

    resObj.log = resObj.log.filter(session => {
        let sessionDate = new Date(session.date).getTime();

        return sessionDate >= fromDate && sessionDate <= toDate;
    });
    }

    if (req.body.limit) {      
    resObj.log = resObj.log.slice(0, req.body.limit);
    }

    resObj = resObj.toJSON();
    resObj["count"] = result.log.length;
    res.json(resObj);
}
});
});


