define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'models/contact-search',
	'models/login-info',
	'text!templates/contact/search.html'
],
function ($, _, Backbone, ParentView, contactSearch, loginInfo, searchHtml) {
	
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
				searchCols: [
					{
						search: contactSearch.get('vatCode')
					},
					{
						search: contactSearch.get('cfCode')
					},
					{
						search: contactSearch.get('description')
					},
					{
						search: contactSearch.get('lastName')
					},
					{
						search: contactSearch.get('firstName')
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
				this.$('#vatCode').focus();
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
				url: '/contacts',
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
			datatable.column('vatCode:name').search(contactSearch.get('vatCode'));
			datatable.column('cfCode:name').search(contactSearch.get('cfCode'));
			datatable.column('description:name').search(contactSearch.get('description'));
			datatable.column('lastName:name').search(contactSearch.get('lastName'));
			datatable.column('firstName:name').search(contactSearch.get('firstName'));

			datatable.draw();
		},

		formToModel: function() {

			contactSearch.set('vatCode', this.$('#vatCode').val());
			contactSearch.set('cfCode', this.$('#cfCode').val());
			contactSearch.set('description', this.$('#description').val());
			contactSearch.set('lastName', this.$('#lastName').val());
			contactSearch.set('firstName', this.$('#firstName').val());
		},

		modelToForm: function() {

			this.$('#vatCode').val(contactSearch.get('vatCode'));
			this.$('#cfCode').val(contactSearch.get('cfCode'));
			this.$('#description').val(contactSearch.get('description'));
			this.$('#lastName').val(contactSearch.get('lastName'));
			this.$('#firstName').val(contactSearch.get('firstName'));
		},

		onClickNew: function() {

			Backbone.history.navigate('newContact', true);
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
			Backbone.history.navigate('contact/' + id, true);
		}
	});

	return SearchView;
});
