var baseURL = 'http://hearye.peacequiz.org?url=';
var emailFeed = function(tab) {
	var email = JSON.parse(localStorage.getItem("email")) || "";

	if (!email)
		return false;

	if (tab.url || tab.pageUrl)
		chrome.tabs.create({url: baseURL + encodeURIComponent(tab.url || tab.pageUrl) + '&email=' + encodeURIComponent(email)});
}

chrome.browserAction.onClicked.addListener(function(tab) {
	console.log(tab.url);
	emailFeed(tab);
});

chrome.contextMenus.create({
    "title": "Feed email address",
    "contexts": ["page", "selection", "image", "link"],
    "onclick" : emailFeed
  });

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.msg == "getCurrentTabInfo") {
			sendResponse(JSON.parse(localStorage.getItem("_activeTabInfo")));
		} else if(request.msg == "setActiveTabInfo") {
			sendResponse("ActiveTab information was updated.")
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
				localStorage.setItem("_activeTabInfo", JSON.stringify(tabs[0]));
			});
		}
	}
);