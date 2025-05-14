// public/js/header.js
document.addEventListener('DOMContentLoaded', function() {
  // For future dynamic header functionality
  // Currently, the header doesn't need much JavaScript
  
  // You could add scroll effects, sticky header logic, etc. here
  
  // Example: Add a class to the header when scrolling down
  const header = document.querySelector('.main-header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
});