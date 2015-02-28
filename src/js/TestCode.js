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
