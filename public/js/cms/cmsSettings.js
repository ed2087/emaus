// public/js/cms/cmsSettings.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize settings management functionality
  
  // Settings form submit handling
  const settingsForm = document.querySelector('.settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      const data = {};
      
      // Convert FormData to JSON
      for (const [key, value] of formData.entries()) {
        // Handle checkboxes
        if (this.querySelector(`input[name="${key}"]`)?.type === 'checkbox') {
          data[key] = value === 'on';
        } else {
          data[key] = value;
        }
      }
      
      // Send settings update request
      fetch('/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to save settings');
          }
          return response.json();
        })
        .then(result => {
          if (result.success) {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.textContent = 'Settings saved successfully';
            
            // Insert at the top of the content container
            const contentContainer = document.querySelector('.content-container');
            contentContainer.insertBefore(successMessage, contentContainer.firstChild);
            
            // Remove after 3 seconds
            setTimeout(() => {
              successMessage.remove();
            }, 3000);
          } else {
            alert(result.message || 'Failed to save settings');
          }
        })
        .catch(error => {
          console.error('Error saving settings:', error);
          alert('An error occurred while saving settings. Please try again.');
        });
    });
  }
  
  // Handle reset button
  const resetButton = document.querySelector('button[type="reset"]');
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Additional confirmation if needed
      if (confirm('Are you sure you want to reset all settings to their original values? This will not save the changes.')) {
        // The native reset behavior will handle the form reset
      } else {
        // Prevent the default reset behavior
        event.preventDefault();
      }
    });
  }
});