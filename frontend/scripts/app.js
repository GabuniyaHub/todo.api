"use strict";

// ===== КОНФИГУРАЦИЯ =====
const API_BASE = 'http://localhost:3000/api/todos'; // 🔁 Сюда впишите свой URL

// ===== ЭЛЕМЕНТЫ DOM =====
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');

const removeBtn = document.getElementById('remove-task-btn');
const clearBtn = document.getElementById('clear-tasks-btn');
const saveBtn = document.getElementById('save-tasks-btn');
const loadBtn = document.getElementById('load-tasks-btn');
const sortBtn = document.getElementById('sort-tasks-btn');

// ===== СОСТОЯНИЕ (только для UI) =====
let tasks = [];
let selectedId = null;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    alert('❌ ' + message);
}

// ===== ЗАПРОСЫ К БЭКЕНДУ =====

// GET /todos — получить все задачи
async function fetchTasks() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
        tasks = await res.json();
        render();
    } catch (err) {
        showError('Не удалось загрузить задачи: ' + err.message);
        tasks = [];
        render();
    }
}

// POST /todos — создать задачу
async function createTask(title) {
    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        if (!res.ok) throw new Error(`Ошибка ${res.status}: ${res.statusText}`);

        const newTask = await res.json();
        tasks.push(newTask);
        render();
        return newTask;
    } catch (err) {
        showError('Не удалось добавить задачу: ' + err.message);
    }
}

// PUT /todos/:id — обновить задачу (completed)
async function updateTask(id, updates) {
    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!res.ok) throw new Error(`Ошибка ${res.status}: ${res.statusText}`);

        const updated = await res.json();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) tasks[index] = updated;
        render();
    } catch (err) {
        showError('Не удалось обновить задачу: ' + err.message);
    }
}

// DELETE /todos/:id — удалить одну задачу
async function deleteTask(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error(`Ошибка ${res.status}: ${res.statusText}`);

        tasks = tasks.filter(t => t.id !== id);
        if (selectedId === id) selectedId = null;
        render();
    } catch (err) {
        showError('Не удалось удалить задачу: ' + err.message);
    }
}

// DELETE /todos — удалить все задачи
async function deleteAllTasks() {
    try {
        const res = await fetch(API_BASE, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error(`Ошибка ${res.status}: ${res.statusText}`);

        tasks = [];
        selectedId = null;
        render();
    } catch (err) {
        showError('Не удалось очистить список: ' + err.message);
    }
}

// ===== UI ЛОГИКА (ТОЛЬКО ОТРИСОВКА) =====

function render() {
    if (tasks.length === 0) {
        taskList.innerHTML = `<li class="empty-message">🎯 Нет задач. Добавьте новую!</li>`;
        taskCounter.textContent = '0 задач';
        return;
    }

    let html = '';
    tasks.forEach(task => {
        const checked = task.completed ? 'checked' : '';
        const completedClass = task.completed ? 'completed' : '';
        const selectedClass = (selectedId === task.id) ? 'selected' : '';

        html += `
            <li class="task-item ${completedClass} ${selectedClass}" data-id="${task.id}">
                <input type="checkbox" class="task-check" ${checked} data-id="${task.id}" />
                <span class="task-text">${escapeHtml(task.title)}</span>
                <button class="task-delete-btn" data-id="${task.id}">✕</button>
            </li>
        `;
    });

    taskList.innerHTML = html;
    updateCounter();
}

function updateCounter() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    taskCounter.textContent = `${total} задач (${pending} активных, ${completed} выполнено)`;
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

// Добавление
addBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (!text) {
        alert('Введите текст задачи');
        return;
    }
    createTask(text);
    taskInput.value = '';
    taskInput.focus();
});

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addBtn.click();
    }
});

// Выделение задачи (клик по строке)
taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('task-check') || e.target.classList.contains('task-delete-btn')) {
        return;
    }

    const item = e.target.closest('.task-item');
    if (!item) return;

    const id = Number(item.dataset.id);
    selectedId = (selectedId === id) ? null : id;
    render();
});

// Чекбокс (выполнено/не выполнено)
taskList.addEventListener('change', (e) => {
    if (!e.target.classList.contains('task-check')) return;

    const id = Number(e.target.dataset.id);
    const checked = e.target.checked;
    updateTask(id, { completed: checked });

    if (checked && selectedId === id) {
        selectedId = null;
    }
});

// Крестик (удаление конкретной задачи)
taskList.addEventListener('click', (e) => {
    if (!e.target.classList.contains('task-delete-btn')) return;

    const id = Number(e.target.dataset.id);
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!confirm(`Удалить задачу: "${task.title}"?`)) return;
    deleteTask(id);
});

// ===== КНОПКИ УПРАВЛЕНИЯ =====

// Удалить выбранную
removeBtn.addEventListener('click', () => {
    if (selectedId === null) {
        alert('Сначала выберите задачу (кликните по ней)');
        return;
    }
    const task = tasks.find(t => t.id === selectedId);
    if (!task) return;
    if (!confirm(`Удалить задачу: "${task.title}"?`)) return;
    deleteTask(selectedId);
});

// Очистить всё
clearBtn.addEventListener('click', () => {
    if (tasks.length === 0) {
        alert('Список уже пуст');
        return;
    }
    if (!confirm('Удалить ВСЕ задачи?')) return;
    deleteAllTasks();
});

// Сохранить — просто перезагружаем с сервера (актуально, если данные могли измениться)
saveBtn.addEventListener('click', () => {
    fetchTasks();
    alert('🔄 Данные обновлены с сервера');
});

// Загрузить — то же самое, но с уведомлением
loadBtn.addEventListener('click', () => {
    fetchTasks();
    alert('📂 Данные загружены с сервера');
});

// Сортировка — клиент просит сервер отсортировать и вернуть результат
sortBtn.addEventListener('click', async () => {
    try {
        const res = await fetch(`${API_BASE}/sort`, {
            method: 'GET'
        });
        if (!res.ok) throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
        tasks = await res.json();
        selectedId = null;
        render();
    } catch (err) {
        showError('Не удалось отсортировать: ' + err.message);
    }
});

// ===== ЗАПУСК =====
fetchTasks();