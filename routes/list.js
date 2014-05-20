var Contact = require('../models/contact');

exports.listNames = function(req, res) {

	var query = Contact.distinct('firstName', {firstName : { $ne: '' }});

	query.exec(function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		var response = [];
		for(var i = 0; i < docs.length; ++i) {
			response.push({description: docs[i]});
		}
  	res.send(response);
	});
};


exports.listSalutations = function(req, res) {

	var query = Contact.distinct('salutation', {salutation : { $ne: '' }});

	query.exec(function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		var response = [];
		for(var i = 0; i < docs.length; ++i) {
			response.push({description: docs[i]});
		}
  	res.send(response);
	});
};


exports.listCities = function(req, res) {

	var query = Contact.distinct('city', {city : { $ne: '' }});

	query.exec(function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		var response = [];
		for(var i = 0; i < docs.length; ++i) {
			response.push({description: docs[i]});
		}
  	res.send(response);
	});
};


exports.listCounties = function(req, res) {

	var query = Contact.distinct('county', {county : { $ne: '' }});

	query.exec(function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		var response = [];
		for(var i = 0; i < docs.length; ++i) {
			response.push({description: docs[i]});
		}
  	res.send(response);
	});
};


exports.listCountries = function(req, res) {

	var query = Contact.distinct('country', {country : { $ne: '' }});

	query.exec(function(err, docs) {
		if(err) {
			res.statusCode = 500;
			return res.send(err);
		}

		var response = [];
		for(var i = 0; i < docs.length; ++i) {
			response.push({description: docs[i]});
		}
  	res.send(response);
	});
};
