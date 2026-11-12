Software Requirements Specification (SRS)
Project: AI-Powered Document Assistant (Chat with PDF)
Version 1.0 | Date: 12 November 2026
1. Project Introduction
1.1 Project Overview
The AI-Powered Document Assistant is a web application that allows users to upload PDF documents and ask questions about their content using AI.

Instead of manually reading lengthy documents, users can ask questions in normal language and receive answers based on the uploaded document.

The application will use Retrieval-Augmented Generation (RAG) to find relevant information from PDFs and generate accurate, context-based answers.
1.2 Project Objectives
- Allow users to register and log in securely.
- Allow users to upload and manage PDF documents.
- Extract and process text from uploaded PDFs.
- Allow users to ask questions about their documents.
- Generate answers using OpenAI API.
- Use embeddings and vector search to find relevant content.
- Display relevant document sources with AI answers.
- Maintain chat history.
- Understand practical AI concepts such as Prompt Engineering, RAG, Function Calling and AI Agents.

2. Project Scope
2.1 Features Included in Version 1
1. User Registration and Login
2. JWT Authentication
3. PDF Upload
4. PDF Text Extraction
5. Text Chunking
6. Embedding Generation
7. Vector Search
8. AI-Powered Question Answering
9. Chat History
10. Function Calling
11. Basic AI Agent
12. Error Handling and Validation
2.2 Features Not Included in Version 1
- Editing PDF documents.
- Generating or downloading modified PDFs.
- Scanned PDF OCR support.
- Uploading Word, Excel or image files.
- Sharing documents with other users.
- Team collaboration.
- Payment integration.
- Unrestricted autonomous AI actions.
These features can be considered for future versions.

3. User Roles and Permissions
The first version will have only one user role.
Role	Permissions
Registered User	Upload PDFs, view own documents, ask questions, view chat history and delete own documents.

Important: Each user must only access their own documents and chat history. One user must never access another user's information.

An admin dashboard is not required in Version 1.

4. Functional Requirements
4.1 User Authentication
FR-01: User Registration
- Users can register using name, email and password.
- Validate all required fields.
- Email address must be unique.
- Password must be securely hashed before storing in MongoDB.
FR-02: User Login
- Users can log in using email and password.
- Verify credentials.
- Generate a JWT token after successful login.
FR-03: User Logout
- Users can log out.
- Clear the authentication token from the client session.
FR-04: Protected Routes
- Only authenticated users can access protected APIs.
- Reject requests with missing, invalid or expired JWT tokens.
4.2 PDF Document Management
FR-05: PDF Upload
- Users can upload PDF documents.
- Validate file type and file size.
- Reject unsupported or invalid files.
FR-06: Document Ownership
- Each uploaded document must be associated with the logged-in user.
- Users can only view and manage their own documents.
FR-07: PDF Text Extraction
- Extract readable text from uploaded PDFs.
- Display an understandable error if the PDF does not contain extractable text.
- Scanned PDF OCR support is outside Version 1.
FR-08: Text Chunking
- Divide extracted text into smaller chunks.
- Store chunk information with document ID and relevant page information.
- Use chunking to improve search accuracy.
FR-09: Embedding Generation
- Generate embeddings for each text chunk using an embedding model.
- Embeddings represent the meaning of text in numerical form.
FR-10: Vector Storage
- Store embeddings and related document information.
- Use MongoDB Atlas Vector Search to retrieve relevant content.
4.3 AI Question and Answer System
FR-11: Ask Questions
- Users can ask questions about their uploaded documents.
- Questions should be written in normal language.
FR-12: Relevant Information Retrieval
- Convert the user's question into an embedding.
- Search for relevant document chunks using vector search.
- Retrieve only content from documents the user is authorized to access.
FR-13: AI Answer Generation
- Send the user's question and retrieved document content to OpenAI API.
- Generate an answer based on the provided context.
FR-14: Context-Based Answers
- AI should answer using the retrieved document content.
- If the answer is not available in the document, AI should clearly say that the information was not found.
- Avoid making up information.
FR-15: Source References
- Display relevant source information with the answer.
- Show document name and page number when available.
4.4 Chat History
FR-16: Save Conversations
- Save user questions and AI responses in MongoDB.
- Associate each conversation with the logged-in user.
FR-17: View Chat History
- Users can view their previous conversations.
- Users can reopen an existing conversation.
FR-18: Delete Documents
- Users can delete their own documents.
- Related chunks and embeddings must also be deleted or made inaccessible according to the retention policy.
4.5 Function Calling
FR-19: AI Function Calling

The application should support AI Function Calling.

Example functions:
- Get the current user's total document count.
- Get the current user's uploaded document list.
- Search the user's documents.
The AI model can request a function, but the backend must validate and execute it.

FR-20: Secure Function Execution
- Only predefined backend functions can be executed.
- Validate function arguments.
- Check user authentication and authorization before execution.
- The AI model must not directly access MongoDB.
4.6 Basic AI Agent
FR-21: Controlled AI Agent

Implement a basic AI Agent that can:
1. Understand the user's request.
2. Decide which approved tool is required.
3. Request execution of that tool.
4. Receive the tool result.
5. Generate a final response.
Example:

User: "How many documents have I uploaded?"

The AI Agent requests the document-count function. The backend checks the logged-in user and returns the count. The AI then presents the result.

The agent must only use predefined, read-only tools in Version 1.
4.7 Error Handling
FR-22: Error Messages

Display understandable error messages for:
- Invalid PDF files.
- File size limit exceeded.
- PDF text extraction failure.
- AI API errors.
- Network errors.
- Authentication failures.
- Document processing failures.

5. Main Application Workflows
5.1 User Registration and Login
1. User opens the application.
2. User registers with name, email and password.
3. Backend validates the information.
4. Password is hashed and saved in MongoDB.
5. User logs in.
6. Backend verifies credentials and returns a JWT.
7. User can access the dashboard.
5.2 PDF Upload and Processing

User selects a PDF
       |
       v
Frontend sends PDF to Backend
       |
       v
Backend validates file
       |
       v
Save PDF securely
       |
       v
Extract PDF text
       |
       v
Split text into chunks
       |
       v
Generate embeddings
       |
       v
Store chunks and embeddings
       |
       v
Document status = Ready



If processing fails, update the document status to Failed and show an understandable error.
5.3 Chat with PDF (RAG Workflow)

User asks a question
       |
       v
Backend receives question
       |
       v
Generate question embedding
       |
       v
Search relevant document chunks
       |
       v
Retrieve matching content
       |
       v
Send question + context to OpenAI
       |
       v
Generate AI answer
       |
       v
Display answer + source references
       |
       v
Save conversation in MongoDB



5.4 Function Calling Workflow
1. User asks a question that requires application data.
2. AI identifies the required function.
3. AI requests the function call.
4. Backend validates the request.
5. Backend executes the approved function.
6. Backend returns the result to AI.
7. AI generates a response for the user.

6. Non-Functional Requirements
6.1 Security
- Passwords must be hashed.
- JWT authentication must protect private APIs.
- API keys must be stored in backend environment variables.
- Never expose API keys in frontend code.
- Never commit .env files to GitHub.
- Verify document ownership in every relevant API.
6.2 Privacy
- Users must not access other users' documents or chats.
- Uploaded documents must be stored securely.
- Explain that document content may be sent to the configured AI provider for processing.
6.3 Performance
- Show loading indicators during PDF processing and AI responses.
- Avoid blocking the application during large document processing.
- Use pagination when displaying large document or chat lists.
6.4 Reliability
- Handle API failures properly.
- Do not lose existing chat history when an AI request fails.
- Maintain document processing status.
6.5 Maintainability
- Use a modular backend structure.
- Keep authentication, document processing, AI and chat logic separate.
- Write reusable frontend components.
- Use clear naming conventions.
6.6 Scalability
- Keep document processing independent from the main request flow.
- Consider background jobs when processing volume increases.
- Keep AI provider integration modular so another provider can be added later.

7. Technology Stack
Area	Technology
Frontend	React.js
Backend	Node.js
Backend Framework	Express.js
Database	MongoDB
Authentication	JWT
Password Security	bcrypt
AI Provider	OpenAI API
Embeddings	OpenAI Embedding Model
Vector Search	MongoDB Atlas Vector Search
PDF Processing	Node.js PDF text extraction library
API Testing	Postman
Version Control	Git and GitHub
Code Editor	VS Code

Note: We will use OpenAI API initially. The application structure should allow adding Claude API in the future without rewriting the entire AI integration.

8. Database Design (Initial Proposal)
The following collections are proposed. Final fields and relationships will be decided during implementation.
8.1 Users Collection
Field	Description
_id	Unique user ID
name	User name
email	User email
passwordHash	Hashed password
createdAt	Registration date
updatedAt	Last update date

8.2 Documents Collection
Field	Description
_id	Unique document ID
userId	Document owner
originalName	Uploaded PDF name
storedFileReference	Secure file location/reference
size	File size
mimeType	File type
status	Processing / Ready / Failed
createdAt	Upload date

8.3 DocumentChunks Collection
Field	Description
_id	Unique chunk ID
documentId	Related document ID
userId	Document owner
chunkText	Extracted text
chunkIndex	Chunk sequence
pageNumber	PDF page number, if available
embedding	Vector representation

8.4 ChatSessions Collection
Field	Description
_id	Unique session ID
userId	Session owner
title	Conversation title
relatedDocumentIds	Related PDF documents
createdAt	Creation date
updatedAt	Last activity

8.5 ChatMessages Collection
Field	Description
_id	Unique message ID
sessionId	Related chat session
userId	Message owner
role	User / Assistant
content	Message text
sourceReferences	Retrieved document references
createdAt	Message date


9. Frontend Pages
9.1 Registration Page
- Name
- Email
- Password
- Confirm Password
- Register button
- Login link
9.2 Login Page
- Email
- Password
- Login button
- Register link
9.3 Dashboard
- Welcome message
- Upload PDF button
- Uploaded document list
- Document processing status
- Delete document option
9.4 Document Chat Page
- Selected document name
- Chat message area
- Question input
- Send button
- AI response
- Source references
- Loading indicator
9.5 Chat History Page
- Previous conversations
- Conversation title
- Last updated date
- Open conversation option
9.6 Account Section
- User information
- Logout option

10. Acceptance Criteria
The project will be considered functionally complete when:
1. Users can register and log in successfully.
2. Protected APIs reject unauthorized requests.
3. Users can upload valid PDF documents.
4. PDF text is extracted and processed successfully.
5. Document processing status is displayed.
6. Users can ask questions about their documents.
7. AI answers are based on retrieved document content.
8. AI clearly indicates when information is not available.
9. Relevant source references are displayed when available.
10. Chat history is saved and accessible.
11. Users cannot access another user's documents or chats.
12. Function Calling works through approved backend functions.
13. The basic AI Agent can select and use approved tools.
14. Application errors are handled properly.

11. Development Roadmap
We will develop this project in small phases. Each phase will be completed, tested and understood before starting the next phase.
Phase	Development Task
1	Requirements and project planning
2	GitHub repository and project setup
3	React frontend foundation
4	Node.js and Express backend foundation
5	MongoDB connection and models
6	User registration, login and JWT
7	PDF upload and validation
8	PDF text extraction
9	OpenAI API integration
10	Basic AI chatbot
11	Text chunking and embeddings
12	RAG and vector search
13	Chat history
14	Function Calling
15	Basic AI Agent
16	Testing, security and deployment