/**
 * admin-v2.js — ArtGallery Admin Panel v2
 * Tab navigation · Artworks CRUD · Styles & Artists management
 */

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
var adminArtworks = [];
var editingId = null;
var artworkModal = null;
var styleModal = null;
var artistModal = null;

/* Local-managed data (localStorage) */
var adminStyles  = JSON.parse(localStorage.getItem('ag_styles')  || 'null') || [
    { id: 1, name: 'Sơn dầu',   desc: 'Tranh vẽ bằng sơn dầu trên canvas',    color: '#3b71ca' },
    { id: 2, name: 'Màu nước',  desc: 'Kỹ thuật màu nước mỏng nhẹ',           color: '#0d9488' },
    { id: 3, name: 'Trừu tượng',desc: 'Phong cách trừu tượng, phi hình tượng', color: '#7c3aed' },
    { id: 4, name: 'Canvas',    desc: 'Tranh canvas đa dạng chất liệu',         color: '#d97706' },
    { id: 5, name: 'Hiện đại',  desc: 'Nghệ thuật đương đại, hiện đại',         color: '#dc2626' }
];
var adminArtists = JSON.parse(localStorage.getItem('ag_artists') || 'null');
if (!adminArtists || adminArtists.length === 0) {
    adminArtists = [
        { id: 1, name: 'Leonardo da Vinci', nationality: 'Ý', bio: 'Họa sĩ, nhà điêu khắc, kiến trúc sư thời kỳ Phục Hưng Ý.' },
        { id: 2, name: 'Vincent van Gogh', nationality: 'Hà Lan', bio: 'Danh họa hậu ấn tượng người Hà Lan.' },
        { id: 3, name: 'Pablo Picasso', nationality: 'Tây Ban Nha', bio: 'Họa sĩ và nhà điêu khắc người Tây Ban Nha, đồng sáng lập trường phái Lập thể.' },
        { id: 4, name: 'Claude Monet', nationality: 'Pháp', bio: 'Họa sĩ tiên phong sáng lập trường phái ấn tượng Pháp.' }
    ];
    localStorage.setItem('ag_artists', JSON.stringify(adminArtists));
}
var editingStyleId  = null;
var editingArtistId = null;

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    artworkModal = new bootstrap.Modal(document.getElementById('artworkModal'));
    styleModal = new bootstrap.Modal(document.getElementById('styleModal'));
    artistModal = new bootstrap.Modal(document.getElementById('artistModal'));
    loadArtworks();
    renderStylesList();
    renderArtistsList();
    updateStyleSelect(); // populate form select from styles list
});

/* ═══════════════════════════════════════
   TAB NAVIGATION
═══════════════════════════════════════ */
var tabMeta = {
    dashboard: { icon: 'bi-speedometer2',  title: 'Dashboard' },
    artworks:  { icon: 'bi-easel',         title: 'Tác phẩm' },
    styles:    { icon: 'bi-palette',        title: 'Phong cách' },
    artists:   { icon: 'bi-person-badge',   title: 'Tác giả' }
};

function switchTab(tabId, linkEl) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.remove('active');
    });
    document.getElementById('tab-' + tabId).classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav-link[data-tab]').forEach(function (l) {
        l.classList.remove('active');
    });
    var activeLink = linkEl || document.querySelector('.sidebar-nav-link[data-tab="' + tabId + '"]');
    if (activeLink) activeLink.classList.add('active');

    // Update header breadcrumb
    var meta = tabMeta[tabId] || { icon: 'bi-grid', title: tabId };
    document.getElementById('header-icon').className = 'bi ' + meta.icon;
    document.getElementById('header-title').textContent = meta.title;

    // Lazy renders
    if (tabId === 'styles') {
        renderBreakdownGrid('style');
        renderTabInsights();
    }
    if (tabId === 'artists') {
        renderBreakdownGrid('artist');
        renderTabInsights();
    }
    if (tabId === 'artworks') {
        filterArtworksTable();
        renderLikesChart();
        renderTabInsights();
    }

    return false;
}

/* ═══════════════════════════════════════
   ARTWORKS — Load & Render
═══════════════════════════════════════ */
function loadArtworks() {
    showTableLoading(true);
    API.getArtworks()
        .then(function (data) {
            adminArtworks = data || [];
            renderTable(adminArtworks);
            updateStatistics(adminArtworks);
            renderRecentList(adminArtworks);
            populateArtistDatalist(adminArtworks);
            updateDashboardCounts();
            renderLikesChart();
            renderTabInsights();
            showTableLoading(false);
        })
        .catch(function () {
            showTableLoading(false);
            showAdminAlert('Không thể tải dữ liệu. Vui lòng thử lại.', 'danger');
        });
}

function renderTable(artworks) {
    var tbody = document.getElementById('artworks-tbody');
    if (!tbody) return;

    if (!artworks || artworks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-5">' +
            '<i class="bi bi-inbox fs-3 d-block mb-2"></i>Chưa có tác phẩm nào</td></tr>';
        setTableCountLabel(0, 0);
        return;
    }

    var html = '';
    for (var i = 0; i < artworks.length; i++) {
        var a = artworks[i];
        var imgUrl = getImageUrl(a.imageUrl, a.id);
        var isApproved = a.status === 'approved' || a.approved === true;

        html += '<tr data-id="' + a.id + '">';
        html += '<td><img src="' + imgUrl + '" class="table-thumbnail" alt="' + esc(a.title) + '" ' +
                'onerror="this.src=\'https://picsum.photos/seed/fb' + a.id + '/100/100\'"></td>';
        html += '<td class="fw-semibold" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(a.title) + '">' + esc(a.title || 'N/A') + '</td>';
        html += '<td style="font-size:.83rem">' + esc(a.artist || 'N/A') + '</td>';
        html += '<td><span class="badge" style="background:' + getStyleColor(a.style) + ';font-size:.7rem">' + esc(a.style || 'N/A') + '</span></td>';
        html += '<td><i class="bi bi-heart-fill text-danger me-1" style="font-size:.75rem"></i><span style="font-size:.83rem">' + (a.likes || 0) + '</span></td>';
        html += '<td>';
        html += '<button class="approve-toggle btn btn-sm ' + (isApproved ? 'btn-success' : 'btn-outline-secondary') + '" ' +
                'data-id="' + a.id + '" data-status="' + (isApproved ? 'approved' : 'pending') + '" ' +
                'style="font-size:.72rem;padding:.25rem .55rem">';
        html += '<i class="bi ' + (isApproved ? 'bi-check-circle-fill' : 'bi-circle') + ' me-1"></i>';
        html += isApproved ? 'Đã duyệt' : 'Chờ duyệt';
        html += '</button></td>';
        html += '<td>';
        html += '<button class="btn btn-sm btn-outline-primary btn-edit me-1" data-id="' + a.id + '" title="Chỉnh sửa" style="padding:.25rem .45rem">';
        html += '<i class="bi bi-pencil-fill" style="font-size:.75rem"></i></button>';
        html += '<button class="btn btn-sm btn-outline-danger btn-delete" data-id="' + a.id + '" title="Xóa" style="padding:.25rem .45rem">';
        html += '<i class="bi bi-trash-fill" style="font-size:.75rem"></i></button>';
        html += '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
    setTableCountLabel(artworks.length, adminArtworks.length);
    setupTableActions();
}

function setTableCountLabel(shown, total) {
    var el = document.getElementById('table-count-label');
    if (!el) return;
    if (shown === total) {
        el.textContent = 'Hiển thị ' + total + ' tác phẩm';
    } else {
        el.textContent = 'Hiển thị ' + shown + ' / ' + total + ' tác phẩm';
    }
}

/* ── Table Action Buttons ── */
function setupTableActions() {
    document.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () { startEdit(this.getAttribute('data-id')); });
    });
    document.querySelectorAll('.btn-delete').forEach(function (btn) {
        btn.addEventListener('click', function () { deleteArtwork(this.getAttribute('data-id')); });
    });
    document.querySelectorAll('.approve-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            toggleApproval(this.getAttribute('data-id'), this.getAttribute('data-status'));
        });
    });
}

/* ── Filter Artworks Table ── */
function filterArtworksTable() {
    var query  = (document.getElementById('artwork-search').value || '').toLowerCase().trim();
    var style  = (document.getElementById('filter-style-select').value || '');
    var status = (document.getElementById('filter-status-select').value || '');

    var filtered = adminArtworks.filter(function (a) {
        var matchQuery = !query ||
            (a.title  || '').toLowerCase().includes(query) ||
            (a.artist || '').toLowerCase().includes(query);
        var matchStyle  = !style  || a.style === style;
        var isApproved  = a.status === 'approved' || a.approved === true;
        var matchStatus = !status ||
            (status === 'approved' && isApproved) ||
            (status === 'pending'  && !isApproved);
        return matchQuery && matchStyle && matchStatus;
    });
    renderTable(filtered);
}

/* ── Style select in filter toolbar ── */
function updateStyleFilterSelect() {
    var sel = document.getElementById('filter-style-select');
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = '<option value="">Tất cả phong cách</option>';
    adminStyles.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        sel.appendChild(opt);
    });
    sel.value = current;
}

/* ── Artwork modal select ── */
function updateStyleSelect() {
    var sel = document.getElementById('input-style');
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = '';
    adminStyles.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        sel.appendChild(opt);
    });
    if (current) sel.value = current;
    updateStyleFilterSelect();
}

/* ── Artist datalist ── */
function populateArtistDatalist(artworks) {
    var dl = document.getElementById('artist-datalist');
    if (!dl) return;
    var names = {};
    artworks.forEach(function (a) { if (a.artist) names[a.artist] = 1; });
    adminArtists.forEach(function (a) { names[a.name] = 1; });
    dl.innerHTML = '';
    Object.keys(names).forEach(function (n) {
        var opt = document.createElement('option');
        opt.value = n;
        dl.appendChild(opt);
    });
}

/* ═══════════════════════════════════════
   ARTWORKS — CRUD
═══════════════════════════════════════ */
function openAddArtworkModal() {
    resetArtworkForm();
    document.getElementById('artworkModalLabel').innerHTML =
        '<i class="bi bi-plus-circle text-primary me-2"></i> Thêm tác phẩm mới';
    document.getElementById('btn-submit').innerHTML =
        '<i class="bi bi-plus-circle me-1"></i> Thêm tác phẩm';
    artworkModal.show();
}

function startEdit(id) {
    var artwork = adminArtworks.find(function (a) { return String(a.id) === String(id); });
    if (!artwork) return;
    editingId = id;

    document.getElementById('input-title').value    = artwork.title    || '';
    document.getElementById('input-artist').value   = artwork.artist   || '';
    document.getElementById('input-style').value    = artwork.style    || '';
    document.getElementById('input-story').value    = artwork.story    || '';
    document.getElementById('input-imageUrl').value = artwork.imageUrl || '';
    document.getElementById('input-approved').checked = artwork.status === 'approved' || artwork.approved === true;
    previewImage(artwork.imageUrl || '');

    document.getElementById('artworkModalLabel').innerHTML =
        '<i class="bi bi-pencil-fill text-primary me-2"></i> Chỉnh sửa tác phẩm';
    document.getElementById('btn-submit').innerHTML =
        '<i class="bi bi-save me-1"></i> Cập nhật';
    artworkModal.show();
}

function submitArtworkForm() {
    clearErrors();
    var formData = {
        title:    document.getElementById('input-title').value.trim(),
        artist:   document.getElementById('input-artist').value.trim(),
        style:    document.getElementById('input-style').value,
        story:    document.getElementById('input-story').value.trim(),
        imageUrl: document.getElementById('input-imageUrl').value.trim(),
        status:   document.getElementById('input-approved').checked ? 'approved' : 'pending'
    };

    var validation = validateForm(formData);
    if (!validation.valid) {
        if (validation.errors.title)    showInlineError('input-title',    validation.errors.title);
        if (validation.errors.artist)   showInlineError('input-artist',   validation.errors.artist);
        if (validation.errors.imageUrl) showInlineError('input-imageUrl', validation.errors.imageUrl);
        return;
    }

    setSubmitLoading(true);
    if (editingId) {
        API.updateArtwork(editingId, formData)
            .then(function (updated) {
                showAdminAlert('Đã cập nhật tác phẩm "' + updated.title + '" thành công!', 'success');
                artworkModal.hide();
                resetArtworkForm();
                loadArtworks();
            })
            .catch(function () { showAdminAlert('Lỗi khi cập nhật tác phẩm.', 'danger'); })
            .finally(function () { setSubmitLoading(false); });
    } else {
        formData.likes = 0;
        API.createArtwork(formData)
            .then(function (created) {
                showAdminAlert('Đã thêm tác phẩm "' + created.title + '" thành công!', 'success');
                artworkModal.hide();
                resetArtworkForm();
                loadArtworks();
            })
            .catch(function () { showAdminAlert('Lỗi khi thêm tác phẩm.', 'danger'); })
            .finally(function () { setSubmitLoading(false); });
    }
}

function deleteArtwork(id) {
    var a = adminArtworks.find(function (x) { return String(x.id) === String(id); });
    if (!confirm('Bạn có chắc chắn muốn xóa "' + (a ? a.title : 'tác phẩm này') + '"?')) return;

    var row = document.querySelector('tr[data-id="' + id + '"]');
    if (row) row.classList.add('fade-out');

    API.deleteArtwork(id)
        .then(function () {
            showAdminAlert('Đã xóa tác phẩm thành công!', 'success');
            adminArtworks = adminArtworks.filter(function (x) { return String(x.id) !== String(id); });
            renderTable(adminArtworks);
            updateStatistics(adminArtworks);
            updateDashboardCounts();
        })
        .catch(function () {
            if (row) row.classList.remove('fade-out');
            showAdminAlert('Lỗi khi xóa tác phẩm.', 'danger');
        });
}

function toggleApproval(id, currentStatus) {
    var newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    API.updateArtwork(id, { status: newStatus })
        .then(function () {
            showAdminAlert('Đã cập nhật trạng thái!', 'info');
            loadArtworks();
        })
        .catch(function () { showAdminAlert('Lỗi khi cập nhật trạng thái.', 'danger'); });
}

function resetArtworkForm() {
    editingId = null;
    var form = document.getElementById('artwork-form');
    if (form) form.reset();
    clearErrors();
    setSubmitLoading(false);
    previewImage('');
}

/* ── Image Preview ── */
function previewImage(url) {
    var img   = document.getElementById('image-preview-img');
    var ph    = document.getElementById('image-preview-placeholder');
    if (!img || !ph) return;
    if (url && url.startsWith('http')) {
        img.src = url;
        img.style.display = 'block';
        ph.style.display  = 'none';
    } else {
        img.style.display = 'none';
        ph.style.display  = 'flex';
    }
}

/* ═══════════════════════════════════════
   STYLES MANAGEMENT
═══════════════════════════════════════ */

function openStyleModal() {
    resetStyleForm();
    document.getElementById('style-form-title-text').textContent = 'Thêm phong cách mới';
    document.getElementById('style-submit-btn').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Thêm phong cách';
    if (styleModal) styleModal.show();
}

function saveStyles() {
    localStorage.setItem('ag_styles', JSON.stringify(adminStyles));
}

function renderStylesList() {
    var list = document.getElementById('styles-list');
    if (!list) return;

    var badge = document.getElementById('styles-count-badge');
    if (badge) badge.textContent = adminStyles.length;

    if (adminStyles.length === 0) {
        list.innerHTML = '<div class="text-center py-4 text-muted"><i class="bi bi-inbox fs-4 d-block mb-2"></i> Chưa có phong cách nào</div>';
        return;
    }

    var html = '';
    adminStyles.forEach(function (s) {
        // Count artworks with this style
        var count = adminArtworks.filter(function (a) { return a.style === s.name; }).length;
        var totalLikes = adminArtworks.filter(function (a) { return a.style === s.name; }).reduce(function(sum, a) { return sum + (a.likes || 0); }, 0);
        html += '<div class="entity-item">';
        html += '<div class="entity-color-dot" style="background:' + s.color + '"></div>';
        html += '<div class="entity-body">';
        html += '<strong>' + esc(s.name) + '</strong>';
        html += '<span>' + (s.desc ? esc(s.desc) : '—') + '</span>';
        html += '<span style="font-size:.78rem;margin-top:2px">';
        html += '<i class="bi bi-easel-fill me-1" style="color:' + s.color + '"></i>' + count + ' tác phẩm';
        html += '&nbsp;&nbsp;<i class="bi bi-heart-fill text-danger me-1" style="font-size:.7rem"></i>' + totalLikes + ' lượt thích';
        html += '</span>';
        html += '</div>';
        html += '<div class="entity-actions">';
        html += '<button class="btn btn-sm btn-outline-primary" onclick="editStyle(' + s.id + ')" title="Sửa"><i class="bi bi-pencil-fill"></i></button>';
        html += '<button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteStyle(' + s.id + ')" title="Xóa"><i class="bi bi-trash-fill"></i></button>';
        html += '</div>';
        html += '</div>';
    });
    list.innerHTML = html;
    updateDashboardCounts();
    updateStyleSelect();
}

function submitStyle() {
    var name  = (document.getElementById('style-name-input').value || '').trim();
    var desc  = (document.getElementById('style-desc-input').value || '').trim();
    var color = document.getElementById('style-color-input').value || '#3b71ca';

    if (!name) {
        document.getElementById('style-name-input').classList.add('is-invalid');
        return;
    }
    document.getElementById('style-name-input').classList.remove('is-invalid');

    if (editingStyleId) {
        var idx = adminStyles.findIndex(function (s) { return s.id === editingStyleId; });
        if (idx > -1) {
            adminStyles[idx].name  = name;
            adminStyles[idx].desc  = desc;
            adminStyles[idx].color = color;
        }
        showAdminAlert('Đã cập nhật phong cách "' + name + '"!', 'success');
    } else {
        var newId = Date.now();
        adminStyles.push({ id: newId, name: name, desc: desc, color: color });
        showAdminAlert('Đã thêm phong cách "' + name + '"!', 'success');
    }

    saveStyles();
    if (styleModal) styleModal.hide();
    resetStyleForm();
    renderStylesList();
    renderBreakdownGrid('style');
}

function editStyle(id) {
    var s = adminStyles.find(function (x) { return x.id === id; });
    if (!s) return;
    editingStyleId = id;
    document.getElementById('style-name-input').value  = s.name;
    document.getElementById('style-desc-input').value  = s.desc || '';
    document.getElementById('style-color-input').value = s.color || '#3b71ca';
    document.getElementById('style-form-title-text').textContent = 'Chỉnh sửa phong cách';
    document.getElementById('style-submit-btn').innerHTML = '<i class="bi bi-save me-1"></i> Cập nhật';
    if (styleModal) styleModal.show();
}

function deleteStyle(id) {
    var s = adminStyles.find(function (x) { return x.id === id; });
    if (!confirm('Xóa phong cách "' + (s ? s.name : '') + '"?')) return;
    adminStyles = adminStyles.filter(function (x) { return x.id !== id; });
    saveStyles();
    renderStylesList();
    renderBreakdownGrid('style');
    showAdminAlert('Đã xóa phong cách!', 'success');
}

function resetStyleForm() {
    editingStyleId = null;
    document.getElementById('style-name-input').value  = '';
    document.getElementById('style-desc-input').value  = '';
    document.getElementById('style-color-input').value = '#3b71ca';
    document.getElementById('style-form-title-text').textContent = 'Thêm phong cách mới';
    document.getElementById('style-submit-btn').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Thêm phong cách';

    document.getElementById('style-name-input').classList.remove('is-invalid');
}

/* ── Chart Instances ── */
var stylesChart = null;
var artistsChart = null;
var likesChart = null;

function renderLikesChart() {
    if (typeof Chart === 'undefined') return;
    var canvas = document.getElementById('likesChart');
    if (!canvas) return;

    // Filter artworks with likes > 0, then sort by likes descending, take top 10
    var sorted = adminArtworks.slice().filter(function(a) { return (a.likes || 0) > 0; }).sort(function(a, b) { return (b.likes || 0) - (a.likes || 0); }).slice(0, 10);
    
    var labels = [];
    var data = [];
    var bgColors = [];
    var colors = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#0d9488', '#0284c7', '#4f46e5', '#9333ea'];

    sorted.forEach(function(a, i) {
        labels.push(a.title || 'Không tên');
        data.push(a.likes || 0);
        bgColors.push(colors[i % colors.length]);
    });

    if (data.length === 0) {
        labels = ['Chưa có dữ liệu'];
        data = [1];
        bgColors = ['#e5e7eb'];
    }

    if (likesChart) likesChart.destroy();
    
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.color = '#64748b';

    likesChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lượt thích',
                data: data,
                backgroundColor: bgColors,
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 10 },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                },
                x: {
                    ticks: { display: false },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 14, family: "'DM Sans', sans-serif" },
                    bodyFont: { size: 13, family: "'DM Sans', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            var label = context.label || '';
                            if (label === 'Chưa có dữ liệu') return label;
                            var value = context.raw || 0;
                            return ' ' + value + ' lượt thích';
                        }
                    }
                }
            }
        }
    });

    var legendEl = document.getElementById('likesChartLegend');
    if (legendEl) {
        var legendHtml = '';
        var totalCount = data.reduce(function(a, b) { return a + b; }, 0);
        
        labels.forEach(function(l, i) {
            if (l === 'Chưa có dữ liệu') return;
            var val = data[i];
            var pct = Math.round((val / totalCount) * 100);
            var color = bgColors[i];
            legendHtml += '<div class="custom-legend-item">';
            legendHtml += '<div style="flex:1">';
            legendHtml += '<div class="d-flex align-items-center">';
            legendHtml += '<div class="legend-dot" style="background:' + color + '"></div>';
            legendHtml += '<div class="legend-label" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis" title="' + esc(l) + '">' + esc(l) + '</div>';
            legendHtml += '<div class="legend-value"><i class="bi bi-heart-fill text-danger me-1" style="font-size: .8rem"></i>' + val + '</div>';
            legendHtml += '<div class="legend-percent">' + pct + '%</div>';
            legendHtml += '</div>';
            legendHtml += '<div class="legend-progress-bar"><div class="legend-progress-fill" style="width:' + pct + '%; background:' + color + '"></div></div>';
            legendHtml += '</div></div>';
        });
        legendEl.innerHTML = legendHtml || '<div class="text-muted text-center py-4">Chưa có tác phẩm nào được thích</div>';
    }
}

/* ── Breakdown Charts (Chart.js) ── */
function renderBreakdownGrid(type) {
    if (typeof Chart === 'undefined') return;

    if (type === 'style') {
        var canvas = document.getElementById('stylesChart');
        if (!canvas) return;

        // Calculate data
        var labels = [];
        var data = [];
        var bgColors = [];

        adminStyles.forEach(function (s) {
            var count = adminArtworks.filter(function (a) { return a.style === s.name; }).length;
            if (count > 0) {
                labels.push(s.name);
                data.push(count);
                bgColors.push(s.color || '#3b71ca');
            }
        });

        if (data.length === 0) {
            labels = ['Chưa có dữ liệu'];
            data = [1];
            bgColors = ['#e5e7eb'];
        }

        if (stylesChart) stylesChart.destroy();

        // Global default font
        Chart.defaults.font.family = "'DM Sans', sans-serif";
        Chart.defaults.color = '#64748b';

        stylesChart = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 10
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { size: 14, family: "'DM Sans', sans-serif" },
                        bodyFont: { size: 13, family: "'DM Sans', sans-serif" },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                if (label === 'Chưa có dữ liệu') return label;
                                var value = context.raw || 0;
                                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                                var percentage = Math.round((value / total) * 100) + '%';
                                return ' ' + label + ': ' + value + ' tác phẩm (' + percentage + ')';
                            }
                        }
                    }
                }
            }
        });

        // Generate Custom Legend
        var legendEl = document.getElementById('stylesChartLegend');
        if (legendEl) {
            var legendHtml = '';
            var totalCount = data.reduce(function(a, b) { return a + b; }, 0);
            
            // Sort by data value descending
            var indices = [];
            for (var j = 0; j < labels.length; j++) indices.push(j);
            indices.sort(function(a, b) { return data[b] - data[a]; });
            
            indices.forEach(function(i) {
                if (labels[i] === 'Chưa có dữ liệu') return;
                var val = data[i];
                var pct = Math.round((val / totalCount) * 100);
                var color = bgColors[i];
                legendHtml += '<div class="custom-legend-item">';
                legendHtml += '<div style="flex:1">';
                legendHtml += '<div class="d-flex align-items-center">';
                legendHtml += '<div class="legend-dot" style="background:' + color + '"></div>';
                legendHtml += '<div class="legend-label" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis" title="' + esc(labels[i]) + '">' + esc(labels[i]) + '</div>';
                legendHtml += '<div class="legend-value">' + val + '</div>';
                legendHtml += '<div class="legend-percent">' + pct + '%</div>';
                legendHtml += '</div>';
                legendHtml += '<div class="legend-progress-bar"><div class="legend-progress-fill" style="width:' + pct + '%; background:' + color + '"></div></div>';
                legendHtml += '</div></div>';
            });
            legendEl.innerHTML = legendHtml || '<div class="text-muted text-center py-4">Chưa có dữ liệu</div>';
        }
    }

    if (type === 'artist') {
        var canvas2 = document.getElementById('artistsChart');
        if (!canvas2) return;

        var artistMap = {};
        adminArtworks.forEach(function (a) {
            if (!a.artist) return;
            if (!artistMap[a.artist]) artistMap[a.artist] = 0;
            artistMap[a.artist]++;
        });

        var labels = Object.keys(artistMap);
        var data = [];
        var bgColors = [];

        // Generate nice colors for artists
        var colors = ['#3b71ca', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0d9488', '#ec4899', '#f97316'];
        
        labels.forEach(function(name, i) {
            data.push(artistMap[name]);
            bgColors.push(colors[i % colors.length]);
        });

        if (data.length === 0) {
            labels = ['Chưa có dữ liệu'];
            data = [1];
            bgColors = ['#e5e7eb'];
        }

        if (artistsChart) artistsChart.destroy();

        artistsChart = new Chart(canvas2, {
            type: 'polarArea', // Use polarArea for artists to distinguish from doughnut and bar charts
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 10
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { size: 14, family: "'DM Sans', sans-serif" },
                        bodyFont: { size: 13, family: "'DM Sans', sans-serif" },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                if (label === 'Chưa có dữ liệu') return label;
                                var value = context.raw || 0;
                                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                                var percentage = Math.round((value / total) * 100) + '%';
                                return ' ' + label + ': ' + value + ' tác phẩm (' + percentage + ')';
                            }
                        }
                    }
                }
            }
        });

        // Generate Custom Legend
        var legendEl2 = document.getElementById('artistsChartLegend');
        if (legendEl2) {
            var legendHtml = '';
            var totalCount = data.reduce(function(a, b) { return a + b; }, 0);
            
            // Sort by data value descending
            var indices = [];
            for (var j = 0; j < labels.length; j++) indices.push(j);
            indices.sort(function(a, b) { return data[b] - data[a]; });
            
            indices.forEach(function(i) {
                if (labels[i] === 'Chưa có dữ liệu') return;
                var val = data[i];
                var pct = Math.round((val / totalCount) * 100);
                var color = bgColors[i];
                legendHtml += '<div class="custom-legend-item">';
                legendHtml += '<div style="flex:1">';
                legendHtml += '<div class="d-flex align-items-center">';
                legendHtml += '<div class="legend-dot" style="background:' + color + '"></div>';
                legendHtml += '<div class="legend-label" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis" title="' + esc(labels[i]) + '">' + esc(labels[i]) + '</div>';
                legendHtml += '<div class="legend-value">' + val + '</div>';
                legendHtml += '<div class="legend-percent">' + pct + '%</div>';
                legendHtml += '</div>';
                legendHtml += '<div class="legend-progress-bar"><div class="legend-progress-fill" style="width:' + pct + '%; background:' + color + '"></div></div>';
                legendHtml += '</div></div>';
            });
            legendEl2.innerHTML = legendHtml || '<div class="text-muted text-center py-4">Chưa có dữ liệu</div>';
        }
    }
}

/* ═══════════════════════════════════════
   ARTISTS MANAGEMENT
═══════════════════════════════════════ */
function saveArtists() {
    localStorage.setItem('ag_artists', JSON.stringify(adminArtists));
}


function openArtistModal() {
    resetArtistForm();
    document.getElementById('artist-form-title-text').textContent = 'Thêm tác giả mới';
    document.getElementById('artist-submit-btn').innerHTML = '<i class="bi bi-person-plus me-1"></i> Thêm tác giả';
    if (artistModal) artistModal.show();
}

function renderArtistsList() {
    var list = document.getElementById('artists-list');
    if (!list) return;

    var badge = document.getElementById('artists-count-badge');
    if (badge) badge.textContent = adminArtists.length;

    if (adminArtists.length === 0) {
        list.innerHTML = '<div class="text-center py-4 text-muted"><i class="bi bi-inbox fs-4 d-block mb-2"></i> Chưa có tác giả nào. Hãy thêm tác giả bên trái.</div>';
        return;
    }

    var html = '';
    adminArtists.forEach(function (a) {
        var initials = a.name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
        var count = adminArtworks.filter(function (w) { return w.artist === a.name; }).length;
        var totalLikes = adminArtworks.filter(function (w) { return w.artist === a.name; }).reduce(function(sum, w) { return sum + (w.likes || 0); }, 0);
        html += '<div class="entity-item">';
        html += '<div class="entity-avatar">' + initials + '</div>';
        html += '<div class="entity-body">';
        html += '<strong>' + esc(a.name) + (a.nationality ? ' <small style="color:#9ca3af;font-weight:400">· ' + esc(a.nationality) + '</small>' : '') + '</strong>';
        html += '<span>' + (a.bio ? esc(a.bio) : '—') + '</span>';
        html += '<span style="font-size:.78rem;margin-top:2px">';
        html += '<i class="bi bi-easel-fill text-primary me-1" style="font-size:.7rem"></i>' + count + ' tác phẩm';
        html += '&nbsp;&nbsp;<i class="bi bi-heart-fill text-danger me-1" style="font-size:.7rem"></i>' + totalLikes + ' lượt thích';
        html += '</span>';
        html += '</div>';
        html += '<div class="entity-actions">';
        html += '<button class="btn btn-sm btn-outline-primary" onclick="editArtist(' + a.id + ')" title="Sửa"><i class="bi bi-pencil-fill"></i></button>';
        html += '<button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteArtist(' + a.id + ')" title="Xóa"><i class="bi bi-trash-fill"></i></button>';
        html += '</div>';
        html += '</div>';
    });
    list.innerHTML = html;
    updateDashboardCounts();
}

function submitArtist() {
    var name        = (document.getElementById('artist-name-input').value || '').trim();
    var nationality = (document.getElementById('artist-nationality-input').value || '').trim();
    var bio         = (document.getElementById('artist-bio-input').value || '').trim();

    if (!name) {
        document.getElementById('artist-name-input').classList.add('is-invalid');
        return;
    }
    document.getElementById('artist-name-input').classList.remove('is-invalid');

    if (editingArtistId) {
        var idx = adminArtists.findIndex(function (a) { return a.id === editingArtistId; });
        if (idx > -1) {
            adminArtists[idx].name        = name;
            adminArtists[idx].nationality = nationality;
            adminArtists[idx].bio         = bio;
        }
        showAdminAlert('Đã cập nhật tác giả "' + name + '"!', 'success');
    } else {
        adminArtists.push({ id: Date.now(), name: name, nationality: nationality, bio: bio });
        showAdminAlert('Đã thêm tác giả "' + name + '"!', 'success');
    }

    saveArtists();
    if (artistModal) artistModal.hide();
    resetArtistForm();
    renderArtistsList();
    populateArtistDatalist(adminArtworks);
    renderBreakdownGrid('artist');
}

function editArtist(id) {
    var a = adminArtists.find(function (x) { return x.id === id; });
    if (!a) return;
    editingArtistId = id;
    document.getElementById('artist-name-input').value        = a.name;
    document.getElementById('artist-nationality-input').value = a.nationality || '';
    document.getElementById('artist-bio-input').value         = a.bio || '';
    document.getElementById('artist-form-title-text').textContent  = 'Chỉnh sửa tác giả';
    document.getElementById('artist-submit-btn').innerHTML    = '<i class="bi bi-save me-1"></i> Cập nhật';
    if (artistModal) artistModal.show();
}

function deleteArtist(id) {
    var a = adminArtists.find(function (x) { return x.id === id; });
    if (!confirm('Xóa tác giả "' + (a ? a.name : '') + '"?')) return;
    adminArtists = adminArtists.filter(function (x) { return x.id !== id; });
    saveArtists();
    renderArtistsList();
    renderBreakdownGrid('artist');
    showAdminAlert('Đã xóa tác giả!', 'success');
}

function resetArtistForm() {
    editingArtistId = null;
    document.getElementById('artist-name-input').value        = '';
    document.getElementById('artist-nationality-input').value = '';
    document.getElementById('artist-bio-input').value         = '';
    document.getElementById('artist-form-title-text').textContent  = 'Thêm tác giả mới';
    document.getElementById('artist-submit-btn').innerHTML    = '<i class="bi bi-person-plus me-1"></i> Thêm tác giả';

    document.getElementById('artist-name-input').classList.remove('is-invalid');
}

/* ═══════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════ */
function updateStatistics(artworks) {
    var total      = artworks.length;
    var approved   = 0;
    var pending    = 0;
    var totalLikes = 0;
    artworks.forEach(function (a) {
        if (a.status === 'approved' || a.approved === true) approved++;
        else pending++;
        totalLikes += (a.likes || 0);
    });
    setTextSafe('stat-total',    total);
    setTextSafe('stat-approved', approved);
    setTextSafe('stat-pending',  pending);
    setTextSafe('stat-likes',    totalLikes.toLocaleString());
}

function updateDashboardCounts() {
    setTextSafe('dash-artworks-count', adminArtworks.length + ' tác phẩm');
    setTextSafe('dash-styles-count',   adminStyles.length   + ' phong cách');
    setTextSafe('dash-artists-count',  adminArtists.length  + ' tác giả');
}

function renderTabInsights() {
    // ARTWORKS INSIGHTS
    var totalArtworks = adminArtworks.length;
    var approved = 0;
    var pending = 0;
    var topLiked = null;
    var maxLikes = -1;

    adminArtworks.forEach(function(a) {
        if (a.status === 'approved' || a.approved === true) approved++;
        else pending++;
        var l = a.likes || 0;
        if (l > maxLikes) { maxLikes = l; topLiked = a; }
    });

    var artHtml = '';
    if (totalArtworks > 0) {
        artHtml += '<div class="col-md-4"><div class="stat-card stat-blue"><div class="stat-icon-wrap"><i class="bi bi-easel-fill"></i></div><div class="stat-body"><h3>' + totalArtworks + '</h3><p>Tổng tác phẩm</p></div></div></div>';
        artHtml += '<div class="col-md-4"><div class="stat-card stat-green"><div class="stat-icon-wrap"><i class="bi bi-check2-circle"></i></div><div class="stat-body"><h3>' + approved + ' / ' + pending + '</h3><p>Đã duyệt / Chờ duyệt</p></div></div></div>';
        artHtml += '<div class="col-md-4"><div class="stat-card stat-red"><div class="stat-icon-wrap"><i class="bi bi-trophy-fill"></i></div><div class="stat-body"><h3 style="font-size:1.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + esc(topLiked ? topLiked.title : '') + '">' + esc(topLiked ? topLiked.title : 'N/A') + '</h3><p>Top 1 (' + maxLikes + ' lượt thích)</p></div></div></div>';
    }
    var artContainer = document.getElementById('artworks-insights');
    if (artContainer) artContainer.innerHTML = artHtml;

    // STYLES INSIGHTS
    var styleCounts = {};
    var styleLikes = {};
    adminArtworks.forEach(function(a) {
        if (!a.style) return;
        styleCounts[a.style] = (styleCounts[a.style] || 0) + 1;
        styleLikes[a.style] = (styleLikes[a.style] || 0) + (a.likes || 0);
    });
    var topStyle = null;
    var maxStyleCount = 0;
    var topStyleLikes = null;
    var maxStyleLikes = 0;
    for (var k in styleCounts) {
        if (styleCounts[k] > maxStyleCount) { maxStyleCount = styleCounts[k]; topStyle = k; }
    }
    for (var k2 in styleLikes) {
        if (styleLikes[k2] > maxStyleLikes) { maxStyleLikes = styleLikes[k2]; topStyleLikes = k2; }
    }
    var stylesWithArtworks = Object.keys(styleCounts).length;
    var styHtml = '';
    styHtml += '<div class="col-md-3"><div class="stat-card stat-purple"><div class="stat-icon-wrap"><i class="bi bi-palette-fill"></i></div><div class="stat-body"><h3>' + adminStyles.length + '</h3><p>Tổng số phong cách</p></div></div></div>';
    styHtml += '<div class="col-md-3"><div class="stat-card stat-blue"><div class="stat-icon-wrap"><i class="bi bi-check2-square"></i></div><div class="stat-body"><h3>' + stylesWithArtworks + ' / ' + adminStyles.length + '</h3><p>Phong cách có tác phẩm</p></div></div></div>';
    styHtml += '<div class="col-md-3"><div class="stat-card stat-green"><div class="stat-icon-wrap"><i class="bi bi-bar-chart-fill"></i></div><div class="stat-body"><h3 style="font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + esc(topStyle || '') + '">' + esc(topStyle || 'Chưa có') + '</h3><p>Thịnh hành nhất (' + maxStyleCount + ' tác phẩm)</p></div></div></div>';
    styHtml += '<div class="col-md-3"><div class="stat-card stat-red"><div class="stat-icon-wrap"><i class="bi bi-heart-fill"></i></div><div class="stat-body"><h3 style="font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + esc(topStyleLikes || '') + '">' + esc(topStyleLikes || 'Chưa có') + '</h3><p>Yêu thích nhất (' + maxStyleLikes + ' lượt thích)</p></div></div></div>';
    var styContainer = document.getElementById('styles-insights');
    if (styContainer) styContainer.innerHTML = styHtml;

    // ARTISTS INSIGHTS
    var artistMap = {};
    var artistLikesMap = {};
    adminArtworks.forEach(function(a) {
        if (!a.artist) return;
        artistMap[a.artist] = (artistMap[a.artist] || 0) + 1;
        artistLikesMap[a.artist] = (artistLikesMap[a.artist] || 0) + (a.likes || 0);
    });
    var topArtist = null;
    var maxArtistCount = 0;
    var topArtistLikes = null;
    var maxArtistLikes = 0;
    var activeArtistCount = Object.keys(artistMap).length;
    for (var key in artistMap) {
        if (artistMap[key] > maxArtistCount) { maxArtistCount = artistMap[key]; topArtist = key; }
    }
    for (var key2 in artistLikesMap) {
        if (artistLikesMap[key2] > maxArtistLikes) { maxArtistLikes = artistLikesMap[key2]; topArtistLikes = key2; }
    }
    var artstHtml = '';
    artstHtml += '<div class="col-md-3"><div class="stat-card stat-teal"><div class="stat-icon-wrap"><i class="bi bi-people-fill"></i></div><div class="stat-body"><h3>' + adminArtists.length + '</h3><p>Tác giả trong danh bạ</p></div></div></div>';
    artstHtml += '<div class="col-md-3"><div class="stat-card stat-blue"><div class="stat-icon-wrap"><i class="bi bi-person-check-fill"></i></div><div class="stat-body"><h3>' + activeArtistCount + '</h3><p>Tác giả có tác phẩm</p></div></div></div>';
    artstHtml += '<div class="col-md-3"><div class="stat-card stat-warning"><div class="stat-icon-wrap"><i class="bi bi-star-fill"></i></div><div class="stat-body"><h3 style="font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + esc(topArtist || '') + '">' + esc(topArtist || 'Chưa có') + '</h3><p>Năng suất nhất (' + maxArtistCount + ' tác phẩm)</p></div></div></div>';
    artstHtml += '<div class="col-md-3"><div class="stat-card stat-red"><div class="stat-icon-wrap"><i class="bi bi-heart-fill"></i></div><div class="stat-body"><h3 style="font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + esc(topArtistLikes || '') + '">' + esc(topArtistLikes || 'Chưa có') + '</h3><p>Nhiều thích nhất (' + maxArtistLikes + ' lượt)</p></div></div></div>';
    var artstContainer = document.getElementById('artists-insights');
    if (artstContainer) artstContainer.innerHTML = artstHtml;
}

function renderRecentList(artworks) {
    var list = document.getElementById('recent-artworks-list');
    if (!list) return;
    if (!artworks || artworks.length === 0) {
        list.innerHTML = '<div class="text-center py-4 text-muted"><i class="bi bi-inbox fs-4 d-block mb-2"></i>Chưa có tác phẩm</div>';
        return;
    }
    var recent = artworks.slice().reverse().slice(0, 6);
    var html = '';
    recent.forEach(function (a) {
        var imgUrl     = getImageUrl(a.imageUrl, a.id);
        var isApproved = a.status === 'approved' || a.approved === true;
        html += '<div class="recent-item">';
        html += '<img src="' + imgUrl + '" alt="' + esc(a.title) + '" ' +
                'onerror="this.src=\'https://picsum.photos/seed/rc' + a.id + '/100/100\'">';
        html += '<div class="recent-item-body">';
        html += '<strong>' + esc(a.title || 'Không có tên') + '</strong>';
        html += '<span>' + esc(a.artist || '—') + ' · ' + esc(a.style || '—') + '</span>';
        html += '</div>';
        html += '<div class="recent-item-status">';
        html += '<span class="badge ' + (isApproved ? 'bg-success' : 'bg-warning text-dark') + '" style="font-size:.68rem">';
        html += isApproved ? 'Duyệt' : 'Chờ';
        html += '</span>';
        html += '</div>';
        html += '</div>';
    });
    list.innerHTML = html;
}

/* ═══════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════ */
function showTableLoading(show) {
    var loader    = document.getElementById('table-loading');
    var container = document.getElementById('table-container');
    if (loader)    loader.style.display = show ? 'block' : 'none';
    if (container) {
        show ? container.classList.add('table-container-hidden')
             : container.classList.remove('table-container-hidden');
    }
}

function setSubmitLoading(loading) {
    var btn = document.getElementById('btn-submit');
    if (!btn) return;
    if (loading) {
        btn.disabled = true;
        btn.setAttribute('data-orig', btn.innerHTML);
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Đang xử lý...';
    } else {
        btn.disabled = false;
        var orig = btn.getAttribute('data-orig');
        if (orig) btn.innerHTML = orig;
    }
}

function showAdminAlert(message, type) {
    var container = document.getElementById('admin-alerts');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'alert alert-' + type + ' alert-dismissible fade show admin-alert';
    el.setAttribute('role', 'alert');
    var icon = { success: 'bi-check-circle-fill', danger: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-circle-fill' }[type] || 'bi-info-circle-fill';
    el.innerHTML = '<i class="bi ' + icon + ' me-2"></i>' + message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    container.appendChild(el);
    setTimeout(function () {
        el.classList.remove('show');
        setTimeout(function () { if (el.parentElement) el.remove(); }, 300);
    }, 4000);
}

function setTextSafe(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getStyleColor(styleName) {
    var s = adminStyles.find(function (x) { return x.name === styleName; });
    return s ? s.color : '#6b7280';
}

