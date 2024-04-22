var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var savedUsers = [];

var MongoClient = require('mongodb').MongoClient;

async function getClient(){
  return await MongoClient.connect("mongodb://localhost:27017/");
}

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


// Rest endpoints for read, delete, and update

//endpoint for delete
app.post('/deleteUser', async function(req, res) {
  const username = req.body.username; // Username of the user to be deleted

  try {
    const dbClient = await getClient();
    const dbo = dbClient.db('gameHubdb');
    
    // Delete the user based on the username
    const result = await dbo.collection('savedUsers').deleteOne({ userName: username });

    dbClient.close();

    if (result.deletedCount === 1) {
      res.json({ status: 'success', message: 'User deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'User not found' });
    }
  } catch (err) {
    console.error('Error: ', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Endpoint to update user location
app.post('/updateUserLocation', async function(req, res) {
  console.log('Received data: ', req.body);
  
  const username = req.body.userName;
  const password = req.body.userPassword;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;

  try {
      const dbClient = await getClient();
      const dbo = dbClient.db('gameHubdb');

      const result = await dbo.collection('savedUsers').updateOne(
          { userName: username, userPassword: password },
          { $set: { city: city, state: state, zip: zip } }
      );

      dbClient.close();

      if (result.modifiedCount === 0) {
          res.status(404).json({ status: 'error', message: 'User not found' });
      } else {
          res.json({ status: 'success', updated: result.modifiedCount });
      }
  } catch (err) {
      console.error('Error: ', err);
      res.status(500).json({ status: 'error', message: err.message });
  }
});


//Endpoint to get user information
app.post('/getUserInfo', async function(req, res) {
  const { username, password } = req.body;
  try {
      const dbClient = await getClient();
      const dbo = dbClient.db('gameHubdb');
      const user = await dbo.collection('savedUsers').findOne({ userName: username, userPassword: password }, { projection: { userPassword: 0 } });

      dbClient.close();

      if (user) {
          res.json(user);
      } else {
          res.status(404).json({ status: 'error', message: 'No user found or incorrect credentials' });
      }
  } catch (err) {
      console.error('Error: ', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});



// Retrieve users from the database
app.get('/getUsers', async function(req, res) {
  const dbClient = await getClient();
  var dbo = dbClient.db('gameHubdb');
  var collection = dbo.collection('savedUsers');

  const userInfo = await collection.find().toArray();
  
  const usersInfoFormatted = userInfo.map(user => ({
    userName: user.userName,
    userEmail: user.userEmail,
    userPassword: user.userPassword
  }));

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(usersInfoFormatted));
});

// Save user into the database
app.post('/saveUser', async function(req,res){
  const newUser = {
    userName: req.body.userName,
    userEmail: req.body.userEmail,
    userPassword: req.body.userPassword
  };

  const dbClient = await getClient();

  var dbo = dbClient.db('gameHubdb');
  dbo.collection('savedUsers').insertOne(newUser, function(err, res){
    if(err) throw err
    dbClient.close();
  })

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(savedUsers));
})

// Delete information that user entered

app.post('/deleteUser', async function(req, res) {
  const userEmail = req.body.userEmail;
  const dbClient = await getClient();
  const dbo = dbClient.db('gameHubdb');
  dbo.collection('savedUsers').deleteOne({ userEmail: userEmail }, function(err, result) {
    if (err) throw err;
    dbClient.close();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'success' }));
  });
});


// Update information that user entered
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


//End of custom endpoints

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
