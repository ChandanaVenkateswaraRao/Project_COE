## Context

See `proposal.md` for the primary motivation. BloomIQ has partial support for Ollama through `ollama-ai-provider-v2` in `src/services/ai/index.ts`, but its default model points to `mistral:7b`, Ollama's default context window (`num_ctx: 2048`) truncates BloomIQ's multi-page syllabus chunks, tRPC procedures in `coordinator-router.ts` inconsistently override the client's provider choice with environment defaults, and semantic embeddings can be mismatched across vector spaces.

## Goals / Non-Goals

**Goals:**
- Enable local question generation and course material chat with local Ollama (`qwen2.5:7b`).
- Enlarge Ollama's context window to `num_ctx: 8192` so syllabus chunks and Bloom's taxonomy prompts fit completely.
- Introduce `checkAIHealth` in tRPC to dynamically discover if Ollama is up and list installed models.
- Gracefully fall back to Gemini if Ollama is requested but offline or fails, notifying the client.
- Preserve embedding vector consistency during PDF chat RAG retrieval.
- Provide live visual badging in the UI for provider status.

**Non-Goals:**
- Bundling or auto-installing the Ollama binary (Ollama is user-installed via ollama.com).
- Re-indexing existing database course material embeddings automatically.

## Decisions

### 1. Default Ollama Model & Context Sizing
- **Decision**: Configure `qwen2.5:7b` as the default Ollama model with `options: { num_ctx: 8192 }`.
- **Rationale**: `qwen2.5:7b` excels at structured JSON extraction, LaTeX math equations, and Bloom's taxonomy nuance compared to smaller 3B models, while running comfortably on consumer GPUs and 16GB RAM systems. The 8,192 token context window accommodates multi-page course materials plus the detailed JSON prompt instructions.
- **Alternatives Considered**: 
  - `mistral:7b`: Good, but slightly less consistent on complex nested JSON formatting.
  - `llama3.2:3b`: Fast, but frequently fails to follow strict JSON schema constraints for question generation.

### 2. tRPC Provider Passthrough & Automatic Fallback
- **Decision**: Update `coordinatorRouter` (`chatWithPDF`, `generateQuestions`, `getOllamaModels`) to use the client-supplied `input.provider`. If `OLLAMA` is selected but the daemon is unreachable (`ECONNREFUSED` or timeout), wrap generation in a fallback handler that retries with Gemini and returns a flag `fallbackUsed: true` with a message.
- **Rationale**: Prevents hard crashes or blank screens if a coordinator turns off Ollama or restarts their computer.
- **Alternatives Considered**: Fail immediately with an error modal. (Inferior UX; interrupts the teacher's workflow when Gemini is available).

### 3. Health Check Procedure (`checkAIHealth`)
- **Decision**: Add a lightweight query `coordinator.checkAIHealth` that calls `http://localhost:11434/api/tags` with a 2-second timeout and verifies Gemini API key presence.
- **Rationale**: Allows the client UI to proactively display connection status without waiting for an expensive generation call to fail.

### 4. Embedding Alignment in Semantic Search
- **Decision**: Ensure that semantic search queries in `chatWithPDF` use Google embedding if the material was embedded with Google, or Ollama `nomic-embed-text` if embedded locally. Default to Google embeddings for materials when `AI_PROVIDER=GEMINI`.
- **Rationale**: Vectors from different embedding models cannot be compared using cosine similarity. Matching the query embedding provider to the material's vector space preserves search relevance.

## Risks / Trade-offs

- **[Risk] Ollama generation latency on CPU**: Local LLMs running without GPU acceleration may take 30-60 seconds for 10 questions.
  → *Mitigation*: Adjust UI loading spinners with helpful messages ("Generating with local model, this may take a moment...") and enforce chunk limits.
- **[Risk] Port conflicts or custom Ollama URLs**: User might run Ollama on a remote server or non-standard port.
  → *Mitigation*: Respect `OLLAMA_URL` and `OLLAMA_BASE_URL` from environment variables, defaulting to `http://localhost:11434`.
