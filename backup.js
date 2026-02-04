// ===================================
// SISTEMA DE BACKUP UNIFICADO
// Salva TODOS os dados de todas as páginas
// ===================================

function exportData() {
    const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
            checklist: JSON.parse(localStorage.getItem('checklist') || '[]'),
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
                    localStorage.setItem('checklist', JSON.stringify(importedData.data.checklist));
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

                alert('✅ Dados importados com sucesso!\n\nRecarregue a página para visualizar os dados importados.');

                // Recarrega a página após 2 segundos
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
