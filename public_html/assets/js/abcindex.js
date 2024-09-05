

// smooth scroll
$(document).ready(function () {
    $(".navbar .nav-link").on('click', function (event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function () {
                window.location.hash = hash;
            });
        }
    });
});

new WOW().init();

function initMap() {
    var uluru = { lat: 37.227837, lng: -95.700513 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
}

// Function to handle the reservation submission
document.getElementById('findTableBtn').addEventListener('click', function () {
    const userEmail = document.getElementById('userEmail').value;
    const numberOfGuests = document.getElementById('numberOfGuests').value;
    const time = document.getElementById('time').value;
    const date = document.getElementById('date').value;

    if (!userEmail || !numberOfGuests || !time || !date) {
        showMessage('Please fill out all fields.', 'error');
        return;
    }

    const reservationData = {
        userEmail: userEmail,
        numberOfGuests: numberOfGuests,
        date: `${date}T${time}:00`, // Combine date and time
        type: 'DINE_IN', // Assuming dine-in for this example
        status: 'PENDING'
    };

    fetch('http://localhost:8080/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
    })
        .then(response => response.json())
        .then(data => {
            showMessage('Reservation made successfully! Your reservation ID is: ' + data.id, 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to make a reservation. Please try again later.', 'error');
        });
});

function showMessage(message, type) {
    const messageElement = document.getElementById('reservationMessage');
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    messageElement.className = type === 'success' ? 'alert alert-success' : 'alert alert-danger';
}

