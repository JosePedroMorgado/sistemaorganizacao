// ===================================
// FUNÇÃO AUXILIAR PARA ATUALIZAR ELEMENTOS (Definida no início)
// ===================================
function updateElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

// ===================================
// FUNÇÃO DE LOG (necessária para registrar ações de backup/import)
// ===================================
function addLog(module, action, description, details) {
    const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    const newLog = {
        id: logs.length > 0 ? Math.max(...logs.map(function(l) { return l.id; })) + 1 : 1,
        timestamp: new Date().toISOString(),
        module: module,
        action: action,
        description: description,
        details: details || null
    };
    logs.push(newLog);
    localStorage.setItem('systemLogs', JSON.stringify(logs));
}

// ===================================
// SISTEMA DE BACKUP UNIFICADO (Manual Export/Import)
// ===================================

function exportData() {
    // ATENÇÃO: Aqui, estamos exportando o objeto meetingsApp completo, se ele existir.
    // Se você quiser exportar apenas o array de reuniões, ajuste esta linha.
    const meetingsToExport = JSON.parse(localStorage.getItem('meetingsAppData') || 'null');
    const actualMeetingsArray = meetingsToExport && meetingsToExport.meetings ? meetingsToExport.meetings : [];

    const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
            checklist: JSON.parse(localStorage.getItem('checklistTasks') || '[]'),
            agendaActivities: JSON.parse(localStorage.getItem('agendaActivities') || '[]'),
            meetings: actualMeetingsArray, // Usando o array de reuniões de meetingsApp
            reports: JSON.parse(localStorage.getItem('reports') || '[]'),
            wiki: JSON.parse(localStorage.getItem('wiki') || '[]')
        }
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = 'backup_completo_' + timestamp + '.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addLog('system', 'backup', 'Backup manual exportado', {
        checklist: allData.data.checklist.length,
        agenda: allData.data.agendaActivities.length,
        meetings: allData.data.meetings.length,
        reports: allData.data.reports.length,
        wiki: allData.data.wiki.length
    });

    alert(
        'Backup completo exportado com sucesso!\n\nDados exportados:\n' +
        '✅ Checklist: ' + allData.data.checklist.length + ' itens\n' +
        '✅ Agenda: ' + allData.data.agendaActivities.length + ' atividades\n' +
        '✅ Reuniões: ' + allData.data.meetings.length + ' reuniões\n' +
        '✅ Reports: ' + allData.data.reports.length + ' reports\n' +
        '✅ Wiki: ' + allData.data.wiki.length + ' páginas'
    );
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);

                if (!importedData.data) {
                    alert('Erro: Arquivo de backup inválido!');
                    return;
                }

                const confirmMessage =
                    'ATENÇÃO: Esta ação irá SUBSTITUIR todos os dados atuais!\n\n' +
                    'Dados que serão importados:\n' +
                    '✅ Checklist: ' + (importedData.data.checklist ? importedData.data.checklist.length : 0) + ' itens\n' +
                    '✅ Agenda: ' + (importedData.data.agendaActivities ? importedData.data.agendaActivities.length : 0) + ' atividades\n' +
                    '✅ Reuniões: ' + (importedData.data.meetings ? importedData.data.meetings.length : 0) + ' reuniões\n' +
                    '✅ Reports: ' + (importedData.data.reports ? importedData.data.reports.length : 0) + ' reports\n' +
                    '✅ Wiki: ' + (importedData.data.wiki ? importedData.data.wiki.length : 0) + ' páginas\n\n' +
                    'Deseja continuar?';

                if (!confirm(confirmMessage)) {
                    return;
                }

                // Importa os dados
                if (importedData.data.checklist) {
                    localStorage.setItem('checklistTasks', JSON.stringify(importedData.data.checklist));
                }
                if (importedData.data.agendaActivities) {
                    localStorage.setItem('agendaActivities', JSON.stringify(importedData.data.agendaActivities));
                }
                // ATENÇÃO: Ao importar, precisamos recriar a estrutura meetingsApp.
                // Assumindo que meetingsApp é um objeto que contém o array 'meetings'.
                if (importedData.data.meetings) {
                    let currentMeetingsApp = JSON.parse(localStorage.getItem('meetingsAppData') || 'null');
                    if (!currentMeetingsApp) {
                        currentMeetingsApp = {}; // Cria um objeto vazio se não existir
                    }
                    currentMeetingsApp.meetings = importedData.data.meetings;
                    localStorage.setItem('meetingsAppData', JSON.stringify(currentMeetingsApp));
                    // Também atualiza a chave direta se ela for usada em outros lugares
                    localStorage.setItem('meetingsApp.meetings', JSON.stringify(importedData.data.meetings));
                }
                if (importedData.data.reports) {
                    localStorage.setItem('reports', JSON.stringify(importedData.data.reports));
                }
                if (importedData.data.wiki) {
                    localStorage.setItem('wiki', JSON.stringify(importedData.data.wiki));
                }

                addLog('system', 'import', 'Dados importados do backup', {
                    checklist: importedData.data.checklist ? importedData.data.checklist.length : 0,
                    agenda: importedData.data.agendaActivities ? importedData.data.agendaActivities.length : 0,
                    meetings: importedData.data.meetings ? importedData.data.meetings.length : 0,
                    reports: importedData.data.reports ? importedData.data.reports.length : 0,
                    wiki: importedData.data.wiki ? importedData.data.wiki.length : 0
                });

                localStorage.setItem('lastBackupImport', new Date().toISOString());

                alert('✅ Dados importados com sucesso!\n\nRecarregue a página para visualizar os dados importados.');

                setTimeout(function() {
                    location.reload();
                }, 2000);

            } catch (error) {
                alert('Erro ao importar dados: ' + error.message);
                console.error('Erro ao importar:', error);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

function showBackupStatus() {
    const lastImport = localStorage.getItem('lastBackupImport');

    let message = '📊 STATUS DO BACKUP\n\n';

    if (lastImport) {
        const date = new Date(lastImport);
        message += '✅ Última importação: ' + date.toLocaleString('pt-BR') + '\n';
    } else {
        message += '⚠️ Nenhuma importação realizada ainda\n';
    }

    // ATENÇÃO: Aqui, estamos lendo o array de reuniões diretamente de 'meetingsApp.meetings'
    const actualMeetingsArray = JSON.parse(localStorage.getItem('meetingsApp.meetings') || '[]');

    const allData = {
        checklist: JSON.parse(localStorage.getItem('checklistTasks') || '[]'),
        agendaActivities: JSON.parse(localStorage.getItem('agendaActivities') || '[]'),
        meetings: actualMeetingsArray, // Usando o array de reuniões de meetingsApp.meetings
        reports: JSON.parse(localStorage.getItem('reports') || '[]'),
        wiki: JSON.parse(localStorage.getItem('wiki') || '[]')
    };

    message += '\n📈 DADOS ATUAIS:\n';
    message += '• Checklist: ' + allData.checklist.length + ' itens\n';
    message += '• Agenda: ' + allData.agendaActivities.length + ' atividades\n';
    message += '• Reuniões: ' + allData.meetings.length + ' reuniões\n';
    message += '• Reports: ' + allData.reports.length + ' reports\n';
    message += '• Wiki: ' + allData.wiki.length + ' páginas';

    alert(message);
}

// ===================================
// FUNÇÕES DE ESTATÍSTICAS DO DASHBOARD (VERSÃO ÚNICA E CORRETA)
// ===================================
function loadStatistics() {
    const checklist = JSON.parse(localStorage.getItem('checklistTasks') || '[]');
    const agenda = JSON.parse(localStorage.getItem('agendaActivities') || '[]');

    // Lendo diretamente da chave 'meetingsApp.meetings'
    const meetings = JSON.parse(localStorage.getItem('meetingsApp.meetings') || '[]');

    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const wiki = JSON.parse(localStorage.getItem('wiki') || '[]');

    const checklistCompleted = checklist.filter(function(task) { return task.completed; }).length;
    const checklistPending = checklist.length - checklistCompleted;
    const checklistPercentage = checklist.length > 0 ? Math.round((checklistCompleted / checklist.length) * 100) : 0;

    const agendaAreas = new Set(agenda.map(function(activity) { return activity.area; })).size;

    const meetingsTotal = meetings.length;

    // --- NOVAS CONTADORAS DE STATUS DE REUNIÕES ---
    const meetingsCompleted = meetings.filter(function(m) {
        return m.status === 'Concluído';
    }).length;

    const meetingsPending = meetings.filter(function(m) {
        return m.status === 'Pendente';
    }).length;

    const meetingsNotRealized = meetings.filter(function(m) {
        return m.status === 'Não Realizado';
    }).length;
    // --- FIM DAS NOVAS CONTADORAS ---

    const meetingsUpcoming = meetings.filter(function(m) { return m.status === 'próxima' || m.status === 'upcoming'; }).length;
    const uniqueParticipants = new Set(meetings.flatMap(function(m) { return m.participants || []; })).size;

    const today = new Date();
    const thisMonth = reports.filter(function(r) {
        const reportDate = new Date(r.date || r.createdAt);
        return reportDate.getMonth() === today.getMonth() && reportDate.getFullYear() === today.getFullYear();
    }).length;

    const thisWeek = reports.filter(function(r) {
        const reportDate = new Date(r.date || r.createdAt);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return reportDate >= weekAgo && reportDate <= today;
    }).length;

    const todayReports = reports.filter(function(r) {
        const reportDate = new Date(r.date || r.createdAt);
        return reportDate.toDateString() === today.toDateString();
    }).length;

    const wikiCategories = new Set(wiki.map(function(page) { return page.category; })).size;
    const wikiTags = new Set(wiki.flatMap(function(page) { return page.tags || []; })).size;
    const wikiLinks = wiki.reduce(function(count, page) { return count + (page.links ? page.links.length : 0); }, 0);

    const totalRecords = checklist.length + agenda.length + meetingsTotal + reports.length + wiki.length;

    updateDashboardUI({
        checklist: {
            total: checklist.length,
            completed: checklistCompleted,
            pending: checklistPending,
            percentage: checklistPercentage
        },
        agenda: {
            total: agenda.length,
            areas: agendaAreas,
            activities: agenda.length
        },
        meetings: {
            total: meetingsTotal,
            completed: meetingsCompleted,
            pending: meetingsPending,      // Adicionado
            notRealized: meetingsNotRealized, // Adicionado
            upcoming: meetingsUpcoming,
            participants: uniqueParticipants
        },
        reports: {
            total: reports.length,
            thisMonth: thisMonth,
            thisWeek: thisWeek,
            today: todayReports
        },
        wiki: {
            total: wiki.length,
            categories: wikiCategories,
            tags: wikiTags,
            links: wikiLinks
        },
        distribution: {
            checklist: checklist.length,
            agenda: agenda.length,
            meetings: meetingsTotal,
            reports: reports.length,
            wiki: wiki.length
        },
        total: totalRecords
    });

    updateTimestamp();
    updateBackupStatusUI(totalRecords);
}

function updateDashboardUI(data) {
    // Atualiza cards principais
    updateElement('[data-stat="checklist"] .stat-number', data.checklist.total);
    updateElement('[data-stat="checklist"] .stat-subtitle', data.checklist.completed + ' concluídas');

    updateElement('[data-stat="agenda"] .stat-number', data.agenda.total);
    updateElement('[data-stat="agenda"] .stat-subtitle', data.agenda.areas + ' áreas');

    updateElement('[data-stat="meetings"] .stat-number', data.meetings.total);
    updateElement('[data-stat="meetings"] .stat-subtitle', data.meetings.upcoming + ' próximas');

    updateElement('[data-stat="reports"] .stat-number', data.reports.total);
    updateElement('[data-stat="reports"] .stat-subtitle', data.reports.thisMonth + ' este mês');

    updateElement('[data-stat="wiki"] .stat-number', data.wiki.total);
    updateElement('[data-stat="wiki"] .stat-subtitle', data.wiki.categories + ' categorias');

    updateElement('[data-stat="total"] .stat-number', data.total);

    // Atualiza seção de distribuição
    updateElement('[data-distribution="checklist"]', data.distribution.checklist);
    updateElement('[data-distribution="agenda"]', data.distribution.agenda);
    updateElement('[data-distribution="meetings"]', data.distribution.meetings);
    updateElement('[data-distribution="reports"]', data.distribution.reports);
    updateElement('[data-distribution="wiki"]', data.distribution.wiki);

    // Atualiza detalhes por módulo
    updateElement('[data-module="checklist"] [data-detail="total"]', data.checklist.total + ' tarefas');
    updateElement('[data-module="checklist"] [data-detail="completed"]', data.checklist.completed);
    updateElement('[data-module="checklist"] [data-detail="pending"]', data.checklist.pending);
    updateElement('[data-module="checklist"] [data-detail="percentage"]', data.checklist.percentage + '%');

    updateElement('[data-module="agenda"] [data-detail="total"]', data.agenda.total + ' atividades');
    updateElement('[data-module="agenda"] [data-detail="areas"]', data.agenda.areas);
    updateElement('[data-module="agenda"] [data-detail="activities"]', data.agenda.activities);

    // --- ATUALIZAÇÃO DOS DETALHES DE REUNIÕES ---
    updateElement('[data-module="meetings"] [data-detail="total"]', data.meetings.total + ' reuniões');
    updateElement('[data-module="meetings"] [data-detail="completed"]', data.meetings.completed);
    updateElement('[data-module="meetings"] [data-detail="pending"]', data.meetings.pending); // Adicionado
    updateElement('[data-module="meetings"] [data-detail="notRealized"]', data.meetings.notRealized); // Adicionado
    updateElement('[data-module="meetings"] [data-detail="upcoming"]', data.meetings.upcoming); // Mantido, se quiser exibir
    updateElement('[data-module="meetings"] [data-detail="participants"]', data.meetings.participants);
    // --- FIM DA ATUALIZAÇÃO DOS DETALHES DE REUNIÕES ---

    updateElement('[data-module="reports"] [data-detail="total"]', data.reports.total + ' reports');
    updateElement('[data-module="reports"] [data-detail="thisMonth"]', data.reports.thisMonth);
    updateElement('[data-module="reports"] [data-detail="thisWeek"]', data.reports.thisWeek);
    updateElement('[data-module="reports"] [data-detail="today"]', data.reports.today);

    updateElement('[data-module="wiki"] [data-detail="total"]', data.wiki.total + ' páginas');
    updateElement('[data-module="wiki"] [data-detail="categories"]', data.wiki.categories);
    updateElement('[data-module="wiki"] [data-detail="tags"]', data.wiki.tags);
    updateElement('[data-module="wiki"] [data-detail="links"]', data.wiki.links);
}

function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    const dateString = now.toLocaleDateString('pt-BR');
    const fullDateTime = dateString + ', ' + timeString;

    updateElement('[data-timestamp="update"]', 'Atualizado em ' + fullDateTime);
    updateElement('[data-timestamp="last"]', 'Última Atualização: ' + fullDateTime);
}

function updateBackupStatusUI(totalRecords) {
    const lastImport = localStorage.getItem('lastBackupImport');
    const lastImportElement = document.querySelector('[data-timestamp="lastBackupImport"]');
    if (lastImportElement) {
        if (lastImport) {
            const date = new Date(lastImport);
            lastImportElement.textContent = date.toLocaleString('pt-BR');
        } else {
            lastImportElement.textContent = 'Nenhuma importação realizada ainda';
        }
    }

    const estimatedSizeKB = (totalRecords * 100 / 1024).toFixed(2);

    updateElement('[data-detail="backup-total-records"]', totalRecords);
    updateElement('[data-detail="backup-estimated-size"]', estimatedSizeKB + ' KB');
    updateElement('[data-detail="backup-status"]', '✅ OK');
}

// Funções placeholder (mantidas)
function loadPages() { console.log('📄 Páginas carregadas'); }
function renderPageList() { console.log('📋 Lista de páginas renderizada'); }
function renderBreadcrumbs() { console.log('🔗 Breadcrumbs renderizados'); }
function checkUrlParams() { console.log('🔍 Parâmetros da URL verificados'); }

// ===================================
// INICIALIZAÇÃO DO DASHBOARD E LÓGICA DO MENU LATERAL
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // --- Inicialização das funções do Dashboard ---
    loadStatistics(); // Chama a função principal de carregamento de estatísticas
    loadPages();
    renderPageList();
    renderBreadcrumbs();
    checkUrlParams();

    // Atualizar a cada 30 segundos
    setInterval(loadStatistics, 30000);

    console.log('📈 Dashboard inicializado');

    // --- Lógica do Menu Lateral ---
    const sideMenu = document.getElementById('side-menu');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mainContent = document.getElementById('main-content');
    let overlay = null;

    function createOverlay() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeMenu);
        }
    }

    function openMenu() {
        if (sideMenu) {
            sideMenu.classList.add('open');
            if (menuToggleBtn) menuToggleBtn.classList.add('menu-open');
            if (window.innerWidth > 768) {
                if (mainContent) mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
            } else {
                createOverlay();
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    }

    function closeMenu() {
        if (sideMenu) {
            sideMenu.classList.remove('open');
            if (menuToggleBtn) menuToggleBtn.classList.remove('menu-open');
            if (mainContent) mainContent.style.marginLeft = '0';
            if (overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', openMenu);
    }
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMenu);
    }

    window.addEventListener('resize', () => {
        if (sideMenu && mainContent && menuToggleBtn) {
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
                createOverlay();
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                mainContent.style.marginLeft = '0';
                menuToggleBtn.classList.remove('menu-open');
                if (overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        }
    });

    if (window.innerWidth <= 768) {
        createOverlay();
    } else if (sideMenu && sideMenu.classList.contains('open')) {
        if (mainContent) mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
        if (menuToggleBtn) menuToggleBtn.classList.add('menu-open');
    }

    if (!sideMenu || !menuToggleBtn || !closeMenuBtn || !mainContent) {
        console.warn('⚠️ Elementos do menu lateral (side-menu, menu-toggle-btn, close-menu-btn, main-content) não encontrados. O menu pode não funcionar.');
    }
});
