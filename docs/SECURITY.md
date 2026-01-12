# Security

## API Key authentication
All `/api/v1` endpoints require an API key except:
- `GET /api/v1/health/integrations`

Clients must send:
- Header: `X-API-Key: <your-key>`

## Generate an API key
Use the provided script to generate and write a key to `.env`:
```bash
npm run gen:api-key
```

The script uses Node.js crypto and updates the `API_KEY` line in `.env`. It does not touch `.env.example`.

## Where to store the key
Use environment-specific files:
- `.env.development`
- `.env.production`

Never commit real `.env` files.

## Postman
Add the header in requests:
- `X-API-Key: <your-key>`

## APEX
When creating the REST Data Source, add:
- Header name: `X-API-Key`
- Header value: your API key

## Rotation
Generate a new key and update clients:
```bash
npm run gen:api-key
```
