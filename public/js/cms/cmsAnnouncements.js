// public/js/cms/cmsAnnouncements.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize announcements management functionality
  
  // Handle status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      const status = this.value;
      window.location.href = `/admin/announcements${status !== 'all' ? '?filter=' + status : ''}`;
    });
  }
  
  // Handle search
  const searchInput = document.getElementById('search');
  const searchButton = searchInput?.nextElementSibling;
  
  if (searchInput && searchButton) {
    // Search on button click
    searchButton.addEventListener('click', function() {
      performSearch();
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (query === '') return;
    
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Update or add search parameter
    urlParams.set('search', query);
    
    // Redirect to search URL
    window.location.href = `/admin/announcements?${urlParams.toString()}`;
  }
  
  // Handle delete buttons
  const deleteButtons = document.querySelectorAll('.delete-btn');
  if (deleteButtons.length > 0) {
    const modal = document.getElementById('delete-modal');
    const confirmButton = modal?.querySelector('.confirm-delete');
    const cancelButton = modal?.querySelector('.cancel-delete');
    const closeButton = modal?.querySelector('.close-modal');
    
    let currentItemId = null;
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        currentItemId = itemId;
        
        // Show the modal
        modal.classList.add('active');
      });
    });
    
    // Handle modal buttons
    if (modal && confirmButton && cancelButton && closeButton) {
      confirmButton.addEventListener('click', function() {
        if (!currentItemId) return;
        
        // Send delete request
        fetch(`/admin/announcements/${currentItemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete announcement');
            }
            return response.json();
          })
          .then(result => {
            if (result.success) {
              // Remove the item from the DOM
              const row = document.querySelector(`tr[data-id="${currentItemId}"]`);
              if (row) {
                row.remove();
              }
              
              // Close the modal
              modal.classList.remove('active');
              
              // Show success message
              showNotification('Announcement deleted successfully');
            } else {
              alert(result.message || 'Failed to delete announcement');
            }
          })
          .catch(error => {
            console.error('Error deleting announcement:', error);
            alert('An error occurred while deleting the announcement. Please try again.');
          });
      });
      
      // Close modal when cancel button is clicked
      cancelButton.addEventListener('click', function() {
        modal.classList.remove('active');
      });
      
      // Close modal when X button is clicked
      closeButton.addEventListener('click', function() {
        modal.classList.remove('active');
      });
      
      // Close modal when clicking outside
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  }
  
  // Date picker functionality for expiry date
  const expiryDateInput = document.getElementById('expiresAt');
  if (expiryDateInput) {
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    expiryDateInput.setAttribute('min', today);
    
    // Clear button functionality
    const clearButton = document.getElementById('clear-expiry');
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        expiryDateInput.value = '';
      });
    }
  }
  
  // Helper function to show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('active');
    }, 10);
    
    // Hide and remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('active');
      
      // Remove from DOM after animation
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});