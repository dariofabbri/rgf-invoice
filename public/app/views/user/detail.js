define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/user/detail.html'
],
function ($, _, Backbone, detailHtml) {
	
	var DetailView = Backbone.View.extend({

		template: _.template(detailHtml),

		render: function () {
			var html = this.template();
			this.$el.html(html);

			return this;
		}
	});

	return DetailView;
});
