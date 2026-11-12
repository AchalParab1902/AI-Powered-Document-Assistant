# 02 - System Architecture

## 1. Architectural Overview
The **AI-Powered Document Assistant** follows a decoupled, three-tier client-server architecture with an integrated vector search engine and an external AI inference engine.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT TIER                                      |
|                                React.js (SPA)                                     |
|  - Auth State & Protected Routes    - Document Upload & Status Polling            |
|  - Chat UI & Streaming Interface    - Source Reference Accordions / Modals        |
+----------------------------------------▲------------------------------------------+
                                         │ HTTPS / REST API / Bearer JWT
                                         ▼
+-----------------------------------------------------------------------------------+
|                                  SERVER TIER                                      |
|                             Node.js + Express.js                                  |
|  - Auth Middleware (JWT & bcrypt)   - File Upload Pipeline (Multer)               |
|  - PDF Parser & Text Chunker        - Vector Search Query Builder                 |
|  - RAG Controller & Prompt Builder  - AI Tool Registry & Agent Execution Loop     |
+-------------------▲-----------------------------------------▲---------------------+
                    │                                         │
                    ▼                                         ▼
+--------------------------------------+   +----------------------------------------+
|             DATA TIER                |   |                AI TIER                 |
|         MongoDB + Atlas              |   |               OpenAI API               |
|  - Collections: Users, Documents,    |   |  - Embedding Engine:                   |
|    DocumentChunks, ChatSessions,     |   |    text-embedding-3-small              |
|    ChatMessages                      |   |  - Chat Completion Engine:             |
|  - Index: Atlas Vector Search Index  |   |    gpt-4o-mini / gpt-3.5-turbo         |
|    (Cosine Similarity on embeddings) |   |  - Function Calling / Tool Definition  |
+--------------------------------------+   +----------------------------------------+
```

---

## 2. Frontend Architecture (React.js)
The frontend is designed as a modular, component-driven Single Page Application (SPA).

### 2.1 Core Modules & Structure
- **Routing & Auth Guard**:
  - Public routes: `/login`, `/register`.
  - Protected routes: `/dashboard`, `/chat/:documentId`, `/history`.
  - Navigation guards redirect unauthenticated users to `/login`.
- **State Management**:
  - `AuthContext`: Manages user credentials, JWT token lifecycle, and login/logout state.
  - `DocumentContext` / Local State: Manages the uploaded document list, active document selection, and processing statuses (`Processing`, `Ready`, `Failed`).
  - `ChatContext` / Hook: Manages current conversation messages, loading indicators, and error states.
- **Component Hierarchy**:
  - **Layout**: Navbar, Sidebar (Document selector & History links), Main Content Area.
  - **Auth**: `LoginForm`, `RegisterForm`.
  - **Dashboard**: `DocumentUploadCard` (Drag & drop file upload with size/type validation), `DocumentListTable` (Status badge, delete trigger).
  - **Chat Interface**: `ChatWindow`, `MessageBubble` (User query vs Assistant response), `SourceCitationsCard` (Document title, page number tag), `ChatInputBox`.

---

## 3. Backend Architecture (Node.js + Express.js)
The backend adopts a layered MVC (Model-View-Controller) / Service-Repository pattern, ensuring strict separation of concerns, testability, and security.

### 3.1 Key Layers
1. **Routing Layer (`/routes`)**: Maps incoming HTTP requests to corresponding controller functions and attaches validation & authentication middleware.
2. **Middleware Layer (`/middlewares`)**:
   - `authMiddleware.js`: Verifies JWT tokens from `Authorization: Bearer <token>` headers, extracts `userId`, and attaches user context to the request.
   - `uploadMiddleware.js`: Multer configuration to validate file type (`application/pdf`) and file size limits before writing to disk or memory buffer.
   - `errorMiddleware.js`: Centralized error-handling middleware that catches synchronous and asynchronous errors and formats them into consistent JSON responses.
3. **Controller Layer (`/controllers`)**:
   - `authController.js`: Registration, login, token issuance, and user profile retrieval.
   - `documentController.js`: File upload handling, document deletion, and listing user documents.
   - `chatController.js`: Managing chat sessions, receiving queries, orchestrating RAG queries, and persisting history.
   - `agentController.js`: Function calling and AI agent execution.
4. **Service Layer (`/services`)**:
   - `pdfService.js`: Extracts raw text and per-page content from PDF files.
   - `chunkingService.js`: Slices text into overlapping character/token chunks with page metadata.
   - `openaiService.js`: Wraps OpenAI SDK for embedding generation, chat completions, and tool definitions.
   - `vectorService.js`: Executes vector similarity searches against MongoDB Atlas Vector Search.
   - `agentService.js`: Validates tool execution requests against whitelist and invokes local backend functions.

---

## 4. Database Architecture (MongoDB + Atlas)
MongoDB serves as both the operational document store and the vector database.

### 4.1 Collections & Responsibilities
1. **`Users`**: Holds credentials, email uniqueness constraints, and account creation dates.
2. **`Documents`**: Stores file metadata, original filename, storage path/reference, file size, processing status (`Processing`, `Ready`, `Failed`), and owner `userId`.
3. **`DocumentChunks`**: Stores chunked text segments, parent `documentId`, owner `userId`, `pageNumber`, `chunkIndex`, and the numerical `embedding` vector array.
4. **`ChatSessions`**: Maintains conversation session metadata, conversation title, related documents, and owner `userId`.
5. **`ChatMessages`**: Stores individual message turns (`role: 'user' | 'assistant'`), text content, timestamp, and array of `sourceReferences` (document name and page numbers).

### 4.2 Vector Search Integration
- An Atlas Vector Search index is defined on the `DocumentChunks` collection on the `embedding` field.
- Index parameters:
  - Vector dimensions: 1536 (matching OpenAI `text-embedding-3-small`).
  - Similarity metric: Cosine similarity.
  - Filter field: `userId` (enforces strict multi-tenant authorization during vector search).

---

## 5. OpenAI Integration Architecture
All interactions with the OpenAI API are handled strictly by the backend server; **API keys are never exposed to the frontend**.

### 5.1 Embedding Model
- Model: `text-embedding-3-small`.
- Generates 1536-dimensional vectors for document chunks and user search queries.
- Fast, cost-effective, and optimized for semantic similarity.

### 5.2 Chat Completion Model
- Model: `gpt-4o-mini` (or `gpt-3.5-turbo`).
- Responsibilities:
  1. Answering user questions based on injected context chunks.
  2. Executing Function Calling requests.
  3. Driving the Basic AI Agent step.

### 5.3 System Prompting & Guardrails
- The system prompt instructs the assistant:
  > *"You are an AI Document Assistant. You must answer the user's question using ONLY the provided document context. If the answer is not present in the context, explicitly state: 'I could not find this information in the uploaded document.' Do not speculate or generate information outside the context."*

---

## 6. End-to-End Application Workflows

### 6.1 Ingestion Workflow (PDF Upload to Ready)
```
User (Browser)               Backend (Express)            OpenAI API            MongoDB
     │                               │                        │                    │
     │── 1. POST /documents/upload ──>│                        │                    │
     │   (multipart/form-data)       │── 2. Validate PDF      │                    │
     │                               │── 3. Save initial Doc ─────────────────────>│ (status: Processing)
     │                               │── 4. Extract Text      │                    │
     │                               │── 5. Chunk text        │                    │
     │                               │── 6. Request Embeddings>│                    │
     │                               │<──7. Vectors returned──│                    │
     │                               │── 8. Save Chunks + Vectors ─────────────────>│
     │                               │── 9. Update Doc status ─────────────────────>│ (status: Ready)
     │<── 10. Return Document Ready ──│                        │                    │
```

### 6.2 Retrieval-Augmented Generation (RAG) Workflow
```
User (Browser)               Backend (Express)          MongoDB Atlas           OpenAI API
     │                               │                        │                      │
     │── 1. POST /chat/message ─────>│                        │                      │
     │   ("What is the refund terms")│── 2. Create Query Emb ───────────────────────>│
     │                               │<── 3. Query Vector ───────────────────────────│
     │                               │── 4. Vector Search (userId + queryVector) ───>│
     │                               │<── 5. Return Top-k Matching Chunks ───────────│
     │                               │── 6. Construct Grounded Prompt               │
     │                               │── 7. Send Context + Question ────────────────>│
     │                               │<── 8. Return Answer ──────────────────────────│
     │                               │── 9. Save Q&A turn to ChatMessages ─────────>│
     │<── 10. Return Answer + Sources │                        │                      │
```

### 6.3 Function Calling & Basic AI Agent Workflow
1. User submits an operational inquiry: *"How many documents have I uploaded?"*
2. Backend passes user message to OpenAI with registered tool schemas (e.g., `getUserDocumentCount`).
3. Model inspects tool definitions and emits a `tool_calls` request rather than a direct text answer.
4. Backend intercepts `tool_calls`, validates user authentication, executes internal service `documentService.countDocuments(userId)`, and receives `{ count: 4 }`.
5. Backend sends the tool output back to OpenAI as a tool response.
6. Model synthesizes final human-friendly answer: *"You have uploaded 4 documents."*
7. Backend forwards the final response to the user.

