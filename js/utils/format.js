export function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

export function typeLabel(type) {
  const map = { movie: '电影', tv: '漫画', anime: '番剧' };
  return map[type] || type;
}

export function typeEmoji(type) {
  const map = { movie: '🎬', tv: '📖', anime: '🌸' };
  return map[type] || '📌';
}

export function typeColor(type) {
  const map = { movie: '#e94560', tv: '#4caf50', anime: '#2196f3' };
  return map[type] || '#888';
}

export function timeAgo(isoStr) {
  if (!isoStr) return '';
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(isoStr.split('T')[0]);
}
