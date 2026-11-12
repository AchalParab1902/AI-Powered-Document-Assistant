# 07 - Learning Roadmap & Core Concepts

This guide outlines every key technical and architectural concept you will learn throughout this project. It is organized into 9 progressive learning modules.

---

## Module 1: MERN Stack Foundations

### 1.1 React.js (Frontend)
- **Component Lifecycle & Hooks**:
  - `useState`: Managing UI state (e.g., input values, loading flags, toggle states).
  - `useEffect`: Handling side effects (fetching data on page load, polling document status).
  - `useContext`: Sharing global state (e.g., authenticated user, active theme) without prop-drilling.
  - `useRef`: Direct DOM interactions, such as auto-scrolling to the bottom of the chat window when new messages arrive.
- **Client-Side Routing (`react-router-dom`)**:
  - Declarative routes, URL params (`/chat/:documentId`), navigation guards (`<ProtectedRoute />`).
- **Modern Build Tooling (Vite)**:
  - Why Vite replaced Create React App (ES modules, instant hot-module replacement, lightweight build).

### 1.2 Node.js & Express.js (Backend)
- **Node.js Event Loop & Non-Blocking I/O**:
  - Understanding asynchronous operations (`async`/`await`, Promises) during file parsing and external API calls.
- **Express Middleware Chain**:
  - How request pipelines work: `Request -> Cors -> Logger -> BodyParser -> AuthMiddleware -> Controller -> Response`.
- **Centralized Error Handling**:
  - Writing an `errorHandler` middleware so backend errors return structured JSON instead of crashing the server or leaking raw stack traces.

### 1.3 MongoDB & Mongoose (Database)
- **Document vs Relational Storage**:
  - Embedding subdocuments vs referencing documents with `ObjectId`.
- **Mongoose Schemas & Validation**:
  - Enforcing required fields, unique constraints, and enums (e.g., `status: ['Processing', 'Ready', 'Failed']`).
- **Compound & Vector Indexing**:
  - Accelerating user queries and configuring vector search indexes.

---

## Module 2: Authentication & Security (JWT & bcrypt)

### 2.1 Password Security
- **Why plaintext passwords are unacceptable**: Rainbow table attacks and database breaches.
- **Salted Hashing (`bcrypt`)**:
  - A *salt* is a random string added to the password before hashing. Even if two users choose the same password, their hashes will look completely different.
  - Bcrypt is intentionally slow (computationally expensive) to thwart brute-force cracking.

### 2.2 Stateless Authorization with JWT (JSON Web Tokens)
- **Anatomy of a JWT**:
  - **Header**: Algorithm used (e.g., `HS256`).
  - **Payload**: Claims and data (e.g., `{ userId, email, exp }`).
  - **Signature**: Verifies that the token was signed with the server's private secret and hasn't been tampered with.
- **Authorization Flow**:
  - Client logs in $\rightarrow$ Server issues JWT $\rightarrow$ Client stores token $\rightarrow$ Client attaches `Authorization: Bearer <token>` to protected API requests $\rightarrow$ Server decodes and verifies token via middleware.

---

## Module 3: File Handling & PDF Processing

### 3.1 Handling File Uploads (`Multer`)
- How `multipart/form-data` streams binary files over HTTP.
- Setting file filters: rejecting `.exe`, `.docx`, or scripts; accepting only `application/pdf`.
- File size guardrails to protect against Denial of Service (DoS) attacks.

### 3.2 PDF Text Extraction (`pdf-parse`)
- PDF internals: PDFs are not simple text files; they are graphical instructions for printers. Text may be stored in compressed streams, fonts, and positional glyphs.
- Extracting raw text streams and mapping text to page boundaries.
- Graceful degradation: Identifying non-text PDFs (scanned image PDFs without OCR) and informing the user cleanly.

---

## Module 4: OpenAI API & Prompt Engineering

### 4.1 Chat Completion API Structure
- The OpenAI chat format uses role-based messages:
  - `system`: Sets the AI's identity, rules, and behavioral boundaries.
  - `user`: The question or instruction from the human.
  - `assistant`: The AI's previous responses (used for conversational memory).
- Key parameters:
  - `model`: e.g., `gpt-4o-mini`.
  - `temperature`: Controls randomness ($0.0$ is deterministic and factual; $1.0$ is creative). For document Q&A, we keep temperature low ($0.0 - 0.2$).
  - `max_tokens`: Upper bound on the response length.

### 4.2 System Prompt Grounding & Anti-Hallucination
- Prompt design techniques to instruct the LLM:
  > *"Answer strictly using the provided context. If the answer is not contained in the text, reply: 'I cannot find this information in the document.'"*

---

## Module 5: Text Chunking, Embeddings & Vector Search

### 5.1 Text Chunking Strategies
- **Why chunking is necessary**: An entire 50-page PDF cannot fit in one vector search query.
- **Chunk Size**: The number of characters or tokens per slice (e.g., 500–1000 characters).
- **Chunk Overlap**:
  - Repeating the last 100 characters of chunk $N$ at the start of chunk $N+1$.
  - *Why?* Prevents losing context that happens to fall exactly on the boundary between two chunks (e.g., a sentence split in half).

### 5.2 What are Vector Embeddings?
- An embedding is a list of floating-point numbers (e.g., an array of 1536 dimensions) that represents the semantic meaning of a piece of text.
- Words or sentences with similar meanings have vectors that point in similar directions in mathematical space.
- *Example*: The vector for *"What is the annual compensation?"* will be very close to *"The salary is \$100,000 per year"*, even though they share no common keywords.

### 5.3 Vector Similarity & Search
- **Cosine Similarity**: Measures the cosine of the angle between two multi-dimensional vectors. A cosine of $1.0$ means identical meaning; $0.0$ means completely unrelated.
- **MongoDB Atlas Vector Search**: Uses indexing algorithms (Hierarchical Navigable Small World / HNSW) to quickly find the top-$k$ nearest chunks among thousands of stored vectors.

---

## Module 6: Retrieval-Augmented Generation (RAG)

### 6.1 The RAG Architecture Pattern
1. **Index Phase (Offline/Upload time)**: Document $\rightarrow$ Clean Text $\rightarrow$ Chunks $\rightarrow$ Embeddings $\rightarrow$ Vector Database.
2. **Retrieve Phase (Query time)**: User Question $\rightarrow$ Embedding $\rightarrow$ Vector Search $\rightarrow$ Top-$k$ Relevant Chunks.
3. **Augment & Generate Phase**: Combine System Prompt + Top-$k$ Chunks + User Question $\rightarrow$ Send to LLM $\rightarrow$ Return Grounded Answer with Page Numbers.

---

## Module 7: OpenAI Function Calling

### 7.1 What is Function Calling?
- LLMs cannot natively query databases or check the current time.
- Function Calling allows developers to describe backend functions to OpenAI using JSON Schema.
- When the user asks a question requiring data, the model returns a structured JSON request telling the backend: *"Please run `getUserDocumentCount()` with these arguments."*
- The backend executes the function, verifies user authorization, and feeds the result back to the model to synthesize into an answer.

### 7.2 Safety & Whitelisting
- The AI never executes database queries directly.
- The backend acts as a strict firewall, accepting only registered, predefined, read-only tools.

---

## Module 8: Basic AI Agents

### 8.1 The Agentic Reasoning Loop (ReAct)
- An AI Agent is an LLM given the autonomy to:
  1. **Reason**: Understand what the user wants.
  2. **Act**: Choose an appropriate tool (e.g., search document vectors vs query user metadata).
  3. **Observe**: Read the tool's output.
  4. **Synthesize**: Produce the final response.

---

## Module 9: Testing, Security & Deployment

### 9.1 API Testing & Validation
- Testing protected endpoints using Postman environment variables for JWT.
- Schema validation with libraries like Zod or Joi to reject malformed inputs before reaching database logic.

### 9.2 Production Security Hardening
- Rate limiting (`express-rate-limit`) to prevent API abuse and denial-of-service.
- Security HTTP headers (`helmet`).
- Environment variable separation: keeping dev and production configurations strictly isolated.

