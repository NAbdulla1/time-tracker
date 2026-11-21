# Time Tracker

## Quick Start (Single Command)

From the project root:

### First-Time Setup & Build
Installs all dependencies (frontend & backend), builds both projects, packages the executable, and initializes `.env`:
```bash
npm run setup
```

### Rebuilding
If dependencies are already installed:
```bash
npm run build
```

Once built, the Windows executable is created at `time-tracking-app/time-tracking-app.exe` along with `time-tracking-app/.env`. Double-click the `.exe` file to run the app.

---

## Development

To run the apps in development mode:

- **Frontend:** `npm run dev:frontend`
- **Backend:** `npm run dev:backend`

---

## Individual Build Steps

If you need to run each step manually:

1. Frontend build:
   ```bash
   cd time-tracking-frontend
   npm install
   npm run build
   ```
   *(Builds static assets into `time-tracking-app/build/frontend`)*

2. Backend build & executable:
   ```bash
   cd ../time-tracking-app
   npm install
   npm run build
   npm run make-exe
   ```

3. Environment config:
   ```bash
   cp -n .env-example .env
   ```

4. Run `time-tracking-app.exe`.
