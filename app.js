var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var users = [];

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


//Rest endpoints for read, delete, and update

app.get('/getUsers', function(req,res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
})

app.post('/saveUser', function(req,res){
  const newUser = {
    userName: req.body.userName,
    userEmail: req.body.userEmail,
  };

  users.push(newUser);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
})

app.post('/deleteUser', function(req, res){
  const userEmail = req.body.userEmail;
  const indexOfUser = users.findIndex(user => user.userEmail === userEmail)

  if(indexOfUser > -1){
    users.splice(indexOfUser, 1);
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
})

app.post('/updateUser', function(req, res) {
  const oldUserName = req.body.userName; // Original userName before update
  const newUserEmail = req.body.newUserEmail;
  const newUserName = req.body.newUserName; // New userName after update
  const userIndex = users.findIndex(user => user.userName === oldUserName);

  if (userIndex > -1) {
    users[userIndex].userEmail = newUserEmail;
    users[userIndex].userName = newUserName; // Update the userName as well
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
});


//End off custom endpoints

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
