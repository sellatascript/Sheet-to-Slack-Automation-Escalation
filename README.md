# 🔔 Real-Time Automated Data Reporting System (Google Sheets → Slack Webhook)

Automated escalation alert pipeline that pushes case data from a master Google Sheet straight into Slack the moment it's updated — cutting notification delay from 2 hours to under 10 seconds.

## 📌 Overview

Built to solve a bottleneck in Escalation Management: the team was manually monitoring a shared Google Sheet and cross-posting updates to Slack by hand. This script automates that entire flow using Google Apps Script and Slack's Incoming Webhook API.

## ⚙️ Tools & Stack

- **Google Sheets** – source of truth for case data
- **Google Apps Script (JavaScript)** – trigger + logic layer
- **Slack API (Incoming Webhooks)** – delivery channel
- **JSON** – payload formatting

## 🚩 The Problem

- Manual checking of the master sheet for new/updated rows
- Manual copy-paste into Slack
- ~2 hour average delay between a case being logged and the right person being alerted
- Frequent missed updates due to human error

## 🛠️ How It Works

1. **Trigger** – An `onEdit` (or time-driven) trigger fires in Apps Script whenever the sheet is updated.
2. **Extract** – The script reads the edited row and pulls the relevant fields (Case Number, User ID, Name, Merchant, Nominal Transaksi, Type, Notes).
3. **Format & Tag** – Data is assembled into a Slack message, tagging the responsible team member via their Slack Member ID so the alert reaches the right person directly.
4. **Deliver** – The message is wrapped in a JSON payload and sent via a `POST` request to the Slack Incoming Webhook URL, posting instantly to the designated channel.

## 💻 Code Sample

```javascript
function onEditTrigger(e) {
  var source = e.source;
  var row = e.range.getRow();

  var casenumber       = source.getActiveSheet().getRange(row, 2, 1, 1).getValue();
  var userid           = source.getActiveSheet().getRange(row, 3, 1, 1).getValue();
  var name             = source.getActiveSheet().getRange(row, 4, 1, 1).getValue();
  var merchant         = source.getActiveSheet().getRange(row, 5, 1, 1).getValue();
  var nominaltransaksi = source.getActiveSheet().getRange(row, 6, 1, 1).getValue();
  var notes            = source.getActiveSheet().getRange(row, 22, 1, 1).getValue();
  var type             = source.getActiveSheet().getRange(row, 9, 1, 1).getValue();

  var url = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL";

  var payload = {
    text: "Hi <@SLACK_MEMBER_ID> Please check this alert;" +
          "\n\n- Case Number " + casenumber +
          "\n- User ID " + userid +
          "\n- Name " + name +
          "\n- Merchant " + merchant +
          "\n- Nominal Transaksi " + nominaltransaksi +
          "\n- Type " + type +
          "\n- Notes " + notes +
          "\n\nThanks!"
  };

  var headers = {
    "Content-type": "application/json"
  };

  var options = {
    headers: headers,
    method: "POST",
    payload: JSON.stringify(payload)
  };

  if (row > 1) {
    UrlFetchApp.fetch(url, options);
  } else {
    return;
  }
}
```

> **Note:** Webhook URL and Slack Member IDs above are placeholders. In production, store these as [Script Properties](https://developers.google.com/apps-script/guides/properties) rather than hardcoding them in the script.


## ⚙️ Output 
<img width="1802" height="523" alt="Sync" src="https://github.com/user-attachments/assets/1fd276b2-2ea2-4200-9fbf-f4462776821f" />


## 📈 Impact

| Metric | Before | After |
|---|---|---|
| Notification delay | ~2 hours | **< 10 seconds** |
| Data accuracy | Manual copy-paste errors | **100% data integrity** |
| Manual effort | Ongoing monitoring | **~5 hours/week saved** |

## 🔒 Security Note

Sensitive values (webhook URL, Slack member IDs, case data) are redacted/placeholder'd in this repo. In the live implementation these are pulled from Apps Script's built-in Properties Service, never hardcoded.

## 👤 Author

**Sella** – Customer Care & Fraud Operations Team Lead
Built to streamline escalation management and reduce response time for cross-functional alerting.
