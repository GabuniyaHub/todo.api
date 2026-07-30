import { database, inicializationDB } from './initDB.js';

function addSeeds() {

    if (!databse) {
        console.error("База не инициализирована.");
        return;
    }

    

    const insert = database.prepare(`
        INSERT INTO todos (title, description, completed, priority, due_date, user_id) 
        VALUES ($title, $description, $completed, $priority, $due_date, $user_id)
    `);

    const todos = [
    {
        title: 'Изучить Node.js',
        description: 'Пройти основы Node.js, разобраться с модулями и потоком событий',
        completed: 1,
        priority: 2,
        due_date: '2026-08-01',
        user_id: 1
    },
    {
        title: 'Сделать Todo API',
        description: 'Создать REST API на Express для управления задачами',
        completed: 0,
        priority: 2,
        due_date: '2026-08-15',
        user_id: 1
    },
    {
        title: 'Написать документацию',
        description: 'Оформить README.md с описанием проекта и инструкцией по запуску',
        completed: 0,
        priority: 1,
        due_date: '2026-08-20',
        user_id: 1
    },
    {
        title: 'Подключить SQLite',
        description: 'Заменить временное хранилище на базу данных SQLite',
        completed: 1,
        priority: 2,
        due_date: '2026-07-30',
        user_id: 1
    },
    {
        title: 'Настроить CORS',
        description: 'Добавить поддержку CORS для связи с фронтендом',
        completed: 1,
        priority: 1,
        due_date: '2026-07-25',
        user_id: 1
    },
    {
        title: 'Написать тесты',
        description: 'Покрыть API тестами с использованием Jest',
        completed: 0,
        priority: 1,
        due_date: '2026-09-01',
        user_id: 2
    },
    {
        title: 'Оптимизировать запросы',
        description: 'Добавить индексы для ускорения поиска по title и user_id',
        completed: 0,
        priority: 2,
        due_date: '2026-08-10',
        user_id: 2
    },
    {
        title: 'Добавить аутентификацию',
        description: 'Реализовать JWT-аутентификацию для пользователей',
        completed: 0,
        priority: 2,
        due_date: '2026-09-15',
        user_id: 2
    },
    {
        title: 'Подготовить деплой',
        description: 'Настроить деплой на сервер с использованием PM2',
        completed: 0,
        priority: 1,
        due_date: '2026-10-01',
        user_id: 1
    },
    {
        title: 'Сделать фронтенд',
        description: 'Создать простой интерфейс для управления задачами на React',
        completed: 0,
        priority: 2,
        due_date: '2026-08-25',
        user_id: 1
    },
    {
        title: 'Добавить пагинацию',
        description: 'Реализовать пагинацию для GET /todos',
        completed: 0,
        priority: 0,
        due_date: '2026-08-05',
        user_id: 2
    },
    {
        title: 'Настроить логирование',
        description: 'Добавить логирование запросов и ошибок в файл',
        completed: 1,
        priority: 1,
        due_date: '2026-07-20',
        user_id: 1
    },
    {
        title: 'Сделать валидацию',
        description: 'Добавить валидацию данных при создании и обновлении задач',
        completed: 0,
        priority: 2,
        due_date: '2026-08-12',
        user_id: 2
    },
    {
        title: 'Добавить сортировку',
        description: 'Реализовать сортировку задач по полям title, created_at, priority',
        completed: 1,
        priority: 1,
        due_date: '2026-07-28',
        user_id: 1
    },
    {
        title: 'Создать админ-панель',
        description: 'Сделать простую админ-панель для управления пользователями',
        completed: 0,
        priority: 0,
        due_date: '2026-09-20',
        user_id: 2
    },
    {
        title: 'Добавить поиск',
        description: 'Реализовать полнотекстовый поиск по задачам',
        completed: 0,
        priority: 1,
        due_date: '2026-08-18',
        user_id: 1
    },
    {
        title: 'Написать скрипт для сидов',
        description: 'Создать отдельный скрипт для заполнения базы тестовыми данными',
        completed: 1,
        priority: 0,
        due_date: '2026-07-22',
        user_id: 2
    },
    {
        title: 'Обновить зависимости',
        description: 'Проверить и обновить все пакеты до актуальных версий',
        completed: 0,
        priority: 1,
        due_date: '2026-08-30',
        user_id: 1
    },
    {
        title: 'Добавить CI/CD',
        description: 'Настроить GitHub Actions для автоматического тестирования',
        completed: 0,
        priority: 0,
        due_date: '2026-10-15',
        user_id: 2
    },
    {
        title: 'Выгрузить проект на GitHub',
        description: 'Залить код в публичный репозиторий и поделиться ссылкой',
        completed: 0,
        priority: 2,
        due_date: '2026-08-01',
        user_id: 1
    }
    ];

    for (const todo of todos) {
        const info = insert.run({
            $title: todo.title,
            $description: todo.description || null,
            $completed: todo.completed,
            $priority: todo.priority,
            $due_date: todo.due_date || null,
            $user_id: todo.user_id || null
        });
        console.log(`✅ Добавлена задача: ${todo.title} (ID: ${info.lastInsertRowid})`);
    }
}

export { addSeeds }; 