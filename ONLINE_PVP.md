# Online PvP deployment

The existing Vercel site serves the client and `/api/pvp`. Production room data is held in Upstash Redis; server memory is used **only** by the explicitly configured local Vite development server and tests.

## Connect production storage

1. In the Vercel Marketplace, connect an Upstash Redis database to `civilization-chess` for Production (and Preview if desired).
2. The server accepts either `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, or the integration's `KV_REST_API_URL` + `KV_REST_API_TOKEN`.
3. Redeploy after adding environment variables. Never use `VITE_` prefixes for these server secrets.
4. Check `/api/pvp?health=1` returns `{"configured":true}`; then create a room and join from a second browser/tab. A production configuration error must never fall back to memory.

Upstash REST and atomic EVAL documentation: https://upstash.com/docs/redis/features/restapi

## Behavior

- After creating a room, the host chooses white or black in the lobby; the guest receives the opposite color. Drafting starts only after color confirmation and both players joining. Invitation links contain only the 8-character room code.
- Participant authentication uses a random 256-bit bearer token stored in that tab's sessionStorage; only its SHA-256 hash is stored in Redis. Refresh resumes; closing the tab may lose the seat.
- Draft, passive placements, moves, skills, quizzes and resignation are server-validated. Only each side's turn may act. Client board snapshots and quiz results are never accepted.
- Revision compare-and-swap is atomic in Redis. Mutation retries carry a request ID for deduplication.
- Foreground clients poll roughly once per second, background clients every three seconds, with automatic reconnection. This version uses HTTP polling, not WebSockets.
- Rooms expire after 24 hours. Current version has no accounts, rating, matchmaking, spectators or negotiated undo.
- Clocks use server elapsed time and pause during passive placement. Sphinx answers/timeouts are judged on the server.
- Sandstorm is still a visual fog effect; the complete game history is sent to both players. This is a friends-play alpha, not a hidden-information tournament protocol.
- Same-origin requests, body-size limits and Redis-backed per-IP request limits protect the endpoint; quotas/billing remain controlled in Vercel/Upstash.

## Local verification

Run `pnpm dev`. The Vite plugin mounts the same API with an in-memory room store. Use two fresh tabs (independent sessionStorage), choose Online PvP, create/join, draft, place terrain, move and refresh. A dev-server restart clears local rooms.

Run `pnpm test` and `pnpm build`. `tests/onlineRooms.test.ts` covers independent HTTP clients, seat takeover, concurrent joins/commands, stale revisions, retry deduplication, draft authorization, placement, move/skill validation, server clocks, resignation and Sphinx result forgery.
