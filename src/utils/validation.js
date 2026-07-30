// Валидация входных параметров задачи
function validateTodo(data) {
    const errors = [];

    // title
    if (!data.title || data.title.trim() === "") {
        errors.push( {field: 'title', message: 'Заголовок обязателен.'} );
    } else if (data.title.length > 100 ) {
        errors.push({ field: 'title', message: 'Заголовок не должен привышать 100 символов.'});
    }

    // description
    if ( data.description && data.description.length > 500 ) {
        errors.push({ field: 'description', message: 'Описание не может привышать 500 символов.'});
    }

    // comleted
    if ( data.completed !== undefined && typeof data.competed !== 'boolean') {
        errors.push({field: 'completed', message: "Поле completed должно быть true или false"});
    }

    // Priority
    if ( data.priority !== undefined) {
        const priority = Number(data.priority);
        if (isNaN(priority) || priority < 0 || priority > 3 ) {
            errors.push({field: 'priority', message: 'поле priority должно быть больше 0 меньше 3. '})
        }
    }

    // due_data
    if (data.due_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.due_date)) {
            errors.push({ field: 'due_date', message: 'Дата должна быть в формате YYYY-MM-DD' });
        }
    }

    return errors;
}

export { validateTodo }