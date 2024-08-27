// cart.js

let cart = [];
const itemsPerPage = 10;
let currentPage = 1;

// Function to fetch cart items from the server
function fetchCartItems() {
    $.ajax({
        url: 'http://localhost:8080/api/cart/view',
        method: 'GET',
        data: { userEmail: 'user@example.com' }, // Replace with actual user email
        success: function(response) {
            cart = response.cartItems || [];
            updateCartDisplay();
        },
        error: function(xhr, status, error) {
            console.error('Error fetching cart:', error);
            alert('Failed to load cart. Please try again.');
        }
    });
}

// Function to update the cart display
function updateCartDisplay() {
    const tbody = $('#cart-items tbody');
    tbody.empty();

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = cart.slice(startIndex, endIndex);

    pageItems.forEach(item => {
        const row = `
            <tr>
                <td><input type="checkbox" class="item-select" data-id="${item.id}"></td>
                <td><img src="${item.item.imagePath}" alt="${item.item.name}" class="item-image"></td>
                <td>${item.item.name}</td>
                <td>${item.item.price.toFixed(2)}</td>
                <td>
                    <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                </td>
                <td>${(item.item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-item" data-id="${item.id}">Remove</button></td>
            </tr>
        `;
        tbody.append(row);
    });

    updateSummary();
}

// Function to update the cart summary
function updateSummary() {
    const selectedItems = $('.item-select:checked').length;
    let selectedAmount = 0;
    let totalItems = 0;
    let totalAmount = 0;

    cart.forEach(item => {
        const quantity = parseInt($(`input.item-quantity[data-id="${item.id}"]`).val());
        const itemTotal = item.item.price * quantity;
        totalItems += quantity;
        totalAmount += itemTotal;

        if ($(`input.item-select[data-id="${item.id}"]`).is(':checked')) {
            selectedAmount += itemTotal;
        }
    });

    $('#selected-items').text(selectedItems);
    $('#selected-amount').text(selectedAmount.toFixed(2));
    $('#total-items').text(totalItems);
    $('#total-amount').text(totalAmount.toFixed(2));
}

// Function to remove an item from the cart
function removeItem(itemId) {
    $.ajax({
        url: 'http://localhost:8080/api/cart/remove',
        method: 'DELETE',
        data: {
            userEmail: 'user@example.com', // Replace with actual user email
            cartItemId: itemId
        },
        success: function(response) {
            cart = response.cartItems || [];
            updateCartDisplay();
        },
        error: function(xhr, status, error) {
            console.error('Error removing item from cart:', error);
            alert('Failed to remove item from cart. Please try again.');
        }
    });
}

// Function to update item quantity
function updateItemQuantity(itemId, quantity) {
    $.ajax({
        url: 'http://localhost:8080/api/cart/update',
        method: 'PUT',
        data: {
            userEmail: 'user@example.com', // Replace with actual user email
            cartItemId: itemId,
            quantity: quantity
        },
        success: function(response) {
            cart = response.cartItems || [];
            updateCartDisplay();
        },
        error: function(xhr, status, error) {
            console.error('Error updating item quantity:', error);
            alert('Failed to update item quantity. Please try again.');
        }
    });
}

// Event listeners
$(document).ready(function() {
    fetchCartItems();

    $('#items-shown').on('change', function() {
        itemsPerPage = parseInt($(this).val());
        currentPage = 1;
        updateCartDisplay();
    });

    $(document).on('change', '.item-select', updateSummary);

    $(document).on('change', '.item-quantity', function() {
        const itemId = $(this).data('id');
        const quantity = parseInt($(this).val());
        updateItemQuantity(itemId, quantity);
    });

    $(document).on('click', '.remove-item', function() {
        const itemId = $(this).data('id');
        removeItem(itemId);
    });

    $('#purchase-btn').on('click', function() {
        const selectedItemIds = $('.item-select:checked').map(function() {
            return $(this).data('id');
        }).get();

        if (selectedItemIds.length === 0) {
            alert('Please select at least one item to purchase.');
            return;
        }

        // Implement purchase logic here
        console.log('Purchasing items:', selectedItemIds);
        // You can redirect to a payment page or process the purchase as needed
    });
});