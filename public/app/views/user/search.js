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
			'keyup input': 	'onKeyup',
			'click #new':		'onClickNew',
			'click table tbody tr': 'onEditRecord'
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
			this.$('#list').jqGrid({
				datatype: this.ajaxSearch,
				colNames: [ 'Username', 'Cognome', 'Nome' ],
				colModel: [
					{ name: 'username', index: 'username', autowidth: true },
					{ name: 'surname', index: 'surname', autowidth: true },
					{ name: 'name', index: 'name', autowidth: true }
				],
				rowNum: 10,
				rowList: [ 10, 20, 50 ],
				sortname: 'username',
				sortorder: 'asc',
				viewrecords: true,
				caption: 'Utenti'
			});

			this.$('#list').closest('.c12').on('resize', function() {
				console.log(arguments);
			});

			// Set up focus on the first form field.
			//
			_.defer(function () {
				this.$('#username').focus();
			});

			return this;
		},

		ajaxSearch: function(args) {
			var that = this;
			var value;
			var authorization = loginInfo.getAuthorization();

			// Prepare query arguments.
			//
			var queryArguments = {};
			_.each(userSearch.keys(), function(key) {
				value = userSearch.get(key);
				if(value) {
					queryArguments[key] = value;
				}
			});
			queryArguments._sort = args.sidx;
			queryArguments._sortDirection = args.sord;
			queryArguments._length = args.rows;
			queryArguments._start = (args.page - 1) * args.rows;

			$.ajax({
				headers: {
					'Authorization': authorization
				},
				url: 'users',
				data: queryArguments,
				type: 'GET',
				success: function(response) {
					var grid = $(that)[0];
					grid.addJSONData(response.data);
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

		onEditRecord: function(e) {

			var id = this.$('#list').DataTable().row(e.currentTarget).data()._id;
			Backbone.history.navigate('user/' + id, true);
		}
	});

	return SearchView;
});
