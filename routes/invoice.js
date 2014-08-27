var moment = require('moment');
var mongoose = require('mongoose');
var Invoice = require('../models/invoice');


exports.list = function(req, res) {

	var response = {};
	var listQuery = Invoice.find({});
	var countQuery = Invoice.count({});

	if(req.query.type) {
		listQuery.where('type', req.query.type);
		countQuery.where('type', req.query.type);
	}

	if(req.query.vatCode) {
		listQuery.where('addressee.vatCode', new RegExp(req.query.vatCode, "i"));
		countQuery.where('addressee.vatCode', new RegExp(req.query.vatCode, "i"));
	}

	if(req.query.cfCode) {
		listQuery.where('addressee.cfCode', new RegExp(req.query.cfCode, "i"));
		countQuery.where('addressee.cfCode', new RegExp(req.query.cfCode, "i"));
	}

	if(req.query.description) {
		listQuery.where('addressee.description', new RegExp(req.query.description, "i"));
		countQuery.where('addressee.description', new RegExp(req.query.description, "i"));
	}

	if(req.query.number) {
		listQuery.where('number', parseInt(req.query.number, 10));
		countQuery.where('number', parseInt(req.query.number, 10));
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

	Invoice.findById(id, function(err, doc) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!doc) {
			res.statusCode = 404;
			return res.send('Invoice not found.');
		}
  	res.send(doc);
	});
};


exports.create = function(req, res) {

	// TODO: Add some server side validation code.
	//

	// Check if the invoice is already present.
	//
	Invoice.findOne({ number: req.body.number }, function(err, result) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(result) {
			res.statusCode = 409;
			return res.send('Invoice already present.');
		}

		// Prepare invoice object to be inserted in the DB.
		//
		var now = new Date();
		var invoice = new Invoice(req.body);
		invoice.set('createdOn', now);
		invoice.set('createdBy', req.user.username);
		invoice.set('updatedOn', now);
		invoice.set('updatedBy', req.user.username);

		// Insert the invoice in the db collection.
		//
		invoice.save(function(err, invoice) {
			if(err) {
				res.statusCode = 500;
				return res.send(err);
			}
			
			return res.send(invoice);
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
		contact.isCompany = req.body.isCompany ? req.body.isCompany : contact.isCompany;
		contact.vatCode = req.body.vatCode ? req.body.vatCode : contact.vatCode;
		contact.cfCode = req.body.cfCode ? req.body.cfCode : contact.cfCode;
		contact.description = req.body.description ? req.body.description : contact.description;
		contact.salutation = req.body.salutation ? req.body.salutation : contact.salutation;
		contact.firstName = req.body.firstName ? req.body.firstName : contact.firstName;
		contact.lastName = req.body.lastName ? req.body.lastName : contact.lastName;
		contact.address1 = req.body.address1 ? req.body.address1 : contact.address1;
		contact.address2 = req.body.address2 ? req.body.address2 : contact.address2;
		contact.city = req.body.city ? req.body.city : contact.city;
		contact.county = req.body.county ? req.body.county : contact.county;
		contact.zipCode = req.body.zipCode ? req.body.zipCode : contact.zipCode;
		contact.country = req.body.country ? req.body.country : contact.country;
		contact.phone = req.body.phone ? req.body.phone : contact.phone;
		contact.fax = req.body.fax ? req.body.fax : contact.fax;
		contact.email = req.body.email ? req.body.email : contact.email;
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


exports.generateNextNumber = function(req, res) {

	Invoice.findOne({}, 'number', {limit: 1, sort: { number: -1 }}, function(err, doc) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!doc) {
			
			// Generate first from current year.
			//
			var now = new Date();
			var year = '' + now.getFullYear();
			var number = parseInt(year.slice(0, 1) + year.slice(2, 4) + '001');
			res.send({ number: number });

		} else {

			// Generate next.
			//
			res.send({ number: doc.number + 1 });
		}
	});

};


exports.print = function(req, res) {

	var id = req.params.id;

	Invoice.findById(id, function(err, doc) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!doc) {
			res.statusCode = 404;
			return res.send('Invoice not found.');
		}

		doc.layout = 'print';
  	res.render('invoice', doc);
	});
};
