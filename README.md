# JYSK Price Tracker

Tracks product prices on [jysk.es](https://jysk.es) and sends an email alert when a price drops. Runs automatically twice a day via GitHub Actions.

## How it works

1. A GitHub Actions cron job runs at **8:00 AM and 8:00 PM UTC** every day
2. Playwright scrapes each product page in your watchlist
3. Prices are compared against the last recorded values in `data/price_history.json`
4. If any price dropped, an email is sent via SendGrid with the details
5. The updated price history is committed back to the repo

## Setup

### 1. Add your SendGrid API key

Go to **Settings > Secrets and variables > Actions** in your GitHub repo and add:

- `SENDGRID_API_KEY` - your [SendGrid](https://sendgrid.com) API key

### 2. Add items to track

Edit `data/items.json` to add or remove products:

```json
[
  {
    "id": "unique-slug",
    "name": "Product Name",
    "url": "https://jysk.es/path/to/product-page"
  }
]
```

- `id`: a unique identifier (used as key in the price history)
- `name`: display name (used in emails)
- `url`: the full URL to the product page on jysk.es

### 3. Run manually (optional)

You can trigger the workflow manually from the **Actions** tab, or run locally:

```bash
npm install
npx playwright install chromium
SENDGRID_API_KEY=your_key node src/main.js
```

## Project structure

```
data/
  items.json              Items to track (edit manually)
  price_history.json      Price history (auto-updated by CI)
src/
  main.js                 Orchestrator
  scraper.js              Playwright scraping logic
  notifier.js             SendGrid email notification
.github/workflows/
  check-prices.yml        GitHub Actions workflow
```
