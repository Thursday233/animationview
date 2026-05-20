export class SortControls {
  constructor(container, { onChange } = {}) {
    this.onChange = onChange;
    this.select = container.querySelector('#sort-select');

    this.select.addEventListener('change', () => {
      if (this.onChange) this.onChange(this.select.value);
    });
  }

  getValue() {
    return this.select.value;
  }
}
