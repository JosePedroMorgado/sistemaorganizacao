// ===================================
// FUNÇÕES DE BACKUP E RESTAURAÇÃO
// ===================================

// Função para exportar todos os dados do localStorage para um arquivo JSON
function exportData() {
    const data = {
        reports: JSON.parse(localStorage.getItem('reports')) || [],
        meetings: JSON.parse(localStorage.getItem('meetings')) || [],
        agenda: JSON.parse(localStorage.getItem('agenda')) || [],
        checklist: JSON.parse(localStorage.getItem('checklist')) || [],
        areas: JSON.parse(localStorage.getItem('areas')) || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    // Converte o objeto para JSON formatado
    const jsonString = JSON.stringify(data, null, 2);

    // Cria um blob com o conteúdo JSON
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Cria um link de download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Nome do arquivo com data e hora
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10); // AAAA-MM-DD
    const timeString = now.toTimeString().slice(0, 5).replace(':', '-'); // HH-MM
    link.download = `backup_${dateString}_${timeString}.json`;

    // Simula o clique para baixar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libera o objeto URL
    URL.revokeObjectURL(url);

    alert('Backup exportado com sucesso!');
}

// Função para importar dados de um arquivo JSON
function importData() {
    // Cria um input file temporário
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Valida se o arquivo tem a estrutura esperada
                if (!data.version || !data.exportDate) {
                    alert('Arquivo inválido! Por favor, selecione um arquivo de backup válido.');
                    return;
                }

                // Confirma antes de sobrescrever os dados
                const confirmMsg = `Tem certeza que deseja importar este backup?\n\n` +
                    `Data do backup: ${new Date(data.exportDate).toLocaleString('pt-BR')}\n\n` +
                    `ATENÇÃO: Isso irá SUBSTITUIR todos os dados atuais!`;

                if (!confirm(confirmMsg)) {
                    return;
                }

                // Restaura os dados no localStorage
                if (data.reports) localStorage.setItem('reports', JSON.stringify(data.reports));
                if (data.meetings) localStorage.setItem('meetings', JSON.stringify(data.meetings));
                if (data.agenda) localStorage.setItem('agenda', JSON.stringify(data.agenda));
                if (data.checklist) localStorage.setItem('checklist', JSON.stringify(data.checklist));
                if (data.areas) localStorage.setItem('areas', JSON.stringify(data.areas));

                alert('Backup importado com sucesso! A página será recarregada.');
                location.reload(); // Recarrega a página para atualizar os dados

            } catch (error) {
                alert('Erro ao importar o arquivo! Verifique se o arquivo é um backup válido.\n\nErro: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    // Simula o clique para abrir o seletor de arquivos
    input.click();
}

// Torna as funções disponíveis globalmente
window.exportData = exportData;
window.importData = importData;