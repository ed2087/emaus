// public/js/cms/cmsDashboard.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard functionality
  
  // Handle tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  if (tabButtons.length > 0 && tabPanes.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Get the tab to show
        const tabId = this.getAttribute('data-tab');
        
        // Hide all tab panes
        tabPanes.forEach(pane => {
          pane.classList.remove('active');
        });
        
        // Remove active class from all buttons
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Show the selected tab pane
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Add active class to the clicked button
        this.classList.add('active');
      });
    });
  }
  
  // Initialize any charts or visualizations here if needed
});