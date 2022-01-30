document.getElementById("submitLogin").addEventListener("click", login);
document.getElementById("logOut").addEventListener("click", logout);

chrome.storage.local.get("userName", function (data) {
    if (data.userName != null) {
        $('.userName').text(data.userName);
        $('.userInfo').css('display', 'block');
        $('.loginForm').css('display', 'none');
    }
});

function login(e) {
    e.preventDefault();
    var loginData = {
        grant_type: 'password',
        username: $('#email').val(),
        password: $('#password').val()
    };

    $.ajax({
        type: 'POST',
        url: 'https://localhost:44366/token',
        data: loginData,
        success: function (data) {
            $('.userName').text(data.userName);
            $('.userInfo').css('display', 'block');
            $('.loginForm').css('display', 'none');

            chrome.storage.local.set({
                "tokenInfo": data.access_token,
                "userName": data.userName,
                "key": loginData.password + "0gIjDVHexr9CYPuOKEtnEsDDbUZAKuurLxwYnvzYj5v3KnyRyHTkbNHhxBBDNaZT"
            }, function () {
                console.log('token value is set to ' + data.access_token);
            });
        },
        fail: function (data) {
            alert('Error on login');
        }
    });
}

function logout(e) {
    e.preventDefault();
    chrome.storage.local.clear(function () {
        $('.userName').text("");
        $('.userInfo').css('display', 'none');
        $('.loginForm').css('display', 'block');

        console.log('Storage cleared');
    });
}
