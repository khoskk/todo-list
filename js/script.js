function showPage() {
  document.body.style.visibility = '';
}

const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'css/style.css';

document.body.style.visibility = 'hidden';
styleLink.addEventListener('load', showPage);
styleLink.addEventListener('error', showPage);
document.head.append(styleLink);

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) {
    el.textContent = text;
  }
  return el;
}

function createButton(className, text) {
  const button = createEl('button', className, text);
  button.type = 'button';
  return button;
}

const filters = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'done', label: 'Выполненные' }
];

const sorts = [
  { value: 'asc', label: 'сначала ранние' },
  { value: 'desc', label: 'сначала поздние' }
];

const header = createEl('header', 'site-header');
const headerInner = createEl('div', 'container header-inner');
headerInner.append(
  createEl('h1', 'site-title', 'Список дел'),
  createEl('p', 'lead', 'Добавляйте задачи, отмечайте выполненные и меняйте порядок перетаскиванием.')
);
header.append(headerInner);

const taskInput = createEl('input', 'field-input');
taskInput.type = 'text';
taskInput.id = 'task-input';
taskInput.placeholder = 'Что нужно сделать';
taskInput.required = true;

const taskLabel = createEl('label', 'field-label', 'Задача');
taskLabel.htmlFor = 'task-input';

const taskField = createEl('div', 'field');
taskField.append(taskLabel, taskInput);

const dateInput = createEl('input', 'field-input');
dateInput.type = 'date';
dateInput.id = 'date-input';

const dateLabel = createEl('label', 'field-label', 'Срок');
dateLabel.htmlFor = 'date-input';

const dateField = createEl('div', 'field');
dateField.append(dateLabel, dateInput);

const addButton = createEl('button', 'btn btn-primary add-btn', 'Добавить');
addButton.type = 'submit';

const addForm = createEl('form', 'add-form');
addForm.append(taskField, dateField, addButton);

const addSection = createEl('section', 'add-section');
addSection.append(createEl('h2', 'section-title', 'Новая задача'), addForm);

const searchInput = createEl('input', 'field-input search-input');
searchInput.type = 'search';
searchInput.placeholder = 'Поиск по названию или дате';

const filterGroup = createEl('div', 'filter-group');
filters.forEach((filter) => {
  const button = createButton('btn btn-outline filter-btn', filter.label);
  button.dataset.filter = filter.value;
  filterGroup.append(button);
});
filterGroup.firstElementChild.classList.add('active');

const sortGroup = createEl('div', 'sort-group');
sortGroup.append(createEl('span', 'sort-label', 'Сортировка по дате:'));
sorts.forEach((sort) => {
  const button = createButton('btn btn-outline sort-btn', sort.label);
  button.dataset.sort = sort.value;
  sortGroup.append(button);
});

const toolbar = createEl('div', 'toolbar');
toolbar.append(searchInput, filterGroup, sortGroup);

const taskList = createEl('ul', 'task-list');
const emptyMessage = createEl('p', 'empty-message', 'Задач пока нет');

const listSection = createEl('section', 'list-section');
listSection.append(createEl('h2', 'section-title', 'Задачи'), toolbar, taskList, emptyMessage);

const main = createEl('main', 'container');
main.append(addSection, listSection);

document.body.append(header, main);

const storageKey = 'todo-tasks';

let tasks = loadTasks();
let editId = null;
let currentFilter = 'all';
let searchText = '';
let draggedItem = null;

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved.filter((task) => {
      return typeof task.id === 'number' && typeof task.text === 'string' &&
        typeof task.date === 'string' && typeof task.done === 'boolean';
    });
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function formatDate(date) {
  return date.split('-').reverse().join('.');
}

function getTaskId(element) {
  return Number(element.closest('.task').dataset.id);
}

function findTask(id) {
  return tasks.find((task) => task.id === id);
}

function createTaskItem(task) {
  const check = createEl('input', 'task-check');
  check.type = 'checkbox';
  check.title = 'Выполнено';
  check.checked = task.done;

  const text = createEl('p', 'task-text', task.text);

  let date;
  if (task.date === '') {
    date = createEl('span', 'task-date', 'без срока');
  } else {
    date = createEl('time', 'task-date', formatDate(task.date));
    date.dateTime = task.date;
  }

  const body = createEl('div', 'task-body');
  body.append(text, date);

  const editButton = createButton('btn btn-outline task-btn', 'Изменить');
  editButton.dataset.action = 'edit';

  const deleteButton = createButton('btn btn-outline task-btn', 'Удалить');
  deleteButton.dataset.action = 'delete';

  const actions = createEl('div', 'task-actions');
  actions.append(editButton, deleteButton);

  const li = createEl('li', 'task');
  li.draggable = true;
  if (task.done) {
    li.classList.add('done');
  }
  li.dataset.id = task.id;
  li.append(check, body, actions);
  return li;
}

function createEditItem(task) {
  const editText = createEl('input', 'field-input edit-text');
  editText.type = 'text';
  editText.value = task.text;
  editText.required = true;

  const editDate = createEl('input', 'field-input edit-date');
  editDate.type = 'date';
  editDate.value = task.date;

  const saveButton = createEl('button', 'btn btn-primary task-btn', 'Сохранить');
  saveButton.type = 'submit';

  const cancelButton = createButton('btn btn-outline task-btn', 'Отмена');
  cancelButton.dataset.action = 'cancel';

  const form = createEl('form', 'edit-form');
  form.append(editText, editDate, saveButton, cancelButton);

  const li = createEl('li', 'task editing');
  li.dataset.id = task.id;
  li.append(form);
  return li;
}

function sortTasks(direction) {
  const withDate = tasks.filter((task) => task.date !== '');
  const withoutDate = tasks.filter((task) => task.date === '');

  withDate.sort((a, b) => {
    if (direction === 'asc') {
      return a.date.localeCompare(b.date);
    }
    return b.date.localeCompare(a.date);
  });

  tasks = withDate.concat(withoutDate);
}

function getVisibleTasks() {
  return tasks.filter((task) => {
    if (currentFilter === 'active' && task.done) {
      return false;
    }
    if (currentFilter === 'done' && !task.done) {
      return false;
    }
    return task.text.toLowerCase().includes(searchText) || formatDate(task.date).includes(searchText);
  });
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.textContent = '';

  visibleTasks.forEach((task) => {
    if (task.id === editId) {
      taskList.append(createEditItem(task));
    } else {
      taskList.append(createTaskItem(task));
    }
  });

  if (tasks.length === 0) {
    emptyMessage.textContent = 'Задач пока нет';
  } else {
    emptyMessage.textContent = 'Ничего не найдено';
  }
  emptyMessage.hidden = visibleTasks.length > 0;
}

addForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (text === '') {
    taskInput.value = '';
    taskInput.reportValidity();
    return;
  }
  tasks.push({ id: Date.now(), text: text, date: dateInput.value, done: false });
  addForm.reset();
  taskInput.focus();
  saveTasks();
  renderTasks();
});

taskList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }
  const id = getTaskId(button);
  const action = button.dataset.action;

  if (action === 'delete') {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
  } else if (action === 'edit') {
    editId = id;
  } else if (action === 'cancel') {
    editId = null;
  }
  renderTasks();

  if (action === 'edit') {
    taskList.querySelector('.edit-text').focus();
  }
});

taskList.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const textField = form.querySelector('.edit-text');
  const text = textField.value.trim();
  if (text === '') {
    textField.value = '';
    textField.reportValidity();
    return;
  }
  const task = findTask(getTaskId(form));
  task.text = text;
  task.date = form.querySelector('.edit-date').value;
  editId = null;
  saveTasks();
  renderTasks();
});

taskList.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && event.target.closest('.edit-form')) {
    editId = null;
    renderTasks();
  }
});

taskList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.task-check');
  if (!checkbox) {
    return;
  }
  findTask(getTaskId(checkbox)).done = checkbox.checked;
  saveTasks();
  renderTasks();
});

filterGroup.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) {
    return;
  }
  currentFilter = button.dataset.filter;
  filterGroup.querySelector('.active').classList.remove('active');
  button.classList.add('active');
  renderTasks();
});

searchInput.addEventListener('input', () => {
  searchText = searchInput.value.trim().toLowerCase();
  renderTasks();
});

sortGroup.addEventListener('click', (event) => {
  const button = event.target.closest('[data-sort]');
  if (!button) {
    return;
  }
  sortTasks(button.dataset.sort);
  saveTasks();
  renderTasks();
});

taskList.addEventListener('dragstart', (event) => {
  const item = event.target;
  if (!item.draggable) {
    return;
  }
  draggedItem = item;
  item.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', item.dataset.id);
});

taskList.addEventListener('dragover', (event) => {
  if (!draggedItem) {
    return;
  }
  event.preventDefault();
  const target = event.target.closest('.task');
  if (!target || target === draggedItem) {
    return;
  }
  const rect = target.getBoundingClientRect();
  if (event.clientY < rect.top + rect.height / 2) {
    taskList.insertBefore(draggedItem, target);
  } else {
    taskList.insertBefore(draggedItem, target.nextElementSibling);
  }
});

taskList.addEventListener('drop', (event) => {
  event.preventDefault();
});

taskList.addEventListener('dragend', () => {
  if (!draggedItem) {
    return;
  }
  draggedItem.classList.remove('dragging');
  draggedItem = null;

  const orderedTasks = [];
  taskList.querySelectorAll('.task').forEach((item) => {
    orderedTasks.push(findTask(getTaskId(item)));
  });
  let position = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (orderedTasks.includes(tasks[i])) {
      tasks[i] = orderedTasks[position];
      position++;
    }
  }
  saveTasks();
  renderTasks();
});

renderTasks();
