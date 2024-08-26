$(document).ready(function () {
    // Registration
    $('#submitBtn').click(function () {
        // Gather form data
        var user = {
            username: $('#username').val(),
            password: $('#password').val(),
            email: $('#email').val(),
            address: $('#address').val(),
            role: $('#role').val()  // Include role in the data sent
        };

        // Send data using AJAX
        $.ajax({
            type: "POST",
            url: "http://localhost:8080/api/v1/User/saveUser", // Backend URL
            contentType: "application/json",
            data: JSON.stringify(user),
            success: function (response) {
                alert("User registered successfully!");
                // You can also redirect the user or clear the form
                $('#userForm')[0].reset();
            },
            error: function (error) {
                alert("Error registering user.");
                console.log(error);
            }
        });
    });

    // Login
    $('#loginBtn').click(function () {
        var user = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        $.ajax({
            type: "POST",
            url: "http://localhost:8080/api/v1/User/login",
            contentType: "application/json",
            data: JSON.stringify(user),
            success: function (response) {
                alert("Login successful!");

                // Redirect based on user role
                if (response.role === "ADMIN") {
                    window.location.href = "/public_html/admin.html";
                } else if (response.role === "STAFF") {
                    window.location.href = "/public_html/staff.html";
                } else if (response.role === "CUSTOMER") {
                    window.location.href = "/public_html/index.html";
                } else {
                    alert("Unknown role: " + response.role);
                }
            },
            error: function (error) {
                alert("Error logging in: " + error.responseText);
                console.log(error);
            }
        });
    });
});
