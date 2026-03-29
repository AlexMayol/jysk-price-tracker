const { chromium } = require("playwright");

const adapters = {
  jysk: require("./adapters/jysk"),
  ikea: require("./adapters/ikea"),
};

async function scrapeProduct(page, item) {
  console.log(`Scraping: ${item.name} [${item.shop}] (${item.url})`);

  const adapter = adapters[item.shop];
  if (!adapter) {
    console.error(`  Unknown shop "${item.shop}" for ${item.id}`);
    return null;
  }

  try {
    const result = await adapter.scrape(page, item);
    result.date = new Date().toISOString().split("T")[0];
    result.shop = item.shop;

    const { current_price, original_price, on_sale, discount_pct } = result;
    console.log(`  Price: ${current_price}€${on_sale ? ` (was ${original_price}€, -${discount_pct}%)` : ""}`);

    return result;
  } catch (err) {
    console.error(`  Error scraping ${item.id}: ${err.message}`);
    return null;
  }
}

async function scrapeAll(items) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = {};

  for (const item of items) {
    const data = await scrapeProduct(page, item);
    if (data) {
      results[item.id] = data;
    }
  }

  await browser.close();
  return results;
}

module.exports = { scrapeAll };
