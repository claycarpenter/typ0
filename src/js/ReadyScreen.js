/**
 * ReadyScreen.js
 */

this.typ0 = this.typ0 || {};

typ0.ReadyScreen = function() {
	typ0.View.call(this);
}

var p = typ0.ReadyScreen.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.ReadyScreen;

p.widgetHtml = "<div></div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.systemPromptView = new typ0.SystemPromptView();
	this.systemPromptView.attach(this.rootElmnt);

	var game = typ0.Game.getInstance();
	this.systemPromptView
			.setContent("<span>File \""
					+ game.testCode.filename
					+ "\" loaded.<br/>System ready. Press &lt;ENTER&gt; to start.</span>");

	this.registerEventHandlers();
}

p.registerEventHandlers = function() {
	// Register keyboard event handler.
	this.keyPressEventHandler = (function(closureThis) {
		return function(keyEvent) {
			closureThis.onKeyPress(keyEvent);
		};
	})(this);
	$(document).keypress(this.keyPressEventHandler);

	// Register start button event handler.
	this.startButtonEventHandler = (function(closureThis) {
		return function(mouseEvent) {
			closureThis.onClickStartButton(mouseEvent);
		};
	})(this);
	typ0.SimpleEventBus.getInstance().subscribe(
			typ0.Game.Events.User.USER_INPUT_GAME_START,
			this.startButtonEventHandler);
}

p.deregisterEventHandlers = function() {
	// Remove keyboard event handler.
	$(document).unbind('keypress', this.keyPressEventHandler);

	typ0.SimpleEventBus.getInstance().unsubscribe(
			typ0.Game.Events.User.USER_INPUT_GAME_START,
			this.startButtonEventHandler);
}

p.signalStartGame = function() {
	typ0.SimpleEventBus.getInstance().notify(
			typ0.Game.Events.Game.GAME_STATE_CHANGE,
			typ0.Game.States.GAME_RUNNING);
}

p.onKeyPress = function(keyEvent) {
	switch (keyEvent.which) {
	case 13: // Enter.
		this.signalStartGame();

		keyEvent.preventDefault();
		return false;
	}
}

p.onClickStartButton = function(mouseEvent) {
	this.signalStartGame();
}
