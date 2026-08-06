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

function closeModal() {
    document.getElementById('timetable-modal').style.display = 'none';
}

document.getElementById('modal-list1').addEventListener('click', () => {
    switchEventList('events1.txt', '24h Series');
    closeModal();
});

document.getElementById('modal-list2').addEventListener('click', () => {
    switchEventList('events2.txt', 'PCCB');
    closeModal();
});


function parseEvents(data) {
    const lines = data.trim().split('\n');

    return lines.map(line => {
        const [type, name, startISO, endISO] =
            line.split(',').map(item => item.trim());

        const startDate = new Date(startISO);
        const endDate = new Date(endISO);

        return {
            type: parseInt(type, 10),
            name,
            start: startDate,
            end: endDate
        };
    }).sort((a, b) => a.start - b.start);
}


// Get only future events
function getFutureEvents(events) {
    const now = new Date();
    return events.filter(event => event.end > now);
}


// Update the clock and date
function updateClock() {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');

    const now = new Date();

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds}`;

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const dateString = now.toLocaleDateString(undefined, options);

    clockElement.textContent = timeString;
    dateElement.textContent = dateString;
}


// Get day of the week
function getDayOfWeek(date) {
    const daysOfWeek = [
        'Sun',
        'Mon',
        'Tues',
        'Wednes',
        'Thurs',
        'Fri',
        'Satur'
    ];

    return daysOfWeek[date.getDay()];
}


function displayEvents(events) {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = '';

    events.forEach((event, index) => {
        const row = document.createElement('tr');

        // Add class depending on type
        if (event.type === 1) row.classList.add('event-type-1');
        if (event.type === 2) row.classList.add('event-type-2');
        if (event.type === 3) row.classList.add('event-type-3');
        if (event.type === 4) row.classList.add('event-type-4');

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


let countdownIntervals = [];


// Start countdowns
function startCountdowns(events) {

    countdownIntervals.forEach(clearInterval);
    countdownIntervals = [];

    events.forEach((event, index) => {

        const countdownId = `countdown${index}`;

        const interval = setInterval(() => {
            updateCountdown(
                event.start,
                event.end,
                countdownId
            );
        }, 1000);

        countdownIntervals.push(interval);
    });
}


// Update countdown timer
function updateCountdown(start, end, countdownId) {

    const now = new Date();
    const countdownElement =
        document.getElementById(countdownId);

    let diff;

    if (now < start) {

        diff = start - now;
        countdownElement.style.color = 'lime';

    } else if (now < end) {

        diff = end - now;
        countdownElement.style.color = 'red';

    } else {

        countdownElement.textContent = 'Ended';
        countdownElement.style.color = 'gray';
        return;
    }

    const hours = Math.floor(
        diff / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
        (diff % (1000 * 60)) /
        1000
    );

    countdownElement.textContent =
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
}


// Format time in HH:MM
function formatTime(date) {

    const hours = date
        .getHours()
        .toString()
        .padStart(2, '0');

    const minutes = date
        .getMinutes()
        .toString()
        .padStart(2, '0');

    return `${hours}:${minutes}`;
}


// ================================
// MOBILE MODE
// ================================

const mobileButton =
    document.getElementById('mobile-btn');

mobileButton.addEventListener('click', () => {

    document.body.classList.toggle('mobile-mode');

    if (document.body.classList.contains('mobile-mode')) {
        mobileButton.textContent = 'Exit Mobile Mode';
    } else {
        mobileButton.textContent = 'Mobile Mode';
    }
});


// Reload events every minute
setInterval(() => {
    loadEvents();
}, 60000);


// Load events and start clock
window.onload = function() {

    loadEvents();

    updateClock();

    setInterval(updateClock, 1000);
};
