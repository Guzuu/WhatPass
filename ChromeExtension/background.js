chrome.runtime.onMessage.addListener(
    function (request, sender) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request.loginData);
        chrome.notifications.clear(sender.tab.url);
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
    }
);