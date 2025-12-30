# Talksy — Interview Guide

This document is written for technical interviews and code walkthroughs. It summarizes the project, architecture, how to run it locally, common pitfalls, design decisions, and suggested interview questions with concise answers.

## Project Summary
- Talksy is a full-stack chat application composed of three backend services (`user`, `chat`, `mail`) and a Next.js frontend. It uses MongoDB for persistence, Redis for session/caching, and RabbitMQ for asynchronous messaging (mail/OTP).

## Architecture & Services
- `backend/user` — user management, authentication (port 4000)
- `backend/chat` — chat API and WebSocket server (port 5000)
- `backend/mail` — mail/OTP consumer (port 6000)
- `frontend` — Next.js app (port 3000)
- External services: MongoDB (27017), Redis (6379), RabbitMQ (5672 / management 15672)

## Key Files / Where to Look
- Service entrypoints: `backend/user/src/index.ts`, `backend/chat/src/index.ts`, `backend/mail/src/index.ts`
- Frontend context + API wiring: `frontend/src/context/AppContext.tsx`
- DB and infrastructure config: `backend/*/src/config/*`
- Docker compose for local infra: `docker-compose.yml`

## Run Locally (quick)
1. Ensure Docker Desktop is running and start infra (Mongo, Redis, RabbitMQ):

```powershell
cd "chat code"
docker-compose up -d mongodb redis rabbitmq
```

2. Start backends (in separate terminals or use a process manager):

```powershell
cd "chat code/backend/user"; npm install; .\node_modules\.bin\tsc; npm start
cd "chat code/backend/chat"; npm install; .\node_modules\.bin\tsc; npm start
cd "chat code/backend/mail"; npm install; .\node_modules\.bin\tsc; npm start
```

3. Start frontend:

```powershell
cd "chat code/frontend"; npm install; npm run dev
```

4. Open http://localhost:3000

## Common Pitfalls
- Next.js can hang if frontend `AppContext` points to wrong backend ports — check `frontend/src/context/AppContext.tsx`.
- Ensure databases/queues are up before starting services to avoid `ECONNREFUSED` on startup.
- If ports are in use, free them or change `PORT` env variables in each service `.env`.

## Design Decisions (short)
- Services are small and single-responsibility (user, chat, mail) to allow independent scaling.
- RabbitMQ is used to decouple mail/OTP work from request-response flow, enabling retries, buffering, and scaling of background workers.
- Redis is used for fast session or ephemeral state needed by chat service.

## Scaling & Production Considerations
- Run multiple instances of `chat` behind a load balancer and use a sticky session or a shared socket server (Redis/Socket.IO adapter).
- Move env secrets into a secure vault, and enable TLS for inter-service traffic.
- Add health checks and container restart policies in production orchestrator (Kubernetes, ECS).

## Security Notes
- Store JWT secrets securely; rotate tokens and enforce short expiry for sensitive operations.
- Sanitize and validate all incoming messages to avoid injection.
- Limit file uploads and validate types in `backend/chat` multer middleware.

## Interview Questions & Example Answers
- Q: How does the app handle real-time messages?
  - A: The `chat` service exposes WebSocket endpoints and leverages a socket server for real-time delivery. Messages are persisted to MongoDB and published to relevant subscribers.
- Q: Why RabbitMQ?
  - A: RabbitMQ decouples mail/OTP processing from request-response flow, enabling retries, buffering, and scaling of background workers.
- Q: How would you scale the WebSocket layer?
  - A: Use a socket adapter backed by Redis (or a dedicated socket cluster), run multiple chat instances, and put them behind a load balancer with sticky sessions or implement message fanout using Redis pub/sub.
- Q: How do you test this system end-to-end?
  - A: Use Docker Compose to orchestrate infra, then run integration tests that perform registration/login, open socket connections, send messages, and assert persistence and delivery.

## How to Walk Through the Code in an Interview
1. Start at `frontend/src/context/AppContext.tsx` to explain how the UI discovers `me` and connects to services.
2. Open `backend/user/src/index.ts` to discuss auth flows and JWT generation.
3. Review `backend/chat/src/index.ts` and `config/socket.ts` to show WebSocket handling and message persistence.
4. Show `backend/mail/src/consumer.ts` to explain background processing with RabbitMQ.

## Next Steps / Improvements
- Add comprehensive tests (unit + integration) and CI pipeline.
- Add a Docker Compose override for development to simplify local startup.
- Add observability (metrics, logging, tracing).

---
If you'd like, I can also add this file to the repo, commit, and push it to the GitHub repository you provided.
