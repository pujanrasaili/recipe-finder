(function () {
  const saved = localStorage.getItem('recipe_theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('recipe_theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = theme === 'dark' ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
  }
  document.addEventListener('DOMContentLoaded', () => {
    setTheme(localStorage.getItem('recipe_theme') || 'light');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => {
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  });
})();
