import { formatDate, typeLabel, typeEmoji } from '../utils/format.js';

export function createReviewCard(review, { onEdit } = {}) {
  const card = document.createElement('div');
  card.className = 'review-card';

  // Image
  const imgSrc = review.image_path;
  if (imgSrc) {
    const img = document.createElement('img');
    img.className = 'card-image';
    img.src = imgSrc;
    img.alt = review.title;
    img.loading = 'lazy';
    img.onerror = () => {
      img.replaceWith(createPlaceholder(review.type));
    };
    card.appendChild(img);
  } else {
    card.appendChild(createPlaceholder(review.type));
  }

  // Body
  const body = document.createElement('div');
  body.className = 'card-body';

  // Header: title + type badge
  const header = document.createElement('div');
  header.className = 'card-header';

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = review.title;

  const badge = document.createElement('span');
  badge.className = 'card-type-badge';
  badge.textContent = typeLabel(review.type);

  header.appendChild(title);
  header.appendChild(badge);

  // Rating
  const rating = document.createElement('div');
  rating.className = 'card-rating';
  rating.textContent = formatRating(review.rating);

  body.appendChild(header);
  body.appendChild(rating);

  // Date (optional)
  if (review.watch_date) {
    const date = document.createElement('div');
    date.className = 'card-date';
    date.textContent = formatDate(review.watch_date);
    body.appendChild(date);
  }

  // Review preview
  if (review.review) {
    const preview = document.createElement('div');
    preview.className = 'card-review-preview';
    preview.textContent = review.review;
    body.appendChild(preview);
  }

  card.appendChild(body);

  card.addEventListener('click', () => {
    if (onEdit) onEdit(review.id);
  });

  return card;
}

function formatRating(rating) {
  const n = Number(rating);
  if (!n && n !== 0) return '— / 5.0';
  return (Math.round(n * 10) / 10).toFixed(1) + ' / 5.0';
}

function createPlaceholder(type) {
  const div = document.createElement('div');
  div.className = 'card-image-placeholder';
  div.textContent = typeEmoji(type);
  return div;
}
