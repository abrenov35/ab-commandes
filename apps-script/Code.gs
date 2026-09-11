const SPREADSHEET_ID = '1oaS7qbqgMPpL4uOmZZ1WveTAVsgTJln09lsTw111YeY';
const COMMANDES_SHEET = 'COMMANDES';
const DOCUMENTS_SHEET = 'DOCUMENTS';

/* prix est ajouté EN FIN de structure pour ne pas décaler les colonnes existantes du Sheet. */
const COMMAND_HEADERS = [
  'id','chantier','produit','qte','fournisseur','responsable','date','start','status',
  'qte_commandee','qte_recue','date_commande','date_livraison','notes','created_at','updated_at','prix'
];

const DOCUMENT_HEADERS = [
  'id','commande_id','chantier','type','nom_fichier','url_pdf','source','date_document','auteur','created_at'
];

function doGet(e) {
  try {
    ensureSheets_();
    const action = String((e && e.parameter && e.parameter.action) || 'list');
    let data;
    if (action === 'list') data = { ok: true, commandes: readObjects_(COMMANDES_SHEET, COMMAND_HEADERS) };
    else if (action === 'documents') data = { ok: true, documents: readObjects_(DOCUMENTS_SHEET, DOCUMENT_HEADERS) };
    else if (action === 'health') data = { ok: true, service: 'AB COMMANDES', time: new Date().toISOString() };
    else data = { ok: false, error: 'Action inconnue' };
    return output_(data, e);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err) }, e);
  }
}

function doPost(e) {
  try {
    ensureSheets_();
    const p = Object.assign({}, (e && e.parameter) || {});
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (_) { body = {}; }
    }
    const data = Object.assign({}, p, body);
    const action = String(data.action || 'upsert');

    if (action === 'upsert') {
      const obj = normalizeCommande_(data);
      upsertObject_(COMMANDES_SHEET, COMMAND_HEADERS, obj);
      return json_({ ok: true, commande: obj });
    }
    if (action === 'delete') {
      deleteById_(COMMANDES_SHEET, String(data.id || ''));
      return json_({ ok: true });
    }
    if (action === 'document_upsert') {
      const doc = normalizeDocument_(data);
      upsertObject_(DOCUMENTS_SHEET, DOCUMENT_HEADERS, doc);
      return json_({ ok: true, document: doc });
    }
    if (action === 'document_delete') {
      deleteById_(DOCUMENTS_SHEET, String(data.id || ''));
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Action inconnue' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function ensureSheets_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(COMMANDES_SHEET);
  if (!sh) sh = ss.insertSheet(COMMANDES_SHEET);
  ensureHeader_(sh, COMMAND_HEADERS);

  let docs = ss.getSheetByName(DOCUMENTS_SHEET);
  if (!docs) docs = ss.insertSheet(DOCUMENTS_SHEET);
  ensureHeader_(docs, DOCUMENT_HEADERS);
}

function ensureHeader_(sheet, headers) {
  const values = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const different = headers.some((h, i) => values[i] !== h);
  if (different) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function readObjects_(sheetName, headers) {
  const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const rows = sh.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
  return rows.filter(r => r.some(v => v !== '')).map(r => {
    const o = {};
    headers.forEach((h, i) => o[h] = r[i]);
    return o;
  });
}

function upsertObject_(sheetName, headers, obj) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
    const idCol = 1;
    const lastRow = sh.getLastRow();
    let row = 0;
    if (lastRow >= 2) {
      const ids = sh.getRange(2, idCol, lastRow - 1, 1).getDisplayValues().flat();
      const idx = ids.indexOf(String(obj.id));
      if (idx >= 0) row = idx + 2;
    }
    const vals = headers.map(h => obj[h] == null ? '' : obj[h]);
    if (row) sh.getRange(row, 1, 1, headers.length).setValues([vals]);
    else sh.appendRow(vals);
  } finally {
    lock.releaseLock();
  }
}

function deleteById_(sheetName, id) {
  if (!id) throw new Error('ID manquant');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return;
    const ids = sh.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
    const idx = ids.indexOf(id);
    if (idx >= 0) sh.deleteRow(idx + 2);
  } finally {
    lock.releaseLock();
  }
}

function normalizeCommande_(d) {
  const now = new Date().toISOString();
  return {
    id: String(d.id || Utilities.getUuid()),
    chantier: String(d.chantier || '').trim().toUpperCase(),
    produit: String(d.produit || '').trim(),
    qte: String(d.qte || '').trim(),
    fournisseur: String(d.fournisseur || '').trim(),
    responsable: String(d.responsable || '').trim(),
    date: String(d.date || ''),
    start: String(d.start || ''),
    status: String(d.status || 'choice'),
    qte_commandee: String(d.qte_commandee || ''),
    qte_recue: String(d.qte_recue || ''),
    date_commande: String(d.date_commande || ''),
    date_livraison: String(d.date_livraison || ''),
    notes: String(d.notes || ''),
    created_at: String(d.created_at || now),
    updated_at: now,
    prix: String(d.prix || '').trim()
  };
}

function normalizeDocument_(d) {
  const now = new Date().toISOString();
  return {
    id: String(d.id || Utilities.getUuid()),
    commande_id: String(d.commande_id || ''),
    chantier: String(d.chantier || '').trim().toUpperCase(),
    type: String(d.type || 'Bon de commande'),
    nom_fichier: String(d.nom_fichier || '').trim(),
    url_pdf: String(d.url_pdf || '').trim(),
    source: String(d.source || 'Yaya'),
    date_document: String(d.date_document || ''),
    auteur: String(d.auteur || ''),
    created_at: String(d.created_at || now)
  };
}

function output_(obj, e) {
  const cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService
      .createTextOutput(String(cb) + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
