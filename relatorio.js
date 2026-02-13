document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_STORAGE_KEY = 'meetingsApp.meetings';
    const LOCAL_STORAGE_AREAS_KEY = 'meetingsApp.areas';

    // --- Elementos do Menu Lateral ---
    const sideMenu = document.getElementById('side-menu');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.querySelector('.overlay');
    const mainContent = document.querySelector('.main-content');

    // --- Elementos da Seção de Botões de Alternância ---
    const toggleFilterBtn = document.getElementById('toggle-filter-btn');
    const toggleAddBtn = document.getElementById('toggle-add-btn');

    // --- Elementos das Seções ---
    const filterSection = document.querySelector('.filter-section');
    const formSection = document.querySelector('.form-section');
    const calendarSection = document.querySelector('.calendar-section'); // Nova seção
    const listSection = document.querySelector('.list-section');

    // --- Elementos do Formulário de Reuniões ---
    const meetingForm = document.getElementById('meeting-form');
    const meetingIdInput = document.getElementById('meeting-id');
    const meetingDateInput = document.getElementById('meeting-date');
    const meetingTimeInput = document.getElementById('meeting-time');
    const meetingTitleInput = document.getElementById('meeting-title');
    const meetingSubjectInput = document.getElementById('meeting-subject');
    const meetingParticipantsInput = document.getElementById('meeting-participants');
    const meetingAreaSelect = document.getElementById('meeting-area');
    const addAreaBtn = document.getElementById('add-area-btn'); // Botão para adicionar área
    const meetingLocalInput = document.getElementById('meeting-local');
    const meetingObservationsInput = document.getElementById('meeting-observations');
    const meetingStatusSelect = document.getElementById('meeting-status');
    const meetingNextStepsInput = document.getElementById('meeting-next-steps');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Elementos de Filtro ---
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const filterTitle = document.getElementById('filter-title');
    const filterSubject = document.getElementById('filter-subject');
    const filterParticipants = document.getElementById('filter-participants');
    const filterArea = document.getElementById('filter-area');
    const filterLocal = document.getElementById('filter-local');
    const filterStatus = document.getElementById('filter-status');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    // --- Elementos da Tabela de Reuniões ---
    const meetingsTableBody = document.querySelector('#meetings-table tbody');

    // --- Elementos de Paginação ---
    const recordsPerPageSelect = document.getElementById('records-per-page-select');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageNumbersDiv = document.getElementById('page-numbers');

    // --- Elementos do Modal de Visualização ---
    const meetingModal = document.getElementById('meeting-modal');
    const meetingModalBody = document.getElementById('meeting-modal-body');

    // --- Variáveis de Estado ---
    let meetings = [];
    let areas = []; // Array para armazenar as áreas
    let currentPage = 1;
    let recordsPerPage = parseInt(recordsPerPageSelect.value);
    let calendar; // Instância do FullCalendar

    // --- Funções do Menu Lateral ---
    function openMenu() {
        sideMenu.classList.add('open');
        if (window.innerWidth <= 768) { // Em mobile, o menu sobrepõe
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede scroll do body
        } else { // Em desktop, empurra o conteúdo
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
        }
        menuToggleBtn.classList.add('menu-open'); // Adiciona classe para mover o botão
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        menuToggleBtn.classList.remove('menu-open'); // Retorna o botão
        if (window.innerWidth <= 768) { // Apenas em mobile
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restaura scroll do body
        } else {
            mainContent.style.marginLeft = '0';
        }
    }

    // --- Funções de Persistência (localStorage) ---
    function saveMeetings() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meetings));
    }

    function loadMeetings() {
        const storedMeetings = localStorage.getItem(LOCAL_STORAGE_KEY);
        meetings = storedMeetings ? JSON.parse(storedMeetings) : [];
    }

    function saveAreas() {
        localStorage.setItem(LOCAL_STORAGE_AREAS_KEY, JSON.stringify(areas));
    }

    function loadAreas() {
        const storedAreas = localStorage.getItem(LOCAL_STORAGE_AREAS_KEY);
        areas = storedAreas ? JSON.parse(storedAreas) : ['Processos', 'Fiscal', 'Contábil', 'RH', 'TI', 'Comercial']; // Áreas padrão
    }

    // --- Funções Auxiliares ---
    function formatDateToBR(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    function toggleSectionVisibility(sectionToToggle, buttonToToggle, forceOpen = false) {
        const isCurrentlyVisible = !sectionToToggle.classList.contains('hidden-section');

        if (isCurrentlyVisible && !forceOpen) {
            sectionToToggle.classList.add('hidden-section');
            buttonToToggle.classList.remove('active');
            return;
        }

        // Oculta todas as seções de controle
        filterSection.classList.add('hidden-section');
        formSection.classList.add('hidden-section');

        // Desativa todos os botões de controle
        toggleFilterBtn.classList.remove('active');
        toggleAddBtn.classList.remove('active');

        // Mostra a seção desejada e ativa seu botão
        sectionToToggle.classList.remove('hidden-section');
        buttonToToggle.classList.add('active');
    }

    // --- Funções de População de Selects ---
    function populateAreaSelects() {
        // Popula o select do formulário
        meetingAreaSelect.innerHTML = '<option value="">Selecione ou Adicione</option>';
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            meetingAreaSelect.appendChild(option);
        });

        // Popula o select de filtro
        const currentFilterAreaValue = filterArea.value; // Salva o valor atual do filtro
        filterArea.innerHTML = '<option value="">Todas as Áreas</option>';
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            filterArea.appendChild(option);
        });
        filterArea.value = currentFilterAreaValue; // Restaura o valor do filtro
    }

    // --- Funções de Renderização ---
    function renderPaginationButtons(totalRecords) {
        pageNumbersDiv.innerHTML = '';
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }

        const maxPageButtons = 5;
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
                renderMeetings();
            });
            pageNumbersDiv.appendChild(pageButton);
        }

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    function renderMeetings() {
        meetingsTableBody.innerHTML = '';

        const filteredMeetings = meetings.filter(meeting => {
            const startDate = filterStartDate.value ? new Date(filterStartDate.value + 'T00:00:00') : null;
            const endDate = filterEndDate.value ? new Date(filterEndDate.value + 'T23:59:59') : null;
            const meetingDate = new Date(meeting.date + 'T00:00:00');

            if (startDate && meetingDate < startDate) return false;
            if (endDate && meetingDate > endDate) return false;
            if (filterTitle.value && !meeting.title.toLowerCase().includes(filterTitle.value.toLowerCase())) return false;
            if (filterSubject.value && !meeting.subject.toLowerCase().includes(filterSubject.value.toLowerCase())) return false;
            if (filterParticipants.value && !meeting.participants.toLowerCase().includes(filterParticipants.value.toLowerCase())) return false;
            if (filterArea.value && meeting.area !== filterArea.value) return false;
            if (filterLocal.value && !meeting.local.toLowerCase().includes(filterLocal.value.toLowerCase())) return false;
            if (filterStatus.value && meeting.status !== filterStatus.value) return false;

            return true;
        });

        // Ordenar por data e horário decrescente (mais recente primeiro)
        filteredMeetings.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
        });

        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);

        if (paginatedMeetings.length === 0 && filteredMeetings.length > 0 && currentPage > 1) {
            currentPage = Math.max(1, currentPage - 1);
            renderMeetings();
            return;
        }
        if (paginatedMeetings.length === 0 && filteredMeetings.length === 0) {
            const row = meetingsTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.textContent = 'Nenhuma reunião encontrada.';
            cell.style.textAlign = 'center';
        }

        paginatedMeetings.forEach(meeting => {
            const row = meetingsTableBody.insertRow();
            row.insertCell().textContent = formatDateToBR(meeting.date);
            row.insertCell().textContent = meeting.time;
            row.insertCell().textContent = meeting.subject;
            row.insertCell().textContent = meeting.area;
            row.insertCell().textContent = meeting.local;
            row.insertCell().textContent = meeting.status;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('meeting-action-buttons');

            const viewButton = document.createElement('button');
            viewButton.textContent = 'Visualizar';
            viewButton.classList.add('meeting-view-btn');
            viewButton.addEventListener('click', () => viewMeeting(meeting.id));
            actionsCell.appendChild(viewButton);

            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.classList.add('meeting-edit-btn');
            editButton.addEventListener('click', () => editMeeting(meeting.id));
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.classList.add('meeting-delete-btn');
            deleteButton.addEventListener('click', () => deleteMeeting(meeting.id));
            actionsCell.appendChild(deleteButton);
        });

        renderPaginationButtons(filteredMeetings.length);
        updateCalendar(); // Atualiza o calendário após renderizar a tabela
    }

    // --- Funções do Calendário ---
    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [], // Eventos serão carregados de updateCalendar
            eventClick: function(info) {
                // Ao clicar em um evento, edita a reunião correspondente
                const meetingId = info.event.id;
                editMeeting(parseInt(meetingId));
            },
            eventDidMount: function(info) {
                // Adiciona tooltip ou estilo extra se desejar
                info.el.title = `${info.event.title} - ${info.event.extendedProps.subject} (${info.event.extendedProps.status})`;
            }
        });
        calendar.render();
    }

    function updateCalendar() {
        const calendarEvents = meetings.map(meeting => {
            let eventColor = '#007bff'; // Azul padrão
            if (meeting.status === 'Concluído') {
                eventColor = '#28a745'; // Verde
            } else if (meeting.status === 'Não Realizado') {
                eventColor = '#dc3545'; // Vermelho
            }

            return {
                id: meeting.id,
                title: meeting.title,
                start: `${meeting.date}T${meeting.time}`,
                color: eventColor,
                extendedProps: {
                    subject: meeting.subject,
                    status: meeting.status
                }
            };
        });
        calendar.setOption('events', calendarEvents);
    }

    // --- Funções de Ação ---
    function addOrUpdateMeeting() {
        const id = meetingIdInput.value;
        const newMeetingData = {
            date: meetingDateInput.value,
            time: meetingTimeInput.value,
            title: meetingTitleInput.value,
            subject: meetingSubjectInput.value,
            participants: meetingParticipantsInput.value,
            area: meetingAreaSelect.value,
            local: meetingLocalInput.value,
            observations: meetingObservationsInput.value,
            status: meetingStatusSelect.value,
            nextSteps: meetingNextStepsInput.value
        };

        if (id) {
            const index = meetings.findIndex(m => m.id === parseInt(id));
            if (index !== -1) {
                meetings[index] = { ...meetings[index], ...newMeetingData };
            }
        } else {
            const newId = meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1;
            meetings.push({ id: newId, ...newMeetingData });
        }

        saveMeetings();
        populateAreaSelects(); // Atualiza selects caso uma nova área tenha sido adicionada
        currentPage = 1;
        renderMeetings();
        resetForm();
        toggleSectionVisibility(formSection, toggleAddBtn); // Fecha o formulário
    }

    function editMeeting(id) {
        const meetingToEdit = meetings.find(meeting => meeting.id === id);
        if (meetingToEdit) {
            meetingIdInput.value = meetingToEdit.id;
            meetingDateInput.value = meetingToEdit.date;
            meetingTimeInput.value = meetingToEdit.time;
            meetingTitleInput.value = meetingToEdit.title;
            meetingSubjectInput.value = meetingToEdit.subject;
            meetingParticipantsInput.value = meetingToEdit.participants;
            meetingAreaSelect.value = meetingToEdit.area;
            meetingLocalInput.value = meetingToEdit.local;
            meetingObservationsInput.value = meetingToEdit.observations;
            meetingStatusSelect.value = meetingToEdit.status;
            meetingNextStepsInput.value = meetingToEdit.nextSteps;

            submitBtn.textContent = 'Salvar Edição';
            cancelEditBtn.classList.remove('hidden');

            toggleSectionVisibility(formSection, toggleAddBtn, true); // Força a abertura do formulário
        }
    }

    function deleteMeeting(id) {
        if (confirm('Tem certeza que deseja excluir esta reunião?')) {
            meetings = meetings.filter(meeting => meeting.id !== id);
            saveMeetings();
            renderMeetings();
            resetForm();
        }
    }

    function resetForm() {
        meetingForm.reset();
        meetingIdInput.value = '';
        submitBtn.textContent = 'Registrar Reunião';
        cancelEditBtn.classList.add('hidden');
        meetingAreaSelect.value = ''; // Reseta a seleção da área
    }

    function addNewArea() {
        const newArea = (prompt('Digite o nome da nova área:') || '').trim();
        if (newArea && !areas.includes(newArea)) {
            areas.push(newArea);
            areas.sort(); // Mantém as áreas em ordem alfabética
            saveAreas();
            populateAreaSelects();
            meetingAreaSelect.value = newArea; // Seleciona a nova área no formulário
        } else if (newArea) {
            alert('Esta área já existe.');
        }
    }

    function openMeetingModal() {
        meetingModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeMeetingModal() {
        meetingModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replaceAll('&', '&')
            .replaceAll('<', '<')
            .replaceAll('>', '>')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function viewMeeting(id) {
        const meeting = meetings.find(m => m.id === id);
        if (!meeting) return;

        const fields = [
            { label: 'ID', value: meeting.id },
            { label: 'Data', value: formatDateToBR(meeting.date) },
            { label: 'Horário', value: meeting.time },
            { label: 'Título', value: meeting.title },
            { label: 'Assunto', value: meeting.subject },
            { label: 'Participantes', value: meeting.participants },
            { label: 'Área', value: meeting.area },
            { label: 'Local', value: meeting.local },
            { label: 'Status', value: meeting.status },
            { label: 'Observações', value: meeting.observations, fullWidth: true },
            { label: 'Próximos Passos', value: meeting.nextSteps, fullWidth: true },
        ];

        meetingModalBody.innerHTML = fields.map(f => {
            const safeValue = escapeHtml(f.value).replace(/\n/g, '<br>');
            return `
                <div class="meeting-modal__field ${f.fullWidth ? 'full-width' : ''}">
                  <strong>${escapeHtml(f.label)}</strong>
                  <div>${safeValue || '-'}</div>
                </div>
            `;
        }).join('');

        openMeetingModal();
    }

    // ---------- Início: Export / Import Backup ----------
    // Busca elementos pelo texto visível no HTML para não alterar estilo/estrutura
    const EXPORT_TEXT = '📥 Exportar Dados (Backup)';
    const IMPORT_TEXT = '📤 Importar Dados (Restaurar)';
    const IMPORT_FILE_INPUT_ID = 'import-backup-file-hidden';

    function findElementByExactText(text) {
        const candidates = Array.from(document.querySelectorAll('button, a, span, div, p, li'));
        return candidates.find(el => (el.textContent || '').trim() === text.trim()) || null;
    }

    function ensureHiddenFileInput() {
        let input = document.getElementById(IMPORT_FILE_INPUT_ID);
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.id = IMPORT_FILE_INPUT_ID;
            input.style.display = 'none';
            document.body.appendChild(input);
        }
        return input;
    }

    function exportBackup() {
        try {
            const meetingsData = Array.isArray(meetings) ? meetings : [];
            const areasData = Array.isArray(areas) ? areas : [];
            const payload = { meetings: meetingsData, areas: areasData };
            const json = JSON.stringify(payload, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const datePart = new Date().toISOString().slice(0,10);
            a.download = `meetings-backup-${datePart}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao exportar backup:', err);
            alert('Falha ao exportar backup. Veja console para detalhes.');
        }
    }

    function importBackupFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (!parsed || typeof parsed !== 'object') throw new Error('Arquivo inválido');

                if (parsed.meetings && Array.isArray(parsed.meetings)) {
                    meetings = parsed.meetings;
                }

                if (parsed.areas && Array.isArray(parsed.areas)) {
                    areas = parsed.areas;
                }

                // Salva usando funções existentes
                if (typeof saveMeetings === 'function') {
                    saveMeetings();
                } else {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meetings));
                }

                if (typeof saveAreas === 'function') {
                    saveAreas();
                } else {
                    localStorage.setItem(LOCAL_STORAGE_AREAS_KEY, JSON.stringify(areas));
                }

                // Atualiza UI
                populateAreaSelects();
                renderMeetings();
                if (typeof updateCalendar === 'function') updateCalendar();

                alert('Backup importado com sucesso.');
            } catch (err) {
                console.error('Erro ao importar backup:', err);
                alert('Falha ao importar backup: arquivo inválido. Veja console para detalhes.');
            }
        };
        reader.readAsText(file);
    }

    // Conecta os elementos (procura pelo texto)
    const exportEl = findElementByExactText(EXPORT_TEXT);
    const importEl = findElementByExactText(IMPORT_TEXT);
    const hiddenFileInput = ensureHiddenFileInput();

    if (exportEl) {
        exportEl.style.cursor = 'pointer';
        exportEl.addEventListener('click', (e) => {
            e.preventDefault();
            exportBackup();
        });
    } else {
        console.warn('Elemento de exportação não encontrado. Se desejar, adicione um elemento com texto exato:', EXPORT_TEXT);
    }

    if (importEl) {
        importEl.style.cursor = 'pointer';
        importEl.addEventListener('click', (e) => {
            e.preventDefault();
            hiddenFileInput.click();
        });
        hiddenFileInput.addEventListener('change', (ev) => {
            const file = ev.target.files[0];
            importBackupFile(file);
            ev.target.value = ''; // limpa seleção
        });
    } else {
        console.warn('Elemento de importação não encontrado. Se desejar, adicione um elemento com texto exato:', IMPORT_TEXT);
    }
    // ---------- Fim: Export / Import Backup ----------

    // --- Event Listeners ---
    meetingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addOrUpdateMeeting();
    });

    cancelEditBtn.addEventListener('click', resetForm);
    addAreaBtn.addEventListener('click', addNewArea);

    toggleFilterBtn.addEventListener('click', () => toggleSectionVisibility(filterSection, toggleFilterBtn));
    toggleAddBtn.addEventListener('click', () => toggleSectionVisibility(formSection, toggleAddBtn));

    // Fechar modal ao clicar no backdrop ou no botão X
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.matches('[data-modal-close="true"]')) {
            closeMeetingModal();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && meetingModal && !meetingModal.classList.contains('hidden')) {
            closeMeetingModal();
        }
    });

    // Filtros
    filterStartDate.addEventListener('change', () => { currentPage = 1; renderMeetings(); });
    filterEndDate.addEventListener('change', () => { currentPage = 1; renderMeetings(); });
    filterTitle.addEventListener('input', () => { currentPage = 1; renderMeetings(); });
    filterSubject.addEventListener('input', () => { currentPage = 1; renderMeetings(); });
    filterParticipants.addEventListener('input', () => { currentPage = 1; renderMeetings(); });
    filterArea.addEventListener('change', () => { currentPage = 1; renderMeetings(); });
    filterLocal.addEventListener('input', () => { currentPage = 1; renderMeetings(); });
    filterStatus.addEventListener('change', () => { currentPage = 1; renderMeetings(); });

    clearFiltersBtn.addEventListener('click', () => {
        filterStartDate.value = '';
        filterEndDate.value = '';
        filterTitle.value = '';
        filterSubject.value = '';
        filterParticipants.value = '';
        filterArea.value = '';
        filterLocal.value = '';
        filterStatus.value = '';
        currentPage = 1;
        renderMeetings();
    });

    // Paginação
    recordsPerPageSelect.addEventListener('change', () => {
        recordsPerPage = parseInt(recordsPerPageSelect.value);
        currentPage = 1;
        renderMeetings();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderMeetings();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalFilteredRecords = meetings.filter(meeting => {
            const startDate = filterStartDate.value ? new Date(filterStartDate.value + 'T00:00:00') : null;
            const endDate = filterEndDate.value ? new Date(filterEndDate.value + 'T23:59:59') : null;
            const meetingDate = new Date(meeting.date + 'T00:00:00');

            if (startDate && meetingDate < startDate) return false;
            if (endDate && meetingDate > endDate) return false;
            if (filterTitle.value && !meeting.title.toLowerCase().includes(filterTitle.value.toLowerCase())) return false;
            if (filterSubject.value && !meeting.subject.toLowerCase().includes(filterSubject.value.toLowerCase())) return false;
            if (filterParticipants.value && !meeting.participants.toLowerCase().includes(filterParticipants.value.toLowerCase())) return false;
            if (filterArea.value && meeting.area !== filterArea.value) return false;
            if (filterLocal.value && !meeting.local.toLowerCase().includes(filterLocal.value.toLowerCase())) return false;
            if (filterStatus.value && meeting.status !== filterStatus.value) return false;
            return true;
        }).length;
        const totalPages = Math.ceil(totalFilteredRecords / recordsPerPage);

        if (currentPage < totalPages) {
            currentPage++;
            renderMeetings();
        }
    });

    // Event listeners para o menu lateral
    menuToggleBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

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
    loadAreas();
    loadMeetings();
    populateAreaSelects();
    initializeCalendar(); // Inicializa o calendário
    renderMeetings(); // Renderiza a tabela e atualiza o calendário
});
