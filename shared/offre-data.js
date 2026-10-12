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

  const catsById = new Map(cats.map((c, i) => [c.id, { ...c, order: i }]));
  const groups = metas.map(m => ({ id: m.id, nom: (m.Nom || "").trim(), titre: metaTitle(m), items: [] }));
  const groupsById = new Map(groups.map(g => [g.id, g]));
  const orphans = { id: 0, nom: "Autres", titre: "Autres besoins", items: [] };

  besoins.forEach((b, i) => {
    const text = (b.Besoin || "").trim();
    if (!text) return;
    const cat = catsById.get(b.Categorie);
    const group = (cat && groupsById.get(cat.Meta_Categorie)) || orphans;
    group.items.push({ text, catOrder: cat ? cat.order : Infinity, order: i });
  });

  // Dans une méta-catégorie : ordre des catégories, puis ordre des besoins.
  const all = orphans.items.length ? [...groups, orphans] : groups;
  all.forEach(g => {
    g.items.sort((a, b) => (a.catOrder - b.catOrder) || (a.order - b.order));
    g.besoins = g.items.map(it => it.text);
    delete g.items;
  });
  return all;
}

async function loadDocName(fallback) {
  try {
    const name = await grist.docApi.getDocName();
    return name || fallback;
  } catch (e) {
    return fallback;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
