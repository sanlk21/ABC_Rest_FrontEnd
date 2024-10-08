let currentSection = 'dashboard';
let currentAction = '';
let userData = {
    name: 'Admin',
    email: 'admin@example.com'
};

function showSection(sectionId) {
    $('.section').hide();
    $('#' + sectionId).show();
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
            <h3>Total Items</h3>
            <p id="totalItems">Loading...</p>
        </div>
        <div class="dashboard-card">
            <h3>Total Categories</h3>
            <p id="totalCategories">Loading...</p>
        </div>
    `);

    $.ajax({
        url: 'http://localhost:8080/api/v1/User/getUsers',
        method: 'GET',
        success: function (users) {
            $('#totalUsers').text(users.length);

            $.ajax({
                url: 'http://localhost:8080/api/v1/items/getItems',
                method: 'GET',
                success: function (items) {
                    $('#totalItems').text(items.length);

                    $.ajax({
                        url: 'http://localhost:8080/api/v1/categories/getCategory',
                        method: 'GET',
                        success: function (categories) {
                            $('#totalCategories').text(categories.length);

                            const ctx = document.getElementById('chart').getContext('2d');
                            new Chart(ctx, {
                                type: 'bar',
                                data: {
                                    labels: ['Users', 'Items', 'Categories'],
                                    datasets: [{
                                        label: 'Total Count',
                                        data: [users.length, items.length, categories.length],
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
                        error: function (error) {
                            console.error('Error loading categories:', error);
                            $('#totalCategories').text('Error');
                        }
                    });
                },
                error: function (error) {
                    console.error('Error loading items:', error);
                    $('#totalItems').text('Error');
                }
            });
        },
        error: function (error) {
            console.error('Error loading users:', error);
            $('#totalUsers').text('Error');
        }
    });
}

function fetchData() {
    if (currentSection === 'users') {
        fetchUsers();
    } else if (currentSection === 'items') {
        fetchItems();
    } else if (currentSection === 'categories') {
        fetchCategories();
    } else if (currentSection === 'qa') {
        displayQuestions();
    }
}

function fetchUsers() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/User/getUsers',
        method: 'GET',
        success: function (users) {
            populateTable('userTable', users, ['username', 'email', 'address', 'role']);
        },
        error: function (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users. Please try again.');
        }
    });
}

function fetchItems() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/items/getItems',
        method: 'GET',
        success: function (items) {
            populateTable('itemTable', items, ['id', 'name', 'description', 'category.name', 'price', 'quantity', 'imagePath']);
        },
        error: function (error) {
            console.error('Error fetching items:', error);
            alert('Failed to fetch items. Please try again.');
        }
    });
}

function fetchCategories() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/categories/getCategory',
        method: 'GET',
        success: function (categories) {
            populateTable('categoryTable', categories, ['id', 'name', 'description']);
        },
        error: function (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to fetch categories. Please try again.');
        }
    });
}

function displayQuestions() {
    fetch('http://localhost:8080/api/qa/all')
        .then(response => response.json())
        .then(questions => {
            const questionList = document.getElementById('questionList');
            questionList.innerHTML = '';
            if (questions.length === 0) {
                questionList.innerHTML = '<p>No questions found.</p>';
            } else {
                questions.forEach(q => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question';
                    questionDiv.innerHTML = `
                        <p><strong>From:</strong> ${q.userEmail}</p>
                        <p><strong>Question:</strong> ${q.question}</p>
                        <div class="answer">
                            <textarea id="answer-${q.id}">${q.answer || ''}</textarea>
                            <button onclick="submitAnswer(${q.id})">Submit Answer</button>
                            <button onclick="deleteQuestion(${q.id})">Delete</button>
                        </div>
                    `;
                    questionList.appendChild(questionDiv);
                });
            }
        })
        .catch(error => console.error('Error fetching questions:', error));
}

function submitAnswer(questionId) {
    const answerText = document.getElementById(`answer-${questionId}`).value;

    fetch(`http://localhost:8080/api/qa/answer/${questionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer: answerText })
    })
        .then(response => response.json())
        .then(data => {
            alert('Answer submitted successfully!');
            displayQuestions();
        })
        .catch(error => {
            console.error('Error submitting answer:', error);
            alert('Failed to submit the answer.');
        });
}

function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        fetch(`http://localhost:8080/api/qa/delete/${questionId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('Question deleted successfully!');
                    displayQuestions();
                } else {
                    alert('Failed to delete the question.');
                }
            })
            .catch(error => {
                console.error('Error deleting question:', error);
                alert('Failed to delete the question.');
            });
    }
}

function populateTable(tableId, data, fields) {
    const table = $('#' + tableId);
    table.find("tr:gt(0)").remove(); // Clear existing rows except header

    data.forEach(item => {
        const row = $('<tr>');
        row.append(`<td><input type="checkbox" name="select" value="${item.id}"></td>`);
        fields.forEach(field => {
            if (field === 'role' && tableId === 'userTable') {
                let roleColor = '';
                if (item[field] === 'ADMIN') roleColor = 'background-color: #ffcccc;'; // Light red for Admin
                if (item[field] === 'CUSTOMER') roleColor = 'background-color: #ccffcc;'; // Light green for Customer
                if (item[field] === 'STAFF') roleColor = 'background-color: #fffd68;'; // Light blue for Staff
                row.append(`<td style="${roleColor}">${item[field]}</td>`);
            } else if (field === 'price' && tableId === 'itemTable') {
                row.append(`<td>$${item[field].toFixed(2)}</td>`);
            } else if (field === 'imagePath' && tableId === 'itemTable') {
                row.append(`<td><img src="${item[field]}" alt="${item.name}" width="50" height="50" style="object-fit: cover;"></td>`);
            } else if (field.includes('.')) {
                const [obj, prop] = field.split('.');
                row.append(`<td>${item[obj] ? item[obj][prop] : ''}</td>`);
            } else {
                row.append(`<td>${item[field]}</td>`);
            }
        });

        const email = tableId === 'userTable' ? item.email : null;

        row.append(`
            <td>
                <button class="action-btn" onclick="editItem('${tableId.replace('Table', '')}', ${item.id}, '${email}')">Edit</button>
                <button class="action-btn" onclick="deleteItem('${tableId.replace('Table', '')}', ${item.id}, '${email}')">Delete</button>
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
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
            </select>
        `);
    } else if (type === 'item') {
        modalForm.html(`
            <input type="text" name="name" placeholder="Item Name" required>
            <textarea name="description" placeholder="Description" required></textarea>
            <select name="categoryId" required>
                <option value="">Select Category</option>
            </select>
            <input type="number" name="price" placeholder="Price" step="0.01" required>
            <input type="number" name="quantity" placeholder="Quantity" required>
            <input type="file" name="image" accept="image/*" required>
        `);
        populateCategoryDropdown();
    } else if (type === 'category') {
        modalForm.html(`
            <input type="text" name="name" placeholder="Category Name" required>
            <textarea name="description" placeholder="Description"></textarea>
        `);
    }

    modal.show();
}

function editItem(type, id, email) {
    currentAction = 'edit';
    const modal = $('#modal');
    const modalTitle = $('#modalTitle');
    const modalForm = $('#modalForm');

    modalTitle.text(`Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`);

    const url = type === 'user' ? `http://localhost:8080/api/v1/User/getUser/${email}` :
        type === 'item' ? `http://localhost:8080/api/v1/items/getItem/${id}` :
            `http://localhost:8080/api/v1/categories/getCatID/${id}`;

    $.ajax({
        url: url,
        method: 'GET',
        success: function (item) {
            if (type === 'user') {
                modalForm.html(`
                    <input type="text" name="username" value="${item.username}" required>
                    <input type="email" name="email" value="${item.email}" required readonly>
                    <input type="password" name="password" placeholder="Leave blank to keep current password">
                    <input type="text" name="address" value="${item.address}" required>
                    <select name="role" required>
                        <option value="ADMIN" ${item.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                        <option value="CUSTOMER" ${item.role === 'CUSTOMER' ? 'selected' : ''}>Customer</option>
                        <option value="STAFF" ${item.role === 'STAFF' ? 'selected' : ''}>Staff</option>
                    </select>
                `);
            } else if (type === 'item') {
                modalForm.html(`
                    <input type="hidden" name="id" value="${item.id}">
                    <input type="text" name="name" value="${item.name}" required>
                    <textarea name="description" required>${item.description}</textarea>
                    <select name="categoryId" required>
                        <option value="">Select Category</option>
                    </select>
                    <input type="number" name="price" value="${item.price}" step="0.01" required>
                    <input type="number" name="quantity" value="${item.quantity}" required>
                    <input type="file" name="image" accept="image/*">
                    <img src="${item.imagePath}" alt="Item Image" width="100">
                `);
                populateCategoryDropdown(item.category.id);
            } else if (type === 'category') {
                modalForm.html(`
                    <input type="hidden" name="id" value="${item.id}">
                    <input type="text" name="name" value="${item.name}" required>
                    <textarea name="description">${item.description}</textarea>
                `);
            }
            modal.show();
        },
        error: function (error) {
            console.error('Error fetching item details:', error);
            alert('Failed to fetch item details. Please try again.');
        }
    });
}

function deleteItem(type, id, email) {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        let url;
        if (type === 'user') {
            url = `http://localhost:8080/api/v1/User/deleteUser/${email}`;
        } else if (type === 'item') {
            url = `http://localhost:8080/api/v1/items/deleteItem/${id}`;
        } else if (type === 'category') {
            url = `http://localhost:8080/api/v1/categories/deleteCategory/${id}`;
        }

        $.ajax({
            url: url,
            method: 'DELETE',
            success: function () {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
                fetchData();  // Refresh the data after deletion
            },
            error: function (error) {
                if (error.responseJSON && error.responseJSON.message.includes('foreign key constraint')) {
                    alert(`Cannot delete ${type} as it is referenced in other records.`);
                } else {
                    console.error(`Error deleting ${type}:`, error);
                    alert(`Failed to delete ${type}. Please try again.`);
                }
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

    let url, method;

    if (currentSection === 'users') {
        url = currentAction === 'add' ? 'http://localhost:8080/api/v1/User/saveUser' : 'http://localhost:8080/api/v1/User/updateUser';
        method = currentAction === 'add' ? 'POST' : 'PUT';

        const jsonData = {};
        formData.forEach((value, key) => {
            if (key !== 'password' || value !== '') {
                jsonData[key] = value;
            }
        });

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(jsonData),
            success: function () {
                alert('User saved successfully.');
                closeModal();
                fetchData();
            },
            error: function (error) {
                console.error('Error submitting form:', error);
                alert('Failed to save user. Please try again.');
            }
        });
    } else if (currentSection === 'items') {
        const id = formData.get('id');
        url = currentAction === 'add' ? 'http://localhost:8080/api/v1/items/saveItem' : `http://localhost:8080/api/v1/items/updateItem/${id}`;
        method = currentAction === 'add' ? 'POST' : 'PUT';

        $.ajax({
            url: url,
            method: method,
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert('Item saved successfully.');
                closeModal();
                fetchData();
            },
            error: function (error) {
                console.error('Error submitting form:', error);
                alert('Failed to save item. Please try again.');
            }
        });
    } else if (currentSection === 'categories') {
        url = currentAction === 'add' ? 'http://localhost:8080/api/v1/categories/saveCategory' : `http://localhost:8080/api/v1/categories/updateCategory/${formData.get('id')}`;
        method = currentAction === 'add' ? 'POST' : 'PUT';

        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(jsonData),
            success: function () {
                alert('Category saved successfully.');
                closeModal();
                fetchData();
            },
            error: function (error) {
                console.error('Error submitting form:', error);
                alert('Failed to save category. Please try again.');
            }
        });
    }
}

function searchItems(type) {
    const searchTerm = $(`#${type}SearchInput`).val().toLowerCase();
    const url = type === 'user' ? 'http://localhost:8080/api/v1/User/getUsers' :
        type === 'item' ? 'http://localhost:8080/api/v1/items/getItems' :
            'http://localhost:8080/api/v1/categories/getCategory';
    $.ajax({
        url: url,
        method: 'GET',
        success: function (items) {
            const filteredItems = items.filter(item =>
            (type === 'user' ? (item.username.toLowerCase().includes(searchTerm) || item.email.toLowerCase().includes(searchTerm))
                : type === 'item' ? (item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm))
                    : (item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm)))
            );
            populateTable(`${type}Table`, filteredItems,
                type === 'user' ? ['username', 'email', 'address', 'role'] :
                    type === 'item' ? ['id', 'name', 'description', 'category.name', 'price', 'quantity', 'imagePath'] :
                        ['id', 'name', 'description']);
        },
        error: function (error) {
            console.error(`Error searching ${type}s:`, error);
            alert(`Failed to search ${type}s. Please try again.`);
        }
    });
}

function showAllUsers() {
    fetchUsers();
}

function showAllItems() {
    fetchItems();
}

function showAllCategories() {
    fetchCategories();
}

function populateCategoryDropdown(selectedCategoryId) {
    $.ajax({
        url: 'http://localhost:8080/api/v1/categories/getCategory',
        method: 'GET',
        success: function (categories) {
            const dropdown = $('select[name="categoryId"]');
            dropdown.html('<option value="">Select Category</option>');
            categories.forEach(category => {
                dropdown.append(`<option value="${category.id}" ${category.id === selectedCategoryId ? 'selected' : ''}>${category.name}</option>`);
            });
        },
        error: function (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to fetch categories. Please try again.');
        }
    });
}

function goToHome() {
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = 'login.html';
}

// Initialize the dashboard
$(document).ready(function () {
    $('#userName').text(userData.name);
    showSection('dashboard');

    // Add event listeners for form submission and modal closing
    $('#modalForm').on('submit', function (e) {
        e.preventDefault();
        submitForm();
    });

    $('.close').on('click', closeModal);
});
