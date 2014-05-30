define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'models/invoice-search',
	'models/login-info',
	'text!templates/invoice/search.html'
],
function ($, _, Backbone, ParentView, invoiceSearch, loginInfo, searchHtml) {
	
	var SearchView = ParentView.extend({

		template: _.template(searchHtml),

		events: {
			'keyup input': 'onKeyup',
			'click #new': 'onClickNew',
			'click table tbody tr': 'onClickRow'
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			// Set up search form buttons.
			//
			this.$('#new').button();

			// Restore form state.
			//
			this.modelToForm();

			// Configure data table.
			//
			var datatable = this.$('#list').dataTable({
				serverSide: true,
				ajax: this.ajaxSearch,
				dom: 'tipr',
				deferLoading: 1,
				columns: [
					{
						name: 'number',
						data: 'number'
					},
					{
						name: 'date',
						data: 'date'
					},
					{
						name: 'vatCode',
						data: 'addressee.vatCode'
					},
					{
						name: 'cfCode',
						data: 'addressee.cfCode'
					},
					{
						name: 'description',
						data: 'addressee.description'
					}
				],
				searchCols: [
					{
						search: invoiceSearch.get('number')
					},
					{
						search: invoiceSearch.get('date')
					},
					{
						search: invoiceSearch.get('vatCode')
					},
					{
						search: invoiceSearch.get('cfCode')
					},
					{
						search: invoiceSearch.get('description')
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

			// Apply search filters.
			//
			this.doSearch();

			// Set up focus on the first form field.
			//
			_.defer(function () {
				this.$('#number').focus();
			});

			return this;
		},

		ajaxSearch: function(data, callback, settings) {
			var authorization = loginInfo.getAuthorization();

			// Prepare query arguments. The type is always "invoices".
			//
			var queryArguments = {
				type: 'I'
			};
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
				url: 'invoices',
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

			this.$('#new').button('destroy');
			this.$('#list').DataTable().destroy();
		},

		onKeyup: function() {
			
			// Load model from view.
			//
			this.formToModel();

			// Execute query again.
			//
			this.doSearch();
		},
		
		doSearch: function() {

			var datatable = this.$('#list').DataTable();
			datatable.column('number:name').search(invoiceSearch.get('number'));
			datatable.column('date:name').search(invoiceSearch.get('date'));
			datatable.column('vatCode:name').search(invoiceSearch.get('vatCode'));
			datatable.column('cfCode:name').search(invoiceSearch.get('cfCode'));
			datatable.column('description:name').search(invoiceSearch.get('description'));

			datatable.draw();
		},

		formToModel: function() {

			invoiceSearch.set('number', this.$('#number').val());
			invoiceSearch.set('date', this.$('#date').val());
			invoiceSearch.set('vatCode', this.$('#vatCode').val());
			invoiceSearch.set('cfCode', this.$('#cfCode').val());
			invoiceSearch.set('description', this.$('#description').val());
		},

		modelToForm: function() {

			this.$('#number').val(invoiceSearch.get('number'));
			this.$('#date').val(invoiceSearch.get('date'));
			this.$('#vatCode').val(invoiceSearch.get('vatCode'));
			this.$('#cfCode').val(invoiceSearch.get('cfCode'));
			this.$('#description').val(invoiceSearch.get('description'));
		},

		onClickNew: function() {

			Backbone.history.navigate('newInvoice', true);
		},

		onClickRow: function(e) {

			// Manage row selection for the visual cue of the operation.
			//
			var tr = $(e.currentTarget);
			if (tr.hasClass('selected')) {
				tr.removeClass('selected');
			} else {
				tr.siblings('tr.selected').removeClass('selected');
				tr.addClass('selected');
			}

			// Extract selected id and navigate to detail route.
			//
			var id = this.$('#list').DataTable().row(e.currentTarget).data()._id;
			Backbone.history.navigate('invoice/' + id, true);
		}
	});

	return SearchView;
});
