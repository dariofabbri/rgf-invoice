define([
	'jquery',
	'underscore',
	'backbone'
],
function ($, _, Backbone) {
	var User = Backbone.Model.extend({
		idAttribute: '_id',

		defaults: {
			username: '',
			name: '',
			surname: ''
		},

		urlRoot: '/users'
	});
	return User;
});
