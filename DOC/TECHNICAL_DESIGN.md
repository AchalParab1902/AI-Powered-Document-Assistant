# Technical Design Document (TDD)
## Project: AI-Powered Document Assistant (Chat with PDF)
**Version:** 1.0  
**Author / Role:** Senior Software Architect  
**Status:** Pending User Approval  
**Date:** November 2026  

---

## 1. Executive Summary & Project Requirements

The **AI-Powered Document Assistant** is a full-stack, AI-augmented web application designed to allow users to securely upload PDF documents and interact with them using natural language. 

### 1.1 Core Problem & Solution
- **The Problem:** Extracting insights from lengthy contracts, legal agreements, and technical manuals manually is time-consuming. Directly submitting entire large documents into an LLM fails due to context window limits, high token costs, and AI hallucinations.
- **The Solution:** A decoupled **MERN** (MongoDB, Express, React, Node.js) architecture implementing **Retrieval-Augmented Generation (RAG)**. Document text is extracted, segmented into semantic chunks, vectorized via OpenAI embeddings (`text-embedding-3-small`), and indexed in MongoDB Atlas Vector Search. User queries retrieve only the most relevant passages to formulate grounded, cited responses with zero hallucination.

### 1.2 Key Functional Scope (Version 1.0)
1. **User Authentication:** Registration, login, password hashing (`bcrypt`), and stateless session management with JSON Web Tokens (JWT).
2. **Multi-Tenancy & Authorization:** Strict data isolation where users can only view, query, and delete their own files and chats.
3. **Document Ingestion Pipeline:** PDF upload via `multer`, MIME/size validation, plain text extraction, semantic chunking with overlap, and batch vector embedding generation.
4. **Vector Search & RAG:** Similarity search using MongoDB Atlas `$vectorSearch` (cosine similarity) and context-grounded prompt assembly.
5. **Accurate Attribution:** Displaying source document names and exact page citations for every factual statement.
6. **Chat Session Persistence:** Multi-turn session management with historical message retrieval.
7. **AI Function Calling & Controlled Agent:** Safe, backend-validated execution of read-only utility tools (e.g., fetching document statistics and document lists).

---

## 2. Main Application Modules

The system is decomposed into four decoupled tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Frontend (React SPA)                  │
│  - Auth Module (Login/Register/Guards)                      │
│  - Document Management Module (Upload/List/Status/Delete)   │
│  - Chat & RAG Interface Module (Messages/Citations/History) │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / JWT
┌──────────────────────────────▼──────────────────────────────┐
│                 2. Backend Service (Express.js)             │
│  - API Routing & Input Validation Middleware                │
│  - Authentication & Authorization Layer                     │
│  - Ingestion Engine (Multer, PDF Parser, Chunker)           │
│  - RAG Controller & Context Assembly Engine                 │
│  - Tool Registry & Agent Reasoning Dispatcher               │
└───────────────┬──────────────────────────────┬──────────────┘
                │ Mongoose / Vector Search     │ OpenAI SDK
┌───────────────▼──────────────┐ ┌─────────────▼──────────────┐
│  3. Database & Vector Store  │ │    4. AI Inference Tier    │
│      (MongoDB Atlas)         │ │        (OpenAI API)        │
│  - Operational Collections   │ │  - Embedding Model         │
│  - Atlas Vector Search Index │ │  - Chat Completion Model   │
└──────────────────────────────┘ └────────────────────────────┘
```

### Module Breakdown:
1. **Frontend Module (`client/`):**
   - **Auth Module:** Form state, client-side input validation, JWT storage, auth guard routes (`<ProtectedRoute />`).
   - **Document Module:** File picker with drag-and-drop, upload progress indicators, status polling (`Processing` $\rightarrow$ `Ready` / `Failed`), document deletion.
   - **Chat & Citations Module:** Conversation viewer, auto-scrolling message list, markdown rendering for AI responses, collapsible source citations (document name, page number, snippet).
   - **Session / History Module:** Sidebar listing past chat threads, switching between active sessions.

2. **Backend Core Module (`server/`):**
   - **Security & Middleware:** JWT authentication validator (`authMiddleware`), Multer file validator (`uploadMiddleware`), rate limiter, centralized error handler.
   - **Document Ingestion Service:** Parses PDF text stream (`pdfService`), splits text into overlapping chunks (`chunkingService`), coordinates embedding generation.
   - **RAG & Vector Service:** Formulates query vectors, executes `$vectorSearch` with strict `userId` and `documentId` filters, merges retrieved chunks into system prompts.
   - **Agent & Tool Calling Service:** Maintains a strict whitelist of callable internal functions (`getUserDocumentCount`, `getUserDocumentList`), executes validated local queries, returns tool responses to OpenAI.

3. **Data Tier Module (MongoDB Atlas):**
   - Primary persistent store for users, documents, chunks, chat sessions, and messages.
   - High-dimensional vector index (1536 dimensions, Cosine metric) indexing chunk embeddings.

4. **External AI Integration Module (OpenAI):**
   - Embedding generation: `text-embedding-3-small`.
   - Text generation and tool routing: `gpt-4o-mini`.

---

## 3. System Architecture & Communication Model

The application follows a clean, layered architectural pattern on the backend (Controller $\rightarrow$ Service $\rightarrow$ Data Access) and component-driven state architecture on the frontend.

### 3.1 Component Communication Diagram

```
+--------------------------------------------------------------------------------------------------+
|                                        FRONTEND (React SPA)                                      |
+--------------------------------------------------------------------------------------------------+
              │                                                │
   (1) Upload PDF (multipart/form-data)               (4) Send Query (JSON + JWT)
              │                                                │
              ▼                                                ▼
+--------------------------------------------------------------------------------------------------+
|                                    BACKEND (Node.js + Express)                                   |
|                                                                                                  |
|   [Upload Handler]      [PDF Service]      [Chunking Engine]     [RAG Controller]  [Agent Engine]|
+--------------------------------------------------------------------------------------------------+
         │                      │                    │                     │               │
         │ Save metadata        │ Parse stream       │ Batch chunks        │ User Query    │ Function
         ▼                      ▼                    ▼                     ▼ Vector        ▼ Schema
+-------------------+ +-------------------+ +----------------------------------+ +-----------------+
|  Local Storage /  | |   pdf-parse       | |            OpenAI API            | |  MongoDB Atlas  |
|  Server Uploads   | |   (Text Extractor)| | - text-embedding-3-small         | |  Vector Search  |
|  (Raw PDF Binary) | +-------------------+ | - gpt-4o-mini                    | |  ($vectorSearch)|
+-------------------+                       +----------------------------------+ +-----------------+
         ▲                                                   ▲                             ▲
         │                                                   │                             │
         └────────────────── MongoDB Operational Database ───┴─────────────────────────────┘
                             (Users, Documents, Chunks, Sessions, Messages)
```

### 3.2 Step-by-Step Flow: How Components Interact

#### A. Authentication Flow
1. **Frontend $\rightarrow$ Backend:** User submits email and password (`POST /api/auth/login`).
2. **Backend $\rightarrow$ Database:** Fetches user by email; compares provided password with `passwordHash` using `bcrypt.compare()`.
3. **Backend $\rightarrow$ Frontend:** Generates JWT containing `{ userId: user._id }` signed with server secret; returns token and user profile.
4. **Subsequent Calls:** Frontend attaches header `Authorization: Bearer <token>` to all protected calls.

#### B. PDF Ingestion Flow (Upload to Ready)
1. **Frontend $\rightarrow$ Backend:** Sends PDF binary (`POST /api/documents/upload` via `multipart/form-data`).
2. **Backend:** 
   - `uploadMiddleware` validates file MIME type (`application/pdf`) and size limit ($\le 10$MB).
   - Writes the file to secure server storage.
   - Inserts initial `Document` record in MongoDB with `status: 'Processing'`.
3. **Backend $\rightarrow$ `pdfService`:** Reads PDF buffer and extracts text strings alongside page demarcations.
   - *Error Guard:* If no extractable text is present (scanned image or empty PDF), updates `Document.status = 'Failed'` with a descriptive error message and exits cleanly.
4. **Backend $\rightarrow$ `chunkingService`:** Breaks extracted text into chunks (e.g. 800 characters with 100 character overlap) tagged with `pageNumber` and `chunkIndex`.
5. **Backend $\rightarrow$ OpenAI API:** Sends chunk texts in batches to `text-embedding-3-small` endpoint to receive 1536-dimensional embedding vectors.
6. **Backend $\rightarrow$ MongoDB:** Inserts chunk documents into `DocumentChunks` collection (including the vector arrays, `userId`, and `documentId`).
7. **Backend $\rightarrow$ MongoDB:** Updates parent document `status = 'Ready'`.

#### C. RAG Query Flow (Chatting with Document)
1. **Frontend $\rightarrow$ Backend:** User enters a question in the chat interface (`POST /api/chat/sessions/:id/messages`).
2. **Backend $\rightarrow$ OpenAI API:** Calls `openai.embeddings.create` with user question to produce a 1536-dimensional query vector.
3. **Backend $\rightarrow$ MongoDB Atlas Vector Search:** Executes an aggregation pipeline using `$vectorSearch`:
   - Matches nearest chunks by cosine similarity.
   - Pre-filters by `{ userId: authenticatedUserId, documentId: activeDocumentId }` to ensure zero cross-tenant leakage.
   - Retrieves top-$k$ (e.g., $k=4$) most relevant text chunks with page numbers.
4. **Backend:** Assembles the prompt:
   - System message: Strict role definition and grounding guardrails ("Answer strictly using the provided context. If unknown, say so.").
   - Injected Context: Chunks formatted with `[Doc: filename, Page: X]: ...`.
   - User message: Original question.
5. **Backend $\rightarrow$ OpenAI API:** Sends prompt to `gpt-4o-mini` (`temperature: 0.1` for factual fidelity).
6. **OpenAI API $\rightarrow$ Backend:** Returns context-grounded response text.
7. **Backend $\rightarrow$ MongoDB:** Saves user message and assistant message (along with structured `sourceReferences`) in `ChatMessages`.
8. **Backend $\rightarrow$ Frontend:** Returns structured response containing answer and citation array.

#### D. Controlled Agent & Function Calling Flow
1. **Frontend $\rightarrow$ Backend:** User asks an operational question: *"How many documents do I have?"*
2. **Backend $\rightarrow$ OpenAI API:** Forwards prompt along with pre-registered tool schemas (e.g., `getUserDocumentCount`).
3. **OpenAI API $\rightarrow$ Backend:** Decides a tool is needed and returns a structured `tool_calls` payload requesting `getUserDocumentCount()`.
4. **Backend:** Intercepts call; validates user context; runs local database query `Document.countDocuments({ userId: req.user._id })`.
5. **Backend $\rightarrow$ OpenAI API:** Submits function return value `{ count: 3 }` back to OpenAI.
6. **OpenAI API $\rightarrow$ Backend:** Synthesizes final conversational response: *"You have 3 documents in your account."*
7. **Backend $\rightarrow$ Frontend:** Returns final answer and tags which tool was utilized.

---

## 4. Database Structure & Schemas

The database layer utilizes **MongoDB** with Mongoose ODM schemas.

```
┌───────────────────────┐
│        Users          │
├───────────────────────┤
│ _id (PK)              │
│ name: String          │
│ email: String (Unique)│
│ passwordHash: String  │
│ createdAt: Date       │
│ updatedAt: Date       │
└───────────┬───────────┘
            │ 1:N
            ├───────────────────────────────────────────────┐
            ▼ 1:N                                           ▼ 1:N
┌───────────────────────────────┐               ┌───────────────────────────────┐
│          Documents            │               │         ChatSessions          │
├───────────────────────────────┤               ├───────────────────────────────┤
│ _id (PK)                      │               │ _id (PK)                      │
│ userId: ObjectId (FK)         │               │ userId: ObjectId (FK)         │
│ originalName: String          │               │ title: String                 │
│ storedFileReference: String   │               │ relatedDocumentIds: [FK]      │
│ size: Number                  │               │ createdAt: Date               │
│ mimeType: String              │               │ updatedAt: Date               │
│ status: Enum [Proc/Ready/Fail]│               └───────────────┬───────────────┘
│ errorMessage: String          │                               │ 1:N
│ pageCount: Number             │                               ▼
│ createdAt, updatedAt          │               ┌───────────────────────────────┐
└───────────┬───────────────────┘               │         ChatMessages          │
            │ 1:N                               ├───────────────────────────────┤
            ▼                                   │ _id (PK)                      │
┌───────────────────────────────┐               │ sessionId: ObjectId (FK)      │
│        DocumentChunks         │               │ userId: ObjectId (FK)         │
├───────────────────────────────┤               │ role: Enum [user/asst/sys]    │
│ _id (PK)                      │               │ content: String               │
│ documentId: ObjectId (FK)     │               │ sourceReferences: [Subdoc]    │
│ userId: ObjectId (FK)         │               │ createdAt: Date               │
│ chunkText: String             │               └───────────────────────────────┘
│ chunkIndex: Number            │
│ pageNumber: Number            │
│ embedding: [Number] (1536)    │
│ createdAt: Date               │
└───────────────────────────────┘
```

### 4.1 Schema Definitions

#### 1. `Users`
- `_id`: ObjectId (Primary Key)
- `name`: String (Required, trimmed, max 60 chars)
- `email`: String (Required, unique, lowercase, trimmed)
- `passwordHash`: String (Required, bcrypt hash)
- `createdAt`: Date (Auto timestamp)
- `updatedAt`: Date (Auto timestamp)
- *Index:* `{ email: 1 }` (Unique)

#### 2. `Documents`
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Required, ref: `User`)
- `originalName`: String (Required, sanitized filename)
- `storedFileReference`: String (Required, local disk storage path)
- `size`: Number (Required, file size in bytes)
- `mimeType`: String (Required, restricted to `application/pdf`)
- `status`: String (Enum: `'Processing'`, `'Ready'`, `'Failed'`, Default: `'Processing'`)
- `errorMessage`: String (Default: null)
- `pageCount`: Number (Default: 0)
- `createdAt`, `updatedAt`: Timestamps
- *Index:* `{ userId: 1, createdAt: -1 }` (Optimized for user dashboard listing)

#### 3. `DocumentChunks`
- `_id`: ObjectId (Primary Key)
- `documentId`: ObjectId (Required, ref: `Document`, indexed for cascading deletion)
- `userId`: ObjectId (Required, ref: `User`, indexed for tenant isolation)
- `chunkText`: String (Required, text passage)
- `chunkIndex`: Number (Required, sequential index within document)
- `pageNumber`: Number (Extracted PDF page number)
- `embedding`: [Number] (Required, 1536-dimensional array of floats)
- `createdAt`: Date
- *Indexes:*
  - B-tree Index: `{ documentId: 1 }`
  - Compound Index: `{ userId: 1, documentId: 1 }`
  - **Atlas Vector Search Index (`vector_index`):**
    - Path: `embedding`
    - Dimensions: `1536`
    - Similarity Function: `cosine`
    - Filter field: `userId` (enables indexed multi-tenant filtering)

#### 4. `ChatSessions`
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Required, ref: `User`)
- `title`: String (Required, default: `'New Conversation'`)
- `relatedDocumentIds`: [ObjectId] (Array of ref: `Document`)
- `createdAt`, `updatedAt`: Timestamps
- *Index:* `{ userId: 1, updatedAt: -1 }`

#### 5. `ChatMessages`
- `_id`: ObjectId (Primary Key)
- `sessionId`: ObjectId (Required, ref: `ChatSession`)
- `userId`: ObjectId (Required, ref: `User`)
- `role`: String (Enum: `'user'`, `'assistant'`, `'system'`)
- `content`: String (Required, text of query or generated response)
- `sourceReferences`: Array of Subdocuments:
  - `documentId`: ObjectId
  - `documentName`: String
  - `pageNumber`: Number
  - `chunkSnippet`: String
- `createdAt`: Date
- *Index:* `{ sessionId: 1, createdAt: 1 }` (Fast chronological replay)

---

## 5. Backend REST API Specification

All protected endpoints require the HTTP Header: `Authorization: Bearer <token>`.  
Responses adhere to standardized JSON envelopes:
- Success: `{ "success": true, "message": "...", "data": { ... } }`
- Error: `{ "success": false, "message": "...", "error": { ... } }`

### 5.1 Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Purpose | Body / Parameters | Success Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new account | `{ name, email, password }` | `201 Created` |
| `POST` | `/api/auth/login` | Public | Authenticate & issue JWT | `{ email, password }` | `200 OK` |
| `GET` | `/api/auth/me` | Protected | Fetch current user profile | Header Bearer Token | `200 OK` |

### 5.2 Document Endpoints (`/api/documents`)
| Method | Endpoint | Access | Purpose | Body / Parameters | Success Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | Protected | Upload & queue PDF for ingestion | `multipart/form-data` (`file`) | `201 Created` / `202 Accepted` |
| `GET` | `/api/documents` | Protected | List user's uploaded documents | Query params (optional pagination) | `200 OK` |
| `GET` | `/api/documents/:id/status`| Protected | Poll document processing state | Route param `:id` | `200 OK` |
| `DELETE`| `/api/documents/:id` | Protected | Delete file, document & chunk vectors | Route param `:id` | `200 OK` |

### 5.3 Chat & RAG Endpoints (`/api/chat`)
| Method | Endpoint | Access | Purpose | Body / Parameters | Success Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/sessions` | Protected | Create new chat session for a doc | `{ title, documentId }` | `201 Created` |
| `GET` | `/api/chat/sessions` | Protected | List user's conversation threads | Header Bearer Token | `200 OK` |
| `GET` | `/api/chat/sessions/:id/messages` | Protected | Fetch message history for session | Route param `:id` | `200 OK` |
| `POST` | `/api/chat/sessions/:id/messages` | Protected | Submit user question via RAG | `{ content: "..." }` | `200 OK` |

### 5.4 Controlled Agent Endpoint (`/api/agent`)
| Method | Endpoint | Access | Purpose | Body / Parameters | Success Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/agent/chat` | Protected | AI Agent query with tool resolution | `{ message: "..." }` | `200 OK` |

---

## 6. Implementation Milestones Breakdown

To ensure structured, safe, and test-driven development, the 16 project phases are organized into 8 focused milestones:

```
Milestone 1: Project Skeleton & Tooling (Phases 1-4)
     │
     ▼
Milestone 2: Database Layer & Authentication (Phases 5-6)
     │
     ▼
Milestone 3: PDF Ingestion Pipeline (Phases 7, 8, 11)
     │
     ▼
Milestone 4: AI SDK & Basic Conversational UI (Phases 9-10)
     │
     ▼
Milestone 5: Vector Search & Grounded RAG (Phase 12)
     │
     ▼
Milestone 6: Chat Session History & Persistence (Phase 13)
     │
     ▼
Milestone 7: Function Calling & Controlled AI Agent (Phases 14-15)
     │
     ▼
Milestone 8: Hardening, End-to-End Testing & Production Prep (Phase 16)
```

### Detailed Milestones:

#### Milestone 1: Environment & Foundation Setup (Phases 1–4)
- **Goal:** Initialize clean directory structure (`client/` and `server/`), setup root `.gitignore`, configure Git, bootstrap Vite React frontend, and build Express server with health check route.
- **Verification:** Dev servers start without errors; `GET /api/health` returns `{ status: "ok" }`.

#### Milestone 2: Data Models & Secure Authentication (Phases 5–6)
- **Goal:** Establish MongoDB connection, define all Mongoose schemas (`User`, `Document`, `DocumentChunk`, `ChatSession`, `ChatMessage`), implement registration/login with bcrypt and JWT, and build protected React routes.
- **Verification:** Able to register, log in, store JWT in frontend state, and restrict access to `/dashboard`.

#### Milestone 3: PDF Processing & Ingestion Pipeline (Phases 7, 8, 11)
- **Goal:** Implement Multer file upload with PDF type/size validation, parse text with `pdf-parse`, chunk text with overlap, batch generate embeddings with OpenAI, and store records in `DocumentChunks` with status flags.
- **Verification:** Uploading a PDF produces saved chunks with 1536-dimensional embeddings in MongoDB and sets document status to `Ready`. Scanned/empty PDFs set status to `Failed` gracefully.

#### Milestone 4: OpenAI Connection & Base Chat Interface (Phases 9–10)
- **Goal:** Configure OpenAI client wrapper, create simple chat completion route, build React chat window layout (input box, message bubbles, loading indicators).
- **Verification:** User can chat with standard GPT model without document context.

#### Milestone 5: Core RAG & Atlas Vector Search (Phase 12)
- **Goal:** Configure Atlas Vector Search index on `DocumentChunks.embedding`, implement vector query pipeline with multi-tenant filtering, assemble grounded context prompt, and render source citation pills (document name, page number) in React.
- **Verification:** User queries against a document return factual answers with page citations; unmentioned facts yield "Information not found" without hallucinations.

#### Milestone 6: Multi-Session Chat History Management (Phase 13)
- **Goal:** Implement endpoints to create, list, and resume chat sessions; persist user questions and assistant answers with source references in `ChatMessages`.
- **Verification:** Refreshing the browser or switching sessions preserves past conversations.

#### Milestone 7: Function Calling & Controlled AI Agent (Phases 14–15)
- **Goal:** Register backend tool schemas (`getUserDocumentCount`, `getUserDocumentList`), build execution interception loop, and assemble unified single-turn agent router.
- **Verification:** Query *"How many documents do I have?"* triggers backend function call and answers accurately with live account data.

#### Milestone 8: Security Auditing, Performance & Final Testing (Phase 16)
- **Goal:** Apply rate limiting (`express-rate-limit`), input validation schemas, execute cross-tenant security audit (confirming user A cannot access user B's documents or chats), optimize bundle, and document deployment.
- **Verification:** 100% of SRS acceptance criteria verified.

---

## 7. Architectural Decisions Explained in Simple Terms

1. **Why MongoDB Atlas Vector Search instead of a separate vector database (e.g., Pinecone/Chroma)?**
   - *Simple Explanation:* If we used a separate vector database, every document would live in two places at once: metadata in MongoDB and vectors in Pinecone. This means managing two database connections, two billing accounts, and writing complex synchronization code to handle deletions. By using MongoDB Atlas Vector Search, our document data and vector embeddings live together in one place, making queries and deletions clean and unified.

2. **Why Chunking with Overlap?**
   - *Simple Explanation:* Imagine a key sentence like *"The penalty for early contract termination is \$5,000"* gets cut exactly in half because of an arbitrary character limit. Chunk 1 ends with *"The penalty for early contract termination is..."* and Chunk 2 starts with *"\$5,000"*. Neither chunk contains the complete thought. By overlapping chunks (repeating the last 100 characters in the next chunk), we ensure sentences and ideas stay intact.

3. **Why Single-Turn Controlled Agent instead of Autonomous Multi-Turn Agent (like AutoGPT)?**
   - *Simple Explanation:* Fully autonomous AI agents can run into infinite loops, call unexpected commands, or rack up massive API bills. A single-turn controlled agent allows the AI to decide *which approved tool to read from*, receives the answer, and formulates the response in a single deterministic pass. This keeps the application fast, safe, predictable, and inexpensive.

4. **Why Strict Multi-Tenant Query Scoping in Code?**
   - *Simple Explanation:* Even if a user knows the unique ID of another user's document, our backend code will never find it because every database search mandates `{ _id: documentId, userId: req.user._id }`. The database acts as if other users' documents do not exist.

---

## 8. Open Questions & Architectural Clarifications for User Approval

Before moving to Phase 2 (Project Setup & Coding), please review the following technical points and provide your input:

1. **MongoDB Deployment Target (Atlas vs Local):**
   - MongoDB Atlas Vector Search requires an Atlas cluster (a free M0 Sandbox cluster works perfectly). Standalone local MongoDB Community Server does not support the `$vectorSearch` aggregation stage.
   - *Recommendation:* Create a free MongoDB Atlas cluster for development so Vector Search works natively. Do you agree with using MongoDB Atlas M0?

2. **Ingestion Processing Model (Asynchronous vs Request-Blocking):**
   - For a 10-page PDF, text extraction, chunking, and calling OpenAI embeddings takes approximately 3 to 6 seconds.
   - *Recommendation:* When the user uploads a PDF, the backend validates the file, creates a `Document` with status `'Processing'`, immediately returns `202 Accepted` to the frontend, and runs the extraction/chunking/embedding pipeline in the background. The frontend polls `/api/documents/:id/status` until it turns `'Ready'`. This prevents browser request timeouts. Does this asynchronous model match your expectations?

3. **Chat Session Scope (Single Document vs Cross-Document):**
   - In the frontend mockups, chat is initiated for a specific document (`/chat/:documentId`).
   - *Recommendation:* For Version 1.0, lock each chat session to a single selected document. Vector search will filter on both `userId` and `documentId`. This provides the cleanest, most accurate page citations. Multi-document cross-search can be reserved for Version 2.0. Are you aligned with this?

4. **Response Delivery (Standard JSON vs Streaming):**
   - Standard JSON waits for the full AI response before displaying it. Streaming (Server-Sent Events) displays the response word-by-word as it is being generated.
   - *Recommendation:* Start with standard JSON in Version 1.0 to keep the API and state management clean and robust. Streaming can be added as an enhancement once core RAG is stable. Do you approve?

---

*End of Technical Design Document. Awaiting user review and approval before beginning Phase 2.*
