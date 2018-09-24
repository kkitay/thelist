const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const passport = require('passport');

// load config
const config = require(path.join(__dirname, 'config.js'));

// connect to mongodb
const mongoURI = config.mongoURI;
mongoose.connect(mongoURI, { useNewUrlParser: true });

// initialize express app
const app = express();
app.engine('hbs', handlebars({
  extname: "hbs",
  defaultLayout: "main",
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// express routes
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// auth strategy with json web tokens
const authStrategy = require(path.join(__dirname, 'auth.js'));
app.use(passport.initialize());
passport.use(authStrategy);

// require routes
const indexRoute = require('./routes/index');
const itemRoutes = require('./routes/item');
const userRoutes = require('./routes/users');

// mount routes 
app.use('/', indexRoute);
app.use(itemRoutes);
app.use(userRoutes);

module.exports = app;