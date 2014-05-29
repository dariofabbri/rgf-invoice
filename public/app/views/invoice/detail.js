define([
	'jquery',
	'underscore',
	'backbone',
	'models/contact',
	'views/form/form',
	'views/invoice/contact-picker',
	'collections/cities',
	'collections/counties',
	'text!templates/invoice/detail.html'
],
function ($, _, Backbone, ContactModel, FormView, ContactPickerView, cities, counties, detailHtml) {
	
	var DetailView = FormView.extend({

		template: _.template(detailHtml),

		events: {
			'click #rows tbody tr': 'onSelectRow',
			'click #selectAddressee': 'onClickSelectAddressee',
			'click #addRow': 'onClickAddRow',
			'click #moveUp': 'onClickMoveUp',
			'click #moveDown': 'onClickMoveDown',
			'click #back': 'onClickBack',
			'click #save': 'onClickSave'
		},

		initialize: function() {

			Backbone.on('invoice:contact-picker-select', this.onContactPickerSelect, this);
		},

		render: function () {

			var html = this.template(this.model.toJSON());
			this.$el.html(html);

			// Set up form buttons.
			//
			this.$('#selectAddressee').button();
			this.$('#addRow').button();
			this.$('#moveUp').button({ disabled: true });
			this.$('#moveDown').button({ disabled: true });
			this.$('#save').button();
			this.$('#back').button();

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
			this.$('#accordion-header').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-issuer').accordion({collapsible: true, heightStyle: 'content', active:  false});
			this.$('#accordion-addressee').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-receipt').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-detail').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-totals').accordion({collapsible: true, heightStyle: 'content', active:  0});

			// Configure detail data table.
			//
			var datatable = this.$('#rows').dataTable({
				serverSide: false,
				data: this.model.get('detail'),
				dom: 'tr',
				columns: [
					{
						name: 'position',
						data: 'position',
						orderable: false
					},
					{
						name: 'description',
						data: 'description',
						orderable: false
					},
					{
						name: 'uom',
						data: 'uom',
						orderable: false
					},
					{
						name: 'quantity',
						data: 'quantity',
						orderable: false
					},
					{
						name: 'price',
						data: 'price',
						orderable: false
					},
					{
						name: 'taxable',
						data: 'taxable',
						orderable: false
					},
					{
						name: 'vatPercentage',
						data: 'vatPercentage',
						orderable: false
					}
				],
				language: {
					lengthMenu: 'Mostra _MENU_ righe',
					zeroRecords: 'Nessuna riga presente',
					info: 'Pagina _PAGE_ di _PAGES_',
					infoEmpty: 'Nessuna riga presente',
					infoFiltered: '',
					paginate: {
						first:		'Inizio',
						last:			'Fine',
						next:			'Successivo',
						previous:	'Precedente'
					},
					search: 'Cerca'
				}
			});

			// Set focus on the first form field.
			//
			_.defer(function () {
				this.$('#addresseeDescription').focus();
			});

			// Create the contact picker subview.
			//
			var contactPicker = new ContactPickerView();
			this.addSubview(contactPicker);
			contactPicker.render();

			return this;
		},

		formToModel: function() {

			var type = this.$('input[name=isCompany]:checked').val();
			if(type === 'person') {
				this.model.set('isCompany', false);
			} else if(type === 'company') {
				this.model.set('isCompany', true);
			}

			this.model.set('vatCode', this.$('#vatCode').val());
			this.model.set('cfCode', this.$('#cfCode').val().toUpperCase());
			this.model.set('description', this.$('#description').val());
			this.model.set('salutation', this.$('#salutation').val());
			this.model.set('firstName', this.$('#firstName').val());
			this.model.set('lastName', this.$('#lastName').val());
			this.model.set('address1', this.$('#address1').val());
			this.model.set('address2', this.$('#address2').val());
			this.model.set('city', this.$('#city').val());
			this.model.set('county', this.$('#county').val());
			this.model.set('zipCode', this.$('#zipCode').val());
			this.model.set('country', this.$('#country').val());
			this.model.set('phone', this.$('#phone').val());
			this.model.set('fax', this.$('#fax').val());
			this.model.set('email', this.$('#email').val());
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

		onRemove: function() {

			this.$('#issuerCity').autocomplete('destroy');
			this.$('#issuerCounty').autocomplete('destroy');
		},

		onSelectRow: function(e) {

			if ($(e.currentTarget).hasClass('selected')) {
				$(e.currentTarget).removeClass('selected');
				this.$('#moveUp').button('option', 'disabled', true);
				this.$('#moveDown').button('option', 'disabled', true);
			} else {
				$(e.currentTarget).siblings('tr.selected').removeClass('selected');
				$(e.currentTarget).addClass('selected');
				this.$('#moveUp').button('option', 'disabled', false);
				this.$('#moveDown').button('option', 'disabled', false);
			}
		},

		onClickAddRow: function() {

			// Get the data table object.
			//
			var datatable = this.$('#rows').DataTable();

			// Retrieve the last position added.
			//
			var lastRow = this.$('#rows tr:last');
			var data = datatable.row(lastRow).data();

			var position = (data && data.position) ? data.position + 10 : 10;

			datatable.row.add({
				position: position,
				description: new Date(),
				uom: null,
				quantity: null,
				price: null,
				taxable: null,
				vatPercentage: null
			});
			datatable.draw();
		},

		onClickMoveUp: function() {

			// Find the selected table row.
			//
			var selected = this.$('#rows tr.selected');
			if(!selected) {
				return;
			}

			// Get the rows data table.
			//
			var datatable = this.$('#rows').DataTable();

			// Get the index of the selected row.
			//
			var selIdx = datatable.row(selected).index();
			if(!selIdx || selIdx <= 0) {
				return;
			}

			// Swap with the row above the selected one.
			//
			var above = datatable.row(selIdx - 1).data();
			var current = datatable.row(selIdx).data();
			var tmppos = current.position;
			current.position = above.position;
			above.position = tmppos;
			datatable.row(selIdx - 1).data(current);
			datatable.row(selIdx).data(above);

			// Manage row selection.
			//
			selected.removeClass('selected');
			selected.prev().addClass('selected');

			// Redraw.
			//
			datatable.draw();
		},

		onClickSelectAddressee: function() {

			Backbone.trigger('invoice:open-contact-picker');
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

		// Clear previous validation errors from form fields.
		//
		resetFieldErrors: function () {

			this.resetFieldError('#isCompany');
			this.resetFieldError('#vatCode');
			this.resetFieldError('#cfCode');
			this.resetFieldError('#description');
			this.resetFieldError('#salutation');
			this.resetFieldError('#firstName');
			this.resetFieldError('#lastName');
			this.resetFieldError('#address1');
			this.resetFieldError('#address2');
			this.resetFieldError('#city');
			this.resetFieldError('#county');
			this.resetFieldError('#zipCode');
			this.resetFieldError('#country');
			this.resetFieldError('#phone');
			this.resetFieldError('#fax');
			this.resetFieldError('#email');
		}
	});

	return DetailView;
});
