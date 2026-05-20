import { StarRating } from './starRating.js';

export class ReviewForm {
  constructor(overlay, { onSave, onDelete, onClose } = {}) {
    this.overlay = overlay;
    this.onSave = onSave;
    this.onDelete = onDelete;
    this.onClose = onClose;
    this.mode = 'add';
    this.editId = null;
    this.starRating = null;
    this.imageDataUrl = null;

    this.elements = {
      title: overlay.querySelector('#modal-title'),
      formTitle: overlay.querySelector('#form-title'),
      formTitleError: overlay.querySelector('#form-title-error'),
      typePills: overlay.querySelector('#form-type-pills'),
      formTypeError: overlay.querySelector('#form-type-error'),
      watchDate: overlay.querySelector('#form-watch-date'),
      starContainer: overlay.querySelector('#form-star-rating'),
      formRatingError: overlay.querySelector('#form-rating-error'),
      imageArea: overlay.querySelector('#form-image-area'),
      imagePreview: overlay.querySelector('#image-preview'),
      imagePreviewImg: overlay.querySelector('#image-preview-img'),
      imagePlaceholder: overlay.querySelector('#image-placeholder'),
      imageRemove: overlay.querySelector('#image-remove'),
      imageInput: overlay.querySelector('#form-image-input'),
      review: overlay.querySelector('#form-review'),
      saveBtn: overlay.querySelector('#form-save'),
      deleteBtn: overlay.querySelector('#form-delete'),
      closeBtn: overlay.querySelector('#modal-close'),
      cancelBtn: overlay.querySelector('#form-cancel'),
    };

    this.setupListeners();
  }

  setupListeners() {
    this.starRating = new StarRating(this.elements.starContainer, {
      initial: 0,
      onChange: () => this.clearError('rating')
    });

    this.elements.typePills.querySelectorAll('.type-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.elements.typePills.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.clearError('type');
      });
    });

    this.elements.imageArea.addEventListener('click', (e) => {
      if (e.target === this.elements.imageRemove) return;
      this.elements.imageInput.click();
    });

    this.elements.imageInput.addEventListener('change', () => {
      const file = this.elements.imageInput.files[0];
      if (file) this.handleImageFile(file);
    });

    this.elements.imageArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.imageArea.classList.add('drag-over');
    });

    this.elements.imageArea.addEventListener('dragleave', () => {
      this.elements.imageArea.classList.remove('drag-over');
    });

    this.elements.imageArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.elements.imageArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) this.handleImageFile(file);
    });

    this.elements.imageRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      this.imageDataUrl = null;
      this.elements.imageInput.value = '';
      this.elements.imagePreview.classList.add('hidden');
      this.elements.imagePlaceholder.classList.remove('hidden');
    });

    this.elements.saveBtn.addEventListener('click', () => this.submit());
    this.elements.cancelBtn.addEventListener('click', () => this.hide());
    this.elements.closeBtn.addEventListener('click', () => this.hide());
    this.elements.deleteBtn.addEventListener('click', () => this.confirmDelete());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  show(review = null) {
    this.mode = review ? 'edit' : 'add';
    this.editId = review ? review.id : null;
    this.imageDataUrl = null;
    this.elements.imageInput.value = '';

    this.elements.title.textContent = this.mode === 'add' ? '添加记录' : '编辑记录';
    this.elements.deleteBtn.classList.toggle('hidden', this.mode === 'add');

    this.elements.formTitle.value = review ? review.title : '';
    this.elements.watchDate.value = review ? review.watch_date : '';
    this.elements.review.value = review ? review.review : '';
    this.clearErrors();

    const typeValue = review ? review.type : '';
    this.elements.typePills.querySelectorAll('.type-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.type === typeValue);
    });

    if (this.starRating) {
      this.starRating.rating = review ? review.rating : 0;
      this.starRating.render();
    }

    // Image preview: data URL or old server path
    if (review && review.image_path) {
      if (review.image_path.startsWith('data:')) {
        this.imageDataUrl = review.image_path;
        this.elements.imagePreviewImg.src = review.image_path;
      }
      this.elements.imagePreview.classList.remove('hidden');
      this.elements.imagePlaceholder.classList.add('hidden');
    } else {
      this.elements.imagePreview.classList.add('hidden');
      this.elements.imagePlaceholder.classList.remove('hidden');
    }

    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
    if (this.onClose) this.onClose();
  }

  clearErrors() {
    this.clearError('title');
    this.clearError('type');
    this.clearError('rating');
  }

  clearError(field) {
    const map = {
      title: this.elements.formTitleError,
      type: this.elements.formTypeError,
      rating: this.elements.formRatingError,
    };
    if (map[field]) map[field].textContent = '';
  }

  setError(field, message) {
    const map = {
      title: this.elements.formTitleError,
      type: this.elements.formTypeError,
      rating: this.elements.formRatingError,
    };
    if (map[field]) map[field].textContent = message;
  }

  validate() {
    let valid = true;

    const title = this.elements.formTitle.value.trim();
    if (!title) {
      this.setError('title', '标题不能为空');
      valid = false;
    } else if (title.length > 200) {
      this.setError('title', '标题不能超过200个字符');
      valid = false;
    }

    const activeType = this.elements.typePills.querySelector('.type-pill.active');
    if (!activeType || !activeType.dataset.type) {
      this.setError('type', '请选择类型');
      valid = false;
    }

    const rating = this.starRating.getValue();
    if (!rating || rating < 1) {
      this.setError('rating', '请选择评分');
      valid = false;
    }

    return valid;
  }

  async submit() {
    this.clearErrors();
    if (!this.validate()) return;

    const data = {
      title: this.elements.formTitle.value.trim(),
      type: this.elements.typePills.querySelector('.type-pill.active').dataset.type,
      rating: this.starRating.getValue(),
      watch_date: this.elements.watchDate.value,
      review: this.elements.review.value.trim(),
      image_path: this.imageDataUrl || '',
    };

    if (this.onSave) {
      await this.onSave(this.editId, data);
    }
  }

  async confirmDelete() {
    if (!this.editId) return;
    if (!confirm('确定要删除这条记录吗？')) return;
    if (this.onDelete) {
      await this.onDelete(this.editId);
    }
  }

  handleImageFile(file) {
    if (!file.type.startsWith('image/')) return;
    this.resizeImage(file, 800).then(resized => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageDataUrl = e.target.result;
        this.elements.imagePreviewImg.src = e.target.result;
        this.elements.imagePreview.classList.remove('hidden');
        this.elements.imagePlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(resized);
    });
  }

  resizeImage(file, maxWidth) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width <= maxWidth) {
            resolve(file);
            return;
          }
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.85);
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }
}
