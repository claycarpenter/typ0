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
