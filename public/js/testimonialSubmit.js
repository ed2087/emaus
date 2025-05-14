// public/js/testimonialSubmit.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize form validation and enhancement for testimonial submission
  
  const form = document.querySelector('.content-form');
  if (!form) return;
  
  // Simple validation for the form
  form.addEventListener('submit', function(e) {
    const title = form.querySelector('#title').value.trim();
    const description = form.querySelector('#description').value.trim();
    const body = form.querySelector('#body').value.trim();
    
    let isValid = true;
    let errorMessage = '';
    
    if (!title) {
      isValid = false;
      errorMessage += 'Title is required.\n';
    }
    
    if (!description) {
      isValid = false;
      errorMessage += 'Description is required.\n';
    } else if (description.length > 500) {
      isValid = false;
      errorMessage += 'Description must be less than 500 characters.\n';
    }
    
    if (!body) {
      isValid = false;
      errorMessage += 'Your testimony is required.\n';
    } else if (body.length < 50) {
      isValid = false;
      errorMessage += 'Your testimony must be at least 50 characters.\n';
    }
    
    // Validate image URL if provided
    const imageInput = form.querySelector('#image');
    if (imageInput && imageInput.value.trim() !== '') {
      if (!isValidUrl(imageInput.value.trim())) {
        isValid = false;
        errorMessage += 'Please enter a valid image URL.\n';
      }
    }
    
    if (!isValid) {
      e.preventDefault();
      alert('Please correct the following errors:\n\n' + errorMessage);
    }
  });
});

// Function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}