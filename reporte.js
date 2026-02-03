document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const reportForm = document.getElementById('report-form');
    const reportIdInput = document.getElementById('report-id');
    const reportDateInput = document.getElementById('report-date');
    const reportAreaSelect = document.getElementById('report-area');
    const addNewAreaBtn = document.getElementById('add-new-area-btn');
    const reportTitleInput = document.getElementById('report-title');
    const reportStatusSelect = document.getElementById('report-status');
    const reportDescriptionTextarea = document.getElementById('report-description');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    const reportsTableBody = document.querySelector('#reports-table tbody');
    const pageInfoSpan = document.getElementById('page-info');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const recordsPerPageSelect = document.getElementById('records-per-page');

    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const filterTitle = document.getElementById('filter-title');
    const filterArea = document.getElementById('filter-area');
    const filterStatus = document.getElementById('filter-status');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    const toggleFilterBtn = document.getElementById('toggle-filter-btn');
    const toggleAddBtn = document.getElementById('toggle-add-btn');
    const filterSection = document.getElementById('filter-section');
    const formSection = document.getElementById('form-section');

    // Modal de Visualização
    const viewReportModal = document.getElementById('view-report-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalEditBtn = document.getElementById('modal-edit-btn');
    const modalDeleteBtn = document.getElementById('modal-delete-btn');

    const viewReportDate = document.getElementById('view-report-date');
    const viewReportArea = document.getElementById('view-report-area');
    const viewReportTitle = document.getElementById('view-report-title');
    const viewReportStatus = document.getElementById('view-report-status');
    const viewReportDescription = document.getElementById('view-report-description');

    // Menu Lateral
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.querySelector('.overlay');
    const mainContent = document.querySelector('.main-content');

    // --- Variáveis de Estado ---
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    let areas = JSON.parse(localStorage.getItem('areas')) || ['Comercial', 'Marketing', 'Financeiro', 'RH', 'Operações'];
    let currentReportId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
    let currentPage = 1;
    let recordsPerPage = parseInt(recordsPerPageSelect.value);

    // --- Funções do Menu Lateral ---
    function openMenu() {
        sideMenu.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (window.innerWidth > 768) {
            mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
            menuToggleBtn.classList.add('menu-open');
        }
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        mainContent.style.marginLeft = '0';
        menuToggleBtn.classList.remove('menu-open');
    }

    // --- Funções de Persistência ---
    function saveReports() {
        localStorage.setItem('reports', JSON.stringify(reports));
    }

    function loadReports() {
        reports = JSON.parse(localStorage.getItem('reports')) || [];
        currentReportId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
    }

    function saveAreas() {
        localStorage.setItem('areas', JSON.stringify(areas));
    }

    function loadAreas() {
        areas = JSON.parse(localStorage.getItem('areas')) || ['Comercial', 'Marketing', 'Financeiro', 'RH', 'Operações'];
    }

    // --- Funções de Áreas ---
    function populateAreaSelects() {
        const allAreaSelects = [reportAreaSelect, filterArea];
        allAreaSelects.forEach(select => {
            const selectedValue = select.value;
            select.innerHTML = '';

            if (select.id === 'filter-area') {
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Todas as Áreas';
                select.appendChild(defaultOption);
            } else {
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Selecione uma área';
                select.appendChild(defaultOption);
            }

            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                select.appendChild(option);
            });

            if (selectedValue && areas.includes(selectedValue)) {
                select.value = selectedValue;
            } else if (select.id !== 'filter-area') {
                select.value = '';
            }
        });
    }

    function addNewArea() {
        const newArea = prompt('Digite o nome da nova área:');
        if (newArea && newArea.trim() !== '' && !areas.includes(newArea.trim())) {
            areas.push(newArea.trim());
            saveAreas();
            populateAreaSelects();
            alert(`Área "${newArea.trim()}" adicionada com sucesso!`);
        } else if (newArea && areas.includes(newArea.trim())) {
            alert(`A área "${newArea.trim()}" já existe.`);
        }
    }

    // --- Funções de CRUD de Reports ---
    function addReport(event) {
        event.preventDefault();
        const newReport = {
            id: currentReportId++,
            date: reportDateInput.value,
            area: reportAreaSelect.value,
            title: reportTitleInput.value,
            status: reportStatusSelect.value,
            description: reportDescriptionTextarea.value
        };
        reports.push(newReport);
        saveReports();
        clearForm();
        renderReports();
        alert('Report registrado com sucesso!');
        toggleSectionVisibility(formSection, toggleAddBtn);
    }

    function updateReport(event) {
        event.preventDefault();
        const idToUpdate = parseInt(reportIdInput.value);
        const index = reports.findIndex(r => r.id === idToUpdate);

        if (index !== -1) {
            reports[index] = {
                id: idToUpdate,
                date: reportDateInput.value,
                area: reportAreaSelect.value,
                title: reportTitleInput.value,
                status: reportStatusSelect.value,
                description: reportDescriptionTextarea.value
            };
            saveReports();
            clearForm();
            renderReports();
            alert('Report atualizado com sucesso!');
            toggleSectionVisibility(formSection, toggleAddBtn);
        }
    }

    function editReport(id) {
        closeViewModal();
        const report = reports.find(r => r.id === id);
        if (report) {
            reportIdInput.value = report.id;
            reportDateInput.value = report.date;
            reportAreaSelect.value = report.area;
            reportTitleInput.value = report.title;
            reportStatusSelect.value = report.status;
            reportDescriptionTextarea.value = report.description;

            submitBtn.textContent = 'Atualizar Report';
            cancelEditBtn.classList.remove('hidden');
            if (formSection.classList.contains('hidden-section')) {
                toggleSectionVisibility(formSection, toggleAddBtn);
            }
            window.scrollTo({ top: formSection.offsetTop, behavior: 'smooth' });
        }
    }

    function deleteReport(id) {
        closeViewModal();
        if (confirm('Tem certeza que deseja excluir este report?')) {
            reports = reports.filter(r => r.id !== id);
            saveReports();
            renderReports();
            alert('Report excluído com sucesso!');
        }
    }

    function clearForm() {
        reportForm.reset();
        reportIdInput.value = '';
        submitBtn.textContent = 'Salvar Report';
        cancelEditBtn.classList.add('hidden');
    }

    // --- Funções de Renderização da Tabela e Paginação ---
    function renderReports() {
        reportsTableBody.innerHTML = '';
        const filteredReports = applyFiltersToData(reports);
        const totalPages = Math.ceil(filteredReports.length / recordsPerPage);
        currentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
        pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages > 0 ? totalPages : 1}`;

        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const reportsToRender = filteredReports.slice(startIndex, endIndex);

        if (reportsToRender.length === 0) {
            reportsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum report encontrado.</td></tr>';
        } else {
            reportsToRender.forEach(report => {
                const row = reportsTableBody.insertRow();
                row.insertCell().textContent = report.date;
                row.insertCell().textContent = report.area;
                row.insertCell().textContent = report.title;
                row.insertCell().textContent = report.status;

                const actionsCell = row.insertCell();
                actionsCell.classList.add('report-action-buttons');

                const viewButton = document.createElement('button');
                viewButton.textContent = 'Visualizar';
                viewButton.classList.add('report-view-btn');
                viewButton.addEventListener('click', () => openViewModal(report.id));
                actionsCell.appendChild(viewButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.classList.add('report-delete-btn');
                deleteButton.addEventListener('click', () => deleteReport(report.id));
                actionsCell.appendChild(deleteButton);
            });
        }

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    // --- Funções de Filtro ---
    function applyFiltersToData(data) {
        return data.filter(report => {
            const startDate = filterStartDate.value ? new Date(filterStartDate.value + 'T00:00:00') : null;
            const endDate = filterEndDate.value ? new Date(filterEndDate.value + 'T23:59:59') : null;
            const reportDate = new Date(report.date + 'T00:00:00');

            if (startDate && reportDate < startDate) return false;
            if (endDate && reportDate > endDate) return false;
            if (filterTitle.value && !report.title.toLowerCase().includes(filterTitle.value.toLowerCase())) return false;
            if (filterArea.value && report.area !== filterArea.value) return false;
            if (filterStatus.value && report.status !== filterStatus.value) return false;
            return true;
        });
    }

    function applyFilters() {
        currentPage = 1;
        renderReports();
    }

    function clearFilters() {
        filterStartDate.value = '';
        filterEndDate.value = '';
        filterTitle.value = '';
        filterArea.value = '';
        filterStatus.value = '';
        applyFilters();
    }

    // --- Funções de Toggle de Seções ---
    function toggleSectionVisibility(section, button) {
        section.classList.toggle('hidden-section');
        button.classList.toggle('active');
        if (section === filterSection && !section.classList.contains('hidden-section')) {
            if (!formSection.classList.contains('hidden-section')) {
                formSection.classList.add('hidden-section');
                toggleAddBtn.classList.remove('active');
            }
        } else if (section === formSection && !section.classList.contains('hidden-section')) {
            if (!filterSection.classList.contains('hidden-section')) {
                filterSection.classList.add('hidden-section');
                toggleFilterBtn.classList.remove('active');
            }
        }
    }

    // --- Funções do Modal de Visualização ---
    function openViewModal(id) {
        const report = reports.find(r => r.id === id);
        if (report) {
            viewReportDate.value = report.date;
            viewReportArea.value = report.area;
            viewReportTitle.value = report.title;
            viewReportStatus.value = report.status;
            viewReportDescription.value = report.description;

            modalEditBtn.dataset.reportId = id;
            modalDeleteBtn.dataset.reportId = id;

            viewReportModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeViewModal() {
        viewReportModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // --- Event Listeners ---
    toggleFilterBtn.addEventListener('click', () => toggleSectionVisibility(filterSection, toggleFilterBtn));
    toggleAddBtn.addEventListener('click', () => toggleSectionVisibility(formSection, toggleAddBtn));

    reportForm.addEventListener('submit', (event) => {
        if (reportIdInput.value) {
            updateReport(event);
        } else {
            addReport(event);
        }
    });
    cancelEditBtn.addEventListener('click', clearForm);
    addNewAreaBtn.addEventListener('click', addNewArea);

    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);

    recordsPerPageSelect.addEventListener('change', () => {
        recordsPerPage = parseInt(recordsPerPageSelect.value);
        currentPage = 1;
        renderReports();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderReports();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalFilteredRecords = applyFiltersToData(reports).length;
        const totalPages = Math.ceil(totalFilteredRecords / recordsPerPage);

        if (currentPage < totalPages) {
            currentPage++;
            renderReports();
        }
    });

    closeModalBtn.addEventListener('click', closeViewModal);
    modalCloseBtn.addEventListener('click', closeViewModal);
    modalEditBtn.addEventListener('click', () => editReport(parseInt(modalEditBtn.dataset.reportId)));
    modalDeleteBtn.addEventListener('click', () => deleteReport(parseInt(modalDeleteBtn.dataset.reportId)));
    window.addEventListener('click', (event) => {
        if (event.target === viewReportModal) {
            closeViewModal();
        }
    });

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
    loadReports();
    populateAreaSelects();
    renderReports();
});