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
	'backbone',

	'jquery-ui'
],
function ($, _, Backbone) {

	var application;

	// Customize underscore's templates to mimic mustache style
	// field replacing.
	//
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};


	// Set up the application namespace.
	//
	application = {};


	$(document).ready(function() {

		require([
			'utils/view-manager',
			'views/header/header',
			'views/footer/footer',
			'routers/home'
		], 
		function(ViewManager, HeaderView, FooterView, HomeRouter) {

			// Create the view manager.
			//
			application.viewManager = new ViewManager();

			// Set up header view. It will stay there for the whole application
			// lifetime.
			//
			var headerView = new HeaderView();
			$("#header").append(headerView.render().el);
			application.viewManager.setView(header, headerView);

			// Set up footer view. It will stay there for the whole application
			// lifetime.
			//
			var footerView = new FooterView();
			$("#footer").append(footerView.render().el);
			application.viewManager.setView(footer, footerView);


			var homeRouter = new HomeRouter();

			Backbone.history.start({ pushState: true});
			homeRouter.navigate('login', true);
		});
	});
});
