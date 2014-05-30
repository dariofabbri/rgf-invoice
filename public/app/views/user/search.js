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

		onRemove: function() {

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
			datatable.column('username:name').search(userSearch.get('username'));
			datatable.column('name:name').search(userSearch.get('name'));
			datatable.column('surname:name').search(userSearch.get('surname'));

			datatable.draw();
		},

		formToModel: function() {

			userSearch.set('username', this.$('#username').val());
			userSearch.set('surname', this.$('#surname').val());
			userSearch.set('name', this.$('#name').val());
		},

		modelToForm: function() {

			this.$('#username').val(userSearch.get('username'));
			this.$('#surname').val(userSearch.get('surname'));
			this.$('#name').val(userSearch.get('name'));
		},

		onClickNew: function() {

			Backbone.history.navigate('newUser', true);
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
			Backbone.history.navigate('user/' + id, true);
		},

		onRemove: function () {

			this.$('#new').button('destroy');
			this.$('#list').DataTable().destroy();
		}
	});

	return SearchView;
});
