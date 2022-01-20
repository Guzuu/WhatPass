document.getElementById("getCreds").addEventListener("click", getCreds);

chrome.runtime.onMessage.addListener(
    function(request, sender) {
        console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
        console.log(request.loginData);
    }
);

function getCreds() {
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, function (tabs) {
        var currentTab = tabs[0];
        console.log(currentTab);
        chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: findCreds
        });
    });
}
const findCreds = () => {
    var forms = document.forms;
    var loginData = {
        username: "",
        password: ""
    }
    Array.prototype.forEach.call(forms, form => {
        Array.prototype.forEach.call(form.elements, element =>{
            if(element.type == "text" && loginData.username == "" && loginData.password == ""){
                loginData.username = element.value;
            }
            if(element.type == "password" && loginData.password == ""){
                loginData.password = element.value;
                form.addEventListener("submit", function (){
                    chrome.runtime.sendMessage({loginData}); 
                });
            }
        });
    });
}