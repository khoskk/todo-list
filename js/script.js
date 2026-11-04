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
searchInput.placeholder = 'Поиск по названию';

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
