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
