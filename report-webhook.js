/**
 * ============================================================
 * Escalation Alert — Slack Notification via Google Apps Script
 * ============================================================
 * Monitors a Google Sheet for escalated cases and automatically
 * sends a formatted alert to a Slack channel via Incoming Webhook
 * when a row is marked as "ESCALATED TO TEAM".
 *
 * HOW TO USE:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Paste this script
 * 3. Replace the config values in the CONFIG section below
 * 4. Set up a trigger: onEdit → sendSlackMessage
 *
 * TRIGGER TYPE: On Edit (installable trigger)
 * ============================================================
 */


// ============================================================
// CONFIG — Replace these values before deploying
// ============================================================

var CONFIG = {
  // The status value that triggers the Slack alert
  TARGET_STATUS: "ESCALATED TO TEAM",

  // Slack Incoming Webhook URL
  // Get this from: Slack App settings → Incoming Webhooks
  WEBHOOK_URL: "YOUR_SLACK_WEBHOOK_URL_HERE",

  // Slack User ID to notify (e.g. "U012AB3CD")
  // Find it in Slack: click profile → More → Copy Member ID
  NOTIFY_USER_ID: "YOUR_SLACK_USER_ID_HERE",

  // Column number that contains the status value (Column R = 18)
  STATUS_COLUMN: 18,

  // Column mappings — adjust if your sheet structure is different
  COLUMNS: {
    CASE_NUMBER: 2,        // Column B
    USER_ID: 3,            // Column C
    NAME: 4,               // Column D
    MERCHANT: 5,           // Column E
    NOMINAL_TRANSAKSI: 6,  // Column F
    TYPE: 9,               // Column I
    NOTES: 22              // Column V
  }
};


// ============================================================
// MAIN FUNCTION
// Triggered on every edit — fires Slack alert when status
// in the target column is set to "ESCALATED TO TEAM"
// ============================================================

function sendSlackMessage(e) {

  // Only proceed if the edited column is the status column
  // and the new value matches the target escalation status
  if (e.range.getColumn() !== CONFIG.STATUS_COLUMN || e.value !== CONFIG.TARGET_STATUS) {
    return;
  }

  // Get the edited row and the active sheet
  var sheet = e.source.getActiveSheet();
  var row = e.range.getRow();

  // Extract case details from the same row
  var caseData = {
    caseNumber:        getCellValue(sheet, row, CONFIG.COLUMNS.CASE_NUMBER),
    userId:            getCellValue(sheet, row, CONFIG.COLUMNS.USER_ID),
    name:              getCellValue(sheet, row, CONFIG.COLUMNS.NAME),
    merchant:          getCellValue(sheet, row, CONFIG.COLUMNS.MERCHANT),
    nominalTransaksi:  getCellValue(sheet, row, CONFIG.COLUMNS.NOMINAL_TRANSAKSI),
    type:              getCellValue(sheet, row, CONFIG.COLUMNS.TYPE),
    notes:             getCellValue(sheet, row, CONFIG.COLUMNS.NOTES)
  };

  // Build and send the Slack message
  var message = buildSlackMessage(caseData);
  sendToSlack(message);
}


// ============================================================
// HELPER — Get a single cell value from a given row & column
// ============================================================

function getCellValue(sheet, row, column) {
  return sheet.getRange(row, column, 1, 1).getValue();
}


// ============================================================
// HELPER — Build the formatted Slack message text
// ============================================================

function buildSlackMessage(data) {
  return (
    "Hi <@" + CONFIG.NOTIFY_USER_ID + "> Please check this escalation alert:\n\n" +
    "- *Case Number:* "         + data.caseNumber       + "\n" +
    "- *User ID:* "             + data.userId           + "\n" +
    "- *Name:* "                + data.name             + "\n" +
    "- *Merchant:* "            + data.merchant         + "\n" +
    "- *Nominal Transaksi:* "   + data.nominalTransaksi + "\n" +
    "- *Type:* "                + data.type             + "\n" +
    "- *Notes:* "               + data.notes            + "\n\n" +
    "Thanks!"
  );
}


// ============================================================
// HELPER — Send the message to Slack via Incoming Webhook
// ============================================================

function sendToSlack(messageText) {
  var payload = {
    text: messageText
  };

  var options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
}
