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
