const FEED_JSON_URL = 'assets/data/zenn-feed.json';

const state = {
  articles: [],
  filters: {
    category: 'all',
    year: 'all',
    keyword: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 12,
  },
};

const elements = {
  articleGrid: document.getElementById('articleGrid'),
  categoryFilters: document.getElementById('categoryFilters'),
  yearFilters: document.getElementById('yearFilters'),
  searchInput: document.getElementById('searchInput'),
  currentYear: document.getElementById('currentYear'),
  pagination: document.getElementById('pagination'),
  themeToggle: document.getElementById('themeToggle'),
};

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  elements.currentYear.textContent = new Date().getFullYear();

  try {
    const articles = await loadArticles();
    state.articles = articles;
    buildFilterButtons();
    renderArticles();
  } catch (error) {
    console.error('Failed to load Zenn articles', error);
    renderError('Zennの記事情報を取得できませんでした。時間を空けて再度お試しください。');
  }

  elements.searchInput.addEventListener('input', (event) => {
    state.filters.keyword = event.target.value.trim().toLowerCase();
    state.pagination.currentPage = 1;
    renderArticles();
  });

  elements.themeToggle.addEventListener('change', (event) => {
    setTheme(event.target.checked ? 'dark' : 'light');
  });
});

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(systemPrefersDark ? 'dark' : 'light');
  }

  // Listen for changes in system preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only change if no theme is manually set
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    elements.themeToggle.checked = true;
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    elements.themeToggle.checked = false;
    localStorage.setItem('theme', 'light');
  }
}

async function loadArticles() {
  const response = await fetch(FEED_JSON_URL, {
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load feed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.articles)) {
    throw new Error('Invalid feed structure received');
  }

  return payload.articles
    .map((article) => ({
      title: article.title?.trim() ?? '',
      url: article.url ?? '',
      published_at: article.published_at ?? '',
      summary: article.summary ?? '',
      category: article.category ?? 'その他',
      tags: Array.isArray(article.tags) ? article.tags : [],
    }))
    .filter((article) => article.title && article.url);
}

function buildFilterButtons() {
  const categories = ['all', ...new Set(state.articles.map((article) => article.category))];
  const years = ['all', ...new Set(
    state.articles
      .map((article) => (article.published_at ? new Date(article.published_at).getFullYear().toString() : ''))
      .filter(Boolean)
  )].sort((a, b) => (a === 'all' ? -1 : b === 'all' ? 1 : Number(b) - Number(a)));

  renderFilterButtons(elements.categoryFilters, categories, 'category');
  renderFilterButtons(elements.yearFilters, years, 'year');
}

function renderFilterButtons(container, items, filterKey) {
  container.innerHTML = '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    button.dataset.value = item;
    button.textContent = item === 'all' ? 'すべて' : item;

    if (state.filters[filterKey] === item) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      state.filters[filterKey] = item;
      updateActiveButtons(container, item);
      state.pagination.currentPage = 1;
      renderArticles();
    });

    container.appendChild(button);
  });
}

function updateActiveButtons(container, activeValue) {
  container.querySelectorAll('.filter-button').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.value === activeValue);
  });
}

function renderArticles() {
  const filtered = state.articles.filter((article) => {
    const matchesCategory =
      state.filters.category === 'all' || article.category === state.filters.category;

    const articleYear = getPublishedDate(article)?.getFullYear().toString() ?? '';
    const matchesYear = state.filters.year === 'all' || articleYear === state.filters.year;

    const keywords = [article.title, article.summary, ...(article.tags || [])]
      .join(' ')
      .toLowerCase();
    const matchesKeyword = keywords.includes(state.filters.keyword);

    return matchesCategory && matchesYear && matchesKeyword;
  });

  if (!filtered.length) {
    const message =
      state.articles.length === 0
        ? '現在表示できる記事がありません。しばらくしてから再度ご確認ください。'
        : '条件に合う記事が見つかりませんでした。フィルターを変更してみてください。';
    elements.articleGrid.innerHTML = `<p class="empty-message">${message}</p>`;
    if (elements.pagination) {
      elements.pagination.innerHTML = '';
      elements.pagination.classList.add('is-hidden');
    }
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    const dateA = getPublishedDate(a)?.getTime() ?? 0;
    const dateB = getPublishedDate(b)?.getTime() ?? 0;
    return dateB - dateA;
  });

  const { itemsPerPage } = state.pagination;
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  if (state.pagination.currentPage > totalPages) {
    state.pagination.currentPage = totalPages;
  }

  const startIndex = (state.pagination.currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  const fragment = document.createDocumentFragment();
  paginated.forEach((article) => {
    fragment.appendChild(createArticleCard(article));
  });

  elements.articleGrid.innerHTML = '';
  elements.articleGrid.appendChild(fragment);
  renderPagination(totalPages);
}

function createArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'article-card';

  const link = document.createElement('a');
  link.href = article.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'card-link-wrapper';

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const front = document.createElement('div');
  front.className = 'card-face card-face--front';

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const category = document.createElement('span');
  category.textContent = article.category || '未分類';

  const date = document.createElement('time');
  const publishedDate = getPublishedDate(article);
  if (publishedDate) {
    date.dateTime = publishedDate.toISOString().split('T')[0];
    date.textContent = `${publishedDate.getFullYear()}年${publishedDate.getMonth() + 1}月${publishedDate.getDate()}日`;
  } else {
    date.textContent = '公開日不明';
  }

  meta.append(category, date);

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = article.title;

  const tags = document.createElement('div');
  tags.className = 'card-tags';
  (article.tags || []).forEach((tagText) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = tagText;
    tags.appendChild(tag);
  });

  front.append(meta, title);
  if (tags.childElementCount) {
    front.appendChild(tags);
  }

  const back = document.createElement('div');
  back.className = 'card-face card-face--back';

  const backTitle = document.createElement('h3');
  backTitle.className = 'card-title card-title--back';
  backTitle.textContent = article.title;

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = article.summary || 'この記事の詳細はZennでご確認ください。';

  const backBody = document.createElement('div');
  backBody.className = 'card-back-body';
  backBody.append(backTitle, description);

  const cta = document.createElement('span');
  cta.className = 'card-cta';
  cta.textContent = 'クリックで記事を開く';

  back.append(backBody, cta);

  inner.append(front, back);
  link.appendChild(inner);
  card.appendChild(link);
  applyCardBackground(card, article.category);
  return card;
}

function applyCardBackground(card, category) {
  const gradients = {
    フロントエンド: 'linear-gradient(135deg, rgba(93, 169, 233, 0.12), rgba(42, 117, 187, 0.08))',
    Web開発: 'linear-gradient(135deg, rgba(255, 217, 102, 0.18), rgba(93, 169, 233, 0.1))',
    インフラ: 'linear-gradient(135deg, rgba(120, 207, 181, 0.2), rgba(42, 117, 187, 0.12))',
    データサイエンス: 'linear-gradient(135deg, rgba(233, 129, 255, 0.2), rgba(93, 169, 233, 0.1))',
    ライフハック: 'linear-gradient(135deg, rgba(255, 180, 143, 0.2), rgba(93, 169, 233, 0.08))',
  };

  const gradient =
    gradients[category] ?? 'linear-gradient(135deg, rgba(93, 169, 233, 0.1), rgba(42, 117, 187, 0.06))';
  card.style.setProperty('--card-background', gradient);
}

function renderError(message) {
  elements.articleGrid.innerHTML = `<p class="empty-message">${message}</p>`;
  if (elements.pagination) {
    elements.pagination.innerHTML = '';
    elements.pagination.classList.add('is-hidden');
  }
}

function getPublishedDate(article) {
  if (!article.published_at) {
    return null;
  }
  const publishedDate = new Date(article.published_at);
  return Number.isNaN(publishedDate.getTime()) ? null : publishedDate;
}

function renderPagination(totalPages) {
  if (!elements.pagination) {
    return;
  }

  if (totalPages <= 1) {
    elements.pagination.innerHTML = '';
    elements.pagination.classList.add('is-hidden');
    return;
  }

  elements.pagination.classList.remove('is-hidden');
  elements.pagination.innerHTML = '';

  const { currentPage } = state.pagination;

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage === state.pagination.currentPage) {
      return;
    }
    state.pagination.currentPage = nextPage;
    renderArticles();
  };

  const prevButton = createPaginationButton('前へ', {
    disabled: currentPage === 1,
    ariaLabel: '前のページへ',
    onClick: () => goToPage(currentPage - 1),
  });
  elements.pagination.appendChild(prevButton);

  for (let page = 1; page <= totalPages; page += 1) {
    const pageButton = createPaginationButton(String(page), {
      isActive: page === currentPage,
      ariaLabel: `${page}ページ目`,
      onClick: () => goToPage(page),
    });
    elements.pagination.appendChild(pageButton);
  }

  const nextButton = createPaginationButton('次へ', {
    disabled: currentPage === totalPages,
    ariaLabel: '次のページへ',
    onClick: () => goToPage(currentPage + 1),
  });
  elements.pagination.appendChild(nextButton);
}

function createPaginationButton(
  label,
  { onClick, disabled = false, isActive = false, ariaLabel } = {}
) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pagination__button';
  button.textContent = label;

  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }

  if (isActive) {
    button.classList.add('is-active');
    button.setAttribute('aria-current', 'page');
  }

  if (disabled) {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  } else if (typeof onClick === 'function') {
    button.addEventListener('click', onClick);
  }

  return button;
}
