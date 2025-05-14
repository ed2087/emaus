// public/js/reflectionSubmit.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize form validation and enhancement for reflection submission
  
  const form = document.querySelector('.content-form');
  if (!form) return;
  
  // Simple validation for the form
  form.addEventListener('submit', function(e) {
    const title = form.querySelector('#title').value.trim();
    const description = form.querySelector('#description').value.trim();
    const body = form.querySelector('#body').value.trim();
    const category = form.querySelector('#category').value;
    
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
      errorMessage += 'Content is required.\n';
    } else if (body.length < 50) {
      isValid = false;
      errorMessage += 'Content must be at least 50 characters.\n';
    }
    
    if (!category) {
      isValid = false;
      errorMessage += 'Please select a category.\n';
    }
    
    // Validate images (max 3 images)
    const imagesTextarea = form.querySelector('#images');
    if (imagesTextarea) {
      const images = imagesTextarea.value.trim().split('\n').filter(url => url.trim() !== '');
      
      if (images.length > 3) {
        isValid = false;
        errorMessage += 'Maximum 3 images allowed.\n';
      }
      
      // Simple URL validation
      for (const url of images) {
        if (!isValidUrl(url.trim())) {
          isValid = false;
          errorMessage += `"${url}" is not a valid URL.\n`;
        }
      }
    }
    
    if (!isValid) {
      e.preventDefault();
      alert('Please correct the following errors:\n\n' + errorMessage);
    }
  });
  
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
    
    // Add placeholder text
    if (!imagesTextarea.getAttribute('placeholder')) {
      imagesTextarea.setAttribute('placeholder', 'Enter image URLs, one per line\nExample: https://example.com/image.jpg');
    }
  }
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