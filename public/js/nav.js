// public/js/nav.js
document.addEventListener('DOMContentLoaded', function() {
  // Highlight current page in navigation
  const currentPath = window.location.pathname;
  
  // Find all nav links
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    // Check if the link href matches the current path
    const linkPath = link.getAttribute('href');
    
    if (currentPath === linkPath) {
      link.classList.add('active');
    } else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
      link.classList.add('active');
    }
  });
});