/**
 * InputTextView.js
 */

this.typ0 = this.typ0 || {};

typ0.InputTextView = function(parentView) {
	typ0.View.call(this);

	this.playerInput = new typ0.PlayerInput();
	
	this.isDirty = true;
}

var p = typ0.InputTextView.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.InputTextView;

p.widgetHtml = "\
<div class='inputPrompt'>\
	<div class='prompt'>input</div>\
	<div class='promptSeparator'>&gt;&gt;</div>\
	<div class='lineOfCode' id='inputLineOfCode'></div>\
	<div class='caret' id='inputLineOfCodeCaret'>_</div>\
</div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.inputLineOfCodeElmnt = this.rootElmnt.find("#inputLineOfCode");

	// Make sure this widget is in sync (between player input and display).
	this.update();

	// Set up keyboard event handling functions.
	this.keyDownEventHandler = (function(closureThis) {
		return function(keyEvent) {
			closureThis.onKeyDownEvent(keyEvent);
		};
	})(this);
	$(document).keydown(this.keyDownEventHandler);

	this.keyPressEventHandler = (function(closureThis) {
		return function(keyEvent) {
			closureThis.onKeyPressEvent(keyEvent);
		};
	})(this);
	$(document).keypress(this.keyPressEventHandler);
	
	// Set the dirty flag.
	this.isDirty = true;
}

p.detach = function() {
	console.log("Detaching...");
	this.ancestor.detach.call(this);

	// Remove keyboard event listeners.
	$(document).unbind('keydown', this.keyDownEventHandler);
	$(document).unbind('keypress', this.keyPressEventHandler);
}

p.update = function() {
	if (this.isDirty) {
		this.inputLineOfCodeElmnt.empty( );
	
		for (var i = 0, len = this.playerInput.nodes.length; i < len; i++) {
			this.inputLineOfCodeElmnt.append(this.playerInput.nodes[i]);
		}
		
		this.isDirty = false;
	}
}

p.onKeyDownEvent = function(keyEvent) {
	switch (keyEvent.which) {
	case 8: // Backspace.
		this.playerInput.remove();
		this.isDirty = true;

		return this.cancelKeyboardEvent(keyEvent);
	case 9: // Tab.
		return this.cancelKeyboardEvent(keyEvent);
	case 13: // Enter.
		new typ0.SimpleEventBus().notify(typ0.GameScreen.INPUT_SUBMITTED_EVENT,
				{
					data : this.playerInput
				});
		
		this.isDirty = true;

		return this.cancelKeyboardEvent(keyEvent);
	default:
		// Do nothing, passing the handling of the input on to onKeyPress.
		return;
	}
}

p.cancelKeyboardEvent = function(keyEvent) {
	// Prevent any further handling of the event.
	keyEvent.preventDefault();
	return false;
}

p.onKeyPressEvent = function(keyEvent) {
	var stringValue = String.fromCharCode(keyEvent.which);
	this.playerInput.add(stringValue);

	this.isDirty = true;

	// Prevent any further handling of the event.
	keyEvent.preventDefault();
	return false;
}
