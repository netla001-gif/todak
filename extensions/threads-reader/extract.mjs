// Self-contained, read-only function: Chrome serializes this into the active tab.
// Only rendered search-result DOM is read. No cookies, storage, or private APIs.
export function extractThreadsPage() {
  if (!['www.threads.com', 'threads.com', 'www.threads.net', 'threads.net'].includes(location.hostname) || location.pathname !== '/search') {
    return { error: 'not_search', posts: [] };
  }
  const query = new URL(location.href).searchParams.get('q') || '';
  const input = document.querySelector('input[type="search"], input');
  if (input && input.value.trim() !== query.trim()) return { error: 'loading', posts: [] };
  const posts = [], seen = new Set();
  for (const anchor of document.querySelectorAll('a[href*="/post/"]')) {
    if (posts.length >= 50) break;
    const time = anchor.querySelector('time[datetime]');
    if (!time || !anchor.getClientRects().length) continue;
    const url = new URL(anchor.getAttribute('href'), location.origin);
    const match = url.pathname.match(/^\/@([^/]+)\/post\/([^/]+)\/?$/);
    if (!match || url.origin !== location.origin || seen.has(match[2])) continue;
    let text = '';
    for (let root = anchor.parentElement, depth = 0; root && depth < 14; root = root.parentElement, depth++) {
      const times = root.querySelectorAll('a[href*="/post/"] time[datetime]');
      if (times.length > 1) break; // Never merge adjacent posts or a quoted post.
      const nodes = Array.from(root.querySelectorAll('span[dir="auto"]')).filter(node => {
        const value = node.innerText?.trim() || '';
        return node.getClientRects().length && value.length >= 8 && value !== match[1]
          && !node.closest('a, button, [role="button"]') && !node.querySelector('time')
          && !/^[\d\s.,/KkMm만천+-]+$/.test(value) && !/^\d{4}-\d{2}-\d{2}$/.test(value);
      });
      const top = nodes.filter(node => !nodes.some(other => other !== node && other.contains(node)));
      text = [...new Set(top.map(node => node.innerText.trim()))].join('\n').replace(/\n\d+\s*\n?\/\s*\n?\d+\s*$/, '');
      if (text) break;
    }
    if (!text) continue;
    seen.add(match[2]);
    posts.push({id:match[2], username:match[1], text:text.slice(0,10000), permalink:url.origin+url.pathname, timestamp:time.getAttribute('datetime')});
  }
  return { query, posts, fetchedAt:new Date().toISOString(), source:'browser', error:posts.length ? null : 'no_visible_posts' };
}
