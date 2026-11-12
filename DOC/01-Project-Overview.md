# 01 - Project Overview

## 1. Project Title
**AI-Powered Document Assistant (Chat with PDF)**  
*Software Requirements Specification (SRS) - Version 1.0*

---

## 2. Project Introduction
The **AI-Powered Document Assistant** is a full-stack web application built on the MERN stack (MongoDB, Express.js, React.js, Node.js) and integrated with the OpenAI API. 

In business, academic, and legal settings, users regularly face lengthy, complex PDF documents (such as contracts, research papers, compliance manuals, and financial reports). Reading and extracting specific answers manually is slow, error-prone, and inefficient. 

This application allows users to upload PDF documents and ask questions in natural language. Instead of passing massive documents directly to an AI (which quickly exceeds token limits and increases costs), the application uses **Retrieval-Augmented Generation (RAG)**. It extracts text, breaks it into semantic chunks, indexes it into a vector space, retrieves only the relevant sections for each user query, and generates accurate, cited answers.

---

## 3. Project Objectives
- **Secure Access**: Allow users to register, log in, and manage their sessions securely using JSON Web Tokens (JWT) and encrypted passwords (bcrypt).
- **Document Management**: Provide a clean interface to upload, view, track processing status, and delete PDF documents.
- **Text Extraction & Ingestion**: Reliably extract readable text from uploaded PDFs and split it into structured chunks.
- **Vector Search & Semantic Retrieval**: Convert document chunks into numerical embeddings and store them in MongoDB Atlas Vector Search for high-accuracy similarity matching.
- **Context-Grounded Answers**: Use the OpenAI API to answer user queries strictly based on retrieved document content, eliminating hallucinations.
- **Source Attribution**: Display source references (document name and page numbers) alongside AI answers so users can verify facts.
- **Chat History & Persistence**: Store conversations in MongoDB so users can revisit previous Q&A sessions.
- **Advanced AI Capabilities**:
  - **Function Calling**: Enable the AI to trigger approved backend functions (e.g., retrieve user document count, list documents).
  - **Basic AI Agent**: Enable a controlled agent loop that interprets intent, selects approved tools, and synthesizes answers.
- **Practical Learning**: Master real-world full-stack development, modern Git workflows, API security, and applied AI engineering.

---

## 4. Problem Statement
Traditional methods of searching documents rely on exact keyword matching (e.g., `Ctrl + F`), which fails when users ask conceptual or synonym-based questions (e.g., searching for *"remuneration"* when the document says *"salary"*). 

Furthermore, naive LLM integrations fail because:
1. **Context Window Limits**: Standard LLM prompts cannot fit 100-page documents.
2. **High Costs**: Feeding full documents into every prompt wastes tokens and money.
3. **Hallucinations**: Without strict context anchoring, LLMs generate convincing but false information.

This project solves these issues by combining MERN with a production-grade RAG pipeline and vector search.

---

## 5. Project Scope

### 5.1 Features Included in Version 1.0
1. **User Authentication**: Registration, Login, Logout, and JWT route protection.
2. **PDF Upload & Validation**: File size limits, MIME type verification, and secure storage reference.
3. **PDF Text Extraction**: Text extraction from readable PDFs with user-friendly error handling.
4. **Text Chunking**: Splitting extracted text into semantic segments with document and page metadata.
5. **Embedding Generation**: Converting text chunks into high-dimensional vectors via OpenAI Embedding models.
6. **Vector Search**: Indexing and querying embeddings using MongoDB Atlas Vector Search.
7. **AI Question Answering**: Context-grounded response generation via OpenAI Chat Completions.
8. **Source Citations**: Displaying document title and page references for retrieved chunks.
9. **Chat History**: Multi-session conversation storage and retrieval in MongoDB.
10. **Document Deletion & Cascade Clean-up**: Safe removal of files, chunks, embeddings, and chat references.
11. **OpenAI Function Calling**: Backend-validated execution of predefined read-only application tools.
12. **Basic Controlled AI Agent**: Single-turn agent workflow for tool selection and user response synthesis.
13. **Error Handling & Validation**: Centralized error responses, loading states, and input validation.

### 5.2 Features Explicitly Excluded from Version 1.0
- Editing or modifying PDF documents directly.
- Generating or exporting modified PDF files.
- Optical Character Recognition (OCR) for scanned images or non-text PDFs.
- Non-PDF file types (Word `.docx`, Excel `.xlsx`, Images `.png`/`.jpg`, etc.).
- Multi-user document sharing or workspace collaboration.
- Role-based admin dashboards or team permissions.
- Payment gateway integration or subscription billing.
- Unrestricted, autonomous AI actions with write permissions.

---

## 6. User Roles & Security Boundaries

### 6.1 Single Role: Registered User
Version 1.0 supports one authenticated role: **Registered User**.
- Users can upload, view, query, and delete **only their own** documents and chat history.
- **Strict Multi-Tenancy Boundary**: Every backend query for documents, chunks, or chats must explicitly include the authenticated user's ID (`userId`). Users cannot read or search other users' data under any circumstances.
- An administrative role is not required in Version 1.0.

---

## 7. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Single-page application, interactive UI, state management |
| **Backend** | Node.js + Express.js | REST API, business logic, file processing, AI orchestration |
| **Database** | MongoDB | Primary data store for Users, Documents, Chunks, and Chats |
| **Vector Search** | MongoDB Atlas Vector Search | High-dimensional vector indexing and cosine similarity search |
| **Authentication** | JWT (JSON Web Tokens) | Stateless authorization and protected API endpoints |
| **Password Security**| bcrypt | Salted password hashing before database storage |
| **AI Provider** | OpenAI API | Text embeddings (`text-embedding-3-small`) & chat completions (`gpt-4o-mini`) |
| **PDF Extraction** | Node.js PDF parsing library | Extracting raw text and page streams from PDF buffers |
| **File Handling** | Multer | Multipart/form-data middleware for handling file uploads |
| **API Testing** | Postman / Thunder Client | Manual verification of HTTP endpoints |
| **Version Control** | Git & GitHub | Modular branching, feature commits, and code review |

*Note: The AI integration layer will be built with modular adapters so alternative models (e.g., Anthropic Claude) can be integrated in future versions without rewriting the application core.*

