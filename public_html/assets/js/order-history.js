$(document).ready(function() {
    $('#fetchOrders').click(function() {
        const userEmail = $('#userEmail').val();
        if (userEmail) {
            fetchOrderHistory(userEmail);
        } else {
            alert('Please enter your email address.');
        }
    });
});

function fetchOrderHistory(email) {
    // Show loading indicator
    $('#orderHistory').html('<p>Loading order history...</p>');

    // Make AJAX call to fetch order history
    $.ajax({
        url: 'http://localhost:8080/api/v1/orders/getOrdersByEmail',
        method: 'GET',
        data: { email: email },
        success: function(orders) {
            displayOrderHistory(orders);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching order history:', error);
            $('#orderHistory').html('<p>Failed to load order history. Please try again later.</p>');
        }
    });
}

function displayOrderHistory(orders) {
    if (orders.length === 0) {
        $('#orderHistory').html('<p>No orders found for this email address.</p>');
        return;
    }

    let html = '<div class="order-list">';
    orders.forEach(order => {
        html += `
            <div class="order-item">
                <h3>Order #${order.id}</h3>
                <p>Date: ${new Date(order.orderDate).toLocaleString()}</p>
                <p>Status: ${order.status}</p>
                <p>Type: ${order.type}</p>
                <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
                <h4>Order Details:</h4>
                <ul>
                    ${order.orderDetails.map(detail => `
                        <li>${detail.item.name} x ${detail.quantity} - $${detail.price.toFixed(2)}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    });
    html += '</div>';

    $('#orderHistory').html(html);
}