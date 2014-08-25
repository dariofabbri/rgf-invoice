define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/invoice/print.html'
],
function ($, _, Backbone, printHtml) {
	
	var PrintView = Backbone.View.extend({

		template: _.template(printHtml),

		render: function () {

			var html = this.template(this.model.toJSON());
			this.$el.html(html);
			return this;
		},
	});

	return PrintView;
});
