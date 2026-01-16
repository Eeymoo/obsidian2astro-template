export function initSearchBox() {
  const searchInput = document.getElementById(
    "search-input"
  ) as HTMLInputElement;

  // Ctrl + K 快捷键
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // 回车搜索
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+site:blog.eeymoo.com`;
        window.location.href = searchUrl;
      }
    }
  });

  // Esc 清空
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      searchInput.blur();
    }
  });
}
