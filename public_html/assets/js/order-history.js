$(document).ready(function() {
    $('#fetchHistory').click(function() {
        const email = $('#userEmail').val().trim();
        const password = $('#userPassword').val().trim();

        if (!email || !password) {
            alert('Please enter both your email and password.');
            return;
        }

        fetchOrders(email, password);
        fetchReservations(email, password);
    });

    $('.tab-button').click(function() {
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        $('.history-content').removeClass('active');
        $(`#${$(this).data('tab')}History`).addClass('active');
    });

    function fetchOrders(email, password) {
        $.ajax({
            url: 'http://localhost:8080/api/v1/orders/user/' + email,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(email + ':' + password)
            },
            success: function(response) {
                displayOrderHistory(response);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching orders:', error);
                $('#orderHistory').html('<p>There was an error fetching your order history. Please check your credentials and try again.</p>');
            }
        });
    }

    function fetchReservations(email, password) {
        $.ajax({
            url: 'http://localhost:8080/api/v1/reservations/user/' + email,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(email + ':' + password)
            },
            success: function(response) {
                displayReservationHistory(response);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching reservations:', error);
                $('#reservationHistory').html('<p>There was an error fetching your reservation history. Please check your credentials and try again.</p>');
            }
        });
    }

    function displayOrderHistory(orders) {
        const orderHistory = $('#orderHistory');
        orderHistory.empty();

        if (orders.length === 0) {
            orderHistory.html('<p>No orders found for this email.</p>');
            return;
        }

        orders.forEach(order => {
            const orderHtml = `
                <div class="order">
                    <h3>Order #${order.id} - ${new Date(order.orderDate).toLocaleDateString()}</h3>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total Amount:</strong> LKR ${order.totalAmount.toFixed(2)}</p>
                    <h4>Items:</h4>
                    <ul>
                        ${order.orderDetails.map(item => `
                            <li>${item.quantity}x Item #${item.itemId} - LKR ${item.price.toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
            orderHistory.append(orderHtml);
        });
    }

    function displayReservationHistory(reservations) {
        const reservationHistory = $('#reservationHistory');
        reservationHistory.empty();

        if (reservations.length === 0) {
            reservationHistory.html('<p>No reservations found for this email.</p>');
            return;
        }

        reservations.forEach(reservation => {
            const reservationHtml = `
                <div class="reservation">
                    <h3>Reservation #${reservation.id} - ${new Date(reservation.date).toLocaleString()}</h3>
                    <p><strong>Type:</strong> ${reservation.type}</p>
                    <p><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
                    <p><strong>Status:</strong> ${reservation.status}</p>
                </div>
            `;
            reservationHistory.append(reservationHtml);
        });
    }
});
