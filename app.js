// Function to load and parse the event data from the text file
function loadEvents() {
    fetch('events.txt')
        .then(response => response.text())
        .then(data => {
            const events = parseEvents(data);
            const futureEvents = getFutureEvents(events);  // Filter out past events
            displayEvents(futureEvents);
            startCountdowns(futureEvents);
            startNextEventCountdown(futureEvents);  // Start countdown to the next event
        })
        .catch(error => console.error('Error fetching the event data:', error));
}

// Function to parse the text file data
function parseEvents(data) {
    const lines = data.trim().split('\n');
    const events = lines.map(line => {
        const [name, start, end] = line.split(',');
        return {
            name: name.trim(),
            start: new Date(start.trim()),
            end: new Date(end.trim())
        };
    });
    return events;
}

// Function to get only future events (events that haven't finished yet)
function getFutureEvents(events) {
    const now = new Date();
    return events.filter(event => event.end > now);
}

// Function to update the clock and date
function updateClock() {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    
    const now = new Date();
    
    // Format the time
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Format the date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString(undefined, options);

    // Update the clock and date
    clockElement.textContent = timeString;
    dateElement.textContent = dateString;
}


// Function to get the day of the week from a Date object
function getDayOfWeek(date) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Satur'];
    return daysOfWeek[date.getDay()];
}

// Function to display future events in the table
function displayEvents(events) {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = ''; 

    events.forEach((event, index) => {
        const row = document.createElement('tr');
        const dayOfWeek = getDayOfWeek(event.start); 
        row.innerHTML = `
            <td>${event.name}</td>
            <td>${dayOfWeek}</td> 
            <td>${formatTime(event.start)}</td>
            <td>${formatTime(event.end)}</td>
            <td id="countdown${index}">--:--:--</td>
        `;
        tableBody.appendChild(row);
    });
}


// Function to start countdowns for each event (for individual event rows)
function startCountdowns(events) {
    events.forEach((event, index) => {
        const countdownId = `countdown${index}`;
        setInterval(() => updateCountdown(event.start, event.end, countdownId, index), 1000);
    });
}

// Function to update countdown timer for event rows
function updateCountdown(start, end, countdownId, index) {
    const now = new Date();
    const countdownElement = document.getElementById(countdownId);
    let diff;

    if (now < start) {
        // Event hasn't started yet, countdown to start
        diff = start - now;
        countdownElement.style.color = 'limegreen'; // Set countdown color to green
    } else if (now < end) {
        // Event is ongoing, countdown to end
        diff = end - now;
        countdownElement.style.color = 'red'; // Set countdown color to red
    } else {
        // Event has ended - remove it from the list
        document.querySelector(`tr td#countdown${index}`).parentElement.remove();
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


// Function to format time in HH:MM format
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Reload events every minute to remove any expired ones dynamically
setInterval(() => {
    loadEvents(); // Reload and refresh the list to keep it up-to-date
}, 60000);

// Load events and start the clock when the page is ready
window.onload = function() {
    loadEvents();
    
    // Start the clock
    updateClock();

    // Update the clock every second
    setInterval(updateClock, 1000);
};
