// Data structure
let documentData = {
    title: "Афіша кіно",
    dateGroups: []
};

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize with sample data
function initSampleData() {
    documentData = {
        title: "Афіша кіно",
        dateGroups: [
            {
                id: generateId(),
                name: "17 липня:",
                events: [
                    {
                        id: generateId(),
                        name: "Небеса Діани",
                        place: "Будинок Кіно",
                        time: "12:30",
                        link: "https://kiev.ticketsbox.com/event/nebesa-diani-rezh-yan-assmann-karmen-zhak.html"
                    },
                    {
                        id: generateId(),
                        name: "Поводир",
                        place: "Будинок Кіно",
                        time: "19:00",
                        link: "https://kiev.ticketsbox.com/event/povodir-rezh-oles-sanin.html"
                    },
                    {
                        id: generateId(),
                        name: "Киснева станція",
                        place: "Будинок Кіно",
                        time: "19:30",
                        link: "https://kiev.ticketsbox.com/event/kisneva-stantsiya-rezh-ivan-timchenko.html"
                    },
                    {
                        id: generateId(),
                        name: "Шляхетні волоцюги",
                        place: "Будинок Кіно",
                        time: "16:30",
                        link: "https://kiev.ticketsbox.com/event/shlyahetni-volotsjugi-rezh-oleksandr-berezan.html"
                    },
                    {
                        id: generateId(),
                        name: "БожеВільні",
                        place: "Будинок Кіно",
                        time: "19:00",
                        link: "https://kiev.ticketsbox.com/event/bozhevilni-rezh-denis-tarasov.html"
                    },
                    {
                        id: generateId(),
                        name: "Субстанція",
                        place: "Оскар",
                        time: "19:00",
                        link: "https://kiev.ticketsbox.com/event/substantsiya-rezh-koral-farzha.html"
                    }
                ]
            },
            {
                id: generateId(),
                name: "18 липня:",
                events: [
                    {
                        id: generateId(),
                        name: "Чорничні мрії",
                        place: "Будинок Кіно",
                        time: "13:00",
                        link: "https://kiev.ticketsbox.com/event/chornichni-mriyi-rezh-elene-mikaberidze.html"
                    },
                    {
                        id: generateId(),
                        name: "Друга премія",
                        place: "Оскар",
                        time: "14:00",
                        link: "https://kiev.ticketsbox.com/event/druga-premiya-rezh-isaki-lakuesta.html"
                    },
                    {
                        id: generateId(),
                        name: "Сірі бджоли",
                        place: "Будинок Кіно",
                        time: "15:45",
                        link: "https://kiev.ticketsbox.com/event/siri-bdzholi-rezh-dmtro-mojsev.html"
                    }
                ]
            },
            {
                id: generateId(),
                name: "19 липня:",
                events: [
                    {
                        id: generateId(),
                        name: "Втечі та мрії",
                        place: "Будинок Кіно",
                        time: "14:45",
                        link: "https://kiev.ticketsbox.com/event/vtechi-ta-mriyi-rezh-kajsa-el-ramli.html"
                    },
                    {
                        id: generateId(),
                        name: "Моя бабуся з Марса",
                        place: "Будинок Кіно",
                        time: "16:00",
                        link: "https://kiev.ticketsbox.com/event/moya-babusya-z-marsa-rezh-aleksandr-mihalkovich.html"
                    },
                    {
                        id: generateId(),
                        name: "Юпітер",
                        place: "Будинок Кіно",
                        time: "17:00",
                        link: "https://kiev.ticketsbox.com/event/jupiter-rezh-benyamin-pfol.html"
                    }
                ]
            }
        ]
    };
}

// Render document
function renderDocument() {
    const doc = document.getElementById('document');
    const title = doc.querySelector('.document-title');

    // Clear content except title
    doc.innerHTML = '';
    doc.appendChild(title);
    title.textContent = documentData.title;

    // Render each date group
    documentData.dateGroups.forEach(group => {
        const groupEl = createDateGroupElement(group);
        doc.appendChild(groupEl);
    });
}

// Create date group element
function createDateGroupElement(group) {
    const groupEl = document.createElement('div');
    groupEl.className = 'date-group';
    groupEl.dataset.id = group.id;

    groupEl.innerHTML = `
        <div class="date-header">
            <h2 contenteditable="true">${group.name}</h2>
            <div class="date-actions">
                <button class="add-event-btn" title="Додати подію">➕</button>
                <button class="delete-date-btn" title="Видалити дату">🗑️</button>
            </div>
        </div>
        <div class="events-container"></div>
    `;

    const eventsContainer = groupEl.querySelector('.events-container');
    group.events.forEach(event => {
        const eventEl = createEventElement(event, group.id);
        eventsContainer.appendChild(eventEl);
    });

    // Event listeners
    groupEl.querySelector('.add-event-btn').addEventListener('click', () => {
        openEventModal(null, group.id);
    });

    groupEl.querySelector('.delete-date-btn').addEventListener('click', () => {
        if (confirm('Видалити цю дату з усіма подіями?')) {
            documentData.dateGroups = documentData.dateGroups.filter(g => g.id !== group.id);
            renderDocument();
            saveToLocalStorage();
        }
    });

    // Update date name on edit
    const dateTitle = groupEl.querySelector('.date-header h2');
    dateTitle.addEventListener('blur', () => {
        const dateGroup = documentData.dateGroups.find(g => g.id === group.id);
        if (dateGroup) {
            dateGroup.name = dateTitle.textContent;
            saveToLocalStorage();
        }
    });

    return groupEl;
}

// Create event element
function createEventElement(event, groupId) {
    const eventEl = document.createElement('div');
    eventEl.className = 'event-item';
    eventEl.dataset.id = event.id;
    eventEl.draggable = true;

    eventEl.innerHTML = `
        <div class="event-header">
            <span class="event-title">
                <span class="toggle-icon">▶</span>
                ${event.name}
            </span>
            <div class="event-actions">
                <button class="edit-event-btn" title="Редагувати">✏️</button>
                <button class="delete-event-btn" title="Видалити">🗑️</button>
            </div>
        </div>
        <div class="event-details">
            <p><strong>📍</strong> ${event.place}</p>
            <p><strong>🕐</strong> ${event.time}</p>
            ${event.link ? `<p><strong>🔗</strong> <a href="${event.link}" target="_blank">${event.link}</a></p>` : ''}
        </div>
    `;

    // Toggle expand/collapse
    eventEl.querySelector('.event-header').addEventListener('click', (e) => {
        if (e.target.closest('.event-actions')) return;
        eventEl.classList.toggle('expanded');
    });

    // Edit event
    eventEl.querySelector('.edit-event-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEventModal(event, groupId);
    });

    // Delete event
    eventEl.querySelector('.delete-event-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Видалити цю подію?')) {
            const group = documentData.dateGroups.find(g => g.id === groupId);
            if (group) {
                group.events = group.events.filter(ev => ev.id !== event.id);
                renderDocument();
                saveToLocalStorage();
            }
        }
    });

    // Drag and drop
    eventEl.addEventListener('dragstart', (e) => {
        eventEl.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify({ eventId: event.id, groupId }));
    });

    eventEl.addEventListener('dragend', () => {
        eventEl.classList.remove('dragging');
    });

    eventEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        eventEl.classList.add('drag-over');
    });

    eventEl.addEventListener('dragleave', () => {
        eventEl.classList.remove('drag-over');
    });

    eventEl.addEventListener('drop', (e) => {
        e.preventDefault();
        eventEl.classList.remove('drag-over');

        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        moveEvent(data.eventId, data.groupId, event.id, groupId);
    });

    return eventEl;
}

// Move event (drag and drop)
function moveEvent(sourceEventId, sourceGroupId, targetEventId, targetGroupId) {
    const sourceGroup = documentData.dateGroups.find(g => g.id === sourceGroupId);
    const targetGroup = documentData.dateGroups.find(g => g.id === targetGroupId);

    if (!sourceGroup || !targetGroup) return;

    const eventIndex = sourceGroup.events.findIndex(e => e.id === sourceEventId);
    if (eventIndex === -1) return;

    const [movedEvent] = sourceGroup.events.splice(eventIndex, 1);

    const targetIndex = targetGroup.events.findIndex(e => e.id === targetEventId);
    targetGroup.events.splice(targetIndex, 0, movedEvent);

    renderDocument();
    saveToLocalStorage();
}

// Modal functions
const eventModal = document.getElementById('eventModal');
const dateModal = document.getElementById('dateModal');

function openEventModal(event, groupId) {
    document.getElementById('modalTitle').textContent = event ? 'Редагувати подію' : 'Додати подію';
    document.getElementById('eventName').value = event ? event.name : '';
    document.getElementById('eventPlace').value = event ? event.place : '';
    document.getElementById('eventTime').value = event ? event.time : '';
    document.getElementById('eventLink').value = event ? event.link : '';
    document.getElementById('eventId').value = event ? event.id : '';
    document.getElementById('dateGroupId').value = groupId;

    eventModal.classList.add('active');
}

function closeEventModal() {
    eventModal.classList.remove('active');
    document.getElementById('eventForm').reset();
}

function openDateModal() {
    dateModal.classList.add('active');
}

function closeDateModal() {
    dateModal.classList.remove('active');
    document.getElementById('dateForm').reset();
}

// Form submissions
document.getElementById('eventForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const eventId = document.getElementById('eventId').value;
    const groupId = document.getElementById('dateGroupId').value;
    const group = documentData.dateGroups.find(g => g.id === groupId);

    if (!group) return;

    const eventData = {
        id: eventId || generateId(),
        name: document.getElementById('eventName').value,
        place: document.getElementById('eventPlace').value,
        time: document.getElementById('eventTime').value,
        link: document.getElementById('eventLink').value
    };

    if (eventId) {
        // Update existing event
        const eventIndex = group.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            group.events[eventIndex] = eventData;
        }
    } else {
        // Add new event
        group.events.push(eventData);
    }

    renderDocument();
    saveToLocalStorage();
    closeEventModal();
});

document.getElementById('dateForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const dateName = document.getElementById('dateName').value;

    documentData.dateGroups.push({
        id: generateId(),
        name: dateName,
        events: []
    });

    renderDocument();
    saveToLocalStorage();
    closeDateModal();
});

// Close modal buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeEventModal();
        closeDateModal();
    });
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === eventModal) closeEventModal();
    if (e.target === dateModal) closeDateModal();
});

// Toolbar buttons
document.getElementById('addDateBtn').addEventListener('click', openDateModal);

document.getElementById('printBtn').addEventListener('click', () => {
    // Expand all before printing
    document.querySelectorAll('.event-item').forEach(el => el.classList.add('expanded'));
    window.print();
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(documentData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.json';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('loadBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                documentData = JSON.parse(event.target.result);
                renderDocument();
                saveToLocalStorage();
            } catch (err) {
                alert('Помилка читання файлу');
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

document.getElementById('expandAllBtn').addEventListener('click', () => {
    document.querySelectorAll('.event-item').forEach(el => el.classList.add('expanded'));
});

document.getElementById('collapseAllBtn').addEventListener('click', () => {
    document.querySelectorAll('.event-item').forEach(el => el.classList.remove('expanded'));
});

// Document title editing
document.querySelector('.document-title').addEventListener('blur', (e) => {
    documentData.title = e.target.textContent;
    saveToLocalStorage();
});

// Local storage
function saveToLocalStorage() {
    localStorage.setItem('collapsibleDocData', JSON.stringify(documentData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('collapsibleDocData');
    if (saved) {
        try {
            documentData = JSON.parse(saved);
        } catch {
            initSampleData();
        }
    } else {
        initSampleData();
    }
}

// Search functionality
const searchPanel = document.getElementById('searchPanel');

document.getElementById('searchBtn').addEventListener('click', () => {
    searchPanel.classList.toggle('active');
});

document.getElementById('closeSearchBtn').addEventListener('click', () => {
    searchPanel.classList.remove('active');
});

document.getElementById('clearSearchBtn').addEventListener('click', () => {
    document.getElementById('searchDate').value = '';
    document.getElementById('searchTimeFrom').value = '';
    document.getElementById('searchTimeTo').value = '';
    document.getElementById('searchPlace').value = '';
    document.getElementById('searchResults').innerHTML = '';

    // Remove all highlights
    document.querySelectorAll('.event-item.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });
});

document.getElementById('applySearchBtn').addEventListener('click', performSearch);

function performSearch() {
    const searchDate = document.getElementById('searchDate').value.toLowerCase().trim();
    const searchTimeFrom = document.getElementById('searchTimeFrom').value;
    const searchTimeTo = document.getElementById('searchTimeTo').value;
    const searchPlace = document.getElementById('searchPlace').value.toLowerCase().trim();

    const results = [];

    // Remove previous highlights
    document.querySelectorAll('.event-item.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });

    documentData.dateGroups.forEach(group => {
        const dateMatches = !searchDate || group.name.toLowerCase().includes(searchDate);

        if (dateMatches || searchTimeFrom || searchTimeTo || searchPlace) {
            group.events.forEach(event => {
                let matches = dateMatches || !searchDate;

                // Check time range
                if (searchTimeFrom || searchTimeTo) {
                    const eventTime = event.time.replace(':', '');
                    const fromTime = searchTimeFrom ? searchTimeFrom.replace(':', '') : '0000';
                    const toTime = searchTimeTo ? searchTimeTo.replace(':', '') : '2359';

                    if (eventTime < fromTime || eventTime > toTime) {
                        matches = false;
                    }
                }

                // Check place
                if (searchPlace && !event.place.toLowerCase().includes(searchPlace)) {
                    matches = false;
                }

                // Check date match for non-date searches
                if (!searchDate && (searchTimeFrom || searchTimeTo || searchPlace)) {
                    matches = matches && true;
                } else if (searchDate && !dateMatches) {
                    matches = false;
                }

                if (matches) {
                    results.push({
                        event,
                        groupId: group.id,
                        dateName: group.name
                    });
                }
            });
        }
    });

    displaySearchResults(results);
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Нічого не знайдено</div>';
        return;
    }

    let html = `<div class="search-results-header">Знайдено: ${results.length} подій</div>`;

    results.forEach(result => {
        html += `
            <div class="search-result-item" data-event-id="${result.event.id}" data-group-id="${result.groupId}">
                <div class="search-result-info">
                    <h4>${result.event.name}</h4>
                    <p>${result.event.place} | ${result.event.time}</p>
                </div>
                <div class="search-result-date">${result.dateName}</div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;

    // Add click handlers to results
    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const eventId = item.dataset.eventId;
            highlightAndScrollToEvent(eventId);
        });
    });
}

function highlightAndScrollToEvent(eventId) {
    // Remove previous highlights
    document.querySelectorAll('.event-item.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });

    // Find and highlight the event
    const eventEl = document.querySelector(`.event-item[data-id="${eventId}"]`);
    if (eventEl) {
        eventEl.classList.add('highlighted');
        eventEl.classList.add('expanded');

        // Scroll into view
        eventEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Close search panel on mobile
        if (window.innerWidth < 768) {
            searchPanel.classList.remove('active');
        }
    }
}

// Initialize
loadFromLocalStorage();
renderDocument();
