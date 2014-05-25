define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'models/login-info',
	'text!templates/invoice/contact-picker.html'
],
function ($, _, Backbone, ParentView, loginInfo, pickerHtml) {
	
	var ContactPickerView = ParentView.extend({

		template: _.template(pickerHtml),

		events: {
			'keyup input': 'onKeyup',
			'click table tbody tr': 'onSelectRow'
		},

		initialize: function() {

			Backbone.on('invoice:open-contact-picker', this.openPicker, this);
		},

		openPicker: function() {

			this.$el.dialog('open');
		},

		render: function () {

			var html = this.template();

			// Set up contact picker dialog.
			//
			this.$el = $(html).dialog({
				autoOpen: false,
				modal: true,
				width: 800,
				height: 600
			});
			this.delegateEvents(this.events);

			// Set up form buttons.
			//
			// this.$('#selectAddressee').button();
			// this.$('#save').button();
			// this.$('#back').button();

			// Configure data table.
			//
			var datatable = this.$('table').dataTable({
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

			return this;
		},
		
		doSearch: function() {

			var datatable = this.$('table').DataTable();
			datatable.column('description:name').search(this.$('#searchDescription').val());
			datatable.column('lastName:name').search(this.$('#searchLastName').val());
			datatable.column('firstName:name').search(this.$('#searchFirstName').val());

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

			Backbone.off('invoice:open-contact-picker', this.openPicker, this);

			this.$('table').DataTable().destroy();
			this.$el.dialog('destroy');
		},

		onKeyup: function() {

			// Execute query again.
			//
			this.doSearch();
		},

		onSelectRow: function(e) {

			var id = this.$('table').DataTable().row(e.currentTarget).data()._id;
			Backbone.trigger('invoice:contact-picker-select', id);
			this.$el.dialog('close');
		}
	});

	return ContactPickerView;
});
