require.config({
	baseUrl: 'app',
	paths: {
		jquery: 				'../libs/jquery',
		'jquery-ui':		'../libs/jquery-ui',
		'datatables': 	'../libs/jquery.dataTables',
		underscore: 		'../libs/underscore',
		backbone: 			'../libs/backbone',
		text: 					'../libs/text',
		big:						'../libs/big'
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
		}
	}
});

requirejs([
	'jquery',
	'underscore',
	'backbone',
	'big',
	'models/login-info',

	'jquery-ui',
	'datatables'
],
function ($, _, Backbone, Big, loginInfo) {

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


	// Add format function to Big class.
	//
	Big.prototype.toFormat = function (ts, ds, dp) {
	    var arr = this.toFixed(dp || 2).split('.');
	    arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ts == null ? '.' : ts + '');
	
	    return arr.join(ds == null ? ',' : ds + '');
	};


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
