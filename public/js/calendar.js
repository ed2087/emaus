// public/js/calendar.js
document.addEventListener('DOMContentLoaded', function() {
  // Calendar view functionality
  
  // Initialize variables
  let currentDate = new Date();
  let events = [];
  let currentView = 'month'; // Can be 'month' or 'list'
  
  // DOM elements
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const currentMonthTitle = document.getElementById('current-month');
  const monthViewBtn = document.getElementById('month-view');
  const listViewBtn = document.getElementById('list-view');
  const monthViewContainer = document.getElementById('month-view-container');
  const listViewContainer = document.getElementById('list-view-container');
  const calendarDays = document.getElementById('calendar-days');
  const eventsList = document.getElementById('events-list');
  const eventModal = document.getElementById('event-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const eventLink = document.getElementById('event-link');
  const closeModal = document.querySelector('.close-modal');
  
  // Set up event listeners
  prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
  nextMonthBtn.addEventListener('click', () => navigateMonth(1));
  monthViewBtn.addEventListener('click', () => switchView('month'));
  listViewBtn.addEventListener('click', () => switchView('list'));
  closeModal.addEventListener('click', () => eventModal.classList.remove('active'));
  eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) {
      eventModal.classList.remove('active');
    }
  });
  
  // Fetch events data
  fetchEvents();
  
  // Function to navigate months
  function navigateMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    updateCalendar();
  }
  
  // Function to switch views
  function switchView(view) {
    currentView = view;
    
    // Update active button
    monthViewBtn.classList.toggle('active', view === 'month');
    listViewBtn.classList.toggle('active', view === 'list');
    
    // Show/hide containers
    monthViewContainer.classList.toggle('active', view === 'month');
    listViewContainer.classList.toggle('active', view === 'list');
    
    // Update view content
    if (view === 'month') {
      renderCalendar();
    } else {
      renderEventsList();
    }
  }
  
  // Function to fetch events
  function fetchEvents() {
    fetch('/events/api/upcoming')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        return response.json();
      })
      .then(data => {
        events = data;
        updateCalendar();
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        calendarDays.innerHTML = '<div class="error-message">Failed to load events. Please refresh the page.</div>';
        eventsList.innerHTML = '<div class="error-message">Failed to load events. Please refresh the page.</div>';
      });
  }
  
  // Function to update calendar
  function updateCalendar() {
    updateMonthTitle();
    
    if (currentView === 'month') {
      renderCalendar();
    } else {
      renderEventsList();
    }
  }
  
  // Function to update month title
  function updateMonthTitle() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }
  
  // Function to render calendar
  function renderCalendar() {
    calendarDays.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week of first day (0 = Sunday, 6 = Saturday)
    const firstDayIndex = firstDay.getDay();
    
    // Create array of day elements
    const daysArray = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'day empty';
      daysArray.push(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'day';
      
      // Check if today
      const currentDateObj = new Date(year, month, day);
      const today = new Date();
      if (currentDateObj.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
      }
      
      // Add day number
      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';
      dayNumber.textContent = day;
      dayElement.appendChild(dayNumber);
      
      // Add events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === month && 
               eventDate.getFullYear() === year;
      });
      
      if (dayEvents.length > 0) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        dayEvents.forEach(event => {
          const eventElement = document.createElement('div');
          eventElement.className = 'day-event';
          if (event.eventType) {
            eventElement.classList.add(`event-type-${event.eventType.toLowerCase()}`);
          }
          
          eventElement.innerHTML = `
            <span class="event-title">${event.title}</span>
            ${event.time ? `<span class="event-time">${event.time}</span>` : ''}
          `;
          
          eventElement.addEventListener('click', () => showEventDetails(event));
          
          eventsContainer.appendChild(eventElement);
        });
        
        dayElement.appendChild(eventsContainer);
      }
      
      daysArray.push(dayElement);
    }
    
    // Add all days to the calendar
    daysArray.forEach(day => {
      calendarDays.appendChild(day);
    });
  }
  
  // Function to render events list
  function renderEventsList() {
    eventsList.innerHTML = '';
    
    // Filter events for current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });
    
    if (monthEvents.length === 0) {
      eventsList.innerHTML = '<div class="empty-state">No events scheduled for this month.</div>';
      return;
    }
    
    // Sort by date
    monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group by date
    const eventsByDate = {};
    
    monthEvents.forEach(event => {
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toDateString();
      
      if (!eventsByDate[dateStr]) {
        eventsByDate[dateStr] = [];
      }
      
      eventsByDate[dateStr].push(event);
    });
    
    // Create list
    Object.keys(eventsByDate).forEach(dateStr => {
      const dateEvents = eventsByDate[dateStr];
      const dateObj = new Date(dateStr);
      
      const dateElement = document.createElement('div');
      dateElement.className = 'list-date';
      
      dateElement.innerHTML = `
        <div class="date-header">
          <h3>${dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        </div>
      `;
      
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'date-events';
      
      dateEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'list-event';
        
        eventElement.innerHTML = `
          <div class="event-time">${event.time || 'All Day'}</div>
          <div class="event-details">
            <h4 class="event-title">${event.title}</h4>
            <div class="event-location">${event.location}</div>
            <div class="event-type">${event.eventType}</div>
          </div>
        `;
        
        eventElement.addEventListener('click', () => showEventDetails(event));
        
        eventsContainer.appendChild(eventElement);
      });
      
      dateElement.appendChild(eventsContainer);
      eventsList.appendChild(dateElement);
    });
  }
  
  // Function to show event details in modal
  function showEventDetails(event) {
    modalTitle.textContent = event.title;
    
    // Format date
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    modalContent.innerHTML = `
      <div class="event-modal-details">
        <div class="event-modal-meta">
          <div class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>${formattedDate}</span>
          </div>
          
          ${event.time ? `
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${event.time}</span>
            </div>
          ` : ''}
          
          <div class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${event.location}</span>
          </div>
          
          <div class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>${event.eventType}</span>
          </div>
        </div>
        
        <div class="event-modal-description">
          ${event.description}
        </div>
        
        ${event.registrationUrl ? `
          <div class="event-modal-registration">
            <p>Registration required for this event.</p>
            ${event.registrationDeadline ? `
              <p>Registration deadline: ${new Date(event.registrationDeadline).toLocaleDateString()}</p>
            ` : ''}
            <a href="${event.registrationUrl}" class="btn btn-primary" target="_blank">Register Now</a>
          </div>
        ` : ''}
      </div>
    `;
    
    // Set link to event page
    eventLink.href = `/events/${event._id}`;
    
    // Show modal
    eventModal.classList.add('active');
  }
  
  // Initialize calendar
  updateCalendar();
});