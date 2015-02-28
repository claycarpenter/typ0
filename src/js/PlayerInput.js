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
