# Furniture Price Tracker

## Architecture

The scraper uses an **adapter pattern** to support multiple online shops. Each shop has its own adapter in `src/adapters/` that knows how to extract prices from that shop's product pages.

`src/scraper.js` dispatches to the correct adapter based on the `shop` field in each item from `data/items.json`.

## Adding a new shop adapter

1. Create `src/adapters/<shop>.js` exporting a single `scrape(page, item)` function.
2. Register it in the `adapters` map at the top of `src/scraper.js`.
3. Items in `data/items.json` can then use `"shop": "<shop>"`.

### Adapter contract

The `scrape(page, item)` function receives a Playwright `page` instance and the item object from `items.json`. It must:

- Navigate to `item.url` and extract pricing data.
- **Throw** on failure (the caller handles the error).
- Return an object with this shape:

```js
{
  current_price: Number,    // e.g. 24.99
  original_price: Number | null, // pre-sale price, null if not on sale
  on_sale: Boolean,
  discount_pct: Number,     // e.g. 17, or 0 if not on sale
}
```

The `date` field is added automatically by the scraper — adapters should **not** include it.

### Existing adapters

| Shop | File | Price selector strategy |
|------|------|------------------------|
| `jysk` | `src/adapters/jysk.js` | `[data-testid="product-price"]` aria-label for current price; `[data-testid="product-purchase-info"]` for original price and discount badge (`.bg-discount`) |
| `ikea` | `src/adapters/ikea.js` | `.pipcom-price-module__current-price .pipcom-price__sr-text` for current price; `.pipcom-price-module__addon` text matching `"Precio anterior:"` for original price |

## data/items.json format

Each item requires these fields:

```json
{
  "id": "unique-slug",
  "name": "Display Name",
  "url": "https://shop.example/product-page",
  "shop": "jysk"
}
```

`shop` must match a key in the `adapters` map in `src/scraper.js`.
