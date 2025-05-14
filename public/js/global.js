// public/js/global.js
document.addEventListener('DOMContentLoaded', function() {
  // Global functionality that applies to all pages
  
  // Handle mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Handle user dropdown menu
  const userMenuToggle = document.querySelector('.user-menu-toggle');
  const userDropdown = document.querySelector('.user-dropdown');
  
  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function() {
      if (userDropdown.classList.contains('active')) {
        userDropdown.classList.remove('active');
      }
    });
    
    // Prevent dropdown from closing when clicking inside it
    userDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
  
  // Handle alerts dismissal
  const alerts = document.querySelectorAll('.alert');
  
  alerts.forEach(alert => {
    // Add close button if not present
    if (!alert.querySelector('.close-alert')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-alert';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close');
      alert.appendChild(closeBtn);
      
      closeBtn.addEventListener('click', function() {
        alert.remove();
      });
    }
  });
});