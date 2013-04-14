/**
 * GameScreen.js
 */

this.typ0 = this.typ0 || {};

typ0.GameScreen = function() {
	typ0.View.call(this);
}

var p = typ0.GameScreen.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.GameScreen;

p.widgetHtml = "\
<div>\
	<div style='display:inline-block; width: 500px;' id='promptContainerElmnt'/>\
	<div style='display:inline-block;' id='scoreContainerElmnt'/>\
</div>";

typ0.GameScreen.INPUT_SUBMITTED_EVENT = "INPUT_SUBMITTED_EVENT";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.promptContainerElmnt = this.rootElmnt.find("#promptContainerElmnt");
	this.scoreContainerElmnt = this.rootElmnt.find("#scoreContainerElmnt");

	this.targetCodeView = new typ0.TargetCodeView();
	this.targetCodeView.attach(this.promptContainerElmnt);

	this.inputTextView = new typ0.InputTextView();
	this.inputTextView.attach(this.promptContainerElmnt);

	this.scoreView = new typ0.ScoreView();
	this.scoreView.attach(this.scoreContainerElmnt);

	this.registerEventHandlers();
}

p.registerEventHandlers = function() {
	this.onInputSubmittedHandler = (function(closureThis) {
		return function(eventPayload) {
			closureThis.onInputSubmitted(eventPayload);
		};
	})(this);
	typ0.SimpleEventBus.getInstance()
			.subscribe(typ0.GameScreen.INPUT_SUBMITTED_EVENT,
					this.onInputSubmittedHandler);

	this.restartButtonEventHandler = (function(closureThis) {
		return function(mouseEvent) {
			closureThis.onClickRestartButton(mouseEvent);
		};
	})(this);
	typ0.SimpleEventBus.getInstance().subscribe(
			typ0.Game.Events.User.USER_INPUT_GAME_RESTART,
			this.restartButtonEventHandler);

	// Start the "game loop".
	// TODO: This may not be necessary. Instead, the affected/relevant widgets
	// could simply update in response to keyboard events.
	var gameLoopClosure = (function(closureThis) {
		return function() {
			closureThis.update();
		};
	})(this);
	var FPS = 60;
	this.gameLoopIntervalId = setInterval(gameLoopClosure, 1000 / FPS);
}

p.deregisterEventHandlers = function() {
	// Stop the "game loop".
	clearInterval(this.gameLoopIntervalId);

	// Remove the Input Submitted event handler.
	typ0.SimpleEventBus.getInstance()
			.unsubscribe(typ0.GameScreen.INPUT_SUBMITTED_EVENT,
					this.onInputSubmittedHandler);

	typ0.SimpleEventBus.getInstance().unsubscribe(
			typ0.Game.Events.User.USER_INPUT_GAME_RESTART,
			this.restartButtonEventHandler);

}

p.update = function() {
	this.inputTextView.update();
	this.targetCodeView.update();
	this.scoreView.update();

	typ0.Game.getInstance().gameStats.update();
}

p.detach = function() {
	this.ancestor.detach.call(this);

	// Cascade the detach() call down to also remove children of this view.
	this.inputTextView.detach();
	this.targetCodeView.detach();
}

p.onClickRestartButton = function(mouseEvent) {
	typ0.SimpleEventBus.getInstance().notify(
			typ0.Game.Events.Game.GAME_STATE_CHANGE,
			typ0.Game.States.GAME_READY);
}

p.onInputSubmitted = function(eventPayload) {
	var goalLineOfCode = typ0.Game.getInstance().testCode.getCurrentLine().content;
	var playerInput = (eventPayload.data) ? eventPayload.data.values.join("")
			.trim() : "";

	if (playerInput === goalLineOfCode) {
		// Calculate score.
		var inputScore = this.calculateScore(goalLineOfCode, playerInput);

		typ0.Game.getInstance().gameStats.score += inputScore;
	} else {
		// Count the number of errors.
		var inputErrors = this.calculateErrors(goalLineOfCode, playerInput);

		typ0.Game.getInstance().gameStats.errors += inputErrors;
	}

	eventPayload.data.values = [];
	eventPayload.data.nodes = [];

	console.log("Getting a new line of test code.");
	typ0.Game.getInstance().testCode.moveToNextLine();
}

p.calculateScore = function(goalLineOfCode, playerInput) {
	// Calculate the base score.
	var score = playerInput.length;

	// Add extra points for each "special" character.
	var specialCharRegex = /[\[\]\{\}\;\:\,\(\)\.\=\+\-\_\'\"\/\*]/g;
	var regexResult = playerInput.match(specialCharRegex);
	if (regexResult) {
		console.log("Bonus points:", regexResult.length);
		score += regexResult.length;
	}

	return score;
}

p.calculateErrors = function(goalLineOfCode, playerInput) {
	goalCharArray = goalLineOfCode.split("");
	inputCharArray = playerInput.split("");

	var errorsCount = 0;
	for ( var i = 0, len = inputCharArray.length; i < len; i++) {
		if (!goalCharArray[i]) {
			break;
		}

		if (inputCharArray[i] != goalCharArray[i]) {
			errorsCount++;
		}
	}

	var lengthDifference = Math.abs(inputCharArray.length
			- goalCharArray.length);
	errorsCount += lengthDifference;

	return errorsCount;
}
