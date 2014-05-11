define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/footer.html'
],
function ($, _, Backbone, footerHtml) {
	
	var HeaderView = Backbone.View.extend({

		template: _.template(footerHtml),

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.updateClock();

			return this;
		},

		updateClock: function() {

			var now = new Date();
			var formattedTime = 
				(now.getHours() < 10 ? "0" + now.getHours() : now.getHours()) +
				":" +
				(now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) +
				":" +
				(now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds());
				
			this.$("#clock").text(formattedTime);

			setInterval(this.updateClock, 1000);
		}

	});

	return HeaderView;
});
