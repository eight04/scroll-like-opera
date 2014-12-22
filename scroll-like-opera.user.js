// ==UserScript==
// @name        Scroll like Opera
// @description	An userscript to provide Opera(old) like scrolling behavior.
// @namespace   eight04.blogspot.com
// @include     http*
// @version     0.1.0
// @grant       none
// ==/UserScript==

(function(){

"use strict";

var config = {
	scrollWidthHorizontalScrollbar: true,
	scrollOverflowHidden: true,
	alwaysUse: false,
	scrollingElapsed: 400,
	scrollOffset: 120
};

function ease(t){
	return BezierEasing.css.ease(t);
}

function getBorder(element){
	var css = getComputedStyle(element);

	return {
		top: parseInt(css.getPropertyValue("border-top-width"), 10),
		right: parseInt(css.getPropertyValue("border-right-width"), 10),
		bottom: parseInt(css.getPropertyValue("border-bottom-width"), 10),
		left: parseInt(css.getPropertyValue("border-left-width"), 10)
	};
}

function getScrollInfo(element, e) {
	// Get scrollable parent
	while (element) {
		if (element.offsetHeight > element.clientHeight || element.offsetWidth > element.clientWidth) {
			break;
		}
		element = element.parentNode;
	}

	if (!element) {
		return null;
	}

	if (element != document.documentElement) {
		var rect = element.getBoundingClientRect();
		var border = getBorder(element);
		return {
			element: element,
			onScrollbarX: e.clientY >= rect.top + border.top + element.clientHeight && e.clientY <= rect.bottom - border.bottom,
			scrollableX: element.scrollWidth > element.clientWidth,
			scrollableY: element.scrollHeight > element.clientHeight,
			scrollerX: element.offsetHeight - border.top - border.bottom > element.clientHeight,
			scrollerY: element.offsetWidth - border.left - border.right > element.clientWidth
		};
	}

	return {
		element: element,
		onScrollBarX: e.clientY >= element.clientHeight && e.clientY <= window.innerHeight,
		scrollableX: element.scrollWidth > element.clientWidth,
		scrollableY: element.scrollHeight > element.clientHeight,
		scrollerX: window.innerHeight - element.clientHeight,
		scrollerY: window.innerWidth - element.clientWidth
	};
}

function scrollable(element, offsetX, offsetY) {
	var top, left;
	if (element == document.documentElement) {
		top = window.scrollY;
		left = window.scrollX;
	} else {
		top = element.scrollTop;
		left = element.scrollLeft;
	}

	if (top == 0 && offsetY < 0) {
		return false;
	}
	if (left == 0 && offsetX < 0) {
		return false;
	}
	if (top + element.clientHeight >= element.scrollHeight && offsetY > 0) {
		return false;
	}
	if (left + element.clientWidth >= element.scrollWidth && offsetX > 0) {
		return false;
	}
	return true;
}

function getOffset(delta) {
	var direction = 0;
	if (delta > 0) {
		direction = 1;
	} else if (delta < 0) {
		direction = -1;
	}
	return direction * config.scrollOffset;
}

function scrollBy(element, x, y) {
	if (element != document.documentElement) {
		element.scrollLeft += x;
		element.scrollTop += y;
	} else {
		window.scrollBy(x, y);
	}
}

var animate = null;
var que = [];
function scroll(element, deltaX, deltaY) {
	var elapsed = config.scrollingElapsed;

	que.push({
		offsetX: getOffset(deltaX),
		offsetY: getOffset(deltaY),
		lastX: 0,
		lastY: 0,
		element: element,
		timeStart: null
	});

	if (animate != null) {
		return;
	}

	function animation(timestamp){
		var i, j, len, q, time, offsetX, offsetY, process, swap;

		swap = [];

		for (i = 0, j = 0, len = que.length; i < len; i++) {
			q = que[i];
			if (q.timeStart == null) {
				q.timeStart = timestamp;
			}
			if (timestamp - q.timeStart >= elapsed || !scrollable(q.element, q.offsetX, q.offsetY)) {
				q.element.scrollLeft += q.offsetX - q.lastX;
				q.element.scrollTop += q.offsetY - q.lastY;
			} else {
				time = (timestamp - q.timeStart) / config.scrollingElapsed;
				process = ease(time);
				offsetX = q.offsetX * process;
				offsetY = q.offsetY * process;

				scrollBy(q.element, offsetX - q.lastX, offsetY - q.lastY);

				q.lastX = offsetX;
				q.lastY = offsetY;
				swap[j++] = q;
			}
		}

		que = swap;
		if (!que.length) {
			animate = null;
			return;
		}

		animate = requestAnimationFrame(animation);
	}
	animate = requestAnimationFrame(animation);
}

window.addEventListener("wheel", function(e){
	var node = getScrollInfo(e.target, e);
	if (node.onScrollbarX) {
		e.preventDefault();
		scroll(node.element, e.deltaY, 0);
	} else if (node.scrollableX && (!node.scrollerY || !node.scrollableY) && config.scrollWidthHorizontalScrollbar &&
			(node.scrollerX || !node.scrollableY && config.scrollOverflowHidden)) {
		e.preventDefault();
		scroll(node.element, e.deltaY, 0);
	} else if (!node.scrollerY && node.scrollableY && config.scrollOverflowHidden) {
		e.preventDefault();
		scroll(node.element, 0, e.deltaY);
	} else if (config.alwaysUse) {
		e.preventDefault();
		scroll(node.element, 0, e.deltaY);
	}
});

})();
