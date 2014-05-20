define([
	'jquery',
	'underscore',
	'backbone',
	'views/form/form',
	'collections/names',
	'collections/salutations',
	'collections/cities',
	'collections/counties',
	'collections/countries',
	'text!templates/contact/detail.html'
],
function ($, _, Backbone, FormView, names, salutations, cities, counties, countries, detailHtml) {
	
	var DetailView = FormView.extend({

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

			// Set up autocomplete fields.
			//
			this.$('#firstName').autocomplete({
				source: function(request, response) {
					response(names.list(request.term));
				}
			});
			this.$('#salutation').autocomplete({
				source: function(request, response) {
					response(salutations.list(request.term));
				}
			});
			this.$('#city').autocomplete({
				source: function(request, response) {
					response(cities.list(request.term));
				}
			});
			this.$('#county').autocomplete({
				source: function(request, response) {
					response(counties.list(request.term));
				}
			});
			this.$('#country').autocomplete({
				source: function(request, response) {
					response(countries.list(request.term));
				}
			});

			// Set up buttonset for isCompany radio.
			//
			if(this.model.get('isCompany')) {
				this.$('#company').attr('checked', 'checked');
			} else {
				this.$('#person').attr('checked', 'checked');
			}
			this.$('#isCompany').buttonset();

			// Set up focus on the first search field.
			//
			_.defer(function () {
				this.$('#vatCode').focus();
			});

			return this;
		},

		formToModel: function() {

			var type = this.$('input[name=isCompany]:checked').val();
			if(type === 'person') {
				this.model.set('isCompany', false);
			} else if(type === 'company') {
				this.model.set('isCompany', true);
			}

			this.model.set('vatCode', this.$('#vatCode').val());
			this.model.set('cfCode', this.$('#cfCode').val().toUpperCase());
			this.model.set('description', this.$('#description').val());
			this.model.set('salutation', this.$('#salutation').val());
			this.model.set('firstName', this.$('#firstName').val());
			this.model.set('lastName', this.$('#lastName').val());
			this.model.set('address1', this.$('#address1').val());
			this.model.set('address2', this.$('#address2').val());
			this.model.set('city', this.$('#city').val());
			this.model.set('county', this.$('#county').val());
			this.model.set('zipCode', this.$('#zipCode').val());
			this.model.set('country', this.$('#country').val());
			this.model.set('phone', this.$('#phone').val());
			this.model.set('fax', this.$('#fax').val());
			this.model.set('email', this.$('#email').val());
		},

		onClickBack: function() {

			Backbone.history.navigate('contacts', true);
		},

		onClickSave: function() {

			this.formToModel();

			var valid = this.model.save({}, {
				success: function() {

					// Put out a message box for confirmation.
					//
					$('<div>Le modifiche sono state applicate con successo.</div>').dialog({
						title: 'Dettaglio contatto',
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
						Backbone.history.navigate('contacts', true);
					});
				}
			});

			// Manage model validation error.
			//
			this.resetFieldErrors();
			if(!valid) {
				this.setFormErrors(this.model.validationError);
			}
		},

		// Clear previous validation errors from form fields.
		//
		resetFieldErrors: function () {

			this.resetFieldError('#isCompany');
			this.resetFieldError('#vatCode');
			this.resetFieldError('#cfCode');
			this.resetFieldError('#description');
			this.resetFieldError('#salutation');
			this.resetFieldError('#firstName');
			this.resetFieldError('#lastName');
			this.resetFieldError('#address1');
			this.resetFieldError('#address2');
			this.resetFieldError('#city');
			this.resetFieldError('#county');
			this.resetFieldError('#zipCode');
			this.resetFieldError('#country');
			this.resetFieldError('#phone');
			this.resetFieldError('#fax');
			this.resetFieldError('#email');
		}
	});

	return DetailView;
});
