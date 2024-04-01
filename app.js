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
  const userName = req.body.userName;
  const userEmail = req.body.userEmail;

  users.push(userName);
  users.push(userEmail);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
})

app.post('/deleteUser', function(req, res){
  const userToDelete = req.body.user;
  const indexOfUser = users.indexOf(userToDelete);

  if(indexOfUser > -1){
    users = users.splice(indexOfUser, 1);
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
})

app.post('/updateUser', function(req,res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
})

//End off custom endpoints

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.post('/update', (req, res) => {

    const updates = req.body;


    res.json({ message: 'Updates saved successfully' });
});


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
