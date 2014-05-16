define([
	'jquery',
	'underscore',
	'backbone',
	'utils/base64',
],
function ($, _, Backbone, Base64) {
	var LoginInfo = Backbone.Model.extend({

		defaults: {
			loggedOn: false
		},

		doLogout: function() {

			this.set('loggedOn', false);
		},

		getAuthorization: function() {
			return 'Basic ' + Base64.encode(this.get('username') + ':' + this.get('password'));
		}

	});
	return new LoginInfo();
});
