## Purpose

Enables BloomIQ to utilize local Ollama LLMs alongside Google Gemini with dynamic UI switching, connection health monitoring, and graceful fallback.

## ADDED Requirements

### Requirement: Local Ollama Model Execution
The system SHALL support executing text and exam question generation using locally hosted Ollama models, defaulting to `qwen2.5:7b` with a minimum context window of 8,192 tokens.

#### Scenario: User generates questions using Ollama
- **WHEN** the coordinator selects "Ollama" as the AI provider and requests question generation
- **THEN** the system generates questions using the local Ollama instance with `num_ctx: 8192` and returns the structured question list

### Requirement: Dynamic Provider Selection in tRPC
The tRPC coordinator router SHALL explicitly respect the AI provider specified in the client request for both question generation and course material chat, rather than defaulting to environment configuration.

#### Scenario: Chat with course material using selected provider
- **WHEN** the user selects "Ollama" in the Chat with Material interface and sends a query
- **THEN** the tRPC endpoint executes the response generation using the Ollama provider instance

### Requirement: AI Provider Health Check Procedure
The system SHALL provide a tRPC health verification procedure `checkAIHealth` that checks the connectivity and model availability of local Ollama on `http://localhost:11434` and Google Gemini.

#### Scenario: Health check when Ollama is active
- **WHEN** the client queries `checkAIHealth` and Ollama is running
- **THEN** the system returns `ollama: { isAvailable: true, models: [...] }` and `gemini: { isAvailable: true }`

#### Scenario: Health check when Ollama is offline
- **WHEN** the client queries `checkAIHealth` and the local Ollama port is unreachable
- **THEN** the system returns `ollama: { isAvailable: false, error: "ECONNREFUSED" }` without throwing an unhandled exception

### Requirement: Graceful Fallback to Gemini
When the coordinator selects Ollama but the Ollama daemon is unreachable or errors during execution, the system SHALL automatically attempt generation using Google Gemini as a fallback and notify the user.

#### Scenario: Generation fallback on Ollama failure
- **WHEN** question generation is requested with Ollama but Ollama fails to respond
- **THEN** the system re-routes the prompt to Gemini, completes the generation, and includes a fallback notification in the response

### Requirement: Semantic Embedding Compatibility
The system SHALL ensure semantic search queries in Chat with PDF use the embedding provider compatible with the stored course material chunks.

#### Scenario: Querying material chunks in semantic search
- **WHEN** semantic search is performed on course material chunks
- **THEN** the query embedding is generated using the provider corresponding to the material's vector space

### Requirement: Live UI Connection Status Badging
The coordinator dashboard interfaces for Question Generation and Chat with PDF SHALL display live visual indicators for provider availability and inform users when Ollama is offline.

#### Scenario: Visual status badge in provider selector
- **WHEN** the coordinator views the AI Provider selector in the UI
- **THEN** the selector displays an active badge (● Online) if Ollama is responsive, or an inactive badge (○ Offline) if unreachable
