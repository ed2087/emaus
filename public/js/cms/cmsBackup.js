// public/js/cms/cmsBackup.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize backup management functionality
  
  // Backup form submit handling
  const backupForm = document.querySelector('.backup-form');
  if (backupForm) {
    backupForm.addEventListener('submit', function(e) {
      // We allow the normal form submission to proceed as it triggers a file download
      // But we can add additional logic here if needed
      
      // Example: Show a loading indicator
      const submitButton = this.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <span class="spinner"></span>
          Creating Backup...
        `;
        
        // Re-enable after download starts (typically after 2 seconds)
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
});