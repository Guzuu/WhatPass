document.getElementById("autoComplete").addEventListener("click", autoFill);

function autoFill() {
    console.log('Button pressed');
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, function (tabs) {
        var currentTab = tabs[0]; // there will be only one in this array

        if (currentTab.url == "https://wu.wsiz.edu.pl/Account/Login") {
            console.log('URL True');
            console.log(document);
            loadDoc();
            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: injectCreds
            });
        }
    });
}

function injectCreds() {
    var username = document.getElementById("UserLogin_I")
    var password = document.getElementById("Password_I")
}

function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        console.log(xhttp.responseText);
      }
    };
    chrome.storage.local.get("tokenInfo", function(data) {
        if(data.tokenInfo != null) {
            xhttp.open("GET", "https://localhost:44366/api/values", true);
            xhttp.setRequestHeader('Authorization', 'Bearer ' + data.tokenInfo);
            xhttp.send();
        }
        else(console.log("Token not found"));
    });
}