import { createReviewCard } from './reviewCard.js';

export class ReviewList {
  constructor(container, { onEdit, onRate } = {}) {
    this.container = container;
    this.onEdit = onEdit;
    this.onRate = onRate;
    this.onRefresh = null;

    // Pull-to-refresh state
    this.pullStartY = 0;
    this.pullCurrentY = 0;
    this.isPulling = false;
    this.pullThreshold = 60;
  }

  render(reviews) {
    this.container.innerHTML = '';

    if (!reviews || reviews.length === 0) {
      this.showEmptyState();
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'review-grid';

    for (const review of reviews) {
      const card = createReviewCard(review, { onEdit: this.onEdit, onRate: this.onRate });
      grid.appendChild(card);
    }

    this.container.appendChild(grid);
    this.setupPullToRefresh(grid);
  }

  showEmptyState(message) {
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">${message || '还没有添加任何影视记录'}</p>
        <p class="empty-hint">${message ? '尝试调整搜索或筛选条件' : '点击下方 + 按钮开始记录'}</p>
      </div>
    `;
  }

  setupPullToRefresh(grid) {
    const touchStart = (e) => {
      if (this.container.scrollTop > 0) return;
      this.pullStartY = e.touches[0].clientY;
      this.isPulling = true;
    };

    const touchMove = (e) => {
      if (!this.isPulling) return;
      this.pullCurrentY = e.touches[0].clientY;
      const diff = this.pullCurrentY - this.pullStartY;
      if (diff > 0) {
        e.preventDefault();
        grid.style.transform = `translateY(${Math.min(diff * 0.4, 80)}px)`;
        grid.style.transition = 'none';
      }
    };

    const touchEnd = () => {
      if (!this.isPulling) return;
      this.isPulling = false;
      const diff = this.pullCurrentY - this.pullStartY;
      grid.style.transition = 'transform 0.3s ease';
      grid.style.transform = 'translateY(0)';

      if (diff > this.pullThreshold && this.onRefresh) {
        this.onRefresh();
      }
    };

    grid.addEventListener('touchstart', touchStart, { passive: false });
    grid.addEventListener('touchmove', touchMove, { passive: false });
    grid.addEventListener('touchend', touchEnd);
  }
}
