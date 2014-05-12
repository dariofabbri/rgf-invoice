define([
	'jquery',
	'underscore',
	'backbone'
],
function ($, _, Backbone) {
	var LoginInfo = Backbone.Model.extend({

		defaults: {
			loggedOn: false
		},

		doLogout: function() {

			this.set('loggedOn', false);
		}

	});
	return new LoginInfo();
});
