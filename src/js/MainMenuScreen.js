/**
 * MainMenuScreen.js
 */

this.typ0 = this.typ0 || {};

typ0.MainMenuScreen = function() {
	typ0.View.call(this);
}

var p = typ0.MainMenuScreen.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.MainMenuScreen;

p.widgetHtml = "<div></div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.systemPromptView = new typ0.SystemPromptView();
	this.systemPromptView.attach(this.rootElmnt);

	this.systemPromptView
			.setContent("<span>Load file to begin program...<br/>Press &lt;ENTER&gt; to continue.</span>");

	// Register keyboard event handler.
	this.keyPressEventHandler = (function(closureThis) {
		return function(keyEvent) {
			closureThis.onKeyPress(keyEvent);
		};
	})(this);
	$(document).keypress(this.keyPressEventHandler);
}

p.detach = function() {
	this.ancestor.detach.call(this);

	// Remove keyboard event handler.
	$(document).unbind('keypress', this.keyPressEventHandler);
}

p.onKeyPress = function(keyEvent) {
	switch (keyEvent.which) {
	case 13: // Enter.
		typ0.SimpleEventBus.getInstance().notify(
				typ0.Game.Events.User.USER_INPUT_LOAD_FILE, this);

		keyEvent.preventDefault();
		return false;
	}
}
