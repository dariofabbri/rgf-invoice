var express = require('express');
var exphbs = require('express-handlebars');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var Big = require('big.js');
var BasicStrategy = require('passport-http').BasicStrategy;
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
mongoose.connect('mongodb://localhost/rgf', { useNewUrlParser: true });

var users = require('./routes/user');
var contacts = require('./routes/contact');
var invoices = require('./routes/invoice');
var companies = require('./routes/company');
var lists = require('./routes/list');

var app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());

// Set up templating engine.
//
app.engine('handlebars', exphbs({
	defaultLayout: 'main', 
	layoutsDir: __dirname + '/views/layouts',
	helpers: {
		formatBig: function(number, options) {
			number = number || '0';
			var b = new Big(number);
			var arr = b.toFixed(options.hash.dp || 2).split('.');
      arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, options.hash.ts == null ? '.' : options.hash.ts + '');
			return arr.join(options.hash.ds == null ? ',' : options.hash.ds + '');
		},
		formatBig4: function(number, options) {
			number = number || '0';
			var b = new Big(number);
			var arr = b.toFixed(options.hash.dp || 4).split('.');
      arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, options.hash.ts == null ? '.' : options.hash.ts + '');
			return arr.join(options.hash.ds == null ? ',' : options.hash.ds + '');
		}
	}
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Set up routing.
//
app.get('/login', passport.authenticate('basic', { session: false }), function(req, res) {
	res.send(req.user);
});

// User related routes.
//
app.get('/users', passport.authenticate('basic', { session: false }), users.list);
app.get('/users/:id', passport.authenticate('basic', { session: false }), users.retrieve);
app.post('/users', passport.authenticate('basic', { session: false }), users.create);
app.put('/users/:id', passport.authenticate('basic', { session: false }), users.update);
app.delete('/users/:id', passport.authenticate('basic', { session: false }), users.delete);

// Contact related routes.
//
app.get('/contacts', passport.authenticate('basic', { session: false }), contacts.list);
app.get('/contacts/:id', passport.authenticate('basic', { session: false }), contacts.retrieve);
app.post('/contacts', passport.authenticate('basic', { session: false }), contacts.create);
app.put('/contacts/:id', passport.authenticate('basic', { session: false }), contacts.update);
app.delete('/contacts/:id', passport.authenticate('basic', { session: false }), contacts.delete);

// Invoice related routes.
//
app.get('/invoices', passport.authenticate('basic', { session: false }), invoices.list);
app.get('/invoices/:id', passport.authenticate('basic', { session: false }), invoices.retrieve);
//app.get('/invoices/:id/print', passport.authenticate('basic', { session: false }), invoices.print);
app.get('/invoices/:id/print', invoices.print);
app.post('/invoices', passport.authenticate('basic', { session: false }), invoices.create);
app.put('/invoices/:id', passport.authenticate('basic', { session: false }), invoices.update);
app.delete('/invoices/:id', passport.authenticate('basic', { session: false }), invoices.delete);
app.post('/invoices/nextNumber/:type', passport.authenticate('basic', { session: false }), invoices.generateNextNumber);

// Companies related routes.
//
app.get('/companies/default', passport.authenticate('basic', { session: false }), companies.retrieveDefault);

// Lists for autocomplete related routes.
//
app.get('/lists/names', lists.listNames);
app.get('/lists/salutations', lists.listSalutations);
app.get('/lists/cities', lists.listCities);
app.get('/lists/counties', lists.listCounties);
app.get('/lists/countries', lists.listCountries);


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
