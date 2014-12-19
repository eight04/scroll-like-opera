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
	scrollOverflowHidden: false
};

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
		return {
			element: element,
			onScrollbarX: e.clientY >= rect.top + element.clientHeight,
			scrollableX: element.scrollWidth > element.offsetWidth,
			scrollableY: element.scrollHeight > element.offsetHeight,
			scrollerX: element.offsetHeight > element.clientHeight,
			scrollerY: element.offsetWidth > element.clientWidth
		};
	}
	
	return {
		
	};
}

window.addEventListener("wheel", function(e){
	var node = getScrollInfo(e.target, e);
	console.log(e);
	if (node.onScrollbarX) {
		e.preventDefault();
	} else if (node.scrollableX && !node.scrollableY && config.scrollWidthHorizontalScrollbar) {
		if (node.scrollerX || config.scrollOverflowHidden) {
			e.preventDefault();
		}
	} else if (!node.scrollerY && node.scrollableY && config.scrollOverflowHidden) {
		e.preventDefault();
	} else if (config.scrollContentOnly) {
//		e.preventDefault();
	}
});
