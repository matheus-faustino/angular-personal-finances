# Angular Personal Finances

A personal finance management SPA built with Angular 21. It lets users track transactions, organize them into categories, upload and parse financial documents, and manage their account — all with dark/light theme support and English/Portuguese (BR) interface.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (zoneless, standalone components) |
| Styling | Tailwind CSS 4 |
| i18n | Transloco (en / pt-BR) |
| State | Angular Signals |
| HTTP client | Generated from OpenAPI spec via `ng-openapi-gen` |
| Tests | Vitest |

## Features

- **Authentication** — login, register, email verification, forgot/reset password
- **Dashboard** — financial summary overview
- **Transactions** — list, create, edit, and delete financial transactions
- **Categories** — manage transaction categories
- **Documents** — upload financial documents and categorize their extracted transactions
- **Users** *(admin only)* — user management panel
- **Theme** — dark/light mode toggle, persisted in `localStorage`
- **Language** — switch between English and Portuguese (BR) at runtime

## Prerequisites

- Node.js ≥ 20
- npm ≥ 11
- A running backend that exposes the REST API described in [`openapi.json`](openapi.json) at `http://localhost/api`

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Point the app at a different API host
#    Edit src/api/api-configuration.ts and change rootUrl,
#    or override it in app.config.ts via provideApiConfiguration().

# 3. Start the dev server
npm start
```

Open `http://localhost:4200` in your browser. The app reloads automatically on file changes.

### Other commands

```bash
npm run build   # Production build → dist/
npm test        # Run unit tests with Vitest
```

## Example flow — uploading and categorizing a document

1. **Log in** at `/login` with your credentials.
2. Navigate to **Documents** in the sidebar.
3. Click **New document**, fill in the form, and upload a file.
4. Once the document is processed, click **Categorize transactions** next to it.
5. On the categorization screen, assign a category to each extracted transaction and save.
6. Head to **Transactions** to see the newly categorized entries alongside your existing ones.

## Project structure

```
src/
├── api/                  # Auto-generated HTTP client (ng-openapi-gen)
├── app/
│   ├── core/
│   │   ├── guards/       # Auth and role guards
│   │   ├── interceptors/ # Attaches Bearer token to requests
│   │   └── services/     # Auth, Theme, Language, and domain services
│   ├── features/         # Lazy-loaded page components
│   │   ├── categories/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── login/
│   │   ├── transactions/
│   │   └── users/
│   └── layout/           # Shell layout, header, and sidebar
└── styles.css            # Global Tailwind entry point
```

## Regenerating the API client

If the backend contract changes, update `openapi.json` and run:

```bash
npx ng-openapi-gen --input openapi.json --output src/api
```
