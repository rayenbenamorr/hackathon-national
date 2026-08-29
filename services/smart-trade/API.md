# API — Smart Trade Network

Base path: `/api/smart-trade` · OpenAPI: `/api/smart-trade/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/smart-trade/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/smart-trade/signals` | What other ministries sent here | platform |
| `GET` | `/api/smart-trade/twins` | Digital twins maintained here | platform |
| `GET` | `/api/smart-trade/twins/:id` | One twin with history | platform |
| `GET` | `/api/smart-trade/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/smart-trade/products` | health | platform |
| `GET` | `/api/smart-trade/products` | list | smart-product-passport |
| `GET` | `/api/smart-trade/products/:id` | get | smart-product-passport |
| `POST` | `/api/smart-trade/products` | create | smart-product-passport |
| `POST` | `/api/smart-trade/export/advice` | What this product needs to enter a given market. | ai-export-copilot |
| `GET` | `/api/smart-trade/supply/graph` | Export concentration by governorate of origin. | national-supply-graph |
| `GET` | `/api/smart-trade/products` | signals | platform |
| `GET` | `/api/smart-trade/products` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/smart-trade/health
curl http://localhost:4000/api/smart-trade/signals
curl "http://localhost:4000/api/smart-trade/products?limit=3"
```
