// public/js/cms/cmsReflections.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize reflections management functionality
  
  // Handle status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      const status = this.value;
      window.location.href = `/admin/reflections${status !== 'all' ? '?filter=' + status : ''}`;
    });
  }
  
  // Handle category filter
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      const category = this.value;
      
      // Get current URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Update or add category parameter
      if (category !== 'all') {
        urlParams.set('category', category);
      } else {
        urlParams.delete('category');
      }
      
      // Redirect to filtered URL
      window.location.href = `/admin/reflections${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
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
    window.location.href = `/admin/reflections?${urlParams.toString()}`;
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
        fetch(`/admin/reflections/${currentItemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete reflection');
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
              showNotification('Reflection deleted successfully');
            } else {
              alert(result.message || 'Failed to delete reflection');
            }
          })
          .catch(error => {
            console.error('Error deleting reflection:', error);
            alert('An error occurred while deleting the reflection. Please try again.');
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
  
  // Form enhancements for the reflection form
  const form = document.querySelector('.form-layout');
  if (form) {
    // Format tags from comma-separated to array on submit
    if (form.querySelector('#tags')) {
      const tagsInput = form.querySelector('#tags');
      
      form.addEventListener('submit', function() {
        const tagsValue = tagsInput.value.trim();
        if (tagsValue) {
          // Clean up tags (remove extra spaces, empty tags)
          const cleanedTags = tagsValue.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '')
            .join(', ');
          
          tagsInput.value = cleanedTags;
        }
      });
    }
    
    // Format images from newline-separated to array on submit
    if (form.querySelector('#images')) {
      const imagesTextarea = form.querySelector('#images');
      
      form.addEventListener('submit', function() {
        const imagesValue = imagesTextarea.value.trim();
        if (imagesValue) {
          // Clean up images (remove empty lines)
          const cleanedImages = imagesValue.split('\n')
            .map(url => url.trim())
            .filter(url => url !== '')
            .join(',');
          
          imagesTextarea.value = cleanedImages;
        }
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