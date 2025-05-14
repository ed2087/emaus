// public/js/cms/cmsSettingsBackup.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize backup and settings functionality
  
  // Backup form
  const backupForm = document.querySelector('.backup-form');
  if (backupForm) {
    backupForm.addEventListener('submit', function(e) {
      const submitButton = this.querySelector('button[type="submit"]');
      
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <span class="spinner"></span>
          Creating Backup...
        `;
        
        // Re-enable after a few seconds
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Download Backup
          `;
        }, 2000);
      }
    });
  }
  
  // Settings form
  const settingsForm = document.querySelector('.settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const data = {};
      
      for (const [key, value] of formData.entries()) {
        if (this.querySelector(`input[name="${key}"]`)?.type === 'checkbox') {
          data[key] = value === 'on';
        } else {
          data[key] = value;
        }
      }
      
      // Send AJAX request
      fetch('/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update settings');
          }
          return response.json();
        })
        .then(result => {
          if (result.success) {
            showNotification('Settings updated successfully');
          } else {
            showNotification(result.message || 'Failed to update settings', 'error');
          }
        })
        .catch(error => {
          console.error('Error updating settings:', error);
          showNotification('An error occurred. Please try again.', 'error');
        });
    });
  }
  
  // Helper function to show notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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