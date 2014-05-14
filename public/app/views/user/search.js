define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'text!templates/user/search.html'
],
function ($, _, Backbone, ParentView, searchHtml) {
	
	var SearchView = ParentView.extend({

		template: _.template(searchHtml),

		render: function () {
			var html = this.template();
			this.$el.html(html);

			return this;
		}
	});

	return SearchView;
});
