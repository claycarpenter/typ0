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
