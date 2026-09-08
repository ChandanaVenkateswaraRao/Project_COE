## Why

BloomIQ currently relies primarily on Google Gemini API keys for question generation and course material Q&A. To support local offline environments, privacy-sensitive deployments, and reduce cloud API costs/rate limits, BloomIQ must fully function with local Ollama instances (such as `qwen2.5:7b`) while providing seamless, resilient dynamic switching between Gemini and Ollama in the UI.

## What Changes

- **Default Model & Context Window**: Set the default local Ollama model to `qwen2.5:7b` in `src/services/ai/index.ts` and configure Ollama with `num_ctx: 8192` to avoid truncation on large course material chunks.
- **Provider Passthrough in tRPC**: Fix `chatWithPDF` and `generateQuestions` in `src/trpc/routers/coordinator-router.ts` to strictly honor the `provider` selected in the UI rather than defaulting back to environment variables.
- **AI Health Monitoring Procedure**: Add a `checkAIHealth` tRPC procedure to query Ollama's availability (`/api/tags`) and active model status.
- **Graceful Fallback**: Implement automatic fallback to Gemini with user notifications when Ollama is selected but offline or fails mid-generation.
- **Embedding Compatibility Guard**: Ensure `src/services/embedding.service.ts` keeps vector spaces consistent during semantic search and prevents mixing incompatible embedding spaces.
- **UI Provider Status & Badging**: Add live connection indicators (● Online / ○ Offline) and friendly fallback alerts to `generate-questions/page.tsx` and `chat-pdf/page.tsx`.

## Capabilities

### New Capabilities
- `ollama-provider-support`: Local LLM execution with Ollama (`qwen2.5:7b`), dynamic UI toggle, connection health verification, and resilient fallback to Gemini.

### Modified Capabilities
*(None - first specification for this capability)*

## Impact

- **Affected Files**:
  - `src/services/ai/index.ts`
  - `src/services/ai/types.ts`
  - `src/services/embedding.service.ts`
  - `src/trpc/routers/coordinator-router.ts`
  - `src/app/coordinator/dashboard/course-management/generate-questions/page.tsx`
  - `src/app/coordinator/dashboard/course-management/chat-pdf/page.tsx`
  - `.env.example`
- **Dependencies**: Uses already installed `ollama-ai-provider-v2` and local Ollama daemon (`http://localhost:11434`).
