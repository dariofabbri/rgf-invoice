define([
	'jquery',
	'underscore',
	'backbone',
	'models/contact',
	'views/form/form',
	'views/invoice/contact-picker',
	'collections/cities',
	'collections/counties',
	'collections/uoms',
	'collections/vats',
	'text!templates/invoice/detail.html'
],
function ($, _, Backbone, ContactModel, FormView, ContactPickerView, cities, counties, uoms, vats, detailHtml) {
	
	var DetailView = FormView.extend({

		template: _.template(detailHtml),

		editing: null,

		editableColumns: [ 1, 2, 3, 4, 6 ],

		selectableColumns: [ 0 ],

		events: {
			'click #rows tbody td': 'onClickCell',
			'click #selectAddressee': 'onClickSelectAddressee',
			'click #addRow': 'onClickAddRow',
			'click #moveUp': 'onClickMoveUp',
			'click #moveDown': 'onClickMoveDown',
			'click #back': 'onClickBack',
			'click #save': 'onClickSave'
		},

		initialize: function() {

			Backbone.on('invoice:contact-picker-select', this.onContactPickerSelect, this);
		},

		render: function () {

			var html = this.template(this.model.toJSON());
			this.$el.html(html);

			// Set up form buttons.
			//
			this.$('#selectAddressee').button();
			this.$('#addRow').button();
			this.$('#moveUp').button({ disabled: true });
			this.$('#moveDown').button({ disabled: true });
			this.$('#save').button();
			this.$('#back').button();

			// Set up autocomplete fields.
			//
			this.$('#issuerCity').autocomplete({
				source: function(request, response) {
					response(cities.list(request.term));
				}
			});
			this.$('#issuerCounty').autocomplete({
				source: function(request, response) {
					response(counties.list(request.term));
				}
			});

			// Set up the accordions.
			//
			this.$('#accordion-header').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-issuer').accordion({collapsible: true, heightStyle: 'content', active:  false});
			this.$('#accordion-addressee').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-receipt').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-detail').accordion({collapsible: true, heightStyle: 'content', active:  0});
			this.$('#accordion-totals').accordion({collapsible: true, heightStyle: 'content', active:  0});

			// Configure detail data table.
			//
			var datatable = this.$('#rows').dataTable({
				serverSide: false,
				data: this.model.get('detail'),
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

			// Set focus on the first form field.
			//
			_.defer(function () {
				this.$('#number').focus();
			});

			// Create the contact picker subview.
			//
			var contactPicker = new ContactPickerView();
			this.addSubview(contactPicker);
			contactPicker.render();

			return this;
		},

		formToModel: function() {

			var type = this.$('input[name=isCompany]:checked').val();
			if(type === 'person') {
				this.model.set('isCompany', false);
			} else if(type === 'company') {
				this.model.set('isCompany', true);
			}

			this.model.set('vatCode', this.$('#vatCode').val());
			this.model.set('cfCode', this.$('#cfCode').val().toUpperCase());
			this.model.set('description', this.$('#description').val());
			this.model.set('salutation', this.$('#salutation').val());
			this.model.set('firstName', this.$('#firstName').val());
			this.model.set('lastName', this.$('#lastName').val());
			this.model.set('address1', this.$('#address1').val());
			this.model.set('address2', this.$('#address2').val());
			this.model.set('city', this.$('#city').val());
			this.model.set('county', this.$('#county').val());
			this.model.set('zipCode', this.$('#zipCode').val());
			this.model.set('country', this.$('#country').val());
			this.model.set('phone', this.$('#phone').val());
			this.model.set('fax', this.$('#fax').val());
			this.model.set('email', this.$('#email').val());
		},

		modelToForm: function() {
			this.$('#issuerDescription').val(this.model.get('issuer').description);
			this.$('#issuerAddress').val(this.model.get('issuer').address);
			this.$('#issuerCity').val(this.model.get('issuer').city);
			this.$('#issuerCounty').val(this.model.get('issuer').county);
			this.$('#issuerZipCode').val(this.model.get('issuer').zipCode);
			this.$('#issuerVatCode').val(this.model.get('issuer').vatCode);
			this.$('#issuerCfCode').val(this.model.get('issuer').cfCode);
			this.$('#issuerReaCode').val(this.model.get('issuer').reaCode);
			this.$('#issuerStock').val(this.model.get('issuer').stock);

			this.$('#addresseeDescription').val(this.model.get('addressee').description);
			this.$('#addresseeAddress1').val(this.model.get('addressee').address1);
			this.$('#addresseeAddress2').val(this.model.get('addressee').address2);
			this.$('#addresseeCity').val(this.model.get('addressee').city);
			this.$('#addresseeCounty').val(this.model.get('addressee').county);
			this.$('#addresseeZipCode').val(this.model.get('addressee').zipCode);
			this.$('#addresseeVatCode').val(this.model.get('addressee').vatCode);
			this.$('#addresseeCfCode').val(this.model.get('addressee').cfCode);
		},

		onRemove: function() {

			this.$('#selectAddressee').button('destroy');
			this.$('#addRow').button('destroy');
			this.$('#moveUp').button('destroy');
			this.$('#moveDown').button('destroy');
			this.$('#save').button('destroy');
			this.$('#back').button('destroy');

			this.$('#issuerCity').autocomplete('destroy');
			this.$('#issuerCounty').autocomplete('destroy');

			this.$('#accordion-header').accordion('destroy');
			this.$('#accordion-issuer').accordion('destroy');
			this.$('#accordion-addressee').accordion('destroy');
			this.$('#accordion-receipt').accordion('destroy');
			this.$('#accordion-detail').accordion('destroy');
			this.$('#accordion-totals').accordion('destroy');

			this.$('#rows').DataTable().destroy();
		},

		onClickAddRow: function() {

			// Get the data table object.
			//
			var datatable = this.$('#rows').DataTable();

			// Retrieve the last position added.
			//
			var lastRow = this.$('#rows tr:last');
			var data = datatable.row(lastRow).data();

			var position = (data && data.position) ? data.position + 10 : 10;

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
		},

		onClickMoveUp: function() {
			this.moveRow('up');
		},

		onClickMoveDown: function() {
			this.moveRow('down');
		},

		onClickSelectAddressee: function() {

			Backbone.trigger('invoice:open-contact-picker');
		},

		onClickBack: function() {

			Backbone.history.navigate('invoices', true);
		},

		onClickSave: function() {

			this.formToModel();

			var valid = this.model.save({}, {
				success: function() {

					// Put out a message box for confirmation.
					//
					$('<div>Le modifiche sono state applicate con successo.</div>').dialog({
						title: 'Dettaglio contatto',
						modal: true,
						buttons: [
							{
								text: 'OK',
								click: function() {
									$(this).dialog("close");
								}
							}
						]
					}).on('dialogclose', function() {

						// Get back to the search panel.
						//
						Backbone.history.navigate('contacts', true);
					});
				}
			});

			// Manage model validation error.
			//
			this.resetFieldErrors();
			if(!valid) {
				this.setFormErrors(this.model.validationError);
			}
		},

		onContactPickerSelect: function(id) {

			var that = this;

			// Fetch the selected contact.
			//
			var contact = new ContactModel({ _id: id});
			contact.fetch({
				success: function() {

					// Update the model.
					//
					addressee = {
						idContact: id,
						description: contact.get('description') || (contact.get('firstName') + ' ' + contact.get('lastName')),
						address1: contact.get('address1'),
						address2: contact.get('address2'),
						zipCode: contact.get('zipCode'),
						city: contact.get('city'),
						county: contact.get('county'),
						cfCode: contact.get('cfCode'),
						vatCode: contact.get('vatCode')
					};

					that.model.set('addressee', addressee);
					that.modelToForm();
				}
			})
		},

		// Clear previous validation errors from form fields.
		//
		resetFieldErrors: function () {

			this.resetFieldError('#isCompany');
			this.resetFieldError('#vatCode');
			this.resetFieldError('#cfCode');
			this.resetFieldError('#description');
			this.resetFieldError('#salutation');
			this.resetFieldError('#firstName');
			this.resetFieldError('#lastName');
			this.resetFieldError('#address1');
			this.resetFieldError('#address2');
			this.resetFieldError('#city');
			this.resetFieldError('#county');
			this.resetFieldError('#zipCode');
			this.resetFieldError('#country');
			this.resetFieldError('#phone');
			this.resetFieldError('#fax');
			this.resetFieldError('#email');
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
				break;

				// Price.
				//
				case 4:
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

			// No validation problem detected.
			//
			return false;
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
			$(this.editing)
				.empty()
				.closest('table')
				.DataTable()
				.cell(this.editing)
				.data(data);

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

			// Specialize the field in certain cases.
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
				this.$('#moveUp').button('option', 'disabled', false);
				this.$('#moveDown').button('option', 'disabled', false);
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
					this.$('#moveUp').button('option', 'disabled', true);
					this.$('#moveDown').button('option', 'disabled', true);
				} else {
					tr.siblings('tr.selected').removeClass('selected');
					tr.addClass('selected');
					this.$('#moveUp').button('option', 'disabled', false);
					this.$('#moveDown').button('option', 'disabled', false);
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
		}
	});

	return DetailView;
});
