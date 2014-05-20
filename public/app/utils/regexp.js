define([
	'underscore'
],
function (_) {
	 
	var RE = function() {
	};

	_.extend(RE.prototype, {
		
		escapeRegExp: function(s) {
			return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		},
	});

	// Return the singleton instance.
	//
	return new RE();
});

