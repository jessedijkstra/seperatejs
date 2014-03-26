(function(root, factory) {
	// Set up seperateTouchAndMouseEvents appropriately for the environment. Start with AMD.
	if (typeof define === 'function' && define.amd) {
		define(['exports'], function(exports) {
			// Export global even in AMD case in case this script is loaded with
			// others that may still expect a global seperateTouchAndMouseEvents.
			root.seperateTouchAndMouseEvents = factory(root, exports);
		});

	// Next for Node.js or CommonJS
	} else if (typeof exports !== 'undefined') {
		factory(root, exports);

	// Finally, as a browser global.
	} else {
		root.seperateTouchAndMouseEvents = factory(root, {});
	}

}(this, function(root, seperateTouchAndMouseEvents) {

	'use strict';

	// Custom Events
	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };

		var evt = document.createEvent( 'CustomEvent' );

		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );

		return evt;
	};

	CustomEvent.prototype = window.Event.prototype;

	// Prefix events
	function prefixedEvent(prefix, type, element, event) {
		var newEvent = new CustomEvent(prefix + type, {
			detail: event,
			bubbles: event.bubbles,
			cancelable: event.cancelable
		});

		element.dispatchEvent(newEvent);
	}

	/**
	 * attach 'mouse' and 'touch' events for a type to an element to differentiate
	 * between mouse and touch clicks. i.e.: seperateTouchAndMouseEvents('click', element)
	 * creates 'mouseclick' and 'touchclick' events.
	 *
	 * @param {DOMelement} Element to differentiate event types on
	 * @param {type} The original event type to differentiate for
	 * @return CustomEvent Custom events return the original event in customEvent.detail
	 */

	function seperateTouchAndMouseEvents(element, type) {
		var touch = false, touchTimeout;


		// Clear the timeout
		function touchStart() {
			clearTimeout(touchTimeout);

			touch = true;
		};

		// Ensure that touch detection is enabled when the user drags or swipes
		function touchEnd() {
			touchTimeout = setTimeout(function() {
				touch = false;
			}, 1000);
		};

		// Windows 8 IE10+ implementation that detached pointer event types
		function pointerDown(event) {
			if (event.pointerType === 'touch') {
				touchStart();
			}
		};

		function pointerUp(event) {
			if (event.pointerType === 'touch') {
				touchEnd();
			}
		};

		// Detect touch on IE10 & IE11
		if(window.navigator.msPointerEnabled || window.navigator.pointerEnabled) {
			element.addEventListener('MSPointerDown', pointerDown);
			element.addEventListener('PointerDown', pointerDown);

			element.addEventListener('MSPointerUp', pointerUp);
			element.addEventListener('PointerUp', pointerUp);
		}

		// Detect touch on touch enables devices
		if('ontouchstart' in window || 'onmsgesturechange' in window) {
			element.addEventListener('touchstart', touchStart);
			element.addEventListener('touchend', touchEnd);
		}

		// Detect a click event and simulate a touchclick and mouseclick event
		element.addEventListener(type, function (event) {
			if(touch) {
				prefixedEvent('touch', type, element, event);

				touch = false;
				clearTimeout(touchTimeout);
			} else {
				prefixedEvent('mouse', type, element, event);
			}
		});
	}

	return seperateTouchAndMouseEvents;
}));