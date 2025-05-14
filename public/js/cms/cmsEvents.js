// public/js/cms/cmsEvents.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize events management functionality
  
  // Handle status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      const status = this.value;
      
      // Get current URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Update or add filter parameter
      if (status !== 'all') {
        urlParams.set('filter', status);
      } else {
        urlParams.delete('filter');
      }
      
      // Redirect to filtered URL
      window.location.href = `/admin/events${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    });
  }
  
  // Handle type filter
  const typeFilter = document.getElementById('type-filter');
  if (typeFilter) {
    typeFilter.addEventListener('change', function() {
      const type = this.value;
      
      // Get current URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Update or add type parameter
      if (type !== 'all') {
        urlParams.set('type', type);
      } else {
        urlParams.delete('type');
      }
      
      // Redirect to filtered URL
      window.location.href = `/admin/events${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
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
    window.location.href = `/admin/events?${urlParams.toString()}`;
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
        fetch(`/admin/events/${currentItemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete event');
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
              showNotification('Event deleted successfully');
            } else {
              alert(result.message || 'Failed to delete event');
            }
          })
          .catch(error => {
            console.error('Error deleting event:', error);
            alert('An error occurred while deleting the event. Please try again.');
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
  
  // Form enhancements for the event form
  const form = document.querySelector('.form-layout');
  if (form) {
    // Image preview functionality
    const imageInput = form.querySelector('#image');
    const previewContainer = document.getElementById('image-preview');
    
    if (imageInput && previewContainer) {
      // Update image preview when URL changes
      imageInput.addEventListener('input', function() {
        const imageUrl = this.value.trim();
        
        if (imageUrl && isValidUrl(imageUrl)) {
          previewContainer.innerHTML = `
            <div class="preview-image">
              <img src="${imageUrl}" alt="Preview">
            </div>
          `;
        } else {
          previewContainer.innerHTML = `
            <div class="no-preview">
              <p>Enter a valid image URL to see a preview</p>
            </div>
          `;
        }
      });
      
      // Trigger preview for initial value
      if (imageInput.value.trim()) {
        imageInput.dispatchEvent(new Event('input'));
      }
    }
    
    // Date restrictions for registration deadline
    const eventDate = document.getElementById('date');
    const registrationDeadline = document.getElementById('registrationDeadline');
    
    if (eventDate && registrationDeadline) {
      eventDate.addEventListener('change', function() {
        if (this.value) {
          registrationDeadline.setAttribute('max', this.value);
        }
      });
      
      // Trigger on initial load
      if (eventDate.value) {
        eventDate.dispatchEvent(new Event('change'));
      }
    }
  }
  
  // Helper function to validate URL
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
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