import { db } from './db.js';
import { ReviewList } from './components/reviewList.js';
import { ReviewForm } from './components/reviewForm.js';
import { SearchBar } from './components/searchBar.js';
import { SortControls } from './components/sortControls.js';

class App {
  constructor() {
    this.state = {
      reviews: [],
      filters: { search: '', type: '' },
      sort: 'created_at_desc',
    };

    this.reviewList = null;
    this.reviewForm = null;
    this.searchBar = null;
    this.sortControls = null;
    this.isSaving = false;
    this.deferredPrompt = null;
  }

  async init() {
    this.reviewList = new ReviewList(document.getElementById('review-list'), {
      onEdit: (id) => this.openEditForm(id),
    });
    this.reviewList.onRefresh = () => this.loadReviews();

    this.reviewForm = new ReviewForm(document.getElementById('modal-overlay'), {
      onSave: (id, formData) => this.handleSave(id, formData),
      onDelete: (id) => this.handleDelete(id),
      onClose: () => {},
    });

    this.searchBar = new SearchBar(document.getElementById('search-section'), {
      onSearch: (term) => this.setFilter('search', term),
      onTypeFilter: (type) => this.setFilter('type', type),
    });

    this.sortControls = new SortControls(document.getElementById('sort-controls'), {
      onChange: (sort) => this.setSort(sort),
    });

    document.getElementById('fab').addEventListener('click', () => this.openCreateForm());

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.openCreateForm();
      }
    });

    this.registerServiceWorker();
    this.setupInstallPrompt();

    await this.loadReviews();
    await this.loadStats();
  }

  setFilter(key, value) {
    this.state.filters[key] = value;
    this.loadReviews();
  }

  setSort(value) {
    this.state.sort = value;
    this.loadReviews();
  }

  async loadReviews() {
    try {
      const reviews = await db.list({
        search: this.state.filters.search || undefined,
        type: this.state.filters.type || undefined,
        sort: this.state.sort,
      });
      this.state.reviews = reviews;
      this.renderList();
    } catch (err) {
      this.showToast('加载失败：' + err.message, 'error');
    }
  }

  async loadStats() {
    try {
      const stats = await db.stats();
      document.getElementById('stats-total').textContent = `共 ${stats.total} 条记录`;
      document.getElementById('stats-avg').textContent = stats.total > 0
        ? `均分 ${stats.avg_rating}`
        : '均分 -';
    } catch (err) {
      // Silently fail for stats
    }
  }

  openCreateForm() {
    this.reviewForm.show(null);
  }

  async openEditForm(id) {
    try {
      const review = await db.get(id);
      this.reviewForm.show(review);
    } catch (err) {
      this.showToast('加载记录失败', 'error');
    }
  }

  async handleSave(id, data) {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      if (id) {
        await db.update(id, data);
        this.showToast('更新成功');
      } else {
        await db.create(data);
        this.showToast('添加成功');
      }
      this.reviewForm.hide();
      await this.loadReviews();
      await this.loadStats();
    } catch (err) {
      this.showToast('保存失败：' + err.message, 'error');
    } finally {
      this.isSaving = false;
    }
  }

  async handleDelete(id) {
    try {
      await db.delete(id);
      this.reviewForm.hide();
      this.showToast('删除成功');
      await this.loadReviews();
      await this.loadStats();
    } catch (err) {
      this.showToast('删除失败：' + err.message, 'error');
    }
  }

  renderList() {
    const reviews = this.state.reviews;
    if (reviews.length === 0) {
      const hasFilters = this.state.filters.search || this.state.filters.type;
      this.reviewList.showEmptyState(hasFilters ? '未找到匹配的影视记录' : null);
    } else {
      this.reviewList.render(reviews);
    }
  }

  showToast(message, type = '') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast' + (type ? ` ${type}` : '');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js', { scope: './' })
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.warn('SW registration failed:', err));
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.hideInstallBanner();
    });
  }

  showInstallBanner() {
    const banner = document.getElementById('install-banner');
    banner.classList.remove('hidden');
    document.getElementById('install-btn').addEventListener('click', async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const result = await this.deferredPrompt.userChoice;
        this.deferredPrompt = null;
      }
      this.hideInstallBanner();
    }, { once: true });
    document.getElementById('install-dismiss').addEventListener('click', () => {
      this.hideInstallBanner();
    }, { once: true });
  }

  hideInstallBanner() {
    document.getElementById('install-banner').classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
