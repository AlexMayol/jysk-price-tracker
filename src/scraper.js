const { chromium } = require("playwright");

function parsePrice(text) {
  const match = text.match(/([\d.,]+)\s*€/);
  if (!match) return null;
  return parseFloat(match[1].replace(".", "").replace(",", "."));
}

function parseDiscount(text) {
  const match = text.match(/-(\d+)%/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

async function scrapeProduct(page, item) {
  console.log(`Scraping: ${item.name} (${item.url})`);

  try {
    await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector('[data-testid="product-price"]', { timeout: 10000 });

    const ariaLabel = await page.$eval(
      '[data-testid="product-price"]',
      (el) => el.getAttribute("aria-label")
    );
    const currentPrice = parsePrice(ariaLabel || "");

    if (currentPrice === null) {
      console.error(`  Could not parse current price for ${item.id}`);
      return null;
    }

    const purchaseInfo = await page.$('[data-testid="product-purchase-info"]');

    // "Precio normal: X,XX € /u (-XX%)" or "Precio inicial X,XX € /u"
    let originalPrice = null;
    let discount = null;

    if (purchaseInfo) {
      const infoText = await purchaseInfo.textContent();

      const normalMatch = infoText.match(/Precio normal:\s*([\d.,]+)\s*€/);
      const inicialMatch = infoText.match(/Precio inicial\s*([\d.,]+)\s*€/);

      if (normalMatch) {
        originalPrice = parseFloat(normalMatch[1].replace(".", "").replace(",", "."));
      } else if (inicialMatch) {
        originalPrice = parseFloat(inicialMatch[1].replace(".", "").replace(",", "."));
      }

      const discountBadge = await purchaseInfo.$(".bg-discount");
      if (discountBadge) {
        const badgeText = await discountBadge.textContent();
        discount = parseDiscount(badgeText);
      }
    }

    if (!discount && originalPrice && originalPrice > currentPrice) {
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    const onSale = originalPrice !== null && currentPrice < originalPrice;

    const result = {
      date: new Date().toISOString().split("T")[0],
      current_price: currentPrice,
      original_price: originalPrice,
      on_sale: onSale,
      discount_pct: discount || 0,
    };

    console.log(`  Price: ${currentPrice}€${onSale ? ` (was ${originalPrice}€, -${result.discount_pct}%)` : ""}`);
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
