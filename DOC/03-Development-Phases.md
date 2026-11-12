# 03 - Development Phases & Task Breakdown

This document breaks down the complete implementation of the **AI-Powered Document Assistant** into 16 sequential phases aligned with the Software Requirements Specification (SRS Section 11).

Every phase is broken down into small, digestible tasks with clear dependencies, expected outputs, testing requirements, and Git branch recommendations.

---

## Phase 1: Requirements Understanding & Project Planning *(Current Phase)*
- **Objective**: Establish complete functional, technical, and architectural clarity before writing application code.
- **Concepts to Learn**:
  - Full-stack architecture, RAG fundamentals, high-dimensional vector search concepts, token budgeting.
- **Tasks in Execution Order**:
  1. *Task 1.1*: Analyze the SRS (`README.md`) and extract core functional requirements. (Output: Requirements matrix; Dependencies: None).
  2. *Task 1.2*: Create organized architectural and development documentation in `/DOC`. (Output: 7 core documentation files; Dependencies: Task 1.1).
  3. *Task 1.3*: Review architecture, database design, and API endpoints with mentor. (Output: Approved project blueprint; Dependencies: Task 1.2).
- **Expected Outcome**: A fully planned, documented project with all architectural decisions finalized.
- **Testing Requirements**: Walk through workflows and verify all SRS requirements are accounted for.
- **Git Branch Suggestion**: None (Planning phase before Git repository setup).
- **Completion Criteria**: Complete documentation suite verified and approved.

---

## Phase 2: GitHub Repository & Project Setup
- **Objective**: Initialize version control, define project workspace structure, and set up `.gitignore` and security rules.
- **Concepts to Learn**:
  - Git initialization, `.gitignore` rules for secrets and binaries, monorepo/folder separation (`client/` and `server/`), branch policies.
- **Tasks in Execution Order**:
  1. *Task 2.1*: Initialize local Git repository on branch `main`. (Output: `.git` folder initialized; Dependencies: Phase 1 approval).
  2. *Task 2.2*: Create root-level `.gitignore` covering `node_modules`, `.env`, build artifacts, and uploaded files. (Output: Root `.gitignore`; Dependencies: Task 2.1).
  3. *Task 2.3*: Create clean directory scaffold: `client/`, `server/`, and initial `README.md`. (Output: Base directory layout; Dependencies: Task 2.2).
  4. *Task 2.4*: Create and switch to feature branch `feat/project-setup`. (Output: Active feature branch; Dependencies: Task 2.3).
- **Expected Outcome**: Clean, reproducible repository structure ready for development without secret leakage risk.
- **Testing Requirements**: Run `git status` and test that dummy `.env` or PDF files are ignored properly.
- **Git Branch Suggestion**: `feat/project-setup`
- **Completion Criteria**: Clean git tree committed and verified.

---

## Phase 3: React Frontend Foundation
- **Objective**: Set up the React application using modern tooling (Vite) and define basic layout, routing, and styling.
- **Concepts to Learn**:
  - Vite build tool, React Router DOM (v6), Component structure, CSS/Tailwind styling patterns.
- **Tasks in Execution Order**:
  1. *Task 3.1*: Initialize Vite + React project inside `client/`. (Output: Working React app; Dependencies: Phase 2).
  2. *Task 3.2*: Install routing dependencies (`react-router-dom`, `axios`, icons). (Output: `package.json` configured; Dependencies: Task 3.1).
  3. *Task 3.3*: Configure application routing with placeholders for Login, Register, Dashboard, and Chat. (Output: App router configuration; Dependencies: Task 3.2).
  4. *Task 3.4*: Build base layout components (Navbar, Page Container, Footer/Sidebar). (Output: Consistent visual layout; Dependencies: Task 3.3).
- **Expected Outcome**: React application runs locally with functional navigation across blank pages.
- **Testing Requirements**: Launch dev server, visit `/`, `/login`, `/register`, `/dashboard`, and confirm navigation works without console errors.
- **Git Branch Suggestion**: `feat/frontend-foundation`
- **Completion Criteria**: Clean dev server startup, routing operational, code reviewed and merged.

---

## Phase 4: Node.js & Express Backend Foundation
- **Objective**: Create the Express server skeleton with modular folder structure, environment variable handling, and error middleware.
- **Concepts to Learn**:
  - Express.js lifecycle, middleware chains, `dotenv` configuration, CORS, standardized API responses.
- **Tasks in Execution Order**:
  1. *Task 4.1*: Initialize Node.js project inside `server/` with `package.json`. (Output: `server/package.json`; Dependencies: Phase 2).
  2. *Task 4.2*: Install dependencies (`express`, `cors`, `dotenv`, `morgan`). (Output: Dependencies installed; Dependencies: Task 4.1).
  3. *Task 4.3*: Build modular backend folder structure (`controllers/`, `routes/`, `middlewares/`, `models/`, `services/`, `utils/`). (Output: Folder scaffold; Dependencies: Task 4.2).
  4. *Task 4.4*: Create `server.js` with health-check endpoint (`GET /api/health`), CORS setup, and centralized error handler. (Output: Running Express server; Dependencies: Task 4.3).
- **Expected Outcome**: Backend server starts up and responds with `{ status: "ok" }` on the health route.
- **Testing Requirements**: Send HTTP request to `http://localhost:5000/api/health` via Postman or browser.
- **Git Branch Suggestion**: `feat/backend-foundation`
- **Completion Criteria**: Server starts reliably, health check succeeds, error middleware formats responses properly.

---

## Phase 5: MongoDB Connection & Data Models
- **Objective**: Connect the Express backend to MongoDB and declare all required Mongoose schemas.
- **Concepts to Learn**:
  - Mongoose ORM, connection management, schema validation, schema relationships via `ObjectId` references, timestamps.
- **Tasks in Execution Order**:
  1. *Task 5.1*: Install `mongoose` and configure MongoDB connection utility with `.env` connection string. (Output: `config/db.js`; Dependencies: Phase 4).
  2. *Task 5.2*: Define `User` schema (`name`, `email`, `passwordHash`, timestamps). (Output: `models/User.js`; Dependencies: Task 5.1).
  3. *Task 5.3*: Define `Document` schema (`userId`, `originalName`, `storedFileReference`, `size`, `mimeType`, `status`). (Output: `models/Document.js`; Dependencies: Task 5.1).
  4. *Task 5.4*: Define `DocumentChunk` schema (`documentId`, `userId`, `chunkText`, `chunkIndex`, `pageNumber`, `embedding`). (Output: `models/DocumentChunk.js`; Dependencies: Task 5.1).
  5. *Task 5.5*: Define `ChatSession` and `ChatMessage` schemas. (Output: `models/ChatSession.js`, `models/ChatMessage.js`; Dependencies: Task 5.1).
- **Expected Outcome**: Backend connects cleanly to MongoDB; all models compile with schema validations.
- **Testing Requirements**: Connect to local/Atlas MongoDB; run a connection test script to verify successful ping.
- **Git Branch Suggestion**: `feat/mongodb-models`
- **Completion Criteria**: Clean database connection, all 5 schemas defined according to SRS Section 8.

---

## Phase 6: User Registration, Login & JWT
- **Objective**: Implement complete, secure authentication on both backend and frontend.
- **Concepts to Learn**:
  - Password hashing with salt (`bcrypt`), JWT generation and verification, HTTP headers, React Context auth state.
- **Tasks in Execution Order**:
  1. *Task 6.1*: Implement `POST /api/auth/register` (validate input, check existing email, hash password, create user). (Output: Register endpoint; Dependencies: Phase 5).
  2. *Task 6.2*: Implement `POST /api/auth/login` (validate credentials, compare bcrypt hash, generate JWT). (Output: Login endpoint; Dependencies: Task 6.1).
  3. *Task 6.3*: Build `authMiddleware.js` to protect private routes using JWT verification. (Output: Auth middleware; Dependencies: Task 6.2).
  4. *Task 6.4*: Implement `GET /api/auth/me` protected endpoint. (Output: Current user endpoint; Dependencies: Task 6.3).
  5. *Task 6.5*: Build frontend `AuthContext`, `LoginForm`, `RegisterForm`, and `ProtectedRoute` component. (Output: Functional frontend auth; Dependencies: Task 6.4).
- **Expected Outcome**: Users can register, log in, store token securely in state/storage, access dashboard, and log out.
- **Testing Requirements**: Test registration, duplicate email rejection, invalid password rejection, valid login, token generation, and route protection in Postman and React UI.
- **Git Branch Suggestion**: `feat/user-authentication`
- **Completion Criteria**: Registration and login work seamlessly; unauthenticated users cannot access dashboard.

---

## Phase 7: PDF Upload & Validation
- **Objective**: Implement multi-part file upload with strict MIME type and file size validation.
- **Concepts to Learn**:
  - `multipart/form-data`, Multer middleware, file storage strategies, file size guardrails, document status flags.
- **Tasks in Execution Order**:
  1. *Task 7.1*: Configure `multer` upload middleware (validate MIME type `application/pdf`, set max file size limit e.g. 10MB, define upload destination). (Output: `middlewares/uploadMiddleware.js`; Dependencies: Phase 6).
  2. *Task 7.2*: Create `POST /api/documents/upload` endpoint: saves file reference, creates `Document` record in MongoDB with `status: 'Processing'`. (Output: Document upload API; Dependencies: Task 7.1).
  3. *Task 7.3*: Create `GET /api/documents` and `DELETE /api/documents/:id` endpoints (strictly scoped to `userId`). (Output: Document management APIs; Dependencies: Task 7.2).
  4. *Task 7.4*: Build frontend Upload component with drag-and-drop, file type validation, and Document List table with delete action. (Output: Frontend document management UI; Dependencies: Task 7.3).
- **Expected Outcome**: Authenticated users can upload a PDF; backend validates and saves the document record; users can view and delete their own documents.
- **Testing Requirements**: Upload valid PDF (succeeds), upload non-PDF (fails with clear 400 error), upload oversized file (fails), verify database record has correct `userId`.
- **Git Branch Suggestion**: `feat/pdf-upload`
- **Completion Criteria**: PDF uploads work cleanly; non-PDFs are rejected; ownership isolation is verified.

---

## Phase 8: PDF Text Extraction
- **Objective**: Extract raw readable text and page metadata from uploaded PDF documents.
- **Concepts to Learn**:
  - PDF file binary structure, text streams, Node.js buffer reading, handling non-text/corrupt PDFs.
- **Tasks in Execution Order**:
  1. *Task 8.1*: Integrate PDF text extraction library (e.g., `pdf-parse`) in `services/pdfService.js`. (Output: PDF parsing service; Dependencies: Phase 7).
  2. *Task 8.2*: Build text extraction workflow: read PDF buffer, extract full text and page-by-page content. (Output: Extracted text and page mapping; Dependencies: Task 8.1).
  3. *Task 8.3*: Implement error handling: if PDF contains no extractable text (e.g. scanned image), update document status to `Failed` with reason. (Output: Graceful failure handling; Dependencies: Task 8.2).
  4. *Task 8.4*: Expose document processing status in API and reflect in frontend badge. (Output: UI displays `Processing`, `Ready`, or `Failed`; Dependencies: Task 8.3).
- **Expected Outcome**: Backend successfully extracts readable text from PDFs and tracks processing status.
- **Testing Requirements**: Upload text-based PDF (extracts text), upload empty/scanned PDF (flags understandable error without crashing server).
- **Git Branch Suggestion**: `feat/pdf-text-extraction`
- **Completion Criteria**: Text extracted cleanly with page numbers; failure states clearly reported.

---

## Phase 9: OpenAI API Integration
- **Objective**: Establish secure backend communication with the OpenAI API for chat completions.
- **Concepts to Learn**:
  - OpenAI official SDK, API key security in `.env`, chat completion messages structure (`system`, `user`, `assistant`), token limits, error handling.
- **Tasks in Execution Order**:
  1. *Task 9.1*: Install `openai` SDK in `server/` and create `services/openaiService.js` with client initialization. (Output: OpenAI service wrapper; Dependencies: Phase 4).
  2. *Task 9.2*: Create a test controller and route `POST /api/ai/test` to verify API connectivity and response generation. (Output: AI test endpoint; Dependencies: Task 9.1).
  3. *Task 9.3*: Implement robust API error handling (quota exceeded, invalid key, timeout). (Output: Safe error handling wrapper; Dependencies: Task 9.2).
- **Expected Outcome**: Backend can securely send messages to OpenAI and receive valid completions.
- **Testing Requirements**: Send a test prompt via Postman; confirm OpenAI response returns; test with invalid key to ensure server handles error gracefully.
- **Git Branch Suggestion**: `feat/openai-integration`
- **Completion Criteria**: OpenAI client tested and functioning reliably with secure configuration.

---

## Phase 10: Basic AI Chatbot
- **Objective**: Build a standard conversational chat interface where the user can chat with the AI before adding document context.
- **Concepts to Learn**:
  - Chat UI layout, message state management, loading skeletons, conversational prompt structure.
- **Tasks in Execution Order**:
  1. *Task 10.1*: Create `POST /api/chat/simple` route accepting user message and returning OpenAI response. (Output: Basic chat endpoint; Dependencies: Phase 9).
  2. *Task 10.2*: Build frontend `ChatWindow`, `MessageBubble`, and `ChatInputBox` components. (Output: Interactive chat interface; Dependencies: Task 10.1).
  3. *Task 10.3*: Add loading states, disable send button during inference, and display error toasts. (Output: Polished user experience; Dependencies: Task 10.2).
- **Expected Outcome**: User can type a question in React and receive an AI response.
- **Testing Requirements**: Conduct a 3-turn conversation in the UI; verify UI responsiveness and loading indicator.
- **Git Branch Suggestion**: `feat/basic-chatbot`
- **Completion Criteria**: Basic chat UI works reliably with proper loading and error states.

---

## Phase 11: Text Chunking & Embeddings
- **Objective**: Split extracted document text into semantic chunks and generate numerical vector embeddings for each chunk.
- **Concepts to Learn**:
  - Chunking strategies (character vs token, chunk size, chunk overlap), semantic continuity, vector dimensions (1536), embedding models (`text-embedding-3-small`).
- **Tasks in Execution Order**:
  1. *Task 11.1*: Build `services/chunkingService.js`: split text into chunks (e.g., 500-1000 characters) with 100-character overlap while preserving page metadata. (Output: Chunking engine; Dependencies: Phase 8).
  2. *Task 11.2*: Add embedding generation function in `services/openaiService.js` for batch text inputs. (Output: Embedding generator; Dependencies: Task 11.1).
  3. *Task 11.3*: Store generated chunks with their `embedding` array, `documentId`, `userId`, `chunkIndex`, and `pageNumber` in the `DocumentChunks` collection. (Output: Chunks persisted in DB; Dependencies: Task 11.2).
  4. *Task 11.4*: Update document status to `Ready` once all chunks and embeddings are stored. (Output: Ingestion pipeline complete; Dependencies: Task 11.3).
- **Expected Outcome**: Uploaded PDF text is chunked, converted into 1536-dimensional vectors, and saved in MongoDB.
- **Testing Requirements**: Inspect `DocumentChunks` in MongoDB; verify embeddings are arrays of 1536 numbers; verify page numbers match the PDF.
- **Git Branch Suggestion**: `feat/chunking-embeddings`
- **Completion Criteria**: Every uploaded document produces correctly structured chunks and embeddings in MongoDB.

---

## Phase 12: RAG & Vector Search
- **Objective**: Implement the complete Retrieval-Augmented Generation pipeline using MongoDB Atlas Vector Search.
- **Concepts to Learn**:
  - Vector search index creation, cosine similarity, top-$k$ nearest neighbors, prompt augmentation, anti-hallucination guardrails, source citations.
- **Tasks in Execution Order**:
  1. *Task 12.1*: Configure MongoDB Atlas Vector Search index on `DocumentChunks.embedding`. (Output: Active vector search index; Dependencies: Phase 11).
  2. *Task 12.2*: Build `services/vectorService.js`: generate embedding for user question and query Atlas Vector Search using `$vectorSearch` pipeline filtered by `userId` and `documentId`. (Output: Vector retrieval service; Dependencies: Task 12.1).
  3. *Task 12.3*: Build RAG prompt synthesizer: inject top-$k$ chunks into the system prompt with strict grounding instructions. (Output: Prompt assembly logic; Dependencies: Task 12.2).
  4. *Task 12.4*: Update chat endpoint to run RAG pipeline and return the generated answer along with retrieved `sourceReferences` (document name and page numbers). (Output: RAG API endpoint; Dependencies: Task 12.3).
  5. *Task 12.5*: Update frontend Chat UI to render source citation pills (collapsible document name and page number). (Output: Citations displayed in UI; Dependencies: Task 12.4).
- **Expected Outcome**: User asks questions about a PDF and receives accurate answers grounded strictly in the PDF, citing page numbers.
- **Testing Requirements**: Ask questions present in the PDF (answers correctly with page citations); ask questions NOT in the PDF (AI clearly states information is not found).
- **Git Branch Suggestion**: `feat/rag-vector-search`
- **Completion Criteria**: Verified context-grounded Q&A with accurate source attribution and no hallucinations.

---

## Phase 13: Chat History & Session Management
- **Objective**: Persist conversation history across multiple chat sessions and enable users to review past discussions.
- **Concepts to Learn**:
  - Multi-document session associations, conversation thread persistence, pagination, state hydration.
- **Tasks in Execution Order**:
  1. *Task 13.1*: Implement `POST /api/chat/sessions` to initialize a new chat session for a document. (Output: Create session API; Dependencies: Phase 12).
  2. *Task 13.2*: Implement `GET /api/chat/sessions` and `GET /api/chat/sessions/:id` to retrieve user conversation threads and messages. (Output: Retrieve history APIs; Dependencies: Task 13.1).
  3. *Task 13.3*: Update RAG message handler to save both user question and AI response into `ChatMessages` linked to the active session. (Output: Real-time message persistence; Dependencies: Task 13.2).
  4. *Task 13.4*: Build frontend Chat History page and sidebar conversation selector. (Output: Conversation browser UI; Dependencies: Task 13.3).
- **Expected Outcome**: Users can switch between previous chat sessions, reload historical messages, and continue conversations.
- **Testing Requirements**: Refresh browser and confirm previous messages reload; verify user B cannot see user A's sessions.
- **Git Branch Suggestion**: `feat/chat-history`
- **Completion Criteria**: Complete conversation history persists reliably across page reloads.

---

## Phase 14: Function Calling
- **Objective**: Enable OpenAI model to invoke approved backend tools to fetch structured application data.
- **Concepts to Learn**:
  - OpenAI Tool/Function calling specification (JSON Schema), function call interception, argument validation, returning tool outputs to LLM.
- **Tasks in Execution Order**:
  1. *Task 14.1*: Define tool schemas (`getUserDocumentCount`, `getUserDocumentList`) in `utils/aiTools.js`. (Output: Tool JSON definitions; Dependencies: Phase 9).
  2. *Task 14.2*: Implement backend execution handlers for each tool with strict `userId` scoping. (Output: Secure tool runner; Dependencies: Task 14.1).
  3. *Task 14.3*: Build function execution loop: intercept `tool_calls`, execute backend handler, send tool response back to OpenAI, and receive final answer. (Output: Function calling orchestration; Dependencies: Task 14.2).
- **Expected Outcome**: When asked *"How many documents have I uploaded?"*, AI triggers the backend tool and answers with the real count.
- **Testing Requirements**: Ask *"What documents have I uploaded?"*; confirm backend function executes and AI answers with user's actual document list.
- **Git Branch Suggestion**: `feat/function-calling`
- **Completion Criteria**: Model reliably invokes tools and backend executes only validated, read-only functions.

---

## Phase 15: Basic Controlled AI Agent
- **Objective**: Combine RAG and Function Calling into a unified single-turn AI Agent that intelligently decides whether to search documents or query app data.
- **Concepts to Learn**:
  - AI Agent reasoning loop (ReAct / tool selection), autonomous routing, tool safety guardrails.
- **Tasks in Execution Order**:
  1. *Task 15.1*: Build `services/agentService.js` uniting document search tool and metadata tools under a single agent interface. (Output: Unified agent controller; Dependencies: Phase 12, Phase 14).
  2. *Task 15.2*: Define system prompt guiding the agent when to use Document Search vs App Metadata tools. (Output: Agent system prompt; Dependencies: Task 15.1).
  3. *Task 15.3*: Expose `POST /api/agent/chat` and update frontend to route through the unified agent. (Output: Agent-powered chat endpoint; Dependencies: Task 15.2).
- **Expected Outcome**: One unified chat interface can seamlessly answer both document questions and account/document management inquiries.
- **Testing Requirements**: Ask document question (agent routes to vector search); ask account question (agent routes to tool); ask general question (agent responds appropriately).
- **Git Branch Suggestion**: `feat/basic-ai-agent`
- **Completion Criteria**: Agent makes correct routing decisions without user having to toggle modes manually.

---

## Phase 16: Testing, Security Hardening & Deployment
- **Objective**: Perform comprehensive end-to-end testing, security audits, rate-limiting, and prepare production deployment guides.
- **Concepts to Learn**:
  - Input validation (`zod`/`joi`), API rate limiting (`express-rate-limit`), security headers (`helmet`), production build optimization, deployment pipelines.
- **Tasks in Execution Order**:
  1. *Task 16.1*: Add input validation on all routes and attach `express-rate-limit` on auth and AI endpoints. (Output: Rate-limited, validated APIs; Dependencies: Phase 15).
  2. *Task 16.2*: Perform security audit: verify no secrets in frontend code, `.gitignore` sanity check, verify cross-user data isolation. (Output: Security audit report; Dependencies: Task 16.1).
  3. *Task 16.3*: Build production React bundle (`npm run build`) and configure static serving or standalone hosting. (Output: Optimized build; Dependencies: Task 16.2).
  4. *Task 16.4*: Document deployment process and finalize `README.md`. (Output: Complete production deployment guide; Dependencies: Task 16.3).
- **Expected Outcome**: A production-ready, fully tested, secure, and documented AI application.
- **Testing Requirements**: Execute complete regression test: register, login, upload PDF, process, ask RAG questions, verify citations, run agent tools, delete document.
- **Git Branch Suggestion**: `feat/security-and-deployment`
- **Completion Criteria**: All acceptance criteria from SRS Section 10 are 100% satisfied.

