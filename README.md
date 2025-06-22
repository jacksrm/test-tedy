# URL Shortener Microservice

This is a scalable URL shortener service built with a microservices architecture. The main API is developed using [NestJS](https://nestjs.com/) and communicates with other services through an API Gateway powered by [KrakenD](https://www.krakend.io/). The system supports authentication, click tracking, URL registration, and multi-tenant usage.

## Features

- 🔗 Shorten and expand URLs
- 📊 Click tracking per shortened URL
- 🧾 URL registration history per user
- 🔐 Secure authentication (JWT-based)
- 🧰 Microservices structure with Docker
- 🌍 API Gateway using KrakenD
- 🧪 Ready for production with CI-friendly architecture
- 🧭 Multi-tenant support
- 📁 Monorepo-friendly layout


## Technologies

- **NestJS** - Main API framework
- **Prisma ORM** - Database access
- **PostgreSQL** - Main database
- **KrakenD** - API Gateway
- **Docker** - Containerization for all services
- **TypeScript** - All services written in TypeScript

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+)
- pnpm

### Installation

```bash
git clone https://github.com/your-org/url-shortener.git
cd url-shortener
pnpm install
```

### Running the Project
```bash
# Start all services
docker-compose up --build
```

### Testing the Gateway
Once up, you can make requests to the API via the KrakenD gateway:

```bash
curl -X POST http://localhost:8080/url \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com"}'
```

### Project Structure
```bash
/apps
  /gateway        --> KrakenD configuration
  /api            --> NestJS main API
  /url-service    --> Microservice for URL shortening
/libs
  /common         --> Shared DTOs, interfaces, etc.
/prisma
  schema.prisma   --> Database schema
/docker
  docker-compose.yaml
```