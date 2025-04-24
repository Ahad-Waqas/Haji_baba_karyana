
function formatCurrency(amount, currencyCode = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}

function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
}


function getRelativeTimeString(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffInMilliseconds = now - date;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 30) {
        return formatDate(dateString);
    } else if (diffInDays > 1) {
        return `${diffInDays} days ago`;
    } else if (diffInDays === 1) {
        return 'Yesterday';
    } else if (diffInHours > 1) {
        return `${diffInHours} hours ago`;
    } else if (diffInHours === 1) {
        return '1 hour ago';
    } else if (diffInMinutes > 1) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes === 1) {
        return '1 minute ago';
    } else {
        return 'Just now';
    }
}


function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function generateRandomId(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
}


function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
        if (pair === '') continue;
        
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    
    return params;
}


function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}


function truncateString(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}


function createNotification(message, type = 'info', duration = 3000) {
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = '#fff';
    notification.style.zIndex = '9999';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#2ecc71';
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f39c12';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#3498db';
            break;
    }
    
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}


function downloadFile(filename, content, contentType = 'text/plain') {
    const element = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    
    element.href = URL.createObjectURL(file);
    element.download = filename;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


function arrayToCSV(array) {
    if (!array || !array.length) return '';
    
    const headers = Object.keys(array[0]);
    
    const csvRows = [headers.join(',')];
    
    for (const item of array) {
        const values = headers.map(header => {
            const value = item[header] !== undefined ? item[header] : '';
            const valueStr = String(value);
            
            if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
                return `"${valueStr.replace(/"/g, '""')}"`;
            }
            return valueStr;
        });
        
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}


function createShareableLink(params = {}) {
    const url = new URL(window.location.href);
    
    url.search = '';
    
    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }
    
    return url.href;
}