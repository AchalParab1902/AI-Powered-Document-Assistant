# 04 - Database Design

## 1. Database Overview
The application uses **MongoDB** as its primary document store, alongside **MongoDB Atlas Vector Search** for storing and querying high-dimensional vector embeddings.

MongoDB is chosen because:
- Document chunking and chat histories are inherently document-oriented and benefit from JSON/BSON structures.
- Storing vector embeddings directly inside the same database engine eliminates the complexity and cost of maintaining a separate standalone vector database (such as Pinecone or Milvus).
- Mongoose provides strict schema validation and relationship population in Node.js.

---

## 2. Entity-Relationship Overview

```
       +-----------------------+
       |         Users         |
       +-----------------------+
        │ 1                  1 │
        │                      │
        │ *                  * │
+-------▼---------+   +--------▼--------+
|    Documents    |   |  ChatSessions   |
+-----------------+   +-----------------+
        │ 1                    │ 1
        │                      │
        │ *                    │ *
+-------▼---------+   +--------▼--------+
| DocumentChunks  |   |  ChatMessages   |
+-----------------+   +-----------------+
```

- **User $\rightarrow$ Documents**: One-to-Many (`userId` foreign reference). One user can upload multiple PDFs.
- **Document $\rightarrow$ DocumentChunks**: One-to-Many (`documentId` foreign reference). One PDF yields many chunk segments.
- **User $\rightarrow$ ChatSessions**: One-to-Many (`userId` foreign reference). One user can create multiple chat threads.
- **ChatSession $\rightarrow$ ChatMessages**: One-to-Many (`sessionId` foreign reference). One session contains multiple question/answer turns.
- **ChatMessages $\rightarrow$ Source References**: Embedded array referencing document IDs, titles, and page numbers.

---

## 3. Detailed Collection Schemas

### 3.1 `Users` Collection
Stores user account credentials and profile metadata.

| Field Name | Type | Constraints / Validation | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated Primary Key | Unique user identifier |
| `name` | String | Required, trimmed, max 60 chars | User's full name |
| `email` | String | Required, unique, lowercase, trimmed, valid email regex | User's unique login email |
| `passwordHash` | String | Required | Salted bcrypt hash of user's password |
| `createdAt` | Date | Default `Date.now` | Account creation timestamp |
| `updatedAt` | Date | Default `Date.now` | Profile last update timestamp |

**Indexes**:
- Unique index on `email`: `{ email: 1 }, { unique: true }`

---

### 3.2 `Documents` Collection
Stores uploaded PDF file metadata and processing state.

| Field Name | Type | Constraints / Validation | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated Primary Key | Unique document identifier |
| `userId` | ObjectId | Required, ref: `'User'` | Reference to document owner |
| `originalName` | String | Required, trimmed | Original filename of the uploaded PDF |
| `storedFileReference`| String | Required | Secure local storage path or file reference |
| `size` | Number | Required, in bytes | File size on disk |
| `mimeType` | String | Required, enum: `['application/pdf']`| MIME type validation |
| `status` | String | Required, enum: `['Processing', 'Ready', 'Failed']`, default: `'Processing'` | Ingestion pipeline state |
| `errorMessage` | String | Optional, default null | Human-readable explanation if status is `Failed` |
| `pageCount` | Number | Optional | Total number of pages extracted |
| `createdAt` | Date | Default `Date.now` | Upload timestamp |
| `updatedAt` | Date | Default `Date.now` | Last status update timestamp |

**Indexes**:
- Compound index on `userId` and `createdAt`: `{ userId: 1, createdAt: -1 }` (for fast dashboard listing).

---

### 3.3 `DocumentChunks` Collection
Stores chunked text segments alongside their high-dimensional vector embeddings for RAG retrieval.

| Field Name | Type | Constraints / Validation | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated Primary Key | Unique chunk identifier |
| `documentId` | ObjectId | Required, ref: `'Document'` | Parent document reference |
| `userId` | ObjectId | Required, ref: `'User'` | Owner reference for multi-tenant security filtering |
| `chunkText` | String | Required | The raw text slice from the PDF |
| `chunkIndex` | Number | Required | Sequential index (0, 1, 2, ...) within the document |
| `pageNumber` | Number | Optional | The PDF page where this text originated |
| `embedding` | Array of Number | Required, length: 1536 | Vector output from `text-embedding-3-small` |
| `createdAt` | Date | Default `Date.now` | Ingestion timestamp |

**Indexes**:
- Regular index on `{ documentId: 1 }` (for quick deletion when parent document is deleted).
- Compound index on `{ userId: 1, documentId: 1 }`.
- **Atlas Vector Search Index**:
  - Index Name: `vector_index`
  - Field: `embedding`
  - Dimensions: `1536`
  - Similarity: `cosine`
  - Filter field: `userId` (ensures user isolation at the index level).

---

### 3.4 `ChatSessions` Collection
Maintains multi-turn conversation threads.

| Field Name | Type | Constraints / Validation | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated Primary Key | Unique session identifier |
| `userId` | ObjectId | Required, ref: `'User'` | Conversation owner reference |
| `title` | String | Required, default `'New Conversation'` | Human-readable chat title |
| `relatedDocumentIds`| Array of ObjectId | Ref: `'Document'` | Documents attached to this chat thread |
| `createdAt` | Date | Default `Date.now` | Session start timestamp |
| `updatedAt` | Date | Default `Date.now` | Last message timestamp |

**Indexes**:
- Compound index on `{ userId: 1, updatedAt: -1 }` (for displaying recent chats first).

---

### 3.5 `ChatMessages` Collection
Stores individual turns within a chat session.

| Field Name | Type | Constraints / Validation | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated Primary Key | Unique message identifier |
| `sessionId` | ObjectId | Required, ref: `'ChatSession'` | Parent chat session reference |
| `userId` | ObjectId | Required, ref: `'User'` | Message author / recipient reference |
| `role` | String | Required, enum: `['user', 'assistant', 'system']` | Author role in conversation |
| `content` | String | Required | The actual text of the question or response |
| `sourceReferences` | Array of Object | Optional | Chunks/pages used to generate assistant response |
| `createdAt` | Date | Default `Date.now` | Message timestamp |

#### Subdocument Schema: `sourceReferences`
```json
[
  {
    "documentId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "documentName": "Financial_Report_Q3.pdf",
    "pageNumber": 14,
    "chunkSnippet": "Total net income grew by 18% year-over-year..."
  }
]
```

**Indexes**:
- Index on `{ sessionId: 1, createdAt: 1 }` (for rapid chronological message loading).

---

## 4. Multi-Tenant Security & Cascading Delete Rules

### 4.1 Strict Query Scoping
To prevent unauthorized access across users:
- Every query on `Documents`, `DocumentChunks`, `ChatSessions`, and `ChatMessages` **must** include `{ userId: req.user._id }`.
- Even when querying by `_id`, query as:
  ```javascript
  const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
  ```

### 4.2 Cascading Document Deletion (FR-18)
When a user deletes a document:
1. Delete the physical PDF file from storage.
2. Delete the record from `Documents` collection.
3. Delete all associated chunks from `DocumentChunks` where `documentId` matches.
4. Remove `documentId` from `relatedDocumentIds` in `ChatSessions`.

