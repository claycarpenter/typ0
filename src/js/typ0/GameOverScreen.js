/**
 * GameOverScreen.js
 */

this.typ0 = this.typ0 || {};

typ0.GameOverScreen = function() {
	typ0.View.call(this);
}

var p = typ0.GameOverScreen.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.GameOverScreen;

p.widgetHtml = "\
<div>\
	<div style='display:inline-block; width: 500px; vertical-align:top;' id='promptContainerElmnt'/>\
	<div style='display:inline-block;' id='scoreContainerElmnt'/>\
</div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.promptContainerElmnt = this.rootElmnt.find("#promptContainerElmnt");
	this.scoreContainerElmnt = this.rootElmnt.find("#scoreContainerElmnt");

	this.systemPromptView = new typ0.SystemPromptView();
	this.systemPromptView.attach(this.promptContainerElmnt);
	this.systemPromptView.setContent("<span>Game Over!</span>");

	this.scoreView = new typ0.ScoreView();
	this.scoreView.attach(this.scoreContainerElmnt);

	this.registerEventHandlers();
}

p.registerEventHandlers = function() {
	this.restartButtonEventHandler = (function(closureThis) {
		return function(mouseEvent) {
			closureThis.onClickRestartButton(mouseEvent);
		};
	})(this);
	typ0.SimpleEventBus.getInstance().subscribe(
			typ0.Game.Events.User.USER_INPUT_GAME_RESTART,
			this.restartButtonEventHandler);
}

p.deregisterEventHandlers = function() {
	typ0.SimpleEventBus.getInstance().unsubscribe(
			typ0.Game.Events.User.USER_INPUT_GAME_RESTART,
			this.restartButtonEventHandler);
}

p.onClickRestartButton = function() {
	typ0.SimpleEventBus.getInstance().notify(
			typ0.Game.Events.Game.GAME_STATE_CHANGE,
			typ0.Game.States.GAME_READY);
}
