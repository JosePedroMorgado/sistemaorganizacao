document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_STORAGE_KEY = 'agendaActivities';
    let activities = [];

    // --- Elementos do DOM ---
    const activityForm = document.getElementById('activity-form');
    const activitiesTableBody = document.querySelector('#activities-table tbody');

    // Elementos do formulário
    const activityIdInput = document.getElementById('activity-id');
    const activityDateInput = document.getElementById('activity-date');
    const activityAreaInput = document.getElementById('activity-area');
    const activityNameInput = document.getElementById('activity-name');
    const activityStageInput = document.getElementById('activity-stage');
    const activityDescriptionInput = document.getElementById('activity-description');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Elementos de filtro
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const filterArea = document.getElementById('filter-area');
    const filterActivity = document.getElementById('filter-activity');
    const filterStage = document.getElementById('filter-stage');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    // Elementos das seções e botões de alternância
    const filterSection = document.querySelector('.filter-section');
    const formSection = document.querySelector('.form-section');
    const toggleFilterBtn = document.getElementById('toggle-filter-btn');
    const toggleAddBtn = document.getElementById('toggle-add-btn');

    // Elementos de Paginação
    const recordsPerPageSelect = document.getElementById('records-per-page-select');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageNumbersDiv = document.getElementById('page-numbers');
    let currentPage = 1;
    let recordsPerPage = parseInt(recordsPerPageSelect.value);

    // Elementos do Menu Lateral
    const sideMenu = document.getElementById('side-menu');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mainContent = document.querySelector('.main-content');
    let overlay = document.querySelector('.overlay'); // Pode ser null se não existir no HTML ainda

    // Modal de Visualização (ADICIONAR após as outras declarações)
    const viewActivityModal = document.getElementById('view-activity-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalEditBtn = document.getElementById('modal-edit-btn');
    const modalDeleteBtn = document.getElementById('modal-delete-btn');

    const viewActivityId = document.getElementById('view-activity-id');
    const viewActivityDate = document.getElementById('view-activity-date');
    const viewActivityArea = document.getElementById('view-activity-area');
    const viewActivityName = document.getElementById('view-activity-name');
    const viewActivityStage = document.getElementById('view-activity-stage');
    const viewActivityDescription = document.getElementById('view-activity-description');


    // Se o overlay não existir, cria um (para garantir compatibilidade)
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);
    }

    // --- Funções de Persistência ---
    function saveActivities() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activities));
    }

    function loadActivities() {
        const storedActivities = localStorage.getItem(LOCAL_STORAGE_KEY);
        console.log("Conteúdo bruto do localStorage:", storedActivities); // Para debug
        if (storedActivities) {
            try {
                activities = JSON.parse(storedActivities);
                console.log("Atividades carregadas:", activities); // Para debug
            } catch (e) {
                console.error("Erro ao parsear atividades do localStorage:", e);
                activities = []; // Se houver erro, inicializa vazio para evitar quebrar a aplicação
            }
        } else {
            activities = [];
            console.log("Nenhuma atividade encontrada no localStorage, inicializando com array vazio."); // Para debug
        }
    }

    // --- Funções do Menu Lateral ---
    function openMenu() {
        sideMenu.classList.add('open');
        menuToggleBtn.classList.add('menu-open');
        if (window.innerWidth <= 768) { // Apenas em telas pequenas
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede scroll do body
        } else { // Em telas grandes, empurra o conteúdo
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
        }
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        menuToggleBtn.classList.remove('menu-open');
        mainContent.style.marginLeft = '0'; // Volta o conteúdo para a posição original
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restaura scroll do body
        }
    }

    // --- Funções Auxiliares ---
    function formatDateToBR(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    function populateFilterSelects() {
        const currentArea = filterArea.value;
        const currentActivity = filterActivity.value;
        const currentStage = filterStage.value;

        filterArea.innerHTML = '<option value="">Todas as Áreas</option>';
        filterActivity.innerHTML = '<option value="">Todas as Atividades</option>';
        filterStage.innerHTML = '<option value="">Todas as Etapas</option>';

        const areas = [...new Set(activities.map(a => a.area))].sort();
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            filterArea.appendChild(option);
        });
        if (currentArea && areas.includes(currentArea)) {
            filterArea.value = currentArea;
        }

        const filteredByArea = currentArea ? activities.filter(a => a.area === currentArea) : activities;
        const activitiesOptions = [...new Set(filteredByArea.map(a => a.atividade))].sort();
        activitiesOptions.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity;
            option.textContent = activity;
            filterActivity.appendChild(option);
        });
        if (currentActivity && activitiesOptions.includes(currentActivity)) {
            filterActivity.value = currentActivity;
        }

        const filteredByActivity = currentActivity ? filteredByArea.filter(a => a.atividade === currentActivity) : filteredByArea;
        const stages = [...new Set(filteredByActivity.map(a => a.etapa))].sort();
        stages.forEach(stage => {
            const option = document.createElement('option');
            option.value = stage;
            option.textContent = stage;
            filterStage.appendChild(option);
        });
        if (currentStage && stages.includes(currentStage)) {
            filterStage.value = currentStage;
        }
    }

    // --- Funções de Renderização ---
    function renderPaginationButtons(totalRecords) {
        pageNumbersDiv.innerHTML = ''; // Limpa os botões de página existentes
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        if (totalRecords === 0) {
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            return;
        }

        // Garante que currentPage não exceda totalPages
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        if (currentPage < 1) {
            currentPage = 1;
        }

        // Botões numéricos
        const maxPageButtons = 5; // Número máximo de botões de página visíveis
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('page-number');
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderActivities();
            });
            pageNumbersDiv.appendChild(pageButton);
        }

        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    function renderActivities() {
        activitiesTableBody.innerHTML = '';

        const startDate = filterStartDate.value ? new Date(filterStartDate.value + 'T00:00:00') : null;
        const endDate = filterEndDate.value ? new Date(filterEndDate.value + 'T23:59:59') : null;
        const selectedArea = filterArea.value;
        const selectedActivity = filterActivity.value;
        const selectedStage = filterStage.value;

        const filteredActivities = activities.filter(activity => {
            const activityDate = new Date(activity.data + 'T00:00:00');

            if (startDate && activityDate < startDate) return false;
            if (endDate && activityDate > endDate) return false;
            if (selectedArea && activity.area !== selectedArea) return false;
            if (selectedActivity && activity.atividade !== selectedActivity) return false;
            if (selectedStage && activity.etapa !== selectedStage) return false;

            return true;
        });

        // Ordenar por ID em ordem decrescente (mais recente primeiro)
        filteredActivities.sort((a, b) => b.id - a.id);

        // Aplicar Paginação
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

        if (paginatedActivities.length === 0 && filteredActivities.length > 0 && currentPage > 1) {
            // Se a página atual ficou vazia após filtros/exclusão, volta para a anterior
            currentPage = Math.max(1, currentPage - 1);
            renderActivities(); // Renderiza novamente com a página ajustada
            return;
        }
        if (paginatedActivities.length === 0 && filteredActivities.length === 0) {
            // Se não há atividades filtradas, exibe mensagem
            const row = activitiesTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7; // Cobre todas as colunas
            cell.textContent = 'Nenhuma atividade encontrada.';
            cell.style.textAlign = 'center';
        }


paginatedActivities.forEach(activity => {
    const row = activitiesTableBody.insertRow();
    row.insertCell().textContent = activity.id;
    row.insertCell().textContent = formatDateToBR(activity.data);
    row.insertCell().textContent = activity.area;
    row.insertCell().textContent = activity.atividade;
    row.insertCell().textContent = activity.etapa;

        // Limita a descrição a 50 caracteres
        const descriptionCell = row.insertCell();
        const maxLength = 50;
        const descriptionText = activity.descricao.replace(/\n/g, ' ');
        if (descriptionText.length > maxLength) {
            descriptionCell.textContent = descriptionText.substring(0, maxLength) + '...';
            descriptionCell.title = descriptionText; // Tooltip com descrição completa
        } else {
            descriptionCell.textContent = descriptionText;
        }

        const actionsCell = row.insertCell();
        actionsCell.classList.add('action-buttons');

        // Botão Visualizar
        const viewButton = document.createElement('button');
        viewButton.textContent = 'Visualizar';
        viewButton.classList.add('view-btn');
        viewButton.addEventListener('click', function() {
            openViewModal(activity.id);
        });
        actionsCell.appendChild(viewButton);

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.classList.add('edit-btn');
        editButton.addEventListener('click', () => editActivity(activity.id));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => deleteActivity(activity.id));
        actionsCell.appendChild(deleteButton);
    });


        renderPaginationButtons(filteredActivities.length); // Atualiza os botões de paginação
    }

    // --- Funções de Ação ---
    function editActivity(id) {
        const activityToEdit = activities.find(activity => activity.id === id);
        if (activityToEdit) {
            activityIdInput.value = activityToEdit.id;
            activityDateInput.value = activityToEdit.data;
            activityAreaInput.value = activityToEdit.area;
            activityNameInput.value = activityToEdit.atividade;
            activityStageInput.value = activityToEdit.etapa;
            activityDescriptionInput.value = activityToEdit.descricao;

            submitBtn.textContent = 'Salvar Edição';
            cancelEditBtn.classList.remove('hidden');

            toggleSectionVisibility(formSection, toggleAddBtn, true); // Força a abertura do formulário
        }
    }

    function deleteActivity(id) {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            activities = activities.filter(activity => activity.id !== id);
            saveActivities();
            populateFilterSelects();
            renderActivities(); // Re-renderiza para ajustar paginação e filtros
            resetForm();
        }
    }

    function resetForm() {
        activityForm.reset();
        activityIdInput.value = '';
        submitBtn.textContent = 'Adicionar Atividade';
        cancelEditBtn.classList.add('hidden');
    }

    function toggleSectionVisibility(sectionToToggle, buttonToToggle, forceOpen = false) {
        const isCurrentlyVisible = !sectionToToggle.classList.contains('hidden-section');

        if (isCurrentlyVisible && !forceOpen) {
            sectionToToggle.classList.add('hidden-section');
            buttonToToggle.classList.remove('active');
            return;
        }

        filterSection.classList.add('hidden-section');
        formSection.classList.add('hidden-section');

        toggleFilterBtn.classList.remove('active');
        toggleAddBtn.classList.remove('active');

        sectionToToggle.classList.remove('hidden-section');
        buttonToToggle.classList.add('active');
    }

    // --- Funções do Modal de Visualização ---
    function openViewModal(id) {
        const activity = activities.find(function(a) {
            return a.id === id;
        });
        if (activity) {
            viewActivityId.value = activity.id;
            viewActivityDate.value = formatDateToBR(activity.data);
            viewActivityArea.value = activity.area;
            viewActivityName.value = activity.atividade;
            viewActivityStage.value = activity.etapa;
            viewActivityDescription.value = activity.descricao;

            modalEditBtn.dataset.activityId = id;
            modalDeleteBtn.dataset.activityId = id;

            viewActivityModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeViewModal() {
        viewActivityModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    
    // --- Event Listeners ---
    activityForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = activityIdInput.value;
        const newActivityData = {
            data: activityDateInput.value,
            area: activityAreaInput.value,
            atividade: activityNameInput.value,
            etapa: activityStageInput.value,
            descricao: activityDescriptionInput.value
        };

        if (id) {
            const index = activities.findIndex(activity => activity.id === parseInt(id));
            if (index !== -1) {
                activities[index] = { ...activities[index], ...newActivityData };
            }
        } else {
            const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
            activities.push({ id: newId, ...newActivityData });
        }

        saveActivities();
        populateFilterSelects();
        currentPage = 1; // Volta para a primeira página ao adicionar/editar
        renderActivities();
        resetForm();
        formSection.classList.add('hidden-section');
        toggleAddBtn.classList.remove('active');
    });

    cancelEditBtn.addEventListener('click', () => {
        resetForm();
        formSection.classList.add('hidden-section');
        toggleAddBtn.classList.remove('active');
    });

    toggleFilterBtn.addEventListener('click', () => toggleSectionVisibility(filterSection, toggleFilterBtn));
    toggleAddBtn.addEventListener('click', () => toggleSectionVisibility(formSection, toggleAddBtn));

    filterArea.addEventListener('change', () => {
        currentPage = 1;
        populateFilterSelects();
        renderActivities();
    });
    filterActivity.addEventListener('change', () => {
        currentPage = 1;
        populateFilterSelects();
        renderActivities();
    });
    filterStartDate.addEventListener('change', () => {
        currentPage = 1;
        renderActivities();
    });
    filterEndDate.addEventListener('change', () => {
        currentPage = 1;
        renderActivities();
    });
    filterStage.addEventListener('change', () => {
        currentPage = 1;
        renderActivities();
    });

    clearFiltersBtn.addEventListener('click', () => {
        filterStartDate.value = '';
        filterEndDate.value = '';
        filterArea.value = '';
        filterActivity.value = '';
        filterStage.value = '';
        currentPage = 1;
        populateFilterSelects();
        renderActivities();
    });

    recordsPerPageSelect.addEventListener('change', () => {
        recordsPerPage = parseInt(recordsPerPageSelect.value);
        currentPage = 1;
        renderActivities();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderActivities();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalFilteredRecords = activities.filter(activity => {
            const startDate = filterStartDate.value ? new Date(filterStartDate.value + 'T00:00:00') : null;
            const endDate = filterEndDate.value ? new Date(filterEndDate.value + 'T23:59:59') : null;
            const selectedArea = filterArea.value;
            const selectedActivity = filterActivity.value;
            const selectedStage = filterStage.value;
            const activityDate = new Date(activity.data + 'T00:00:00');

            if (startDate && activityDate < startDate) return false;
            if (endDate && activityDate > endDate) return false;
            if (selectedArea && activity.area !== selectedArea) return false;
            if (selectedActivity && activity.atividade !== selectedActivity) return false;
            if (selectedStage && activity.etapa !== selectedStage) return false;
            return true;
        }).length;
        const totalPages = Math.ceil(totalFilteredRecords / recordsPerPage);

        if (currentPage < totalPages) {
            currentPage++;
            renderActivities();
        }
    });

    // Event listeners para o menu lateral
    menuToggleBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu); // Fecha o menu ao clicar no overlay

    // Fecha o menu se a tela for redimensionada para desktop enquanto o menu estiver aberto
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sideMenu.classList.contains('open')) {
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
            menuToggleBtn.classList.add('menu-open');
            if (overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        } else if (window.innerWidth <= 768 && sideMenu.classList.contains('open')) {
            mainContent.style.marginLeft = '0'; // Garante que o conteúdo não seja empurrado em mobile
            menuToggleBtn.classList.remove('menu-open');
        }
    });

    // Event listeners para o modal (ADICIONAR)
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeViewModal);
    }
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeViewModal);
    }
    if (modalEditBtn) {
        modalEditBtn.addEventListener('click', function() {
            const activityId = parseInt(modalEditBtn.dataset.activityId);
            closeViewModal();
            editActivity(activityId);
        });
    }
    if (modalDeleteBtn) {
        modalDeleteBtn.addEventListener('click', function() {
            const activityId = parseInt(modalDeleteBtn.dataset.activityId);
            deleteActivity(activityId);
        });
    }

    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === viewActivityModal) {
            closeViewModal();
        }
    });


    // --- Inicialização ---
    loadActivities();
    populateFilterSelects();
    renderActivities();
});
