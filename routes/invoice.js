var _ = require('underscore');
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

	var date = moment(req.query.date, 'D-M-YYYY');
	if(date.isValid()) {
		listQuery.where('date', date.toDate());
		countQuery.where('date', date.toDate());
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
	Invoice.findOne({ number: req.body.number, type: req.body.type }, function(err, result) {
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

	// Retrieve the specified invoice using the provided id.
	//
	Invoice.findById(id, function(err, invoice) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(!invoice) {
			res.statusCode = 404;
			return res.send('Invoice not found.');
		}

		// Prepare invoice object for database update.
		//
		_.extend(invoice, req.body);
		invoice.updatedOn = new Date();
		invoice.updatedBy = req.user.username;

		// Update the invoice in the db collection.
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


exports.delete = function(req, res) {

	var id = req.params.id;

	// Remove the invoice from the database.
	//
	Invoice.findByIdAndRemove(id, function(err, result) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		if(!result) {
			res.statusCode = 404;
			return res.send('Invoice not found.');
		}

		return res.send('Invoice removed.');
	});
};


exports.generateNextNumber = function(req, res) {

	var type = req.params.type;

	Invoice.findOne({type: type}, 'number', {limit: 1, sort: { number: -1 }}, function(err, doc) {
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

		_.extend(doc, {
			layout: 'print',
			sameCfAndVat: doc.issuer.cfCode && doc.issuer.vatCode && doc.issuer.cfCode === doc.issuer.vatCode,
			hasReaCodeAndStock: doc.issuer.reaCode && doc.issuer.stock,
			isInvoice: doc.type === 'I',
			isCreditNote: doc.type === 'C',
			formattedDate: moment(doc.date).format('DD/MM/YYYY'),
			formattedReceiptDate: doc.receipt && doc.receipt.date ? moment(doc.receipt.date).format('DD/MM/YYYY') : null
		});

  	res.render('invoice', doc);
	});
};
