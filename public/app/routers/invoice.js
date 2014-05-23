define([
	'jquery',
	'underscore',
	'backbone',
	'views/invoice/search',
	'views/invoice/detail',
	'models/invoice',
	'utils/view-manager'
],
function ($, _, Backbone, SearchInvoiceView, DetailInvoiceView, InvoiceModel, viewManager) {
	
	var InvoiceRouter = Backbone.Router.extend({

		routes: {
			'invoices': 'invoices',
			'newInvoice': 'newInvoice',
			'invoice/:id': 'invoice'
		},

		invoices: function() {

			var searchInvoiceView = new SearchInvoiceView();
			viewManager.setView('#main-content', searchInvoiceView);
		},

		newInvoice: function() {

			var model = new InvoiceModel();
			var detailInvoiceView = new DetailInvoiceView({ model: model });
			viewManager.setView('#main-content', detailInvoiceView);
		},

		invoice: function(id) {

			var model = new InvoiceModel({ _id: id });
			model.fetch();
			var detailInvoiceView = new DetailInvoiceView({ model: model });
			viewManager.setView('#main-content', detailInvoiceView);
		}
	});

	return InvoiceRouter;
});
