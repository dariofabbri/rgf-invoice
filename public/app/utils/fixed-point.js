define([
	'underscore'
],
function (_) {
	 
	var FixedPoint = function() {
	};


	_.extend(FixedPoint.prototype, {

		_validRegexp: /^[+-]?\d+(.\d+)?$/,

		isValid(number) {

			return number.match(_validRegexp) !== null;
		},

		sum(first, second) {

			// Check validity of the operands.
			//
			if(!this.isValid(first)) {
				throw 'The first passed operand is not valid.';
			}
			if(!this.isValid(second)) {
				throw 'The second passed operand is not valid.';
			}

			// Extract the integer and the decimal parts of each operand.
			//
			var parts = first.split('.');
			var firstIntegerPart = parts[0];
			var firstDecimalPart = parts[1];
			parts = second.split('.');
			var secondIntegerPart = parts[0];
			var secondDecimalPart = parts[1];

			// Normalize the decimal parts by padding to the longest.
			//
			var diff = firstDecimalPart.length - secondDecimalPart.length;
			if(diff > 0) {
				secondDecimalPart += new Array(diff + 1).join('0');
			} else if(diff < 0){
				firstDecimalPart += new Array(-diff + 1).join('0');
			}

			// Sum the parts.
			//
			var integerPart = parseInt(firstIntegerPart, 10) + parseInt(secondIntegerPart, 10);
			var decimalPart = parseInt(firstDecimalPart, 10) + parseInt(secondDecimalPart, 10);
			return integerPart + '.' + decimalPart;
		},

		multiply(first, second) {

			// Check validity of the operands.
			//
			if(!this.isValid(first)) {
				throw 'The first passed operand is not valid.';
			}
			if(!this.isValid(second)) {
				throw 'The second passed operand is not valid.';
			}

			// Extract the integer and the decimal parts of each operand.
			//
			var parts = first.split('.');
			var firstIntegerPart = parts[0];
			var firstDecimalPart = parts[1];
			parts = second.split('.');
			var secondIntegerPart = parts[0];
			var secondDecimalPart = parts[1];

			// Get the number of decimal places that the final result will have.
			//
			var decimalPlaces = firstDecimalPart.length + secondDecimalPart.length;

			// Multiply the integer representations.
			//
			var result = (parseInt(firstIntegerPart + firstDecimalPart) * parseInt(secondIntegerPart + secondDecimalPart)) + '';
			return result.substr(0, result.length - decimalPlaces) + '.' + result.substr(result.length - decimalPlaces);
		}
	});

	// Return the singleton instance.
	//
	return new FixedPoint();
});
