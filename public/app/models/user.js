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
			surname: '',
			createdBy: null,
			createdOn: null,
			updatedBy: null,
			updatedOn: null
		},

		validate: function(attributes, options) {

			errors = {};

			// Username must be present.
			//
			if (this.get('username').trim().length === 0) {
				errors['username'] = 'Il campo username è obbligatorio';
			}

			// Password and confirm password must come together or none at all.
			//
			if (this.get('password').trim().length > 0 && this.get('confirmPassword').trim().length === 0) {
				errors['confirmPassword'] = 'E\' obbligatorio confermare la password';
			}
			if (this.get('password').trim().length === 0 && this.get('confirmPassword').trim().length > 0) {
				errors['confirmPassword'] = 'Non è possibile confermare la password senza prima averne immessa una.';
			}
			if (this.get('password').trim().length > 0 && this.get('confirmPassword').trim().length > 0 && this.get('password') !== this.get('confirmPassword')) {
				errors['confirmPassword'] = 'La password immessa non coincide con quella di conferma.';
			}

			if(!_.isEmpty(errors)) {
				return errors;
			}
		},

		urlRoot: '/users'
	});
	return User;
});
