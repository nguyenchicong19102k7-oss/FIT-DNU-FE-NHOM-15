/**
 * main.js — Logic for index.html (Public Gallery)
 * Uses fetch() with .then()/.catch() for all API calls
 * Uses addEventListener for DOM events (no jQuery for events)
 * Uses jQuery ONLY for like button animation
 */

var allArtworks = [];
var currentFilter = 'all';
var currentSearch = '';

var extraArtworks = [
    {
        id: 'local-001',
        title: 'Hồn Lúa',
        artist: 'Nguyễn Thảo Vy',
        style: 'Màu nước',
        imageUrl: 'https://picsum.photos/seed/art21/600/800',
        story: 'Nguyễn Thảo Vy sinh ra trong một gia đình nông dân ở miền Bắc. Cô luôn mang trong lòng ký ức về những cánh đồng lúa chín vàng và mùi rơm ấm áp. Tác phẩm này là hành trình hồi tưởng về một buổi chiều thu, khi ánh nắng xuyên qua từng kẽ lá, khắc hoạ hồn lúa Việt Nam dịu dàng mà kiên cường.',
        bio: 'Nguyễn Thảo Vy bắt đầu vẽ từ khi còn rất nhỏ, chịu ảnh hưởng sâu sắc từ thiên nhiên và văn hoá nông thôn. Sau này cô theo đuổi trường mỹ thuật và chuyên tâm nghiên cứu màu nước để truyền tải cảm xúc nhẹ nhàng, sâu lắng. Công việc của Vy thường khám phá sự dân dã, bình dị và giá trị truyền thống của làng quê Việt Nam.',
        likes: 84,
        approved: true
    },
    {
        id: 'local-002',
        title: 'Mây Phủ',
        artist: 'Trần Minh Khôi',
        style: 'Canvas',
        imageUrl: 'https://picsum.photos/seed/art22/600/800',
        story: 'Trần Minh Khôi là hoạ sĩ trẻ nổi bật với phong cách lãng mạn và suy tư. Từ khi còn nhỏ, Khôi đã say mê bầu trời và những đám mây bay. "Mây Phủ" là bản hoà ca của anh dành cho sự tự do, nơi mọi nỗi buồn dường như tan biến theo từng làn gió nhẹ.',
        bio: 'Trần Minh Khôi được biết đến với kỹ thuật canvas tinh tế và cảm nhạc trong hội hoạ. Anh từng theo học thiết kế đồ hoạ trước khi quay lại với hội hoạ truyền thống. Khôi luôn tìm kiếm sự thanh thản trong thiên nhiên và ghi lại cảm xúc bằng màu sắc mềm mại.',
        likes: 102,
        approved: true
    },
    {
        id: 'local-003',
        title: 'Đêm Sáng',
        artist: 'Lê Bảo Anh',
        style: 'Hiện đại',
        imageUrl: 'https://picsum.photos/seed/art23/600/800',
        story: 'Lê Bảo Anh, nghệ sĩ đam mê ánh sáng đô thị, từng dành nhiều đêm thức trắng trên những con phố Sài Gòn. "Đêm Sáng" là một khúc ca về thành phố không ngủ, nơi mỗi ánh đèn là lời mời gọi, mỗi con đường là một câu chuyện riêng. Tác phẩm thể hiện sự bình yên sâu sắc giữa nhịp sống hối hả.',
        bio: 'Lê Bảo Anh chuyên khai thác chủ đề đô thị hoá và sự đối lập giữa con người và thành phố. Cô tốt nghiệp trường Mỹ thuật và nhanh chóng xây dựng phong cách hiện đại với các sắc độ đậm nhạt bắt mắt. Mỗi tác phẩm của cô đều gợi cảm giác ấm áp trong một thế giới ồn ào.',
        likes: 79,
        approved: true
    },
    {
        id: 'local-004',
        title: 'Thời Gian',
        artist: 'Phạm Thanh Tuyền',
        style: 'Trừu tượng',
        imageUrl: 'https://picsum.photos/seed/art24/600/800',
        story: 'Phạm Thanh Tuyền lớn lên trong một gia đình nghệ thuật, luôn tin rằng thời gian có thể được vẽ lên bằng màu sắc. Tác phẩm này mô tả cảm giác những khoảnh khắc chồng chéo, mơ hồ và không thể nắm bắt được. Mỗi khối màu là một hồi ức, mỗi nét cọ là một khoảnh khắc đã trôi qua.',
        bio: 'Phạm Thanh Tuyền là hoạ sĩ trừu tượng với chủ đề lòng người và ký ức. Anh tốt nghiệp khoa Mỹ thuật và làm việc nhiều năm với tranh trừu tượng. Tuyền tin rằng hội hoạ là cách để hình dung những cảm xúc không lời.',
        likes: 116,
        approved: true
    },
    {
        id: 'local-005',
        title: 'Mùa Thu Nhỏ',
        artist: 'Hoàng Ngọc Linh',
        style: 'Sơn dầu',
        imageUrl: 'https://picsum.photos/seed/art25/600/800',
        story: 'Hoàng Ngọc Linh bắt đầu vẽ từ khi mới 10 tuổi với niềm yêu thiên nhiên. Cô luôn ghi nhớ những buổi chiều mùa thu ở phố nhỏ, lá vàng rơi và hương cà phê đặc trưng. "Mùa Thu Nhỏ" là lời ru nhẹ nhàng, như mời người xem trở về với những kỷ niệm ấm áp của tuổi thơ.',
        bio: 'Hoàng Ngọc Linh theo đuổi trường phái sơn dầu biểu cảm và rất thích khám phá sự thay đổi của ánh sáng theo mùa. Cô từng tổ chức nhiều triển lãm nhỏ về thiên nhiên và cảnh vật trong đời sống hàng ngày.',
        likes: 63,
        approved: true
    },
    {
        id: 'local-006',
        title: 'Giấc Mơ Xanh',
        artist: 'Vũ Quang Huy',
        style: 'Màu nước',
        imageUrl: 'https://picsum.photos/seed/art26/600/800',
        story: 'Vũ Quang Huy là hoạ sĩ mang đậm chất thơ, chuyên khám phá cảm xúc qua gam màu lạnh. "Giấc Mơ Xanh" là hành trình ngược về những giây phút yên bình trong tâm hồn, khi mọi buồn lo được phủ lên bởi tông màu xanh dương mơ màng và dịu dàng.',
        bio: 'Vũ Quang Huy nổi bật trong giới mỹ thuật với phong cách mơ hồ và lãng mạn. Anh chọn màu nước để tạo ra các lớp màu nhẹ nhàng và tinh tế, luôn kèm theo cảm giác bình yên như trong một giấc mơ.',
        likes: 91,
        approved: true
    },
    {
        id: 'local-007',
        title: 'Sóng Nước',
        artist: 'Đặng Mai Phương',
        style: 'Canvas',
        imageUrl: 'https://picsum.photos/seed/art27/600/800',
        story: 'Đặng Mai Phương sinh ra bên bờ biển, lớn lên với tiếng sóng ru và mằn mặn gió biển. "Sóng Nước" ghi lại cảm xúc bất tận của người nghệ sĩ đối với đại dương, từng đường cong và lớp màu đều toát lên tính đờn hồi và sức sống mãnh liệt của từng con sóng.',
        bio: 'Đặng Mai Phương vẽ tranh biển từ nhiều năm và luôn lấy đề tài hải trình làm cảm hứng chính. Cô sử dụng chất liệu canvas để tạo chiều sâu và độ chảy của nước, khiến mỗi tác phẩm giống như một bức thư gửi biển.',
        likes: 75,
        approved: true
    },
    {
        id: 'local-008',
        title: 'Vườn Hoa Mùa Hè',
        artist: 'Ngô Minh Tú',
        style: 'Sơn dầu',
        imageUrl: 'https://picsum.photos/seed/art28/600/800',
        story: 'Ngô Minh Tú nổi tiếng với bảng màu rực rỡ và tình yêu thiên nhiên. Tác phẩm này là bức chân dung của một khu vườn đong đầy nắng hè, nơi mỗi bông hoa kể câu chuyện riêng về sự sống, hy vọng và sắc màu tươi trẻ.',
        bio: 'Ngô Minh Tú chuyên vẽ hoa cỏ và phong cảnh với kỹ thuật sơn dầu dày. Anh từng giành giải trong nhiều cuộc thi mỹ thuật trẻ và luôn muốn truyền tải năng lượng tích cực qua mỗi bức tranh.',
        likes: 88,
        approved: true
    },
    {
        id: 'local-009',
        title: 'Chuyến Tàu Buổi Sáng',
        artist: 'Bùi Thị Nga',
        style: 'Hiện đại',
        imageUrl: 'https://picsum.photos/seed/art29/600/800',
        story: 'Bùi Thị Nga là nghệ sĩ thành thị luôn bị cuốn hút bởi nhịp sống và những hành trình mới. "Chuyến Tàu Buổi Sáng" mô tả khoảnh khắc bắt đầu một ngày với sự háo hức, hy vọng và những câu hỏi về tương lai đang chờ phía trước.',
        bio: 'Bùi Thị Nga sinh ra và lớn lên ở thành phố, cô dùng nghệ thuật để ghi lại những khoảnh khắc đời thường nhưng ý nghĩa. Ngoài ra, cô còn làm việc với nhiều chất liệu đa dạng và luôn tìm cách tái hiện cảm xúc trên canvas.',
        likes: 54,
        approved: true
    },
    {
        id: 'local-010',
        title: 'Dòng Sông Cũ',
        artist: 'Trương Văn Khoa',
        style: 'Màu nước',
        imageUrl: 'https://picsum.photos/seed/art30/600/800',
        story: 'Trương Văn Khoa đến từ một làng quê yên bình bên dòng sông, nơi anh khám phá được vẻ đẹp bình dị mỗi ngày. "Dòng Sông Cũ" là cuốn nhật ký bằng màu nước, ghi lại những mảng sáng mờ ảo và ký ức tuổi thơ theo dòng nước lặng lờ.',
        bio: 'Trương Văn Khoa đam mê hội hoạ phong cảnh và ký ức quê nhà. Anh lớn lên bên sông nước đồng bằng, và đó là nguồn cảm hứng bất tận để anh dùng màu nước vẽ nên sự bình yên, ấm áp.',
        likes: 99,
        approved: true
    },
    {
        id: 'local-011',
        title: 'Bản Tình Ca',
        artist: 'Phan Thanh Hằng',
        style: 'Trừu tượng',
        imageUrl: 'https://picsum.photos/seed/art31/600/800',
        story: 'Phan Thanh Hằng từng học nhạc trước khi đến với hội hoạ, và cô luôn xem màu sắc như giai điệu. "Bản Tình Ca" là lời thì thầm của trái tim, nơi mỗi sắc độ và mỗi nét vẽ là một cung bậc cảm xúc yêu thương, chờ đợi và hoài niệm.',
        bio: 'Phan Thanh Hằng có nền tảng âm nhạc sâu sắc và bà coi nghệ thuật thị giác như một bản nhạc màu sắc. Các tác phẩm trừu tượng của cô luôn có âm hưởng cảm xúc mạnh mẽ, pha trộn giữa giai điệu và hình ảnh.',
        likes: 110,
        approved: true
    },
    {
        id: 'local-012',
        title: 'Sương Sớm',
        artist: 'Lâm Quế Hoa',
        style: 'Sơn dầu',
        imageUrl: 'https://picsum.photos/seed/art32/600/800',
        story: 'Lâm Quế Hoa là người say mê bình minh và những khoảnh khắc tĩnh lặng. "Sương Sớm" như một trang nhật ký thị giác với những nhành cây phủ sương, ánh sáng vàng nhẹ và cảm giác yên bình mở ra một ngày mới.',
        bio: 'Lâm Quế Hoa trân trọng nhịp sống chậm và các khung cảnh thiên nhiên tinh tế. Cô thường gặp bình minh trên những cánh đồng và dùng sơn dầu để lưu lại hương sắc mờ ảo của sương.',
        likes: 67,
        approved: true
    },
    {
        id: 'local-013',
        title: 'Hành Trình Mảnh Mai',
        artist: 'Nguyễn Vũ',
        style: 'Canvas',
        imageUrl: 'https://picsum.photos/seed/art33/600/800',
        story: 'Nguyễn Vũ là hoạ sĩ thích làm việc với chất liệu và lớp sơn dày. "Hành Trình Mảnh Mai" kể về những lớp ký ức vỡ vụn nhưng vẫn đầy niềm tin, qua đó người xem có thể cảm nhận được sự kiên nhẫn và đam mê của nghệ sĩ với từng chi tiết nhỏ.',
        bio: 'Nguyễn Vũ chuyên tạo tranh với những mảng ghép, chất liệu và kết cấu độc đáo. Anh lớn lên trong gia đình thợ mộc nên luôn trân trọng sự mộc mạc và chịu khó trong từng tác phẩm.',
        likes: 82,
        approved: true
    },
    {
        id: 'local-014',
        title: 'Bước Chân Phố Cổ',
        artist: 'Hoàng Sơn',
        style: 'Màu nước',
        imageUrl: 'https://picsum.photos/seed/art34/600/800',
        story: 'Hoàng Sơn luôn bị mê hoặc bởi kiến trúc cổ và những con phố nhỏ rêu phong. "Bước Chân Phố Cổ" khắc hoạ cảm giác hoài cổ khi bước trên đá, lắng nghe tiếng xe đạp xao động và ngửi thấy mùi ẩm của thời gian.',
        bio: 'Hoàng Sơn dành nhiều năm nghiên cứu phong cách cổ điển và những nét duyên dáng của phố cổ Việt Nam. Anh thường vẽ bằng màu nước để giữ được sự nhẹ nhàng và mơ hồ cho cảm giác hoài niệm.',
        likes: 73,
        approved: true
    },
    {
        id: 'local-015',
        title: 'Phút Thảnh Thơi',
        artist: 'Trịnh Minh Châu',
        style: 'Hiện đại',
        imageUrl: 'https://picsum.photos/seed/art35/600/800',
        story: 'Trịnh Minh Châu là nghệ sĩ thành thị yêu sự tĩnh lặng. "Phút Thảnh Thơi" ghi lại khoảnh khắc dừng lại giữa thành phố, khi mọi âm thanh như lắng xuống và tâm hồn được thư giãn, thở nhẹ trước khi tiếp tục hành trình.',
        bio: 'Trịnh Minh Châu bắt đầu với graffiti rồi chuyển sang nghệ thuật đương đại. Châu luôn tìm kiếm sự cân bằng giữa chuyển động và yên bình, và các tác phẩm của anh thường phản ánh nhịp sống hiện đại.',
        likes: 93,
        approved: true
    },
    {
        id: 'local-016',
        title: 'Ánh Trăng',
        artist: 'Mai Thanh Hà',
        style: 'Trừu tượng',
        imageUrl: 'https://picsum.photos/seed/art36/600/800',
        story: 'Mai Thanh Hà yêu thích chủ đề ban đêm và bóng tối. "Ánh Trăng" là sự giao thoa giữa ánh sáng tình yêu và những suy tư sâu kín, nơi người xem có thể tự do giải mã cảm xúc như một câu chuyện bí ẩn của chính mình.',
        bio: 'Mai Thanh Hà là nghệ sĩ trừu tượng với kỹ thuật màu sắc mạnh mẽ. Cô thường khai thác đề tài tồn tại và cảm xúc nội tâm, bằng cách sử dụng ánh sáng và bóng tối để tạo ra cảm giác lôi cuốn.',
        likes: 101,
        approved: true
    },
    {
        id: 'local-017',
        title: 'Nồng Nàn Hương Trà',
        artist: 'Phạm Đức Hoàng',
        style: 'Canvas',
        imageUrl: 'https://picsum.photos/seed/art37/600/800',
        story: 'Phạm Đức Hoàng lớn lên trong gia đình có truyền thống trà đạo. Anh luôn kết hợp hương vị trà với cảm xúc trong tranh. "Nồng Nàn Hương Trà" là bản tĩnh lặng nhưng rất gợi, mời người xem dừng chân và cảm nhận từng hơi thở của thời gian.',
        bio: 'Phạm Đức Hoàng có niềm đam mê với văn hoá truyền thống và thường dùng hội hoạ để kể về đời sống tinh thần. Anh theo đuổi phong cách mềm mại, trầm lắng nhưng sâu sắc.',
        likes: 56,
        approved: true
    },
    {
        id: 'local-018',
        title: 'Vũ Điệu Ánh Sáng',
        artist: 'Hoàng Bích Thu',
        style: 'Hiện đại',
        imageUrl: 'https://picsum.photos/seed/art38/600/800',
        story: 'Hoàng Bích Thu luôn tìm kiếm sự cân bằng giữa chuyển động và tĩnh lặng. "Vũ Điệu Ánh Sáng" như một điệu múa của các tia sáng trên nền tối, thể hiện nguồn năng lượng tích cực và khát khao đổi mới trong mỗi tác phẩm.',
        bio: 'Hoàng Bích Thu là hoạ sĩ đương đại với tinh thần sáng tạo không ngừng. Cô thường dùng ánh sáng và màu sắc đậm để tạo ra những tác phẩm rực rỡ, giàu năng lượng và đầy cảm hứng.',
        likes: 120,
        approved: true
    },
    {
        id: 'local-019',
        title: 'Mùa Sen',
        artist: 'Lê Quỳnh Anh',
        style: 'Sơn dầu',
        imageUrl: 'https://picsum.photos/seed/art39/600/800',
        story: 'Lê Quỳnh Anh là nghệ sĩ theo đuổi vẻ đẹp tinh khiết. "Mùa Sen" được tạo nên từ tình yêu với bông sen Việt Nam, biểu tượng của sự thuần khiết và kiên cường. Tác phẩm mang lại cảm giác nhẹ nhàng, sâu lắng và thanh cao.',
        bio: 'Lê Quỳnh Anh chuyên vẽ hoa sen và các đề tài mang tính chất thiền định. Cô muốn khán giả cảm nhận được vẻ đẹp hồn nhiên và an yên khi ngắm tranh.',
        likes: 89,
        approved: true
    },
    {
        id: 'local-020',
        title: 'Bình Yên Trong Ký Ức',
        artist: 'Trần Nam',
        style: 'Màu nước',
        imageUrl: 'https://picsum.photos/seed/art40/600/800',
        story: 'Trần Nam là hoạ sĩ luôn khám phá sự ấm áp của ký ức. "Bình Yên Trong Ký Ức" là tấm thiệp gửi đến quá khứ, với những màu sắc dịu dàng, vết cọ mềm và cảm giác an yên như trở về nhà trong tâm trí.',
        bio: 'Trần Nam dành nhiều năm lưu giữ ký ức qua tranh màu nước và ghi lại những cảm xúc thuần khiết. Anh luôn hướng tới sự nhẹ nhàng, lắng đọng và thân mật trong từng tác phẩm.',
        likes: 78,
        approved: true
    }
];

/**
 * Initialize the public gallery page
 */
document.addEventListener('DOMContentLoaded', function () {
    loadGallery();
    setupFilterButtons();
    setupSearch();
    setupChatbot();

    if (window.location.hash === '#gallery-panel') {
        showGalleryPanel();
    }
});

/**
 * Load artworks from the API and render the gallery
 */
function loadGallery() {
    showLoading(true);
    hideError();

    API.getArtworks()
        .then(function (data) {
            allArtworks = (data || []).concat(extraArtworks);
            renderFeaturedSection();
            applyFiltersAndRender();
            showLoading(false);
        })
        .catch(function (error) {
            showLoading(false);
            showError('Không thể tải tác phẩm. Vui lòng thử lại sau.');
            console.error('Load gallery error:', error);
        });
}

/**
 * Render featured artworks section
 */
function renderFeaturedSection() {
    var featured = getTopFeaturedArtworks(allArtworks, 6);
    var container = document.getElementById('featured-grid');
    if (!container) return;

    if (featured.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5">' +
            '<i class="bi bi-palette fs-1 text-gold"></i>' +
            '<p class="mt-3 text-muted-light">Không có tác phẩm nổi bật nào hiện tại.</p>' +
            '</div>';
        return;
    }

    var html = '';
    featured.forEach(function (artwork) {
        var imgUrl = getImageUrl(artwork.imageUrl, artwork.id);

        html += '<div class="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-4 artwork-card-wrapper" data-style="' + (artwork.style || '') + '">';
        html += '  <div class="card artwork-card h-100" style="cursor: pointer;" onclick="openArtworkModal(\'' + artwork.id + '\')">';
        html += '    <div class="card-img-wrapper">';
        html += '      <img src="' + imgUrl + '" class="card-img-top" alt="' + (artwork.title || '') + '" loading="lazy" onerror="this.src=\'https://picsum.photos/seed/fallback' + artwork.id + '/600/800\'">';
        html += '      <div class="card-img-overlay-gradient"></div>';
        html += '      <span class="style-badge">' + (artwork.style || 'N/A') + '</span>';
        html += '    </div>';
        html += '    <div class="card-body">';
        html += '      <h5 class="card-title">' + (artwork.title || 'Untitled') + '</h5>';
        html += '      <p class="card-artist"><i class="bi bi-person-fill"></i> ' + (artwork.artist || 'Unknown') + '</p>';
        html += '      <div class="card-footer-info">';
        html += '        <button class="btn-like" data-id="' + artwork.id + '" data-likes="' + (artwork.likes || 0) + '">';
        html += '          <i class="bi bi-heart-fill"></i>';
        html += '          <span class="like-count">' + (artwork.likes || 0) + '</span>';
        html += '        </button>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    });

    container.innerHTML = html;

    var cards = container.querySelectorAll('.artwork-card-wrapper');
    for (var i = 0; i < cards.length; i++) {
        (function (card, index) {
            setTimeout(function () {
                card.classList.add('visible');
            }, index * 50);
        })(cards[i], i);
    }
}

function showGalleryPanel() {
    var featured = document.querySelector('.featured-section');
    var galleryPanel = document.getElementById('gallery-panel');

    if (featured) {
        featured.classList.add('d-none');
    }
    if (galleryPanel) {
        galleryPanel.classList.remove('d-none');
        galleryPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function getTopFeaturedArtworks(artworks, limit) {
    var approved = filterApproved(artworks).slice();
    approved.sort(function (a, b) {
        return (b.likes || 0) - (a.likes || 0);
    });
    return approved.slice(0, limit);
}

/**
 * Apply all active filters (approved + style + search) and render
 */
function applyFiltersAndRender() {
    var result = filterApproved(allArtworks);

    if (currentFilter !== 'all') {
        result = filterByStyle(result, currentFilter);
    }

    if (currentSearch.trim() !== '') {
        result = searchArtworks(result, currentSearch);
    }

    renderArtworks(result);
    updateSearchInfo(result.length);
}

/**
 * Filter artworks to only show approved ones
 * @param {Array} artworks
 * @returns {Array}
 */
function filterApproved(artworks) {
    var result = [];
    for (var i = 0; i < artworks.length; i++) {
        if (artworks[i].status === 'approved' || artworks[i].approved === true) {
            result.push(artworks[i]);
        }
    }
    return result;
}

/**
 * Filter artworks by style
 * @param {Array} artworks
 * @param {string} style
 * @returns {Array}
 */
function filterByStyle(artworks, style) {
    if (!style || style === 'all') return artworks;
    var filtered = [];
    for (var i = 0; i < artworks.length; i++) {
        if (artworks[i].style === style) {
            filtered.push(artworks[i]);
        }
    }
    return filtered;
}

/**
 * Search artworks by title or artist name
 * @param {Array} artworks
 * @param {string} query
 * @returns {Array}
 */
function searchArtworks(artworks, query) {
    var q = query.toLowerCase().trim();
    if (!q) return artworks;
    var results = [];
    for (var i = 0; i < artworks.length; i++) {
        var title = (artworks[i].title || '').toLowerCase();
        var artist = (artworks[i].artist || '').toLowerCase();
        var style = (artworks[i].style || '').toLowerCase();
        if (title.indexOf(q) !== -1 || artist.indexOf(q) !== -1 || style.indexOf(q) !== -1) {
            results.push(artworks[i]);
        }
    }
    return results;
}

/**
 * Render artworks into the masonry grid
 * @param {Array} data
 */
function renderArtworks(data) {
    var container = document.getElementById('gallery-grid');
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5">' +
            '<i class="bi bi-palette fs-1 text-gold"></i>' +
            '<p class="mt-3 text-muted-light">Không tìm thấy tác phẩm nào.</p>' +
            '</div>';
        return;
    }

    var html = '';
    data.forEach(function (artwork) {
        var imgUrl = getImageUrl(artwork.imageUrl, artwork.id);

        html += '<div class="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-4 artwork-card-wrapper" data-style="' + (artwork.style || '') + '">';
        html += '  <div class="card artwork-card h-100" style="cursor: pointer;" onclick="openArtworkModal(\'' + artwork.id + '\')">';
        html += '    <div class="card-img-wrapper">';
        html += '      <img src="' + imgUrl + '" class="card-img-top" alt="' + (artwork.title || '') + '" loading="lazy" onerror="this.src=\'https://picsum.photos/seed/fallback' + artwork.id + '/600/800\'">';
        html += '      <div class="card-img-overlay-gradient"></div>';
        html += '      <span class="style-badge">' + (artwork.style || 'N/A') + '</span>';
        html += '    </div>';
        html += '    <div class="card-body">';
        html += '      <h5 class="card-title">' + (artwork.title || 'Untitled') + '</h5>';
        html += '      <p class="card-artist"><i class="bi bi-person-fill"></i> ' + (artwork.artist || 'Unknown') + '</p>';
        html += '      <div class="card-footer-info">';
        html += '        <button class="btn-like" data-id="' + artwork.id + '" data-likes="' + (artwork.likes || 0) + '">';
        html += '          <i class="bi bi-heart-fill"></i>';
        html += '          <span class="like-count">' + (artwork.likes || 0) + '</span>';
        html += '        </button>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Staggered fade-in
    var cards = container.querySelectorAll('.artwork-card-wrapper');
    for (var i = 0; i < cards.length; i++) {
        (function (card, index) {
            setTimeout(function () {
                card.classList.add('visible');
            }, index * 50);
        })(cards[i], i);
    }

    setupLikeButtons();
}

/**
 * Set up search input with debounce
 */
function setupSearch() {
    var searchInput = document.getElementById('search-input');
    var clearBtn = document.getElementById('search-clear');
    if (!searchInput) return;

    var debounceTimer = null;

    searchInput.addEventListener('input', function () {
        var value = searchInput.value;
        currentSearch = value;

        // Show/hide clear button
        if (clearBtn) {
            clearBtn.style.display = value.length > 0 ? 'block' : 'none';
        }

        // Debounce: wait 300ms after user stops typing
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            var galleryGrid = document.getElementById('gallery-grid');
            galleryGrid.classList.add('fade-transition');

            setTimeout(function () {
                applyFiltersAndRender();
                galleryGrid.classList.remove('fade-transition');
            }, 200);
        }, 300);
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            searchInput.value = '';
            currentSearch = '';
            clearBtn.style.display = 'none';
            applyFiltersAndRender();
            searchInput.focus();
        });
    }
}

/**
 * Update search results info text
 * @param {number} count
 */
function updateSearchInfo(count) {
    var infoEl = document.getElementById('search-results-info');
    if (!infoEl) return;

    if (currentSearch.trim() !== '') {
        infoEl.innerHTML = 'Tìm thấy <span class="highlight">' + count + '</span> tác phẩm cho "' + currentSearch + '"';
    } else {
        infoEl.innerHTML = '';
    }
}

/**
 * Set up click event listeners on filter buttons
 */
function setupFilterButtons() {
    var filterContainer = document.getElementById('filter-bar');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;

        var style = btn.getAttribute('data-style');
        currentFilter = style;

        // Update active state
        var allBtns = filterContainer.querySelectorAll('.filter-btn');
        for (var i = 0; i < allBtns.length; i++) {
            allBtns[i].classList.remove('active');
        }
        btn.classList.add('active');

        // Filter and re-render with fade
        var galleryGrid = document.getElementById('gallery-grid');
        galleryGrid.classList.add('fade-transition');

        setTimeout(function () {
            applyFiltersAndRender();
            galleryGrid.classList.remove('fade-transition');
        }, 250);
    });
}

/**
 * Set up click event listeners on like buttons
 */
function setupLikeButtons() {
    var likeButtons = document.querySelectorAll('.btn-like');
    for (var i = 0; i < likeButtons.length; i++) {
        likeButtons[i].addEventListener('click', handleLikeClick);
    }
}

/**
 * Handle like button click — optimistic update + jQuery animation
 */
function handleLikeClick(e) {
    var btn = e.currentTarget;
    var id = btn.getAttribute('data-id');
    var currentLikes = parseInt(btn.getAttribute('data-likes'), 10) || 0;
    var newLikes = currentLikes + 1;

    var countSpan = btn.querySelector('.like-count');
    countSpan.textContent = newLikes;
    btn.setAttribute('data-likes', newLikes);

    // jQuery animation (ONLY jQuery usage)
    $(btn).addClass('liked-pulse');
    setTimeout(function () {
        $(btn).removeClass('liked-pulse');
    }, 600);

    API.updateArtwork(id, { likes: newLikes })
        .then(function (updated) {
            for (var i = 0; i < allArtworks.length; i++) {
                if (allArtworks[i].id === id || allArtworks[i].id === parseInt(id)) {
                    allArtworks[i].likes = updated.likes || newLikes;
                    break;
                }
            }
        })
        .catch(function (error) {
            countSpan.textContent = currentLikes;
            btn.setAttribute('data-likes', currentLikes);
            console.error('Like update failed:', error);
        });
}

function showLoading(show) {
    var loader = document.getElementById('loading-spinner');
    var gallery = document.getElementById('gallery-grid');
    if (loader) loader.style.display = show ? 'flex' : 'none';
    if (gallery) gallery.style.display = show ? 'none' : '';
}

function showError(message) {
    var errorBanner = document.getElementById('error-banner');
    if (errorBanner) {
        errorBanner.textContent = message;
        errorBanner.style.display = 'block';
    }
}

function hideError() {
    var errorBanner = document.getElementById('error-banner');
    if (errorBanner) errorBanner.style.display = 'none';
}

/**
 * Set up chatbot UI logic
 */
function setupChatbot() {
    var widget = document.getElementById('chatbot-widget');
    var toggler = document.getElementById('chatbot-toggler');
    var closeBtn = document.getElementById('chatbot-close');
    var sendBtn = document.getElementById('chatbot-send');
    var inputEl = document.getElementById('chatbot-input');
    var bodyEl = document.getElementById('chatbot-body');

    if (!widget) return;

    function toggleChat() {
        widget.classList.toggle('open');
        if (widget.classList.contains('open')) {
            inputEl.focus();
        }
    }

    toggler.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    function addMessage(text, isUser) {
        var msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg ' + (isUser ? 'user-msg' : 'bot-msg');
        msgDiv.textContent = text;
        bodyEl.appendChild(msgDiv);
        bodyEl.scrollTop = bodyEl.scrollHeight;
    }

    function processMessage() {
        var text = inputEl.value.trim();
        if (!text) return;

        addMessage(text, true);
        inputEl.value = '';

        // Bot response logic
        setTimeout(function() {
            var response = "Cảm ơn bạn! Hiện tại tôi đang trong quá trình học hỏi. Bạn có thể sử dụng thanh tìm kiếm phía trên để tìm tác phẩm nghệ thuật nhé.";
            var q = text.toLowerCase();
            
            if (q.includes('giá') || q.includes('bao nhiêu') || q.includes('tiền')) {
                response = "Để biết thông tin chi tiết về giá cả, xin vui lòng liên hệ trực tiếp qua email hoặc điện thoại.";
            } else if (q.includes('tác giả') || q.includes('họa sĩ') || q.includes('nghệ sĩ') || q.includes('ai vẽ')) {
                response = "ArtGallery trưng bày tác phẩm của rất nhiều họa sĩ tài năng. Bạn có thể gõ tên tác giả vào thanh tìm kiếm để xem nhé.";
            } else if (q.includes('mua') || q.includes('đặt hàng') || q.includes('sở hữu')) {
                response = "ArtGallery hiện đang tập trung triển lãm trực tuyến. Chức năng đặt mua sẽ sớm ra mắt trong thời gian tới!";
            } else if (q.includes('chào') || q.includes('hi ') || q.includes('hello') || q.includes('xin chào')) {
                response = "Chào bạn! Chúc bạn một ngày tốt lành và thưởng thức nghệ thuật vui vẻ.";
            } else if (q.includes('đẹp') || q.includes('tuyệt') || q.includes('ấn tượng')) {
                response = "Cảm ơn bạn! Các họa sĩ của chúng tôi luôn đặt trọn tâm huyết vào từng đường nét, màu sắc.";
            } else if (q.includes('liên hệ') || q.includes('địa chỉ') || q.includes('ở đâu')) {
                response = "Bạn có thể liên hệ với chúng tôi qua email contact@artgallery.vn. ArtGallery là nền tảng trực tuyến nên bạn có thể thưởng thức bất cứ lúc nào!";
            } else if (q.includes('tên gì') || q.includes('bạn là ai') || q.includes('bot')) {
                response = "Tôi là ArtBot, trợ lý ảo thông minh của ArtGallery. Rất vui được hỗ trợ bạn khám phá không gian nghệ thuật này.";
            }
            addMessage(response, false);
        }, 250);
    }

    sendBtn.addEventListener('click', processMessage);
    inputEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            processMessage();
        }
    });
}

/**
 * Open artwork detail modal
 */
function openArtworkModal(id) {
    var artwork = null;
    for (var i = 0; i < allArtworks.length; i++) {
        if (String(allArtworks[i].id) === String(id)) {
            artwork = allArtworks[i];
            break;
        }
    }
    if (!artwork) return;

    document.getElementById('modal-img').src = getImageUrl(artwork.imageUrl, artwork.id);
    document.getElementById('modal-title').textContent = artwork.title || 'Untitled';
    document.getElementById('modal-artist').textContent = artwork.artist || 'Unknown';
    document.getElementById('modal-style').textContent = artwork.style || 'N/A';
    document.getElementById('modal-likes').textContent = artwork.likes || 0;
    
    var storyEl = document.getElementById('modal-story');
    var bioEl = document.getElementById('modal-bio');

    if (artwork.story) {
        storyEl.textContent = artwork.story;
        storyEl.style.display = 'block';
    } else {
        storyEl.textContent = 'Đây là tác phẩm của ' + (artwork.artist || 'nghệ sĩ') + '. Nghệ sĩ đã dồn tâm huyết vào từng nét cọ để tạo nên một không gian nghệ thuật đầy gợi cảm.';
        storyEl.style.display = 'block';
    }

    if (artwork.bio) {
        bioEl.textContent = artwork.bio;
    } else {
        bioEl.textContent = 'Tiểu sử tác giả đang được cập nhật. Nghệ sĩ này là người sáng tạo đam mê và luôn tìm kiếm cách kể chuyện qua màu sắc, đường nét và ánh sáng.';
    }
    bioEl.style.display = 'block';

    var modal = new bootstrap.Modal(document.getElementById('artworkModal'));
    modal.show();
}
