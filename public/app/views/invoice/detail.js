define([
	'jquery',
	'underscore',
	'backbone',
	'moment',
	'models/contact',
	'views/form/form',
	'views/invoice/contact-picker',
	'views/invoice/detail-rows',
	'collections/cities',
	'collections/counties',
	'text!templates/invoice/detail.html'
],
function ($, _, Backbone, moment, ContactModel, FormView, ContactPickerView, DetailRowsView, cities, counties, detailHtml) {
	
	var DetailView = FormView.extend({

		template: _.template(detailHtml),

		events: {
			'click #selectAddressee': 'onClickSelectAddressee',
			'click #back': 'onClickBack',
			'click #save': 'onClickSave'
		},

		initialize: function() {

			Backbone.on('invoice:contactpickerselect', this.onContactPickerSelect, this);
			Backbone.on('invoice:totalschanged', this.onTotalsChanged, this);
		},

		render: function () {

			var html = this.template(this.model.toJSON());
			this.$el.html(html);

			// Set up form buttons.
			//
			this.$('#selectAddressee').button();
			this.$('#save').button();
			this.$('#back').button();

			// Set up date picker fields.
			//
			this.$('#date, #receiptDate').datepicker({
				showOtherMonths: true,
				selectOtherMonths: true,
				showOn: 'both',
				buttonImage: 'assets/images/calendar.gif',
				buttonImageOnly: true
			});
			this.$('#date').datepicker($.datepicker.regional['it']);

			// Set up autocomplete fields.
			//
			this.$('#issuerCity').autocomplete({
				source: function(request, response) {
					response(cities.list(request.term));
				}
			});
			this.$('#issuerCounty').autocomplete({
				source: function(request, response) {
					response(counties.list(request.term));
				}
			});

			// Set up the accordions.
			//
			this.$('#accordion-header').accordion({collapsible: true, heightStyle: 'content', active: 0});
			this.$('#accordion-issuer').accordion({collapsible: true, heightStyle: 'content', active: false});
			this.$('#accordion-addressee').accordion({collapsible: true, heightStyle: 'content', active: 0});
			this.$('#accordion-receipt').accordion({collapsible: true, heightStyle: 'content', active: 0});
			this.$('#accordion-detail').accordion({collapsible: true, heightStyle: 'content', active: 0});
			this.$('#accordion-totals').accordion({collapsible: true, heightStyle: 'content', active: 0});

			// Set focus on the first form field.
			//
			_.defer(function () {
				this.$('#number').focus();
			});

			// Create the contact picker subview.
			//
			var contactPicker = new ContactPickerView();
			this.addSubview(contactPicker);
			contactPicker.render();

			// Create the invoice detail subview.
			//
			var detailRows = new DetailRowsView({
				model: this.model,
				el: this.$('#invoice-rows')
			});
			this.addSubview(detailRows)
			detailRows.render();
			return this;
		},

		onRemove: function() {

			// Unregister event handlers.
			//
			Backbone.off('invoice:contactpickerselect', this.onContactPickerSelect, this);
			Backbone.off('invoice:totalschanged', this.onTotalsChanged, this);

			this.$('#selectAddressee').button('destroy');
			this.$('#save').button('destroy');
			this.$('#back').button('destroy');

			this.$('#date').datepicker('destroy');

			this.$('#issuerCity').autocomplete('destroy');
			this.$('#issuerCounty').autocomplete('destroy');

			this.$('#accordion-header').accordion('destroy');
			this.$('#accordion-issuer').accordion('destroy');
			this.$('#accordion-addressee').accordion('destroy');
			this.$('#accordion-receipt').accordion('destroy');
			this.$('#accordion-detail').accordion('destroy');
			this.$('#accordion-totals').accordion('destroy');
		},

		onClickSelectAddressee: function() {

			Backbone.trigger('invoice:opencontactpicker');
		},

		onClickBack: function() {

			Backbone.history.navigate('invoices', true);
		},

		onClickSave: function() {

			this.formToModel();

			var valid = this.model.save({}, {
				success: function() {

					// Put out a message box for confirmation.
					//
					$('<div>Le modifiche sono state applicate con successo.</div>').dialog({
						title: 'Dettaglio contatto',
						modal: true,
						buttons: [
							{
								text: 'OK',
								click: function() {
									$(this).dialog("close");
								}
							}
						]
					}).on('dialogclose', function() {

						// Get back to the search panel.
						//
						Backbone.history.navigate('contacts', true);
					});
				}
			});

			// Manage model validation error.
			//
			this.resetFieldErrors();
			if(!valid) {
				this.setFormErrors(this.model.validationError);
			}
		},

		onContactPickerSelect: function(id) {

			var that = this;

			// Fetch the selected contact.
			//
			var contact = new ContactModel({ _id: id});
			contact.fetch({
				success: function() {

					// Update the model.
					//
					addressee = {
						idContact: id,
						description: contact.get('description') || (contact.get('firstName') + ' ' + contact.get('lastName')),
						address1: contact.get('address1'),
						address2: contact.get('address2'),
						zipCode: contact.get('zipCode'),
						city: contact.get('city'),
						county: contact.get('county'),
						cfCode: contact.get('cfCode'),
						vatCode: contact.get('vatCode')
					};

					that.model.set('addressee', addressee);
					that.modelToForm();
				}
			})
		},

		onTotalsChanged: function(totals) {

			this.$('#totalsTaxable').val(totals.taxable);
			this.$('#totalsTax').val(totals.tax);
			this.$('#totalsTotal').val(totals.total);
		},

		formToModel: function() {

			this.model.set('number', this.$('#number').val());
			this.model.set('date', this.$('#date').val() ? moment(this.$('#date').val(), 'DD/MM/YYYY').toDate() : null);

			var issuer = {};
			issuer.description = this.$('#issuerDescription').val();
			issuer.address = this.$('#issuerAddress').val();
			issuer.city = this.$('#issuerCity').val();
			issuer.county = this.$('#issuerCounty').val();
			issuer.zipCode = this.$('#issuerZipCode').val();
			issuer.vatCode = this.$('#issuerVatCode').val();
			issuer.cfCode = this.$('#issuerCfCode').val();
			issuer.reaCode = this.$('#issuerReaCode').val();
			issuer.stock = this.$('#issuerStock').val();
			this.model.set('issuer', issuer);

			var addressee = {};
			addressee.description = this.$('#addresseeDescription').val();
			addressee.address1 = this.$('#addresseeAddress1').val();
			addressee.address2 = this.$('#addresseeAddress2').val();
			addressee.city = this.$('#addresseeCity').val();
			addressee.county = this.$('#addresseeCounty').val();
			addressee.zipCode = this.$('#addresseeZipCode').val();
			addressee.vatCode = this.$('#addresseeVatCode').val();
			addressee.cfCode = this.$('#addresseeCfCode').val();
			this.model.set('addressee', addressee);

			var receipt = { cashRegister: {} };
			receipt.number = this.$('#receiptNumber').val();
			receipt.date = this.$('#receiptDate').val() ? moment(this.$('#receiptDate').val(), 'DD/MM/YYYY').toDate() : null;
			receipt.cashRegister.model = this.$('#cashRegisterModel').val();
			receipt.cashRegister.serial = this.$('#cashRegisterSerial').val();
			this.model.set('receipt', receipt);

			var totals = {};
			totals.taxable = this.$('#totalsTaxable').val();
			totals.tax = this.$('#totalsTax').val();
			totals.total = this.$('#totalsTotal').val();
			this.model.set('totals', totals);
		},

		modelToForm: function() {
			this.$('#issuerDescription').val(this.model.get('issuer').description);
			this.$('#issuerAddress').val(this.model.get('issuer').address);
			this.$('#issuerCity').val(this.model.get('issuer').city);
			this.$('#issuerCounty').val(this.model.get('issuer').county);
			this.$('#issuerZipCode').val(this.model.get('issuer').zipCode);
			this.$('#issuerVatCode').val(this.model.get('issuer').vatCode);
			this.$('#issuerCfCode').val(this.model.get('issuer').cfCode);
			this.$('#issuerReaCode').val(this.model.get('issuer').reaCode);
			this.$('#issuerStock').val(this.model.get('issuer').stock);

			this.$('#addresseeDescription').val(this.model.get('addressee').description);
			this.$('#addresseeAddress1').val(this.model.get('addressee').address1);
			this.$('#addresseeAddress2').val(this.model.get('addressee').address2);
			this.$('#addresseeCity').val(this.model.get('addressee').city);
			this.$('#addresseeCounty').val(this.model.get('addressee').county);
			this.$('#addresseeZipCode').val(this.model.get('addressee').zipCode);
			this.$('#addresseeVatCode').val(this.model.get('addressee').vatCode);
			this.$('#addresseeCfCode').val(this.model.get('addressee').cfCode);
		},

		// Clear previous validation errors from form fields.
		//
		resetFieldErrors: function () {

			this.resetFieldError('#number');
			this.resetFieldError('#date');

			this.resetFieldError('#issuerDescription');
			this.resetFieldError('#issuerAddress');
			this.resetFieldError('#issuerCity');
			this.resetFieldError('#issuerCounty');
			this.resetFieldError('#issuerZipCode');
			this.resetFieldError('#issuerVatCode');
			this.resetFieldError('#issuerCfCode');
			this.resetFieldError('#issuerReaCode');
			this.resetFieldError('#issuerStock');

			this.resetFieldError('#addresseeDescription');
			this.resetFieldError('#addresseeAddress1');
			this.resetFieldError('#addresseeAddress2');
			this.resetFieldError('#addresseeCity');
			this.resetFieldError('#addresseeCounty');
			this.resetFieldError('#addresseeZipCode');
			this.resetFieldError('#addresseeVatCode');
			this.resetFieldError('#addresseeCfCode');

			this.resetFieldError('#receiptNumber');
			this.resetFieldError('#receiptDate');
			this.resetFieldError('#cashRegisterModel');
			this.resetFieldError('#cashRegisterSerial');

			this.resetFieldError('#totalsTaxable');
			this.resetFieldError('#totalsTax');
			this.resetFieldError('#totalsTotal');
		}
	});

	return DetailView;
});
