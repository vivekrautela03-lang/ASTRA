# ASTRA Official Third-Party Integrations

## 1. Supported Integration Providers

ASTRA OS connects to official third-party cloud services using documented APIs, minimum required permission scopes, and encrypted token management.

| Provider | Purpose | Authentication | Official Documentation |
| :--- | :--- | :--- | :--- |
| **OpenAI** | LLM, Embeddings, Realtime Voice | API Key (`OPENAI_API_KEY`) | [platform.openai.com/docs](https://platform.openai.com/docs) |
| **Google Cloud** | Gemini 1.5 Pro, Vision, Workspace | API Key / OAuth 2.0 | [console.cloud.google.com](https://console.cloud.google.com/) |
| **GitHub** | Repositories, Pull Requests, Issues | Personal Access Token | [docs.github.com/rest](https://docs.github.com/en/rest) |
| **Supabase** | Postgres 15+, pgvector, Auth | Anon & Service Keys | [supabase.com/docs](https://supabase.com/docs) |
| **Vercel** | Project Deployments, Domains | Personal Access Token | [vercel.com/docs](https://vercel.com/docs) |
| **Figma** | Design Inspection, Frame Export | Personal Access Token | [figma.com/developers/api](https://www.figma.com/developers/api) |
| **Canva** | Graphic Asset Generation | Connect API Key | [canva.com/developers](https://www.canva.com/developers/) |
| **Spotify** | Audio Streaming Playback | OAuth 2.0 Web API | [developer.spotify.com](https://developer.spotify.com/) |

---

## 2. Integration Management UI

Access `/settings/integrations` in the ASTRA interface:
- **Card Status Indicators:** `Connected`, `Not Connected`, `Error`.
- **Action Buttons:** `[CONNECT]`, `[TEST]`, `[MANAGE]`, `[DISCONNECT]`.
- **Health Checks:** Interactive test suite verifying token validity and API latency without revealing credentials.
