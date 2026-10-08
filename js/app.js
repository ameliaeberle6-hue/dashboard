// Weather widget
function loadWeather() {
    const el = document.getElementById('weather-display');
    el.innerHTML = `<div class="loading-state"><div class="spinner" aria-hidden="true"></div><p>Loading weather…</p></div>`;
    fetch('./data/weather.json')
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => {
            console.error('Error loading weather:', error);
            displayWeatherError();
        });
}

function displayWeather(weather) {
    document.getElementById('weather-display').innerHTML = `
        <div class="weather-current">
            <div class="weather-icon">${weather.icon}</div>
            <div class="weather-temp">${weather.temperature}°F</div>
            <div class="weather-location">${weather.location}</div>
            <div class="weather-condition">${weather.condition}</div>
        </div>`;
}

function displayWeatherError() {
    document.getElementById('weather-display').innerHTML =
        `<p class="widget-error">Weather data is unavailable right now.</p>`;
}

// Quotes widget
let allQuotes = [];
let currentQuoteIndex = -1;
const quoteButton = document.getElementById('new-quote-btn');

function displayRandomQuote() {
    const display = document.getElementById('quotes-display');
    if (allQuotes.length === 0) {
        display.innerHTML = `<p class="widget-error">No quotes to show.</p>`;
        return;
    }
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * allQuotes.length);
    } while (randomIndex === currentQuoteIndex && allQuotes.length > 1);
    currentQuoteIndex = randomIndex;
    const quote = allQuotes[randomIndex];
    display.innerHTML = `
        <div class="quote-card">
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">— ${quote.author}</div>
        </div>`;
}

function loadQuotes() {
    fetch('./data/quotes.json')
        .then(response => response.json())
        .then(quotes => {
            allQuotes = quotes;
            displayRandomQuote();
            if (allQuotes.length > 0) {
                quoteButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error loading quotes:', error);
            displayQuotesError();
        });
}

function displayQuotesError() {
    document.getElementById('quotes-display').innerHTML =
        `<p class="widget-error">Quotes are unavailable right now.</p>`;
}

quoteButton.addEventListener('click', displayRandomQuote);

// Tasks widget
function loadTasks() {
    const tasksJSON = localStorage.getItem('dashboardTasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('dashboardTasks', JSON.stringify(tasks));
}

function displayTasks() {
    const tasks = loadTasks();
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    const completionPercentage = tasks.length === 0
        ? 0
        : Math.round((completed / tasks.length) * 100);
    const stats = document.getElementById('task-stats');
    const taskList = document.getElementById('tasks-list');

    stats.textContent = `Total: ${tasks.length} · Completed: ${completed} · Pending: ${pending} · ${completionPercentage}% complete`;
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-tasks';
        emptyMessage.textContent = 'No tasks yet. Add one above.';
        taskList.appendChild(emptyMessage);
        return;
    }

    tasks.forEach((task, index) => {
        const item = document.createElement('li');
        item.className = 'task-item';

        const label = document.createElement('label');
        label.className = 'task-label';
        if (task.completed) {
            label.classList.add('task-completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(index));

        const taskText = document.createElement('span');
        taskText.textContent = task.text;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-task';
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete task: ${task.text}`);
        deleteButton.addEventListener('click', () => deleteTask(index));

        label.append(checkbox, taskText);
        item.append(label, deleteButton);
        taskList.appendChild(item);
    });
}

function addTask(taskText) {
    const tasks = loadTasks();
    tasks.push({ text: taskText, completed: false, id: Date.now() });
    saveTasks(tasks);
    displayTasks();
}

function toggleTask(index) {
    const tasks = loadTasks();
    tasks[index].completed = !tasks[index].completed;
    saveTasks(tasks);
    displayTasks();
}

function deleteTask(index) {
    const tasks = loadTasks();
    if (confirm(`Delete task: "${tasks[index].text}"?`)) {
        tasks.splice(index, 1);
        saveTasks(tasks);
        displayTasks();
    }
}

document.getElementById('task-form').addEventListener('submit', event => {
    event.preventDefault();
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
        taskInput.focus();
    }
});

displayTasks();

// Theme
function initializeTheme() {
    if (localStorage.getItem('dashboardTheme') === 'dark') {
        document.body.classList.add('theme-dark');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('theme-dark');
    if (isDark) {
        localStorage.setItem('dashboardTheme', 'dark');
    } else {
        localStorage.setItem('dashboardTheme', 'light');
    }
}

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
initializeTheme();

loadWeather();
loadQuotes();