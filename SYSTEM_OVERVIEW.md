# BeGoodIt — System Overview for New Developers

A digital wardrobe application that lets users manage their closet, try on outfits virtually, and evaluate new purchases against their existing wardrobe — powered by Gemini AI and computer vision.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Tech Stack at a Glance](#2-tech-stack-at-a-glance)
3. [Authentication](#3-authentication)
4. [Database & TypeORM](#4-database--typeorm)
5. [Image Processing Pipeline](#5-image-processing-pipeline)
6. [AI Interface — Gemini](#6-ai-interface--gemini)
7. [Core Features & Processes](#7-core-features--processes)
8. [Client Architecture](#8-client-architecture)
9. [API Layer](#9-api-layer)
10. [Running the Project Locally](#10-running-the-project-locally)

---

## 1. High-Level Architecture

```
┌──────────────────────┐          ┌────────────────────────────────────┐
│   React Client       │◄────────►│   Express REST API (Node / TS)     │
│   (Vite + MUI)       │  HTTP    │   /api/*                           │
└──────────────────────┘          │                                    │
                                  │  ┌─────────────┐  ┌─────────────┐ │
                                  │  │  Services   │  │  Controllers│ │
                                  │  └──────┬──────┘  └──────┬──────┘ │
                                  │         │                │        │
                                  │  ┌──────▼──────────────────────┐  │
                                  │  │  AI Layer (Gemini API)       │  │
                                  │  │  - Text/Image generation     │  │
                                  │  │  - Text embeddings           │  │
                                  │  └─────────────────────────────┘  │
                                  │  ┌──────────────────────────────┐  │
                                  │  │  MySQL DB (TypeORM)          │  │
                                  │  │  Docker in dev, Cloud in prod│  │
                                  │  └──────────────────────────────┘  │
                                  └────────────────────────────────────┘
```

The monorepo has two top-level packages:
- `client/` — React SPA
- `server/core/` — Express API server

In production both are served from the same process: the server builds the client static files and serves them at `/`, while all API calls go through `/api`.

---

## 2. Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| UI component library | MUI (Material UI) v9 |
| Client build tool | Vite |
| Client data fetching | TanStack React Query v5 |
| HTTP client | Axios |
| Google login (client) | `@react-oauth/google` |
| Backend framework | Express 5 + TypeScript |
| ORM | TypeORM 0.3 |
| Database | MySQL 8 (Docker locally) |
| Auth | JWT (access + refresh tokens) + bcrypt + Google OAuth2 |
| AI | Google Gemini (`@google/genai`) |
| Background removal | `@imgly/background-removal-node` |
| Image manipulation | `sharp` |
| Web scraping | Puppeteer + `puppeteer-extra-plugin-stealth` |
| API documentation | Swagger / OpenAPI (served at `/api-docs`) |
| Runtime animations | Lottie Web |

---

## 3. Authentication

### Flow

The system supports two auth methods that coexist on the same user account:

**Email/Password:**
1. Client sends `POST /api/auth/register` or `POST /api/auth/login`
2. Server hashes passwords with **bcrypt** (10 rounds)
3. On success, issues a **JWT access token** (1 hour TTL) and a **JWT refresh token** (3 days TTL)

**Google OAuth (recommended):**
1. Client uses `@react-oauth/google` — Google's SDK renders a sign-in button and returns a credential ID token on success
2. Client sends `POST /api/auth/google` with the credential string
3. Server uses **`google-auth-library`** to verify the ID token against Google's servers
4. Server looks up the user by `google_id`; if not found, checks by email (account linking); if still not found, creates a new account
5. Same JWT pair is issued as for email/password

### Token Rotation
- Access token is short-lived and sent as `Authorization: Bearer <token>` on every protected request
- Refresh tokens are stored as a JSON array on the `user` row (multiple devices supported)
- `POST /api/auth/refresh` validates the refresh token, rotates it (old one is replaced in DB), and returns a new pair
- If an unknown refresh token is received, **all** refresh tokens for that user are wiped (reuse attack prevention)

### Server-Side Guard
`authMiddleware` verifies the `Authorization` header JWT and attaches `userId` to `req` before every protected route.

---

## 4. Database & TypeORM

### Setup
- **Database:** MySQL 8, running in Docker (`npm run db:start` from `server/core/`)
- **ORM:** TypeORM with decorators, code-first migrations
- **Connection:** configured in `src/db/datasource.ts`, credentials come from `.env.development`

### Running Migrations
```bash
# Apply all pending migrations
npm run migration:run

# Generate a new migration from entity changes
npm run migration:generate -- src/db/migrations/YourMigrationName

# Revert last migration
npm run migration:revert
```

### Key Entities

| Entity | Table | Purpose |
|---|---|---|
| `User` | `user` | Account info, supports both password hash and Google ID, stores refresh tokens as JSON |
| `ClothingItem` | `clothing_item` | A single garment owned by a user; has a 768-dim embedding blob |
| `Image` | `image` | Raw image binary stored as `LONGBLOB` with mime-type metadata |
| `BodyMapping` | `body_mapping` | User's body photo + physical stats (height, weight, body type) |
| `GarmentCategory` | `garment_category` | Lookup: Top, Bottom, Dress, Shoes, etc. |
| `ColorGroup` | `color_group` | Lookup: Black, White, Red, Blue, etc. |
| `Season` | `season` | Lookup: Spring, Summer, Fall, Winter, All-Season |
| `Style` | `style` | Lookup: Casual, Formal, Smart Casual, Sporty, Bohemian |
| `Outfit` | `outfit` | A saved outfit (many-to-many with `ClothingItem`), has an AI-generated image |
| `Gender` | `gender` | User profile field |

**Join tables** (managed by TypeORM `@ManyToMany`):
- `clothing_item_color_groups`
- `clothing_item_seasons`
- `clothing_item_styles`
- `outfit_items`

**Embedding storage:** `ClothingItem.imageEmbedding` is a `VARBINARY(3072)` column storing 768 × 4-byte float32 values in little-endian order. Helpers `floatsToBuffer` / `bufferToFloats` in `clothingItem.service.ts` handle serialization.

---

## 5. Image Processing Pipeline

This is one of the most technically interesting parts of the system. Every image that enters the closet goes through several processing stages.

### 5.1 Background Removal

**Library:** `@imgly/background-removal-node` (runs a local ML model — no external API call)

**When it runs:**
- When adding a clothing item to the closet (produces a transparent PNG)
- When uploading a body photo (produces a white-background PNG for clean virtual try-on compositing)

**Process:**
1. Input image is normalized to PNG via `sharp`
2. Passed to the background removal model as a `Blob`
3. Output is a transparent PNG (alpha channel where background was)
4. If `applyWhiteBackground: true`, `sharp` composites the transparent PNG onto white

### 5.2 Image Resizing & Squaring

`imageSizingService.resizeToSquare()` (via `sharp`) is called before every image is saved to the DB. This ensures consistent square aspect ratios across the UI.

### 5.3 Clothing Classification

**Model:** `gemini-2.5-flash` with structured JSON output (response schema enforced)

After background removal, each new closet item is analyzed by Gemini. The response is typed as `ClothingClassification`:

```typescript
{
  noClothingDetected: boolean,     // Gate: reject non-clothing images
  isWornByModel: boolean,          // Is someone wearing it?
  category: 'Top' | 'Bottom' | 'Dress' | ...,
  colorGroups: string[],           // e.g. ['Black', 'White']
  seasons: string[],               // e.g. ['Spring', 'Summer']
  styles: string[],                // e.g. ['Casual', 'Smart Casual']
  description: string              // Rich 1-3 sentence text — used for embedding
}
```

The JSON schema is passed directly to the Gemini API (`responseSchema` field), which **forces** the model to return a valid structured object instead of free-form text.

### 5.4 Text Embeddings (Vector Representation)

**Model:** `gemini-embedding-001` — outputs a 768-dimensional float32 vector

**When it runs:** After classification, the `description` field is embedded. This vector is stored alongside the clothing item in the DB.

**Why embeddings?**
Embeddings turn the AI's description of a garment into a numeric fingerprint in a high-dimensional semantic space. Items with similar descriptions end up near each other. This enables **cosine similarity** matching:

```
similarity(a, b) = (a · b) / (|a| × |b|)   [result: -1 to 1, higher = more similar]
```

Used in two places:
1. **Inspiration matching** (Finding My Items): given a photo of an outfit, find the most semantically similar items in the user's closet
2. **Smart Buy compatibility scoring**: blend metadata score (70%) with embedding similarity (30%) for final compatibility %

### 5.5 Garment Isolation (Smart Buy / Model Photos)

When adding items from retailer URLs, the source image is usually a model wearing the garment — unsuitable for the closet grid. The pipeline:

1. **Detect:** classify the image → if `isWornByModel: true`, proceed to isolation
2. **Isolate:** send the model photo to Gemini's image generation model with a prompt to extract only the specific garment onto a white background
3. **Store:** save this clean catalog-style image instead of the original

**Model:** `gemini-3.1-flash-image` (can both read and generate images)

If isolation fails, the system gracefully falls back to the original image.

### 5.6 Complete "Add to Closet" Pipeline

```
Upload image
     │
     ▼
[Smart Buy only] isWornByModel? ──yes──► isolateGarment() ──► clean product image
     │                                        │
     ▼                                        ▼
removeBackground()          ◄────────────────┘
     │
     ▼
classifyClothingItem()  ──► noClothingDetected? ──yes──► 400 Bad Request
     │
     ▼
resolve category/colors/seasons → DB IDs
     │
     ├──► imagesService.saveImage()  (resized, stored as LONGBLOB)
     │
     └──► generateEmbedding(description)  (768-dim vector)
                │
                ▼
          clothingItemService.addItem()  (DB insert)
```

---

## 6. AI Interface — Gemini

All Gemini calls are centralized in `server/core/src/ai/ai.provider.ts`.

### Models Used

| Model | Purpose |
|---|---|
| `gemini-2.5-flash` | Fast multimodal text generation with JSON schema enforcement — used for classification |
| `gemini-3.1-flash-image` | Multimodal image *generation* — virtual try-on, garment isolation |
| `gemini-embedding-001` | Text → 768-dim embedding vector |

### Provider Functions

```typescript
// Returns a text response (optionally with image inputs)
generateAIContent(model, prompt, config, images?)

// Returns an image Buffer (requires responseModalities: ['IMAGE'])
generateAIImage(model, prompt, config, images?)

// Returns a 768-dim number[] from a text description
generateEmbedding(text)

// Returns a typed T parsed from Gemini's structured JSON output
generateNewItemClassificationInput<T>(model, prompt, schema, images?)
```

### Configuration
`GEMINI_API_KEY` is read from `.env.development` / `.env.production`.

### Creativity / Temperature
`AICreativity` enum maps to Gemini temperature values:
- `LOW = 0.3` — classification (deterministic)
- `REGULAR = 0.6` — general
- `HIGH = 1.0` — creative image generation

---

## 7. Core Features & Processes

### 7.1 Closet Management
- Users add clothing items by uploading an image → full pipeline (see §5.6)
- Items can be filtered by category, color, season, and style
- Paginated list returned from the server

### 7.2 Virtual Try-On (Fitting Room)
1. User selects items from their closet
2. `POST /api/fitting-room/generate` calls `fittingRoomService.createFit()`
3. The user's body photo and selected garment images are sent to Gemini image generation
4. **Caching:** if the same combination of items was generated before, the cached image is returned — unless the user has replaced their body photo since (staleness check by `createdAt` comparison)
5. `recreate: true` forces a fresh generation
6. The result is stored as a new `Image` entity and the generated outfit image ID is returned

**Virtual Try-On Prompt Strategy:**
The prompt enforces: preserve face/skin tone, maintain garment texture/color, simulate realistic draping, output a single centered portrait.

### 7.3 Smart Buy (Pre-Purchase Check)
Answers "does this item go with what I already own?"

**Two input methods:**
- Upload an image directly
- Paste a store URL → server fetches the product page via `fetch`, extracts the `og:image` meta tag, and downloads the image. Bot-protected sites (Zara, H&M, etc.) are retried with **Puppeteer + stealth plugin**

**Compatibility Scoring:**
Uses empirical co-occurrence scores derived from the Maryland Polyvore dataset (16,990 real outfits):
- **Category matrix** (40% weight): how often does category A appear with category B in a real outfit?
- **Color matrix** (30%): how often does color A pair with color B?
- **Season compatibility** (15%): calendar adjacency scoring
- **Style matrix** (15%): Casual↔Sporty score vs. Formal↔Sporty score, etc.
- **Embedding similarity** (blended 30%): cosine similarity of text descriptions — boosts score, never drags it down

Category score acts as a hard ceiling: no amount of color/style/embedding match can override a fundamentally bad category pairing.

### 7.4 Inspiration Matching (Find My Items)
"I saw this outfit — which of my clothes match?"

1. User uploads an inspiration photo
2. Gemini classifies **every visible garment** in the photo (`classifyInspirationImage`)
3. For each detected item, the DB is queried for candidates matching category + color + season + style
4. Per-item embedding is generated from the description
5. Candidates are ranked by cosine similarity → best match returned

### 7.5 Body Profile
- User uploads a photo → background is removed with white fill → stored as body image
- User can add height, weight, body type for context
- Used as the "mannequin" image for virtual try-on

---

## 8. Client Architecture

### Routing
React Router v7 with `createBrowserRouter`. Routes map to screen components inside `src/components/screens/`.

### State & Server Data — React Query
All server state (closet items, outfits, user profile, etc.) is managed by **TanStack React Query v5**.

Query keys are centralized in `src/api/queryKeys.ts` so invalidations and cache updates are consistent.

**Pattern:**
```
src/api/
  api/           ← raw API functions (Axios calls)
  hooks/         ← React Query wrappers (useQuery / useMutation)
  queryKeys.ts   ← typed key factory
  client.ts      ← Axios instance with base URL and auth token interceptor
```

Example — adding a closet item:
1. `useAddClothingItem` hook calls `closetApi.addItem(file, tags)`
2. On success, `queryClient.invalidateQueries(queryKeys.closet.list)` triggers a background refetch
3. UI updates automatically

### Auth Context
`src/auth/AuthContext.tsx` provides the logged-in user and token management. The access token is kept in memory (`tokenStorage.ts`) and injected into every Axios request via an interceptor. On 401, the interceptor attempts a refresh automatically.

### UI
- **MUI v9** for all components
- Design tokens (colors, gradients, typography) are in `src/styles/tokens.ts`
- Lottie animations for the AI "analyzing" loading state (`src/assets/lottie/analyzing.json`)
- Mobile-first layout with `BottomNav` on mobile and `Sidebar` on desktop

---

## 9. API Layer

The Express app mounts all routes under `/api`. Protected routes require `Authorization: Bearer <token>`.

| Route prefix | Description |
|---|---|
| `/api/auth` | Register, login, Google login, refresh token |
| `/api/closet` | Add/list/delete user's clothing items |
| `/api/fitting-room` | Generate try-on look, Smart Buy try-on |
| `/api/smart-buy` | Fetch product image from URL, analyze compatibility |
| `/api/outfits` | Save, list, delete outfits |
| `/api/body` | Upload body photo, save body stats |
| `/api/images/:id` | Serve raw image blobs (public) |
| `/api/users` | Get/update user profile |
| `/api/clothing-items` | Classify single item (used internally) |
| `/api/color-groups` | Lookup data (public) |
| `/api/garment-categories` | Lookup data (public) |
| `/api/seasons` | Lookup data (public) |
| `/api/genders` | Lookup data (public) |
| `/api-docs` | Swagger UI |

**Error handling:** a single `errorHandler` middleware translates custom `HttpException` subclasses (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, etc.) into appropriate HTTP status codes. Unhandled errors become 500s.

**Rate limiting:** `express-rate-limit` is applied globally to prevent abuse.

**File uploads:** `multer` with in-memory storage. Max upload size is 5 MB (enforced on both client and server).

---

## 10. Running the Project Locally

### Prerequisites
- Node.js 20+
- Docker Desktop (for MySQL)
- A Gemini API key (from [Google AI Studio](https://aistudio.google.com))
- A Google OAuth client ID (from [Google Cloud Console](https://console.cloud.google.com))

### Environment Setup

Create `server/core/.env.development`:
```env
PORT=3000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=begoodit

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=259200

GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### Start Everything

```bash
# 1. Start the database (Docker)
cd server/core && npm run db:start

# 2. Run migrations
npm run migration:run

# 3. Start the server
npm run start:development

# 4. Start the client (new terminal)
cd client && npm run dev
```

Or use the VS Code task **"Start All"** which runs all of the above in parallel.

### Useful Commands

```bash
# Server
npm run db:logs          # Tail MySQL Docker logs
npm run db:drop          # Wipe the DB volume entirely
npm run migration:generate -- src/db/migrations/MyChange  # After editing entities
npm test                 # Unit tests (Jest)
npm run test:e2e         # E2E tests

# Client
npm run dev              # Dev server on :5173
npm run build            # Production build
npm run lint             # ESLint
```
