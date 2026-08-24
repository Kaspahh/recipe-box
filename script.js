// ---------------------------------------------------------------------
// Each recipe lives in its own file under data/recipes/<id>.json.
// data/manifest.json is a plain list of ids that says which files to load.
// Adding a recipe means: add a new file, then add its id to manifest.json
// (see add-recipe.html for a form that generates both for you).
// ---------------------------------------------------------------------
async function loadRecipes() {
  try {
    const manifestRes = await fetch("data/manifest.json", { cache: "no-store" });
    if (!manifestRes.ok) throw new Error("Failed to load manifest.json");
    const ids = await manifestRes.json();

    const recipes = await Promise.all(
      ids.map(async id => {
        try {
          const res = await fetch(`data/recipes/${id}.json`, { cache: "no-store" });
          if (!res.ok) throw new Error(`Failed to load recipe: ${id}`);
          return await res.json();
        } catch (err) {
          console.error(err);
          return null;
        }
      })
    );

    return recipes.filter(Boolean);
  } catch (err) {
    console.error(err);
    return [];
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

const TAB_CLASSES = ["tab-rust", "tab-sage", "tab-gold"];
function tabClassFor(recipe, index) {
  if (recipe.tabColor === "sage") return "tab-sage";
  if (recipe.tabColor === "gold") return "tab-gold";
  if (recipe.tabColor === "rust") return "tab-rust";
  return TAB_CLASSES[index % TAB_CLASSES.length];
}

function renderCardGrid(recipes) {
  const grid = document.getElementById("card-grid");
  if (!recipes.length) {
    grid.innerHTML = `
      <div class="empty-state">
        No recipes here yet.
      </div>`;
    return;
  }

  grid.innerHTML = recipes.map((r, i) => `
    <a class="recipe-card ${tabClassFor(r, i)}" href="recipe.html?id=${encodeURIComponent(r.id)}">
      <span class="tab">${escapeHtml(r.category || "Recipe")}</span>
      ${r.image ? `<img class="thumb" src="${escapeHtml(r.image)}" alt="${escapeHtml(r.title)}">` : ""}
      <h3>${escapeHtml(r.title)}</h3>
      ${r.subtitle ? `<p class="sub">${escapeHtml(r.subtitle)}</p>` : ""}
      <div class="meta">
        ${r.servings ? `<span>Serves ${escapeHtml(r.servings)}</span>` : ""}
        ${r.prepTime ? `<span>${escapeHtml(r.prepTime)} prep</span>` : ""}
      </div>
    </a>
  `).join("");
}

function renderCategoryFilter(allRecipes) {
  const bar = document.getElementById("filter-bar");
  const label = document.getElementById("box-label");
  if (!bar) return; // recipe.html and add-recipe.html don't have a filter bar

  if (!allRecipes.length) {
    bar.innerHTML = "";
    return;
  }

  // Unique categories, in first-seen order, each tagged with the same
  // tab color its cards use so the pill matches the card accent.
  const seen = new Map();
  allRecipes.forEach((r, i) => {
    const cat = r.category || "Recipe";
    if (!seen.has(cat)) seen.set(cat, tabClassFor(r, i));
  });
  const categories = Array.from(seen.entries());

  const pillHtml = (name, cssClass, active) => `
    <button type="button" class="filter-pill ${cssClass} ${active ? "active" : ""}" data-category="${escapeHtml(name)}">
      ${escapeHtml(name)}
    </button>`;

  bar.innerHTML =
    pillHtml("All", "", true) +
    categories.map(([name, cssClass]) => pillHtml(name, cssClass, false)).join("");

  bar.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      bar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const category = pill.dataset.category;
      if (category === "All") {
        renderCardGrid(allRecipes);
        label.textContent = "All recipes";
      } else {
        const filtered = allRecipes.filter(r => (r.category || "Recipe") === category);
        renderCardGrid(filtered);
        label.textContent = category;
      }
    });
  });
}

function renderDetail(recipe) {
  const root = document.getElementById("detail-root");
  if (!recipe) {
    root.innerHTML = `<div class="empty-state">Couldn't find that recipe. It may have been removed from the box.</div>`;
    return;
  }

  document.title = `${recipe.title} — The Recipe Box`;

  const sectionsHtml = (recipe.sections || []).map((sec, i) => `
    <div class="section-block">
      <p class="section-number">${String(i + 1).padStart(2, "0")}</p>
      <h3 class="section-title">${escapeHtml(sec.name)}</h3>
      <div class="section-columns">
        <ul class="ingredient-list">
          ${(sec.ingredients || []).map(ing => `<li>${escapeHtml(ing)}</li>`).join("")}
        </ul>
        <ol class="step-list">
          ${(sec.steps || []).map(step => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
      </div>
    </div>
  `).join("");

  root.innerHTML = `
    <article class="detail-card">
      ${recipe.image ? `
        <div class="detail-hero">
          <img src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.title)}">
        </div>` : ""}
      <div class="detail-body">
        <p class="detail-eyebrow">${escapeHtml(recipe.category || "Recipe")}</p>
        <h1 class="detail-title">${escapeHtml(recipe.title)}</h1>
        ${recipe.subtitle ? `<p class="detail-sub">${escapeHtml(recipe.subtitle)}</p>` : ""}
        <div class="detail-meta">
          ${recipe.servings ? `<span>Serves ${escapeHtml(recipe.servings)}</span>` : ""}
          ${recipe.prepTime ? `<span>Prep ${escapeHtml(recipe.prepTime)}</span>` : ""}
          ${recipe.restTime ? `<span>Rest ${escapeHtml(recipe.restTime)}</span>` : ""}
        </div>
        ${recipe.description ? `<p class="detail-desc">${escapeHtml(recipe.description)}</p>` : ""}

        <hr class="divider">
        ${sectionsHtml}

        ${recipe.tip ? `
          <div class="tip-block">
            <strong>Tip</strong>
            ${escapeHtml(recipe.tip)}
          </div>` : ""}

        ${recipe.source ? `<p class="source-note">${escapeHtml(recipe.source)}</p>` : ""}
      </div>
    </article>
  `;
}
