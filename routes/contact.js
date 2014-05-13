var moment = require('moment');
var mongoose = require('mongoose');
var Contact = require('../models/contact');

exports.list = function(req, res) {

	var query = Observation
		.find({})
		.sort('lastName');

	/*
	if(req.query.startDate) {
		var startDate = moment(req.query.startDate);
		if(!startDate.isValid()) {
			res.statusCode = 400;
			return res.send('Invalid startDate query parameter.');
		}
		query.where('observationDate').gte(startDate.toDate());
	}

	if(req.query.endDate) {
		var endDate = moment(req.query.endDate);
		if(!endDate.isValid()) {
			res.statusCode = 400;
			return res.send('Invalid endDate query parameter.');
		}
		query.where('observationDate').lte(endDate.toDate());
	}
	*/

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

	var query = Observation
		.findOne({_id: new mongoose.Types.ObjectId(id)});

	query.exec(function(err, doc) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!doc) {
			res.statusCode = 404;
			return res.send('Contact not found.');
		}
  	res.send(doc);
	});
};


exports.create = function(req, res) {

	// The weight field is mandatory.
	//
	if(!req.body.weight) {
		res.statusCode = 400;
		return res.send('Missing weight in request.');
	}

	// The observation date field is mandatory.
	//
	if(!req.body.observationDate) {
		res.statusCode = 400;
		return res.send('Missing observationDate in request.');
	}
	var observationDate = moment(req.body.observationDate);
	if(!observationDate.isValid()) {
		res.statusCode = 400;
		return res.send('Invalid observationDate in request.');
	}
	observationDate = observationDate.startOf('day');

	var userid = req.params.userid;

	User.findById(userid, function(err, doc) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!doc) {
			res.statusCode = 404;
			return res.send('User not found.');
		}


		// Prepare obervation object to insert in the DB.
		//
		var now = new Date();
		var observation = new Observation({
			userId: userid,
			weight: req.body.weight,
			observationDate: observationDate.toDate(),
			createdOn: now,
			updatedOn: now
		});

		// Insert the observation in the db collection.
		//
		observation.save(function(err, observation) {
			if(err) {
				res.statusCode = 500;
				return res.send(err);
			}
			
			return res.send(observation);
		});
	});
};


exports.update = function(req, res) {

	var userid = req.params.userid;
	var id = req.params.id;

	var query = Observation
		.findOne({userId: new mongoose.Types.ObjectId(userid), _id: new mongoose.Types.ObjectId(id)});

	query.exec(function(err, observation) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!observation) {
			res.statusCode = 404;
			return res.send('Observation not found.');
		}

		// Prepare observation object for database update.
		//
		observation.weight = req.body.weight ? req.body.weight : observation.weight;
		observation.updatedOn = new Date();

		// Update the observation in the db collection.
		//
		observation.save(function(err, observation) {
			if(err) {
				res.statusCode = 500;
				return res.send(err);
			}

			return res.send(observation);
		});

	});
};


exports.delete = function(req, res) {

	var userid = req.params.userid;
	var id = req.params.id;

	var query = Observation
		.findOneAndRemove({userId: new mongoose.Types.ObjectId(userid), _id: new mongoose.Types.ObjectId(id)});

	query.exec(function(err, doc) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!doc) {
			res.statusCode = 404;
			return res.send('Observation not found.');
		}
  	res.send('Observation removed');
	});
};
