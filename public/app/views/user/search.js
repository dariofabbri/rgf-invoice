define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'models/user-search',
	'text!templates/user/search.html'
],
function ($, _, Backbone, ParentView, userSearch, searchHtml) {
	
	var SearchView = ParentView.extend({

		template: _.template(searchHtml),

		events: {
			'keyup input': 'onKeyup'
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.$('#new').button();

			this.$('#list').dataTable({
				'language': {
					'lengthMenu': 'Mostra _MENU_ righe',
					'zeroRecords': 'Nessun risultato trovato',
					'info': 'Pagina _PAGE_ di _PAGES_',
					'infoEmpty': 'Nessun risultato trovato',
					'infoFiltered': '(filtered from _MAX_ total records)',
					'paginate': {
						'first':      'Inizio',
						'last':       'Fine',
						'next':       'Successivo',
						'previous':   'Precedente'
					},
				'search': 'Cerca'
				}
			});

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
		},

		fillSearchModel: function() {

			userSearch.set('username', this.$('#username').val());
			userSearch.set('surname', this.$('#surname').val());
			userSearch.set('name', this.$('#name').val());
		}
	});

	return SearchView;
});
