## 1. AI Service & Ollama Configuration

- [x] 1.1 Update default Ollama model in `src/services/ai/index.ts` to `qwen2.5:7b` and configure Ollama provider with `options: { num_ctx: 8192 }` to prevent context truncation; verify model initialization succeeds.
- [x] 1.2 Fix provider parameter passthrough in `src/services/ai/index.ts` for `parseEnhancedQuestionResponse` and `getProviderName` so that logging and parsing accurately reflect the active provider; verify by checking logger output.

## 2. tRPC Coordinator Router & Health Check

- [x] 2.1 Implement `checkAIHealth` procedure in `src/trpc/routers/coordinator-router.ts` to query `http://localhost:11434/api/tags` with a 2-second timeout, returning Ollama online status, installed models, and Gemini status; verify with tRPC query test.
- [x] 2.2 Fix `chatWithPDF` and `generateQuestions` in `src/trpc/routers/coordinator-router.ts` to respect client-provided `input.provider` instead of defaulting to environment variables; verify with query payload inspections.
- [x] 2.3 Implement automatic graceful fallback to Gemini in `generateQuestions` and `chatWithPDF` when Ollama is unreachable or errors mid-generation, returning a `fallbackUsed` notification; verify by testing with Ollama stopped.

## 3. Embedding Vector Space Compatibility

- [x] 3.1 Update `src/services/embedding.service.ts` to support specifying the embedding provider per call or aligning query embeddings with the course material's vector space; verify semantic search chunk retrieval works without dimension or similarity errors.

## 4. Coordinator UI Enhancements

- [x] 4.1 Update `src/app/coordinator/dashboard/course-management/generate-questions/page.tsx` with live Ollama status indicator badge (● Online / ○ Offline) and fallback alert toast; verify UI reflects status changes.
- [x] 4.2 Update `src/app/coordinator/dashboard/course-management/chat-pdf/page.tsx` with live Ollama status indicator badge (● Online / ○ Offline) and fallback alert toast; verify UI reflects status changes.

## 5. End-to-End Verification

- [x] 5.1 Test question generation with local Ollama (`qwen2.5:7b`) and verify questions are properly generated, parsed, and rendered.
- [x] 5.2 Test Chat with PDF using local Ollama (`qwen2.5:7b`) and verify answer streaming/generation works.
- [x] 5.3 Test fallback behavior when Ollama is disabled or port is closed, verifying seamless transition to Gemini with user feedback.
