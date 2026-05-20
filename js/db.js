const DB_NAME = 'review-app';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('reviews')) {
        const store = db.createObjectStore('reviews', { keyPath: 'id' });
        store.createIndex('type', 'type');
        store.createIndex('created_at', 'created_at');
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function tx(mode, fn) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const t = db.transaction('reviews', mode);
      const store = t.objectStore('reviews');
      const result = fn(store);
      if (result instanceof IDBRequest) {
        result.onsuccess = () => resolve(result.result);
        result.onerror = () => reject(result.error);
      } else {
        resolve(result);
      }
      t.oncomplete = () => db.close();
    });
  });
}

export const db = {
  async list({ search, type, sort } = {}) {
    const all = await tx('readonly', store => store.getAll());
    let reviews = all || [];

    if (type) {
      reviews = reviews.filter(r => r.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      reviews = reviews.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.review && r.review.toLowerCase().includes(q))
      );
    }

    const [key, dir] = (sort || 'created_at_desc').split('_');
    reviews.sort((a, b) => {
      let va = a[key] ?? '';
      let vb = b[key] ?? '';
      if (key === 'rating' || key === 'created_at') {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
        return dir === 'desc' ? vb - va : va - vb;
      }
      return dir === 'desc' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });

    return reviews;
  },

  async get(id) {
    return tx('readonly', store => store.get(id));
  },

  async create(data) {
    const now = Date.now();
    const review = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    await tx('readwrite', store => store.add(review));
    return review;
  },

  async update(id, data) {
    const existing = await tx('readonly', store => store.get(id));
    if (!existing) throw new Error('未找到该记录');
    const updated = { ...existing, ...data, updated_at: Date.now() };
    await tx('readwrite', store => store.put(updated));
    return updated;
  },

  async delete(id) {
    const existing = await tx('readonly', store => store.get(id));
    if (!existing) throw new Error('未找到该记录');
    await tx('readwrite', store => store.delete(id));
  },

  async stats() {
    const all = await tx('readonly', store => store.getAll());
    const total = all.length;
    const byType = {};
    let sumRating = 0;
    let ratedCount = 0;
    for (const r of all) {
      byType[r.type] = (byType[r.type] || 0) + 1;
      if (r.rating) {
        sumRating += r.rating;
        ratedCount++;
      }
    }
    return {
      total,
      by_type: byType,
      avg_rating: ratedCount > 0 ? Math.round(sumRating / ratedCount * 10) / 10 : 0,
    };
  },
};
