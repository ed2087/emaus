// public/js/cms/uploadPreview.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('Upload preview script loaded');
  
  const fileInput = document.getElementById('imageFiles');
  const uploadPreview = document.getElementById('upload-preview');
  const previewContainer = document.getElementById('preview-container-upload'); // Fixed ID
  
  if (!fileInput) {
    console.log('File input not found');
    return;
  }
  
  console.log('File input found, setting up event listeners');
  
  fileInput.addEventListener('change', function(e) {
    console.log('File input changed', e.target.files);
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      uploadPreview.style.display = 'none';
      return;
    }
    
    // Limit to 3 files
    const limitedFiles = files.slice(0, 3);
    if (files.length > 3) {
      alert('Solo se pueden subir máximo 3 imágenes. Se seleccionaron las primeras 3.');
      // Update file input to only include first 3 files
      const dt = new DataTransfer();
      limitedFiles.forEach(file => dt.items.add(file));
      fileInput.files = dt.files;
    }
    
    previewContainer.innerHTML = '';
    uploadPreview.style.display = 'block';
    
    limitedFiles.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo ${file.name} es muy grande. Máximo 5MB permitido.`);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Preview ${index + 1}">
          <button type="button" class="preview-remove" data-index="${index}" title="Eliminar imagen">×</button>
        `;
        
        previewContainer.appendChild(previewItem);
      };
      
      reader.onerror = function() {
        console.error('Error reading file:', file.name);
        alert(`Error al leer el archivo ${file.name}`);
      };
      
      reader.readAsDataURL(file);
    });
  });
  
  // Handle preview removal with event delegation
  previewContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('preview-remove')) {
      e.preventDefault();
      const index = parseInt(e.target.dataset.index);
      console.log('Removing file at index:', index);
      
      const dt = new DataTransfer();
      const files = Array.from(fileInput.files);
      
      files.forEach((file, i) => {
        if (i !== index) {
          dt.items.add(file);
        }
      });
      
      fileInput.files = dt.files;
      
      // Trigger change event to update preview
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);
    }
  });
  
  // Handle existing image removal
  setupExistingImageRemoval();
  
  function setupExistingImageRemoval() {
    const removeButtons = document.querySelectorAll('.remove-image-btn');
    console.log('Found existing image remove buttons:', removeButtons.length);
    
    removeButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const imageContainer = this.parentElement;
        imageContainer.classList.toggle('marked-for-removal');
        
        // Add hidden input to track removed images
        const imageUrl = this.dataset.image;
        let hiddenInput = document.querySelector(`input[name="removedImages"][value="${imageUrl}"]`);
        
        if (imageContainer.classList.contains('marked-for-removal')) {
          if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'removedImages';
            hiddenInput.value = imageUrl;
            document.querySelector('form').appendChild(hiddenInput);
            console.log('Marked image for removal:', imageUrl);
          }
        } else {
          if (hiddenInput) {
            hiddenInput.remove();
            console.log('Unmarked image for removal:', imageUrl);
          }
        }
      });
    });
  }
  
  // File input styling enhancement
  fileInput.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = 'var(--primary-color)';
    this.style.backgroundColor = 'rgba(62, 92, 118, 0.05)';
  });
  
  fileInput.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.style.borderColor = 'var(--border-color)';
    this.style.backgroundColor = 'var(--bg-light)';
  });
  
  fileInput.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = 'var(--border-color)';
    this.style.backgroundColor = 'var(--bg-light)';
  });
});