document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_STORAGE_KEY = 'agendaActivities';
    let activities = [];

    // Dados do Excel que você forneceu, convertidos para JSON
    const initialActivitiesFromExcel = [
        { id: 1, data: "2025-12-08", area: "Processos", atividade: "Painel Lista Mestra BI", etapa: "Upload de Registro", descricao: "Início de Upload dos registros de 2024 do arquivo Controle de Informação documentada - G3SA" },
        { id: 2, data: "2025-12-09", area: "Processos", atividade: "Painel Lista Mestra BI", etapa: "Upload de Registro", descricao: "Término de Upload dos registros de 2024 do arquivo Controle de Informação documentada - G3SA" },
        { id: 3, data: "2025-12-09", area: "Processos", atividade: "Treinamento", etapa: "Alinhamento", descricao: "Reunião de alinhamento com a gestora Gabriela Sotero sobre o treinamento para o cliente Logiks sobre agilidade de documentos de processos" },
        { id: 4, data: "2025-12-10", area: "Processos", atividade: "Painel Lista Mestra BI", etapa: "Configuração", descricao: "Iniciado a configuração do cartão dos setores da empresa e a configuração de estilo como deixar duas colunas de dados para cada item, além deixar com as bordas arredondadas.\nAinda preciso procurar um layout que seja atraente para criar, seja por html, seja pelo próprio BI." },
        { id: 5, data: "2025-12-10", area: "Processos", atividade: "Painel Lista Mestra BI", etapa: "Upload de Registro", descricao: "Upload de 53 registros dos documentos de 2023 do arquivo Controle de Informação documentada - G3SA" },
        { id: 6, data: "2025-12-10", area: "Processos", atividade: "Treinamento", etapa: "Documentação", descricao: "Criação do documento com a degravação das ideias e organização" },
        { id: 7, data: "2025-12-10", area: "Processos", atividade: "GestAll", etapa: "Base", descricao: "Auxílio para o Steven sobre interpretação da planilha do DP" },
        { id: 8, data: "2025-12-11", area: "Processos", atividade: "GestAll", etapa: "Análise Fórmulas", descricao: "Realizada a análise das fórmulas do arquivo do DP para verificar o funcionamento" },
        { id: 9, data: "2025-12-11", area: "Processos", atividade: "Treinamento", etapa: "Apresentação", descricao: "Início da criação do material para o treinamento de segunda-feira" },
        { id: 10, data: "2025-12-11", area: "Processos", atividade: "GestAll", etapa: "Reunião", descricao: "Reunião com a supervisora Hellen Mariano para entendimento e alinhamento de regras do DP para refletir no gestAll. Participação com Steven e Rodrigo" },
        { id: 11, data: "2025-12-12", area: "Processos", atividade: "Treinamento", etapa: "Apresentação", descricao: "Alinhamento sobre a apresentação e continuação dos trabalhos para customização da apresentação" },
        { id: 12, data: "2025-12-15", area: "Processos", atividade: "Treinamento", etapa: "1º dia de treinamento", descricao: "A manhã foi dedicada a testes de equipamento e a apresentação do primeiro módulo do treinamento de Processos e IA." },
        { id: 13, data: "2025-12-15", area: "Processos", atividade: "Treinamento", etapa: "Material de Apoio - Dia 1", descricao: "Criação do material de apoio do primeiro dia de treinamento, entregue para validação da gestora" },
        { id: 14, data: "2025-12-16", area: "Processos", atividade: "Treinamento", etapa: "2º dia de treinamento", descricao: "A manhã foi dedicada a testes de equipamento e a apresentação do segundo módulo do treinamento de Processos e IA." },
        { id: 15, data: "2025-12-16", area: "Processos", atividade: "Treinamento", etapa: "Material de Apoio - Dia 2", descricao: "Atualização do material de apoio com os assuntos do segundo dia de treinamento." },
        { id: 16, data: "2025-12-16", area: "Processos", atividade: "Transcrição", etapa: "Transcrição Grupo", descricao: "Início do trabalho de transcrição e documentação do grupo Projeção de Resultado da Tax All." },
        { id: 17, data: "2025-12-16", area: "Processos", atividade: "Transcrição", etapa: "Ata de Reunião", descricao: "Criação do documento da ata de reunião sobre regras dos benefícios da área de Gente e Gestão" },
        { id: 18, data: "2025-12-17", area: "Processos", atividade: "Treinamento", etapa: "Material de Apoio - Dia 3", descricao: "Atualização do material de apoio com os assuntos do terceiro dia de treinamento" },
        { id: 19, data: "2025-12-17", area: "Processos", atividade: "Transcrição", etapa: "Transcrição Grupo", descricao: "Finalização da análise do diagnóstico do bate-papo e planilhas do grupo Projeção de Resultado da Tax All" },
        { id: 20, data: "2025-12-17", area: "Processos", atividade: "Treinamento", etapa: "3º dia de treinamento", descricao: "A manhã foi dedicada a testes de equipamento e a apresentação do terceiro módulo do treinamento de Processos e IA." },
        { id: 21, data: "2025-12-18", area: "Processos", atividade: "Treinamento", etapa: "4º dia de treinamento", descricao: "A manhã foi dedicada a testes de equipamento e encerramento do treinamento de Processos e IA." },
        { id: 22, data: "2025-12-18", area: "Processos", atividade: "Tabela Concimed", etapa: "Separação de Dados", descricao: "Atividade de configuração da tabela da concimed separando Hospitais, fonte pagadora, Médicos e fazendo o espelho para o BD" },
        { id: 23, data: "2025-12-18", area: "Processos", atividade: "Backup", etapa: "Upload de arquivos", descricao: "Realizado o upload do arquivo de Backup da Onvio no drive do google" },
        { id: 24, data: "2025-12-19", area: "Processos", atividade: "Treinamento", etapa: "Material de Apoio", descricao: "Continuação do trabalho de atualização da apostila de treinamento para validação" },
        { id: 25, data: "2025-12-19", area: "Processos", atividade: "Treinamento", etapa: "Material de Apoio", descricao: "Finalização da atualização do material de apoio do treinamento e envio de todo o material (Gravações, Apostila e Modelo de documentos)" },
        { id: 26, data: "2025-12-22", area: "Processos", atividade: "Painel Lista Mestra BI", etapa: "Configuração", descricao: "Encerramento da listagem do card dos setores e debugando o código do card dos documentos que não reage a um filtro específico." },
        { id: 27, data: "2025-12-22", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Configuração BD", descricao: "- Reunião na parte da manhã com a Beatriz Lopes Vieira Bonfim\n'- Atualização de uma planilha base online com os registros de 2025 para fazer os testes de BI\n'- Configuração de cálculo de hora útil de trabalho dos chamados da planilha." },
        { id: 28, data: "2025-12-23", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Painel", descricao: "- Últimos testes dos BDs Legado e Novos Registros do Painel\n'- Configuração do BI dos campos de hora para calcular o SLA e outras configurações." },
        { id: 29, data: "2025-12-24", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Painel", descricao: "- Últimos testes dos BDs Legado e Novos Registros do Painel\n'- Configuração do BI dos campos de hora para calcular o SLA e outras configurações na atividade de Novos Registros" },
        { id: 30, data: "2025-12-24", area: "Processos", atividade: "Documentação", etapa: "Checlist", descricao: "- Criação do documento de Checklist de início de reunião e repassado para validação" },
        { id: 31, data: "2025-12-26", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Painel", descricao: "- Criação de uma segunda versão de layout do painel de BI para apresentar na reunião das 10:30" },
        { id: 32, data: "2025-12-26", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Reunião Validação", descricao: "- Realização da pirmeira reunião de validação e modificações do painel de indicadores da área do CS" },
        { id: 33, data: "2025-12-29", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Painel", descricao: "- '- Finalização do Painel dos indicadores do CS, conforme os pontos levantados na reunião de sexta-feira. \n'- Painel encaminhado para a gestora Gabriela Sotero" },
        { id: 34, data: "2025-12-29", area: "Processos", atividade: "Painel Lista Mestra BI", etapa: "Painel", descricao: "- Criação da segunda versão do painel do BI sem flashcard e mais com tabelas para vários indicadores." },
        { id: 35, data: "2025-12-30", area: "Processos", atividade: "Projeto Contábil", etapa: "Planejamento", descricao: "- Criação do planejamento do projeto do contábil - Fechamento Contábil, aguardando a data para a reunião de kick off" },
        { id: 36, data: "2025-12-30", area: "Processos", atividade: "Planilha Fiscal", etapa: "CBS/IBS", descricao: "- Auxílio com a planilha de CBS/IBS - Fazer o BD com a correlação do CBS/IBS" },
        { id: 37, data: "2025-12-31", area: "Processos", atividade: "Painel CS Ocorrências", etapa: "Kick Off", descricao: "-Conversa com a supervisora Natália Coutinho sobre a construção de um novo BI para a área de ocorrências da Alldax.\n'- Início da análise da planilha e do painel já construído" },
        { id: 38, data: "2026-01-02", area: "Processos", atividade: "Painel CS Ocorrências", etapa: "Painel", descricao: "- Criação de duas versões customizadas de teste da planilha de dados do CS para a análise." },
        { id: 39, data: "2026-01-02", area: "Processos", atividade: "Weekly", etapa: "Reunião", descricao: "- Envio das atividades da semana no Teams e no bitrix junto com os relatórios" },
        { id: 40, data: "2026-01-02", area: "Processos", atividade: "Prontuário", etapa: "Prints e Videos", descricao: "Criação de prints e videos sobre o passo a passo do sistema Prontuário." },
        { id: 41, data: "2026-01-05", area: "Processos", atividade: "Painel CS Ocorrências", etapa: "Painel", descricao: "- Foi realizado a configuração da tela de Análise Interna com a inclusão das empresas que registraram Churn e a data do registro. \n'- Configuração da página análise de ocorrências com todos os filtros.\n'- Configuração de fórmula na planilha base para gerar o texto de envio para o canal whatsapp.\n'- Falta aprender a mexer com o KPI para mostrar a variação de chamado (segunda fase)" },
        { id: 42, data: "2026-01-05", area: "Processos", atividade: "Fechamento Contábil", etapa: "Planejamento", descricao: "- Criação da apresentação em PPT do cronograma das atividades do Projeto Contábil - Fechamento Contábil.\n'- Criação do documento do cronograma de atividades do projeto. Foi enviado para validação" },
        { id: 43, data: "2026-01-05", area: "Processos", atividade: "Ajuste Desoneração da Folha", etapa: "Checklist", descricao: "- Criação do documento de Checklist do projeto Ajuste Desoneração Folha" },
        { id: 44, data: "2026-01-06", area: "Processos", atividade: "Testes Prontuário", etapa: "Avaliação e Validação", descricao: "- Foi iniciado os testes dos itens levantados do sistema prontuário.\n'- Foram testados 31 itens (metade do sistema), incluindo status, observações de cada item testado" },
        { id: 45, data: "2026-01-06", area: "Processos", atividade: "Painel CS Ocorrências", etapa: "Painel", descricao: "- Envio do painel para validação da supervisora Gabriela Sotero" },
        { id: 46, data: "2026-01-06", area: "Processos", atividade: "Paineis BI", etapa: "Migração", descricao: "- Migração dos paineis do BI para conta powerbi@g3sa.com.br" },
        { id: 47, data: "2026-01-07", area: "Processos", atividade: "Testes Prontuário", etapa: "Avaliação e Validação", descricao: "- Finalizado o primeiro teste dos itens levantados do sistema prontuário\n'- Foram 17 itens implementados, 6 itens parcialmente implementados, 40 não implementados.\n'- Envio da planilha com os pontos observados e status\n'- Task atualizada com os dados levantados e arquivo das observações" },
        { id: 48, data: "2026-01-07", area: "Processos", atividade: "Fechamento Contábil", etapa: "Reunião", descricao: "- Reunião com o supervisor Wallace para alinhamento das atividades do projeto Contábil - Fechamento Contábil" },
        { id: 49, data: "2026-01-07", area: "Processos", atividade: "Ajuste Desoneração da Folha", etapa: "Checklist", descricao: "- Conversa com a supervisora Janaina Santos solicitando uma gravação sobre a operacionalização da Desoneração da Folha para a criação do IT, POP e Fluxograma" },
        { id: 50, data: "2026-01-07", area: "Processos", atividade: "Fechamento Contábil", etapa: "Checklist Acompanhamento", descricao: "- Criação do documento de checklist de acompanhamento do projeto Contábil - Fechamento Contábil" },
        { id: 51, data: "2026-01-08", area: "Processos", atividade: "Fechamento Contábil", etapa: "Acompanhamento", descricao: "- Primeiro dia de acompanhamento das atividades do fechamento contábil - analista Gabryela" },
        { id: 52, data: "2026-01-08", area: "Processos", atividade: "Painel CS Ocorrências", etapa: "Validação", descricao: "- Reunião de Validação e levantamento de pontos de ajuste para entregar na semana que vem" },
        { id: 53, data: "2026-01-08", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Validação", descricao: "- Reunião de validação do Painel de indicadores do CS da Tax All" },
        { id: 54, data: "2026-01-09", area: "Processos", atividade: "Sistema Prontuário", etapa: "2ª Validação", descricao: "- Foram avaliados 40 itens que não tinham sido implantados no sistema prontuário.\n'- No total tivemos 3 itens implementados, 6 Parcialmente Implementados e 31 que ainda não tinham sido implementados.\n'- Relatório foi entregue na sexta-feira, dia 09/01/2026 no final do expediente" },
        { id: 55, data: "2026-01-09", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Validação", descricao: "- Foi realizada a reunião de validação do Painel CS Indicadores da Tax All com a participação da diretora Ana Carolina." },
        { id: 56, data: "2026-01-12", area: "Processos", atividade: "Painel CS Indicadores", etapa: "Entrega", descricao: "- Entrega do painel de indicadores da equipe do CS da Tax All" },
        { id: 57, data: "2026-01-12", area: "Processos", atividade: "Painel CS Ocorrências", etapa: "Entrega", descricao: "- Entrega do painel de indicadores da equipe do CS da Alldax além da realização dos últimos testes" },
        { id: 58, data: "2026-01-12", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Início do preenchimento do controle de processos, colocando informações adicionais a cada documento" },
        { id: 59, data: "2026-01-13", area: "Processos", atividade: "Fechamento Contábil", etapa: "Acompanhamento", descricao: "- Finalização do acompanhamento dos procedimentos do fechamento contábil" },
        { id: 60, data: "2026-01-13", area: "Processos", atividade: "Café com os sócios", etapa: "Reunião", descricao: "- Reunião com o sócio William Almeida e participantes da área fiscal e contábil para treinamento sobre auditoria contábil e Regime tributário internacional" },
        { id: 61, data: "2026-01-13", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Continuação do preenchimento da planilha de controle de processos, colocando informações de Descrição e Checklist" },
        { id: 62, data: "2026-01-13", area: "Processos", atividade: "Fechamento Contábil", etapa: "Consolidação", descricao: "- Início da consolidação dos procedimentos do fechamento contábil, parte de conversão do arquivo até a importação no sistema domínio" },
        { id: 63, data: "2026-01-14", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Continuação da atividade de preenchimento das informações do controle de processos, terminando com as ITs referente aos grupos." },
        { id: 64, data: "2026-01-14", area: "Processos", atividade: "Sistema Prontuário", etapa: "3ª Validação", descricao: "- Realizada a terceira validação dos pontos levantados na 2ª. A maioria dos pontos foram validados" },
        { id: 65, data: "2026-01-14", area: "Processos", atividade: "Fechamento Contábil", etapa: "Consolidação", descricao: "- Criação da lista de atividades desde a configuração do layout, conversão do .txt e importação na domínio" },
        { id: 66, data: "2026-01-14", area: "Processos", atividade: "Desoneração Folha", etapa: "Documentação", descricao: "- Foi realizada a interpretação da operacionalização da desoneração da Folha para o exercício de 2026 e início da criação da documentação" },
        { id: 67, data: "2026-01-15", area: "Processos", atividade: "Desoneração Folha", etapa: "Documentação", descricao: "- Criação dos documentos fluxograma e Instrução de trabalho do processo de Desoneração de Folha" },
        { id: 68, data: "2026-01-15", area: "Processos", atividade: "Fechamento Contábil", etapa: "Documentação", descricao: "- Criação do documento de relatório de GAPS e consolidação do As Is do processo do Fechamento Contábil, além de acessar o sistema Acessórias" },
        { id: 69, data: "2025-01-15", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Continuação da atividade de preenchimento das informações do controle de processos, preenchimento o as descrições dos documentos." },
        { id: 70, data: "2026-01-16", area: "Processos", atividade: "Weekly", etapa: "Reunião", descricao: "- Mediação da Reunião Weekly e criação dos documentos de cada desenvolvedor e analista" },
        { id: 71, data: "2026-01-16", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Finalização dos preenchimentos dos documentos que tem texto de objetivo e início de preenchimento das palavras chaves" },
        { id: 72, data: "2026-01-19", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Finalizados os preenchimentos das palavras chaves dos documentos que possuem descrição, ou derivados do mesmo processo. São 171 registros com descrição e palavra chave" },
        { id: 73, data: "2026-01-19", area: "Processos", atividade: "Weekly", etapa: "Reunião", descricao: "- Reunião sobre a nova gestão de informação dentro do bitrix, regras de governança." },
        { id: 74, data: "2026-01-20", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Finalizados os preenchimentos das descrições e das palavras chaves dos manuais de processos. No total tem 211 registros com descrição e palavra chave" },
        { id: 75, data: "2026-01-20", area: "Processos", atividade: "Planilha CAC - LTV", etapa: "Estrutura", descricao: "- Averiguação da estrutura das tabelas das informações do CAC LTV e separação por planilha" },
        { id: 76, data: "2026-01-20", area: "Processos", atividade: "Desoneração Folha", etapa: "POP Video", descricao: "- Gravação da utilização dos sistemas da operacionalização da desonreação da folha, além da criação dos artefatos POP Video e a segunda versão do IT com os prints dos sistemas" },
        { id: 77, data: "2026-01-21", area: "Processos", atividade: "Planilha CAC - LTV", etapa: "Estrutura", descricao: "- Criação do documento de base dos dados do CAC e LTV pegando os dados dos dois Power BI construídos para fazer uma única base" },
        { id: 78, data: "2026-01-21", area: "Processos", atividade: "Power BI Bitrix", etapa: "Auxílio", descricao: "- Auxílio ao desenvolvedor Rodrigo sobre o funcionamento do painel do NPS do CS da Tax All" },
        { id: 79, data: "2026-01-22", area: "Processos", atividade: "Planilha CAC - LTV", etapa: "Reunião", descricao: "- Reunião com a supervisora do CS da Tax All Beatriz sobre as informações que devem ser exibidas no BI do cálculo do CAC e LTV" },
        { id: 80, data: "2026-01-22", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Continuação do preenchimento da planilha de controle de processos. Continuação da inserção das descrições e palavras chaves." },
        { id: 81, data: "2026-01-22", area: "Processos", atividade: "Prontuário", etapa: "Verificação e Login", descricao: "- Início do trabalho de login dos usuários do Prontuário Simpl3s. Nessa atividade tive a ajuda do Arthur e do Rodrigo." },
        { id: 82, data: "2026-01-23", area: "Processos", atividade: "Weekly", etapa: "Reunião", descricao: "- Reunião Weekly descrevendo as atividdades da semana realizadas e o planejamento para a próxima semana" },
        { id: 83, data: "2026-01-23", area: "Processos", atividade: "Planilha Controle", etapa: "Preenchimento", descricao: "- Continuação do preenchimento da planilha de controle de processos. Continuação da inserção das descrições e palavras chaves.\nAté o momento tem 247 registros de descrição e palavras chave." },
        { id: 84, data: "2026-01-23", area: "Processos", atividade: "Prontuário", etapa: "Verificação e Login", descricao: "- Continuação do trabalho de login dos usuários do Prontuário Simpl3s. Com a ajuda do Arthur e do Rodrigo" }
    ];

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
    // NOVO ELEMENTO: Botão de Importação
    const importExcelDataBtn = document.getElementById('import-excel-data-btn');

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

    // NOVA FUNÇÃO: Importar dados do Excel
    function importExcelData() {
        if (activities.length > 0) {
            const confirmOverwrite = confirm(
                'Já existem atividades cadastradas. Deseja sobrescrever os dados existentes com os dados do Excel?\n\n' +
                'ATENÇÃO: Isso apagará todas as atividades atuais e as substituirá.'
            );
            if (!confirmOverwrite) {
                return; // Usuário cancelou a sobrescrita
            }
        }

        activities = [...initialActivitiesFromExcel]; // Copia os dados do Excel para o array de atividades
        saveActivities(); // Salva no localStorage
        populateFilterSelects(); // Atualiza os filtros
        currentPage = 1; // Volta para a primeira página
        renderActivities(); // Renderiza a tabela
        alert('Dados do Excel importados com sucesso!');
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

    // Event listener para o botão de importação
    importExcelDataBtn.addEventListener('click', importExcelData);

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
