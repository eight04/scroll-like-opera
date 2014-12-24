// ==UserScript==
// @name        Scroll like Opera
// @description	An userscript to provide Opera(old) like scrolling behavior.
// @namespace   eight04.blogspot.com
// @include     http*
// @version     1.0.4
// @require 	https://greasyfork.org/scripts/1884-gm-config/code/GM_config.js?version=4836
// @require		https://greasyfork.org/scripts/7108-bezier-easing/code/bezier-easing.js?version=29098
// @grant       GM_setValue
// @grant		GM_getValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

(function(){

	"use strict";

	var config = {
		useWhenOnScrollbar: true,
		useWhenOneScrollbar: true,
		alwaysUse: false,
		scrollDelay: 400,
		scrollOffset: 120
	};

	initConfig(config);

	/**
		Register event
	*/
	window.addEventListener("wheel", function(e){
		var q = getScrollInfo(e.target, e);
		console.log(q);
		if (q && (q.use || config.alwaysUse)) {
			e.preventDefault();
			scroll(q.element, q.offsetX, q.offsetY);
		}
	});

	/**
		Main logic
	*/
	function getInfo(element, e) {
		var rect, css;

		if (element != document.documentElement) {

			rect = element.getBoundingClientRect();
			css = getCss(element);

			return {
				element: element,
				onScrollbarX: element.clientHeight && e.clientY >= rect.top + css.borderTop + element.clientHeight && e.clientY <= rect.bottom - css.borderBottom,
				scrollableX: element.clientWidth && element.scrollWidth > element.clientWidth && css.overflowX != "visible" && css.overflowX != "hidden",
				scrollableY: element.clientHeight && element.scrollHeight > element.clientHeight && css.overflowY != "visible" && css.overflowY != "hidden",
				scrollerX: element.clientHeight && element.offsetHeight - css.borderTop - css.borderBottom > element.clientHeight,
				scrollerY: element.clientWidth && element.offsetWidth - css.borderLeft - css.borderRight > element.clientWidth
			};

		} else {

			return {
				element: element,
				onScrollbarX: e.clientY >= element.clientHeight && e.clientY <= window.innerHeight,
				scrollableX: element.scrollWidth > element.clientWidth,
				scrollableY: element.scrollHeight > element.clientHeight,
				scrollerX: window.innerHeight - element.clientHeight,
				scrollerY: window.innerWidth - element.clientWidth
			};
		}
	}

	function getScrollInfo(element, e) {
		var q;

		// Get scrollable parent
		while (element) {

			q = getInfo(element, e);

			if (e.deltaY && (q.onScrollbarX || useHorizontalScroll(q)) && scrollable(element, e.deltaY, 0)) {
				// Horizontal scroll
				q.offsetX = getOffset(e.deltaY);
				q.offsetY = 0;
				q.use = true;
				return q;
			}

			if ((e.deltaX && q.scrollableX || e.deltaY && q.scrollableY) && scrollable(element, e.deltaX, e.deltaY)) {
				if (e.deltaX && q.scrollerX || e.deltaY && q.scrollerY) {
					// Usual cases
					q.offsetX = getOffset(e.deltaX);
					q.offsetY = getOffset(e.deltaY);
					return q;
				}
				if (config.scrollOverflowHidden && (e.deltaX && !q.scrollerX || e.deltaY && !q.scrollerY)) {
					// Scroll hidden
					q.offsetX = getOffset(e.deltaX);
					q.offsetY = getOffset(e.deltaY);
					q.use = true;
					return q;
				}
			}

			element = element.parentNode;
			if (element == document) {
				return null;
			}
		}

		return null;
	}

	/**
		Scroll function. Should I put them into seperate library?
		Thanks to https://github.com/galambalazs/smoothscroll
	*/
	var animate = null;
	var que = [];
	function scroll(element, x, y) {
		var elapsed = config.scrollDelay;

		que.push({
			offsetX: x,
			offsetY: y,
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
					scrollBy(q.element, q.offsetX - q.lastX, q.offsetY - q.lastY);
				} else {
					time = (timestamp - q.timeStart) / elapsed;
					process = ease(time);
					offsetX = Math.floor(q.offsetX * process);
					offsetY = Math.floor(q.offsetY * process);

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

	/**
		Helpers
	*/
	function useHorizontalScroll(q) {
		if (!config.scrollHorizontallyWithScrollbar) {
			return false;
		}
		if (config.scrollOverflowHidden && !q.scrollerX && !q.scrollerY) {
			return q.scrollableX && !q.scrollableY;
		}
		return q.scrollerX && (!q.scrollerY || !q.scrollableY);
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

	function ease(t){
		return BezierEasing.css.ease(t);
	}

	function getCss(element){
		var css = getComputedStyle(element);

		return {
			borderTop: parseInt(css.getPropertyValue("border-top-width"), 10),
			borderRight: parseInt(css.getPropertyValue("border-right-width"), 10),
			borderBottom: parseInt(css.getPropertyValue("border-bottom-width"), 10),
			borderLeft: parseInt(css.getPropertyValue("border-left-width"), 10),
			overflowX: css.getPropertyValue("overflow-x"),
			overflowY: css.getPropertyValue("overflow-y")
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

	function scrollBy(element, x, y) {
		if (element != document.documentElement) {
			element.scrollLeft += x;
			element.scrollTop += y;
		} else {
			window.scrollBy(x, y);
		}
	}

	function initConfig(config) {
		GM_config.init(
			"Scroll like Opera",
			{
				scrollHorizontallyWithScrollbar: {
					label: "Scroll horizontally if only horizontal scrollbar presented.",
					type: "checkbox",
					default: true
				},
				scrollOverflowHidden: {
					label: "Make overflow:hidden element scrollable.",
					type: "checkbox",
					default: false
				},
				alwaysUse: {
					label: "Always use script's scrolling handler. Enable this if you want to use the script's smooth scrolling on chrome.",
					type: "checkbox",
					default: false
				},
				scrollDelay: {
					label: "Smooth scrolling dealy.",
					type: "text",
					default: 400
				},
				scrollOffset: {
					label: "Scrolling offset.",
					type: "text",
					default: 120
				}
			}
		);

		config.scrollHorizontallyWithScrollbar = GM_config.get("scrollHorizontallyWithScrollbar");
		config.scrollOverflowHidden = GM_config.get("scrollOverflowHidden");
		config.alwaysUse = GM_config.get("alwaysUse");
		config.scrollDelay = +GM_config.get("scrollDelay");
		config.scrollOffset = +GM_config.get("scrollOffset");

		GM_registerMenuCommand("Scroll like Opera - Configure", function(){
			GM_config.open();
		});
	}
})();
