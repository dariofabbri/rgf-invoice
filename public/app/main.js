require.config({
	baseUrl: 'app',
	paths: {
		jquery: 				'../libs/jquery',
		'jquery-ui':		'../libs/jquery-ui',
		'datatables': 	'../libs/jquery.dataTables',
		'jqgrid':				'../libs/jquery.jqGrid.src',
		'jqgrid-it':		'../libs/grid.locale-it',
		underscore: 		'../libs/underscore',
		backbone: 			'../libs/backbone',
		text: 					'../libs/text'
	},
	shim: {
		backbone: {
			exports: 'Backbone',
			deps: ['underscore', 'jquery']
		},

		'jquery-ui': {
			deps: ['jquery']
		},

		'jquery-dataTables': {
			deps: ['jquery']
		},

		'jqgrid': {
			deps: ['jquery', 'jqgrid-it']
		}
	}
});

requirejs([
	'jquery',
	'underscore',
	'backbone',
	'models/login-info',

	'jquery-ui',
	'datatables',
	'jqgrid'
],
function ($, _, Backbone, loginInfo) {

	// Customize underscore's templates to mimic mustache style
	// field replacing.
	//
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};


	// Customize Backbone.sync function.
	//
	var backboneSync = Backbone.sync;
	Backbone.sync = function(method, model, options) {

		options.headers = _.extend(options.headers || {}, {
			'Authorization': loginInfo.getAuthorization()
		});

		options.error = function(jqxhr, status, error) {
			$('<div>Il server ha risposto con un errore.<br><b>' + error + '</b><br>' + jqxhr.responseText + '</div>').dialog({
				modal: true
			});
		}

		backboneSync(method, model, options);
	}


	$(document).ready(function() {

		require([
			'utils/view-manager',
			'views/header/header',
			'views/footer/footer',
			'routers/home',
			'routers/user',
			'routers/contact',
			'routers/invoice'
		], 
		function(viewManager, HeaderView, FooterView, HomeRouter, UserRouter, ContactRouter, InvoiceRouter) {

			// Set up header view. It will stay there for the whole application
			// lifetime.
			//
			var headerView = new HeaderView();
			viewManager.setView('#header', headerView, false);

			// Set up footer view. It will stay there for the whole application
			// lifetime.
			//
			var footerView = new FooterView();
			viewManager.setView('#footer', footerView, false);


			// Register application routers.
			//
			var homeRouter = new HomeRouter();
			var userRouter = new UserRouter();
			var contactRouter = new ContactRouter();
			var invoiceRouter = new InvoiceRouter();

			// Kick off the application.
			//
			Backbone.history.start({ pushState: true });
			Backbone.history.navigate('login', true);
		});
	});
});
