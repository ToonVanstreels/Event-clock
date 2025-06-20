let currentFile = 'events1.txt';  // Default file

function loadEvents(file = currentFile) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            const events = parseEvents(data);
            const futureEvents = getFutureEvents(events);
            displayEvents(futureEvents);
            startCountdowns(futureEvents);
        })
        .catch(error => console.error('Error fetching the event data:', error));
}

function switchEventList(file, label) {
    currentFile = file;
    document.getElementById('table-header').textContent = label;
    loadEvents(file);
}

// Update event listeners
document.getElementById('list1-btn').addEventListener('click', () => switchEventList('events1.txt', '24h Series'));
document.getElementById('list2-btn').addEventListener('click', () => switchEventList('events2.txt', 'PCCB'));



function parseEvents(data) {
    const lines = data.trim().split('\n');
    return lines.map(line => {
        const [name, startISO, endISO] = line.split(',').map(item => item.trim());

        // Use Date constructor to parse ISO 8601 string correctly across all devices
        const startDate = new Date(startISO);
        const endDate = new Date(endISO);

        return { name, start: startDate, end: endDate };
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
        countdownElement.style.color = 'lime'; // Set countdown color to green
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
