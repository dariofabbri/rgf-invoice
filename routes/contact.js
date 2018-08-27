var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');
var Contact = require('../models/contact');


exports.list = function(req, res) {

	var response = {};
	var listQuery = Contact.find({});
	var countQuery = Contact.count({});

	if(req.query.vatCode) {
		listQuery.where('vatCode', new RegExp(req.query.vatCode, "i"));
		countQuery.where('vatCode', new RegExp(req.query.vatCode, "i"));
	}

	if(req.query.cfCode) {
		listQuery.where('cfCode', new RegExp(req.query.cfCode, "i"));
		countQuery.where('cfCode', new RegExp(req.query.cfCode, "i"));
	}

	if(req.query.description) {
		listQuery.where('description', new RegExp(req.query.description, "i"));
		countQuery.where('description', new RegExp(req.query.description, "i"));
	}

	if(req.query.firstName) {
		listQuery.where('firstName', new RegExp(req.query.firstName, "i"));
		countQuery.where('firstName', new RegExp(req.query.firstName, "i"));
	}

	if(req.query.lastName) {
		listQuery.where('lastName', new RegExp(req.query.lastName, "i"));
		countQuery.where('lastName', new RegExp(req.query.lastName, "i"));
	}
	
	// Count the filtered results.
	//
	countQuery.countDocuments(function(err, count) {
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
		listQuery.limit(parseInt(req.query._length, 10));
	}

	if(req.query._start) {
		listQuery.skip(parseInt(req.query._start, 10));
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

	Contact.findById(id, function(err, doc) {
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

	// The isCompany flag is mandatory.
	//
	if(req.body.isCompany === undefined) {
		res.statusCode = 400;
		return res.send('Missing isCompany flag in request.');
	}
	
	// If the contact is a company, the VAT code is mandatory.
	//
	if(req.body.isCompany && !req.body.vatCode) {
		res.statusCode = 400;
		return res.send('Missing vatCode in request with isCompany flag set.');
	}
	
	// If the contact is not a company, the CF code is mandatory.
	//
	if(!req.body.isCompany && !req.body.cfCode) {
		res.statusCode = 400;
		return res.send('Missing cfCode in request with isCompany flag unset.');
	}

	// Check if the contact is already present.
	//
	var clause = {};
	if(req.body.isCompany) {
		clause.isCompany = true;
		clause.vatCode = req.body.vatCode;
	} else {
		clause.isCompany = false;
		clause.cfCode = req.body.cfCode;
	}
	Contact.findOne(clause, function(err, result) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(result) {
			res.statusCode = 409;
			return res.send('Contact already present.');
		}

		// Prepare contact object to be inserted in the DB.
		//
		var now = new Date();
		var contact = new Contact(_.pick(req.body, 
					'isCompany', 
					'vatCode', 
					'isCompany',
					'vatCode',
					'cfCode',
					'description',
					'salutation',
					'firstName',
					'lastName',
					'address1',
					'address2',
					'city',
					'county',
					'zipCode',
					'country',
					'phone',
					'fax',
					'email'));
		contact.set('createdOn', now);
		contact.set('createdBy', req.user.username);
		contact.set('updatedOn', now);
		contact.set('updatedBy', req.user.username);

		// Insert the contact in the db collection.
		//
		contact.save(function(err, contact) {
			if(err) {
				res.statusCode = 500;
				return res.send(err);
			}
			
			return res.send(contact);
		});

	});
};


exports.update = function(req, res) {

	var id = req.params.id;

	// Retrieve the specified contact using the provided id.
	//
	Contact.findById(id, function(err, contact) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(!contact) {
			res.statusCode = 404;
			return res.send('Contact not found.');
		}

		// Prepare contact object for database update.
		//
		_.extend(contact, req.body);
		contact.updatedOn = new Date();
		contact.updatedBy = req.user.username;

		// Update the contact in the db collection.
		//
		contact.save(function(err, contact) {
			if(err) {
				res.statusCode = 500;
				return res.send(err);
			}

			return res.send(contact);
		});

	});
};


exports.delete = function(req, res) {

	var id = req.params.id;

	// Remove the contact from the database.
	//
	Contact.findByIdAndRemove(id, function(err, result) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(!result) {
			res.statusCode = 404;
			return res.send('Contact not found.');
		}

		return res.send('Contact removed.');
	});
};
