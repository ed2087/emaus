// public/js/chat.js
class ChatManager {
  constructor() {
    this.currentChatId = null;
    this.currentChatData = null;
    this.lastMessageTime = Date.now();
    this.pollingInterval = null;
    this.isUserTyping = false;
    this.isUserScrolledUp = false;
    this.replyToMessageData = null; // Fixed naming conflict
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.loadChatRooms();
    this.setupPolling();
    this.setupScrollDetection();
  }
  
  bindEvents() {
    // Message form submission
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
      messageForm.addEventListener('submit', (e) => this.sendMessage(e));
    }
    
    // Message input typing detection
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('input', () => this.handleTyping());
      messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    // Reply cancel button
    const replyCancel = document.getElementById('reply-cancel');
    if (replyCancel) {
      replyCancel.addEventListener('click', () => this.cancelReply());
    }
    
    // New messages indicator
    const newMessagesIndicator = document.getElementById('new-messages-indicator');
    if (newMessagesIndicator) {
      newMessagesIndicator.addEventListener('click', () => this.scrollToBottom());
    }
    
    // GIF picker button
    const gifPickerBtn = document.getElementById('gif-picker-btn');
    if (gifPickerBtn) {
      gifPickerBtn.addEventListener('click', () => this.toggleGifPicker());
    }
    
    // Message action buttons (reply/delete) - use event delegation
    document.addEventListener('click', (e) => {
      if (e.target.closest('.message-action-btn')) {
        const btn = e.target.closest('.message-action-btn');
        const action = btn.getAttribute('data-action');
        const messageId = btn.getAttribute('data-message-id');
        
        if (action === 'reply') {
          const author = btn.getAttribute('data-author');
          const content = btn.getAttribute('data-content');
          this.replyToMessage(messageId, author, content);
        } else if (action === 'delete') {
          this.deleteMessage(messageId);
        }
      }
    });
    
    // Mobile menu toggle
    this.setupMobileMenu();
  }
  
  setupMobileMenu() {
    // Add mobile menu button to chat header
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader && window.innerWidth <= 768) {
      const mobileBtn = document.createElement('button');
      mobileBtn.className = 'mobile-menu-btn';
      mobileBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
      mobileBtn.addEventListener('click', () => this.toggleMobileSidebar());
      chatHeader.insertBefore(mobileBtn, chatHeader.firstChild);
    }
  }
  
  toggleMobileSidebar() {
    const sidebar = document.querySelector('.chat-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('active');
    }
  }
  
  toggleGifPicker() {
    // Check if GIF picker already exists
    let gifPicker = document.getElementById('gif-picker-modal');
    
    if (gifPicker) {
      // Toggle visibility
      gifPicker.style.display = gifPicker.style.display === 'none' ? 'block' : 'none';
      return;
    }
    
    // Create GIF picker modal
    this.createGifPicker();
  }

  createGifPicker() {
    const gifPickerHTML = `
      <div id="gif-picker-modal" class="gif-picker-modal">
        <div class="gif-picker-content">
          <div class="gif-picker-header">
            <h3>Seleccionar GIF</h3>
            <button class="gif-picker-close">&times;</button>
          </div>
          
          <div class="gif-search-container">
            <input 
              type="text" 
              id="gif-search-input" 
              placeholder="Buscar GIFs..." 
              autocomplete="off"
            >
            <button id="gif-search-btn" class="btn btn-primary">Buscar</button>
          </div>
          
          <div class="gif-categories">
            <button class="gif-category-btn active" data-category="trending">Populares</button>
            <button class="gif-category-btn" data-category="praise">Alabanza</button>
            <button class="gif-category-btn" data-category="pray">Oración</button>
            <button class="gif-category-btn" data-category="love">Amor</button>
            <button class="gif-category-btn" data-category="happy">Feliz</button>
            <button class="gif-category-btn" data-category="amen">Amén</button>
          </div>
          
          <div id="gif-results" class="gif-results">
            <div class="gif-loading">Cargando GIFs...</div>
          </div>
        </div>
      </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', gifPickerHTML);
    
    // Bind events
    this.bindGifPickerEvents();
    
    // Load trending GIFs by default
    this.loadTrendingGifs();
  }

  bindGifPickerEvents() {
    const gifPicker = document.getElementById('gif-picker-modal');
    const closeBtn = document.querySelector('.gif-picker-close');
    const searchInput = document.getElementById('gif-search-input');
    const searchBtn = document.getElementById('gif-search-btn');
    const categoryBtns = document.querySelectorAll('.gif-category-btn');
    
    // Close picker
    closeBtn.addEventListener('click', () => {
      gifPicker.style.display = 'none';
    });
    
    // Close on outside click
    gifPicker.addEventListener('click', (e) => {
      if (e.target === gifPicker) {
        gifPicker.style.display = 'none';
      }
    });
    
    // Search functionality
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        this.searchGifs(query);
      }
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          this.searchGifs(query);
        }
      }
    });
    
    // Category buttons
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-category');
        if (category === 'trending') {
          this.loadTrendingGifs();
        } else {
          this.searchGifs(category);
        }
      });
    });
  }

  async loadTrendingGifs() {
    const resultsContainer = document.getElementById('gif-results');
    resultsContainer.innerHTML = '<div class="gif-loading">Cargando GIFs populares...</div>';
    
    // Predefined trending GIFs for Christian/spiritual content
    const trendingGifs = [
      'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', // praise
      'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif', // clapping
      'https://media.giphy.com/media/l1J9FiGxR61OcF2mI/giphy.gif',  // heart
      'https://media.giphy.com/media/26gs6vEzlpaxuYgso/giphy.gif',  // pray
      'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif', // amen
      'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif',  // blessing
      'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif', // hope
      'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',  // faith
      'https://media.giphy.com/media/3o6Zt7g9nH1nFGeBcQ/giphy.gif', // joy
      'https://media.giphy.com/media/l0HlMSVVw9zqmClLq/giphy.gif'   // peace
    ];
    
    this.displayGifs(trendingGifs);
  }

  async searchGifs(query) {
    const resultsContainer = document.getElementById('gif-results');
    resultsContainer.innerHTML = '<div class="gif-loading">Buscando GIFs...</div>';
    
    // Predefined GIFs for common spiritual searches
    const searchResults = {
      'praise': [
        'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif',
        'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif'
      ],
      'alabanza': [
        'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif',
        'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif'
      ],
      'pray': [
        'https://media.giphy.com/media/26gs6vEzlpaxuYgso/giphy.gif',
        'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
        'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif'
      ],
      'oración': [
        'https://media.giphy.com/media/26gs6vEzlpaxuYgso/giphy.gif',
        'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
        'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif'
      ],
      'love': [
        'https://media.giphy.com/media/l1J9FiGxR61OcF2mI/giphy.gif',
        'https://media.giphy.com/media/3o6Zt7g9nH1nFGeBcQ/giphy.gif',
        'https://media.giphy.com/media/l0HlMSVVw9zqmClLq/giphy.gif'
      ],
      'amor': [
        'https://media.giphy.com/media/l1J9FiGxR61OcF2mI/giphy.gif',
        'https://media.giphy.com/media/3o6Zt7g9nH1nFGeBcQ/giphy.gif',
        'https://media.giphy.com/media/l0HlMSVVw9zqmClLq/giphy.gif'
      ],
      'happy': [
        'https://media.giphy.com/media/3o6Zt7g9nH1nFGeBcQ/giphy.gif',
        'https://media.giphy.com/media/l0HlMSVVw9zqmClLq/giphy.gif',
        'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif'
      ],
      'feliz': [
        'https://media.giphy.com/media/3o6Zt7g9nH1nFGeBcQ/giphy.gif',
        'https://media.giphy.com/media/l0HlMSVVw9zqmClLq/giphy.gif',
        'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif'
      ],
      'amen': [
        'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif',
        'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
        'https://media.giphy.com/media/26gs6vEzlpaxuYgso/giphy.gif'
      ]
    };
    
    const gifs = searchResults[query.toLowerCase()] || searchResults['praise'];
    this.displayGifs(gifs);
  }

  displayGifs(gifs) {
    const resultsContainer = document.getElementById('gif-results');
    
    if (gifs.length === 0) {
      resultsContainer.innerHTML = '<div class="no-gifs">No se encontraron GIFs</div>';
      return;
    }
    
    const gifsHTML = gifs.map(gifUrl => `
      <div class="gif-item" data-gif-url="${gifUrl}">
        <img src="${gifUrl}" alt="GIF" loading="lazy">
      </div>
    `).join('');
    
    resultsContainer.innerHTML = gifsHTML;
    
    // Add click handlers for GIF selection
    resultsContainer.addEventListener('click', (e) => {
      const gifItem = e.target.closest('.gif-item');
      if (gifItem) {
        const gifUrl = gifItem.getAttribute('data-gif-url');
        this.selectGif(gifUrl);
      }
    });
  }

  selectGif(gifUrl) {
    // Add GIF URL to message input
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.value = gifUrl;
      messageInput.focus();
    }
    
    // Close the picker
    const gifPicker = document.getElementById('gif-picker-modal');
    if (gifPicker) {
      gifPicker.style.display = 'none';
    }
  }
  
  async loadChatRooms() {
    try {
      const response = await fetch('/chat/api/chats');
      const data = await response.json();
      
      this.renderChatRooms(data.public, 'public-chats');
      this.renderChatRooms(data.private, 'private-chats');
      
      // Auto-select first public chat if available
      if (data.public.length > 0) {
        this.selectChat(data.public[0]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      this.showError('Error loading chat rooms');
    }
  }
  
  renderChatRooms(chats, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (chats.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No hay salas disponibles</p></div>';
      return;
    }
    
    // Use event delegation instead of inline onclick
    container.innerHTML = chats.map(chat => `
      <div class="chat-room-item" data-chat-id="${chat._id}" data-chat-data='${JSON.stringify(chat)}'>
        <div class="room-icon">${this.getChatIcon(chat.name)}</div>
        <div class="chat-room-info">
          <div class="chat-room-name">${this.escapeHtml(chat.name)}</div>
          <div class="chat-room-description">${this.escapeHtml(chat.description || 'Sin descripción')}</div>
        </div>
      </div>
    `).join('');
    
    // Add click listeners to chat room items
    container.addEventListener('click', (e) => {
      const chatItem = e.target.closest('.chat-room-item');
      if (chatItem) {
        const chatData = JSON.parse(chatItem.getAttribute('data-chat-data'));
        this.selectChat(chatData);
      }
    });
  }
  
  getChatIcon(name) {
    return name.charAt(0).toUpperCase();
  }
  
  selectChat(chatData) {
    // Update UI
    document.querySelectorAll('.chat-room-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`[data-chat-id="${chatData._id}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }
    
    // Hide welcome, show chat
    document.getElementById('chat-welcome').style.display = 'none';
    document.getElementById('chat-active').style.display = 'flex';
    
    // Update chat info
    document.getElementById('current-chat-name').textContent = chatData.name;
    document.getElementById('current-chat-description').textContent = chatData.description || 'Sin descripción';
    
    // Store current chat
    this.currentChatId = chatData._id;
    this.currentChatData = chatData;
    
    // Load messages
    this.loadMessages();
    
    // Close mobile sidebar
    const sidebar = document.querySelector('.chat-sidebar');
    if (sidebar) {
      sidebar.classList.remove('active');
    }
  }
  
  async loadMessages(page = 1) {
    if (!this.currentChatId) return;
    
    try {
      const response = await fetch(`/chat/api/chats/${this.currentChatId}/messages?page=${page}`);
      const data = await response.json();
      
      if (data.messages) {
        this.renderMessages(data.messages, page === 1);
        this.updateLastMessageTime(data.messages);
        
        if (page === 1) {
          this.scrollToBottom(true);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      this.showError('Error loading messages');
    }
  }
  
  renderMessages(messages, clearFirst = false) {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;
    
    if (clearFirst) {
      messagesList.innerHTML = '';
    }
    
    if (messages.length === 0 && clearFirst) {
      messagesList.innerHTML = '<div class="empty-state"><p>No hay mensajes aún. ¡Sé el primero en escribir!</p></div>';
      return;
    }
    
    messages.forEach(message => {
      const messageHtml = this.renderMessage(message);
      const messageElement = document.createElement('div');
      messageElement.innerHTML = messageHtml;
      const messageItem = messageElement.firstElementChild;
      
      messagesList.appendChild(messageItem);
    });
  }
  
  renderMessage(message) {
    const isOwnMessage = message.author._id === this.getCurrentUserId();
    const messageTime = new Date(message.createdAt).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let replyHtml = '';
    if (message.replyTo) {
      replyHtml = `
        <div class="reply-indicator">
          <span class="reply-author">${this.escapeHtml(message.replyTo.author.firstName)}</span>
          <span class="reply-text">${this.escapeHtml(message.replyTo.content)}</span>
        </div>
      `;
    }
    
    let mediaHtml = '';
    if (message.messageType !== 'text' && message.mediaUrl) {
      mediaHtml = this.renderMediaContent(message);
    }
    
    return `
      <div class="message-item" data-message-id="${message._id}">
        <div class="message-avatar">${message.author.firstName.charAt(0)}</div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-author">${this.escapeHtml(message.author.firstName)} ${this.escapeHtml(message.author.lastName)}</span>
            <span class="message-time">${messageTime}</span>
            <div class="message-actions">
              <button class="message-action-btn" data-action="reply" data-message-id="${message._id}" data-author="${this.escapeHtml(message.author.firstName)}" data-content="${this.escapeHtml(message.content)}" title="Responder">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 17 4 12 9 7"></polyline>
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                </svg>
              </button>
              ${isOwnMessage ? `
                <button class="message-action-btn" data-action="delete" data-message-id="${message._id}" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>
          ${replyHtml}
          <div class="message-body ${isOwnMessage ? 'own-message' : ''} ${message.isDeleted ? 'deleted' : ''}">
            ${this.escapeHtml(message.content)}
          </div>
          ${mediaHtml}
        </div>
      </div>
    `;
  }
  
  renderMediaContent(message) {
    switch (message.messageType) {
      case 'gif':
      case 'image':
        return `
          <div class="message-media">
            <img src="${message.mediaUrl}" alt="Imagen" class="message-${message.messageType}" onclick="this.style.maxWidth = this.style.maxWidth ? '' : '100%'">
          </div>
        `;
      case 'video':
        if (message.mediaUrl.includes('youtube.com') || message.mediaUrl.includes('youtu.be')) {
          const videoId = this.extractYouTubeId(message.mediaUrl);
          return `
            <div class="message-media">
              <iframe class="message-video" width="400" height="225" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allowfullscreen>
              </iframe>
            </div>
          `;
        }
        break;
      case 'url':
        if (message.urlPreview) {
          return `
            <div class="message-url-preview">
              ${message.urlPreview.image ? `<img src="${message.urlPreview.image}" alt="Preview" class="url-preview-image">` : ''}
              <div class="url-preview-content">
                <div class="url-preview-title">${this.escapeHtml(message.urlPreview.title || '')}</div>
                <div class="url-preview-description">${this.escapeHtml(message.urlPreview.description || '')}</div>
                <a href="${message.urlPreview.url}" target="_blank" class="url-preview-link">
                  ${this.escapeHtml(message.urlPreview.url)}
                </a>
              </div>
            </div>
          `;
        }
        break;
    }
    return '';
  }
  
  async sendMessage(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content || !this.currentChatId) return;
    
    const messageData = {
      content: content,
      messageType: 'text'
    };
    
    if (this.replyToMessageData) {
      messageData.replyTo = this.replyToMessageData.id;
    }
    
    // Check if message contains URL or GIF
    const urlMatch = content.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      if (content.includes('giphy.com') || content.includes('tenor.com') || content.endsWith('.gif')) {
        messageData.messageType = 'gif';
      } else {
        messageData.messageType = 'url';
      }
      messageData.mediaUrl = urlMatch[0];
    }
    
    try {
      const response = await fetch(`/chat/api/chats/${this.currentChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Clear input and reply
        messageInput.value = '';
        this.cancelReply();
        
        // Add message to UI immediately
        this.renderMessages([result.message]);
        this.scrollToBottom(true);
        this.updateLastMessageTime([result.message]);
      } else {
        this.showError(result.message || 'Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Error sending message');
    }
  }
  
  replyToMessage(messageId, authorName, content) {
    this.replyToMessageData = {
      id: messageId,
      author: authorName,
      content: content
    };
    
    // Show reply preview
    const replyPreview = document.getElementById('reply-preview');
    const replyAuthor = document.getElementById('reply-author');
    const replyText = document.getElementById('reply-text');
    
    replyAuthor.textContent = authorName;
    replyText.textContent = content;
    replyPreview.style.display = 'flex';
    
    // Focus message input
    document.getElementById('message-input').focus();
  }
  
  cancelReply() {
    this.replyToMessageData = null;
    document.getElementById('reply-preview').style.display = 'none';
  }
  
  async deleteMessage(messageId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }
    
    try {
      const response = await fetch(`/chat/api/messages/${messageId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update message in UI
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          const messageBody = messageElement.querySelector('.message-body');
          messageBody.textContent = '[Mensaje eliminado]';
          messageBody.classList.add('deleted');
          
          // Remove action buttons
          const actions = messageElement.querySelector('.message-actions');
          if (actions) {
            actions.remove();
          }
        }
      } else {
        this.showError(result.message || 'Error deleting message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      this.showError('Error deleting message');
    }
  }
  
  setupPolling() {
    // Poll every 30 seconds
    this.pollingInterval = setInterval(() => {
      if (this.shouldPoll()) {
        this.pollForNewMessages();
      }
    }, 30000);
  }
  
  shouldPoll() {
    return (
      this.currentChatId &&
      document.hasFocus() &&
      !this.isUserTyping &&
      !this.isUserScrolledUp
    );
  }
  
  async pollForNewMessages() {
    if (!this.currentChatId) return;
    
    try {
      const response = await fetch(`/chat/api/messages/poll/${this.lastMessageTime}?chatId=${this.currentChatId}`);
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        // Add new messages to UI
        data.messages.forEach(message => {
          const messageHtml = this.renderMessage(message);
          const messageElement = document.createElement('div');
          messageElement.innerHTML = messageHtml;
          const messageItem = messageElement.firstElementChild;
          
          messageItem.classList.add('new-message');
          
          const messagesList = document.getElementById('messages-list');
          messagesList.appendChild(messageItem);
        });
        
        this.updateLastMessageTime(data.messages);
        
        // Auto-scroll or show notification
        if (this.isUserScrolledUp) {
          this.showNewMessageNotification();
        } else {
          this.scrollToBottom(true);
        }
      }
      
      if (data.lastUpdated) {
        this.lastMessageTime = data.lastUpdated;
      }
    } catch (error) {
      console.error('Error polling for messages:', error);
    }
  }
  
setupScrollDetection() {
   const messagesList = document.getElementById('messages-list');
   if (!messagesList) return;
   
   messagesList.addEventListener('scroll', () => {
     const { scrollTop, scrollHeight, clientHeight } = messagesList;
     const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
     
     this.isUserScrolledUp = !isAtBottom;
     
     if (isAtBottom) {
       this.hideNewMessageNotification();
     }
   });
 }
 
 scrollToBottom(smooth = false) {
   const messagesList = document.getElementById('messages-list');
   if (!messagesList) return;
   
   messagesList.scrollTo({
     top: messagesList.scrollHeight,
     behavior: smooth ? 'smooth' : 'auto'
   });
   
   this.isUserScrolledUp = false;
   this.hideNewMessageNotification();
 }
 
 showNewMessageNotification() {
   const indicator = document.getElementById('new-messages-indicator');
   if (indicator) {
     indicator.style.display = 'block';
   }
 }
 
 hideNewMessageNotification() {
   const indicator = document.getElementById('new-messages-indicator');
   if (indicator) {
     indicator.style.display = 'none';
   }
 }
 
 handleTyping() {
   this.isUserTyping = true;
   
   // Clear existing timeout
   if (this.typingTimeout) {
     clearTimeout(this.typingTimeout);
   }
   
   // Set typing to false after 3 seconds of no input
   this.typingTimeout = setTimeout(() => {
     this.isUserTyping = false;
   }, 3000);
 }
 
 handleKeyDown(event) {
   if (event.key === 'Enter' && !event.shiftKey) {
     event.preventDefault();
     document.getElementById('message-form').dispatchEvent(new Event('submit'));
   }
 }
 
 updateLastMessageTime(messages) {
   if (messages.length > 0) {
     const lastMessage = messages[messages.length - 1];
     this.lastMessageTime = new Date(lastMessage.createdAt).getTime();
   }
 }
 
 getCurrentUserId() {
   // This should be set by the server in a script tag or data attribute
   return window.currentUserId || null;
 }
 
 extractYouTubeId(url) {
   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
   const match = url.match(regExp);
   return (match && match[2].length === 11) ? match[2] : null;
 }
 
 escapeHtml(text) {
   const map = {
     '&': '&amp;',
     '<': '&lt;',
     '>': '&gt;',
     '"': '&quot;',
     "'": '&#039;'
   };
   return text.replace(/[&<>"']/g, (m) => map[m]);
 }
 
 showError(message) {
   // Create a simple notification
   const notification = document.createElement('div');
   notification.className = 'notification';
   notification.textContent = message;
   document.body.appendChild(notification);
   
   // Show notification
   setTimeout(() => notification.classList.add('active'), 100);
   
   // Hide and remove after 3 seconds
   setTimeout(() => {
     notification.classList.remove('active');
     setTimeout(() => notification.remove(), 300);
   }, 3000);
 }
 
 destroy() {
   if (this.pollingInterval) {
     clearInterval(this.pollingInterval);
   }
   if (this.typingTimeout) {
     clearTimeout(this.typingTimeout);
   }
 }
}

// Initialize chat manager when page loads
let chatManager;

document.addEventListener('DOMContentLoaded', function() {
 // Set current user ID for the chat manager
 const userScript = document.querySelector('script[data-user-id]');
 if (userScript) {
   window.currentUserId = userScript.getAttribute('data-user-id');
 }
 
 chatManager = new ChatManager();
});

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
 if (chatManager) {
   chatManager.destroy();
 }
});