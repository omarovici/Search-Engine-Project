function highlightText(text, word) {
    if (!word) return text;
    // Escape regex special characters in word
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function showSpinner(show) {
    document.getElementById('spinner').style.display = show ? 'block' : 'none';
}

function showBackToTop(show) {
    document.getElementById('backToTop').style.display = show ? 'block' : 'none';
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('backToTop').onclick = scrollToTop;
window.addEventListener('scroll', function() {
    showBackToTop(window.scrollY > 200);
});

function getFavicon(url) {
    try {
        const u = new URL(url, window.location.origin);
        return u.origin + '/favicon.ico';
    } catch {
        return '';
    }
}

// Dark mode logic
const darkModeBtn = document.getElementById('darkModeToggle');
function setDarkMode(on) {
    document.body.classList.toggle('dark', on);
    darkModeBtn.classList.toggle('active', on);
    darkModeBtn.innerHTML = on ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('darkMode', on ? '1' : '0');
}
darkModeBtn.onclick = () => setDarkMode(!document.body.classList.contains('dark'));
// On load, restore dark mode
if (localStorage.getItem('darkMode') === '1') setDarkMode(true);

document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    const orderBy = document.getElementById('orderBySelect').value;
    if (!query) return;
    const resultsDiv = document.getElementById('results');
    showSpinner(true);
    resultsDiv.innerHTML = '';
    const t0 = performance.now();
    try {
        const response = await fetch(`http://localhost:5062/api/SearchEngine?word=${encodeURIComponent(query)}&orderBy=${encodeURIComponent(orderBy)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const t1 = performance.now();
        showSpinner(false);
        if (!data || data.length === 0) {
            resultsDiv.innerHTML = `<div style="text-align:center;margin-top:32px;">
                <img src='https://cdn-icons-png.flaticon.com/512/2748/2748558.png' alt='No results' width='80' style='opacity:0.7;'/><br>
                <p style="color:#b00;font-size:1.1em;">No results found.<br>Try another search!</p>
            </div>`;
            return;
        }
        const info = `<div style='color:#2a5298;font-size:1em;margin-bottom:10px;'>${data.length} results found in ${(t1-t0).toFixed(1)} ms</div>`;
        // Show only first 5 results in preview
        const previewCount = 5;
        const preview = data.slice(0, previewCount).map(item => {
            let url = item.Url || item.url;
            if (url.endsWith('.html')) {
                url += (url.includes('?') ? '&' : '?') + 'highlight=' + encodeURIComponent(query);
            }
            let favicon = '';
            if (url.startsWith('http')) {
                favicon = `<img class="result-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32" alt="favicon"/>`;
            } else if (url.endsWith('.html')) {
                favicon = `<img class="result-favicon" src="${getFavicon(url)}" alt="favicon"/>`;
            }
            return `
                <div class="result-card">
                    <a href="${url}" class="result-title" target="_blank">${favicon}${item.Url || item.url}</a>
                    <div class="result-snippet">Count: ${item.Count ?? item.count}</div>
                </div>
            `;
        }).join('');
        let showMoreBtn = '';
        if (data.length > previewCount) {
            showMoreBtn = `<button class="show-more-btn" id="showMoreBtn">Show All Results</button>`;
        }
        resultsDiv.innerHTML = info + preview + showMoreBtn;
        // Modal logic
        if (data.length > previewCount) {
            document.getElementById('showMoreBtn').onclick = function() {
                const modal = document.getElementById('resultsModal');
                const backdrop = document.getElementById('modalBackdrop');
                const modalResults = document.getElementById('modalResults');
                let modalLoadedCount = 0;
                const modalBatchSize = 5;
                // Helper to render next batch
                function renderNextModalBatch() {
                    const nextBatch = data.slice(modalLoadedCount, modalLoadedCount + modalBatchSize).map(item => {
                        let url = item.Url || item.url;
                        if (url.endsWith('.html')) {
                            url += (url.includes('?') ? '&' : '?') + 'highlight=' + encodeURIComponent(query);
                        }
                        let favicon = '';
                        if (url.startsWith('http')) {
                            favicon = `<img class="result-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32" alt="favicon"/>`;
                        } else if (url.endsWith('.html')) {
                            favicon = `<img class="result-favicon" src="${getFavicon(url)}" alt="favicon"/>`;
                        }
                        return `
                            <div class="result-card">
                                <a href="${url}" class="result-title" target="_blank">${favicon}${item.Url || item.url}</a>
                                <div class="result-snippet">Count: ${item.Count ?? item.count}</div>
                            </div>
                        `;
                    }).join('');
                    modalResults.insertAdjacentHTML('beforeend', nextBatch);
                    modalLoadedCount += modalBatchSize;
                }
                // Initial batch
                modalResults.innerHTML = '';
                modalLoadedCount = 0;
                renderNextModalBatch();
                // Infinite scroll logic
                function onModalScroll() {
                    if (modalResults.scrollTop + modalResults.clientHeight >= modalResults.scrollHeight - 10) {
                        if (modalLoadedCount < data.length) {
                            renderNextModalBatch();
                        }
                    }
                }
                modalResults.removeEventListener('scroll', onModalScroll); // Remove previous if any
                modalResults.addEventListener('scroll', onModalScroll);
                // Optional: allow click to load more if not enough to scroll
                modalResults.onclick = function() {
                    if (modalLoadedCount < data.length && modalResults.scrollHeight <= modalResults.clientHeight + 10) {
                        renderNextModalBatch();
                    }
                };
                modal.style.display = 'block';
                backdrop.style.display = 'block';
            };
        }
        // Modal close logic
        document.getElementById('closeModal').onclick = closeModal;
        document.getElementById('modalBackdrop').onclick = closeModal;
        function closeModal() {
            document.getElementById('resultsModal').style.display = 'none';
            document.getElementById('modalBackdrop').style.display = 'none';
        }
        localStorage.setItem('lastSearch', query);
    } catch (err) {
        showSpinner(false);
        resultsDiv.innerHTML = '<p style="color:#b00;">Error fetching results.</p>';
    }
});

// Restore last search
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight) {
        function walk(node) {
            if (node.nodeType === 3) {
                const replaced = highlightText(node.nodeValue, highlight);
                if (replaced !== node.nodeValue) {
                    const span = document.createElement('span');
                    span.innerHTML = replaced;
                    node.replaceWith(...span.childNodes);
                }
            } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT','STYLE','NOSCRIPT'].includes(node.tagName)) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    walk(node.childNodes[i]);
                }
            }
        }
        walk(document.body);
    }
    // Restore last search
    const last = localStorage.getItem('lastSearch');
    if (last) {
        document.getElementById('searchInput').value = last;
    }
    // Animated circles for About section
    const about = document.getElementById('about-section');
    if (about && !about.querySelector('.circle')) {
        about.insertAdjacentHTML('beforeend', `
            <div class="circle circle1"></div>
            <div class="circle circle2"></div>
            <div class="circle circle3"></div>
            <div class="circle circle4"></div>
        `);
    }
});

// Keyboard shortcuts
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('searchInput').value = '';
        document.getElementById('results').innerHTML = '';
    }
    if (e.key === '/' && document.activeElement !== document.getElementById('searchInput')) {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// Modal HTML
document.body.insertAdjacentHTML('beforeend', `
    <div id="resultsModal" class="modal">
        <div class="modal-content">
            <span id="closeModal" class="close">&times;</span>
            <div id="modalResults"></div>
        </div>
    </div>
    <div id="modalBackdrop" class="modal-backdrop"></div>
`);