// ==UserScript==
// @name        Scroll like Opera
// @description	An userscript to provide Opera(old) like scrolling behavior.
// @namespace   eight04.blogspot.com
// @include     http*
// @version     0.1.0
// @grant       GM_addStyle
// ==/UserScript==

"use strict";

var config = {
	scrollWidthHorizontalScrollbar: true,
	scrollContentOnly: true,
	scrollOverflowHidden: true
};

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

window.addEventListener("wheel", function(e){
	var node = getScrollInfo(e.target, e);
	if (node.onScrollbarX) {
		console.log("on horizontal scrollbar");
		e.preventDefault();
		scroll(node.element, e.deltaY, 0);
	} else if (node.scrollableX && (!node.scrollerY || !node.scrollableY) && config.scrollWidthHorizontalScrollbar &&
			(node.scrollerX || !node.scrollableY && config.scrollOverflowHidden)) {
		console.log("horizontal scroll only");
		e.preventDefault();
		scroll(node.element, e.deltaY, 0);
	} else if (!node.scrollerY && node.scrollableY && config.scrollOverflowHidden) {
		console.log("scroll hidden");
		e.preventDefault();
		scroll(node.element, 0, e.deltaY);
	} else if (config.scrollContentOnly) {
		console.log("normal");
		e.preventDefault();
		scroll(node.element, 0, e.deltaY);
	}
	console.log(e);
});
