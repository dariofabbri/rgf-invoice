define([
	'jquery',
	'underscore',
	'backbone',
	'moment',
	'views/invoice/search',
	'views/invoice/detail',
	'views/invoice/print',
	'models/company',
	'models/invoice',
	'utils/view-manager'
],
function ($, _, Backbone, moment, SearchInvoiceView, DetailInvoiceView, PrintInvoiceView, CompanyModel, InvoiceModel, viewManager) {
	
	var InvoiceRouter = Backbone.Router.extend({

		routes: {
			'invoices/:type': 'invoices',
			'newInvoice/:type': 'newInvoice',
			'invoice/:id': 'invoice'
		},

		invoices: function(type) {

			var searchInvoiceView = new SearchInvoiceView({type: type});
			viewManager.setView('#main-content', searchInvoiceView);
		},

		newInvoice: function(type) {

			// First fetch the default company's data.
			//
			var company = new CompanyModel({ _id: 'default' });
			company.fetch({

				success: function() {

					// The company model has been loaded, create the invoice model
					// and set the issuer's data.
					//
					var model = new InvoiceModel();
					model.set('type', type);
					model.setIssuer(company.toJSON());

					// Preset today's date.
					//
					var now = moment();
					model.set('date', now);
					var receipt = model.get('receipt');
					receipt.date = now;
					model.set('receipt', receipt);

					// Preset invoice number.
					//
					$.ajax('../invoices/nextNumber', { 
						dataType: 'json',
						type: 'POST',
						success: function(data) {
							model.set('number', data.number);

							// Create the detail view and show it.
							//
							var detailInvoiceView = new DetailInvoiceView({ model: model });
							viewManager.setView('#main-content', detailInvoiceView);
						}
					});
				}
			});
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
