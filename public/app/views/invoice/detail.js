define([
	'jquery',
	'underscore',
	'backbone',
	'views/form/form',
	'collections/cities',
	'collections/counties',
	'models/login-info',
	'text!templates/invoice/detail.html'
],
function ($, _, Backbone, FormView, cities, counties, loginInfo, detailHtml) {
	
	var DetailView = FormView.extend({

		template: _.template(detailHtml),

		events: {
			'keyup #contactPicker input': 'onKeyup',
			'click #selectAddressee': 'onClickSelectAddressee',
			'click #back': 'onClickBack',
			'click #save': 'onClickSave'
		},

		render: function () {

			var html = this.template(this.model.toJSON());
			this.$el.html(html);

			// Set up form buttons.
			//
			this.$('#selectAddressee').button();
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

			// Configure data table.
			//
			var datatable = this.$('#contactPicker table').dataTable({
				serverSide: true,
				ajax: this.ajaxSearch,
				dom: 'tipr',
				deferLoading: 1,
				columns: [
					{
						name: 'vatCode',
						data: 'vatCode'
					},
					{
						name: 'cfCode',
						data: 'cfCode'
					},
					{
						name: 'description',
						data: 'description'
					},
					{
						name: 'lastName',
						data: 'lastName'
					},
					{
						name: 'firstName',
						data: 'firstName'
					}
				],
				language: {
					lengthMenu: 'Mostra _MENU_ righe',
					zeroRecords: 'Nessun risultato trovato',
					info: 'Pagina _PAGE_ di _PAGES_',
					infoEmpty: 'Nessun risultato trovato',
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

			datatable.find('tbody').on('click', 'tr', function() {
				if ($(this).hasClass('selected')) {
					$(this).removeClass('selected');
				} else {
					datatable.$('tr.selected').removeClass('selected');
					$(this).addClass('selected');
				}
			});

			// Apply search filters.
			//
			this.doSearch();

			// Set up contact picker dialog.
			//
			this.$('#contactPicker').dialog({
				autoOpen: false,
				modal: true,
				height: 600,
				width: 800
			});

			// Set up the accordions.
			//
			this.$('#accordion1').accordion({collapsible: true, heightStyle: 'content', active:  false});
			this.$('#accordion2').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion3').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion4').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion5').accordion({collapsible: true, heightStyle: 'content', active:  0});

			// Set focus on the first form field.
			//
			_.defer(function () {
				this.$('#addresseeDescription').focus();
			});

			return this;
		},
		
		doSearch: function() {

			var datatable = this.$('#contactPicker table').DataTable();
			datatable.column('description:name').search(this.$('searchDescription').val());
			datatable.column('lastName:name').search(this.$('searchLastName').val());
			datatable.column('firstName:name').search(this.$('searchFirstName').val());

			datatable.draw();
		},

		ajaxSearch: function(data, callback, settings) {
			var authorization = loginInfo.getAuthorization();

			// Prepare query arguments.
			//
			var queryArguments = {};
			_.each(data.columns, function(column) {
				if(column.search.value) {
					queryArguments[column.name] = column.search.value;
				}
			});
			queryArguments._sort = data.columns[data.order[0].column].name;
			queryArguments._sortDirection = data.order[0].dir;
			queryArguments._length = data.length;
			queryArguments._start = data.start;

			$.ajax({
				headers: {
					'Authorization': authorization
				},
				url: 'contacts',
				data: queryArguments,
				type: 'GET',
				success: function(response) {
					callback({
						draw: data.draw,
						recordsTotal: response.total,
						recordsFiltered: response.total,
						data: response.data
					});
				}
			});
		},

		onRemove: function() {

			this.$('#contactPicker table').DataTable().destroy();
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

		onKeyup: function() {

			// Execute query again.
			//
			this.doSearch();
		},

		onClickSelectAddressee: function() {

			$('#contactPicker').dialog('open');

			// Set focus on the first field of the search form.
			//
			_.defer(function () {
				this.$('#searchDescription').focus();
			});
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
