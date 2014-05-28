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

		editing: null,

		events: {
			'keyup .form input': 'onKeyup',
			'click #new': 'onClickNew',
			//'click table tbody tr': 'onEditRecord'
			'click table tbody td': 'onEditCell'
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

		onEditRecord: function(e) {

			var id = this.$('#list').DataTable().row(e.currentTarget).data()._id;
			Backbone.history.navigate('contact/' + id, true);
		},

		resetEditCell: function(target) {
			var data = $(target).find('input').val();
			$(target)
				.empty()
				.closest('table')
				.DataTable()
				.cell(target)
				.data(data);
		},

		setEditCell: function(target) {

			var data = $(target).closest('table').DataTable().cell(target).data();
			$(target)
				.empty()
				.append('<input type="text" id="abcd" style="width: 100%; height: 100%;"/>')
				.find('input')
				.val(data)
				.on('blur', function() {
					this.resetEditCell(this.editing);
					this.editing = null;
				})
				.focus();
		},

		onEditCell: function (e) {

			if(this.editing && this.editing === e.currentTarget) {
				return;
			}

			if(this.editing && this.editing !== e.currentTarget) {
				this.resetEditCell(this.editing);
			}

			this.setEditCell(e.currentTarget);
			this.editing = e.currentTarget;
		}
	});

	return SearchView;
});
