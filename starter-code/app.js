const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const debug = require('debug')('basic-auth:'+ path.basename(__filename));
const expressLayouts = require('express-ejs-layouts');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const dbName = "mongodb://localhost/linkedin";
mongoose.connect(dbName, { useMongoClient:true} )
        .then(() => debug(`Connected to database: ${dbName}`));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(expressLayouts)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: "linkedin-secret",
  cookie: { maxAge: 60*60*24*2 }, // 2 days
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) =>{
  res.locals.title = "";
  res.locals.user = req.session.currentUser;
  next();
})

app.use('/', authRoutes);
app.use('/', profileRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
