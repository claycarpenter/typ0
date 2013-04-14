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
