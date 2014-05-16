var User = require('../models/user');

exports.list = function(req, res) {

	var query = User
		.find({});

	if(req.query.username) {
		query.where('username', new RegExp(req.query.username, "i"));
	}

	if(req.query.name) {
		query.where('name', new RegExp(req.query.name, "i"));
	}

	if(req.query.surname) {
		query.where('surname', new RegExp(req.query.surname, "i"));
	}

	if(req.query.sort) {

		var sort = {};
		sort[req.query.sort] = req.query.sortDirection || 'asc';
		query.sort(sort);
	}

	query.exec(function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
  	res.send(docs);
	});
};


exports.retrieve = function(req, res) {

	var id = req.params.id;

	User.findById(id, function(err, doc) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!doc) {
			res.statusCode = 404;
			return res.send('User not found.');
		}
  	res.send(doc);
	});
};


exports.create = function(req, res) {

	// The username field is mandatory.
	//
	if(!req.body.username) {
		res.statusCode = 400;
		return res.send('Missing username in request.');
	}

	// Check if the user is already present.
	//
	User.findOne({username: req.body.username}, function(err, result) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(result) {
			res.statusCode = 409;
			return res.send('User already present.');
		}

		// Prepare user object to insert in the DB.
		//
		var now = new Date();
		var user = new User({
			username: req.body.username,
			name: req.body.name,
			surname: req.body.surname,
			createdOn: now,
			updatedOn: now
		});

		// Insert the user in the db collection.
		//
		user.save(function(err, user) {
			if(err) {
				res.statusCode = 500;
				return res.send(err);
			}
			
			return res.send(user);
		});

	});
};


exports.update = function(req, res) {

	var id = req.params.id;

	// Retrieve the specified user using the provided id.
	//
	User.findById(id, function(err, user) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(!user) {
			res.statusCode = 404;
			return res.send('User not found.');
		}

		// Prepare user object for database update.
		//
		user.username = req.body.username ? req.body.username : user.username;
		user.name = req.body.name ? req.body.name : user.name;
		user.surname = req.body.surname ? req.body.surname : user.surname;
		user.updatedOn = new Date();

		// Update the user in the db collection.
		//
		user.save(function(err, user) {
			if(err) {
				res.statusCode = 500;
				return res.send(err);
			}

			return res.send(user);
		});

	});
};


exports.delete = function(req, res) {

	var id = req.params.id;

	// Remove the user from the database.
	//
	User.findByIdAndRemove(id, function(err, result) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(!result) {
			res.statusCode = 404;
			return res.send('User not found.');
		}

		return res.send('User removed.');
	});
};
