// Google Apps Script for the RALA membership + events sheet.
// Paste this ENTIRE file into Extensions -> Apps Script (replacing everything),
// then Deploy -> Manage deployments -> pencil -> New version -> Deploy.
// After first install of the events-from-sheet version: run setupEventSheet once
// (function dropdown -> setupEventSheet -> Run).
// Full setup docs: docs/MEMBERSHIP-FORM.txt

// Dev/preview submissions go only to the webmaster; real ones go to the
// coordinators with the webmaster CC'd on everything.
const WEBMASTER = 'andrewjohnmcgrath@gmail.com'

function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  if (data.kind === 'site-alert') return handleSiteAlert(data)
  return data.kind === 'event' ? handleEvent(data) : handleMembership(data)
}

// ---- Website health alerts -------------------------------------------------
// The website posts { kind:'site-alert', check, reason, transient } when an
// automatic check breaks (for now: reading fire-ban alerts from Dysart's
// site). This script emails president@ at most once every 7 days per check,
// and waits for a "transient" problem (timeouts, server errors) to persist
// for 3 hours before treating it as broken. State lives in Script Properties.
const ALERT_EMAIL_EVERY_MS = 7 * 24 * 60 * 60 * 1000
const TRANSIENT_PERSIST_MS = 3 * 60 * 60 * 1000
const TRANSIENT_GAP_RESET_MS = 2 * 60 * 60 * 1000 // no report for 2 h = it recovered

const ALERT_TEXT = {
  'fire-ban': {
    subject: 'Action needed: the website’s fire-ban check has stopped working',
    what: 'The RALA website (redstonelakes.ca) could not read the fire-ban information on the\n' +
      'Municipality of Dysart et al’s website (dysartetal.ca). This usually means Dysart has\n' +
      'changed their website.\n\n' +
      'Until this is fixed, the fire-ban banner on our home page shows “Status unavailable”\n' +
      'instead of whether a fire ban is in effect.',
  },
}

function handleSiteAlert(data) {
  const props = PropertiesService.getScriptProperties()
  const isTest = data.test === true
  const check = String(data.check || 'site').replace(/[^a-z0-9-]/gi, '')
  const key = (isTest ? 'test:' : '') + 'alert:' + check + ':'
  const now = Date.now()

  if (data.transient === true) {
    let since = Number(props.getProperty(key + 'transientSince') || 0)
    const last = Number(props.getProperty(key + 'transientLast') || 0)
    if (!since || now - last > TRANSIENT_GAP_RESET_MS) since = now
    props.setProperty(key + 'transientSince', String(since))
    props.setProperty(key + 'transientLast', String(now))
    if (now - since < TRANSIENT_PERSIST_MS) return alertReply(false, 'waiting to see if it persists')
  }

  const lastEmailed = Number(props.getProperty(key + 'lastEmailed') || 0)
  if (now - lastEmailed < ALERT_EMAIL_EVERY_MS) return alertReply(false, 'already emailed in the last 7 days')

  const text = ALERT_TEXT[check] || {
    subject: 'Action needed: an automatic check on the website has stopped working',
    what: 'An automatic check on the RALA website (redstonelakes.ca) has stopped working.',
  }
  MailApp.sendEmail({
    to: isTest ? WEBMASTER : 'president@redstonelake.com',
    cc: isTest ? '' : WEBMASTER,
    subject: (isTest ? '[TEST] ' : '') + text.subject,
    body:
      'This is an automatic message from the RALA website.\n\n' +
      text.what + '\n\n' +
      'Please let our IT manager know (Andrew McGrath, website@redstonelake.com) that the\n' +
      'Dysart website has likely changed and this needs attention.\n\n' +
      'What the website saw: ' + (data.reason || 'no details') + '\n' +
      'Detected: ' + (data.detectedAt || new Date().toISOString()) + '\n\n' +
      'You will get this reminder at most once every 7 days while the problem continues.',
  })
  props.setProperty(key + 'lastEmailed', String(now))
  return alertReply(true, 'emailed')
}

function alertReply(emailed, note) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, emailed: emailed, note: note }))
    .setMimeType(ContentService.MimeType.JSON)
}

// Run once from the editor (function dropdown -> testSiteAlert -> Run) after
// deploying: it emails the webmaster a [TEST] copy of the alert.
function testSiteAlert() {
  PropertiesService.getScriptProperties().deleteProperty('test:alert:fire-ban:lastEmailed')
  handleSiteAlert({ kind: 'site-alert', check: 'fire-ban', transient: false, test: true,
    reason: 'Test message from the Apps Script editor.', detectedAt: new Date().toISOString() })
}

function handleMembership(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const isTest = data.test === true
  const sheetName = isTest ? 'Test registrations' : 'Registrations'
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Primary member', 'Primary email', 'Associate member',
      'Associate email', 'Lake address', 'Phone', 'Mailing address', 'Term', 'Newsletter'])
  }
  sheet.appendRow([
    new Date(), data.primaryName, data.primaryEmail, data.associateName || '',
    data.associateEmail || '', data.lakeAddress, data.phone || '',
    data.mailingAddress || '',
    data.term === '3yr' ? '3 years ($80)' : '1 year ($30)',
    data.newsletter ? 'Yes' : 'No',
  ])
  MailApp.sendEmail({
    to: isTest ? WEBMASTER : 'membership@redstonelake.com,president@redstonelake.com',
    cc: isTest ? '' : WEBMASTER,
    subject: (isTest ? '[TEST] ' : '') + 'New membership registration — ' + data.primaryName,
    body:
      'A new registration just arrived via the website:\n\n' +
      'Primary: ' + data.primaryName + ' <' + data.primaryEmail + '>\n' +
      'Associate: ' + (data.associateName || '—') + '\n' +
      'Lake address: ' + data.lakeAddress + '\n' +
      'Term: ' + (data.term === '3yr' ? '3 years ($80)' : '1 year ($30)') + '\n\n' +
      'Full details are in the ' + sheetName + ' sheet:\n' + ss.getUrl(),
  })
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}

const EVENT_HEADER = ['Timestamp', 'Status', 'Submitted by', 'Email', 'Phone', 'Event title',
  'Date', 'Time', 'Location', 'Type', 'Description', 'Details', 'Icon', 'Color']

function handleEvent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const isTest = data.test === true
  const sheetName = isTest ? 'Test event submissions' : 'Event submissions'
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName)
  if (sheet.getLastRow() === 0) sheet.appendRow(EVENT_HEADER)
  // seed: true = backfilling historical events — arrives pre-approved, no email
  const isSeed = data.seed === true
  sheet.appendRow([
    new Date(), isSeed ? 'Approved' : 'Pending', data.name, data.email, data.phone || '',
    data.title, data.date, data.time || '', data.location || '', data.type || '',
    data.description, data.details || '', data.icon || '', data.color || '',
  ])
  if (isSeed) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  MailApp.sendEmail({
    to: isTest ? WEBMASTER : 'communications@redstonelake.com,president@redstonelake.com',
    cc: isTest ? '' : WEBMASTER,
    subject: (isTest ? '[TEST] ' : '') + 'New event submission — ' + data.title,
    body:
      'A community event was just submitted via the website:\n\n' +
      'Event: ' + data.title + '\n' +
      'Date: ' + data.date + (data.time ? ' at ' + data.time : '') + '\n' +
      'Location: ' + (data.location || '(not provided)') + '\n' +
      'Submitted by: ' + data.name + ' <' + data.email + '>' + (data.phone ? ' · ' + data.phone : '') + '\n\n' +
      'Description: ' + data.description + '\n' +
      (data.details ? '\nDetails: ' + data.details + '\n' : '') +
      '\nTO PUBLISH: open the "' + sheetName + '" tab and set the row\'s Status to\n' +
      'Approved — it appears on the website within about 5 minutes. Set it to\n' +
      'Rejected to decline (the submitter is NOT notified automatically):\n' +
      ss.getUrl(),
  })
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}

// The website reads approved events from here: GET <webapp-url>       → live tab
//                                              GET <webapp-url>?test=1 → test tab
// Returns ONLY public fields — submitter contact details never leave the sheet.
function doGet(e) {
  const isTest = e && e.parameter && e.parameter.test === '1'
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(isTest ? 'Test event submissions' : 'Event submissions')
  const out = { events: [] }
  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getDataRange().getValues()
    const header = values[0].map(String)
    const col = function (name) { return header.indexOf(name) }
    const tz = Session.getScriptTimeZone()
    const text = function (row, name, dateFmt) {
      const i = col(name)
      if (i === -1) return ''
      const v = row[i]
      if (v instanceof Date) return Utilities.formatDate(v, tz, dateFmt || 'MMMM d, yyyy')
      return String(v == null ? '' : v).trim()
    }
    for (let r = 1; r < values.length; r++) {
      const row = values[r]
      if (text(row, 'Status').toLowerCase() !== 'approved') continue
      out.events.push({
        title: text(row, 'Event title'),
        date: text(row, 'Date'),
        time: text(row, 'Time', 'h:mm a').toLowerCase(),
        location: text(row, 'Location'),
        type: text(row, 'Type'),
        description: text(row, 'Description'),
        details: text(row, 'Details'),
        icon: text(row, 'Icon'),
        color: text(row, 'Color'),
      })
    }
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON)
}

// One-time migration: run from the editor (function dropdown → setupEventSheet →
// Run) after installing this version. Adds Status/Icon/Color columns + dropdown
// to both event tabs; existing rows without a Status become Pending.
function setupEventSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  ;['Event submissions', 'Test event submissions'].forEach(function (name) {
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(EVENT_HEADER)
    } else {
      const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
      if (header.indexOf('Status') === -1) {
        sheet.insertColumnAfter(1) // right after Timestamp
        sheet.getRange(1, 2).setValue('Status')
        if (sheet.getLastRow() > 1) {
          sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).setValue('Pending')
        }
      }
      ;['Icon', 'Color'].forEach(function (extra) {
        const h = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
        if (h.indexOf(extra) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(extra)
      })
    }
    // Status dropdown for the whole column
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pending', 'Approved', 'Rejected'], true)
      .setAllowInvalid(false)
      .build()
    sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).setDataValidation(rule)
  })
}
