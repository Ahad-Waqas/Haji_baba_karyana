document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
    refreshActivityDisplay();
});

function updateDashboardStats() {
    const inventory = getInventoryData();
    
    const totalItems = inventory.length;
    document.getElementById('totalItems').textContent = totalItems;
    
    const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock <= 5).length;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    
    const outOfStockItems = inventory.filter(item => item.stock === 0).length;
    document.getElementById('outOfStockItems').textContent = outOfStockItems;
    
    const categories = new Set(inventory.map(item => item.category)).size;
    document.getElementById('totalCategories').textContent = categories;
}

function refreshActivityDisplay() {
    const recentActivities = document.getElementById('recentActivities');
    const moreActivities = document.getElementById('moreActivities');
    
    if (!recentActivities || !moreActivities) return;
    
    const activities = getActivityData();
    
    recentActivities.innerHTML = '';
    
    const mainActivities = activities.slice(0, 3);
    mainActivities.forEach(activity => {
        const activityItem = createActivityElement(activity);
        recentActivities.appendChild(activityItem);
    });
    
    moreActivities.innerHTML = '';
    
    const extraActivities = activities.slice(3, 6);
    extraActivities.forEach(activity => {
        const activityItem = createActivityElement(activity);
        moreActivities.appendChild(activityItem);
    });
}

function getInventoryData() {
    const storedData = localStorage.getItem('inventory_data');
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        return [];
    }
}

function getActivityData() {
    const storedData = localStorage.getItem('activity_data');
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        return [];
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

function updateDateTime() {
    const dateTimeElement = document.getElementById('currentDateTime');
    if (!dateTimeElement) return;

    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    dateTimeElement.textContent = `Current Date and Time: ${formattedDateTime}`;
}