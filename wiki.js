document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos do DOM ---
    const searchInput = document.getElementById('search-input');
    const newPageBtn = document.getElementById('new-page-btn');
    const wikiIndex = document.getElementById('wiki-index');
    const breadcrumbs = document.getElementById('breadcrumbs');
    const pageView = document.getElementById('page-view');

    // Modal de Edicao
    const editPageModal = document.getElementById('edit-page-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const modalTitle = document.getElementById('modal-title');
    const pageForm = document.getElementById('page-form');
    const pageIdInput = document.getElementById('page-id');
    const pageTitleInput = document.getElementById('page-title');
    const pageAuthorInput = document.getElementById('page-author');
    const pageCategorySelect = document.getElementById('page-category');
    const pageParentSelect = document.getElementById('page-parent');
    const pageTagsInput = document.getElementById('page-tags');
    const pageContentTextarea = document.getElementById('page-content');

    // Modal de Historico
    const historyModal = document.getElementById('history-modal');
    const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const historyContent = document.getElementById('history-content');

    // Menu Lateral
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.querySelector('.overlay');
    const mainContent = document.querySelector('.main-content');

    // --- Variaveis de Estado ---
    let pages = [];
    let currentPageId = 1;
    let currentViewingPageId = null;

    // --- Funcoes do Menu Lateral ---
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

    // --- Funcoes de Persistencia ---
    function savePages() {
        localStorage.setItem('wiki', JSON.stringify(pages));
    }

    function loadPages() {
        const stored = localStorage.getItem('wiki');
        if (stored) {
            pages = JSON.parse(stored);
            if (pages.length > 0) {
                const ids = [];
                for (let i = 0; i < pages.length; i++) {
                    ids.push(pages[i].id);
                }
                currentPageId = Math.max.apply(null, ids) + 1;
            }
        }
    }

    // --- Funcoes Auxiliares ---
    function generateSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
    }

    function getPageBySlug(slug) {
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].slug === slug) {
                return pages[i];
            }
        }
        return null;
    }

    function getPageById(id) {
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].id === id) {
                return pages[i];
            }
        }
        return null;
    }

    function getChildPages(parentId) {
        const children = [];
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].paginaPai === parentId) {
                children.push(pages[i]);
            }
        }
        return children;
    }

    function getBreadcrumb(pageId) {
        const breadcrumb = [];
        let currentPage = getPageById(pageId);

        while (currentPage) {
            breadcrumb.unshift(currentPage);
            currentPage = currentPage.paginaPai ? getPageById(currentPage.paginaPai) : null;
        }

        return breadcrumb;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function processInternalLinks(content) {
        let result = escapeHtml(content);
        const parts = result.split('[[');

        if (parts.length === 1) {
            return result;
        }

        let output = parts[0];

        for (let i = 1; i < parts.length; i++) {
            const closeBracket = parts[i].indexOf(']]');

            if (closeBracket !== -1) {
                const pageName = parts[i].substring(0, closeBracket);
                const rest = parts[i].substring(closeBracket + 2);
                const slug = generateSlug(pageName);
                const linkedPage = getPageBySlug(slug);
                const className = linkedPage ? 'internal-link' : 'internal-link broken';
                const title = linkedPage ? 'Clique para abrir' : 'Página não encontrada';

                output += '<a href="#" class="' + className + '" data-slug="' + slug + '" title="' + title + '">' + pageName + '</a>' + rest;
            } else {
                output += '[[' + parts[i];
            }
        }

        return output;
    }

    function attachInternalLinkListeners() {
        const links = document.querySelectorAll('.internal-link');
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function(e) {
                e.preventDefault();
                const slug = this.dataset.slug;
                const page = getPageBySlug(slug);
                if (page) {
                    viewPage(page.id);
                } else {
                    alert('Página "' + slug + '" não encontrada!');
                }
            });
        }
    }

    function findRelatedPages(page) {
        const related = [];
        const parts = page.conteudo.split('[[');

        for (let i = 1; i < parts.length; i++) {
            const closeBracket = parts[i].indexOf(']]');
            if (closeBracket !== -1) {
                const pageName = parts[i].substring(0, closeBracket);
                const slug = generateSlug(pageName);
                const linkedPage = getPageBySlug(slug);

                if (linkedPage) {
                    let alreadyAdded = false;
                    for (let j = 0; j < related.length; j++) {
                        if (related[j].id === linkedPage.id) {
                            alreadyAdded = true;
                            break;
                        }
                    }
                    if (!alreadyAdded) {
                        related.push(linkedPage);
                    }
                }
            }
        }

        const childPages = getChildPages(page.id);
        for (let i = 0; i < childPages.length; i++) {
            let alreadyAdded = false;
            for (let j = 0; j < related.length; j++) {
                if (related[j].id === childPages[i].id) {
                    alreadyAdded = true;
                    break;
                }
            }
            if (!alreadyAdded) {
                related.push(childPages[i]);
            }
        }

        return related;
    }

    // --- Renderizacao do Indice ---
    function renderIndex() {
        wikiIndex.innerHTML = '';

        const categories = ['Home', 'Processos', 'Tutoriais', 'Políticas', 'FAQ', 'Técnico'];

        for (let c = 0; c < categories.length; c++) {
            const category = categories[c];
            const categoryPages = [];

            for (let i = 0; i < pages.length; i++) {
                if (pages[i].categoria === category && !pages[i].paginaPai) {
                    categoryPages.push(pages[i]);
                }
            }

            if (categoryPages.length > 0) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'index-category';

                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category;
                categoryDiv.appendChild(categoryTitle);

                const pagesDiv = document.createElement('div');
                pagesDiv.className = 'category-pages';

                for (let i = 0; i < categoryPages.length; i++) {
                    renderPageInIndex(categoryPages[i], pagesDiv, 0);
                }

                categoryDiv.appendChild(pagesDiv);
                wikiIndex.appendChild(categoryDiv);
            }
        }
    }

    function renderPageInIndex(page, container, level) {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'page-link' + (level > 0 ? ' child' : '');
        link.textContent = page.titulo;
        link.dataset.pageId = page.id;

        if (currentViewingPageId === page.id) {
            link.classList.add('active');
        }

        link.addEventListener('click', function(e) {
            e.preventDefault();
            viewPage(page.id);
        });

        container.appendChild(link);

        const childPages = getChildPages(page.id);
        for (let i = 0; i < childPages.length; i++) {
            renderPageInIndex(childPages[i], container, level + 1);
        }
    }

    // --- Renderizacao de Breadcrumbs ---
    function renderBreadcrumbs(pageId) {
        const breadcrumb = getBreadcrumb(pageId);
        breadcrumbs.innerHTML = '';

        const homeLink = document.createElement('a');
        homeLink.href = '#';
        homeLink.textContent = '🏠 Home';
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            showWelcome();
        });
        breadcrumbs.appendChild(homeLink);

        for (let i = 0; i < breadcrumb.length; i++) {
            const page = breadcrumb[i];
            const separator = document.createElement('span');
            separator.textContent = '>';
            breadcrumbs.appendChild(separator);

            if (i === breadcrumb.length - 1) {
                const current = document.createElement('strong');
                current.textContent = page.titulo;
                breadcrumbs.appendChild(current);
            } else {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = page.titulo;
                link.dataset.pageId = page.id;
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    viewPage(parseInt(this.dataset.pageId));
                });
                breadcrumbs.appendChild(link);
            }
        }
    }

    // --- Visualizacao de Pagina ---
    function viewPage(pageId) {
        const page = getPageById(pageId);
        if (!page) return;

        currentViewingPageId = pageId;
        renderIndex();
        renderBreadcrumbs(pageId);

        let html = '<div class="page-header">';
        html += '<h1>' + escapeHtml(page.titulo) + '</h1>';
        html += '<div class="page-meta">';
        html += '<span>📁 ' + escapeHtml(page.categoria) + '</span>';
        html += '<span>👤 ' + escapeHtml(page.autor) + '</span>';
        html += '<span>📅 Criado em ' + formatDate(page.dataCriacao) + '</span>';
        if (page.dataAtualizacao !== page.dataCriacao) {
            html += '<span>✏️ Atualizado em ' + formatDate(page.dataAtualizacao) + '</span>';
        }
        html += '</div>';

        if (page.tags && page.tags.length > 0) {
            html += '<div class="page-tags">';
            for (let i = 0; i < page.tags.length; i++) {
                html += '<span class="tag">' + escapeHtml(page.tags[i]) + '</span>';
            }
            html += '</div>';
        }

        html += '</div>';

        html += '<div class="page-body">' + processInternalLinks(page.conteudo) + '</div>';

        const relatedPages = findRelatedPages(page);
        if (relatedPages.length > 0) {
            html += '<div class="related-pages">';
            html += '<h3>🔗 Páginas Relacionadas</h3>';
            html += '<ul>';
            for (let i = 0; i < relatedPages.length; i++) {
                html += '<li><a href="#" class="internal-link" data-slug="' + relatedPages[i].slug + '">' + escapeHtml(relatedPages[i].titulo) + '</a></li>';
            }
            html += '</ul>';
            html += '</div>';
        }

        html += '<div class="page-actions">';
        html += '<button class="action-btn edit-page-btn" onclick="editPageById(' + page.id + ')">✏️ Editar</button>';
        html += '<button class="action-btn delete-page-btn" onclick="deletePageById(' + page.id + ')">🗑️ Excluir</button>';
        html += '<button class="action-btn history-btn" onclick="showHistory(' + page.id + ')">📝 Histórico</button>';
        html += '</div>';

        pageView.innerHTML = html;

        attachInternalLinkListeners();
    }

    function showWelcome() {
        currentViewingPageId = null;
        renderIndex();
        breadcrumbs.innerHTML = '';
        pageView.innerHTML = '<div class="welcome-message"><h2>👋 Bem-vindo à Wiki Interna!</h2><p>Selecione uma página no índice lateral ou crie uma nova página para começar.</p></div>';
    }

    // --- CRUD de Paginas ---
    function openNewPageModal() {
        pageIdInput.value = '';
        pageTitleInput.value = '';
        pageAuthorInput.value = '';
        pageCategorySelect.value = '';
        pageParentSelect.value = '';
        pageTagsInput.value = '';
        pageContentTextarea.value = '';

        populateParentSelect();
        modalTitle.textContent = 'Nova Página';
        editPageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function editPageById(pageId) {
        const page = getPageById(pageId);
        if (!page) return;

        pageIdInput.value = page.id;
        pageTitleInput.value = page.titulo;
        pageAuthorInput.value = page.autor;
        pageCategorySelect.value = page.categoria;
        pageParentSelect.value = page.paginaPai || '';
        pageTagsInput.value = page.tags ? page.tags.join(', ') : '';
        pageContentTextarea.value = page.conteudo;

        populateParentSelect(page.id);
        modalTitle.textContent = 'Editar Página';
        editPageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function deletePageById(pageId) {
        const page = getPageById(pageId);
        if (!page) return;

        const childPages = getChildPages(pageId);
        if (childPages.length > 0) {
            alert('Não é possível excluir esta página porque ela possui subpáginas. Exclua as subpáginas primeiro.');
            return;
        }

        if (confirm('Tem certeza que deseja excluir a página "' + page.titulo + '"?\n\nEsta ação não pode ser desfeita!')) {
            const newPages = [];
            for (let i = 0; i < pages.length; i++) {
                if (pages[i].id !== pageId) {
                    newPages.push(pages[i]);
                }
            }
            pages = newPages;
            savePages();
            showWelcome();
            renderIndex();
            alert('Página excluída com sucesso!');
        }
    }

    function populateParentSelect(excludeId) {
        pageParentSelect.innerHTML = '<option value="">Nenhuma (Página Raiz)</option>';

        for (let i = 0; i < pages.length; i++) {
            if (!excludeId || pages[i].id !== excludeId) {
                const option = document.createElement('option');
                option.value = pages[i].id;
                option.textContent = pages[i].titulo + ' (' + pages[i].categoria + ')';
                pageParentSelect.appendChild(option);
            }
        }
    }

    function savePage(event) {
        event.preventDefault();

        const id = pageIdInput.value ? parseInt(pageIdInput.value) : currentPageId++;
        const titulo = pageTitleInput.value.trim();
        const autor = pageAuthorInput.value.trim();
        const categoria = pageCategorySelect.value;
        const paginaPai = pageParentSelect.value ? parseInt(pageParentSelect.value) : null;
        const tagsText = pageTagsInput.value;
        const tagsParts = tagsText.split(',');
        const tags = [];
        for (let i = 0; i < tagsParts.length; i++) {
            const tag = tagsParts[i].trim();
            if (tag) {
                tags.push(tag);
            }
        }
        const conteudo = pageContentTextarea.value.trim();
        const slug = generateSlug(titulo);

        let existingPage = null;
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].slug === slug && pages[i].id !== id) {
                existingPage = pages[i];
                break;
            }
        }

        if (existingPage) {
            alert('Já existe uma página com este título! Por favor, escolha um título diferente.');
            return;
        }

        const now = new Date().toISOString();

        if (pageIdInput.value) {
            for (let i = 0; i < pages.length; i++) {
                if (pages[i].id === id) {
                    const oldContent = pages[i].conteudo;
                    pages[i].titulo = titulo;
                    pages[i].slug = slug;
                    pages[i].autor = autor;
                    pages[i].categoria = categoria;
                    pages[i].paginaPai = paginaPai;
                    pages[i].tags = tags;
                    pages[i].conteudo = conteudo;
                    pages[i].dataAtualizacao = now;

                    if (oldContent !== conteudo) {
                        pages[i].versoes.push({
                            versao: pages[i].versoes.length + 1,
                            conteudo: conteudo,
                            data: now,
                            autor: autor
                        });
                    }
                    break;
                }
            }
        } else {
            const newPage = {
                id: id,
                titulo: titulo,
                slug: slug,
                conteudo: conteudo,
                paginaPai: paginaPai,
                categoria: categoria,
                tags: tags,
                dataCriacao: now,
                dataAtualizacao: now,
                autor: autor,
                versoes: [{
                    versao: 1,
                    conteudo: conteudo,
                    data: now,
                    autor: autor
                }],
                visualizacoes: 0
            };
            pages.push(newPage);
        }

        savePages();
        closeEditModal();
        renderIndex();
        viewPage(id);
        alert('Página salva com sucesso!');
    }

    function closeEditModal() {
        editPageModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // --- Historico ---
    function showHistory(pageId) {
        const page = getPageById(pageId);
        if (!page) return;

        let html = '<h3>Página: ' + escapeHtml(page.titulo) + '</h3>';

        if (page.versoes && page.versoes.length > 0) {
            for (let i = page.versoes.length - 1; i >= 0; i--) {
                const versao = page.versoes[i];
                html += '<div class="history-item">';
                html += '<div class="history-item-header">';
                html += '<span class="version-number">Versão ' + versao.versao + '</span>';
                html += '<span class="history-meta">📅 ' + formatDate(versao.data) + ' | 👤 ' + escapeHtml(versao.autor) + '</span>';
                html += '</div>';
                html += '<div class="history-content">' + escapeHtml(versao.conteudo) + '</div>';
                html += '</div>';
            }
        } else {
            html += '<p>Nenhum histórico disponível.</p>';
        }

        historyContent.innerHTML = html;
        historyModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeHistoryModal() {
        historyModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // --- Busca ---
    function searchPages() {
        const query = searchInput.value.toLowerCase().trim();

        if (!query) {
            renderIndex();
            return;
        }

        const results = [];
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            let match = false;

            if (page.titulo.toLowerCase().indexOf(query) !== -1) {
                match = true;
            } else if (page.conteudo.toLowerCase().indexOf(query) !== -1) {
                match = true;
            } else {
                for (let j = 0; j < page.tags.length; j++) {
                    if (page.tags[j].toLowerCase().indexOf(query) !== -1) {
                        match = true;
                        break;
                    }
                }
            }

            if (match) {
                results.push(page);
            }
        }

        wikiIndex.innerHTML = '';

        if (results.length === 0) {
            wikiIndex.innerHTML = '<p style="padding: 10px; color: #6c757d;">Nenhuma página encontrada.</p>';
            return;
        }

        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'index-category';

        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = 'Resultados da Busca (' + results.length + ')';
        resultsDiv.appendChild(title);

        const pagesDiv = document.createElement('div');
        pagesDiv.className = 'category-pages';

        for (let i = 0; i < results.length; i++) {
            const page = results[i];
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'page-link';
            link.textContent = page.titulo + ' (' + page.categoria + ')';
            link.dataset.pageId = page.id;
            link.addEventListener('click', function(e) {
                e.preventDefault();
                viewPage(parseInt(this.dataset.pageId));
                searchInput.value = '';
                renderIndex();
            });
            pagesDiv.appendChild(link);
        }

        resultsDiv.appendChild(pagesDiv);
        wikiIndex.appendChild(resultsDiv);
    }

    // --- Event Listeners ---
    newPageBtn.addEventListener('click', openNewPageModal);
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    pageForm.addEventListener('submit', savePage);

    closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
    closeHistoryBtn.addEventListener('click', closeHistoryModal);

    searchInput.addEventListener('input', searchPages);

    window.addEventListener('click', function(event) {
        if (event.target === editPageModal) {
            closeEditModal();
        }
        if (event.target === historyModal) {
            closeHistoryModal();
        }
    });

    menuToggleBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    window.addEventListener('resize', function() {
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

    // Torna funcoes disponiveis globalmente
    window.editPageById = editPageById;
    window.deletePageById = deletePageById;
    window.showHistory = showHistory;

    // --- Inicializacao ---
    loadPages();
    renderIndex();
    showWelcome();
});