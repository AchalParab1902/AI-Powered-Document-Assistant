# DocuMind AI - Frontend Client

This is the frontend Single Page Application (SPA) for the **AI-Powered Document Assistant**.

## Tech Stack
- **Framework:** React 19 + Vite 8
- **Routing:** React Router DOM (v7)
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **HTTP Client:** Axios

## Available Scripts
- `npm run dev`: Starts the local development server at `http://localhost:5173`.
- `npm run build`: Compiles and bundles production-ready assets into `dist/`.
- `npm run preview`: Locally previews the production build.

## Page Routes
- `/` or `/dashboard`: Main Document Management Dashboard.
- `/login`: User Authentication Sign-In.
- `/register`: New Account Registration.
- `/chat/:documentId`: Interactive Document Q&A (RAG Chat with Citations).
- `*`: 404 Not Found Page.
