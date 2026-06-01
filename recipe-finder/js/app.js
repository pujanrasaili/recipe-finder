let favourites = JSON.parse(localStorage.getItem('recipe_favs') || '[]');

document.querySelectorAll('.stab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('nameSearch').classList.toggle('hidden', tab !== 'name');
    document.getElementById('ingredientSearch').classList.toggle('hidden', tab !== 'ingredients');
  });
});

document.getElementById('searchBtn').addEventListener('click', () => {
  const q = document.getElementById('dishInput').value.trim();
  if (q) runSearch(q, 'name');
});
document.getElementById('dishInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('searchBtn').click(); });

document.getElementById('ingSearchBtn').addEventListener('click', () => {
  const q = document.getElementById('ingredientInput').value.trim();
  if (q) runSearch(q, 'ingredients');
});
document.getElementById('ingredientInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('ingSearchBtn').click(); });

['cuisineFilter','dietFilter','timeFilter','sortFilter'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    const active = document.querySelector('.stab.active').dataset.tab;
    const q = active === 'name' ? document.getElementById('dishInput').value.trim() : document.getElementById('ingredientInput').value.trim();
    if (q) runSearch(q, active); else renderResults(applyFilters(RECIPES));
  });
});

function quickSearch(term) {
  document.getElementById('dishInput').value = term;
  document.querySelector('.stab[data-tab="name"]').click();
  runSearch(term, 'name');
}

function runSearch(query, mode) {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('resultsGrid').innerHTML = '';
  setTimeout(() => {
    let results;
    if (mode === 'name') {
      const q = query.toLowerCase();
      results = RECIPES.filter(r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.tags.some(t => t.includes(q)));
    } else {
      const terms = query.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
      results = RECIPES.filter(r => terms.some(term => r.ingredients.some(ing => ing.toLowerCase().includes(term))));
    }
    document.getElementById('loading').classList.add('hidden');
    renderResults(applyFilters(results), 'Results for "' + query + '"');
  }, 400);
}

function applyFilters(results) {
  const cuisine = document.getElementById('cuisineFilter').value;
  const diet = document.getElementById('dietFilter').value;
  const maxTime = parseInt(document.getElementById('timeFilter').value) || 9999;
  const sort = document.getElementById('sortFilter').value;
  if (cuisine) results = results.filter(r => r.cuisine === cuisine);
  if (diet) results = results.filter(r => r.diet.includes(diet));
  results = results.filter(r => r.time <= maxTime);
  if (sort === 'time') results.sort((a,b) => a.time - b.time);
  else if (sort === 'calories') results.sort((a,b) => a.calories - b.calories);
  else results.sort((a,b) => b.rating - a.rating);
  return results;
}

function renderResults(recipes, title) {
  const grid = document.getElementById('resultsGrid');
  const header = document.getElementById('resultsHeader');
  const empty = document.getElementById('emptyState');
  if (title) { document.getElementById('resultsTitle').textContent = title; document.getElementById('resultsCount').textContent = recipes.length + ' recipe' + (recipes.length !== 1 ? 's' : ''); }
  header.classList.remove('hidden');
  if (!recipes.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  grid.innerHTML = recipes.map((r, i) => `
    <div class="recipe-card" onclick="openModal(${r.id})" style="animation-delay:${i*0.05}s">
      <div class="card-img-wrap">
        <img src="${r.img}" alt="${r.name}" loading="lazy" />
        <span class="card-badge">${r.cuisine}</span>
        <button class="card-fav ${favourites.includes(r.id)?'active':''}" onclick="event.stopPropagation();toggleFav(${r.id},this)">${favourites.includes(r.id)?'❤️':'🤍'}</button>
      </div>
      <div class="card-body">
        <div class="card-cuisine">${r.cuisine}</div>
        <div class="card-title">${r.name}</div>
        <div class="card-meta">
          <span><i class="ti ti-clock"></i> ${r.time} min</span>
          <span><i class="ti ti-flame"></i> ${r.calories} cal</span>
          <span><i class="ti ti-users"></i> ${r.servings} srv</span>
        </div>
        <div class="card-rating">⭐ ${r.rating} <span style="font-weight:400;color:var(--text-muted);">&nbsp;·&nbsp;${r.diet.length?r.diet.join(', '):'All diets'}</span></div>
      </div>
    </div>`).join('');
}

function openModal(id) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return;
  const isFav = favourites.includes(r.id);
  document.getElementById('modalBody').innerHTML = `
    <img class="modal-hero-img" src="${r.img}" alt="${r.name}" />
    <div class="modal-content">
      <div class="modal-cuisine">${r.cuisine}${r.diet.length ? ' · '+r.diet.join(' · ') : ''}</div>
      <h2 class="modal-title">${r.name}</h2>
      <div class="modal-stats">
        <div class="modal-stat"><i class="ti ti-clock"></i><span><strong>${r.time} min</strong> cook time</span></div>
        <div class="modal-stat"><i class="ti ti-flame"></i><span><strong>${r.calories} cal</strong> per serving</span></div>
        <div class="modal-stat"><i class="ti ti-users"></i><span><strong>${r.servings}</strong> servings</span></div>
        <div class="modal-stat"><i class="ti ti-star"></i><span><strong>${r.rating}</strong> rating</span></div>
      </div>
      <div class="modal-section">
        <h3>Ingredients</h3>
        <div class="ingredients-grid">${r.ingredients.map(ing => `<div class="ingredient-item">${ing}</div>`).join('')}</div>
      </div>
      <div class="modal-section">
        <h3>Instructions</h3>
        <ol class="steps-list">${r.steps.map((s,i) => `<li class="step-item"><span class="step-num">${i+1}</span><span>${s}</span></li>`).join('')}</ol>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" onclick="toggleFavFromModal(${r.id})" id="modalFavBtn">${isFav?'❤️ Saved':'🤍 Save recipe'}</button>
        <button class="btn-secondary" onclick="window.print()"><i class="ti ti-printer"></i> Print</button>
      </div>
    </div>`;
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modalOverlay') || (e.currentTarget && e.currentTarget.classList.contains('modal-close'))) {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal({ target: document.getElementById('modalOverlay') }); });

function toggleFav(id, btn) {
  if (favourites.includes(id)) { favourites = favourites.filter(f => f !== id); btn.classList.remove('active'); btn.textContent = '🤍'; }
  else { favourites.push(id); btn.classList.add('active'); btn.textContent = '❤️'; }
  localStorage.setItem('recipe_favs', JSON.stringify(favourites));
}

function toggleFavFromModal(id) {
  const btn = document.getElementById('modalFavBtn');
  if (favourites.includes(id)) { favourites = favourites.filter(f => f !== id); btn.textContent = '🤍 Save recipe'; }
  else { favourites.push(id); btn.textContent = '❤️ Saved'; }
  localStorage.setItem('recipe_favs', JSON.stringify(favourites));
}

document.addEventListener('DOMContentLoaded', () => { renderResults(applyFilters(RECIPES), 'All Recipes'); });
