// public/js/cms/cmsUsers.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize users management functionality
  
  // ============================================
  // USER LIST PAGE FUNCTIONALITY
  // ============================================
  
  // Handle status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      const status = this.value;
      const urlParams = new URLSearchParams(window.location.search);
      
      if (status !== 'all') {
        urlParams.set('filter', status);
      } else {
        urlParams.delete('filter');
      }
      
      window.location.href = `/admin/users${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    });
  }
  
  // Handle role filter
  const roleFilter = document.getElementById('role-filter');
  if (roleFilter) {
    roleFilter.addEventListener('change', function() {
      const role = this.value;
      const urlParams = new URLSearchParams(window.location.search);
      
      if (role !== 'all') {
        urlParams.set('role', role);
      } else {
        urlParams.delete('role');
      }
      
      window.location.href = `/admin/users${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    });
  }
  
  // Handle search
  const searchInput = document.getElementById('search');
  const searchButton = searchInput?.nextElementSibling;
  
  if (searchInput && searchButton) {
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (query === '') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('search', query);
    
    window.location.href = `/admin/users?${urlParams.toString()}`;
  }
  
  // ============================================
  // USER FORM PAGE FUNCTIONALITY
  // ============================================
  
  // Quick approve button
  const quickApproveBtn = document.querySelector('.quick-approve-btn');
  if (quickApproveBtn) {
    quickApproveBtn.addEventListener('click', function() {
      const isVerifiedCheckbox = document.getElementById('isVerified');
      const isActiveCheckbox = document.getElementById('isActive');
      
      if (isVerifiedCheckbox && isActiveCheckbox) {
        isVerifiedCheckbox.checked = true;
        isActiveCheckbox.checked = true;
        
        if (confirm('¿Aprobar y activar este usuario? El usuario podrá iniciar sesión inmediatamente.')) {
          document.querySelector('form').submit();
        }
      }
    });
  }
  
  // Form validation
  const userForm = document.querySelector('.user-form');
  if (userForm) {
    userForm.addEventListener('submit', function(e) {
      const requiredFields = this.querySelectorAll('[required]');
      let missingFields = [];
      
      requiredFields.forEach(field => {
        if (!field.value || field.value.trim() === '') {
          const label = field.previousElementSibling?.textContent || field.name;
          missingFields.push(label.replace('*', '').trim());
          
          // Add visual indicator
          field.closest('.form-group')?.classList.add('field-missing');
        } else {
          // Remove visual indicator if field is filled
          field.closest('.form-group')?.classList.remove('field-missing');
        }
      });
      
      if (missingFields.length > 0) {
        e.preventDefault();
        alert('Por favor completa los siguientes campos requeridos:\n\n' + missingFields.join('\n'));
        
        // Scroll to first missing field
        const firstMissing = this.querySelector('.field-missing');
        if (firstMissing) {
          firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return false;
      }
      
      // Email validation
      const emailField = this.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          e.preventDefault();
          alert('Por favor ingresa un correo electrónico válido.');
          emailField.focus();
          return false;
        }
      }
      
      // Phone validation (basic)
      const phoneFields = this.querySelectorAll('input[type="tel"]');
      phoneFields.forEach(field => {
        if (field.value && field.value.replace(/\D/g, '').length < 10) {
          e.preventDefault();
          alert('Por favor ingresa un número de teléfono válido (mínimo 10 dígitos).');
          field.focus();
          return false;
        }
      });
    });
    
    // Real-time field validation
    const requiredInputs = userForm.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (this.value && this.value.trim() !== '') {
          this.closest('.form-group')?.classList.remove('field-missing');
        }
      });
    });
  }
  
  // ============================================
  // DELETE USER FUNCTIONALITY
  // ============================================
  
  // Handle inline delete buttons in user list
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const userId = this.getAttribute('data-id');
      const userName = this.getAttribute('data-name') || 'este usuario';
      
      if (confirm(`¿Estás seguro de que quieres eliminar a "${userName}"?\n\nEsta acción eliminará:\n- La cuenta del usuario\n- Todos sus comentarios\n- Todo el contenido relacionado\n\nEsta acción NO se puede deshacer.`)) {
        if (confirm('Confirmación final: ¿Realmente deseas eliminar este usuario?')) {
          deleteUser(userId);
        }
      }
    });
  });
  
  // Delete user function
  function deleteUser(userId) {
    fetch(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showNotification('Usuario eliminado exitosamente', 'success');
        
        // Remove row from table if on list page
        const row = document.querySelector(`tr[data-id="${userId}"]`);
        if (row) {
          row.style.opacity = '0';
          setTimeout(() => row.remove(), 300);
        }
        
        // Redirect to users list if on edit page
        if (window.location.pathname.includes('/edit/')) {
          setTimeout(() => {
            window.location.href = '/admin/users';
          }, 1500);
        }
      } else {
        showNotification(data.message || 'Error al eliminar usuario', 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showNotification('Error al eliminar usuario. Por favor intenta de nuevo.', 'error');
    });
  }
  
  // Make deleteUser available globally for inline onclick handlers
  window.deleteUser = function(userId, userName) {
    if (confirm(`¿Estás seguro de que quieres eliminar a "${userName}"?\n\nEsta acción eliminará:\n- La cuenta del usuario\n- Todos sus comentarios\n- Todo el contenido relacionado\n\nEsta acción NO se puede deshacer.`)) {
      if (confirm('Confirmación final: ¿Realmente deseas eliminar este usuario?')) {
        deleteUser(userId);
      }
    }
  };
  
  // ============================================
  // NOTIFICATION SYSTEM
  // ============================================
  
  function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('active');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('active');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Make notification function globally available
  window.showNotification = showNotification;
});