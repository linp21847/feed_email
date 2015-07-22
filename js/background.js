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

chrome.runtime.onInstalled.addListener(function(details){
	var thisVersion = chrome.runtime.getManifest().version;
    if(details.reason == "install"){
        console.log("First install. Version is " + thisVersion);
    }else if(details.reason == "update"){
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
    localStorage.setItem("started", JSON.stringify(false));
    chrome.runtime.openOptionsPage(function() {
    	console.log("Options page opened.");
    });
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