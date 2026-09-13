const SPREADSHEET_ID = '1oaS7qbqgMPpL4uOmZZ1WveTAVsgTJln09lsTw111YeY';
const COMMANDES_SHEET = 'COMMANDES';
const DOCUMENTS_SHEET = 'DOCUMENTS';
const DRIVE_ROOT_FOLDER = 'AB COMMANDES';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/*
 * V43 : upload document idempotent + journal d'erreur exploitable.
 * Le schéma reste non destructif : les colonnes existantes sont conservées.
 */
const COMMAND_FIELDS = [
  'id','chantier','produit','qte','fournisseur','responsable','date','start','status',
  'qte_commandee','qte_recue','date_commande','date_livraison','notes','created_at','updated_at',
  'chantierId','prix'
];

const DOCUMENT_FIELDS = [
  'id','commande_id','chantier','type','nom_fichier','url_pdf','source','date_document','auteur','created_at','drive_file_id'
];

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ctx = ensureSheets_(ss);
    const action = String((e && e.parameter && e.parameter.action) || 'list');
    const id = String((e && e.parameter && e.parameter.id) || '').trim();
    let data;

    if (action === 'list') {
      data = { ok: true, commandes: readObjects_(ctx.commandes) };
    } else if (action === 'documents') {
      data = { ok: true, documents: readObjects_(ctx.documents) };
    } else if (action === 'commande') {
      data = { ok: true, commande: findObjectById_(ctx.commandes, id) };
    } else if (action === 'document') {
      data = { ok: true, document: findObjectById_(ctx.documents, id) };
    } else if (action === 'health') {
      data = {
        ok: true,
        service: 'AB COMMANDES',
        version: '43.0',
        time: new Date().toISOString(),
        capabilities: ['upsert','delete','document_upsert','document_delete','document_upload','targeted_read','idempotent_upload','error_log']
      };
    } else {
      data = { ok: false, error: 'Action inconnue' };
    }
    return output_(data, e);
  } catch (err) {
    logError_('doGet', e && e.parameter ? e.parameter : {}, err);
    return output_({ ok: false, error: errorMessage_(err) }, e);
  }
}

function doPost(e) {
  let data = {};
  let action = 'inconnue';
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ctx = ensureSheets_(ss);
    data = parseRequest_(e);
    action = String(data.action || 'upsert');

    if (action === 'upsert') {
      const obj = normalizeCommande_(data);
      upsertObject_(ctx.commandes, obj);
      return json_({ ok: true, commande: obj });
    }

    if (action === 'delete') {
      deleteById_(ctx.commandes, String(data.id || ''));
      return json_({ ok: true });
    }

    if (action === 'document_upsert') {
      const doc = normalizeDocument_(data);
      upsertObject_(ctx.documents, doc);
      return json_({ ok: true, document: doc });
    }

    if (action === 'document_upload') {
      const requestedId = String(data.id || '').trim();
      if (!requestedId) throw new Error('ID document manquant');

      const existing = findObjectById_(ctx.documents, requestedId);
      if (existing) {
        return json_({ ok: true, document: existing, duplicate_avoided: true });
      }

      const doc = uploadDocument_(data);
      try {
        upsertObject_(ctx.documents, doc);
      } catch (writeErr) {
        if (doc && doc.drive_file_id) {
          try { DriveApp.getFileById(String(doc.drive_file_id)).setTrashed(true); } catch (_) {}
        }
        throw writeErr;
      }
      return json_({ ok: true, document: doc });
    }

    if (action === 'document_delete') {
      const id = String(data.id || '').trim();
      const doc = findObjectById_(ctx.documents, id);
      if (doc && doc.drive_file_id) {
        try { DriveApp.getFileById(String(doc.drive_file_id)).setTrashed(true); } catch (_) {}
      }
      deleteById_(ctx.documents, id);
      return json_({ ok: true });
    }

    return json_({ ok: false, error: 'Action inconnue' });
  } catch (err) {
    logError_('doPost:' + action, data, err);
    return json_({ ok: false, error: errorMessage_(err) });
  }
}

function parseRequest_(e) {
  const params = Object.assign({}, (e && e.parameter) || {});
  let body = {};
  if (e && e.postData && e.postData.contents) {
    const raw = String(e.postData.contents || '').trim();
    if (raw) {
      try { body = JSON.parse(raw); } catch (_) { body = {}; }
    }
  }
  return Object.assign({}, params, body);
}

function ensureSheets_(ss) {
  let commandes = ss.getSheetByName(COMMANDES_SHEET);
  if (!commandes) commandes = ss.insertSheet(COMMANDES_SHEET);
  ensureColumns_(commandes, COMMAND_FIELDS);

  let documents = ss.getSheetByName(DOCUMENTS_SHEET);
  if (!documents) documents = ss.insertSheet(DOCUMENTS_SHEET);
  ensureColumns_(documents, DOCUMENT_FIELDS);

  commandes.setFrozenRows(1);
  documents.setFrozenRows(1);
  return { commandes: commandes, documents: documents };
}

function ensureColumns_(sheet, requiredHeaders) {
  const width = Math.max(sheet.getLastColumn(), 1);
  const current = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const hasAnyHeader = current.some(v => String(v || '').trim() !== '');

  if (!hasAnyHeader) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return;
  }

  const existing = new Set(current.map(v => String(v || '').trim()).filter(Boolean));
  const missing = requiredHeaders.filter(h => !existing.has(h));
  if (!missing.length) return;

  let lastNamedCol = 0;
  current.forEach((v, i) => { if (String(v || '').trim()) lastNamedCol = i + 1; });
  const startCol = lastNamedCol + 1;
  sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
}

function headerState_(sheet) {
  const width = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0].map(v => String(v || '').trim());
  const map = {};
  headers.forEach((h, i) => { if (h && map[h] == null) map[h] = i + 1; });
  return { width: width, headers: headers, map: map };
}

function readObjects_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const state = headerState_(sheet);
  const rows = sheet.getRange(2, 1, lastRow - 1, state.width).getDisplayValues();
  return rows
    .filter(r => r.some(v => String(v || '') !== ''))
    .map(r => rowToObject_(r, state.headers));
}

function rowToObject_(row, headers) {
  const obj = {};
  headers.forEach((h, i) => { if (h) obj[h] = row[i] == null ? '' : row[i]; });
  return obj;
}

function findObjectById_(sheet, id) {
  id = String(id || '').trim();
  if (!id) return null;

  const state = headerState_(sheet);
  const idCol = state.map.id;
  if (!idCol) throw new Error('Colonne id absente');

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getDisplayValues().flat();
  const idx = ids.findIndex(v => String(v || '') === id);
  if (idx < 0) return null;

  const row = sheet.getRange(idx + 2, 1, 1, state.width).getDisplayValues()[0];
  return rowToObject_(row, state.headers);
}

function upsertObject_(sheet, obj) {
  if (!obj || !obj.id) throw new Error('ID manquant');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const state = headerState_(sheet);
    const idCol = state.map.id;
    if (!idCol) throw new Error('Colonne id absente');

    const lastRow = sheet.getLastRow();
    let row = 0;
    if (lastRow >= 2) {
      const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getDisplayValues().flat();
      const idx = ids.findIndex(v => String(v || '') === String(obj.id));
      if (idx >= 0) row = idx + 2;
    }

    if (!row) {
      row = Math.max(sheet.getLastRow() + 1, 2);
      const values = Array(state.width).fill('');
      Object.keys(obj).forEach(key => {
        const col = state.map[key];
        if (col) values[col - 1] = obj[key] == null ? '' : obj[key];
      });
      sheet.getRange(row, 1, 1, state.width).setValues([values]);
      return;
    }

    writeObjectFields_(sheet, row, state.map, obj);
  } finally {
    lock.releaseLock();
  }
}

function writeObjectFields_(sheet, row, headerMap, obj) {
  const updates = Object.keys(obj)
    .map(key => ({ key: key, col: headerMap[key], value: obj[key] == null ? '' : obj[key] }))
    .filter(x => x.col)
    .sort((a, b) => a.col - b.col);

  if (!updates.length) return;

  let group = [updates[0]];
  const groups = [];
  for (let i = 1; i < updates.length; i++) {
    const prev = group[group.length - 1];
    const next = updates[i];
    if (next.col === prev.col + 1) group.push(next);
    else { groups.push(group); group = [next]; }
  }
  groups.push(group);

  groups.forEach(items => {
    const startCol = items[0].col;
    const values = [items.map(x => x.value)];
    sheet.getRange(row, startCol, 1, items.length).setValues(values);
  });
}

function deleteById_(sheet, id) {
  id = String(id || '').trim();
  if (!id) throw new Error('ID manquant');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const state = headerState_(sheet);
    const idCol = state.map.id;
    if (!idCol) throw new Error('Colonne id absente');

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getDisplayValues().flat();
    const idx = ids.findIndex(v => String(v || '') === id);
    if (idx >= 0) sheet.deleteRow(idx + 2);
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
    chantierId: String(d.chantierId || d.chantier_id || ''),
    prix: String(d.prix || '').trim()
  };
}

function normalizeDocument_(d) {
  const now = new Date().toISOString();
  return {
    id: String(d.id || Utilities.getUuid()),
    commande_id: String(d.commande_id || ''),
    chantier: String(d.chantier || '').trim().toUpperCase(),
    type: String(d.type || 'PDF'),
    nom_fichier: String(d.nom_fichier || '').trim(),
    url_pdf: String(d.url_pdf || '').trim(),
    source: String(d.source || 'Yaya'),
    date_document: String(d.date_document || ''),
    auteur: String(d.auteur || ''),
    created_at: String(d.created_at || now),
    drive_file_id: String(d.drive_file_id || '')
  };
}

function uploadDocument_(d) {
  const commandeId = String(d.commande_id || '').trim();
  if (!commandeId) throw new Error('Commande manquante');

  const documentId = String(d.id || '').trim();
  if (!documentId) throw new Error('ID document manquant');

  const rawBase64 = String(d.file_base64 || '').replace(/^data:[^;]+;base64,/, '').trim();
  if (!rawBase64) throw new Error('Fichier manquant');

  let bytes;
  try { bytes = Utilities.base64Decode(rawBase64); }
  catch (_) { throw new Error('Fichier illisible'); }

  if (!bytes || !bytes.length) throw new Error('Fichier vide');
  if (bytes.length > MAX_UPLOAD_BYTES) throw new Error('Fichier trop volumineux (8 Mo maximum)');

  const chantier = String(d.chantier || 'CHANTIER').trim().toUpperCase();
  const fileName = safeFileName_(d.file_name || d.nom_fichier || 'document.pdf');
  const mimeType = String(d.mime_type || 'application/pdf').trim() || 'application/pdf';
  const folder = getDriveFolderForChantier_(chantier);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = folder.createFile(blob);

  try { file.setDescription('AB COMMANDES · doc ' + documentId + ' · ' + chantier + ' · commande ' + commandeId); } catch (_) {}

  return normalizeDocument_({
    id: documentId,
    commande_id: commandeId,
    chantier: chantier,
    type: String(d.type || 'PDF'),
    nom_fichier: fileName,
    url_pdf: file.getUrl(),
    source: 'Google Drive',
    date_document: String(d.date_document || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')),
    auteur: String(d.auteur || ''),
    created_at: String(d.created_at || new Date().toISOString()),
    drive_file_id: file.getId()
  });
}

function getDriveFolderForChantier_(chantier) {
  const root = DriveApp.getRootFolder();
  const roots = root.getFoldersByName(DRIVE_ROOT_FOLDER);
  const base = roots.hasNext() ? roots.next() : root.createFolder(DRIVE_ROOT_FOLDER);
  const chantierName = safeFolderName_(chantier || 'CHANTIER');
  const children = base.getFoldersByName(chantierName);
  return children.hasNext() ? children.next() : base.createFolder(chantierName);
}

function safeFolderName_(name) {
  const s = String(name || 'CHANTIER').trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ');
  return s.slice(0, 100) || 'CHANTIER';
}

function safeFileName_(name) {
  const s = String(name || 'document.pdf').trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ');
  return s.slice(0, 180) || 'document.pdf';
}

function output_(obj, e) {
  const cb = String((e && e.parameter && e.parameter.callback) || '').trim();
  if (cb) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*(?:\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(cb)) {
      return json_({ ok: false, error: 'Callback invalide' });
    }
    return ContentService
      .createTextOutput(cb + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function logError_(scope, data, err) {
  try {
    const safe = {
      scope: String(scope || ''),
      action: String(data && data.action || ''),
      id: String(data && data.id || ''),
      commande_id: String(data && data.commande_id || ''),
      chantier: String(data && data.chantier || ''),
      error: errorMessage_(err),
      stack: String(err && err.stack || '')
    };
    console.error('AB COMMANDES ERROR ' + JSON.stringify(safe));
  } catch (_) {
    console.error('AB COMMANDES ERROR ' + errorMessage_(err));
  }
}

function errorMessage_(err) {
  return String(err && err.message ? err.message : err || 'Erreur inconnue');
}
