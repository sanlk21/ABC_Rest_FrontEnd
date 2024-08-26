$(document).ready(function() {
    let cartItems = [];

    function fetchCartItems() {
        $.ajax({
            url: '/api/cart',
            method: 'GET',
            success: function(data) {
                cartItems = data;
                updateCart();
            },
            error: function(xhr, status, error) {
                console.error('Error fetching cart items:', error);
            }
        });
    }

    function updateCart() {
        const itemsShown = parseInt($('#items-shown').val());
        const $cartItems = $('#cart-items tbody');
        $cartItems.empty();

        cartItems.slice(0, itemsShown).forEach(item => {
            const $row = $(`
                <tr data-id="${item.id}">
                    <td><input type="checkbox" class="item-select" ${item.selected ? 'checked' : ''}></td>
                    <td><img src="${item.image}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td>${item.price.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</td>
                    <td>
                        <div class="quantity-control">
                            <button class="quantity-btn decrease">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                            <button class="quantity-btn increase">+</button>
                        </div>
                    </td>
                    <td>${(item.price * item.quantity).toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</td>
                    <td><button class="remove-btn">Remove</button></td>
                </tr>
            `);
            $cartItems.append($row);
        });

        updateSummary();
    }

    function updateSummary() {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const selectedItems = cartItems.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0);
        const selectedAmount = cartItems.filter(item => item.selected).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        $('#total-items').text(totalItems);
        $('#total-amount').text(totalAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' }));
        $('#selected-items').text(selectedItems);
        $('#selected-amount').text(selectedAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' }));
    }

    $(document).on('click', '.item-select', function() {
        const itemId = $(this).closest('tr').data('id');
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            item.selected = $(this).is(':checked');
            updateSummary();
        }
    });

    $(document).on('click', '.remove-btn', function() {
        const itemId = $(this).closest('tr').data('id');
        $.ajax({
            url: `/api/cart/${itemId}`,
            method: 'DELETE',
            success: function() {
                cartItems = cartItems.filter(item => item.id !== itemId);
                updateCart();
            },
            error: function(xhr, status, error) {
                console.error('Error removing item from cart:', error);
            }
        });
    });

    $(document).on('click', '.quantity-btn', function() {
        const $row = $(this).closest('tr');
        const itemId = $row.data('id');
        const $input = $row.find('.quantity-input');
        let quantity = parseInt($input.val());

        if ($(this).hasClass('increase')) {
            quantity++;
        } else if ($(this).hasClass('decrease') && quantity > 1) {
            quantity--;
        }

        $input.val(quantity);
        updateItemQuantity(itemId, quantity);
    });

    $(document).on('change', '.quantity-input', function() {
        const $row = $(this).closest('tr');
        const itemId = $row.data('id');
        const quantity = parseInt($(this).val());
        updateItemQuantity(itemId, quantity);
    });

    function updateItemQuantity(itemId, quantity) {
        $.ajax({
            url: `/api/cart/${itemId}`,
            method: 'PUT',
            data: JSON.stringify({ quantity: quantity }),
            contentType: 'application/json',
            success: function() {
                const item = cartItems.find(item => item.id === itemId);
                if (item) {
                    item.quantity = quantity;
                    updateCart();
                }
            },
            error: function(xhr, status, error) {
                console.error('Error updating item quantity:', error);
            }
        });
    }

    $('#purchase-btn').click(function() {
        const selectedItems = cartItems.filter(item => item.selected);
        if (selectedItems.length === 0) {
            alert('Please select items to purchase.');
            return;
        }

        // In cart.js, replace the $('#purchase-btn').click function with:

$('#purchase-btn').click(function() {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
        alert('Please select items to purchase.');
        return;
    }

    // Store selected items in localStorage
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    
    // Redirect to payment page
    window.location.href = 'payment.html';
});

        $.ajax({
            url: '/api/purchase',
            method: 'POST',
            data: JSON.stringify(selectedItems),
            contentType: 'application/json',
            success: function(response) {
                alert('Purchase successful!');
                cartItems = cartItems.filter(item => !item.selected);
                updateCart();
            },
            error: function(xhr, status, error) {
                console.error('Error processing purchase:', error);
                alert('Error processing purchase. Please try again.');
            }
        });
    });

    $('#items-shown').change(updateCart);

    fetchCartItems();
});