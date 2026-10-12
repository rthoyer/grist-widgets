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

  const groups = metas.map(m => ({ id: m.id, nom: (m.Nom || "").trim(), titre: metaTitle(m), categories: [] }));
  const groupsById = new Map(groups.map(g => [g.id, g]));
  const orphans = { id: 0, nom: "Autres", titre: "Autres besoins", categories: [] };
  const noCat = { nom: "", besoins: [] };

  // Les catégories sont rangées dans leur méta-catégorie, dans l'ordre de la table Categories.
  const catsById = new Map();
  cats.forEach(c => {
    const cat = { nom: (c.Categorie || "").trim(), besoins: [] };
    catsById.set(c.id, cat);
    (groupsById.get(c.Meta_Categorie) || orphans).categories.push(cat);
  });

  besoins.forEach(b => {
    const text = (b.Besoin || "").trim();
    if (text) (catsById.get(b.Categorie) || noCat).besoins.push(text);
  });
  if (noCat.besoins.length) orphans.categories.push(noCat);

  const all = [...groups, orphans];
  all.forEach(g => { g.categories = g.categories.filter(c => c.besoins.length); });
  return all.filter(g => g !== orphans || g.categories.length);
}

// getDocName() renvoie l'identifiant du document : on lit son nom via l'API REST avec un jeton d'accès.
async function loadDocName(fallback) {
  try {
    const { token, baseUrl } = await grist.docApi.getAccessToken({ readOnly: true });
    const resp = await fetch(`${baseUrl}?auth=${encodeURIComponent(token)}`);
    if (resp.ok) {
      const doc = await resp.json();
      if (doc && doc.name) return doc.name;
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
    `<div class="cat">${c.nom ? `<h3>${escapeHtml(c.nom)}</h3>` : ""}` +
    `<ul>${c.besoins.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul></div>`
  ).join("");
}
