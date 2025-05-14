// public/js/cms/cmsComments.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize comments management functionality
  
  // Handle status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      const status = this.value;
      window.location.href = `/admin/comments?status=${status}`;
    });
  }
  
  // Handle content type filter
  const contentFilter = document.getElementById('content-filter');
  if (contentFilter) {
    contentFilter.addEventListener('change', function() {
      const contentType = this.value;
      
      // Get current URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Update or add content type parameter
      if (contentType !== 'all') {
        urlParams.set('contentType', contentType);
      } else {
        urlParams.delete('contentType');
      }
      
      // Keep status parameter if it exists
      const status = urlParams.get('status');
      if (!status) {
        urlParams.set('status', document.getElementById('status-filter').value);
      }
      
      // Redirect to filtered URL
      window.location.href = `/admin/comments?${urlParams.toString()}`;
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
    window.location.href = `/admin/comments?${urlParams.toString()}`;
  }
  
  // Handle approve buttons
  const approveButtons = document.querySelectorAll('.approve-btn');
  if (approveButtons.length > 0) {
    approveButtons.forEach(button => {
      button.addEventListener('click', function() {
        const commentId = this.getAttribute('data-id');
        
        // Send approve request
        fetch(`/admin/comments/${commentId}/approve`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to approve comment');
            }
            return response.json();
          })
          .then(result => {
            if (result.success) {
              // Update UI to show approved
              const commentCard = document.querySelector(`.comment-card[data-id="${commentId}"]`);
              if (commentCard) {
                const statusBadge = commentCard.querySelector('.comment-status .status-badge');
                if (statusBadge) {
                  statusBadge.textContent = 'Approved';
                  statusBadge.classList.remove('draft');
                  statusBadge.classList.add('active');
                }
                
                // Remove approve button
                const approveBtn = commentCard.querySelector('.approve-btn');
                if (approveBtn) {
                  approveBtn.remove();
                }
              }
              
              // Show success message
              showNotification('Comment approved successfully');
            } else {
              alert(result.message || 'Failed to approve comment');
            }
          })
          .catch(error => {
            console.error('Error approving comment:', error);
            alert('An error occurred while approving the comment. Please try again.');
          });
      });
    });
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
        fetch(`/admin/comments/${currentItemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete comment');
            }
            return response.json();
          })
          .then(result => {
// public/js/cms/cmsComments.js (continuing)
            if (result.success) {
              // Remove the item from the DOM
              const commentCard = document.querySelector(`.comment-card[data-id="${currentItemId}"]`);
              if (commentCard) {
                commentCard.remove();
              }
              
              // Close the modal
              modal.classList.remove('active');
              
              // Show success message
              showNotification('Comment deleted successfully');
            } else {
              alert(result.message || 'Failed to delete comment');
            }
          })
          .catch(error => {
            console.error('Error deleting comment:', error);
            alert('An error occurred while deleting the comment. Please try again.');
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