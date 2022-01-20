document.getElementById("getCreds").addEventListener("click", getCreds);

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

function findCreds() {
    //var formData = new FormData(document.querySelector('form'))
    var forms = document.forms;
    var login = false, password = false;
    var loginData = {
        username: "",
        password: ""
    }
    Array.prototype.forEach.call(forms, form => {
        Array.prototype.forEach.call(form.elements, element =>{
            if(element.type == "text" && !login){
                loginData.username = element.value;
                login = true;
            }
            if(element.type == "password" && !password){
                loginData.password = element.value;
                password = true;
            }
        });
    });

    console.log(loginData);
}
