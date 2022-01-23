//if user logged in run script.
chrome.runtime.onMessage.addListener(
    function (request, sender) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request.loginData);
        chrome.notifications.clear(sender.tab.url); //temporary for testing
        chrome.notifications.create(sender.tab.url, {
            type: 'basic',
            iconUrl: 'WhatPass.png',
            title: 'WhatPass',
            message: 'Do you want to save password for ' + sender.tab.url,
            priority: 2,
            requireInteraction: true,
            buttons: [
                {
                    title: "Yes"
                },
                {
                    title: "No"
                }
            ]
        });
        chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
            if (buttonIndex == 0) {
                console.log('save password');
            }
        });
        // chrome.notifications.onClosed.addListener(function (notificationId, byUser){  Doesnt work, not important rn
        //     chrome.notifications.clear(notificationId);
        //     console.log('notification closed');
        // });
    }
);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.status != "loading") { //temporary
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: injectFindAndSendEvent
        });
    }
});

const injectFindAndSendEvent = () => {
    var forms = document.forms;
    var loginData = {
        username: "",
        password: ""
    }

    Array.prototype.forEach.call(forms, form => {
        form.addEventListener("submit", function () {
            Array.prototype.forEach.call(form.elements, element => {
                if (element.type == "text" && loginData.username == "" && loginData.password == "") {
                    loginData.username = element.value;
                }
                if (element.type == "password" && loginData.password == "") {
                    loginData.password = element.value;
                }
            });
            chrome.runtime.sendMessage({ loginData });
        });
    });
}