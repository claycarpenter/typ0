/**
 * SimpleEventBus.js
 */

this.typ0 = this.typ0 || {};

(function() {
	var instance;

	typ0.SimpleEventBus = function() {
		if (instance) {
			return instance;
		}

		instance = this;

		this.subscribers = {};
	};
})();

var p = typ0.SimpleEventBus.prototype;

typ0.SimpleEventBus.getInstance = p.getInstance = function() {
	return new typ0.SimpleEventBus();
}

p.subscribe = function(topic, callback) {
	if (!this.subscribers[topic]) {
		this.subscribers[topic] = [];
	}

	this.subscribers[topic].push(callback);
}

p.unsubscribe = function(topic, callback) {
	var topicSubscribers = this.subscribers[topic];
	if (!topicSubscribers || topicSubscribers.indexOf(callback) == -1) {
		// Topic, callback pair cannot be found. Throw an error.
		throw new Error(
				"Cannot find callback registered as subscriber to topic '"
						+ topic + "'");
	}

	// Remove the subscriber (callback).
	topicSubscribers.splice(topicSubscribers.indexOf(callback), 1);
}

p.notify = function(topic, payload) {
	if (this.subscribers[topic]) {
		for (i = 0, len = this.subscribers[topic].length; i < len; i++) {
			var callback = this.subscribers[topic][i];
			callback(payload);
		}
	}
}

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

/**
 * SystemPromptView.js
 */

this.typ0 = this.typ0 || {};

typ0.SystemPromptView = function(parentView) {
	typ0.View.call(this);
}

var p = typ0.SystemPromptView.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.SystemPromptView;

p.widgetHtml = "\
	<div>\
		<div>\
			<div class='prompt'>system</div>\
			<div class='promptSeparator'>&gt;&gt;</div>\
			<div class='lineOfCode' id='systemPrompt'></div>\
		</div>\
	</div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.systemPromptElmnt = this.rootElmnt.find("#systemPrompt");
}

p.setContent = function(newContent) {
	var parsedContent = $(newContent);
	
	this.systemPromptElmnt.empty();
	this.systemPromptElmnt.append(parsedContent);
}

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

/**
 * LineOfCode.js
 */

this.typ0 = this.typ0 || {};

typ0.LineOfCode = function(lineNumber, content) {
	this.lineNumber = lineNumber || -1;
	this.content = content || "";
}

/**
 * TestCode.js
 */

this.typ0 = this.typ0 || {};

var TestCode = function() {
	this.init();
}

var p = TestCode.prototype;

p.TEST_LINES_TOTAL = 10;

p.init = function() {
	this.testLines = [];

	this.resetCurrentLine();

	this.filename = null;
}

p.setContents = function(rawFileData) {
	var rawContentLines = rawFileData.split("\n");
	var candidateLines = [];
	this.testLines = [];

	// Purge invalid, duplicate lines from candidate lines.
	for ( var i = 0, len = rawContentLines.length; i < len; i++) {
		var lineContent = rawContentLines[i].trim();

		if (this.isValidLineOfCode(candidateLines, lineContent)) {
			var lineOfCode = new typ0.LineOfCode(i + 1, lineContent);
			candidateLines.push(lineOfCode);
		}
	}

	// Ensure that there are enough candidate lines to supply the full set of
	// test lines.
	if (candidateLines.length < this.TEST_LINES_TOTAL) {
		// TODO: This needs to be handled better, most likely be moving the game
		// to an "error" state and allowing the user to submit another file.
		throw new Error("Invalid file.");
	}

	// Fill the set of test lines at random.
	console.log("Selecting these lines:");
	while (this.testLines.length < this.TEST_LINES_TOTAL) {
		var randomLineIndex = Math.floor(Math.random() * candidateLines.length);

		console.log("-- #", candidateLines[randomLineIndex].lineNumber, " - ",
				candidateLines[randomLineIndex].content);
		this.testLines.push(candidateLines[randomLineIndex]);

		// Remove the selected line from the candidate lines pool.
		candidateLines.splice(randomLineIndex, 1);
	}
}

p.isValidLineOfCode = function(candidateLines, lineContent) {
	// Check to see if the line of code is already included in the test lines
	// set.
	for ( var i = 0, len = candidateLines.length; i < len; i++) {
		if (lineContent == candidateLines[i].content) {
			// Detected a duplicate, return false (invalid line of code).
			return false;
		}
	}

	// Line is unique, check that its content is valid.
	return this.isLineContentValid(lineContent);
}

p.isLineContentValid = function(lineContent) {
	lineContent = lineContent.trim();

	// Do a simple check for the length of the trimmed line content.
	if (lineContent.length <= 3) {
		return false;
	}

	if (lineContent.length > 30) {
		return false;
	}

	return true;
}

p.moveToNextLine = function() {
	console.log("line idx: ", this.currentLineIndex, "; TOTAL: ",
			this.TEST_LINES_TOTAL);

	this.currentLineIndex++;

	if (this.currentLineIndex == this.TEST_LINES_TOTAL) {
		typ0.SimpleEventBus.getInstance().notify(
				typ0.Game.Events.Game.GAME_STATE_CHANGE,
				typ0.Game.States.GAME_OVER);
	}
}

p.getCurrentLine = function() {
	return this.testLines[this.currentLineIndex];
}

p.resetCurrentLine = function() {
	this.currentLineIndex = 0;
}

p.getTotalLineCount = function() {
	return this.testLines.length;
}

p.randomizeTestLines = function() {
	for ( var i = 0, len = this.testLines.length; i < len; i++) {
		// Create a random line index within the test lines array.
		var randomLineIndex = Math.floor(Math.random() * this.testLines.length);

		// Swap the positions of the elements at the current/loop and random
		// line indexes.
		var temp = this.testLines[randomLineIndex];
		this.testLines[randomLineIndex] = this.testLines[i];
		this.testLines[i] = temp;
	}
}

typ0.TestCode = TestCode;

/**
 * PlayerInput.js
 */

this.typ0 = this.typ0 || {};

typ0.PlayerInput = function() {
	this.values = [];
	this.nodes = [];
};

var p = typ0.PlayerInput.prototype;

p.add = function(newValue) {
	// Add the string value.
	this.values.push(newValue);

	// Create a (styleable) DOM node representing the value.
	// If the new value is a space, replace it with the HTML (non-breaking)
	// space entity.
	var htmlValue = newValue != " " ? newValue : "&nbsp;";

	// Wrap the new value in a span element and store the jQuery parse result.
	var newNode = $("<span>" + htmlValue + "</span>");

	if (!this.validateInput(newValue, this.values.length - 1)) {
		newNode.addClass("error");
	}

	this.nodes.push(newNode);
}

p.remove = function() {
	// Remove the final string value and corresponding DOM node.
	this.values.pop();
	this.nodes.pop();
}

p.validateInput = function(inputValue, positionIndex) {
	var targetLineOfCode = typ0.Game.getInstance().testCode.getCurrentLine();
	var targetSections = targetLineOfCode.content.split("");

	if (inputValue == targetSections[positionIndex]) {
		return true;
	}

	return false;
}

p.createHighlightedInput = function() {
	if (this.playerInput.length == 0) {
		return $("");
	}

	var inputArrayClone = this.playerInput.slice(0, this.playerInput.length);

	var targetLineOfCode = typ0.Game.getInstance().testCode
			.getHighlightedLine();
	var targetSections = targetLineOfCode.split("");

	var displayValue, origValue;
	for (i = 0, len = inputArrayClone.length; i < len; i++) {
		origValue = inputArrayClone[i];

		displayValue = origValue;
		if (displayValue == " ") {
			displayValue = "&nbsp;";
		}

		inputArrayClone[i] = $("<span>" + displayValue + "</span>");
		var targetSection = targetSections[i] || null;
		if (origValue != targetSection) {
			inputArrayClone[i].addClass("error");
		}
	}

	return inputArrayClone;
}

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

/**
 * TargetCodeView.js
 */

this.typ0 = this.typ0 || {};

typ0.TargetCodeView = function() {
	typ0.View.call(this);
}

var p = typ0.TargetCodeView.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.TargetCodeView;

p.widgetHtml = "\
<div>\
	<div class='prompt'>target</div>\
	<div class='promptSeparator'>&gt;&gt;</div>\
	<div class='lineOfCode' id='targetLineOfCode'></div>\
</div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.targetCodeElmnt = this.rootElmnt.find("#targetLineOfCode");

	this.update();
}

p.update = function() {
	var targetLineOfCode = typ0.Game.getInstance().testCode.getCurrentLine();
	this.targetCodeElmnt.text(targetLineOfCode.content);
}

/**
 * ScoreView.js
 */

this.typ0 = this.typ0 || {};

typ0.ScoreView = function() {
	typ0.View.call(this);
}

var p = typ0.ScoreView.prototype = new typ0.View();
p.ancestor = typ0.View.prototype;
p.constructor = typ0.ScoreView;

p.widgetHtml = "\
<div>\
	<div>\
		<div class='scoreViewLabel'>score:</div>\
		<div class='scoreViewValue' id='scoreElmnt'>0000</div>\
	</div>\
	<div>\
		<div class='scoreViewLabel'>errors:</div>\
		<div class='scoreViewValue error' id='errorsElmnt'>0000</div>\
	</div>\
	<div>\
		<div class='scoreViewLabel'>line:</div>\
		<div class='scoreViewValue' id='lineCountElmnt'></div>\
	</div>\
	<div>\
		<div class='scoreViewLabel'>time:</div>\
		<div class='scoreViewValue' id='timeElmnt'>100s</div>\
	</div>\
</div>";

p.attach = function(parentView) {
	this.ancestor.attach.call(this, parentView);

	this.scoreElmnt = this.rootElmnt.find("#scoreElmnt");
	this.errorsElmnt = this.rootElmnt.find("#errorsElmnt");
	this.lineCountElmnt = this.rootElmnt.find("#lineCountElmnt");
	this.timeElmnt = this.rootElmnt.find("#timeElmnt");

	this.update();
}

p.detach = function() {
	this.ancestor.detach.call(this);
}

p.update = function() {
	var gameStats = typ0.Game.getInstance().gameStats;

	var paddedScore = this.padWithZeroes(gameStats.score);
	this.scoreElmnt.text(paddedScore);

	var paddedErrors = this.padWithZeroes(gameStats.errors);
	this.errorsElmnt.text(paddedErrors);

	var testCode = typ0.Game.getInstance().testCode;
	this.lineCountElmnt.text(testCode.currentLineIndex + "/"
			+ testCode.getTotalLineCount());

	var timeRemainingText = this.padDate(gameStats.timeRemaining);
	this.timeElmnt.text(timeRemainingText);
}

p.padWithZeroes = function(stringToPad) {
	var paddedString = "0000" + stringToPad;

	paddedString = paddedString.slice(-4);

	return paddedString;
}

p.padDate = function(dateInMs) {
	// Consider all "negative" dates to be zero time.
	if (dateInMs < 0) {
		dateInMs = 0;
	}
	
	var padString = "00";

	var date = new Date(dateInMs);
	var minutesPaddedString = (padString + date.getMinutes()).slice(-2);
	var secondsPaddedString = (padString + date.getSeconds()).slice(-2);

	return minutesPaddedString + ":" + secondsPaddedString;
}

/**
 * FileLoader.js
 */

this.typ0 = this.typ0 || {};

var FileLoader = function() {
}

var p = FileLoader.prototype;

p.loadFile = function(fileUploadHandle, uploadResultCallback) {
	var fileReader = new FileReader();

	fileReader.onload = (function(uploadFile, uploadResultCallback) {
		return function(fileReadEvent) {
			console.log("Read ", uploadFile.name);

			uploadResultCallback(fileReadEvent.target.result);
		}
	})(fileUploadHandle, uploadResultCallback);

	fileReader.readAsText(fileUploadHandle);
}

typ0.FileLoader = FileLoader;

/**
 * GameStats.js
 */

this.typ0 = this.typ0 || {};

typ0.GameStats = function() {
	this.score = 0;
	this.errors = 0;
	this.timeRemaining = typ0.GameStats.DEFAULT_TIME_REMAINING;
	this.lastClockTime = 0;
	this.isRunning = false;

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

typ0.GameStats.DEFAULT_TIME_REMAINING = 30 * 1000;

var p = typ0.GameStats.prototype;

p.update = function() {
	if (this.isRunning) {
		var timeElapsed = (Date.now() - this.lastClockTime);
		this.timeRemaining = this.timeRemaining - timeElapsed;
		this.lastClockTime = Date.now();

		if (this.timeRemaining <= 0) {
			typ0.SimpleEventBus.getInstance().notify(
					typ0.Game.Events.Game.GAME_STATE_CHANGE,
					typ0.Game.States.GAME_OVER);
		}
	}
}

p.onGameStateChange = function(newGameState) {
	switch (newGameState) {
	case typ0.Game.States.GAME_RUNNING:
		// Start timer.
		this.lastClockTime = Date.now();
		this.isRunning = true;

		break;
	case undefined:
	default:
		// Stop timer.
		this.isRunning = false;
	}
}

/**
 * Game.js
 */

this.typ0 = this.typ0 || {};

(function() {
	var instance;

	typ0.Game = function() {
		if (!instance) {
			instance = this;
		}

		return instance;
	};
})();

var p = typ0.Game.prototype;

typ0.Game.States = {
	MAIN_MENU : "MAIN_MENU",
	GAME_READY : "GAME_READY",
	GAME_RUNNING : "GAME_RUNNING",
	GAME_OVER : "GAME_OVER"
}

typ0.Game.Events = {
	User : {
		USER_INPUT_LOAD_FILE : "USER_INPUT_LOAD_FILE",
		USER_INPUT_GAME_START : "USER_INPUT_GAME_START",
		USER_INPUT_GAME_RESTART : "USER_INPUT_GAME_RESTART"
	},
	Game : {
		GAME_STATE_CHANGE : "GAME_STATE_CHANGE"
	}
};

typ0.Game.getInstance = p.getInstance = function() {
	return new typ0.Game();
}

p.init = function(screenContentPanelElmnt, fileUploadInput) {
	// Capture references.
	this.screenContentPanelElmnt = screenContentPanelElmnt;

	this.fileUploadInput = fileUploadInput;

	this.fileUploadInput.change((function(closureThis) {
		return function(fileEvent) {
			closureThis.handleFileSelect(fileEvent);
		};
	})(this));

	this.onLoadButtonClickedHandler = (function(closureThis) {
		return function(eventPayload) {
			console.log("Received file load request event.");
			closureThis.fileUploadInput.click();
		};
	})(this);
	typ0.SimpleEventBus.getInstance().subscribe(
			typ0.Game.Events.User.USER_INPUT_LOAD_FILE,
			this.onLoadButtonClickedHandler);

	this.onGameStateChangeHandler = (function(closureThis) {
		return function(newGameState) {
			closureThis.onGameStateChange(newGameState);
		}
	})(this);
	typ0.SimpleEventBus.getInstance().subscribe(
			typ0.Game.Events.Game.GAME_STATE_CHANGE,
			this.onGameStateChangeHandler);

	// Initialize and attach the menu buttons panel.
	this.menuButtonPanelView = new typ0.MenuButtonPanelView();
	this.menuButtonPanelView.attach($("#menuButtonsPanel"));

	// Set the game state to the main screen, and update.
	typ0.SimpleEventBus.getInstance()
			.notify(typ0.Game.Events.Game.GAME_STATE_CHANGE,
					typ0.Game.States.MAIN_MENU);
}

p.onGameStateChange = function(newGameState) {
	// TODO: This code is somewhat redundant right now.
	switch (newGameState) {
		case typ0.Game.States.MAIN_MENU:
			var screen = new typ0.MainMenuScreen();
			this.switchScreen(screen);

			break;
		case typ0.Game.States.GAME_READY:
			// Initialize the game statistics container.
			this.gameStats = new typ0.GameStats();
			this.testCode.resetCurrentLine();
			this.testCode.randomizeTestLines();

			var screen = new typ0.ReadyScreen();
			this.switchScreen(screen);

			break;
		case typ0.Game.States.GAME_RUNNING:
			var screen = new typ0.GameScreen();
			this.switchScreen(screen);

			break;
		case typ0.Game.States.GAME_OVER:
			var screen = new typ0.GameOverScreen();
			this.switchScreen(screen);

			break;
		case undefined:
		default:
			throw new Error("Game state '" + newGameState
					+ "' is not recognized");
	}
}

p.switchScreen = function(newScreen) {
	if (this.currentScreen != null) {
		this.currentScreen.detach();
	}

	this.currentScreen = newScreen;
	this.currentScreen.attach(this.screenContentPanelElmnt);
}

p.update = function() {
	if (this.promptView) {
		this.promptView.update();
	}
}

p.draw = function() {
	// Do nothing right now.
}

p.handleFileSelect = function(fileEvent) {
	console.log("File selection event captured.");

	var files = fileEvent.target.files;

	if (files.length != 1) {
		throw "Error uploading file.";
	}

	var uploadedFile = files[0];
	console.log("Uploaded file: ", uploadedFile);
	this.testCode = new typ0.TestCode();
	this.testCode.filename = uploadedFile.name;

	var fileLoader = new typ0.FileLoader();
	fileLoader.loadFile(uploadedFile, (function(closureThis) {
		return function(fileData) {
			closureThis.onDataLoad(fileData);
		};
	})(this));
}

p.onDataLoad = function(fileData) {
	console.log("File data loaded.");

	this.testCode.setContents(fileData);

	typ0.SimpleEventBus.getInstance().notify(
			typ0.Game.Events.Game.GAME_STATE_CHANGE,
			typ0.Game.States.GAME_READY);
}
