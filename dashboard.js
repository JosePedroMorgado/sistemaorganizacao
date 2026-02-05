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
    const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
            checklist: JSON.parse(localStorage.getItem('checklistTasks') || '[]'), // CORRIGIDO: 'checklist' para 'checklistTasks'
            agendaActivities: JSON.parse(localStorage.getItem('agendaActivities') || '[]'),
            meetings: JSON.parse(localStorage.getItem('meetings') || '[]'),
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

    // REGISTRA O LOG
    addLog('system', 'backup', 'Backup manual exportado', {
        checklist: allData.data.checklist.length,
        agenda: allData.data.agendaActivities.length,
        meetings: allData.data.meetings.length,
        reports: allData.data.reports.length,
        wiki: allData.data.wiki.length
    });

    alert('Backup completo exportado com sucesso!\n\nDados exportados:\n' +
          '✅ Checklist: ' + allData.data.checklist.length + ' itens\n' +
          '✅ Agenda: ' + allData.data.agendaActivities.length + ' atividades\n' +
          '✅ Reuniões: ' + allData.data.meetings.length + ' reuniões\n' +
          '✅ Reports: ' + allData.data.reports.length + ' reports\n' +
          '✅ Wiki: ' + allData.data.wiki.length + ' páginas');
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
                    localStorage.setItem('checklistTasks', JSON.stringify(importedData.data.checklist)); // CORRIGIDO: 'checklist' para 'checklistTasks'
                }
                if (importedData.data.agendaActivities) {
                    localStorage.setItem('agendaActivities', JSON.stringify(importedData.data.agendaActivities));
                }
                if (importedData.data.meetings) {
                    localStorage.setItem('meetings', JSON.stringify(importedData.data.meetings));
                }
                if (importedData.data.reports) {
                    localStorage.setItem('reports', JSON.stringify(importedData.data.reports));
                }
                if (importedData.data.wiki) {
                    localStorage.setItem('wiki', JSON.stringify(importedData.data.wiki));
                }

                // REGISTRA O LOG
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

    const allData = {
        checklist: JSON.parse(localStorage.getItem('checklistTasks') || '[]'), // CORRIGIDO: 'checklist' para 'checklistTasks'
        agendaActivities: JSON.parse(localStorage.getItem('agendaActivities') || '[]'),
        meetings: JSON.parse(localStorage.getItem('meetings') || '[]'),
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
// INICIALIZAÇÃO DO DASHBOARD E LÓGICA DO MENU LATERAL
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // --- Inicialização das funções do Dashboard ---
    // Essas funções precisam ser definidas em algum lugar (ou neste arquivo, se for o caso)
    // Se elas não existirem, o console do navegador mostrará erros de "function is not defined".
    if (typeof loadStatistics === 'function') loadStatistics();
    if (typeof loadPages === 'function') loadPages();
    if (typeof renderPageList === 'function') renderPageList();
    if (typeof renderBreadcrumbs === 'function') renderBreadcrumbs();
    if (typeof checkUrlParams === 'function') checkUrlParams();

    // Atualizar a cada 30 segundos
    setInterval(function() {
        if (typeof loadStatistics === 'function') loadStatistics();
    }, 30000);

    console.log('📈 Dashboard inicializado');

    // --- Lógica do Menu Lateral (Copiada e adaptada do checklist.js) ---
    const sideMenu = document.getElementById('side-menu');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mainContent = document.getElementById('main-content'); // Usando ID, pois o style.css e checklist.js usam a classe, mas o ID é mais específico para o JS
    let overlay = null; // Será criado dinamicamente

    // Função para criar o overlay em mobile
    function createOverlay() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeMenu); // Clicar no overlay fecha o menu
        }
    }

    function openMenu() {
        if (sideMenu) {
            sideMenu.classList.add('open');
            if (menuToggleBtn) menuToggleBtn.classList.add('menu-open'); // Adiciona a classe para mover o botão
            if (window.innerWidth > 768) { // Em telas grandes, empurra o conteúdo
                if (mainContent) mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
            } else { // Em telas pequenas, cria um overlay
                createOverlay(); // Garante que o overlay é criado
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Impede scroll do body
            }
        }
    }

    function closeMenu() {
        if (sideMenu) {
            sideMenu.classList.remove('open');
            if (menuToggleBtn) menuToggleBtn.classList.remove('menu-open'); // Remove a classe para retornar o botão
            if (mainContent) mainContent.style.marginLeft = '0'; // Volta o conteúdo para a posição original
            if (overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = ''; // Restaura scroll do body
            }
        }
    }

    // Event Listeners para o menu lateral
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', openMenu);
    }
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMenu);
    }

    // Ajusta o layout ao redimensionar a janela
    window.addEventListener('resize', () => {
        if (sideMenu && mainContent && menuToggleBtn) { // Verifica se os elementos existem
            if (window.innerWidth > 768 && sideMenu.classList.contains('open')) {
                mainContent.style.marginLeft = sideMenu.offsetWidth + 'px';
                menuToggleBtn.classList.add('menu-open');
                if (overlay) { // Garante que o overlay é desativado em desktop
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            } else if (window.innerWidth <= 768 && sideMenu.classList.contains('open')) {
                mainContent.style.marginLeft = '0'; // Garante que o conteúdo não seja empurrado em mobile
                menuToggleBtn.classList.remove('menu-open');
                createOverlay(); // Garante que o overlay existe para ser ativado
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else { // Se o menu estiver fechado, garante que tudo está na posição padrão
                mainContent.style.marginLeft = '0';
                menuToggleBtn.classList.remove('menu-open');
                if (overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        }
    });

    // Inicialização para garantir que o overlay é criado se o menu for aberto em mobile
    if (window.innerWidth <= 768) {
        createOverlay();
    }

    // Log de aviso se os elementos do menu não forem encontrados
    if (!sideMenu || !menuToggleBtn || !closeMenuBtn || !mainContent) {
        console.warn('⚠️ Elementos do menu lateral (side-menu, menu-toggle-btn, close-menu-btn, main-content) não encontrados. O menu pode não funcionar.');
    }
});
