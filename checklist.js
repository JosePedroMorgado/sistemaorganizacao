document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do Menu Lateral ---
    const sideMenu = document.getElementById('side-menu');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mainContent = document.querySelector('.main-content');
    let overlay = null; 

    // --- Elementos do Formulário de Tarefas ---
    const taskForm = document.getElementById('task-form');
    const taskIdInput = document.getElementById('task-id');
    const taskTextInput = document.getElementById('task-text');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Elementos da Lista de Tarefas ---
    const taskList = document.getElementById('task-list');
    const emptyListMessage = document.getElementById('empty-list-message'); 

    // --- Elementos de Filtro e Ações ---
    const filterPendingBtn = document.getElementById('filter-pending');
    const filterCompletedBtn = document.getElementById('filter-completed');
    const filterNegativeBtn = document.getElementById('filter-negative');
    const clearFinishedBtn = document.getElementById('clear-finished-btn'); // Atualizado

    const LOCAL_STORAGE_KEY = 'checklistTasks';
    let tasks = [];
    let currentFilter = 'pending'; // Agora o padrão é 'pending'

    // --- Funções de Persistência ---
    function saveTasks() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
        let parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
        
        // Migração automática de dados antigos
        tasks = parsedTasks.map(task => {
            if (task.status === undefined) {
                return { ...task, status: task.completed ? 'completed' : 'pending' };
            }
            return task;
        });
    }

    // --- Funções do Menu Lateral ---
    function openMenu() {
        sideMenu.classList.add('open');
        menuToggleBtn.classList.add('menu-open'); 
        if (window.innerWidth > 768) { 
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
        } else { 
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.classList.add('overlay');
                document.body.appendChild(overlay);
                overlay.addEventListener('click', closeMenu); 
            }
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        }
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        menuToggleBtn.classList.remove('menu-open'); 
        mainContent.style.marginLeft = '0'; 
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; 
        }
    }

    // --- Funções de Renderização ---
    function renderTasks() {
        taskList.innerHTML = ''; 

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return task.status === 'pending';
            if (currentFilter === 'completed') return task.status === 'completed';
            if (currentFilter === 'negative') return task.status === 'negative';
            return false; 
        });

        if (filteredTasks.length === 0) {
            emptyListMessage.classList.remove('hidden');
        } else {
            emptyListMessage.classList.add('hidden');
        }

        filteredTasks.forEach(task => {
            const card = document.createElement('div');
            card.classList.add('task-card');
            
            if (task.status === 'completed') card.classList.add('completed');
            if (task.status === 'negative') card.classList.add('negative');

            const taskTextElement = document.createElement('p');
            taskTextElement.classList.add('task-card-text');
            taskTextElement.textContent = task.text;

            const taskActions = document.createElement('div');
            taskActions.classList.add('task-card-actions');

            if (task.status === 'pending') {
                const completeBtn = document.createElement('button');
                completeBtn.classList.add('action-btn', 'complete-btn');
                completeBtn.title = 'Marcar como Concluída';
                completeBtn.innerHTML = '<i class="fas fa-check"></i>';
                completeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    changeTaskStatus(task.id, 'completed');
                });
                taskActions.appendChild(completeBtn);

                const negativeBtn = document.createElement('button');
                negativeBtn.classList.add('action-btn', 'negative-btn');
                negativeBtn.title = 'Marcar como Não Realizada';
                negativeBtn.innerHTML = '<i class="fas fa-times"></i>';
                negativeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    changeTaskStatus(task.id, 'negative');
                });
                taskActions.appendChild(negativeBtn);
            } else {
                const undoBtn = document.createElement('button');
                undoBtn.classList.add('action-btn', 'undo-btn');
                undoBtn.title = 'Voltar para Pendente';
                undoBtn.innerHTML = '<i class="fas fa-undo"></i>';
                undoBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    changeTaskStatus(task.id, 'pending');
                });
                taskActions.appendChild(undoBtn);
            }

            const editButton = document.createElement('button');
            editButton.classList.add('action-btn', 'edit-btn');
            editButton.title = 'Editar Tarefa';
            editButton.innerHTML = '<i class="fas fa-pen"></i>';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                editTask(task.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('action-btn', 'delete-btn');
            deleteButton.title = 'Excluir Tarefa';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });

            taskActions.appendChild(editButton);
            taskActions.appendChild(deleteButton);

            card.appendChild(taskTextElement); 
            card.appendChild(taskActions);     

            taskList.appendChild(card);
        });
    }

    // --- Funções de Ação ---
    function addTask(text) {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        tasks.push({ id: newId, text, status: 'pending' });
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

    function changeTaskStatus(id, newStatus) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            saveTasks();
            renderTasks();
        }
    }

    // Função de limpeza atualizada para remover Concluídas E Não Realizadas
    function clearFinishedTasks() {
        if (confirm('Tem certeza que deseja remover TODAS as tarefas finalizadas (Concluídas e Não Realizadas)?')) {
            // Mantém no array apenas o que estiver pendente
            tasks = tasks.filter(task => task.status === 'pending');
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
        filterPendingBtn.classList.remove('active');
        filterCompletedBtn.classList.remove('active');
        filterNegativeBtn.classList.remove('active');
        
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

    filterPendingBtn.addEventListener('click', () => setFilter('pending'));
    filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
    filterNegativeBtn.addEventListener('click', () => setFilter('negative'));
    clearFinishedBtn.addEventListener('click', clearFinishedTasks); // Listener atualizado

    menuToggleBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sideMenu.classList.contains('open')) {
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
            menuToggleBtn.classList.add('menu-open');
            if (overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        } else if (window.innerWidth <= 768 && sideMenu.classList.contains('open')) {
            mainContent.style.marginLeft = '0'; 
            menuToggleBtn.classList.remove('menu-open');
        }
    });
  
    // --- Inicialização ---
    loadTasks();
    renderTasks();
});
