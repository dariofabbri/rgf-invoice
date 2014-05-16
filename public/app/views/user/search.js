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
			queryArguments.sort = data.columns[data.order[0].column].name;
			queryArguments.sortDirection = data.order[0].dir;

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
						recordsTotal: response.length,
						recordsFiltered: response.length,
						data: response
					});
				}
			});
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.$('#new').button();

			this.$('#list').dataTable({
				serverSide: true,
				ajax: this.ajaxSearch,
				columns: [
					{
						name: 'username',
						data: 'username'
					},
					{
						name: 'name',
						data: 'name'
					},
					{
						name: 'surname',
						data: 'surname'
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
			
			// Enable grid buttons.
			//
			this.$('#list').find('button').button();

			// Set up focus on the first search field.
			//
			_.defer(function () {
				this.$('#username').focus();
			});

			return this;
		},

		onKeyup: function() {
			
			// Load model from view.
			//
			this.fillSearchModel();

			// Execute query again.
			//
			var datatable = this.$('#list').DataTable();
			datatable.column('username:name').search(userSearch.get('username'));
			datatable.column('name:name').search(userSearch.get('name'));
			datatable.column('surname:name').search(userSearch.get('surname'));
			datatable.draw();
		},

		fillSearchModel: function() {

			userSearch.set('username', this.$('#username').val());
			userSearch.set('surname', this.$('#surname').val());
			userSearch.set('name', this.$('#name').val());
		}
	});

	return SearchView;
});
