// Chargement commun aux widgets « Offre data » : besoins regroupés par méta-catégorie.
// Tables attendues : Besoin (Besoin, Categorie → Categories), Categories (Categorie, Meta_Categorie → Meta_categorie),
// Meta_categorie (Nom, Titre).

function tableToRows(table) {
  const cols = Object.keys(table);
  return (table.id || []).map((_, i) => {
    const row = {};
    cols.forEach(c => { row[c] = table[c][i]; });
    return row;
  });
}

// Ordre d'affichage de Grist (manualSort), à défaut l'ordre de création.
function bySortOrder(a, b) {
  const ka = a.manualSort ?? a.id;
  const kb = b.manualSort ?? b.id;
  return ka - kb;
}

function metaTitle(meta) {
  return (meta.Titre || meta.Nom || "").trim();
}

async function loadOffreData() {
  const [besoinT, catT, metaT] = await Promise.all(
    ["Besoin", "Categories", "Meta_categorie"].map(t => grist.docApi.fetchTable(t))
  );
  const besoins = tableToRows(besoinT).sort(bySortOrder);
  const cats = tableToRows(catT).sort(bySortOrder);
  const metas = tableToRows(metaT).sort(bySortOrder);

  const groups = metas.map(m => ({
    id: m.id,
    nom: (m.Nom || "").trim(),
    titre: metaTitle(m),
    titreCol: (m.Titre || "").trim() ? "Titre" : "Nom",
    categories: [],
  }));
  const groupsById = new Map(groups.map(g => [g.id, g]));
  const orphans = { id: 0, nom: "Autres", titre: "Autres besoins", categories: [] };
  const noCat = { id: 0, nom: "", besoins: [] };

  // Les catégories sont rangées dans leur méta-catégorie, dans l'ordre de la table Categories.
  const catsById = new Map();
  cats.forEach(c => {
    const cat = { id: c.id, nom: (c.Categorie || "").trim(), besoins: [] };
    catsById.set(c.id, cat);
    (groupsById.get(c.Meta_Categorie) || orphans).categories.push(cat);
  });

  besoins.forEach(b => {
    const text = (b.Besoin || "").trim();
    if (text) (catsById.get(b.Categorie) || noCat).besoins.push({ id: b.id, text });
  });
  if (noCat.besoins.length) orphans.categories.push(noCat);

  const all = [...groups, orphans];
  all.forEach(g => { g.categories = g.categories.filter(c => c.besoins.length); });
  return all.filter(g => g !== orphans || g.categories.length);
}

// getDocName() renvoie l'identifiant du document : on tente de lire son nom via l'API REST avec un jeton d'accès
// (peut être refusé selon le serveur Grist ; le titre reste alors modifiable dans le widget).
async function loadDocName(fallback) {
  try {
    const { token, baseUrl } = await grist.docApi.getAccessToken({ readOnly: true });
    const resp = await fetch(`${baseUrl}?auth=${encodeURIComponent(token)}`);
    if (resp.ok) {
      const doc = await resp.json();
      if (doc && doc.name) return doc.name;
    } else {
      console.warn("Nom du document indisponible : HTTP", resp.status);
    }
  } catch (e) {
    console.warn("Nom du document indisponible :", e);
  }
  return fallback;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Besoins d'une méta-catégorie, regroupés verticalement par catégorie.
function renderCategories(group, emptyText) {
  if (!group.categories.length) return `<p class="none">${escapeHtml(emptyText)}</p>`;
  return group.categories.map(c =>
    `<div class="cat">${c.nom ? `<h3${editAttrs("Categories", c.id, "Categorie")}>${escapeHtml(c.nom)}</h3>` : ""}` +
    `<ul>${c.besoins.map(b => `<li${editAttrs("Besoin", b.id, "Besoin")}>${escapeHtml(b.text)}</li>`).join("")}</ul></div>`
  ).join("");
}

// Édition en place : un double-clic sur un texte marqué data-table/data-row/data-col le rend modifiable ;
// Entrée (ou clic ailleurs) enregistre dans Grist, Échap annule.
function editAttrs(table, rowId, col) {
  return rowId ? ` data-table="${table}" data-row="${rowId}" data-col="${col}" title="Double-cliquer pour modifier"` : "";
}

function setEditable(el, table, rowId, col) {
  ["table", "row", "col"].forEach(k => delete el.dataset[k]);
  el.removeAttribute("title");
  if (!rowId) return;
  Object.assign(el.dataset, { table, row: rowId, col });
  el.title = "Double-cliquer pour modifier";
}

function enableInlineEditing(root, onSaved) {
  root.addEventListener("dblclick", e => {
    const el = e.target.closest("[data-col]");
    if (!el || el.isContentEditable) return;
    el.dataset.orig = el.textContent;
    el.contentEditable = "true";
    el.focus();
    document.getSelection().selectAllChildren(el);
  });
  root.addEventListener("keydown", e => {
    const el = e.target;
    if (!el.isContentEditable || !el.dataset.col) return;
    e.stopPropagation();
    if (e.key === "Enter") { e.preventDefault(); el.blur(); }
    if (e.key === "Escape") { el.textContent = el.dataset.orig; el.blur(); }
  });
  root.addEventListener("focusout", async e => {
    const el = e.target;
    if (!el.isContentEditable || !el.dataset.col) return;
    el.contentEditable = "false";
    const value = el.textContent.trim();
    const orig = el.dataset.orig;
    if (!value || value === orig) { el.textContent = orig; return; }
    try {
      await grist.docApi.applyUserActions([["UpdateRecord", el.dataset.table, Number(el.dataset.row), { [el.dataset.col]: value }]]);
      onSaved();
    } catch (err) {
      console.warn("Modification refusée :", err);
      el.textContent = orig;
      alert("Impossible d'enregistrer la modification (droits insuffisants ?).");
    }
  });
}
