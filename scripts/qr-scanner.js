let videoStream = null;
let videoElement = null;
let scanInterval = null;
let codeReader = null;
let scannedItems = [];
let scannerSound = null;
let autoAddToBatch = true; 

const INVENTORY_STORAGE_KEY = 'inventory_data';
const ACTIVITY_STORAGE_KEY = 'activity_data';

document.addEventListener('DOMContentLoaded', function() {
    scannerSound = new Audio();
    scannerSound.src = 'https://cdn.freesound.org/previews/233/233237_3537605-lq.mp3'; // Barcode scanner beep sound
    scannerSound.load();
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@zxing/library@latest/umd/index.min.js';
    script.onload = function() {
        const qrVideo = document.getElementById('qr-video');
        if (qrVideo) {
            videoElement = qrVideo;
            initQRScanner();
        }
    };
    document.head.appendChild(script);
});

function initQRScanner() {
    const startScanBtn = document.getElementById('startScanBtn');
    const stopScanBtn = document.getElementById('stopScanBtn');
    const cameraSelect = document.getElementById('cameraSelect');
    
    if (!startScanBtn || !stopScanBtn || !cameraSelect || !videoElement) return;
    
    createAutoAddToggle();
    
    codeReader = new ZXing.BrowserMultiFormatReader();
    
    populateCameraDevices(cameraSelect);
    
    startScanBtn.addEventListener('click', function() {
        const deviceId = cameraSelect.value;
        startCamera(deviceId);
        startScanBtn.disabled = true;
        stopScanBtn.disabled = false;
    });
    
    stopScanBtn.addEventListener('click', function() {
        stopCamera();
        startScanBtn.disabled = false;
        stopScanBtn.disabled = true;
    });
    
    cameraSelect.addEventListener('change', function() {
        if (videoStream) {
            const deviceId = cameraSelect.value;
            stopCamera();
            startCamera(deviceId);
        }
    });
    
    const showInstructionsBtn = document.getElementById('showInstructions');
    const instructionsContent = document.getElementById('instructionsContent');
    
    if (showInstructionsBtn && instructionsContent) {
        showInstructionsBtn.addEventListener('click', function() {
            instructionsContent.classList.toggle('hidden');
            showInstructionsBtn.textContent = instructionsContent.classList.contains('hidden') ? 
                'Show Instructions' : 'Hide Instructions';
        });
    }
    
    initBatchActionPanel();
}

function createAutoAddToggle() {
    const scannerControlsDiv = document.querySelector('.scanner-controls');
    if (!scannerControlsDiv) return;
    
    const autoAddToggleContainer = document.createElement('div');
    autoAddToggleContainer.className = 'auto-add-toggle';
    autoAddToggleContainer.innerHTML = `
        <label class="toggle-switch">
            <input type="checkbox" id="autoAddToggle" checked>
            <span class="toggle-slider"></span>
        </label>
        <span>Auto-Add to Batch</span>
    `;
    
    scannerControlsDiv.appendChild(autoAddToggleContainer);
    
    const autoAddToggle = document.getElementById('autoAddToggle');
    if (autoAddToggle) {
        autoAddToggle.addEventListener('change', function() {
            autoAddToBatch = this.checked;
            showNotification(`Auto-Add to Batch ${autoAddToBatch ? 'Enabled' : 'Disabled'}`, 'info');
        });
    }
}

function initBatchActionPanel() {
    const batchPanel = document.getElementById('batchActionPanel');
    if (!batchPanel) return;
    
    const itemCountElement = document.getElementById('itemCount');
    const scannedItemsList = document.getElementById('scannedItemsList');
    const applyBatchBtn = document.getElementById('applyBatchBtn');
    const clearBatchBtn = document.getElementById('clearBatchBtn');
    
    if (applyBatchBtn) {
        applyBatchBtn.addEventListener('click', applyBatchChanges);
    }
    
    if (clearBatchBtn) {
        clearBatchBtn.addEventListener('click', clearScannedItems);
    }
}

function populateCameraDevices(selectElement) {
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        const option = document.createElement('option');
        option.text = "Default Camera";
        option.value = "";
        selectElement.add(option);
        return;
    }
    
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            let cameraCount = 0;
            devices.forEach(device => {
                if (device.kind === 'videoinput') {
                    const option = document.createElement('option');
                    option.text = device.label || `Camera ${++cameraCount}`;
                    option.value = device.deviceId;
                    selectElement.add(option);
                }
            });
            if (cameraCount === 0) {
                const option = document.createElement('option');
                option.text = "No cameras found";
                option.value = "";
                option.disabled = true;
                selectElement.add(option);
            }
        })
        .catch(error => {
            const option = document.createElement('option');
            option.text = "Error loading cameras";
            option.value = "";
            selectElement.add(option);
        });
}

function startCamera(deviceId) {
    if (!codeReader) {
        showScanResult("Error: Scanner library not loaded", "error");
        return;
    }
    
    showScanResult("Starting camera and initializing scanner...", "info");
    
    const constraints = deviceId ? { deviceId: { exact: deviceId } } : undefined;
    
    codeReader.reset();
    
    codeReader.decodeFromConstraints({ video: constraints }, videoElement, (result, error) => {
        if (result) {
            playSuccessSound(); 
            handleSuccessfulScan(result);
        } else if (error && !(error instanceof ZXing.NotFoundException)) {
            console.error('Scanning error:', error);
        }
    }).catch(err => {
        showScanResult("Error accessing camera. Please check permissions.", "error");
        console.error('Camera error:', err);
    });
    
    showScanResult("Scanning for codes...", "info");
}


function playSuccessSound() {
    if (scannerSound) {
        scannerSound.pause();
        scannerSound.currentTime = 0;
        
        scannerSound.play().catch(err => {
            console.warn('Could not play scanner sound:', err);
        });
    }
}

function handleSuccessfulScan(result) {
    const codeValue = result.getText();
    const codeFormat = result.getBarcodeFormat();
    const formatName = ZXing.BarcodeFormat[codeFormat];
    
    let product = null;
    
    try {
        const jsonData = JSON.parse(codeValue);
        if (jsonData && jsonData.id && jsonData.name) {
            product = jsonData;
        }
    } catch(e) {
        const mockProducts = {
            '12345678': { id: 'P011', name: 'Bluetooth Speaker', stock: 15, price: 49.99 },
            '87654321': { id: 'P012', name: 'USB-C Cable', stock: 45, price: 9.99 },
            'LAPTOP123': { id: 'P013', name: 'Laptop Stand', stock: 8, price: 29.99 },
            '45678912': { id: 'P014', name: 'Wireless Mouse', stock: 12, price: 19.99 },
            '98765432': { id: 'P015', name: 'Keyboard', stock: 7, price: 39.99 }
        };
        
        product = mockProducts[codeValue];
        
        if (!product) {
            product = {
                id: `SCAN-${codeValue.substring(0, 8)}`,
                name: `Scanned Item (${formatName})`,
                stock: 1,
                price: 0.00
            };
        }
    }
    
    const resultHTML = `
        <div class="scan-success">
            <p><strong>Code Detected!</strong> (${formatName})</p>
            <p><strong>Value:</strong> ${codeValue}</p>
            <p><strong>ID:</strong> ${product.id}</p>
            <p><strong>Name:</strong> ${product.name}</p>
            <p><strong>Stock:</strong> ${product.stock} units</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
        </div>
        <div class="scan-actions">
            ${!autoAddToBatch ? `<button id="addToCartBtn" class="btn-primary">Add to Batch</button>` : ''}
            <button id="resumeScanningBtn" class="btn-secondary">Resume Scanning</button>
        </div>
    `;
    
    showScanResult(resultHTML);
    
    if (autoAddToBatch) {
        addItemToBatch(product, codeValue, formatName);
        
        setTimeout(() => {
            startCamera(document.getElementById('cameraSelect').value);
        }, 3500); // 1.5 second delay
    } else {
        codeReader.reset();
        
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                addItemToBatch(product, codeValue, formatName);
                startCamera(document.getElementById('cameraSelect').value);
            });
        }
        
        const resumeScanningBtn = document.getElementById('resumeScanningBtn');
        if (resumeScanningBtn) {
            resumeScanningBtn.addEventListener('click', function() {
                startCamera(document.getElementById('cameraSelect').value);
            });
        }
    }
}

function addItemToBatch(product, codeValue, formatName) {
    const existingIndex = scannedItems.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
        scannedItems[existingIndex].quantity += 1;
    } else {
        scannedItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            action: 'add',
            codeValue: codeValue,
            format: formatName
        });
    }
    
    updateBatchPanel();
    
    showNotification(`${product.name} added to batch`, 'success');
}

function updateBatchPanel() {
    const itemCountElement = document.getElementById('itemCount');
    const scannedItemsList = document.getElementById('scannedItemsList');
    const applyBatchBtn = document.getElementById('applyBatchBtn');
    const clearBatchBtn = document.getElementById('clearBatchBtn');
    
    if (!itemCountElement || !scannedItemsList) return;
    
    itemCountElement.textContent = scannedItems.length;
    
    if (applyBatchBtn) applyBatchBtn.disabled = scannedItems.length === 0;
    if (clearBatchBtn) clearBatchBtn.disabled = scannedItems.length === 0;
    
    scannedItemsList.innerHTML = '';
    
    scannedItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'scanned-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <strong>${item.name}</strong>
                <div>ID: ${item.id} | $${item.price.toFixed(2)}</div>
            </div>
            <div class="item-actions">
                <select class="action-type" data-index="${index}">
                    <option value="add" ${item.action === 'add' ? 'selected' : ''}>Add</option>
                    <option value="remove" ${item.action === 'remove' ? 'selected' : ''}>Remove</option>
                </select>
                <div class="quantity-control">
                    <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                    <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                </div>
                <span class="remove-item" data-index="${index}">&times;</span>
            </div>
        `;
        
        scannedItemsList.appendChild(itemElement);
    });
    
    const actionSelects = document.querySelectorAll('.action-type');
    actionSelects.forEach(select => {
        select.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            scannedItems[index].action = this.value;
        });
    });
    
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const value = parseInt(this.value);
            if (value >= 1) {
                scannedItems[index].quantity = value;
            } else {
                this.value = 1;
                scannedItems[index].quantity = 1;
            }
        });
    });
    
    const decreaseBtns = document.querySelectorAll('.decrease-btn');
    decreaseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const input = document.querySelector(`.quantity-input[data-index="${index}"]`);
            let value = parseInt(input.value);
            if (value > 1) {
                value--;
                input.value = value;
                scannedItems[index].quantity = value;
            }
        });
    });
    
    const increaseBtns = document.querySelectorAll('.increase-btn');
    increaseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const input = document.querySelector(`.quantity-input[data-index="${index}"]`);
            let value = parseInt(input.value);
            value++;
            input.value = value;
            scannedItems[index].quantity = value;
        });
    });
    
    const removeItemBtns = document.querySelectorAll('.remove-item');
    removeItemBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            scannedItems.splice(index, 1);
            updateBatchPanel();
        });
    });
}

function applyBatchChanges() {
    if (scannedItems.length === 0) return;
    
    const inventory = getInventoryData();
    let addedCount = 0;
    let removedCount = 0;
    
    scannedItems.forEach(item => {
        const existingItemIndex = inventory.findIndex(invItem => invItem.id === item.id);
        
        if (item.action === 'add') {
            if (existingItemIndex >= 0) {
                inventory[existingItemIndex].stock += item.quantity;
                inventory[existingItemIndex].lastUpdated = new Date().toISOString().split('T')[0];
            } else {
                const newItem = {
                    id: item.id,
                    name: item.name,
                    category: 'scanned',
                    stock: item.quantity,
                    price: item.price,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
                inventory.push(newItem);
            }
            
            addActivity('Added', item.name, item.quantity);
            addedCount += item.quantity;
        } else if (item.action === 'remove') {
            if (existingItemIndex >= 0) {
                inventory[existingItemIndex].stock = Math.max(0, inventory[existingItemIndex].stock - item.quantity);
                inventory[existingItemIndex].lastUpdated = new Date().toISOString().split('T')[0];
                
                addActivity('Removed', item.name, item.quantity);
                removedCount += item.quantity;
            } else {
                showNotification(`Cannot remove ${item.name}: not in inventory`, 'error');
            }
        }
    });
    
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    
    if (typeof window.updateDashboardStats === 'function') {
        window.updateDashboardStats();
    }
    
    let message = '';
    if (addedCount > 0) message += `Added ${addedCount} items. `;
    if (removedCount > 0) message += `Removed ${removedCount} items.`;
    if (message) showNotification(message, 'success');
    
    clearScannedItems();
}

function clearScannedItems() {
    scannedItems = [];
    updateBatchPanel();
}

function stopCamera() {
    if (codeReader) {
        codeReader.reset();
    }
    
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => {
            track.stop();
        });
        videoStream = null;
        videoElement.srcObject = null;
    }
    
    showScanResult("Scanner stopped", "info");
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
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
}

function getActivityData() {
    const storedData = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        return [];
    }
}

function getInventoryData() {
    const storedData = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        return [];
    }
}

function showScanResult(content, type = 'success') {
    const resultContainer = document.getElementById('scanResult');
    if (!resultContainer) return;
    resultContainer.classList.remove('info', 'success', 'error');
    if (type) {
        resultContainer.classList.add(type);
    }
    resultContainer.innerHTML = content;
}

function showNotification(message, type = 'success') {
    if (typeof window.showNotification === 'function' && 
        window.showNotification !== showNotification) {
        window.showNotification(message, type);
        return;
    }
    
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = type;
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}