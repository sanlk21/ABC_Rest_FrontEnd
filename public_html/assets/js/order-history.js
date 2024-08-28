$(document).ready(function () {
    $('#fetchOrders').click(function () {
        const email = $('#userEmail').val().trim();
        if (!email) {
            alert('Please enter your email');
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/orders/user/${email}`,
            method: 'GET',
            success: function (orders) {
                displayOrders(orders);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching orders:', error);
                alert('Failed to fetch orders. Please try again.');
            }
        });
    });

    function displayOrders(orders) {
        const orderHistory = $('#orderHistory');
        orderHistory.empty();

        if (orders.length === 0) {
            orderHistory.append('<p>No orders found.</p>');
            return;
        }

        orders.forEach(order => {
            const orderHtml = `
                <div class="order">
                    <h3>Order ID: #${order.id}</h3>
                    <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total Amount:</strong> Rs. ${order.totalAmount.toFixed(2)}</p>
                    <h4>Items:</h4>
                    <ul>
                        ${order.orderDetails.map(detail => `
                            <li>${detail.quantity}x ${detail.item.name} - Rs. ${detail.price.toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
                <hr>
            `;
            orderHistory.append(orderHtml);
        });
    }
});
