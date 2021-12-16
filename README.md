Scroll like Opera
=================
A userscript to provide Opera(old) like scrolling behavior.

Features
--------
* Scroll horizontally when the cursor hover on horizontal scrollbar.
* Scroll horizontally if there is only one horizontal scrollbar.
* Smooth scrolling.

Test page
---------
<https://rawgit.com/eight04/scroll-like-opera/master/demo.html>

Todos
-----
* Better behavior when scrolling to top/bottom?
	- Currently, if the inner element scrolled to edge, it will check outer element whether is scrollable.
	- How to guess which element we are going to scroll?
	- What does it mean when user want to scroll and unscrollable element?
* Get wrong value if the page is zoomed.

Known bugs
----------
* Chrome doesn't fire wheel event when cursor hover on window scrollbar.

Changelog
---------
* 2.1.0 (Feb 17, 2015):
	- Add a small delay to change scrolled target when scrolling to bottom/top.
* 2.0.4 (Jan 16, 2015):
	- Fix scrollable document.body bug.
* 2.0.3 (Dec 29, 2014):
	- Reload config after configure.
* 2.0.2 (Dec 29, 2014):
	- Update GM_config to 0.2.2.
* 2.0.1 (Dec 29, 2014):
	- Use a different GM_config library.
* 2.0.0 (Dec 24, 2014):
	- Stop detecting scrollbar and don't scroll `overflow:hidden` element anymore.
* 1.0.4 (Dec 23, 2014):
	- Fix typo.
* 1.0.3 (Dec 23, 2014):
	- Fix inline element.
* 1.0.2 (Dec 23, 2014):
	- Fix menu name.
* 1.0.1 (Dec 23, 2014):
	- Correct name.
* 1.0.0 (Dec 23, 2014):
	- First release.
* 0.1.0 (Dec 19, 2014):
	- Initial version.
