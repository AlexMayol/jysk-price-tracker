## Adding a new tracked item

Fill in the details below and make sure you have updated `data/items.json`.

### Item details

| Field  | Value |
|--------|-------|
| **id** (unique slug, e.g. `sofa-ektorp`) | |
| **name** (display name, e.g. `Sofá EKTORP`) | |
| **url** (full product page URL) | |
| **shop** (`jysk` or `ikea`) | |

### Checklist

- [ ] I have added the item to `data/items.json` with all four required fields (`id`, `name`, `url`, `shop`)
- [ ] The `id` is unique and not already present in `data/items.json`
- [ ] The `shop` value matches one of the supported adapters (`jysk`, `ikea`)
- [ ] The `url` is a valid, publicly accessible product page URL
