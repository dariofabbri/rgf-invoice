var moment = require('moment');
var mongoose = require('mongoose');
var Company = require('../models/company');


exports.retrieveDefault = function(req, res) {

	var id = req.params.id;

	Company.find({isDefault: true}, function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}
		if(!docs || docs.length == 0) {
			res.statusCode = 404;
			return res.send('Default company not found.');
		}
		if(docs.length > 1) {
			res.statusCode = 500;
			return res.send('Data error: too many default companies found.');
		}
  	res.send(docs[0]);
	});
};
