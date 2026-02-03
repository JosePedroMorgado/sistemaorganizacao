document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do Menu Lateral ---
    const sideMenu = document.getElementById('side-menu');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mainContent = document.querySelector('.main-content');
    let overlay = null; // Será criado dinamicamente

    // --- Elementos do Formulário de Tarefas ---
    const taskForm = document.getElementById('task-form');
    const taskIdInput = document.getElementById('task-id');
    const taskTextInput = document.getElementById('task-text');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Elementos da Lista de Tarefas ---
    const taskList = document.getElementById('task-list');
    const emptyListMessage = document.getElementById('empty-list-message'); // Corrigido

    // --- Elementos de Filtro e Ações ---
    const filterAllBtn = document.getElementById('filter-all');
    const filterPendingBtn = document.getElementById('filter-pending');
    const filterCompletedBtn = document.getElementById('filter-completed');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    const LOCAL_STORAGE_KEY = 'checklistTasks';
    let tasks = [];
    let currentFilter = 'all'; // 'all', 'pending', 'completed'

    // --- Funções de Persistência ---
    function saveTasks() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
    }

    // --- Funções do Menu Lateral ---
    function openMenu() {
        sideMenu.classList.add('open');
        menuToggleBtn.classList.add('menu-open'); // Adiciona a classe para mover o botão
        if (window.innerWidth > 768) { // Em telas grandes, empurra o conteúdo
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
        } else { // Em telas pequenas, cria um overlay
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.classList.add('overlay');
                document.body.appendChild(overlay);
                overlay.addEventListener('click', closeMenu); // Clicar no overlay fecha o menu
            }
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede scroll do body
        }
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        menuToggleBtn.classList.remove('menu-open'); // Remove a classe para retornar o botão
        mainContent.style.marginLeft = '0'; // Volta o conteúdo para a posição original
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restaura scroll do body
        }
    }

    // --- Funções de Renderização ---
    function renderTasks() {
        taskList.innerHTML = ''; // Limpa a lista antes de renderizar

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'
        });

        if (filteredTasks.length === 0) {
            emptyListMessage.classList.remove('hidden');
        } else {
            emptyListMessage.classList.add('hidden');
        }

        filteredTasks.forEach(task => {
            const listItem = document.createElement('li');

            const taskContent = document.createElement('div');
            taskContent.classList.add('task-content');
            taskContent.addEventListener('click', () => toggleTaskCompletion(task.id));

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                toggleTaskCompletion(task.id);
            });

            const taskTextSpan = document.createElement('span');
            taskTextSpan.classList.add('task-text');
            taskTextSpan.textContent = task.text;
            if (task.completed) {
                taskTextSpan.classList.add('completed');
            }

            taskContent.appendChild(checkbox);
            taskContent.appendChild(taskTextSpan);

            const taskActions = document.createElement('div');
            taskActions.classList.add('task-actions');

            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                editTask(task.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });

            taskActions.appendChild(editButton);
            taskActions.appendChild(deleteButton);

            listItem.appendChild(taskContent);
            listItem.appendChild(taskActions);
            taskList.appendChild(listItem);
        });
    }

    // --- Funções de Ação ---
    function addTask(text) {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        tasks.push({ id: newId, text, completed: false });
        saveTasks();
        renderTasks();
    }

    function updateTask(id, newText) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].text = newText;
            saveTasks();
            renderTasks();
        }
    }

    function editTask(id) {
        const taskToEdit = tasks.find(task => task.id === id);
        if (taskToEdit) {
            taskIdInput.value = taskToEdit.id;
            taskTextInput.value = taskToEdit.text;
            submitBtn.textContent = 'Salvar Edição';
            cancelEditBtn.classList.remove('hidden');
        }
    }

    function deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            resetForm();
        }
    }

    function toggleTaskCompletion(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
        }
    }

    function clearCompletedTasks() {
        if (confirm('Tem certeza que deseja remover todas as tarefas concluídas?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }
    }

    function resetForm() {
        taskForm.reset();
        taskIdInput.value = '';
        submitBtn.textContent = 'Adicionar Tarefa';
        cancelEditBtn.classList.add('hidden');
    }

    function setFilter(filter) {
        currentFilter = filter;
        filterAllBtn.classList.remove('active');
        filterPendingBtn.classList.remove('active');
        filterCompletedBtn.classList.remove('active');
        document.getElementById(`filter-${filter}`).classList.add('active');
        renderTasks();
    }

    // --- Event Listeners ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskTextInput.value.trim();
        if (text) {
            const id = taskIdInput.value;
            if (id) {
                updateTask(parseInt(id), text);
            } else {
                addTask(text);
            }
            resetForm();
        }
    });

    cancelEditBtn.addEventListener('click', resetForm);

    filterAllBtn.addEventListener('click', () => setFilter('all'));
    filterPendingBtn.addEventListener('click', () => setFilter('pending'));
    filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // Event listeners para o menu lateral
    menuToggleBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);

    // Fecha o menu se a tela for redimensionada para desktop enquanto o menu estiver aberto
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sideMenu.classList.contains('open')) {
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
            // Garante que o botão se mova para a posição correta em desktop
            menuToggleBtn.classList.add('menu-open');
            if (overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        } else if (window.innerWidth <= 768 && sideMenu.classList.contains('open')) {
            mainContent.style.marginLeft = '0'; // Garante que o conteúdo não seja empurrado em mobile
            // Garante que o botão volte para a posição original em mobile
            menuToggleBtn.classList.remove('menu-open');
        }
    });
  
    // --- Inicialização ---
    loadTasks();
    renderTasks();
});
