export class SearchBar {
  constructor(container, { onSearch, onTypeFilter } = {}) {
    this.onSearch = onSearch;
    this.onTypeFilter = onTypeFilter;
    this.debounceTimer = null;

    this.input = container.querySelector('#search-input');
    this.clearBtn = container.querySelector('#search-clear');
    this.typePills = container.querySelector('#type-filters');

    this.setupListeners();
  }

  setupListeners() {
    this.input.addEventListener('input', () => {
      const value = this.input.value.trim();
      this.clearBtn.classList.toggle('hidden', !value);

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (this.onSearch) this.onSearch(value);
      }, 300);
    });

    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.clearBtn.classList.add('hidden');
      if (this.onSearch) this.onSearch('');
    });

    this.typePills.querySelectorAll('.type-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.typePills.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        if (this.onTypeFilter) this.onTypeFilter(pill.dataset.type);
      });
    });
  }

  getSearchTerm() {
    return this.input.value.trim();
  }

  getTypeFilter() {
    const active = this.typePills.querySelector('.type-pill.active');
    return active ? active.dataset.type : '';
  }
}
