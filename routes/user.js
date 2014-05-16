var User = require('../models/user');

exports.list = function(req, res) {

	var response = {};
	var listQuery = User.find({});
	var countQuery = User.count({});

	if(req.query.username) {
		listQuery.where('username', new RegExp(req.query.username, "i"));
		countQuery.where('username', new RegExp(req.query.username, "i"));
	}

	if(req.query.name) {
		listQuery.where('name', new RegExp(req.query.name, "i"));
		countQuery.where('name', new RegExp(req.query.name, "i"));
	}

	if(req.query.surname) {
		listQuery.where('surname', new RegExp(req.query.surname, "i"));
		countQuery.where('surname', new RegExp(req.query.surname, "i"));
	}
	
	// Count the filtered results.
	//
	countQuery.count(function(err, count) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		response.total = count;
	});

	if(req.query._sort) {
		var sort = {};
		sort[req.query._sort] = req.query._sortDirection || 'asc';
		sort._id = 'asc'; // Stable sorting required for consistent pagination.
		listQuery.sort(sort);
	}

	if(req.query._length) {
		listQuery.limit(req.query._length);
	}

	if(req.query._start) {
		listQuery.skip(req.query._start);
	}

	listQuery.exec(function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		response.data = docs;
		response.length = docs.length;
  	res.send(response);
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
