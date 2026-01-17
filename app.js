// Data structure with fixed fields
let documentData = {
    title: "Мій документ",
    fields: [
        { id: 'name', emoji: '📝', name: 'Назва', type: 'text', required: true, isTitle: true },
        { id: 'place', emoji: '📍', name: 'Місце', type: 'text', required: false },
        { id: 'time', emoji: '🕐', name: 'Час', type: 'time', required: false },
        { id: 'link', emoji: '🔗', name: 'Посилання', type: 'url', required: false }
    ],
    dateGroups: []
};

// View state
let currentView = 'folders'; // 'folders' or 'folder-content'
let currentFolderId = null;
let viewMode = 'tiles'; // 'tiles' or 'list'

// Temp tasks for quick entry
let tempTasks = [];

// Active filters state (only for folder content view)
let activeFilters = {
    fields: {},
    type: [] // filter by record type
};

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substring(2, 11);
}

// Get title field
function getTitleField() {
    return documentData.fields.find(f => f.isTitle) || documentData.fields[0];
}

// Initialize with sample data
function initSampleData() {
    documentData = {
        title: "Мої записи",
        fields: [
            { id: 'name', emoji: '📝', name: 'Назва', type: 'text', required: true, isTitle: true },
            { id: 'place', emoji: '📍', name: 'Місце', type: 'text', required: false },
            { id: 'time', emoji: '🕐', name: 'Час', type: 'time', required: false },
            { id: 'link', emoji: '🔗', name: 'Посилання', type: 'url', required: false }
        ],
        dateGroups: [
            {
                id: generateId(),
                name: "Фільми на тиждень",
                events: [
                    { id: generateId(), type: 'movie', name: "Небеса Діани", place: "Будинок Кіно", time: "12:30", link: "" },
                    { id: generateId(), type: 'movie', name: "Поводир", place: "Будинок Кіно", time: "19:00", link: "" }
                ]
            },
            {
                id: generateId(),
                name: "Список покупок",
                events: [
                    { id: generateId(), type: 'task', text: "Молоко", completed: false },
                    { id: generateId(), type: 'task', text: "Хліб", completed: false },
                    { id: generateId(), type: 'task', text: "Яйця", completed: true }
                ]
            },
            {
                id: generateId(),
                name: "Подорож до Львова",
                events: [
                    { id: generateId(), type: 'note', text: "Не забути зарядку для телефону!\nВзяти парасольку на всяк випадок." },
                    { id: generateId(), type: 'task', text: "Забронювати готель", completed: true },
                    { id: generateId(), type: 'task', text: "Купити квитки", completed: false }
                ]
            }
        ]
    };
}

// ============ MAIN RENDER ============

function render() {
    if (currentView === 'folders') {
        renderFoldersView();
    } else {
        renderFolderContent();
    }
    updateToolbarState();
}

function updateToolbarState() {
    const backBtn = document.getElementById('backBtn');
    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    const addDateBtn = document.getElementById('addDateBtn');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    const viewToggle = document.querySelector('.view-toggle');
    const documentArea = document.querySelector('.document-area');
    const filtersSidebar = document.getElementById('filtersSidebar');

    if (currentView === 'folders') {
        backBtn.style.display = 'none';
        toggleFiltersBtn.style.display = 'none';
        addDateBtn.style.display = '';
        addDateBtn.textContent = '+ Додати папку';
        expandAllBtn.style.display = 'none';
        collapseAllBtn.style.display = 'none';
        viewToggle.style.display = 'flex';
        documentArea.classList.add('folders-mode');
        documentArea.classList.add('full-width');
        filtersSidebar.classList.add('hidden');
    } else {
        backBtn.style.display = '';
        toggleFiltersBtn.style.display = '';
        addDateBtn.style.display = '';
        addDateBtn.textContent = '+ Додати запис';
        expandAllBtn.style.display = '';
        collapseAllBtn.style.display = '';
        viewToggle.style.display = 'none';
        documentArea.classList.remove('folders-mode');
        documentArea.classList.remove('full-width');
        filtersSidebar.classList.remove('hidden');
    }
}

// ============ FOLDERS VIEW ============

function renderFoldersView() {
    const doc = document.getElementById('document');
    doc.className = 'folders-page';
    doc.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'page-title';
    title.contentEditable = true;
    title.textContent = documentData.title;
    title.addEventListener('blur', () => {
        documentData.title = title.textContent;
        saveToLocalStorage();
    });
    doc.appendChild(title);

    const container = document.createElement('div');
    container.className = viewMode === 'tiles' ? 'folders-grid' : 'folders-list';

    documentData.dateGroups.forEach(group => {
        const folderEl = viewMode === 'tiles'
            ? createFolderTile(group)
            : createFolderRow(group);
        container.appendChild(folderEl);
    });

    doc.appendChild(container);
    document.getElementById('filtersContainer').innerHTML = '';
}

function createFolderTile(group) {
    const tile = document.createElement('div');
    tile.className = 'folder-tile';
    tile.dataset.id = group.id;

    tile.innerHTML = `
        <div class="folder-actions">
            <button class="edit-folder-btn" title="Перейменувати">✏️</button>
            <button class="delete-folder-btn" title="Видалити">🗑️</button>
        </div>
        <span class="folder-icon">📁</span>
        <span class="folder-name">${group.name}</span>
        <span class="folder-count">${group.events.length} записів</span>
    `;

    tile.addEventListener('click', (e) => {
        if (e.target.closest('.folder-actions')) return;
        openFolder(group.id);
    });

    tile.querySelector('.edit-folder-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const newName = prompt('Нова назва папки:', group.name);
        if (newName && newName.trim()) {
            group.name = newName.trim();
            saveToLocalStorage();
            render();
        }
    });

    tile.querySelector('.delete-folder-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Видалити папку "${group.name}" з усіма записами?`)) {
            documentData.dateGroups = documentData.dateGroups.filter(g => g.id !== group.id);
            saveToLocalStorage();
            render();
        }
    });

    return tile;
}

function createFolderRow(group) {
    const row = document.createElement('div');
    row.className = 'folder-row';
    row.dataset.id = group.id;

    row.innerHTML = `
        <span class="folder-icon">📁</span>
        <div class="folder-info">
            <span class="folder-name">${group.name}</span>
            <span class="folder-count">${group.events.length} записів</span>
        </div>
        <div class="folder-actions">
            <button class="edit-folder-btn" title="Перейменувати">✏️</button>
            <button class="delete-folder-btn" title="Видалити">🗑️</button>
        </div>
    `;

    row.addEventListener('click', (e) => {
        if (e.target.closest('.folder-actions')) return;
        openFolder(group.id);
    });

    row.querySelector('.edit-folder-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const newName = prompt('Нова назва папки:', group.name);
        if (newName && newName.trim()) {
            group.name = newName.trim();
            saveToLocalStorage();
            render();
        }
    });

    row.querySelector('.delete-folder-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Видалити папку "${group.name}" з усіма записами?`)) {
            documentData.dateGroups = documentData.dateGroups.filter(g => g.id !== group.id);
            saveToLocalStorage();
            render();
        }
    });

    return row;
}

function openFolder(folderId) {
    currentFolderId = folderId;
    currentView = 'folder-content';
    activeFilters = { fields: {}, type: [] };
    render();
}

function goBack() {
    currentView = 'folders';
    currentFolderId = null;
    activeFilters = { fields: {}, type: [] };
    render();
}

// ============ FOLDER CONTENT VIEW (A4 Page) ============

function renderFolderContent() {
    const group = documentData.dateGroups.find(g => g.id === currentFolderId);
    if (!group) {
        goBack();
        return;
    }

    const doc = document.getElementById('document');
    doc.className = 'a4-page';
    doc.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'document-title';
    title.contentEditable = true;
    title.textContent = group.name;
    title.addEventListener('blur', (e) => {
        group.name = e.target.textContent;
        saveToLocalStorage();
    });
    doc.appendChild(title);

    group.events.forEach(event => {
        const eventEl = createRecordElement(event, group.id);
        doc.appendChild(eventEl);
    });

    generateSidebarFilters(group);
}

// Create element based on record type
function createRecordElement(record, groupId) {
    const type = record.type || 'movie';

    switch (type) {
        case 'task':
            return createTaskElement(record, groupId);
        case 'note':
            return createNoteElement(record, groupId);
        default:
            return createEventElement(record, groupId);
    }
}

function createEventElement(event, groupId) {
    const eventEl = document.createElement('div');
    eventEl.className = 'event-item';
    eventEl.dataset.id = event.id;
    eventEl.dataset.groupId = groupId;
    eventEl.dataset.type = 'movie';

    documentData.fields.forEach(field => {
        if (event[field.id]) {
            eventEl.dataset[field.id] = event[field.id];
        }
    });

    const titleField = getTitleField();
    const titleValue = event[titleField.id] || 'Без назви';

    let detailsHtml = '';
    documentData.fields.forEach(field => {
        if (field.isTitle) return;
        const value = event[field.id];
        if (!value) return;

        if (field.type === 'url' && value) {
            detailsHtml += `<p><strong>${field.emoji}</strong> <a href="${value}" target="_blank">${value}</a></p>`;
        } else {
            detailsHtml += `<p><strong>${field.emoji}</strong> ${value}</p>`;
        }
    });

    eventEl.innerHTML = `
        <div class="event-header">
            <span class="event-title">
                <span class="toggle-icon">▶</span>
                🎬 ${titleValue}
            </span>
            <div class="event-actions">
                <button class="edit-event-btn" title="Редагувати">✏️</button>
                <button class="delete-event-btn" title="Видалити">🗑️</button>
            </div>
        </div>
        <div class="event-details">
            ${detailsHtml || '<p style="color:#999">Немає додаткової інформації</p>'}
        </div>
    `;

    eventEl.querySelector('.event-header').addEventListener('click', (e) => {
        if (e.target.closest('.event-actions')) return;
        eventEl.classList.toggle('expanded');
    });

    eventEl.querySelector('.edit-event-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEventModal(event, groupId);
    });

    eventEl.querySelector('.delete-event-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Видалити цей запис?')) {
            deleteRecord(event.id, groupId);
        }
    });

    return eventEl;
}

function createTaskElement(task, groupId) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item' + (task.completed ? ' completed' : '');
    taskEl.dataset.id = task.id;
    taskEl.dataset.groupId = groupId;
    taskEl.dataset.type = 'task';
    taskEl.dataset.text = task.text || '';

    taskEl.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
        <div class="task-actions">
            <button class="delete-task-btn" title="Видалити">🗑️</button>
        </div>
    `;

    taskEl.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        task.completed = e.target.checked;
        taskEl.classList.toggle('completed', task.completed);
        saveToLocalStorage();
    });

    taskEl.querySelector('.delete-task-btn').addEventListener('click', () => {
        if (confirm('Видалити цю задачу?')) {
            deleteRecord(task.id, groupId);
        }
    });

    return taskEl;
}

function createNoteElement(note, groupId) {
    const noteEl = document.createElement('div');
    noteEl.className = 'note-item';
    noteEl.dataset.id = note.id;
    noteEl.dataset.groupId = groupId;
    noteEl.dataset.type = 'note';
    noteEl.dataset.text = note.text || '';

    noteEl.innerHTML = `
        <div class="note-actions">
            <button class="edit-note-btn" title="Редагувати">✏️</button>
            <button class="delete-note-btn" title="Видалити">🗑️</button>
        </div>
        ${note.text}
    `;

    noteEl.querySelector('.edit-note-btn').addEventListener('click', () => {
        openNoteModal(note, groupId);
    });

    noteEl.querySelector('.delete-note-btn').addEventListener('click', () => {
        if (confirm('Видалити цю нотатку?')) {
            deleteRecord(note.id, groupId);
        }
    });

    return noteEl;
}

function deleteRecord(recordId, groupId) {
    const group = documentData.dateGroups.find(g => g.id === groupId);
    if (group) {
        group.events = group.events.filter(e => e.id !== recordId);
        saveToLocalStorage();
        render();
    }
}

// ============ SIDEBAR FILTERS ============

function generateSidebarFilters(group) {
    const container = document.getElementById('filtersContainer');
    container.innerHTML = '';

    if (!group) return;

    // Check if folder has only tasks
    const hasOnlyTasks = group.events.every(e => e.type === 'task');
    const hasTasks = group.events.some(e => e.type === 'task');
    const hasMovies = group.events.some(e => !e.type || e.type === 'movie');

    // Type filter (only if multiple types)
    const types = getTypesFromGroup(group);
    if (types.length > 1) {
        const typeSection = createFilterSection('📋', 'Тип запису', 'type', types);
        container.appendChild(typeSection);
    }

    // Keyword filter - ONLY for folders with tasks
    if (hasTasks) {
        const textValues = getTextValuesFromGroup(group);
        if (textValues.length > 0) {
            const textSection = createFilterSection('🔤', 'Ключові слова', 'text', textValues);
            container.appendChild(textSection);
        }
    }

    // Field filters for movies (only if folder has movies/events)
    if (hasMovies) {
        documentData.fields.forEach(field => {
            if (field.isTitle || field.type === 'url') return;

            if (field.type === 'time') {
                const timeSection = createTimeFilterSection(field);
                container.appendChild(timeSection);
            } else {
                const values = getFieldValuesFromGroup(group, field.id);
                if (values.length > 0) {
                    const section = createFilterSection(field.emoji, field.name, field.id, values);
                    container.appendChild(section);
                }
            }
        });
    }
}

function getTypesFromGroup(group) {
    const counts = {};
    const typeNames = {
        'movie': '🎬 Подія/Фільм',
        'task': '✅ Задача',
        'note': '📝 Нотатка'
    };

    group.events.forEach(event => {
        const type = event.type || 'movie';
        counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([value, count]) => ({ value, label: typeNames[value] || value, count }))
        .sort((a, b) => b.count - a.count);
}

function getTextValuesFromGroup(group) {
    const words = {};

    group.events.forEach(event => {
        let text = '';
        if (event.type === 'task') text = event.text || '';
        else if (event.type === 'note') text = event.text || '';
        else text = event.name || '';

        // Extract words (3+ characters)
        const wordList = text.toLowerCase().match(/[а-яіїєґa-z]{3,}/gi) || [];
        wordList.forEach(word => {
            words[word] = (words[word] || 0) + 1;
        });
    });

    return Object.entries(words)
        .filter(([_, count]) => count >= 1)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
}

function getFieldValuesFromGroup(group, fieldId) {
    const counts = {};

    group.events.forEach(event => {
        if (event.type && event.type !== 'movie') return;
        const value = event[fieldId];
        if (value && value.trim()) {
            counts[value] = (counts[value] || 0) + 1;
        }
    });

    return Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
}

function createFilterSection(emoji, title, filterId, values) {
    const section = document.createElement('div');
    section.className = 'filter-section';
    section.dataset.filterId = filterId;

    const selectedCount = filterId === 'type'
        ? activeFilters.type.length
        : (activeFilters.fields[filterId]?.length || 0);

    section.innerHTML = `
        <div class="filter-header">
            <span class="filter-emoji">${emoji}</span>
            <span class="filter-title">${title}</span>
            ${selectedCount > 0 ? `<span class="filter-count-badge">${selectedCount}</span>` : ''}
            <span class="filter-toggle">▼</span>
        </div>
        <div class="filter-options"></div>
    `;

    const optionsContainer = section.querySelector('.filter-options');

    values.forEach(item => {
        const isSelected = filterId === 'type'
            ? activeFilters.type.includes(item.value)
            : activeFilters.fields[filterId]?.includes(item.value);

        const displayLabel = item.label || item.value;

        const option = document.createElement('label');
        option.className = 'filter-option' + (isSelected ? ' selected' : '');
        option.innerHTML = `
            <input type="checkbox" ${isSelected ? 'checked' : ''} data-value="${item.value}" data-filter="${filterId}">
            <span class="filter-option-label">${displayLabel}</span>
            <span class="filter-option-count">(${item.count})</span>
        `;

        option.querySelector('input').addEventListener('change', (e) => {
            handleFilterChange(filterId, item.value, e.target.checked);
            option.classList.toggle('selected', e.target.checked);
        });

        optionsContainer.appendChild(option);
    });

    section.querySelector('.filter-header').addEventListener('click', () => {
        section.classList.toggle('collapsed');
    });

    return section;
}

function createTimeFilterSection(field) {
    const section = document.createElement('div');
    section.className = 'filter-section';
    section.dataset.filterId = field.id;

    section.innerHTML = `
        <div class="filter-header">
            <span class="filter-emoji">${field.emoji}</span>
            <span class="filter-title">${field.name}</span>
            <span class="filter-toggle">▼</span>
        </div>
        <div class="filter-options">
            <div class="filter-time-inputs">
                <input type="time" id="filter_${field.id}_from" placeholder="від">
                <span>—</span>
                <input type="time" id="filter_${field.id}_to" placeholder="до">
            </div>
        </div>
    `;

    const fromInput = section.querySelector(`#filter_${field.id}_from`);
    const toInput = section.querySelector(`#filter_${field.id}_to`);

    if (activeFilters.fields[field.id + '_from']) {
        fromInput.value = activeFilters.fields[field.id + '_from'];
    }
    if (activeFilters.fields[field.id + '_to']) {
        toInput.value = activeFilters.fields[field.id + '_to'];
    }

    fromInput.addEventListener('change', () => {
        activeFilters.fields[field.id + '_from'] = fromInput.value;
        applyFilters();
    });

    toInput.addEventListener('change', () => {
        activeFilters.fields[field.id + '_to'] = toInput.value;
        applyFilters();
    });

    section.querySelector('.filter-header').addEventListener('click', () => {
        section.classList.toggle('collapsed');
    });

    return section;
}

function handleFilterChange(filterId, value, isChecked) {
    if (filterId === 'type') {
        if (isChecked) {
            if (!activeFilters.type.includes(value)) {
                activeFilters.type.push(value);
            }
        } else {
            activeFilters.type = activeFilters.type.filter(v => v !== value);
        }
    } else {
        if (!activeFilters.fields[filterId]) {
            activeFilters.fields[filterId] = [];
        }

        if (isChecked) {
            if (!activeFilters.fields[filterId].includes(value)) {
                activeFilters.fields[filterId].push(value);
            }
        } else {
            activeFilters.fields[filterId] = activeFilters.fields[filterId].filter(v => v !== value);
        }
    }

    applyFilters();
    updateFilterBadges();
}

function updateFilterBadges() {
    document.querySelectorAll('.filter-section').forEach(section => {
        const filterId = section.dataset.filterId;
        let count = 0;

        if (filterId === 'type') {
            count = activeFilters.type.length;
        } else {
            count = activeFilters.fields[filterId]?.length || 0;
        }

        const existingBadge = section.querySelector('.filter-count-badge');
        const header = section.querySelector('.filter-header');

        if (count > 0) {
            if (existingBadge) {
                existingBadge.textContent = count;
            } else {
                const badge = document.createElement('span');
                badge.className = 'filter-count-badge';
                badge.textContent = count;
                header.querySelector('.filter-title').after(badge);
            }
        } else if (existingBadge) {
            existingBadge.remove();
        }
    });
}

// ============ APPLY FILTERS ============

function applyFilters() {
    const hasActiveFilters = activeFilters.type.length > 0 ||
        Object.values(activeFilters.fields).some(arr => Array.isArray(arr) ? arr.length > 0 : arr);

    let visibleCount = 0;

    document.querySelectorAll('.event-item, .task-item, .note-item').forEach(el => {
        let matches = true;

        // Type filter
        if (activeFilters.type.length > 0) {
            const elType = el.dataset.type || 'movie';
            if (!activeFilters.type.includes(elType)) {
                matches = false;
            }
        }

        // Text/keyword filter
        if (matches && activeFilters.fields.text?.length > 0) {
            const text = (el.dataset.text || el.dataset.name || '').toLowerCase();
            const hasKeyword = activeFilters.fields.text.some(keyword =>
                text.includes(keyword.toLowerCase())
            );
            if (!hasKeyword) matches = false;
        }

        // Field filters (for movies)
        if (matches) {
            for (const [fieldId, selectedValues] of Object.entries(activeFilters.fields)) {
                if (fieldId === 'text' || fieldId.endsWith('_from') || fieldId.endsWith('_to')) continue;

                if (Array.isArray(selectedValues) && selectedValues.length > 0) {
                    const value = el.dataset[fieldId] || '';
                    if (!selectedValues.includes(value)) {
                        matches = false;
                        break;
                    }
                }
            }
        }

        // Time filter
        if (matches) {
            const timeField = documentData.fields.find(f => f.type === 'time');
            if (timeField) {
                const fromTime = activeFilters.fields[timeField.id + '_from'];
                const toTime = activeFilters.fields[timeField.id + '_to'];

                if (fromTime || toTime) {
                    const eventTime = el.dataset[timeField.id] || '';
                    if (eventTime) {
                        const eventTimeNum = eventTime.replace(':', '');
                        const fromTimeNum = fromTime ? fromTime.replace(':', '') : '0000';
                        const toTimeNum = toTime ? toTime.replace(':', '') : '2359';

                        if (eventTimeNum < fromTimeNum || eventTimeNum > toTimeNum) {
                            matches = false;
                        }
                    }
                }
            }
        }

        if (matches) {
            el.classList.remove('hidden');
            visibleCount++;
        } else {
            el.classList.add('hidden');
        }
    });

    updateNoResultsMessage(hasActiveFilters && visibleCount === 0);
}

function updateNoResultsMessage(show) {
    let message = document.querySelector('.no-results-message');

    if (show) {
        if (!message) {
            message = document.createElement('div');
            message.className = 'no-results-message';
            message.textContent = 'Нічого не знайдено. Спробуйте змінити фільтри.';
            document.getElementById('document').appendChild(message);
        }
    } else if (message) {
        message.remove();
    }
}

function clearAllFilters() {
    activeFilters = { fields: {}, type: [] };

    document.querySelectorAll('.filter-option input').forEach(cb => {
        cb.checked = false;
        cb.closest('.filter-option').classList.remove('selected');
    });

    document.querySelectorAll('.filter-time-inputs input').forEach(input => {
        input.value = '';
    });

    applyFilters();
    updateFilterBadges();
}

// ============ MODALS ============

const typeModal = document.getElementById('typeModal');
const eventModal = document.getElementById('eventModal');
const taskModal = document.getElementById('taskModal');
const noteModal = document.getElementById('noteModal');
const dateModal = document.getElementById('dateModal');
const filtersSidebar = document.getElementById('filtersSidebar');

// Type selector modal
function openTypeModal() {
    typeModal.classList.add('active');
}

function closeTypeModal() {
    typeModal.classList.remove('active');
}

// Type buttons
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        closeTypeModal();

        switch (type) {
            case 'movie':
                openEventModal(null, currentFolderId);
                break;
            case 'task':
                openTaskModal(currentFolderId);
                break;
            case 'note':
                openNoteModal(null, currentFolderId);
                break;
        }
    });
});

// Event/Movie modal
function openEventModal(event, groupId) {
    document.getElementById('modalTitle').textContent = event ? 'Редагувати запис' : 'Додати подію';
    document.getElementById('eventId').value = event ? event.id : '';
    document.getElementById('dateGroupId').value = groupId;
    document.getElementById('eventType').value = 'movie';

    generateFormFields(event);
    eventModal.classList.add('active');
}

function closeEventModal() {
    eventModal.classList.remove('active');
}

function generateFormFields(event = null) {
    const container = document.getElementById('dynamicFormFields');
    container.innerHTML = '';

    documentData.fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-field';

        const label = document.createElement('label');
        label.innerHTML = `${field.emoji} ${field.name}:${field.required ? ' <span style="color:red">*</span>' : ''}`;

        const input = document.createElement('input');
        input.id = `field_${field.id}`;
        input.name = field.id;
        input.required = field.required;
        input.value = event ? (event[field.id] || '') : '';

        switch (field.type) {
            case 'time':
                input.type = 'time';
                break;
            case 'url':
                input.type = 'url';
                input.placeholder = 'https://...';
                break;
            default:
                input.type = 'text';
                input.placeholder = field.name;
        }

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });
}

// Task modal (quick entry)
function openTaskModal(groupId) {
    document.getElementById('taskGroupId').value = groupId;
    document.getElementById('tasksList').innerHTML = '';
    document.getElementById('taskInput').value = '';
    tempTasks = [];
    taskModal.classList.add('active');
    document.getElementById('taskInput').focus();
}

function closeTaskModal() {
    taskModal.classList.remove('active');

    // Save temp tasks to group
    if (tempTasks.length > 0) {
        const groupId = document.getElementById('taskGroupId').value;
        const group = documentData.dateGroups.find(g => g.id === groupId);
        if (group) {
            tempTasks.forEach(taskText => {
                group.events.push({
                    id: generateId(),
                    type: 'task',
                    text: taskText,
                    completed: false
                });
            });
            saveToLocalStorage();
            render();
        }
    }
    tempTasks = [];
}

function addTempTask(text) {
    if (!text.trim()) return;

    tempTasks.push(text.trim());

    const tasksList = document.getElementById('tasksList');
    const taskItem = document.createElement('div');
    taskItem.className = 'task-preview-item';
    taskItem.innerHTML = `
        <div class="task-checkbox"></div>
        <span class="task-text">${text.trim()}</span>
        <button class="task-remove">×</button>
    `;

    taskItem.querySelector('.task-remove').addEventListener('click', () => {
        const index = tempTasks.indexOf(text.trim());
        if (index > -1) tempTasks.splice(index, 1);
        taskItem.remove();
    });

    tasksList.appendChild(taskItem);
    tasksList.scrollTop = tasksList.scrollHeight;
}

// Task input handlers
document.getElementById('taskInput').addEventListener('keydown', (e) => {
    const input = e.target;

    if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value.trim()) {
            addTempTask(input.value);
            input.value = '';
        }
    } else if (e.key === 'Backspace' && input.value === '') {
        e.preventDefault();
        closeTaskModal();
    }
});

// Note modal
function openNoteModal(note, groupId) {
    document.getElementById('noteGroupId').value = groupId;
    document.getElementById('noteId').value = note ? note.id : '';
    document.getElementById('noteText').value = note ? note.text : '';
    noteModal.classList.add('active');
    document.getElementById('noteText').focus();
}

function closeNoteModal() {
    noteModal.classList.remove('active');
}

// Date/Folder modal
function openDateModal() {
    dateModal.classList.add('active');
}

function closeDateModal() {
    dateModal.classList.remove('active');
    document.getElementById('dateForm').reset();
}

function toggleFiltersSidebar() {
    filtersSidebar.classList.toggle('hidden');
    document.querySelector('.document-area').classList.toggle('full-width');
}

// Close buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeTypeModal();
        closeEventModal();
        closeTaskModal();
        closeNoteModal();
        closeDateModal();
    });
});

window.addEventListener('click', (e) => {
    if (e.target === typeModal) closeTypeModal();
    if (e.target === eventModal) closeEventModal();
    if (e.target === taskModal) closeTaskModal();
    if (e.target === noteModal) closeNoteModal();
    if (e.target === dateModal) closeDateModal();
});

// ============ VIEW MODE ============

function setViewMode(mode) {
    viewMode = mode;
    document.getElementById('viewTilesBtn').classList.toggle('active', mode === 'tiles');
    document.getElementById('viewListBtn').classList.toggle('active', mode === 'list');
    localStorage.setItem('skladwebViewMode', mode);
    render();
}

// ============ FORM SUBMISSIONS ============

document.getElementById('eventForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const eventId = document.getElementById('eventId').value;
    const groupId = document.getElementById('dateGroupId').value;
    const group = documentData.dateGroups.find(g => g.id === groupId);

    if (!group) return;

    const eventData = {
        id: eventId || generateId(),
        type: 'movie'
    };

    documentData.fields.forEach(field => {
        const input = document.getElementById(`field_${field.id}`);
        if (input) {
            eventData[field.id] = input.value;
        }
    });

    if (eventId) {
        const eventIndex = group.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            group.events[eventIndex] = eventData;
        }
    } else {
        group.events.push(eventData);
    }

    saveToLocalStorage();
    render();
    closeEventModal();
});

document.getElementById('noteForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const noteId = document.getElementById('noteId').value;
    const groupId = document.getElementById('noteGroupId').value;
    const noteText = document.getElementById('noteText').value.trim();
    const group = documentData.dateGroups.find(g => g.id === groupId);

    if (!group || !noteText) return;

    if (noteId) {
        const note = group.events.find(e => e.id === noteId);
        if (note) {
            note.text = noteText;
        }
    } else {
        group.events.push({
            id: generateId(),
            type: 'note',
            text: noteText
        });
    }

    saveToLocalStorage();
    render();
    closeNoteModal();
});

document.getElementById('dateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const dateName = document.getElementById('dateName').value;

    documentData.dateGroups.push({
        id: generateId(),
        name: dateName,
        events: []
    });

    saveToLocalStorage();
    render();
    closeDateModal();
});

// ============ TOOLBAR BUTTONS ============

document.getElementById('backBtn').addEventListener('click', goBack);
document.getElementById('toggleFiltersBtn').addEventListener('click', toggleFiltersSidebar);
document.getElementById('addDateBtn').addEventListener('click', () => {
    if (currentView === 'folders') {
        openDateModal();
    } else {
        openTypeModal();
    }
});
document.getElementById('clearAllFilters').addEventListener('click', clearAllFilters);

document.getElementById('viewTilesBtn').addEventListener('click', () => setViewMode('tiles'));
document.getElementById('viewListBtn').addEventListener('click', () => setViewMode('list'));

document.getElementById('printBtn').addEventListener('click', () => {
    if (currentView === 'folder-content') {
        document.querySelectorAll('.event-item:not(.hidden)').forEach(el => el.classList.add('expanded'));
    }
    window.print();
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(documentData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skladweb-document.json';
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
                clearAllFilters();
                currentView = 'folders';
                currentFolderId = null;
                saveToLocalStorage();
                render();
            } catch (err) {
                alert('Помилка читання файлу');
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

document.getElementById('expandAllBtn').addEventListener('click', () => {
    document.querySelectorAll('.event-item:not(.hidden)').forEach(el => el.classList.add('expanded'));
});

document.getElementById('collapseAllBtn').addEventListener('click', () => {
    document.querySelectorAll('.event-item').forEach(el => el.classList.remove('expanded'));
});

// ============ LOCAL STORAGE ============

function saveToLocalStorage() {
    localStorage.setItem('skladwebData', JSON.stringify(documentData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('skladwebData');
    if (saved) {
        try {
            documentData = JSON.parse(saved);
            if (!documentData.fields) {
                documentData.fields = [
                    { id: 'name', emoji: '📝', name: 'Назва', type: 'text', required: true, isTitle: true },
                    { id: 'place', emoji: '📍', name: 'Місце', type: 'text', required: false },
                    { id: 'time', emoji: '🕐', name: 'Час', type: 'time', required: false },
                    { id: 'link', emoji: '🔗', name: 'Посилання', type: 'url', required: false }
                ];
            }
        } catch {
            initSampleData();
        }
    } else {
        initSampleData();
    }

    const savedViewMode = localStorage.getItem('skladwebViewMode');
    if (savedViewMode) {
        viewMode = savedViewMode;
        document.getElementById('viewTilesBtn').classList.toggle('active', viewMode === 'tiles');
        document.getElementById('viewListBtn').classList.toggle('active', viewMode === 'list');
    }
}

// Initialize
loadFromLocalStorage();
render();
