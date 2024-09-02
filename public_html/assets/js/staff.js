// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    themeToggle.innerHTML = body.classList.contains('light-theme') ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// Sidebar toggle
const toggleSidebar = document.querySelector('.toggle-sidebar');
const sidebar = document.querySelector('.sidebar');

toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Fetch and display all orders
function fetchAllOrders() {
    axios.get('http://localhost:8080/api/v1/orders')
        .then(response => {
            const orders = response.data;
            const tableBody = document.getElementById('ordersBody');
            tableBody.innerHTML = '';

            orders.forEach(order => {
                const row = document.createElement('tr');
                
                if (order.status === 'COMPLETED') {
                    row.style.backgroundColor = '#d4edda'; // Green background for completed orders
                }

                row.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${order.userEmail}</td>
                    <td>${order.type}</td>
                    <td>${order.status}</td>
                    <td>
                        <button class="btn btn-primary" onclick="showOrderDetails(${order.id})">
                            Details
                        </button>
                        <button class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'COMPLETED')">Deliver</button>
                        <button class="btn btn-danger" onclick="updateOrderStatus(${order.id}, 'CANCELLED')">Reject</button>
                        <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete</button> <!-- Add this line -->
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
        });
}


// Show order details in modal
function showOrderDetails(orderId) {
    axios.get(`http://localhost:8080/api/v1/orders/${orderId}`)
        .then(response => {
            const order = response.data;
            const detailsHtml = `
                <p><strong>Order ID:</strong> #${order.id}</p>
                <p><strong>Customer Email:</strong> ${order.userEmail}</p>
                <p><strong>Type:</strong> ${order.type}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
                <h3>Order Items:</h3>
                <ul>
                    ${order.orderDetails.map(item => `
                        <li>${item.quantity}x Item #${item.itemId} - $${item.price.toFixed(2)}</li>
                    `).join('')}
                </ul>
            `;
            document.getElementById('orderDetails').innerHTML = detailsHtml;
            document.getElementById('orderModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            alert('Failed to fetch order details. Please try again.');
        });
}

// Update order status
function updateOrderStatus(orderId, status) {
    axios.put(`http://localhost:8080/api/v1/orders/${orderId}`, { status: status })
        .then(response => {
            alert(`Order #${orderId} status updated to ${status}`);
            fetchAllOrders(); // Refresh the orders list
            document.getElementById('orderModal').style.display = 'none';
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        });
}
// Delete order
function deleteOrder(orderId) {
    if (confirm(`Are you sure you want to delete order #${orderId}?`)) {
        axios.delete(`http://localhost:8080/api/v1/orders/${orderId}`)
            .then(response => {
                alert(`Order #${orderId} deleted successfully`);
                fetchAllOrders(); // Refresh the orders list
            })
            .catch(error => {
                console.error('Error deleting order:', error);
                alert('Failed to delete order. Please try again.');
            });
    }
}


// Fetch and display all reservations
function fetchAllReservations() {
    axios.get('http://localhost:8080/api/v1/reservations')
        .then(response => {
            const reservations = response.data;
            const tableBody = document.getElementById('reservationsBody');
            tableBody.innerHTML = '';

            reservations.forEach(reservation => {
                const row = document.createElement('tr');

                if (reservation.status === 'CONFIRMED') {
                    row.style.backgroundColor = '#d4edda'; // Green background for confirmed reservations
                }

                row.innerHTML = `
                    <td>#${reservation.id}</td>
                    <td>${reservation.userEmail}</td>
                    <td>${new Date(reservation.date).toLocaleString()}</td>
                    <td>${reservation.type}</td>
                    <td>${reservation.status}</td>
                    <td>
                        <button class="btn btn-primary" onclick="showReservationDetails(${reservation.id})">
                            Details
                        </button>
                        <button class="btn btn-success" onclick="updateReservationStatus(${reservation.id}, 'CONFIRMED')">Confirm</button>
                        <button class="btn btn-danger" onclick="deleteReservation(${reservation.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching reservations:', error);
        });
}

// Show reservation details in modal
function showReservationDetails(reservationId) {
    axios.get(`http://localhost:8080/api/v1/reservations/${reservationId}`)
        .then(response => {
            const reservation = response.data;
            const detailsHtml = `
                <p><strong>Reservation ID:</strong> #${reservation.id}</p>
                <p><strong>Customer Email:</strong> ${reservation.userEmail}</p>
                <p><strong>Date:</strong> ${new Date(reservation.date).toLocaleString()}</p>
                <p><strong>Type:</strong> ${reservation.type}</p>
                <p><strong>Status:</strong> ${reservation.status}</p>
                <p><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
            `;
            document.getElementById('reservationDetails').innerHTML = detailsHtml;
            document.getElementById('reservationModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching reservation details:', error);
            alert('Failed to fetch reservation details. Please try again.');
        });
}

// Update reservation status
function updateReservationStatus(reservationId, status) {
    axios.put(`http://localhost:8080/api/v1/reservations/${reservationId}`, { status: status })
        .then(response => {
            alert(`Reservation #${reservationId} status updated to ${status}`);
            fetchAllReservations(); // Refresh the reservations list
            document.getElementById('reservationModal').style.display = 'none';
        })
        .catch(error => {
            console.error('Error updating reservation status:', error);
            alert('Failed to update reservation status. Please try again.');
        });
}

// Delete reservation
function deleteReservation(reservationId) {
    if (confirm(`Are you sure you want to delete reservation #${reservationId}?`)) {
        axios.delete(`http://localhost:8080/api/v1/reservations/${reservationId}`)
            .then(response => {
                alert(`Reservation #${reservationId} deleted successfully`);
                fetchAllReservations(); // Refresh the reservations list
            })
            .catch(error => {
                console.error('Error deleting reservation:', error);
                alert('Failed to delete reservation. Please try again.');
            });
    }
}

// Close modals on outside click
window.onclick = function(event) {
    const orderModal = document.getElementById('orderModal');
    const reservationModal = document.getElementById('reservationModal');
    if (event.target == orderModal) {
        orderModal.style.display = 'none';
    }
    if (event.target == reservationModal) {
        reservationModal.style.display = 'none';
    }
}

// Close modals on close button click
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        document.getElementById('orderModal').style.display = 'none';
        document.getElementById('reservationModal').style.display = 'none';
    }
});

// Fetch all orders and reservations when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAllOrders();
    fetchAllReservations();
});

// Periodically fetch all orders and reservations every 30 seconds
setInterval(() => {
    fetchAllOrders();
    fetchAllReservations();
}, 30000);

// Fetch and display inventory alerts (placeholder function)
function fetchInventoryAlerts() {
    const inventoryAlerts = [
        { item: 'Tomatoes', status: 'Low stock' },
        { item: 'Chicken', status: 'Reorder soon' },
        { item: 'Napkins', status: 'Out of stock' }
    ];

    const alertList = document.getElementById('inventoryAlertList');
    alertList.innerHTML = '';

    inventoryAlerts.forEach(alert => {
        const li = document.createElement('li');
        li.textContent = `${alert.item} - ${alert.status}`;
        alertList.appendChild(li);
    });
}

// Call fetchInventoryAlerts when the page loads
document.addEventListener('DOMContentLoaded', fetchInventoryAlerts);
