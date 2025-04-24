// Local storage keys
const INVENTORY_STORAGE_KEY = 'inventory_data';
const ACTIVITY_STORAGE_KEY = 'activity_data';

// const mockInventoryData = [
//     { 
//         id: 'P001', 
//         name: 'Wireless Mouse', 
//         category: 'electronics', 
//         stock: 47, 
//         price: 24.99, 
//         lastUpdated: '2025-04-15' 
//     },
//     { 
//         id: 'P002', 
//         name: 'Mechanical Keyboard', 
//         category: 'electronics', 
//         stock: 25, 
//         price: 89.99, 
//         lastUpdated: '2025-04-19' 
//     },
//     { 
//         id: 'P003', 
//         name: 'Office Chair', 
//         category: 'furniture', 
//         stock: 12, 
//         price: 199.99, 
//         lastUpdated: '2025-04-10' 
//     },
//     { 
//         id: 'P004', 
//         name: 'Desk Lamp', 
//         category: 'office', 
//         stock: 30, 
//         price: 34.50, 
//         lastUpdated: '2025-04-05' 
//     },
//     { 
//         id: 'P005', 
//         name: 'External Hard Drive', 
//         category: 'electronics', 
//         stock: 18, 
//         price: 79.99, 
//         lastUpdated: '2025-04-18' 
//     },
//     { 
//         id: 'P006', 
//         name: 'Notebook Pack', 
//         category: 'office', 
//         stock: 85, 
//         price: 12.99, 
//         lastUpdated: '2025-04-02' 
//     },
//     { 
//         id: 'P007', 
//         name: 'Wireless Headphones', 
//         category: 'electronics', 
//         stock: 5, 
//         price: 149.99, 
//         lastUpdated: '2025-04-12' 
//     },
//     { 
//         id: 'P008', 
//         name: 'Standing Desk', 
//         category: 'furniture', 
//         stock: 0, 
//         price: 349.99, 
//         lastUpdated: '2025-04-01' 
//     },
//     { 
//         id: 'P009', 
//         name: 'Wireless Keyboard', 
//         category: 'electronics', 
//         stock: 22, 
//         price: 59.99, 
//         lastUpdated: '2025-04-14' 
//     },
//     { 
//         id: 'P010', 
//         name: 'Monitor', 
//         category: 'electronics', 
//         stock: 3, 
//         price: 199.99, 
//         lastUpdated: '2025-04-17' 
//     }
// ];

document.addEventListener('DOMContentLoaded', function() {
    const productTableBody = document.getElementById('productTableBody');
    if (productTableBody) {
        initializeProductTable();
        initializeFilters();
        initializePagination();
    }
    
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        initializeAddItemForm();
    }
    
    const generateReportBtn = document.getElementById('generateReport');
    if (generateReportBtn) {
        initializeReportGeneration();
    }
    
    if (typeof window.updateDashboardStats === 'function') {
        window.updateDashboardStats();
    }
    
    if (typeof window.refreshActivityDisplay === 'function') {
        window.refreshActivityDisplay();
    }
});

function getInventoryData() {
    const storedData = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventoryData));
        return mockInventoryData;
    }
}

function saveInventoryData(data) {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
}

function getActivityData() {
    const storedData = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        const defaultActivity = [
            {
                action: 'Added',
                item: 'Wireless Mouse',
                quantity: 15,
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
            },
            {
                action: 'Updated',
                item: 'Mechanical Keyboard',
                quantity: 25,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            },
            {
                action: 'Removed',
                item: 'Outdated Headphones',
                quantity: null,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
            }
        ];
        localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(defaultActivity));
        return defaultActivity;
    }
}

function saveActivityData(data) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(data));
}

function addActivity(action, item, quantity = null) {
    const activities = getActivityData();
    
    const newActivity = {
        action: action,
        item: item,
        quantity: quantity,
        timestamp: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    
    const maxActivities = 50;
    if (activities.length > maxActivities) {
        activities.length = maxActivities;
    }
    
    saveActivityData(activities);
    
    updateActivityDisplay();
}

function updateActivityDisplay() {
    const activityList = document.querySelector('.activity-list:not(.hidden)');
    const moreActivities = document.getElementById('moreActivities');
    
    if (!activityList) return; 
    
    const activities = getActivityData();
    
    if (activityList) {
        activityList.innerHTML = '';
        
        const mainActivities = activities.slice(0, 3);
        mainActivities.forEach(activity => {
            const activityItem = createActivityElement(activity);
            activityList.appendChild(activityItem);
        });
    }
    
    if (moreActivities) {
        moreActivities.innerHTML = '';
        
        const extraActivities = activities.slice(3, 6);
        extraActivities.forEach(activity => {
            const activityItem = createActivityElement(activity);
            moreActivities.appendChild(activityItem);
        });
    }
}

function createActivityElement(activity) {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    const activityText = document.createElement('p');
    if (activity.quantity) {
        activityText.innerHTML = `<strong>${activity.action}:</strong> ${activity.item} - ${activity.quantity} units`;
    } else {
        activityText.innerHTML = `<strong>${activity.action}:</strong> ${activity.item}`;
    }
    
    const activityTime = document.createElement('span');
    activityTime.className = 'activity-time';
    activityTime.textContent = formatActivityTime(activity.timestamp);
    
    activityItem.appendChild(activityText);
    activityItem.appendChild(activityTime);
    
    return activityItem;
}

function formatActivityTime(timestamp) {
    const activityDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - activityDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
        return 'Yesterday';
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        const options = { month: 'short', day: 'numeric' };
        return activityDate.toLocaleDateString('en-US', options);
    }
}

function initializeProductTable() {
    const productTableBody = document.getElementById('productTableBody');
    if (!productTableBody) return;
    
    const inventory = getInventoryData();
    
    if (window.paginationState) {
        applyPagination(inventory);
    } else {
        renderProductTable(inventory);
    }
}

function renderProductTable(data) {
    const productTableBody = document.getElementById('productTableBody');
    if (!productTableBody) return;
    
    productTableBody.innerHTML = '';
    
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">No items found</td>';
        productTableBody.appendChild(emptyRow);
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        
        let stockClass = '';
        if (item.stock === 0) {
            stockClass = 'text-danger';
        } else if (item.stock <= 5) {
            stockClass = 'text-warning';
        }
        
        const formattedPrice = `$${item.price.toFixed(2)}`;
        
        const formattedCategory = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        
        row.innerHTML = `
            <td data-label="ID">${item.id}</td>
            <td data-label="Product Name">${item.name}</td>
            <td data-label="Category">${formattedCategory}</td>
            <td data-label="Stock" class="${stockClass}">${item.stock}</td>
            <td data-label="Price">${formattedPrice}</td>
            <td data-label="Last Updated">${item.lastUpdated}</td>
            <td data-label="Actions">
                <button class="btn-edit" data-id="${item.id}">Edit</button>
                <button class="btn-delete" data-id="${item.id}">Delete</button>
            </td>
        `;
        
        productTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    addTableActionListeners();
}

function addTableActionListeners() {
    // Edit button click handlers
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            editItem(itemId);
        });
    });
    
    // Delete button click handlers
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            deleteItem(itemId);
        });
    });
}

function editItem(itemId) {
    const inventory = getInventoryData();
    const item = inventory.find(item => item.id === itemId);
    
    if (!item) {
        showNotification('Item not found!', 'error');
        return;
    }
    
    const originalName = item.name;
    const originalStock = item.stock;
    
    const modalHtml = `
        <div id="editModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Item</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editItemForm">
                        <div class="form-group">
                            <label for="editProductName">Product Name</label>
                            <input type="text" id="editProductName" value="${item.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editProductCategory">Category</label>
                            <select id="editProductCategory" required>
                                <option value="electronics" ${item.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                                <option value="office" ${item.category === 'office' ? 'selected' : ''}>Office Supplies</option>
                                <option value="furniture" ${item.category === 'furniture' ? 'selected' : ''}>Furniture</option>
                                <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editProductQuantity">Quantity</label>
                                <input type="number" id="editProductQuantity" value="${item.stock}" min="0" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editProductPrice">Price ($)</label>
                                <input type="number" id="editProductPrice" value="${item.price}" min="0" step="0.01" required>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" id="cancelEditBtn" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const editForm = document.getElementById('editItemForm');
    
    modal.style.display = 'block';
    
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.removeChild(modalContainer);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const updatedName = document.getElementById('editProductName').value;
        const updatedCategory = document.getElementById('editProductCategory').value;
        const updatedStock = parseInt(document.getElementById('editProductQuantity').value);
        const updatedPrice = parseFloat(document.getElementById('editProductPrice').value);
        
        const inventory = getInventoryData();
        const itemIndex = inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            inventory[itemIndex].name = updatedName;
            inventory[itemIndex].category = updatedCategory;
            inventory[itemIndex].stock = updatedStock;
            inventory[itemIndex].price = updatedPrice;
            inventory[itemIndex].lastUpdated = new Date().toISOString().split('T')[0];
            
            saveInventoryData(inventory);
            
            if (originalStock !== updatedStock) {
                addActivity('Updated', updatedName, updatedStock);
            }
            
            renderProductTable(inventory);
            
            if (typeof window.updateDashboardStats === 'function') {
                window.updateDashboardStats();
            }
            
            showNotification('Item updated successfully!', 'success');
        }
        
        closeModal();
    });
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        const inventory = getInventoryData();
        const itemToDelete = inventory.find(item => item.id === itemId);
        const updatedInventory = inventory.filter(item => item.id !== itemId);
        saveInventoryData(updatedInventory);
        
        if (itemToDelete) {
            addActivity('Removed', itemToDelete.name);
        }
        
        renderProductTable(updatedInventory);
        
        if (typeof window.updateDashboardStats === 'function') {
            window.updateDashboardStats();
        }
        
        showNotification('Item deleted successfully!', 'success');
    }
}

function initializeFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    
    if (!searchInput || !searchBtn || !categoryFilter || !stockFilter) return;
    
    // Search button click handler
    searchBtn.addEventListener('click', function() {
        applyFilters();
    });
    
    // Search input enter key handler
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Category filter change handler
    categoryFilter.addEventListener('change', function() {
        applyFilters();
    });
    
    // Stock filter change handler
    stockFilter.addEventListener('change', function() {
        applyFilters();
    });
}

function applyFilters() {
    const filteredData = applyFiltersWithoutRendering();
    
    // Reset pagination to first page when filtering
    if (window.paginationState) {
        window.paginationState.currentPage = 1;
    }
    
    // Apply pagination to filtered data
    if (window.paginationState) {
        applyPagination(filteredData);
        updatePaginationDisplay();
    } else {
        // If pagination is not initialized, just render the filtered data
        renderProductTable(filteredData);
    }
}

function applyFiltersWithoutRendering() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    
    if (!searchInput || !categoryFilter || !stockFilter) return getInventoryData();
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value;
    const stockValue = stockFilter.value;
    
    let filteredData = getInventoryData();
    
    // Apply search filter
    if (searchTerm) {
        filteredData = filteredData.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.id.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (categoryValue) {
        filteredData = filteredData.filter(item => item.category === categoryValue);
    }
    
    // Apply stock filter
    if (stockValue) {
        switch (stockValue) {
            case 'instock':
                filteredData = filteredData.filter(item => item.stock > 5);
                break;
            case 'lowstock':
                filteredData = filteredData.filter(item => item.stock > 0 && item.stock <= 5);
                break;
            case 'outofstock':
                filteredData = filteredData.filter(item => item.stock === 0);
                break;
        }
    }
    
    return filteredData;
}

function initializePagination() {
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    
    if (!prevPageBtn || !nextPageBtn || !currentPageSpan) return;
    
    // Initialize pagination state
    window.paginationState = {
        currentPage: 1,
        itemsPerPage: 5, // Default items per page
        totalItems: 0,
        totalPages: 1
    };
    
    // Load current inventory to get total
    const inventory = getInventoryData();
    window.paginationState.totalItems = inventory.length;
    window.paginationState.totalPages = Math.ceil(window.paginationState.totalItems / window.paginationState.itemsPerPage);
    
    // Update page display
    updatePaginationDisplay();
    
    // Apply initial pagination
    applyPagination(inventory);
    
    // Previous page button
    prevPageBtn.addEventListener('click', function() {
        if (window.paginationState.currentPage > 1) {
            window.paginationState.currentPage--;
            const filteredData = applyFiltersWithoutRendering();
            applyPagination(filteredData);
            updatePaginationDisplay();
        }
    });
    
    // Next page button
    nextPageBtn.addEventListener('click', function() {
        if (window.paginationState.currentPage < window.paginationState.totalPages) {
            window.paginationState.currentPage++;
            const filteredData = applyFiltersWithoutRendering();
            applyPagination(filteredData);
            updatePaginationDisplay();
        }
    });
    
    // Items per page selector
    if (itemsPerPageSelect) {
        // Set initial value
        itemsPerPageSelect.value = window.paginationState.itemsPerPage;
        
        // Handle change
        itemsPerPageSelect.addEventListener('change', function() {
            window.paginationState.itemsPerPage = parseInt(this.value);
            window.paginationState.currentPage = 1; // Reset to first page
            
            const filteredData = applyFiltersWithoutRendering();
            window.paginationState.totalPages = Math.ceil(filteredData.length / window.paginationState.itemsPerPage);
            
            applyPagination(filteredData);
            updatePaginationDisplay();
        });
    }
}

function updatePaginationDisplay() {
    const currentPageSpan = document.getElementById('currentPage');
    if (!currentPageSpan) return;
    
    currentPageSpan.textContent = `Page ${window.paginationState.currentPage} of ${window.paginationState.totalPages}`;
    
    // Update button states
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (prevPageBtn) {
        prevPageBtn.disabled = window.paginationState.currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = window.paginationState.currentPage >= window.paginationState.totalPages;
    }
}

function applyPagination(data) {
    if (!data) return;
    
    const { currentPage, itemsPerPage } = window.paginationState;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get items for current page
    const paginatedData = data.slice(startIndex, endIndex);
    
    // Update pagination info
    window.paginationState.totalItems = data.length;
    window.paginationState.totalPages = Math.ceil(data.length / itemsPerPage);
    
    // Render the table with paginated data
    renderProductTable(paginatedData);
}

function initializeAddItemForm() {
    const addItemForm = document.getElementById('addItemForm');
    const formResult = document.getElementById('formResult');
    const addAnotherBtn = document.getElementById('addAnotherBtn');
    
    if (!addItemForm || !formResult || !addAnotherBtn) return;
    
    addItemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productName = document.getElementById('productName').value;
        const productCategory = document.getElementById('productCategory').value;
        const productQuantity = parseInt(document.getElementById('productQuantity').value);
        const productPrice = parseFloat(document.getElementById('productPrice').value);
        const productDescription = document.getElementById('productDescription').value;
        
        const inventory = getInventoryData();
        const newItemId = generateItemId(inventory);
        
        const newItem = {
            id: newItemId,
            name: productName,
            category: productCategory,
            stock: productQuantity,
            price: productPrice,
            description: productDescription,
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        inventory.push(newItem);
        saveInventoryData(inventory);
        
        addActivity('Added', productName, productQuantity);
        
        if (typeof window.updateDashboardStats === 'function') {
            window.updateDashboardStats();
        }
        
        addItemForm.classList.add('hidden');
        formResult.classList.remove('hidden');
    });
    
    addAnotherBtn.addEventListener('click', function() {
        addItemForm.reset();
        addItemForm.classList.remove('hidden');
        formResult.classList.add('hidden');
    });
}

function generateItemId(inventory) {
    // Find highest current ID number
    let maxId = 0;
    inventory.forEach(item => {
        const idNum = parseInt(item.id.replace('P', ''));
        if (idNum > maxId) {
            maxId = idNum;
        }
    });
    
    // Generate new ID
    const newIdNum = maxId + 1;
    return `P${newIdNum.toString().padStart(3, '0')}`;
}

function initializeReportGeneration() {
    const generateReportBtn = document.getElementById('generateReport');
    const reportType = document.getElementById('reportType');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (!generateReportBtn || !reportType || !startDate || !endDate) return;
    
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js', function() {
        // Initialize default chart
        initInventoryChart();
    });
    
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    startDate.value = thirtyDaysAgoStr;
    endDate.value = today;
    
    generateReportBtn.addEventListener('click', function() {
        generateReport(reportType.value);
    });
    
    const printReportBtn = document.getElementById('printReport');
    const exportPDFBtn = document.getElementById('exportPDF');
    const exportCSVBtn = document.getElementById('exportCSV');
    
    if (printReportBtn) {
        printReportBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', function() {
            showNotification('Export to PDF functionality would go here', 'info');
        });
    }
    
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', function() {
            const inventory = getInventoryData();
            
            const csv = arrayToCSV(inventory);
            
            downloadFile('inventory_export.csv', csv, 'text/csv');
        });
    }
}

function initInventoryChart() {
    const chartCanvas = document.getElementById('inventoryChart');
    if (!chartCanvas || typeof Chart === 'undefined') return;
    
    const inventory = getInventoryData();
    
    const categories = [];
    const categoryCounts = [];
    const categoryColors = [
        'rgba(67, 97, 238, 0.7)',
        'rgba(76, 201, 240, 0.7)',
        'rgba(6, 214, 160, 0.7)',
        'rgba(255, 209, 102, 0.7)',
        'rgba(239, 71, 111, 0.7)'
    ];
    
    const categoryGroups = {};
    
    inventory.forEach(item => {
        if (!categoryGroups[item.category]) {
            categoryGroups[item.category] = 0;
        }
        categoryGroups[item.category]++;
    });
    
    for (const category in categoryGroups) {
        categories.push(category.charAt(0).toUpperCase() + category.slice(1));
        categoryCounts.push(categoryGroups[category]);
    }
    
    new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Items per Category',
                data: categoryCounts,
                backgroundColor: categoryColors,
                borderColor: categoryColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} items`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function generateReport(reportType) {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return;
    
    const inventory = getInventoryData();
    
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.innerHTML = '<canvas id="inventoryChart"></canvas>';
    }
    
    let reportHtml = '';
    
    switch (reportType) {
        case 'inventory':
            reportHtml = generateInventorySummaryReport(inventory);
            break;
        case 'lowStock':
            reportHtml = generateLowStockReport(inventory);
            break;
        case 'value':
            reportHtml = generateInventoryValueReport(inventory);
            break;
        case 'category':
            reportHtml = generateCategoryReport(inventory);
            break;
        default:
            reportHtml = generateInventorySummaryReport(inventory);
    }
    
    reportContent.innerHTML = reportHtml;
    
    initInventoryChart();
    
    showNotification(`Generated ${reportType} report`, 'success');
}

function generateInventorySummaryReport(inventory) {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock <= 5).length;
    const outOfStockItems = inventory.filter(item => item.stock === 0).length;
    
    return `
        <h3>Inventory Summary Report</h3>
        <div class="report-summary">
            <div class="summary-card">
                <h4>Total Items</h4>
                <p>${totalItems}</p>
            </div>
            <div class="summary-card">
                <h4>Total Value</h4>
                <p>${formatCurrency(totalValue)}</p>
            </div>
            <div class="summary-card">
                <h4>Low Stock Items</h4>
                <p>${lowStockItems}</p>
            </div>
            <div class="summary-card">
                <h4>Out of Stock</h4>
                <p>${outOfStockItems}</p>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="inventoryChart"></canvas>
        </div>
        
        <div class="report-details">
            <h4>Category Breakdown</h4>
            ${generateCategoryBreakdownTable(inventory)}
        </div>
    `;
}

function generateLowStockReport(inventory) {
    const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock <= 5);
    const outOfStockItems = inventory.filter(item => item.stock === 0);
    
    return `
        <h3>Low Stock Report</h3>
        <div class="report-summary">
            <div class="summary-card">
                <h4>Low Stock Items</h4>
                <p>${lowStockItems.length}</p>
            </div>
            <div class="summary-card">
                <h4>Out of Stock</h4>
                <p>${outOfStockItems.length}</p>
            </div>
        </div>
        
        <div class="report-details">
            <h4>Items Needing Restock</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${lowStockItems.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                            <td class="text-warning">${item.stock}</td>
                            <td>${formatCurrency(item.price)}</td>
                        </tr>
                    `).join('')}
                    
                    ${outOfStockItems.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                            <td class="text-danger">${item.stock}</td>
                            <td>${formatCurrency(item.price)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateInventoryValueReport(inventory) {
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    
    const sortedInventory = [...inventory].sort((a, b) => 
        (b.price * b.stock) - (a.price * a.stock)
    );
    
    const topItems = sortedInventory.slice(0, 10);
    
    return `
        <h3>Inventory Value Report</h3>
        <div class="report-summary">
            <div class="summary-card">
                <h4>Total Value</h4>
                <p>${formatCurrency(totalValue)}</p>
            </div>
            <div class="summary-card">
                <h4>Average Item Value</h4>
                <p>${formatCurrency(totalValue / inventory.length)}</p>
            </div>
        </div>
        
        <div class="report-details">
            <h4>Highest Value Items</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Stock</th>
                        <th>Unit Price</th>
                        <th>Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${topItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.stock}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.price * item.stock)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateCategoryReport(inventory) {
    return `
        <h3>Category Breakdown Report</h3>
        
        <div class="chart-container">
            <canvas id="inventoryChart"></canvas>
        </div>
        
        <div class="report-details">
            <h4>Category Breakdown</h4>
            ${generateCategoryBreakdownTable(inventory)}
        </div>
    `;
}

function generateCategoryBreakdownTable(inventory) {
    const categories = {};
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    
    inventory.forEach(item => {
        const category = item.category;
        
        if (!categories[category]) {
            categories[category] = {
                count: 0,
                value: 0
            };
        }
        
        categories[category].count++;
        categories[category].value += item.price * item.stock;
    });
    
    return `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Items</th>
                    <th>Value</th>
                    <th>% of Inventory</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(categories).map(([category, data]) => `
                    <tr>
                        <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                        <td>${data.count}</td>
                        <td>${formatCurrency(data.value)}</td>
                        <td>${(data.value / totalValue * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}


function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}


function arrayToCSV(array) {
    if (!array || !array.length) return '';
    
    
    const headers = Object.keys(array[0]);
    
    
    const csvRows = [headers.join(',')];
    
    
    for (const item of array) {
        const values = headers.map(header => {
            const value = item[header] || '';
            
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                ? `"${value.replace(/"/g, '""')}"` 
                : value;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}


function downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showNotification(message, type = 'success') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    alert(`${type.toUpperCase()}: ${message}`);
}