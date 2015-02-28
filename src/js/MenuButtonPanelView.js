/**
 * MenuButtonPanelView.js
 */

this.typ0 = this.typ0 || {};

typ0.MenuButtonPanelView = function() {
	typ0.View.call(this);
}

var p = typ0.MenuButtonPanelView.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.MenuButtonPanelView;

p.widgetHtml = "<div></div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	// Find and capture references to the three main menu buttons.
	this.loadButtonView = new typ0.MenuButtonView();
	this.loadButtonView.label = "load";
	this.loadButtonView.onClickEventTopic = typ0.Game.Events.User.USER_INPUT_LOAD_FILE;
	this.loadButtonView.attach(this.rootElmnt);

	this.startButtonView = new typ0.MenuButtonView();
	this.startButtonView.label = "start";
	this.startButtonView.onClickEventTopic = typ0.Game.Events.User.USER_INPUT_GAME_START;
	this.startButtonView.attach(this.rootElmnt);

	this.resetButtonView = new typ0.MenuButtonView();
	this.resetButtonView.label = "restart";
	this.resetButtonView.onClickEventTopic = typ0.Game.Events.User.USER_INPUT_GAME_RESTART;
	this.resetButtonView.attach(this.rootElmnt);

	// Set up the game state change listener.
	this.onGameStateChangeHandler = (function(closureThis) {
		return function(newGameState) {
			closureThis.onGameStateChange(newGameState);
		};
	})(this);
	typ0.SimpleEventBus.getInstance().subscribe(
			typ0.Game.Events.Game.GAME_STATE_CHANGE,
			this.onGameStateChangeHandler);
}

p.detach = function() {
	this.ancestor.detach.call(this);

	this.loadButtonView.detach();
	this.startButtonView.detach();
	this.resetButtonView.detach();
}

p.onGameStateChange = function(newGameState) {
	switch (newGameState) {
	case typ0.Game.States.MAIN_MENU:
		this.loadButtonView.enable();
		this.startButtonView.disable();
		this.resetButtonView.disable();

		break;
	case typ0.Game.States.GAME_READY:
		this.loadButtonView.enable();
		this.startButtonView.enable();
		this.resetButtonView.disable();

		break;
	case typ0.Game.States.GAME_RUNNING:
	case typ0.Game.States.GAME_OVER:
		this.loadButtonView.enable();
		this.startButtonView.disable();
		this.resetButtonView.enable();

		break;
	case undefined:
	default:
		throw new Error("Game state '" + newGameState + "' is not recognized");
	}
}
