let order = {};
let cartItems = [];

$(document).ready(function() {
    // Get cart data from URL parameter or localStorage
    const cartData = getUrlParameter('cart');
    
    if (cartData) {
        try {
            cartItems = JSON.parse(decodeURIComponent(cartData)).cartItems;
        } catch (error) {
            console.error('Error parsing cart data from URL:', error);
        }
    }

    if (cartItems.length === 0) {
        cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    }
    
    if (cartItems.length > 0) {
        displayOrderSummary();
    } else {
        alert('Your cart is empty. Please add items to your cart before proceeding to checkout.');
        window.location.href = 'menu.html';
    }

    // Show or hide card details based on selected payment method
    $('input[name="paymentMethod"]').change(function() {
        if ($(this).val() === 'CREDIT_CARD' || $(this).val() === 'DEBIT_CARD') {
            $('#cardDetails').show();
        } else {
            $('#cardDetails').hide();
        }
    });

    // Handle order confirmation
    $('#confirmOrder').click(function() {
        if (validateForm()) {
            createOrder();
        }
    });

    // Handle modal close
    $('#closeModal').click(function() {
        $('#orderConfirmation').addClass('hidden');
        window.location.href = 'index.html'; // Redirect to home page
    });
});

// Display the order summary
function displayOrderSummary() {
    const orderItems = $('#orderItems');
    orderItems.empty();

    let total = 0;
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderItems.append(`
            <div class="order-item">
                <span>${item.name || item.item.name}</span>
                <span>Quantity: ${item.quantity}</span>
                <span>Rs. ${itemTotal.toFixed(2)}</span>
            </div>
        `);
    });

    $('#orderTotal').text(`Total: Rs. ${total.toFixed(2)}`);
}

// Validate the form inputs
function validateForm() {
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'customerAddress'];
    let isValid = true;

    requiredFields.forEach(field => {
        const value = $(`#${field}`).val().trim();
        if (!value) {
            alert(`Please fill in the ${field.replace('customer', '').toLowerCase()} field.`);
            isValid = false;
            return false;
        }
    });

    if (!isValid) return false;

    const email = $('#customerEmail').val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    const phone = $('#customerPhone').val().trim();
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid 10-digit phone number.');
        return false;
    }

    const paymentMethod = $('input[name="paymentMethod"]:checked').val();
    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
        const cardFields = ['cardNumber', 'cardExpiry', 'cardCVC'];
        cardFields.forEach(field => {
            const value = $(`#${field}`).val().trim();
            if (!value) {
                alert(`Please fill in the ${field.replace('card', '').toLowerCase()} field.`);
                isValid = false;
                return false;
            }
        });

        if (!isValid) return false;

        const cardNumber = $('#cardNumber').val().trim();
        if (!/^\d{16}$/.test(cardNumber)) {
            alert('Please enter a valid 16-digit card number.');
            return false;
        }

        const cardExpiry = $('#cardExpiry').val().trim();
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
            alert('Please enter a valid expiry date (MM/YY).');
            return false;
        }

        const cardCVC = $('#cardCVC').val().trim();
        if (!/^\d{3}$/.test(cardCVC)) {
            alert('Please enter a valid 3-digit CVC.');
            return false;
        }
    }

    return true;
}

// Create the order and send to the backend
function createOrder() {
    const orderData = {
        userEmail: $('#customerEmail').val().trim(),
        orderDetails: cartItems.map(item => ({
            itemId: item.id || item.item.id,
            quantity: item.quantity,
            price: item.price
        })),
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        orderDate: new Date().toISOString(),
        totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: "PENDING",
        type: $('#orderType').val()
    };

    $.ajax({
        url: 'http://localhost:8080/api/v1/orders/saveOrder',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData),
        success: function(response) {
            console.log('Order created:', response);
            createPayment(response.id);
        },
        error: function(xhr, status, error) {
            console.error('Error creating order:', error);
            alert('There was an error creating your order. Please try again.');
        }
    });
}

// Create the payment and send to the backend
function createPayment(orderId) {
    const paymentData = {
        paymentMethod: $('input[name="paymentMethod"]:checked').val(),
        status: "PENDING",
        amount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        userEmail: $('#customerEmail').val().trim(),
        orderId: orderId,
        paymentDate: new Date().toISOString()
    };

    $.ajax({
        url: 'http://localhost:8080/api/v1/payments/create',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(paymentData),
        success: function(response) {
            console.log('Payment created:', response);
            showConfirmation();  // Show confirmation modal after payment is successful
            clearCart();
        },
        error: function(xhr, status, error) {
            console.error('Error creating payment:', error);
            alert('There was an error processing your payment. Please try again.');
        }
    });
}

// Show the order confirmation modal
function showConfirmation() {
    $('#orderConfirmation').removeClass('hidden');
}

// Clear the cart after successful order and payment
function clearCart() {
    localStorage.removeItem('cart');
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
