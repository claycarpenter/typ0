/**
 * View.js
 */

this.typ0 = this.typ0 || {};

typ0.View = function() {
}

var p = typ0.View.prototype;

p.widgetHtml = "<div></div>";

p.attach = function(parentView) {
	this.parentView = parentView;

	var parseResult = $.parseHTML(this.widgetHtml.trim())[0];
	this.rootElmnt = $(parseResult);

	this.parentView.append(this.rootElmnt);
}

p.detach = function() {
	this.rootElmnt.remove();

	this.deregisterEventHandlers();
}

p.deregisterEventHandlers = function() {
	// Stub function, do nothing.
}
