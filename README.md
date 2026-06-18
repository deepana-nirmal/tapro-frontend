# Tapro Frontend

React frontend for the Tapro QR ordering platform.

## Requirements

- Node.js 18+
- npm 9+

## Install

```bash
npm install
```

## Development

```bash
npm start
```

## Build

```bash
npm run build
```

## Environment Variables

Create `.env` locally if needed. Do not commit it.

Required:

- `REACT_APP_API_URL=http://localhost:8080/api`

Optional:

- `REACT_APP_ENV=development`
- `REACT_APP_APP_NAME=Tapro`
- `REACT_APP_VERSION=1.0.0`

## Deployment

Vercel notes:

- Set `REACT_APP_API_URL` in the Vercel project environment variables.
- Build command: `npm run build`
- Output directory: `build`
- `vercel.json` includes SPA rewrite support for React Router refreshes.
