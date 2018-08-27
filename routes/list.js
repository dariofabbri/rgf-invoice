var Contact = require('../models/contact');

function processResponse(res, err, docs) {
	if(err) {
		res.statusCode = 500;
		return res.send(err);
	}

	var response = docs.map(doc => {
			return { description: doc}
		});
	res.send(response);
}

exports.listNames = function(req, res) {

	var query = Contact.distinct('firstName', {firstName : { $ne: '' }});
	query.exec((err, docs) => processResponse(res, err, docs));
};


exports.listSalutations = function(req, res) {

	var query = Contact.distinct('salutation', {salutation : { $ne: '' }});
	query.exec((err, docs) => processResponse(res, err, docs));
};


exports.listCities = function(req, res) {

	var query = Contact.distinct('city', {city : { $ne: '' }});
	query.exec((err, docs) => processResponse(res, err, docs));
};


exports.listCounties = function(req, res) {

	var query = Contact.distinct('county', {county : { $ne: '' }});
	query.exec((err, docs) => processResponse(res, err, docs));
};


exports.listCountries = function(req, res) {

	var query = Contact.distinct('country', {country : { $ne: '' }});
	query.exec((err, docs) => processResponse(res, err, docs));
};