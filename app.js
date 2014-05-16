var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var BasicStrategy = require('gt-passport-http').BasicStrategy;
var User = require('./models/user');

// Set up BASIC authentication strategy in PassportJS.
//
passport.use(new BasicStrategy({
		disableBasicChallenge: true
	},
	function(username, password, done) {

		process.nextTick(function () {

			User.findOne({username: username}, function(err, user) {

				if (err) { 
					return done(err); 
				}
				
				if (!user) { 
					return done(null, false); 
				}
				
				if (user.password != password) { 
					return done(null, false); 
				}

				return done(null, user);
			})
		});
	}
));

// Open database connection.
//
mongoose.connect('mongodb://localhost:27017/rgf');

var users = require('./routes/user');
var contacts = require('./routes/contact');

var app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(app.router);

// Set up routing.
//
app.get('/login', passport.authenticate('basic', { session: false }), function(req, res) {
	res.send(req.user);
});

app.get('/users', passport.authenticate('basic', { session: false }), users.list);
app.get('/users/:id', passport.authenticate('basic', { session: false }), users.retrieve);
app.post('/users', passport.authenticate('basic', { session: false }), users.create);
app.put('/users/:id', passport.authenticate('basic', { session: false }), users.update);
app.delete('/users/:id', passport.authenticate('basic', { session: false }), users.delete);

app.get('/contacts', passport.authenticate('basic', { session: false }), contacts.list);
app.get('/contacts/:id', passport.authenticate('basic', { session: false }), contacts.retrieve);
app.post('/contacts', passport.authenticate('basic', { session: false }), contacts.create);
app.put('/contacts/:id', passport.authenticate('basic', { session: false }), contacts.update);
app.delete('/contacts/:id', passport.authenticate('basic', { session: false }), contacts.delete);


// Catch 404 and forwarding to error handler
//
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// Error handlers
//

// Development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
		    var status = err.status || 500;
        res.json(status, {
            message: err.message,
            error: err
        });
    });
}

// Production error handler
// no stacktraces leaked to user
//
app.use(function(err, req, res, next) {
		var status = err.status || 500;
    res.json(status, {
        message: err.message,
        error: {}
    });
});


module.exports = app;
