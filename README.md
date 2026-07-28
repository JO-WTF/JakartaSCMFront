# Jakarta SCM Frontend

This project is a Vue 3 single-page application powered by Vite. It provides three main views:

- **Scanner** – barcode scanning and DN status update workflow (default route `/`).
- **Admin** – DLocal Transport Management System (Indonesia) with filtering, editing, and exporting (`/admin`).
- **Dashboard** – delivery statistics dashboard with sorting, CSV export, and responsive cards (`/dashboard`).

## Development

```bash
npm install
npm run dev
```

The dev server is available at http://localhost:5173 by default.

## Build

```bash
npm run build
```

The production bundle is emitted to `dist/`.

## Configuration

Sensitive values such as API endpoints and third-party keys are loaded from environment variables.
Create a `.env` file (or copy `.env` to `.env.local`) and provide the values appropriate for your environment:

```
VITE_API_BASE=https://api.example.com
VITE_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token
VITE_DYNAMSOFT_LICENSE_KEY=your-dynamsoft-license
# Optional; defaults to `${VITE_API_BASE}/api/find-sg-lpn-infos`
VITE_FIND_SG_LPN_URL=
```

These variables are read at build time by Vite. Ensure any deployment platform exposes the `VITE_*` variables during the build step so the application can access them at runtime.

The Find SG LPN upstream request is proxied by the backend to avoid CORS and keep the Huawei app key out of the browser. Configure these backend environment variables on the server:

```
FIND_SG_LPN_URL=https://apigw-cn-south02.huawei.com/api/app_000000035599/findSgLpnInfos
FIND_SG_LPN_APPKEY=your-find-sg-lpn-app-key
# Optional; defaults to com.huawei.ipaas.roma.data.subject
FIND_SG_LPN_HW_ID=com.huawei.ipaas.roma.data.subject
```
