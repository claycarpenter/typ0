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
