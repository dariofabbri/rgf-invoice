define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'views/user/search',
	'views/user/detail',
	'text!templates/user/main.html'
],
function ($, _, Backbone, ParentView, SearchView, DetailView, mainHtml) {
	
	var MainView = ParentView.extend({

		template: _.template(mainHtml),

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.removeChildViews();

			// Render search view.
			//
			var searchView = new SearchView();
			this.$('#search').html(searchView.render().el);
			this.childViews.push(searchView);

			// Render detail view.
			//
			var detailView = new DetailView();
			this.$('#detail').html(detailView.render().el).hide();
			this.childViews.push(detailView);

			return this;
		}
	});

	return MainView;
});
