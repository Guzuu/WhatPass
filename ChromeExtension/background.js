var passData = {
    url: "",
    username: "",
    password: "",
    key: "temporarykey5134132dasdsd2312dad21ev1fc123e1ff231231c321e1fc"
};

chrome.runtime.onMessage.addListener(
    function (request, sender) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.loginData != null) {

            passData.url = sender.tab.url;
            passData.username = request.loginData.username;
            passData.password = request.loginData.password;

            chrome.storage.local.get("tokenInfo", function (data) {
                const params = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + data.tokenInfo
                    },
                    body: JSON.stringify(passData),
                    method: "POST"
                }

                chrome.notifications.clear(sender.tab.url); //temporary for testing
                fetch("https://localhost:44366/api/credentials/GetCreds", params)
                    .then(manageErrors)
                    .then(data => { return data.json() })
                    .then(res => {
                        console.log(res);
                        if (res.password != passData.password) {
                            chrome.notifications.create("update-" + sender.tab.url, {
                                type: 'basic',
                                iconUrl: 'WhatPass.png',
                                title: 'WhatPass',
                                message: 'Do you want to update password for ' + sender.tab.url,
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
                    })
                    .catch(error => {
                        console.log(error);
                        if (error.status == 404) {
                            chrome.notifications.create("create-" + sender.tab.url, {
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
                    });
            });
        }
    }
);

chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
    if (buttonIndex == 0) {
        chrome.storage.local.get("tokenInfo", function (data) {
            const params = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + data.tokenInfo
                },
                body: JSON.stringify(passData),
                method: "POST"
            }

            if (notificationId == "create-" + passData.url) {
                console.log("CREATE");
                fetch("https://localhost:44366/api/credentials/CreateCreds", params)
                    .then(data => { return data.json() })
                    .then(res => { console.log(res) })
                    .catch(error => console.log(error));
            }
            else if (notificationId == "update-" + passData.url) {
                console.log("UPDATE");
            }
        });
    }
});
// chrome.notifications.onClosed.addListener(function (notificationId, byUser){  Doesnt work, not important rn
//     chrome.notifications.clear(notificationId);
//     console.log('notification closed');
// });

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    chrome.storage.local.get("userName", function (data) {
        if (data.userName != null) {
            if (tab.status != "loading") { //temporary
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: injectFindAndSendEvent
                });
            }
        }
    });
});

const injectFindAndSendEvent = () => {
    var forms = document.forms;
    var loginData = {
        type: "loginEventResponse",
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

function manageErrors(response) {
    if (!response.ok) {
        const responseError = {
            statusText: response.statusText,
            status: response.status
        };
        throw (responseError);
    }
    return response;
}