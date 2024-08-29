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

function validateForm() {
    const email = $('#UserEmail').val().trim();
    if (!email) {
        alert('Please enter your email address.');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    const paymentMethod = $('input[name="paymentMethod"]:checked').val();
    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
        const cardFields = ['cardNumber', 'cardExpiry', 'cardCVC'];
        for (let field of cardFields) {
            const value = $(`#${field}`).val().trim();
            if (!value) {
                alert(`Please fill in the ${field.replace('card', '').toLowerCase()} field.`);
                return false;
            }
        }

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

function createOrder() {
    // Disable the order button and show loading state
    $('#confirmOrder').prop('disabled', true).text('Processing...');

    const now = new Date();
    const orderData = {
        userEmail: $('#UserEmail').val().trim(),
        orderDetails: cartItems.map(item => ({
            itemId: item.id || item.item.id,
            quantity: item.quantity,
            price: item.price
        })),
        startDate: now.toISOString(),
        endDate: now.toISOString(), // You may want to set this to a future date for delivery orders
        orderDate: now.toISOString(),
        totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: "PENDING",
        type: $('#orderType').val()
    };

    console.log('Sending order data:', orderData);

    $.ajax({
        url: 'http://localhost:8080/api/v1/orders/saveOrder',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData),
        success: function(response) {
            console.log('Order created successfully:', response);
            showOrderConfirmation(true, 'Your order has been successfully placed!');
            clearCart();
        },
        error: function(xhr, status, error) {
            console.error('Error creating order:', error);
            console.error('Server response:', xhr.responseText);
            showOrderConfirmation(false, 'There was an error creating your order. Please try again.');
        },
        complete: function() {
            // Re-enable the order button
            $('#confirmOrder').prop('disabled', false).text('Place Order');
        }
    });
}

function showOrderConfirmation(isSuccess, message) {
    const modal = $('#orderConfirmation');
    const modalTitle = modal.find('.modal-content h2');
    const modalMessage = modal.find('.modal-content p');

    if (isSuccess) {
        modalTitle.text('Order Successful');
        modalTitle.css('color', 'green');
    } else {
        modalTitle.text('Order Failed');
        modalTitle.css('color', 'red');
    }

    modalMessage.text(message);
    modal.removeClass('hidden');
    console.log('Order confirmation modal displayed:', isSuccess ? 'Success' : 'Failure');
}

// Add this function to ensure the modal can be closed
$(document).ready(function() {
    $('#closeModal').click(function() {
        $('#orderConfirmation').addClass('hidden');
        if ($('#orderConfirmation .modal-content h2').text() === 'Order Successful') {
            window.location.href = 'index.html'; // Redirect to home page on success
        }
    });
});

function showOrderConfirmation(isSuccess, message) {
    const modal = $('#orderConfirmation');
    const modalTitle = modal.find('.modal-content h2');
    const modalMessage = modal.find('.modal-content p');

    if (isSuccess) {
        modalTitle.text('Order Successful');
        modalTitle.css('color', 'green');
    } else {
        modalTitle.text('Order Failed');
        modalTitle.css('color', 'red');
    }

    modalMessage.text(message);
    modal.removeClass('hidden');
    console.log('Order confirmation modal displayed:', isSuccess ? 'Success' : 'Failure');
}

function clearCart() {
    localStorage.removeItem('cart');
    cartItems = [];
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}