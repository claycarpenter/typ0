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
