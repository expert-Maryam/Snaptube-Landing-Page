const pageConfig = {
      overview: { title: 'Overview', subtitle: 'Here’s an overview of your AI platform performance.' },
      projects: { title: 'Projects', subtitle: 'Manage active AI initiatives and monitor team delivery.' },
      models: { title: 'AI Models', subtitle: 'Compare model performance and usage distribution.' },
      analytics: { title: 'Analytics', subtitle: 'Review AI usage, costs, and performance trends.' },
      playground: { title: 'AI Playground', subtitle: 'Test prompts and explore new AI experiences.' },
      keys: { title: 'API Keys', subtitle: 'Securely manage API access and usage.' },
      billing: { title: 'Billing', subtitle: 'Track plan usage, spend, and invoices.' },
      settings: { title: 'Settings', subtitle: 'Adjust workspace preferences and controls.' }
    };

    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const pageSections = Array.from(document.querySelectorAll('.page'));
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const pageEyebrow = document.getElementById('pageEyebrow');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const loadingOverlay = document.getElementById('loadingOverlay');

    function activatePage(pageId) {
      navItems.forEach((item) => item.classList.toggle('active', item.dataset.page === pageId));
      pageSections.forEach((section) => section.classList.toggle('active', section.dataset.pageSection === pageId));
      const config = pageConfig[pageId] || pageConfig.overview;
      pageTitle.textContent = config.title;
      pageSubtitle.textContent = config.subtitle;
      pageEyebrow.textContent = pageId === 'overview' ? 'AI platform analytics' : 'AI platform dashboard';
      if (window.innerWidth <= 860) {
        sidebar.classList.remove('open');
      }
    }

    navItems.forEach((item) => {
      item.addEventListener('click', () => activatePage(item.dataset.page));
    });

    menuToggle?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
      if (window.innerWidth <= 860 && sidebar.classList.contains('open') && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.remove('open');
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) sidebar.classList.remove('open');
    });

    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      setTimeout(() => loadingOverlay.remove(), 260);
    }, 700);

    const chartData = {
      '7d': [120, 190, 180, 260, 310, 290, 340],
      '30d': [180, 220, 260, 240, 320, 350, 320, 370, 410, 390, 460, 480, 520, 540, 560, 610, 640, 650, 670, 690, 710, 730, 760, 780, 800, 820, 840, 860, 900, 940],
      '90d': [120, 145, 170, 200, 230, 260, 290, 320, 350, 380, 410, 430, 460, 490, 520, 560, 590, 610, 640, 690, 720, 760, 800, 840, 870, 910, 940, 980, 1010, 1050, 1080, 1120, 1150, 1200, 1250, 1300]
    };

    const tokenData = {
      '7d': [90, 140, 130, 170, 200, 190, 220],
      '30d': [130, 160, 190, 180, 240, 260, 240, 280, 300, 290, 340, 360, 380, 400, 420, 460, 480, 500, 520, 540, 560, 590, 620, 640, 660, 720, 740, 760, 790, 820],
      '90d': [90, 110, 140, 180, 210, 240, 280, 310, 340, 370, 400, 430, 460, 490, 520, 560, 590, 620, 650, 700, 730, 770, 810, 850, 890, 930, 960, 1000, 1030, 1070, 1110, 1160, 1210, 1260, 1300, 1360]
    };

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const chartSvg = document.getElementById('trendChart');
    const rangeButtons = Array.from(document.querySelectorAll('.range-pill'));

    function createChartPoints(values, width, height, padding) {
      const max = Math.max(...values) * 1.15;
      return values.map((value, index) => {
        const x = padding + (index / (values.length - 1 || 1)) * (width - padding * 2);
        const y = height - padding - (value / max) * (height - padding * 2);
        return { x, y, value };
      });
    }

    function buildChart(range) {
      const width = 700;
      const height = 260;
      const padding = 34;
      const requestPoints = createChartPoints(chartData[range], width, height, padding);
      const tokenPoints = createChartPoints(tokenData[range], width, height, padding);

      const linePath = (points) => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
      const areaPath = (points) => {
        const d = linePath(points);
        const last = points[points.length - 1];
        const first = points[0];
        return `${d} L ${last.x.toFixed(2)} ${height - padding} L ${first.x.toFixed(2)} ${height - padding} Z`;
      };

      const gridLines = Array.from({ length: 4 }, (_, index) => {
        const y = padding + ((height - padding * 2) / 3) * index;
        return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="4 4"></line>`;
      }).join('');

      const xLabels = Array.from({ length: Math.min(labels.length, requestPoints.length) }, (_, index) => {
        const step = requestPoints.length > 1 ? (requestPoints.length - 1) : 1;
        const x = padding + (index * (width - padding * 2)) / step;
        return `<text x="${x}" y="${height - 8}" text-anchor="middle" fill="#64748b" font-size="11">${labels[index] || ''}</text>`;
      }).join('');

      const requestDots = requestPoints.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#6d5dfb" stroke="#fff" stroke-width="3"></circle>`).join('');
      const tokenDots = tokenPoints.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#8b5cf6" stroke="#fff" stroke-width="3"></circle>`).join('');

      chartSvg.innerHTML = `
        <rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="transparent"></rect>
        ${gridLines}
        <path d="${areaPath(requestPoints)}" fill="rgba(109,93,251,0.08)"></path>
        <path d="${linePath(requestPoints)}" fill="none" stroke="#6d5dfb" stroke-width="3" stroke-linecap="round"></path>
        <path d="${linePath(tokenPoints)}" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 6"></path>
        ${requestDots}
        ${tokenDots}
        ${xLabels}
      `;
    }

    rangeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        rangeButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
        buildChart(button.dataset.range);
      });
    });

    buildChart('7d');