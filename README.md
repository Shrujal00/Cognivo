# Cognivo-X

Cognivo-X is a full-stack proof-of-concept application combining an Express/TypeScript API with a Next.js TypeScript frontend. It provides AI-powered features (OCR, flashcards, notes, quizzes, translation and roadmap generation) and comes with example tests and Docker configuration for local development and deployment.

## Contents

- `api/` – TypeScript backend: Express server, AI services, storage, tests, Dockerfile and compose config.
- `frontend/` – Next.js TypeScript frontend: app routes, components, and API client.

## Quick start

Prerequisites:

- Node.js 18+ and npm or yarn
- Docker & Docker Compose (for containerized run)

1) Clone the repo and install dependencies for both API and frontend.

From the repository root:

```powershell
# Install API deps
cd api; npm install

# Install frontend deps (in a new terminal or after the previous finishes)
cd ..\frontend; npm install
```

2) Configure environment variables.

- Copy `api/env.example` to `api/.env` and fill required values (API keys, DB connection, etc.). The backend reads configuration from environment variables defined in `api/env.example`.

3) Start the app locally (development mode).

```powershell
# Run backend (from api/)
cd api; npm run dev

# Run frontend (from frontend/ in a separate terminal)
cd ../frontend; npm run dev
```

Visit `http://localhost:3000` for the frontend and the backend API at the port configured in `api/package.json` (commonly 3001 or configured port).

## Docker (recommended for parity)

To run both services with Docker Compose (recommended for local parity):

```powershell
cd api
docker-compose up --build
```

This will build and run containers for the API and any dependent services defined in `api/docker-compose.yml`.

## Project structure (high level)

api/
- `src/` – server entry (`index.ts`), services (`services/`), utils, and tests.
- `Dockerfile` & `docker-compose.yml` – container configuration.
- `tests/` – unit and integration tests using Jest (see `jest.config.js`).

frontend/
- `src/app/` – Next.js app routes and pages (chat, extract, flashcards, notes, quizzes, roadmap, translate).
- `src/components/` – shared UI components and layout.
- `src/lib/api.ts` – client-side API helpers.

## Environment variables (examples)

Put values in `api/.env` and `frontend/.env.local` as appropriate. Example entries (fill with real values):

- OPENAI_API_KEY=your_openai_key
- DATABASE_URL=postgres://user:pass@host:5432/dbname
- PORT=3001

Check `api/env.example` for the full list used by the backend.

## Tests

Run API tests with Jest from the `api/` folder:

```powershell
cd api
npm test
```

Frontend tests (if present) can be run from `frontend/` using the configured test runner.

## Development notes & implementation summary

- The backend (`api/src/services/ai.ts`) contains AI integration and feature implementations such as OCR and flashcard generation.
- The frontend uses Next.js app routes under `frontend/src/app/` to power the UI for extracting text, reviewing flashcards, creating notes and quizzes, and translating content.
- Example and helper scripts are provided in the `api/` folder (`setup.js`, `start-server.js`, `test-*.js`) to assist with local dev and verification.

## Deployment

- There are sample Dockerfiles for container builds. For production deployment, build the frontend (`next build`) and serve with a static host or behind the API as needed.
- The `api/PRODUCTION_SETUP.md` and `api/DEPLOYMENT_GUIDE.md` include deployment-specific guidance — read them before deploying.

## Contributing

1. Open an issue describing the bug or feature.
2. Create a branch: `git checkout -b feat/your-feature`.
3. Add tests and update docs as needed.
4. Open a PR against `main`.

## License

This repository does not include a license file in the workspace snapshot. Add a `LICENSE` file if you plan to open-source this project.

## Where to look next

- Backend entry: `api/src/index.ts`
- Frontend entry: `frontend/src/app/layout.tsx` and `frontend/src/app/page.tsx`
- Docker and deployment docs: `api/docker-compose.yml`, `api/Dockerfile`, `api/DEPLOYMENT_GUIDE.md`

If you'd like, I can also:

- Add a short CONTRIBUTING.md and CODE_OF_CONDUCT.md
- Add example `.env` files for the frontend and backend with placeholders
- Run the project's tests and fix any quick issues

---

Generated on 2025-09-26.