const RSS_FEED_URL = 'https://zenn.dev/urakawa_jinsei/feed';
const RSS_PROXY_URL = `https://r.jina.ai/${RSS_FEED_URL}`;

const state = {
  articles: [],
  filters: {
    category: 'all',
    year: 'all',
    keyword: '',
  },
};

const elements = {
  articleGrid: document.getElementById('articleGrid'),
  categoryFilters: document.getElementById('categoryFilters'),
  yearFilters: document.getElementById('yearFilters'),
  searchInput: document.getElementById('searchInput'),
  currentYear: document.getElementById('currentYear'),
};

document.addEventListener('DOMContentLoaded', async () => {
  elements.currentYear.textContent = new Date().getFullYear();

  try {
    const feedText = await loadRssFeed();
    const articles = parseRssFeed(feedText);
    if (!articles.length) {
      throw new Error('No articles found in feed');
    }
    state.articles = articles;
    buildFilterButtons();
    renderArticles();
  } catch (error) {
    console.error('Failed to load RSS feed', error);
    renderError('ZennのRSSフィードを取得できませんでした。時間を空けて再度お試しください。');
  }

  elements.searchInput.addEventListener('input', (event) => {
    state.filters.keyword = event.target.value.trim().toLowerCase();
    renderArticles();
  });
});

async function loadRssFeed() {
  try {
    return await fetchFeedText(RSS_FEED_URL);
  } catch (error) {
    console.warn('Direct RSS fetch failed. Trying proxy...', error);
    return await fetchFeedText(RSS_PROXY_URL);
  }
}

async function fetchFeedText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/atom+xml, application/xml, text/xml',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load feed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function parseRssFeed(feedText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(feedText, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent || 'Unable to parse RSS feed');
  }

  const entries = Array.from(doc.querySelectorAll('entry'));
  return entries
    .map((entry) => {
      const title = entry.querySelector('title')?.textContent?.trim() ?? '';
      const linkElement = entry.querySelector('link[rel="alternate"]') ?? entry.querySelector('link');
      const url = linkElement?.getAttribute('href') ?? '';
      const publishedAt =
        entry.querySelector('published')?.textContent?.trim() ??
        entry.querySelector('updated')?.textContent?.trim() ??
        '';
      const rawSummary =
        entry.querySelector('summary')?.textContent ?? entry.querySelector('content')?.textContent ?? '';
      const categories = Array.from(entry.querySelectorAll('category'))
        .map((node) => node.getAttribute('term')?.trim() ?? node.textContent?.trim() ?? '')
        .filter(Boolean);

      if (!title || !url) {
        return null;
      }

      return {
        title,
        url,
        published_at: publishedAt,
        summary: sanitizeSummary(rawSummary),
        category: categories[0] ?? 'その他',
        tags: categories,
      };
    })
    .filter(Boolean);
}

function sanitizeSummary(summary) {
  if (!summary) {
    return '';
  }
  const temp = document.createElement('div');
  temp.innerHTML = summary;
  return temp.textContent?.replace(/\s+/g, ' ').trim() ?? '';
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
    elements.articleGrid.innerHTML =
      '<p class="empty-message">条件に合う記事が見つかりませんでした。フィルターを変更してみてください。</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered
    .sort((a, b) => {
      const dateA = getPublishedDate(a)?.getTime() ?? 0;
      const dateB = getPublishedDate(b)?.getTime() ?? 0;
      return dateB - dateA;
    })
    .forEach((article) => {
      fragment.appendChild(createArticleCard(article));
    });

  elements.articleGrid.innerHTML = '';
  elements.articleGrid.appendChild(fragment);
}

function createArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'article-card';

  const content = document.createElement('div');
  content.className = 'article-card-content';

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

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = article.summary || '';

  const tags = document.createElement('div');
  tags.className = 'card-tags';
  (article.tags || []).forEach((tagText) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = tagText;
    tags.appendChild(tag);
  });

  const link = document.createElement('a');
  link.href = article.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'card-link';
  link.innerHTML = `読む <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5H21m0 0v7.5m0-7.5L10.5 15 6 10.5 3 13.5" /></svg>`;

  content.append(meta, title, description, tags, link);
  card.appendChild(content);
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

  card.style.backgroundImage = gradients[category] ?? 'linear-gradient(135deg, rgba(93, 169, 233, 0.1), rgba(42, 117, 187, 0.06))';
}

function renderError(message) {
  elements.articleGrid.innerHTML = `<p class="empty-message">${message}</p>`;
}

function getPublishedDate(article) {
  if (!article.published_at) {
    return null;
  }
  const publishedDate = new Date(article.published_at);
  return Number.isNaN(publishedDate.getTime()) ? null : publishedDate;
}
