document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
    updateDateTime();
    setInterval(updateDateTime, 60000);

    initShowMoreButtons();

    const activityList = document.querySelector('.activity-list');
    if (activityList && typeof window.updateActivityDisplay === 'function') {
        window.updateActivityDisplay();
    }
});

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
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

function initShowMoreButtons() {
    const showMoreBtn = document.getElementById('showMore');
    const moreActivities = document.getElementById('moreActivities');

    if (showMoreBtn && moreActivities) {
        showMoreBtn.addEventListener('click', function() {
            if (moreActivities.classList.contains('hidden')) {
                moreActivities.classList.remove('hidden');
                showMoreBtn.textContent = 'Show Less';
            } else {
                moreActivities.classList.add('hidden');
                showMoreBtn.textContent = 'Show More';
            }
        });
    }

    const showInstructionsBtn = document.getElementById('showInstructions');
    const instructionsContent = document.getElementById('instructionsContent');

    if (showInstructionsBtn && instructionsContent) {
        showInstructionsBtn.addEventListener('click', function() {
            if (instructionsContent.classList.contains('hidden')) {
                instructionsContent.classList.remove('hidden');
                showInstructionsBtn.textContent = 'Hide Instructions';
            } else {
                instructionsContent.classList.add('hidden');
                showInstructionsBtn.textContent = 'Show Instructions';
            }
        });
    }
}

function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

function formatDate(date, includeTime = false) {
    if (typeof date === 'string') {
        date = new Date(date);
    }

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

function initHeaderShadow() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initThemeSwitcher() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

function validateField(field, validationFn, errorMessage) {
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    const isValid = validationFn(field.value);
    if (!isValid) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        field.classList.add('invalid');
    } else {
        errorElement.style.display = 'none';
        field.classList.remove('invalid');
    }

    return isValid;
}

function formatCurrency(amount, currencyCode = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

initHeaderShadow();
initSmoothScroll();
