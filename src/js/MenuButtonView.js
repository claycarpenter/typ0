/**
 * MenuButtonView.js
 */

this.typ0 = this.typ0 || {};

typ0.MenuButtonView = function() {
	typ0.View.call(this);

	this.label = "";
	this.onClickEventTopic = "";
	this.onClickEventPayload = null;
}

var p = typ0.MenuButtonView.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.MenuButtonView;

p.widgetHtml = "\
<div class='textButton'>\
	<span>&lt;&lt;</span>\
	<span class='menuButtonLabel' />\
	<span>&gt;&gt;</span>\
</div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.menuButtonLabelElmnt = this.rootElmnt.find(".menuButtonLabel");
	this.menuButtonLabelElmnt.text(this.label);

	this.registerEventHandlers();
}

p.registerEventHandlers = function() {
	// Deregister event handlers, if they are already present.
	if (this.onClickHandler) {
		this.deregisterEventHandlers();
	}

	// Register a click listener, and proxy those events to the onClick method.
	this.onClickHandler = (function(closureThis) {
		return function(mouseEvent) {
			closureThis.onClick(mouseEvent);
		};
	})(this);
	this.rootElmnt.bind('click', this.onClickHandler);
}

p.deregisterEventHandlers = function() {
	this.rootElmnt.unbind('click', this.onClickHandler);
}

p.onClick = function(mouseEvent) {
	typ0.SimpleEventBus.getInstance().notify(this.onClickEventTopic,
			this.onClickEventPayload);
}

p.disable = function() {
	this.deregisterEventHandlers();
	this.rootElmnt.addClass('disabled');
}

p.enable = function() {
	this.registerEventHandlers();
	this.rootElmnt.removeClass('disabled');
}
