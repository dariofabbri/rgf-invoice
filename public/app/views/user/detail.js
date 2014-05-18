define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/user/detail.html'
],
function ($, _, Backbone, detailHtml) {
	
	var DetailView = Backbone.View.extend({

		template: _.template(detailHtml),

		events: {
			'click #back':	'onClickBack',
			'click #save':	'onClickSave'
		},

		render: function () {

			var html = this.template(this.model.toJSON());
			this.$el.html(html);

			// Set up form buttons.
			//
			this.$('#save').button();
			this.$('#back').button();

			// Set up focus on the first search field.
			//
			_.defer(function () {
				this.$('#username').focus();
			});

			return this;
		},

		formToModel: function() {

			this.model.set('username', this.$('#username').val());
			this.model.set('surname', this.$('#surname').val());
			this.model.set('name', this.$('#name').val());
		},

		onClickBack: function() {

			Backbone.history.navigate('users', true);
		},

		onClickSave: function() {

			this.formToModel();

			if (!this.model.save({}, {
				success: function() {

					// Put out a message box for confirmation.
					//
					$('<div>Le modifiche sono state apportate con successo.</div>').dialog({
						title: 'Dettaglio utente',
						modal: true,
						buttons: [
							{
								text: 'OK',
								click: function() {
									$(this).dialog("close");
								}
							}
						]
					}).on('dialogclose', function() {

						// Get back to the search panel.
						//
						Backbone.history.navigate('users', true);
					});
				}
			})) {

				// Manage model validation error.
				//
			}
		}
	});

	return DetailView;
});
