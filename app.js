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

function parseEvents(data) {
    const lines = data.trim().split('\n');
    return lines.map(line => {
        const [name, startLocal, endLocal, offset] = line.split(',').map(item => item.trim());

        // Convert offset to an integer
        const utcOffset = parseInt(offset, 10); 

        // Convert event time to UTC based on the given offset
        const startDate = new Date(startLocal + " UTC" + (utcOffset >= 0 ? "+" : "") + utcOffset);
        const endDate = new Date(endLocal + " UTC" + (utcOffset >= 0 ? "+" : "") + utcOffset);

        return {
            name,
            start: startDate,
            end: endDate,
            timeZoneOffset: utcOffset // Keep for reference
        };
    }).sort((a, b) => a.start - b.start);
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
    const daysOfWeek = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur'];
    return daysOfWeek[date.getDay()];
}

function displayEvents(events) {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = ''; // Ensure no duplicate rows

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



let countdownIntervals = []; // Store intervals globally

// Function to start countdowns for each event (for individual event rows)
function startCountdowns(events) {
    // Clear previous countdown timers
    countdownIntervals.forEach(clearInterval);
    countdownIntervals = [];

    events.forEach((event, index) => {
        const countdownId = `countdown${index}`;
        const interval = setInterval(() => updateCountdown(event.start, event.end, countdownId), 1000);
        countdownIntervals.push(interval);
    });
}


// Function to update countdown timer for event rows
function updateCountdown(start, end, countdownId) {
    const now = new Date();
    const countdownElement = document.getElementById(countdownId);
    let diff;

    if (now < start) {
        diff = start - now;
        countdownElement.style.color = 'limegreen'; // Set countdown color to green
    } else if (now < end) {
        diff = end - now;
        countdownElement.style.color = 'red'; // Set countdown color to red
    } else {
        // Instead of manually removing the row, set text to 'Ended' and stop updating
        countdownElement.textContent = 'Ended';
        countdownElement.style.color = 'gray';
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


function toggleFullScreen() {
    if (!document.fullscreenElement) {
        // Enter full screen
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting full-screen mode: ${err.message}`);
        });
        document.getElementById('fullscreen-btn').textContent = "Exit Full Screen";
    } else {
        // Exit full screen
        document.exitFullscreen();
        document.getElementById('fullscreen-btn').textContent = "Enter Full Screen";
    }
}

// Attach the function to the button
document.getElementById('fullscreen-btn').addEventListener('click', toggleFullScreen);



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
