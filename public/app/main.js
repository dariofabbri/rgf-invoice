require.config({
	baseUrl: 'app',
	paths: {
		jquery: '../libs/jquery',
		'jquery-ui': '../libs/jquery-ui',
		underscore: '../libs/underscore',
		backbone: '../libs/backbone',
		text: '../libs/text'
	},
	shim: {
		backbone: {
			exports: 'Backbone',
			deps: ['underscore', 'jquery']
		},

		'jquery-ui': {
			deps: ['jquery']
		}
	}
});

requirejs([
	'jquery',
	'underscore',
	'views/login/loginview',

	'jquery-ui'
],
function ($, _, LoginView) {

	$(document).ready(function() {

		_.templateSettings = {
			interpolate: /\{\{(.+?)\}\}/g
		};

		var loginView = new LoginView();
		$(document.body).append(loginView.render().el);
	});
});
