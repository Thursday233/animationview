export class StarRating {
  constructor(container, { initial = 0, onChange } = {}) {
    this.container = container;
    this.rating = initial;
    this.onChange = onChange;
    this.stars = [];
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.classList.add('star-rating');
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = '★';
      star.dataset.value = i;

      if (i <= this.rating) {
        star.classList.add('filled');
      }

      star.addEventListener('click', () => this.setValue(i));
      star.addEventListener('mouseenter', () => this.preview(i));
      star.addEventListener('mouseleave', () => this.clearPreview());

      this.stars.push(star);
      this.container.appendChild(star);
    }

    this.container.addEventListener('mouseleave', () => this.clearPreview());
  }

  preview(n) {
    this.stars.forEach((s, i) => {
      s.classList.toggle('hover', i < n);
    });
  }

  clearPreview() {
    this.stars.forEach((s, i) => {
      s.classList.remove('hover');
      s.classList.toggle('filled', i < this.rating);
    });
  }

  setValue(n) {
    this.rating = n;
    this.stars.forEach((s, i) => {
      s.classList.toggle('filled', i < n);
    });
    if (this.onChange) this.onChange(n);
  }

  getValue() {
    return this.rating;
  }
}
