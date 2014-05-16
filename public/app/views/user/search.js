define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'models/user-search',
	'models/login-info',
	'text!templates/user/search.html'
],
function ($, _, Backbone, ParentView, userSearch, loginInfo, searchHtml) {
	
	var SearchView = ParentView.extend({

		template: _.template(searchHtml),

		events: {
			'keyup input': 'onKeyup'
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			// Set up search form buttons.
			//
			this.$('#new').button();

			// Restore form state.
			//
			this.searchModelToForm();

			// Configure data table.
			//
			var datatable = this.$('#list').dataTable({
				serverSide: true,
				ajax: this.ajaxSearch,
				dom: 'tipr',
				deferLoading: 1,
				columns: [
					{
						name: 'username',
						data: 'username'
					},
					{
						name: 'surname',
						data: 'surname'
					},
					{
						name: 'name',
						data: 'name'
					},
					{
						data: null,
						defaultContent: '',
						orderable: false,
						render: function(data, type, row, meta) {
							return '<button id="edit_' + row[0] + '"></button>';
						},
						targets: -1
					}
				],
				searchCols: [
					{
						search: userSearch.get('username')
					},
					{
						search: userSearch.get('surname')
					},
					{
						search: userSearch.get('name')
					},
					null
				],
				language: {
					lengthMenu: 'Mostra _MENU_ righe',
					zeroRecords: 'Nessun risultato trovato',
					info: 'Pagina _PAGE_ di _PAGES_',
					infoEmpty: 'Nessun risultato trovato',
					infoFiltered: '(filtered from _MAX_ total records)',
					paginate: {
						first:		'Inizio',
						last:			'Fine',
						next:			'Successivo',
						previous:	'Precedente'
					},
					search: 'Cerca'
				}
			});
			
			// Every time the gris is redrawn, enable its buttons.
			//
			datatable.on('draw.dt', function() {
				datatable.find('button').button({
					icons: {
						primary: 'ui-icon-document',
						text: false
					}
				}).width('35px').height('20px');
			});

			// Apply search filters.
			//
			this.doSearch();

			// Set up focus on the first search field.
			//
			_.defer(function () {
				this.$('#username').focus();
			});

			return this;
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
				url: 'users',
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

		onKeyup: function() {
			
			// Load model from view.
			//
			this.formToSearchModel();

			// Execute query again.
			//
			this.doSearch();
		},
		
		doSearch: function() {

			var datatable = this.$('#list').DataTable();
			datatable.column('username:name').search(userSearch.get('username'));
			datatable.column('name:name').search(userSearch.get('name'));
			datatable.column('surname:name').search(userSearch.get('surname'));
			datatable.draw();
		},

		formToSearchModel: function() {

			userSearch.set('username', this.$('#username').val());
			userSearch.set('surname', this.$('#surname').val());
			userSearch.set('name', this.$('#name').val());
		},

		searchModelToForm: function() {

			this.$('#username').val(userSearch.get('username'));
			this.$('#surname').val(userSearch.get('surname'));
			this.$('#name').val(userSearch.get('name'));
		}
	});

	return SearchView;
});
