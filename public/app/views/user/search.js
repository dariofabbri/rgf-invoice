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
			'click #new':		'onClickNew'
		},

		render: function () {
			var that = this;
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
				autowidth: true,
				shrinkToFit: true,
				colNames: [ 'ID', 'Username', 'Cognome', 'Nome' ],
				colModel: [
					{ name: '_id', index: '_id', hidden: true },
					{ name: 'username', index: 'username' },
					{ name: 'surname', index: 'surname' },
					{ name: 'name', index: 'name' }
				],
				rowNum: 30,
				rowList: [ 10, 20, 50 ],
				sortname: 'username',
				sortorder: 'asc',
				viewrecords: true,
				caption: 'Utenti',
				onSelectRow: this.onSelectRow
			});

			$(window).resize(function() {
				var width = that.$('#list').closest('.c12').width();
				that.$('#list').jqGrid('setGridWidth', width, true);
			});

			// After the rendering...
			//
			_.defer(function () {

				// Resize the grid to its container's width.
				//
				var width = this.$('#list').closest('.c12').width();
				this.$('#list').jqGrid('setGridWidth', width, true);

				// Set up focus on the first form field.
				//
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
					$(that)[0].addJSONData(response.data);
				}
			});
		},

		onRemove: function() {

			// TODO: clean up the jqGrid.
			//
			//this.$('#list').DataTable().destroy();
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

			// TODO: trigger jqGrid reload.
			//
			this.$('#list').trigger('reloadGrid');
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

		onSelectRow: function(rowid, status, e) {

			var rowData = $(this).jqGrid('getRowData', rowid);
			Backbone.history.navigate('user/' + rowData._id, true);
		}
	});

	return SearchView;
});
