# 06 - Git & GitHub Workflow

## 1. Git Philosophy & Core Principles
In professional software development, version control is more than a backup tool—it is a timeline of intent, quality assurance, and code stability.

For this project, we follow five non-negotiable rules:
1. **`main` is always production-ready and stable**: Code merged to `main` must compile, run without syntax errors, and pass all manual checks.
2. **Never code directly on `main`**: All work occurs on dedicated feature branches.
3. **Small, Atomic Commits**: Make commits after completing each logical subtask rather than dumping an entire phase into one massive commit.
4. **Zero Secrets in Git**: `.env` files, API keys, passwords, and user-uploaded PDF binaries must never enter Git history.
5. **No Automatic Commits or Pushes**: Every commit, push, or merge is reviewed and explicitly confirmed before execution.

---

## 2. Branching Strategy

```
(main) ───●────────────────────────────────────────●───────────────●─── (main: always stable)
           \                                      /               /
            ●─────●── (feat/project-setup) ──────/               /
                   \                                            /
                    ●─────●── (feat/user-authentication) ──────/
```

- **`main`**: The primary production-quality branch.
- **`feat/<feature-name>`**: Used for introducing new features or completing specific roadmap phases.
- **`fix/<bug-name>`**: Used for debugging and resolving issues identified during testing.
- **`docs/<doc-topic>`**: Used for documentation additions or architectural updates.
- **`refactor/<module-name>`**: Used for code clean-up or modular restructuring without altering functionality.

---

## 3. Branch Naming Conventions
Branch names must be lowercase, hyphen-separated, and prefixed with their purpose:

| Phase | Recommended Branch Name | Scope / Focus |
| :--- | :--- | :--- |
| Phase 2 | `feat/project-setup` | Directory structure, root `.gitignore`, initial configs |
| Phase 3 | `feat/frontend-foundation` | React + Vite setup, basic layout, router |
| Phase 4 | `feat/backend-foundation` | Express skeleton, health endpoint, error middleware |
| Phase 5 | `feat/mongodb-models` | Mongoose connection and 5 collection schemas |
| Phase 6 | `feat/user-authentication` | Registration, login, JWT middleware, auth UI |
| Phase 7 | `feat/pdf-upload` | Multer integration, upload endpoint, document list |
| Phase 8 | `feat/pdf-text-extraction` | PDF text parser service, extraction error handling |
| Phase 9 | `feat/openai-integration` | OpenAI SDK configuration, test endpoint |
| Phase 10| `feat/basic-chatbot` | Interactive chat UI, simple completion route |
| Phase 11| `feat/chunking-embeddings` | Text chunking service, batch embedding generation |
| Phase 12| `feat/rag-vector-search` | Atlas Vector Search integration, RAG prompt, citations |
| Phase 13| `feat/chat-history` | Session management, conversation history persistence |
| Phase 14| `feat/function-calling` | OpenAI tool definitions, backend function runner |
| Phase 15| `feat/basic-ai-agent` | Single-turn agent loop, intelligent tool selection |
| Phase 16| `feat/security-and-deployment` | Rate limiting, validation, production build |

---

## 4. Commit Message Conventions (Conventional Commits)
All commit messages must follow the standard **Conventional Commits** format:

```
<type>(<scope>): <short description in present tense>

[optional body explaining why this change was made]
```

### 4.1 Commit Types
- `feat`: A new feature for the user or system (e.g., `feat(auth): add JWT login endpoint`).
- `fix`: A bug fix (e.g., `fix(pdf): handle zero-byte upload error`).
- `docs`: Documentation changes only (e.g., `docs(api): document RAG endpoints`).
- `refactor`: Code change that neither fixes a bug nor adds a feature (e.g., `refactor(chat): extract prompt builder service`).
- `style`: Formatting, missing semicolons, white space (no logic change).
- `test`: Adding or updating test scripts.
- `chore`: Updating build tasks, package dependencies, `.gitignore`.

### 4.2 Good vs Bad Commit Messages
- ❌ `Bad: "done with backend"`
- ✅ `Good: "feat(backend): implement Express server with health check route"`
- ❌ `Bad: "fixed bug"`
- ✅ `Good: "fix(auth): correct JWT expiration check in authMiddleware"`
- ❌ `Bad: "added stuff to chat"`
- ✅ `Good: "feat(chat): render source citation pills with page numbers"`

---

## 5. Step-by-Step Development & Git Lifecycle

Whenever we work on a task, we will follow this exact 7-step discipline:

```
Step 1: Inspect Status (`git status`, verify clean tree)
                     │
Step 2: Create / Switch Branch (`git checkout -b feat/...`)
                     │
Step 3: Implement Task Increment (code one specific feature)
                     │
Step 4: Test & Verify (run code, test API / UI)
                     │
Step 5: Code Review & Git Diff Check (`git diff`, inspect changes)
                     │
Step 6: Mentor Review & User Approval
                     │
Step 7: Commit (`git add <files>`, `git commit -m "..."`)
```

### Detailed Lifecycle Steps:
1. **Check Status**: Always begin by running `git status` to ensure no unexpected files are dirty.
2. **Branch Creation**: Create a branch off the latest stable `main`:
   ```bash
   git checkout main
   git checkout -b feat/<task-name>
   ```
3. **Write Focused Code**: Implement strictly the files required for the current task. Do not make unrelated changes.
4. **Test Thoroughly**: Test the feature locally using Postman, the browser, or automated scripts.
5. **Sanity Check Before Staging**:
   - Check `git status` to make sure `.env`, credentials, or temporary test files are NOT listed.
   - Run `git diff` to review your own changes line by line.
6. **Formulate Commit**: Stage specifically modified files (avoid indiscriminate `git add .` if untracked junk files exist):
   ```bash
   git add <specific-file>
   git commit -m "feat(scope): concise description"
   ```
7. **Merge to Main**: Once the phase is 100% verified and approved, switch back to `main` and merge:
   ```bash
   git checkout main
   git merge feat/<task-name>
   ```

---

## 6. Security & Safety Checklist Before Every Commit
Before suggesting or executing any commit, we will run through this checklist:
- [ ] Are any `.env` or configuration files with real secrets tracked?
- [ ] Are any large binaries or user-uploaded PDFs staged?
- [ ] Is `node_modules` completely excluded?
- [ ] Does the code run without compiler or runtime crashes?
- [ ] Has the user reviewed and confirmed the proposed commit message?

