define([
	'jquery',
	'underscore',
	'backbone',
	'big',
	'models/invoice-row',
	'collections/uoms',
	'collections/vats',
	'utils/validation',
	'text!templates/invoice/detail-rows.html'
],
function ($, _, Backbone, Big, InvoiceRow, uoms, vats, validation, detailRowsHtml) {
	
	var DetailRowsView = Backbone.View.extend({

		template: _.template(detailRowsHtml),

		editing: null,

		editableColumns: [ 1, 2, 3, 4, 6 ],

		selectableColumns: [ 0 ],

		events: {
			'click #rows tbody td': 'onClickCell',
			'click #addRow': 'onClickAddRow',
			'click #removeRow': 'onClickRemoveRow',
			'click #moveUp': 'onClickMoveUp',
			'click #moveDown': 'onClickMoveDown'
		},

		initialize: function() {

			this.on('rowchanged', this.updateTotals, this);
			this.on('rowselectionchange', this.onRowSelectionChange, this);
			Backbone.on('invoice:prepareforsave', this.onPrepareForSave, this);
		},

		render: function () {

			var html = this.template(this.model.toJSON());
			this.$el.html(html);

			// Set up form buttons.
			//
			this.$('#addRow').button();
			this.$('#removeRow').button({ disabled: true });
			this.$('#moveUp').button({ disabled: true });
			this.$('#moveDown').button({ disabled: true });

			var data = _.clone(this.model.get('rows'));
			_.each(data, function(row) {
				row.taxable = validation.formatBig(row.taxable);
				row.price = validation.formatBig(row.price);
				row.quantity = validation.formatBig(row.quantity);
			});

			// Configure detail data table.
			//
			var datatable = this.$('#rows').dataTable({
				serverSide: false,
				data: data,
				dom: 'tr',
				paging: false,
				columns: [
					{
						name: 'position',
						data: 'position',
						orderable: false
					},
					{
						name: 'description',
						data: 'description',
						orderable: false
					},
					{
						name: 'uom',
						data: 'uom',
						orderable: false
					},
					{
						name: 'quantity',
						data: 'quantity',
						orderable: false
					},
					{
						name: 'price',
						data: 'price',
						orderable: false
					},
					{
						name: 'taxable',
						data: 'taxable',
						orderable: false
					},
					{
						name: 'vatPercentage',
						data: 'vatPercentage',
						orderable: false
					}
				],
				language: {
					lengthMenu: 'Mostra _MENU_ righe',
					zeroRecords: 'Nessuna riga presente',
					info: 'Pagina _PAGE_ di _PAGES_',
					infoEmpty: 'Nessuna riga presente',
					infoFiltered: '',
					paginate: {
						first:		'Inizio',
						last:			'Fine',
						next:			'Successivo',
						previous:	'Precedente'
					},
					search: 'Cerca'
				}
			});

			return this;
		},

		onRemove: function() {

			this.off('rowchanged', this.updateTotals, this);
			this.off('rowselectionchange', this.onRowSelectionChange, this);
			Backbone.off('invoice:prepareforsave', this.onPrepareForSave, this);

			this.$('#addRow').button('destroy');
			this.$('#removeRow').button('destroy');
			this.$('#moveUp').button('destroy');
			this.$('#moveDown').button('destroy');

			this.$('#rows').DataTable().destroy();
		},

		onPrepareForSave: function(isPrinting) {

			var datatable = this.$('#rows').DataTable();
			var data = datatable.data();

			// Remove all rows that only have the position field populated.
			//
			var toBeDeleted = [];
			for(var i = data.length - 1; i >= 0; i -= 1) {
				if(
						data[i].position &&
						!data[i].description &&
						!data[i].uom &&
						!data[i].quantity &&
						!data[i].price &&
						!data[i].vatPercentage) {
					toBeDeleted.push(i);
				}
			}
			_.each(toBeDeleted, function(index) {
				this.removeRow(index);
			}, this);

			// Validate row data.
			//
			data = datatable.data();
			var rows = [];
			for(var i = 0; i < data.length; i += 1) {
				
				// Fill in a temporary invoice row model.
				//
				var row = _.clone(data[i]);
				_.extend(row, {
					quantity: row.quantity.replace('.', '').replace(',', '.'),
					price: row.price.replace('.', '').replace(',', '.'),
					taxable: row.taxable.replace('.', '').replace(',', '.'),
				})
				var invoiceRow = new InvoiceRow(row);

				// Call validation method.
				// 
				var validationErrors = invoiceRow.validate();
				if(validationErrors) {

					var message = '<div>La riga numero ' + (i + 1) + ' contiene i seguenti errori: <ul>';
					_.each(validationErrors, function(value) {
						message += '<li>' + value + '</li>';
					});
					message += '</ul></div>';

					// Put out a message box with the error messages.
					//
					$(message).dialog({
						title: 'Errori nelle righe della fattura',
						modal: true,
						width: 600,
						buttons: [
							{
								text: 'OK',
								click: function() {
									$(this).dialog('close');
								}
							}
						]
					}).on('dialogclose', function() {
						$(this).dialog('destroy');
					});

					// Stop after the first row in error found.
					//
					return;
				}

				// No errors on the row, add it to the list.
				//
				rows.push(row);
			}

			// No errors detected, signal that we are ready to save the invoice.
			//
			Backbone.trigger('invoice:readyforsave', rows, isPrinting);
		},

		onRowSelectionChange: function(row) {

			this.$('#moveUp').button('option', 'disabled', !row);
			this.$('#moveDown').button('option', 'disabled', !row);
			this.$('#removeRow').button('option', 'disabled', !row);
		},

		onClickAddRow: function() {

			// Get the data table object.
			//
			var datatable = this.$('#rows').DataTable();

			// Retrieve the last position added.
			//
			var lastRow = this.$('#rows tr:last');
			var data = datatable.row(lastRow).data();

			// Autoincrement the row position.
			//
			var position = (data && data.position) ? data.position + 10 : 10;

			// Add the newly created row.
			//
			datatable.row.add({
				position: position,
				description: null,
				uom: null,
				quantity: null,
				price: null,
				taxable: null,
				vatPercentage: null
			});
			datatable.draw();

			// Edit the first cell of the new row.
			//
			this.setEditCell(this.$('#rows tr:last td:eq(1)'));

			// Signal the system that the invoice totals have changed.
			//
			Backbone.trigger('invoice:totalschanged', this.calculateTotals());
		},

		onClickRemoveRow: function() {

			// Find the selected row.
			//
			var selected = this.$('#rows tr.selected');
			if(!selected) {
				return;
			}

			// Remove the selected row.
			//
			this.removeRow(selected.index());
		},

		removeRow: function(index) {

			// Access the specified row in the datatable.
			//
			var datatable = this.$('#rows').DataTable();
			var row = datatable.row(index);

			// Renumber the positions.
			//
			var position = 10;
			for(var i = 0; i < datatable.data().length; i += 1) {
				var data = datatable.row(i).data();
				data.position = position;
				datatable.row(i).data(data);

				// Double-number the row that will be removed.
				//
				if(i != row.index()) {
					position += 10;
				}
			}

			// Remove the specified row from the data table.
			//
			row.remove();
			datatable.draw();

			// Signal the system that the invoice totals have changed.
			//
			Backbone.trigger('invoice:totalschanged', this.calculateTotals());
		},

		moveRow: function(direction) {

			// Check passed parameter.
			//
			if(!direction || (direction !== 'up' && direction != 'down')) {
				throw "Parameter direction needs to be properly specified.";
			}

			// Find the selected table row.
			//
			var selected = this.$('#rows tr.selected');
			if(!selected) {
				return;
			}

			// Get the rows data table.
			//
			var datatable = this.$('#rows').DataTable();

			// Get the index of the selected row.
			//
			var selIdx = datatable.row(selected).index();
			if(direction === 'up' && selIdx <= 0) {
				return;
			}
			if(direction === 'down' && selIdx >= datatable.data().length - 1) {
				return;
			}

			// Swap with the row adjacent the selected one.
			//
			var other = direction === 'up' ? datatable.row(selIdx - 1).data() : datatable.row(selIdx + 1).data();
			current = datatable.row(selIdx).data();
			var tmppos = current.position;
			current.position = other.position;
			other.position = tmppos;
			datatable.row(selIdx + (direction === 'up' ? -1 : 1)).data(current);
			datatable.row(selIdx).data(other);

			// Manage row selection.
			//
			selected.removeClass('selected');
			if(direction === 'up') {
				selected.prev().addClass('selected');
			} else {
				selected.next().addClass('selected');
			}

			// Redraw.
			//
			datatable.draw();

			// Signal the system that the invoice totals have changed.
			//
			Backbone.trigger('invoice:totalschanged', this.calculateTotals());
		},

		onClickMoveUp: function() {
			this.moveRow('up');
		},

		onClickMoveDown: function() {
			this.moveRow('down');
		},

		validateEditingCell: function() {

			if(!this.editing) {
				throw "Unexpected call to this function with no cell currently editing.";
			}

			// Extract some cell info.
			//
			var datatable = $(this.editing).closest('table').DataTable();
			var cell = datatable.cell(this.editing);
			var column = cell.index().column;
			var val = $(this.editing).find('input').val();

			// Process each column in a specialized way.
			//
			switch(column) {
				
				// Unit of measure.
				//
				case 2:
					var item = uoms.find(function(item) {
						return item.get('description') === val;
					});
					if(!item) {
						return 'L\'unità di misura specificata non è valida.';
					}
				break;

				// Quantity.
				//
				case 3:
					if(!validation.isValidNumber(val)) {
						return 'La quantità immessa non rappresenta un numero valido.';
					}
				break;

				// Price.
				//
				case 4:
					if(!validation.isValidNumber(val)) {
						return 'Il prezzo immesso non rappresenta un numero valido.';
					}
				break;

				// VAT percentage.
				//
				case 6:
					var item = vats.find(function(item) {
						return item.get('description') === val;
					});
					if(!item) {
						return 'La percentuale IVA indicata non è valida.';
					}
				break;
			}

			// No validation problems detected.
			//
			return false;
		},

		updateTotals: function(td) {

			var row = $(this.editing)
				.closest('table')
				.DataTable()
				.row($(this.editing).closest('tr'));

			var data = row.data();

			if(data.quantity && data.price) {
				data.taxable = Big(data.quantity.replace(',', '.'))
					.times(data.price.replace(',', '.'))
					.toFormat();
				row.data(data);
			}
		},

		resetEditCell: function() {

			if(!this.editing) {
				throw "Unexpected call to this function with no cell currently editing.";
			}

			// Access inner input widget.
			//
			var input = $(this.editing).find('input');
			var data = input.val();

			// Perform validation.
			//
			var validationError = this.validateEditingCell();
			if(validationError) {

				// Set the field error style and the tooltip.
				//
				input
					.removeClass('field-error')
					.addClass('field-error')
					.data('hasTooltip', true)
					.attr('title', validationError)
					.tooltip();

				return false;
			}

			// If the widget had previously been enhanced as an autocomplete,
			// destroy it to avoid memory leaks.
			//
			if(input.hasClass('ui-autocomplete-input')) {
				input.autocomplete('destroy');
			}

			// If the tooltip had been previously activated on the
			// input field, remove it to prevent memory leaks.
			//
			if(input.data('hasTooltip')) {
				input.tooltip('destroy');
			}

			// Restore the control data in the table cell content.
			//
			var datatable = $(this.editing)
				.empty()
				.closest('table')
				.DataTable()
				.cell(this.editing)
				.data(data);

			// Update the totals in the row.
			//
			this.trigger('rowchanged');

			// Signal the system that the invoice totals have changed.
			//
			Backbone.trigger('invoice:totalschanged', this.calculateTotals());

			// Reset editing flag variable.
			//
			this.editing = null;

			return true;
		},

		setEditCell: function(target) {

			var that = this;

		
			// Get the cell associated to the passed target argument.
			//
			var cell = $(target).closest('table').DataTable().cell(target);

			// Check if the selected target cell is a valid table cell.
			//
			if(cell.length != 1) {
				return;
			}
			if(!this.isEditable(cell.index().column)) {
				return;
			}

			// Save existing data.
			//
			var data = cell.data();

			// Turn the cell into an input control.
			//
			var input = $(target)
				.empty()
				.append('<input type="text" style="width: 100%; height: 100%;"/>')
				.find('input')
				.val(data)
				.on('blur', function(e) {

					that.resetEditCell();
				})
				.on('keydown', function(e) {
					if(e.keyCode === 13) {

						e.preventDefault();
						that.resetEditCell();

					} else if(e.keyCode === 9) {

						e.preventDefault();
						that.tabToNext(e.currentTarget, !e.shiftKey);
					}
				})
				.focus();

			// Specialize the field user interface in certain cases.
			//
			switch(cell.index().column) {
				case 2:
					this.autocompletize(input, uoms);
					break;

				case 6:
					this.autocompletize(input, vats);
					break;
			}

			// Manage row selection.
			//
			var tr = $(target).closest('tr');
			if (!tr.hasClass('selected')) {
				tr.siblings('tr.selected').removeClass('selected');
				tr.addClass('selected');
				this.trigger('rowselectionchange', tr);
			}

			// Set editing indicator.
			//
			this.editing = target;
		},

		autocompletize: function(input, collection) {

			input.autocomplete({
				source: function(request, response) {
					response(collection.list(request.term));
				},
				minLength: 0
			})
			.on('click', function(e) {
				$(e.target).autocomplete('search');
			});
			input.autocomplete('search');
		},

		isEditable: function(idx) {
			
			return _.indexOf(this.editableColumns, idx) >= 0;
		},

		isSelectable: function(idx) {
			
			return _.indexOf(this.selectableColumns, idx) >= 0;
		},

		tabToNext: function (input, forward) {

			var datatable = $(input).closest('table').DataTable();
			var indexes = datatable.cell($(input).closest('td')).index();
			var idx = indexes.column;

			var limit = (forward ? _.max : _.min).call(this, this.editableColumns, function(c) { return c; });

			var next = null;

			while(true) {

				idx += forward ? 1 : -1;

				if(forward) {
					if(idx > limit) {
						break;
					}
				} else {
					if(idx < limit) {
						break;
					}
				}

				if(this.isEditable(idx)) {
					next = $(input).closest('tr').find('td:nth-child(' + (idx + 1) + ')');
					break;
				}
			}

			if(next) {
				if(this.resetEditCell()) {
					this.setEditCell(next);
				}
			}
		},

		onClickCell: function (e) {

			var indexes = $(e.currentTarget).closest('table').DataTable().cell(e.currentTarget).index();

			// Manage row selection: it only happens if the first column is clicked.
			//
			if(this.isSelectable(indexes.column)) {

				var tr = $(e.currentTarget).closest('tr');

				if (tr.hasClass('selected')) {
					tr.removeClass('selected');
					this.trigger('rowselectionchange');
				} else {
					tr.siblings('tr.selected').removeClass('selected');
					tr.addClass('selected');
					this.trigger('rowselectionchange', tr);
				}
			}

			// If we are already editing the clicked cell, just do nothing.
			//
			if(this.editing && this.editing === e.currentTarget) {
				return;
			}

			// If the user elected to edit a different cell, the previously edited needs
			// to be reseted.
			//
			if(this.editing && this.editing !== e.currentTarget) {
				this.resetEditCell();
			}

			// If the user clicked on an editable cell, turn it in an input control.
			//
			this.setEditCell(e.currentTarget);
		},

		calculateTotals: function() {
			
			var totals = {
				taxable: Big(0),
				tax: Big(0),
				total: Big(0)
			};

			var data = this.$('#rows').DataTable().data();

			_.each(data, function(row) {

				var tmp, perc;
				
				if(row.quantity && row.price) {
					tmp = Big(row.quantity.replace(',', '.'))
						.times(row.price.replace(',', '.'));
					totals.taxable = totals.taxable.plus(tmp.toFixed(2));

					tax = Big(0);
					if(row.vatPercentage) {

						perc = Big(row.vatPercentage.replace('%', '').replace(',', '.').trim());
						tax = tmp.times(perc).div(100).toFixed(2); 
						totals.tax = totals.tax.plus(tax);
					}

					totals.total = totals.total.plus(tmp).plus(tax);
				}
			});

			totals.taxable = totals.taxable.toFormat();
			totals.tax = totals.tax.toFormat();
			totals.total = totals.total.toFormat();

			return totals;
		}
	});

	return DetailRowsView;
});
