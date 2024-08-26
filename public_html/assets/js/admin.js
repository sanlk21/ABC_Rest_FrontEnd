$(document).ready(function() {
    let currentSection = 'dashboard';
    let currentAction = '';
    let userData = {
        name: 'Admin',
        email: 'admin@example.com'
    };

    function showSection(sectionId) {
        const sections = document.getElementsByClassName('section');
        for (let section of sections) {
            section.style.display = 'none';
        }
        document.getElementById(sectionId).style.display = 'block';
        currentSection = sectionId;
        if (sectionId === 'dashboard') {
            loadDashboard();
        } else {
            fetchData();
        }
    }

    function loadDashboard() {
        const dashboardContent = $('#dashboardContent');
        dashboardContent.html(`
            <div class="dashboard-card">
                <h3>Total Users</h3>
                <p id="totalUsers">Loading...</p>
            </div>
            <div class="dashboard-card">
                <h3>Total Products</h3>
                <p id="totalProducts">Loading...</p>
            </div>
            <div class="dashboard-card">
                <h3>Total Orders</h3>
                <p id="totalOrders">Loading...</p>
            </div>
        `);

        $.ajax({
            url: '/api/v1/User/getUsers',
            method: 'GET',
            success: function(data) {
                $('#totalUsers').text(data.length); // Assuming data contains user array

                // Assuming you have similar endpoints for products and orders
                // Adjust URLs accordingly
                $.ajax({
                    url: '/api/v1/products',
                    method: 'GET',
                    success: function(products) {
                        $('#totalProducts').text(products.length);
                    }
                });

                $.ajax({
                    url: '/api/v1/orders',
                    method: 'GET',
                    success: function(orders) {
                        $('#totalOrders').text(orders.length);
                    }
                });

                // Create chart after data is loaded
                const ctx = document.getElementById('chart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Users', 'Products', 'Orders'],
                        datasets: [{
                            label: 'Total Count',
                            data: [data.length, products.length, orders.length],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            },
            error: function(error) {
                console.error('Error loading dashboard:', error);
            }
        });
    }

    function fetchData() {
        if (currentSection === 'users') {
            fetchUsers();
        } else if (currentSection === 'products') {
            fetchProducts();
        }
    }

    function fetchUsers() {
        $.ajax({
            url: '/api/v1/User/getUsers',
            method: 'GET',
            success: function(users) {
                populateTable('userTable', users, ['username', 'email', 'address', 'role']);
            },
            error: function(error) {
                console.error('Error fetching users:', error);
            }
        });
    }

    function fetchProducts() {
        $.ajax({
            url: '/api/v1/products',
            method: 'GET',
            success: function(products) {
                populateTable('productTable', products, ['id', 'name', 'price', 'image']);
            },
            error: function(error) {
                console.error('Error fetching products:', error);
            }
        });
    }

    function populateTable(tableId, data, fields) {
        const table = $('#' + tableId);
        table.html(`<tr>
            <th>Select</th>
            ${fields.map(field => `<th>${field.charAt(0).toUpperCase() + field.slice(1)}</th>`).join('')}
            <th>Actions</th>
        </tr>`);
        data.forEach(item => {
            const row = $('<tr>');
            row.append(`<td><input type="checkbox" name="select" value="${item.id}"></td>`);
            fields.forEach(field => {
                if (field === 'image') {
                    row.append(`<td><img src="${item[field]}" alt="${item.name}" class="product-image"></td>`);
                } else if (field === 'price') {
                    row.append(`<td>$${item[field].toFixed(2)}</td>`);
                } else if (field === 'role') {
                    row.append(`<td class="role-${item[field]}">${item[field]}</td>`);
                } else {
                    row.append(`<td>${item[field]}</td>`);
                }
            });
            row.append(`
                <td>
                    <button class="action-btn" onclick="editItem('${currentSection.slice(0, -1)}', ${item.id})">Edit</button>
                    <button class="action-btn" onclick="deleteItem('${currentSection.slice(0, -1)}', ${item.id})">Delete</button>
                </td>
            `);
            table.append(row);
        });
    }

    function showAddModal(type) {
        currentAction = 'add';
        const modal = $('#modal');
        const modalTitle = $('#modalTitle');
        const modalForm = $('#modalForm');
        
        modalTitle.text(`Add ${type.charAt(0).toUpperCase() + type.slice(1)}`);
        modalForm.html('');
        
        if (type === 'user') {
            modalForm.html(`
                <input type="text" name="username" placeholder="Username" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="text" name="address" placeholder="Address" required>
                <select name="role" required>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                </select>
            `);
        } else if (type === 'product') {
            modalForm.html(`
                <input type="text" name="name" placeholder="Name" required>
                <input type="number" name="price" placeholder="Price" step="0.01" required>
                <input type="file" name="image" accept="image/*" required>
            `);
        }
        
        modal.show();
    }

    function editItem(type, id) {
        currentAction = 'edit';
        const modal = $('#modal');
        const modalTitle = $('#modalTitle');
        const modalForm = $('#modalForm');
        
        modalTitle.text(`Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        $.ajax({
            url: `/api/v1/${type}s/${id}`,
            method: 'GET',
            success: function(item) {
                if (type === 'user') {
                    modalForm.html(`
                        <input type="hidden" name="id" value="${item.id}">
                        <input type="text" name="username" value="${item.username}" required>
                        <input type="email" name="email" value="${item.email}" required>
                        <input type="password" name="password" placeholder="Leave blank to keep current password">
                        <input type="text" name="address" value="${item.address}" required>
                        <select name="role" required>
                            <option value="admin" ${item.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="manager" ${item.role === 'manager' ? 'selected' : ''}>Manager</option>
                            <option value="staff" ${item.role === 'staff' ? 'selected' : ''}>Staff</option>
                        </select>
                    `);
                } else if (type === 'product') {
                    modalForm.html(`
                        <input type="hidden" name="id" value="${item.id}">
                        <input type="text" name="name" value="${item.name}" required>
                        <input type="number" name="price" value="${item.price}" step="0.01" required>
                        <input type="file" name="image" accept="image/*">
                        <img src="${item.image}" alt="${item.name}" class="product-image">
                    `);
                }
                modal.show();
            },
            error: function(error) {
                console.error('Error fetching item details:', error);
            }
        });
    }

    function deleteItem(type, id) {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            $.ajax({
                url: `/api/v1/User/deleteUser`,
                method: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({ email: id }), // Assuming email is the identifier
                success: function(data) {
                    console.log('User deleted successfully:', data);
                    fetchData();
                },
                error: function(error) {
                    console.error('Error deleting user:', error);
                }
            });
        }
    }

    function closeModal() {
        $('#modal').hide();
    }

    function submitForm() {
        const form = document.getElementById('modalForm');
        const formData = new FormData(form);
        
        if (currentSection === 'users' && formData.get('password')) {
            const encryptedPassword = CryptoJS.AES.encrypt(formData.get('password'), 'secret_key').toString();
            formData.set('password', encryptedPassword);
        }

        const url = currentAction === 'add' ? '/api/v1/User/saveUser' : '/api/v1/User/updateUser';
        const method = currentAction === 'add' ? 'POST' : 'PUT';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(Object.fromEntries(formData.entries())),
            success: function(data) {
                console.log('Success:', data);
                closeModal();
                fetchData();
            },
            error: function(error) {
                console.error('Error submitting form:', error);
            }
        });
    }

    function goToHome() {
        window.location.href = '/home';
    }

    function logout() {
        $.ajax({
            url: '/api/logout',
            method: 'POST',
            success: function() {
                window.location.href = '/login';
            },
            error: function(error) {
                console.error('Error during logout:', error);
            }
        });
    }

    function searchItems(type) {
        const searchTerm = $('#searchInput').val().toLowerCase();
        $.ajax({
            url: `/api/v1/User/getUsers`, // Adjust if you have a specific search endpoint
            method: 'GET',
            success: function(users) {
                const filteredUsers = users.filter(user => 
                    user.username.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm)
                );
                populateTable('userTable', filteredUsers, ['username', 'email', 'address', 'role']);
            },
            error: function(error) {
                console.error('Error searching users:', error);
            }
        });
    }

    // Set user name in the welcome message
    $('#userName').text(userData.name);

    // Initial load
    showSection('dashboard');
});
