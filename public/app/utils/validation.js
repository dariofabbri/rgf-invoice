define([
	'underscore'
],
function (_) {
	 
	var Validation = function() {
	};

	_.extend(Validation.prototype, {

		odd: {
			'0': 1,
			'1': 0,
			'2': 5,
			'3': 7,
			'4': 9,
			'5': 13,
			'6': 15,
			'7': 17,
			'8': 19,
			'9': 21,
			'A': 1,
			'B': 0,
			'C': 5,
			'D': 7,
			'E': 9,
			'F': 13,
			'G': 15,
			'H': 17,
			'I': 19,
			'J': 21,
			'K': 2,
			'L': 4,
			'M': 18,
			'N': 20,
			'O': 11,
			'P': 3,
			'Q': 6,
			'R': 8,
			'S': 12,
			'T': 14,
			'U': 16,
			'V': 10,
			'W': 22,
			'X': 25,
			'Y': 24,
			'Z': 23
		},

		even: {
			'0': 0,
			'1': 1,
			'2': 2,
			'3': 3,
			'4': 4,
			'5': 5,
			'6': 6,
			'7': 7,
			'8': 8,
			'9': 9,
			'A': 0,
			'B': 1,
			'C': 2,
			'D': 3,
			'E': 4,
			'F': 5,
			'G': 6,
			'H': 7,
			'I': 8,
			'J': 9,
			'K': 10,
			'L': 11,
			'M': 12,
			'N': 13,
			'O': 14,
			'P': 15,
			'Q': 16,
			'R': 17,
			'S': 18,
			'T': 19,
			'U': 20,
			'V': 21,
			'W': 22,
			'X': 23,
			'Y': 24,
			'Z': 25
		},
		
		reCf: /([a-z0-9]{15})([a-z0-9]{1})/i,
		rePiva: /^\d{11}$/,
		reEmail: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		reZip: /^\d{5}$/,

		isValidCodiceFiscale: function(cf) {

			var i;

			cf = cf.trim().toUpperCase();

			if(cf.length != 16) {
				return false;
			}

			// Split code from check character.
			//
			var matches = cf.match(this.reCf);
			if(!matches) {
				return false;
			}
			var code = matches[1];
			var check = matches[2];

			// Process odd chars.
			//
			var sum = 0;
			for(i = 0; i < 15; i += 2) {
				sum += this.odd[code.charAt(i)];
			}

			// Process even chars.
			//
			for(i = 1; i < 15; i += 2) {
				sum += this.even[code.charAt(i)];
			}

			// Calculate check char.
			//
			var calc = String.fromCharCode(65 + sum % 26);

			// Compare with declared check char.
			//
			return calc === check;
		},

		isValidPartitaIVA: function(piva) {

			var i, c, k;

			piva = piva.trim();

			if(!piva.match(this.rePiva)) {
				return false;
			}

			var x = 0;
			for(i = 0; i < 10; i += 2) {
				c = piva.charAt(i);
				x += Number.parseInt(c, 10);
			}

			var y = 0;
			for(i = 1; i < 10; i += 2) {
				c = piva.charAt(i);
				k = Number.parseInt(c, 10) * 2;
				k = k > 9 ? k - 9 : k;
				y += k;
			}

			var t = (x + y) % 10;
			var c = (10 - t) % 10;

			return c === Number.parseInt(piva.charAt(10));
		},

		isValidEmail: function(email) {
			
			return email.match(this.reEmail);
		},

		isValidZipCode: function(zip) {

			return zip.match(this.reZip);
		}
	});

	// Return the singleton instance.
	//
	return new Validation();
});

