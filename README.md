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
curl -X POST http://localhost:8080/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://teddy360.com.br/material/marco-legal"}'

```
It will return a JSON response with the shortened URL.
```json
{
  "clicks":0,
  "createdAt":"2025-06-23T00:02:34.074Z",
  "id":"c735abdb-ead8-418d-9ed3-0151a03ef239",
  "originalUrl":"https://teddy360.com.br/material/marco-legal", 
  "shortCode":"yjQ2Ny",
  "updatedAt":"2025-06-23T00:02:34.074Z"
}
```
Then you can use the shortCode field to access the original url.
```bash
curl -X GET http://localhost:8080/yjQ2Ny
```

### Project Structure
```bash
/apps
  /gateway        --> KrakenD configuration
  /auth-service   --> Microservice for authentication
  /url-service    --> Microservice for URL shortening
/docker
  /kraken         --> KrakenD configuration file
docker-compose.yaml
```

## 🛠️ Improvements & To-Do

The project is functional but still has areas for improvement and expansion:
## 🛠️ Improvements & To-Do

The project is functional but still has areas for improvement and expansion:

### 🔧 Improvements

- **Better Error Handling**  
  Improve error messages for invalid URLs, expired links, and database connection failures.

- **Rate Limiting**  
  Add request throttling per user/IP to avoid abuse of the shortening service.

- **Logging and Monitoring**  
  Integrate centralized logging (e.g., Loki, ELK) and observability tools (e.g., Prometheus + Grafana).

- **Caching Layer**  
  Use Redis or similar for caching popular short links to reduce DB reads.

- **Timeout/Retry Policies in KrakenD**  
  Tune KrakenD's `timeout` and implement `retry` settings for more resilient API communication.

- **Tests**  
  Add unit and integration tests for both API and services using Vitest, Supertest, etc.

- **CI/CD Integration**  
  Add a GitHub Actions pipeline or GitLab CI for build, test, and deployment automation.

### 🚧 To-Do

- [ ] Implement authentication module (JWT-based)
- [ ] Integrate authentication into KrakenD (forward auth headers, protect routes)
- [ ] Implement multi-tenant support with user isolation
- [ ] Add analytics dashboard (e.g., link click stats per user)
- [ ] Create a front-end interface for managing and tracking shortened URLs
- [ ] Add expiration support for temporary links
- [ ] Implement link preview metadata (title, image, etc.)
- [ ] Docker health checks for all services
- [ ] Add Terraform support for infrastructure provisioning

Feel free to contribute by picking any of the above and opening a pull request!

