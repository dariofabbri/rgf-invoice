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
