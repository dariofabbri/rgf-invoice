define([
	'jquery',
	'underscore',
	'backbone',
	'collections/uoms',
	'collections/vats',
	'utils/validation'
],
function ($, _, Backbone, uoms, vats, validation) {
	var InvoiceRow = Backbone.Model.extend({
		idAttribute: '_id',

		defaults: {
			position: null,
			description: null,
			uom: null,
			quantity: null,
			price: null,
			taxable: null,
			vatPercentage: null
		},

		validate: function(attributes, options) {

			var item;
			var errors = {};
			var that = this;

			// Position field must be present.
			//
			if (!this.get('position')) {
				errors['position'] = 'Il campo posizione è obbligatorio.';
			}

			// Description field must be present.
			//
			if (!this.get('description')) {
				errors['description'] = 'Il campo descrizione è obbligatorio.';
			}

			// Uom field must be present.
			//
			if (!this.get('uom')) {
				errors['uom'] = 'Il campo unità di misura è obbligatorio.';
			} else {

				// Uom field must be one of those present in the lookup table.
				//
				item = uoms.find(function(item) {
					return item.get('description') === that.get('uom');
				});
				if(!item) {
					errors['uom'] = 'L\'unità di misura specificata non è valida.';
				}
			}

			// Quantity field must be present.
			//
			if (!this.get('quantity')) {
				errors['quantity'] = 'Il campo quantità è obbligatorio.';
			} else {
				if(!validation.isValidNumber(this.get('quantity'))) {
					errors['quantity'] = 'La quantità immessa non rappresenta un numero valido.';
				}
			}

			// Price field must be present.
			//
			if (!this.get('price')) {
				errors['price'] = 'Il campo prezzo è obbligatorio.';
			} else {
				if(!validation.isValidNumber(this.get('price'))) {
					errors['price'] = 'Il prezzo immesso non rappresenta un numero valido.';
				}
			}

			// Taxable field must be present.
			//
			if (!this.get('taxable')) {
				errors['taxable'] = 'Il campo importo è obbligatorio.';
			} else {
				if(!validation.isValidNumber(this.get('taxable'))) {
					errors['taxable'] = 'L\'importo immesso non rappresenta un numero valido.';
				}
			}

			// Vat percentage field must be present.
			//
			if (!this.get('vatPercentage')) {
				errors['vatPercentage'] = 'Il campo percentuale IVA è obbligatorio.';
			} else {

				// Vat percentage field must be one of those present in the lookup table.
				//
				item = vats.find(function(item) {
					return item.get('description') === that.get('vatPercentage');
				});
				if(!item) {
					errors['uom'] = 'La percentuale IVA indicata non è valida.';
				}
			}

			if(!_.isEmpty(errors)) {
				return errors;
			}
		}
	});
	return InvoiceRow;
});
