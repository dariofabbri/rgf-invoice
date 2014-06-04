require.config({
	baseUrl: 'app',
	paths: {
		jquery: 				'../libs/jquery',
		'jquery-ui':		'../libs/jquery-ui',
		'datatables': 	'../libs/jquery.dataTables',
		underscore: 		'../libs/underscore',
		backbone: 			'../libs/backbone',
		text: 					'../libs/text',
		big:						'../libs/big',
		moment:					'../libs/moment-with-langs'
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
	},
	noGlobal: true
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

	// Add regional info for jQueryUI date picker.
	//
	$.datepicker.regional['it'] = {
		closeText: 'Chiudi',
		prevText: '&#x3c;Prec',
		nextText: 'Succ&#x3e;',
		currentText: 'Oggi',
		monthNames: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
			'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
		monthNamesShort: ['Gen','Feb','Mar','Apr','Mag','Giu',
			'Lug','Ago','Set','Ott','Nov','Dic'],
		dayNames: ['Domenica','Luned&#236','Marted&#236','Mercoled&#236','Gioved&#236','Venerd&#236','Sabato'],
		dayNamesShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
		dayNamesMin: ['Do','Lu','Ma','Me','Gi','Ve','Sa'],
		weekHeader: 'Sm',
		dateFormat: 'dd/mm/yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''
	};
	$.datepicker.setDefaults($.datepicker.regional['it']);


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
