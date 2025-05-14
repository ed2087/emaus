// public/js/home.js
document.addEventListener('DOMContentLoaded', function() {
  // Load dynamic content for the home page
  
  // Load latest announcements
  fetchLatestAnnouncements();
  
  // Load popular reflections
  fetchPopularReflections();
  
  // Load upcoming events
  fetchUpcomingEvents();
  
  // Load featured testimonials
  fetchFeaturedTestimonials();
});

// Fetch latest announcements
function fetchLatestAnnouncements() {
  const container = document.getElementById('latest-announcements');
  if (!container) return;
  
  fetch('/announcements/api/latest')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    })
    .then(announcements => {
      if (announcements.length === 0) {
        container.innerHTML = '<p class="empty-message">No announcements at this time.</p>';
        return;
      }
      
      let html = '';
      
      announcements.forEach(announcement => {
        html += `
          <div class="announcement-card">
            <div class="announcement-content">
              <h3 class="card-title">
                <a href="/announcements/${announcement._id}">${announcement.title}</a>
                ${announcement.isPinned ? '<span class="pin-icon" title="Pinned"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg></span>' : ''}
              </h3>
              <p class="card-description">${announcement.description}</p>
              <div class="card-footer">
                <a href="/announcements/${announcement._id}" class="btn btn-sm btn-outline">Read More</a>
                <span class="card-date">${new Date(announcement.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Error fetching announcements:', error);
      container.innerHTML = '<p class="error-message">Failed to load announcements. Please refresh the page.</p>';
    });
}

// Fetch popular reflections
function fetchPopularReflections() {
  const container = document.getElementById('popular-reflections');
  if (!container) return;
  
  fetch('/reflections/api/popular')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch reflections');
      }
      return response.json();
    })
    .then(reflections => {
      if (reflections.length === 0) {
        container.innerHTML = '<p class="empty-message">No reflections available.</p>';
        return;
      }
      
      let html = '';
      
      reflections.forEach(reflection => {
        const image = reflection.images && reflection.images.length > 0 
          ? `<div class="card-image"><img src="${reflection.images[0]}" alt="${reflection.title}"></div>` 
          : '';
          
        html += `
          <div class="reflection-card">
            ${image}
            <div class="card-content">
              <h3 class="card-title">
                <a href="/reflections/${reflection._id}">${reflection.title}</a>
              </h3>
              <div class="card-meta">
                <span class="category">${reflection.category}</span>
              </div>
              <p class="card-description">${reflection.description}</p>
              <div class="card-footer">
                <a href="/reflections/${reflection._id}" class="btn btn-sm btn-outline">Read More</a>
              </div>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Error fetching reflections:', error);
      container.innerHTML = '<p class="error-message">Failed to load reflections. Please refresh the page.</p>';
    });
}

// Fetch upcoming events
function fetchUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;
  
  fetch('/events/api/upcoming')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    })
    .then(events => {
      if (events.length === 0) {
        container.innerHTML = '<p class="empty-message">No upcoming events at this time.</p>';
        return;
      }
      
      let html = '';
      
      events.forEach(event => {
        const eventDate = new Date(event.date);
        
        html += `
          <div class="event-item">
            <div class="event-date">
              <span class="date-month">${eventDate.toLocaleDateString('es-ES', { month: 'short' })}</span>
              <span class="date-day">${eventDate.getDate()}</span>
            </div>
            <div class="event-details">
              <h3 class="event-title">
                <a href="/events/${event._id}">${event.title}</a>
              </h3>
              <div class="event-meta">
                <span class="event-location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  ${event.location}
                </span>
                ${event.time ? `<span class="event-time">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ${event.time}
                </span>` : ''}
              </div>
            </div>
            <div class="event-action">
              <a href="/events/${event._id}" class="btn btn-sm btn-outline">Details</a>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      container.innerHTML = '<p class="error-message">Failed to load events. Please refresh the page.</p>';
    });
}

// Fetch featured testimonials
function fetchFeaturedTestimonials() {
  const container = document.getElementById('featured-testimonials');
  if (!container) return;
  
  fetch('/testimonials/api/featured')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      return response.json();
    })
    .then(testimonials => {
      if (testimonials.length === 0) {
        container.innerHTML = '<p class="empty-message">No testimonials available.</p>';
        return;
      }
      
      let html = '';
      
      testimonials.forEach(testimonial => {
        html += `
          <div class="testimonial-card">
            <div class="testimonial-content">
              <div class="testimonial-author">
                ${testimonial.image 
                  ? `<div class="author-image"><img src="${testimonial.image}" alt="${testimonial.authorName}"></div>` 
                  : `<div class="author-avatar">${testimonial.authorName.charAt(0)}</div>`
                }
                <div class="author-name">${testimonial.authorName}</div>
              </div>
              <h3 class="testimonial-title">
                <a href="/testimonials/${testimonial._id}">${testimonial.title}</a>
              </h3>
              <p class="testimonial-excerpt">${testimonial.description}</p>
              <div class="testimonial-footer">
                <a href="/testimonials/${testimonial._id}" class="btn btn-sm btn-outline">Read More</a>
              </div>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Error fetching testimonials:', error);
      container.innerHTML = '<p class="error-message">Failed to load testimonials. Please refresh the page.</p>';
    });
}