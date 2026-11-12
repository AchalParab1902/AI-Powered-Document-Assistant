# 05 - API Documentation

## 1. General API Conventions
- **Base URL**: `http://localhost:5000/api`
- **Data Format**: `application/json` (except file uploads, which use `multipart/form-data`)
- **Authentication**: JWT sent via the standard HTTP header:  
  `Authorization: Bearer <token>`
- **Standard Success Response Format**:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {}
  }
  ```
- **Standard Error Response Format**:
  ```json
  {
    "success": false,
    "message": "Human-readable error description",
    "error": null
  }
  ```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth Required**: No (Public)
- **Purpose**: Creates a new user account with hashed password.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "654c1a2b3c4d5e6f7a8b9c0d",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

### 2.2 Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth Required**: No (Public)
- **Purpose**: Verifies email and password; returns JWT token on success.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "654c1a2b3c4d5e6f7a8b9c0d",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

### 2.3 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Validates active session and retrieves logged-in user profile.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "654c1a2b3c4d5e6f7a8b9c0d",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-11-12T10:00:00.000Z"
      }
    }
  }
  ```

---

## 3. Document Management Endpoints (`/api/documents`)

### 3.1 Upload PDF Document
- **Method**: `POST`
- **Path**: `/api/documents/upload`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Purpose**: Uploads a PDF, validates size/type, initializes document record, and triggers extraction & embedding pipeline.
- **Form Data Field**: `file` (Binary PDF file)
- **Response** (`202 Accepted` or `201 Created`):
  ```json
  {
    "success": true,
    "message": "File uploaded and processing initiated",
    "data": {
      "document": {
        "id": "654c2d3e4f5a6b7c8d9e0f1a",
        "originalName": "Contract_Agreement.pdf",
        "size": 245120,
        "status": "Processing",
        "createdAt": "2026-11-12T10:15:00.000Z"
      }
    }
  }
  ```

### 3.2 List User Documents
- **Method**: `GET`
- **Path**: `/api/documents`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Retrieves all documents uploaded by the authenticated user.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "documents": [
        {
          "id": "654c2d3e4f5a6b7c8d9e0f1a",
          "originalName": "Contract_Agreement.pdf",
          "size": 245120,
          "status": "Ready",
          "createdAt": "2026-11-12T10:15:00.000Z"
        }
      ]
    }
  }
  ```

### 3.3 Get Document Status
- **Method**: `GET`
- **Path**: `/api/documents/:id/status`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Polls ingestion pipeline status (`Processing`, `Ready`, `Failed`).
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "654c2d3e4f5a6b7c8d9e0f1a",
      "status": "Ready",
      "errorMessage": null
    }
  }
  ```

### 3.4 Delete Document
- **Method**: `DELETE`
- **Path**: `/api/documents/:id`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Deletes document file, record, and all associated text chunks/embeddings.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Document and associated embeddings deleted successfully"
  }
  ```

---

## 4. Chat & RAG Endpoints (`/api/chat`)

### 4.1 Create Chat Session
- **Method**: `POST`
- **Path**: `/api/chat/sessions`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Starts a new chat session attached to one or more documents.
- **Request Body**:
  ```json
  {
    "title": "Contract Review",
    "documentId": "654c2d3e4f5a6b7c8d9e0f1a"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "session": {
        "id": "654c3e4f5a6b7c8d9e0f1a2b",
        "title": "Contract Review",
        "relatedDocumentIds": ["654c2d3e4f5a6b7c8d9e0f1a"],
        "createdAt": "2026-11-12T10:30:00.000Z"
      }
    }
  }
  ```

### 4.2 List Chat Sessions
- **Method**: `GET`
- **Path**: `/api/chat/sessions`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Retrieves all past conversations for the authenticated user.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "sessions": [
        {
          "id": "654c3e4f5a6b7c8d9e0f1a2b",
          "title": "Contract Review",
          "updatedAt": "2026-11-12T10:32:00.000Z"
        }
      ]
    }
  }
  ```

### 4.3 Get Session Messages (History)
- **Method**: `GET`
- **Path**: `/api/chat/sessions/:sessionId/messages`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Retrieves full conversation transcript for a session.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "messages": [
        {
          "id": "654c4f5a6b7c8d9e0f1a2b3c",
          "role": "user",
          "content": "What is the notice period for contract termination?",
          "createdAt": "2026-11-12T10:31:00.000Z"
        },
        {
          "id": "654c4f5a6b7c8d9e0f1a2b3d",
          "role": "assistant",
          "content": "According to Section 8.2 of the agreement, either party may terminate by providing a written notice of at least 30 days.",
          "sourceReferences": [
            {
              "documentName": "Contract_Agreement.pdf",
              "pageNumber": 7,
              "chunkSnippet": "Either party may terminate this agreement with 30 days prior written notice..."
            }
          ],
          "createdAt": "2026-11-12T10:31:03.000Z"
        }
      ]
    }
  }
  ```

### 4.4 Send Message / Ask Document Question (RAG)
- **Method**: `POST`
- **Path**: `/api/chat/sessions/:sessionId/messages`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Processes user query through the RAG pipeline (embed query $\rightarrow$ vector search $\rightarrow$ prompt context $\rightarrow$ OpenAI generation $\rightarrow$ save both messages).
- **Request Body**:
  ```json
  {
    "content": "What is the notice period for contract termination?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "userMessage": {
        "id": "654c4f5a6b7c8d9e0f1a2b3c",
        "role": "user",
        "content": "What is the notice period for contract termination?"
      },
      "assistantMessage": {
        "id": "654c4f5a6b7c8d9e0f1a2b3d",
        "role": "assistant",
        "content": "According to Section 8.2 of the agreement, either party may terminate by providing a written notice of at least 30 days.",
        "sourceReferences": [
          {
            "documentName": "Contract_Agreement.pdf",
            "pageNumber": 7,
            "chunkSnippet": "Either party may terminate this agreement with 30 days prior written notice..."
          }
        ]
      }
    }
  }
  ```

---

## 5. AI Agent & Function Calling Endpoints (`/api/agent`)

### 5.1 Agent Chat Query
- **Method**: `POST`
- **Path**: `/api/agent/chat`
- **Auth Required**: Yes (`Bearer <token>`)
- **Purpose**: Routes user query through the controlled AI Agent, allowing the model to decide whether to answer directly, run vector search, or invoke backend tools (`getUserDocumentCount`, `getUserDocumentList`).
- **Request Body**:
  ```json
  {
    "message": "How many documents do I have in my account?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "role": "assistant",
      "content": "You currently have 3 documents uploaded in your account.",
      "toolUsed": "getUserDocumentCount"
    }
  }
  ```

