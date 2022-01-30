var passData = {
    url: "",
    username: "",
    password: "",
    key: ""
};

chrome.runtime.onMessage.addListener(
    function (request, sender) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.loginData.type == "loginEvent") {
            passData.url = sender.tab.url;
            passData.username = request.loginData.username;
            passData.password = request.loginData.password;

            chrome.storage.local.get(["tokenInfo", "key"], function (data) {
                passData.key = data.key;
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
                        if (res.Password != passData.password || res.Username != passData.username) {
                            chrome.notifications.create("update-" + sender.tab.url, {
                                type: 'basic',
                                iconUrl: 'WhatPass.png',
                                title: 'WhatPass',
                                message: 'Do you want to update credentials for ' + sender.tab.url,
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
            if (notificationId == "create-" + passData.url) {
                console.log("CREATE");
                const params = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + data.tokenInfo
                    },
                    body: JSON.stringify(passData),
                    method: "POST"
                }
                fetch("https://localhost:44366/api/credentials/CreateCreds", params)
                    .then(data => { return data.json() })
                    .then(res => { console.log(res) })
                    .catch(error => console.log(error));
            }
            else if (notificationId == "update-" + passData.url) {
                console.log("UPDATE");
                const params = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + data.tokenInfo
                    },
                    body: JSON.stringify(passData),
                    method: "PUT"
                }
                fetch("https://localhost:44366/api/credentials/PutCreds", params)
                    .then(res => { console.log(res) })
                    .catch(error => console.log(error));
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
                chrome.storage.local.get(["tokenInfo", "key"], function (data) {
                    passData.url = tab.url;
                    passData.key = data.key;
                    const params = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + data.tokenInfo
                        },
                        body: JSON.stringify(passData),
                        method: "POST"
                    }

                    fetch("https://localhost:44366/api/credentials/GetCreds", params)
                        .then(manageErrors)
                        .then(data => { return data.json(); })
                        .then(res => {
                            console.log(res);
                            if (res.Username != null) {
                                chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: injectCreds,
                                    args: [res]
                                });
                                chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: injectFindAndSendEvent
                                });
                            }
                            console.log("inject creds");
                        })
                        .catch(error => {
                            console.log(passData);
                            console.log(error);
                            if (error.status == 404) {
                                console.log("find creds");
                                chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: injectFindAndSendEvent
                                });
                            }
                        });
                });
            }
        }
    });
});

const injectCreds = (loginData) => {
    var forms = document.forms;

    Array.prototype.forEach.call(forms, form => {
        Array.prototype.forEach.call(form.elements, element => {
            if (element.type == "text") {
                element.value = loginData.Username;
            }
            if (element.type == "password") {
                element.value = loginData.Password;
            }
        });
    });
}

const injectFindAndSendEvent = () => {
    var forms = document.forms;
    var loginData = {
        type: "loginEvent",
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