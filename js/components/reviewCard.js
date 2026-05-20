import { formatDate, typeLabel, typeEmoji } from '../utils/format.js';

export function createReviewCard(review, { onEdit, onRate } = {}) {
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

  // Stars (interactive)
  const stars = createStarRow(review.rating, (newRating) => {
    if (onRate) onRate(review.id, newRating);
  });

  body.appendChild(header);
  body.appendChild(stars);

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

function createStarRow(rating, onRate) {
  const row = document.createElement('div');
  row.className = 'card-stars';

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'card-star' + (i <= rating ? ' filled' : '');
    star.textContent = '★';
    star.dataset.value = i;

    star.addEventListener('click', (e) => {
      e.stopPropagation();
      const newRating = i === rating ? 0 : i;
      onRate(newRating);
    });

    star.addEventListener('mouseenter', () => {
      row.querySelectorAll('.card-star').forEach((s, j) => {
        s.classList.toggle('filled', j < i);
      });
    });

    row.appendChild(star);
  }

  row.addEventListener('mouseleave', () => {
    row.querySelectorAll('.card-star').forEach((s, j) => {
      s.classList.toggle('filled', j < rating);
    });
  });

  return row;
}

function createPlaceholder(type) {
  const div = document.createElement('div');
  div.className = 'card-image-placeholder';
  div.textContent = typeEmoji(type);
  return div;
}
