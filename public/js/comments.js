// public/js/comments.js
document.addEventListener('DOMContentLoaded', function() {
  // Load comments for the current content
  loadComments();
  
  // Handle comment form submission
  const commentForm = document.getElementById('comment-form');
  
  if (commentForm) {
    commentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitComment(commentForm);
    });
  }
});

// Load comments for the current content
function loadComments() {
  const commentsContainer = document.getElementById('comments-container');
  if (!commentsContainer) return;
  
  const commentForm = document.getElementById('comment-form');
  if (!commentForm) return;
  
  const contentType = commentForm.getAttribute('data-content-type');
  const contentId = commentForm.getAttribute('data-content-id');
  
  fetch(`/comments/api/${contentType}/${contentId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    })
    .then(comments => {
      renderComments(commentsContainer, comments);
    })
    .catch(error => {
      console.error('Error fetching comments:', error);
      commentsContainer.innerHTML = '<p class="error-message">Failed to load comments. Please refresh the page.</p>';
    });
}

// Render comments and their replies
function renderComments(container, comments) {
  if (comments.length === 0) {
    container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
    return;
  }
  
  let html = '';
  
  comments.forEach(comment => {
    html += renderComment(comment);
    
    if (comment.replies && comment.replies.length > 0) {
      html += '<div class="comment-replies">';
      
      comment.replies.forEach(reply => {
        html += renderComment(reply, true);
      });
      
      html += '</div>';
    }
  });
  
  container.innerHTML = html;
  
  // Add event listeners for reply buttons
  const replyButtons = container.querySelectorAll('.reply-btn');
  replyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const commentId = button.getAttribute('data-comment-id');
      showReplyForm(commentId);
    });
  });
  
  // Add event listeners for reaction buttons
  const reactionButtons = container.querySelectorAll('.reaction-btn');
  reactionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const commentId = button.getAttribute('data-comment-id');
      const reactionType = button.getAttribute('data-reaction-type');
      addReaction(commentId, reactionType);
    });
  });
}

// Render a single comment
function renderComment(comment, isReply = false) {
  const date = new Date(comment.createdAt);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `
    <div class="comment ${isReply ? 'reply' : ''}" id="comment-${comment._id}">
      <div class="comment-author">
        <div class="author-name">${comment.author.firstName} ${comment.author.lastName}</div>
        <div class="comment-date">${formattedDate}</div>
      </div>
      <div class="comment-body">${comment.body}</div>
      <div class="comment-actions">
        <div class="comment-reactions">
          <button type="button" class="reaction-btn" data-comment-id="${comment._id}" data-reaction-type="heart">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span class="reaction-count">${comment.reactions.heart}</span>
          </button>
          <button type="button" class="reaction-btn" data-comment-id="${comment._id}" data-reaction-type="thumbsUp">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            <span class="reaction-count">${comment.reactions.thumbsUp}</span>
          </button>
          <button type="button" class="reaction-btn" data-comment-id="${comment._id}" data-reaction-type="thumbsDown">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
            <span class="reaction-count">${comment.reactions.thumbsDown}</span>
          </button>
        </div>
        ${!isReply ? `<button type="button" class="reply-btn" data-comment-id="${comment._id}">Reply</button>` : ''}
      </div>
      ${!isReply ? `<div class="reply-form-container" id="reply-form-${comment._id}"></div>` : ''}
    </div>
  `;
}

// Show reply form for a comment
function showReplyForm(commentId) {
  const container = document.getElementById(`reply-form-${commentId}`);
  if (!container) return;
  
  // Toggle the form
  if (container.innerHTML !== '') {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = `
    <form class="reply-form" data-parent-id="${commentId}">
      <div class="form-group">
        <textarea name="reply" placeholder="Write your reply..."></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline cancel-reply">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Reply</button>
      </div>
    </form>
  `;
  
  // Handle form submission
  const replyForm = container.querySelector('.reply-form');
  replyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    submitReply(replyForm);
  });
  
  // Handle cancel button
  const cancelButton = container.querySelector('.cancel-reply');
  cancelButton.addEventListener('click', function() {
    container.innerHTML = '';
  });
  
  // Focus the textarea
  const textarea = container.querySelector('textarea');
  textarea.focus();
}

// Submit a new comment
function submitComment(form) {
  const contentType = form.getAttribute('data-content-type');
  const contentId = form.getAttribute('data-content-id');
  const commentText = form.querySelector('#comment').value.trim();
  
  if (!commentText) {
    alert('Please enter a comment.');
    return;
  }
  
  const data = {
    contentType,
    contentId,
    body: commentText
  };
  
// public/js/comments.js (continuing)
  fetch('/comments/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      return response.json();
    })
    .then(result => {
      if (result.success) {
        // Clear the form
        form.querySelector('#comment').value = '';
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.textContent = result.message;
        
        form.parentNode.insertBefore(successMessage, form);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
          successMessage.remove();
        }, 3000);
      } else {
        alert(result.message || 'Failed to submit comment');
      }
    })
    .catch(error => {
      console.error('Error submitting comment:', error);
      alert('An error occurred while submitting your comment. Please try again.');
    });
}

// Submit a reply to a comment
function submitReply(form) {
  const parentCommentId = form.getAttribute('data-parent-id');
  const replyText = form.querySelector('textarea').value.trim();
  
  if (!replyText) {
    alert('Please enter a reply.');
    return;
  }
  
  const data = {
    parentCommentId,
    body: replyText
  };
  
  fetch('/comments/api/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }
      return response.json();
    })
    .then(result => {
      if (result.success) {
        // Clear the form container
        const container = form.parentNode;
        
        // Show success message
        container.innerHTML = `
          <div class="alert alert-success">
            ${result.message}
          </div>
        `;
        
        // Remove the message after 3 seconds
        setTimeout(() => {
          container.innerHTML = '';
        }, 3000);
      } else {
        alert(result.message || 'Failed to submit reply');
      }
    })
    .catch(error => {
      console.error('Error submitting reply:', error);
      alert('An error occurred while submitting your reply. Please try again.');
    });
}

// Add a reaction to a comment
function addReaction(commentId, reactionType) {
  const data = {
    commentId,
    reactionType
  };
  
  fetch('/comments/api/reaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }
      return response.json();
    })
    .then(result => {
      if (result.success) {
        // Update the reaction count in the UI
        const commentElement = document.getElementById(`comment-${commentId}`);
        const reactionElement = commentElement.querySelector(`.reaction-btn[data-reaction-type="${reactionType}"] .reaction-count`);
        
        if (reactionElement) {
          reactionElement.textContent = result.reactions[reactionType];
        }
      } else {
        alert(result.message || 'Failed to add reaction');
      }
    })
    .catch(error => {
      console.error('Error adding reaction:', error);
      alert('An error occurred while adding your reaction. Please try again.');
    });
}