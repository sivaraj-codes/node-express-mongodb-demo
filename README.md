# Express Project Architecture — Mental Model & Reference

> How to think about this structure, remember it, and apply it every time you start a new Express project.

---

## The One-Line Summary

> **Each layer has one job. No layer skips another. Data flows down, responses flow up.**

---

## The Folder Structure

```
express-demo/
├── server.js                        ← Ignition key (boot sequence)
├── .env                             ← Environment config (never commit)
├── src/
│   ├── app.js                       ← Express app config (middleware + routes)
│   ├── config/
│   │   └── db.js                    ← MongoDB connection singleton
│   ├── constants/
│   │   ├── httpStatus.js            ← HTTP status codes (no magic numbers)
│   │   └── dbCollections.js         ← Collection name strings
│   ├── features/
│   │   └── users/                   ← One folder per domain/resource
│   │       ├── user.route.js        ← URL definitions
│   │       ├── user.controller.js   ← HTTP in → function call → HTTP out
│   │       ├── user.service.js      ← Business rules & validation
│   │       └── user.repository.js   ← DB queries only
│   └── shared/
│       ├── errors/
│       │   └── AppError.js          ← Custom error class
│       ├── middlewares/
│       │   └── errorHandler.js      ← Global error middleware
│       └── utils/
│           └── handlers.js          ← sendSuccess / sendError helpers
```

---

## The Architecture Diagram

```
 REQUEST
    │
    ▼
┌─────────────┐
│  server.js  │  Boot only — DB first, then listen
└──────┬──────┘
       │
    ┌──▼──────────────────────────────┐
    │           src/app.js            │  Middleware + route mounting
    └──┬──────────────────────────────┘
       │
    ┌──▼──────────────────────────────┐
    │        user.route.js            │  Which URLs exist, which handler
    └──┬──────────────────────────────┘
       │
    ┌──▼──────────────────────────────┐
    │      user.controller.js         │  Parse req → call service → send res
    └──┬──────────────────────────────┘
       │
    ┌──▼──────────────────────────────┐
    │       user.service.js           │  Validate + business logic
    └──┬──────────────────────────────┘
       │
    ┌──▼──────────────────────────────┐
    │      user.repository.js         │  DB queries only (findOne, insertOne…)
    └──┬──────────────────────────────┘
       │
    ┌──▼──────────────────────────────┐
    │         config/db.js            │  MongoDB connection singleton
    └─────────────────────────────────┘
       │
    MongoDB


  Shared (used across layers):
  ┌─────────────┐   ┌───────────────┐   ┌─────────────────┐
  │  AppError   │   │ errorHandler  │   │ sendSuccess /   │
  │  (throw it) │   │ (catch all)   │   │ sendError utils │
  └─────────────┘   └───────────────┘   └─────────────────┘
```

---

## Each Layer — One Job Only

### `server.js` — The Ignition Key
**Job:** Boot in the right order. Nothing else.

```
DB connect → app.listen → crash loudly if either fails
```

- Imports the configured `app` — does NOT configure it
- `await connectDB()` must come before `app.listen()`
- `process.exit(1)` on failure so Docker/PM2 knows to restart
- Does not import routes, controllers, or services

**Memory hook:** *"Start the car, don't build it."*

---

### `src/app.js` — The Express Configuration
**Job:** Set up the Express instance. Mount middleware and routes.

```
create app → apply middleware → mount routes → attach error handler → export
```

- JSON parsing, CORS go here
- Routes are mounted with a base path: `app.use("/users", userRoutes)`
- Error handler middleware always goes **last** (4 params: `err, req, res, next`)
- No business logic. No DB calls. No imports from `features/`

**Memory hook:** *"The blueprint of the app, not the behaviour."*

---

### `user.route.js` — The URL Map
**Job:** Define which HTTP method + path maps to which controller function.

```
GET  /users        → userController.getUsers
POST /users        → userController.createUser
```

- Only `express.Router()` + route definitions
- No logic. No service calls. Just the mapping.
- Imported and mounted in `app.js`

**Memory hook:** *"The menu. Not the kitchen."*

---

### `user.controller.js` — The HTTP Translator
**Job:** Translate an HTTP request into a function call, then translate the result back into an HTTP response.

```
read from req → call service → send response (or next(error))
```

- Knows about `req`, `res`, `next` — HTTP concepts
- Does NOT know about MongoDB or business rules
- Always wraps in `try/catch` and calls `next(error)` on failure
- Uses `sendSuccess()` / `sendError()` for consistent response shape

**Memory hook:** *"Translator between HTTP world and JS world."*

---

### `user.service.js` — The Business Logic
**Job:** Own all rules about how the application behaves.

```
validate input → check business constraints → call repository → return result
```

- Does NOT know about `req` or `res` — pure JS functions
- Throws `AppError` when rules are violated (not `res.status(...)`)
- Orchestrates multiple repository calls if needed
- This is where "a user cannot register twice" lives — not in the controller, not in the repository

**Memory hook:** *"If a PM describes it, it lives here."*

---

### `user.repository.js` — The Data Access Layer
**Job:** Talk to the database. Nothing else.

```
getDB() → run query → return raw result
```

- Only MongoDB driver calls: `find`, `findOne`, `insertOne`, `updateOne`, `deleteOne`
- No validation, no business rules, no error classes
- Receives plain data, returns plain data
- If you swap MongoDB for PostgreSQL tomorrow, only this file changes

**Memory hook:** *"The only file that speaks MongoDB."*

---

### `config/db.js` — The Connection Singleton
**Job:** Create and reuse a single MongoDB connection.

```
if already connected → return existing client
else → connect → store → return
```

- `connectDB()` called once at startup in `server.js`
- `getDB()` called in every repository function
- Throws if `getDB()` is called before `connectDB()` — this is intentional

**Memory hook:** *"One connection, shared everywhere."*

---

### `shared/errors/AppError.js` — The Custom Error
**Job:** Carry a `statusCode` alongside the error message.

```js
throw new AppError("User not found", 404);
// ↑ service throws this
// ↓ errorHandler catches this
```

- Extends native `Error`
- `statusCode` is used by `errorHandler` to set the HTTP response status
- Never do `res.status(404).json(...)` inside a service — throw AppError instead

**Memory hook:** *"A smarter Error that knows its HTTP status."*

---

### `shared/middlewares/errorHandler.js` — The Safety Net
**Job:** Catch every unhandled error in the app and send a clean response.

```
err.statusCode || 500 → sendError(res, message, statusCode)
```

- Must be the **last** `app.use()` call in `app.js`
- Has 4 parameters — Express recognises this as an error handler
- Never throws. Always responds.
- In Express 5, async errors are caught automatically — no need for `try/catch` in every controller (though it's still good practice)

**Memory hook:** *"The last line of defence."*

---

### `constants/httpStatus.js` — No Magic Numbers
```js
// Bad
throw new AppError("Conflict", 409);

// Good
throw new AppError("Conflict", HTTP_STATUS.CONFLICT);
```

**Memory hook:** *"Names instead of numbers."*

---

### `constants/dbCollections.js` — Single Source of Truth
```js
// Bad — "users" repeated in 3 repository functions
db.collection("users")

// Good — change in one place
db.collection(DB_COLLECTIONS.USERS)
```

**Memory hook:** *"One place to rename a collection."*

---

## The Rules to Never Break

| Rule | Why |
|------|-----|
| Controller never calls `getDB()` directly | Repository is the only DB speaker |
| Service never touches `req` or `res` | Services are reusable outside HTTP (queues, cron jobs) |
| Repository never throws `AppError` | DB errors are raw, business errors are AppError |
| `errorHandler` always last in `app.js` | Express processes middleware in order |
| `connectDB()` always before `app.listen()` | No requests before DB is ready |
| Constants over magic numbers/strings | Searchable, renameable, self-documenting |

---

## How to Build a New Feature (Step-by-Step)

When adding a new resource (e.g. `products`), always build **bottom-up**:

```
1. repository   ← start here, closest to DB
2. service      ← add business rules on top
3. controller   ← wrap in HTTP
4. route        ← define the URL
5. app.js       ← mount the route
```

**Never start from the route and work down** — you'll end up writing placeholder logic and lose the layer boundaries.

---

## How to Debug a Bug (Layer-by-Layer Checklist)

```
Bug: POST /users returns 500

1. Check errorHandler log — what is err.message?
2. Check service — is the AppError thrown correctly?
3. Check repository — is the DB query right?
4. Check controller — is req.body parsed? Is next(error) called?
5. Check route — is POST mapped to the right controller function?
6. Check app.js — is the route mounted at the right path?
```

Work from the **error message outward**, not from the URL inward.

---

## Quick Mental Checklist Before Writing Any File

- **Route file:** Am I only defining URLs and handlers? No logic?
- **Controller:** Am I only reading `req`, calling a service, and sending `res`?
- **Service:** Am I only writing business rules? No `req`/`res`? No raw DB calls?
- **Repository:** Am I only writing DB queries? No business logic?
- **AppError:** Am I throwing this from service, not from repository or controller?
- **Constants:** Is this value used in more than one place? If yes, extract it.

---

*This architecture is called **layered architecture** (also known as N-tier). The same pattern applies whether you use MongoDB, PostgreSQL, or any other database. Only the repository changes — everything else stays the same.*
