$(document).ready(function() {
    let selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    let totalAmount = 0;
    let discountedAmount = 0;
    let appliedOffers = [];

    function displayOrderSummary() {
        const $orderSummary = $('#order-summary');
        $orderSummary.empty();

        $orderSummary.append('<h2>Order Summary</h2>');
        const $itemList = $('<ul></ul>');

        selectedItems.forEach(item => {
            $itemList.append(`<li>${item.name} x ${item.quantity} - ${(item.price * item.quantity).toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</li>`);
        });

        $orderSummary.append($itemList);

        totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        discountedAmount = totalAmount;

        $orderSummary.append(`<p>Total: ${totalAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</p>`);
        $orderSummary.append(`<p>Discounted Total: ${discountedAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</p>`);
    }

    function displayAvailableOffers() {
        const $availableOffers = $('#available-offers');
        $availableOffers.empty();

        const offers = [
            { code: 'ONLINE10', discount: 0.1, minAmount: 2000 },
            { code: 'WEEKEND15', discount: 0.15, minAmount: 3000 },
        ];

        offers.forEach(offer => {
            if (totalAmount >= offer.minAmount) {
                const $offerBtn = $(`<button class="offer-btn" data-code="${offer.code}">${offer.code} - ${offer.discount * 100}% off</button>`);
                $availableOffers.append($offerBtn);
            }
        });
    }

    function applyOffer(offerCode) {
        const offers = {
            'ONLINE10': { discount: 0.1, minAmount: 2000 },
            'WEEKEND15': { discount: 0.15, minAmount: 3000 },
        };

        const offer = offers[offerCode];

        if (offer && totalAmount >= offer.minAmount && !appliedOffers.includes(offerCode)) {
            discountedAmount -= totalAmount * offer.discount;
            appliedOffers.push(offerCode);
            updateOrderSummary();
        }
    }

    function updateOrderSummary() {
        $('#order-summary').find('p').last().text(`Discounted Total: ${discountedAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}`);
    }

    function displayPaymentDetails(method) {
        const $paymentDetails = $('#payment-details');
        $paymentDetails.empty();

        switch (method) {
            case 'card':
                $paymentDetails.append(`
                    <h3>Card Details</h3>
                    <input type="text" placeholder="Card Number" required>
                    <input type="text" placeholder="Cardholder Name" required>
                    <input type="text" placeholder="Expiry Date (MM/YY)" required>
                    <input type="text" placeholder="CVV" required>
                `);
                break;
            case 'online':
                $paymentDetails.append(`
                    <h3>Online Payment</h3>
                    <p>You will be redirected to our secure payment gateway to complete your payment.</p>
                `);
                break;
            case 'cod':
                $paymentDetails.append(`
                    <h3>Cash on Delivery</h3>
                    <p>Please have the exact amount of ${discountedAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })} ready for the delivery person.</p>
                `);
                break;
            default:
                $paymentDetails.append(`
                    <h3>Cash Payment</h3>
                    <p>Please pay ${discountedAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })} at the counter.</p>
                `);
        }
    }

    displayOrderSummary();
    displayAvailableOffers();

    $(document).on('click', '.offer-btn', function() {
        const offerCode = $(this).data('code');
        applyOffer(offerCode);
        $(this).prop('disabled', true);
    });

    $('#apply-staff-discount').click(function() {
        const staffCode = $('#staff-discount-code').val();
        // In a real application, you would verify this code with the server
        if (staffCode === 'STAFF20') {
            discountedAmount *= 0.8; // 20% staff discount
            updateOrderSummary();
            $(this).prop('disabled', true);
        } else {
            alert('Invalid staff discount code');
        }
    });

    $('input[name="payment-method"]').change(function() {
        displayPaymentDetails($(this).val());
    });

    $('#confirm-payment').click(function() {
        const paymentMethod = $('input[name="payment-method"]:checked').val();
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        // In a real application, you would send this data to your server
        const orderData = {
            items: selectedItems,
            totalAmount: totalAmount,
            discountedAmount: discountedAmount,
            appliedOffers: appliedOffers,
            paymentMethod: paymentMethod
        };
        

        console.log('Order data:', orderData);

        // Simulate payment processing
        setTimeout(() => {
            alert('Payment successful! Thank you for your order.');
            localStorage.removeItem('selectedItems');
            window.location.href = 'index.html'; // Redirect to homepage
        }, 2000);
    });
});