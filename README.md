# Corn Backend

This project provides the backend API service for the Corn purchasing application. It handles business logic related to creating and retrieving purchase records, while also implementing rate limiting.

## Features

- API endpoint(s) for **creating new purchase orders** and storing them in the **PostgreSQL** database.
- (Potentially) Endpoints for retrieving purchase history.
- Integration with PostgreSQL database via Prisma ORM.
- Integration with **Redis** used for **API rate limiting**.

## Technologies Used

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js (inferred)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **In-Memory Store:** Redis
- **Containerization:** Docker, Docker Compose
- **Package Manager:** pnpm
- **Development Execution:** tsx (for running TS directly with hot-reload)
- **Validation:** Zod (inferred from dependencies)

## Project Structure

```
Corn-Store-Backend/
├── prisma/
│   └── schema.prisma       # Prisma schema definition
├── src/
│   ├── generated/prisma/   # Auto-generated Prisma client
│   ├── infrastructure/     # Core services like Prisma client setup, Redis client (previously 'core')
│   ├── modules/            # Feature-specific modules (e.g., 'purchase')
│   │   └── purchase/
│   │       ├── purchase.controller.ts # Handles HTTP requests for purchases
│   │       ├── purchase.service.ts    # Business logic for purchases (assumed)
│   │       ├── purchase.repository.ts # Data access logic using Prisma (assumed)
│   │       └── purchase.dto.ts        # Data Transfer Objects / Validation Schemas (assumed)
│   └── main.ts             # Application entry point
├── .env                    # Environment variables (currently ignored by Git & Docker)
├── .gitignore
├── .dockerignore
├── Dockerfile              # Docker build instructions for the backend service
├── docker-compose.yml      # Docker Compose configuration for all services (backend, postgres, redis)
├── package.json            # Project metadata and dependencies
├── pnpm-lock.yaml          # Exact dependency versions
├── tsconfig.json           # TypeScript compiler options
└── README.md               # This file
```

## Design Patterns Applied

- **Layered Architecture:** The codebase is structured into logical layers:
  - **Controllers:** Handle incoming HTTP requests and interact with services.
  - **Services:** Contain the core business logic.
  - **Repositories:** Abstract the data access logic, interacting directly with Prisma.
  - **Infrastructure:** Holds setup code for external services like Prisma and Redis.
- **Repository Pattern:** Used to decouple the business logic (services) from the data persistence details (Prisma), making the code more modular and testable.
- **Singleton Pattern:** Employed for managing instances of shared resources like the Prisma client and likely the Redis client within the infrastructure layer, ensuring a single instance is used across the application for efficiency and connection management.
- **(Likely) Dependency Injection:** While not explicitly using a framework like NestJS that enforces DI, the separation into services and repositories suggests dependencies are managed implicitly or explicitly passed where needed.

## Getting Started / Running with Docker

The recommended way to run this project for development is using Docker Compose, which orchestrates the backend service, PostgreSQL database, and Redis instance.

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose) installed.

### Running the Application

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd corn_store_backend 
    ```

2.  **Environment Variables:** Currently, necessary environment variables (like database connection strings and Redis details) are **hardcoded** directly within the `docker-compose.yml` file for simplicity in this development setup. For production or more complex scenarios, consider using a `.env` file.

3.  **Build and Run Containers:** Open a terminal in the project's root directory (`corn_store_backend /`) and run:

    - Ensure that runs migrations first 
    ```bash
    docker-compose exec backend pnpm exec prisma migrate dev
    ```

    ```bash
    docker compose up --build -d
    ``` 

    - `--build`: Forces Docker to rebuild the backend image if the `Dockerfile` or related source code has changed.
    - `-d`: Runs the containers in detached mode (in the background).

    This command will:

    - Build the `backend` Docker image based on the `Dockerfile`.
    - Pull the official `postgres` and `redis` images if not already present.
    - Create and start containers for the `backend`, `postgres`, and `redis` services.
    - Execute `pnpm exec prisma generate` inside the backend container automatically before starting the application (as defined in `docker-compose.yml`).
    - Start the backend application using `pnpm run dev`.

4.  **Accessing the API:** The backend service should now be running and accessible at `http://localhost:3000`.

### Stopping the Application

To stop all the running containers defined in the `docker-compose.yml` file, run:

```bash
docker compose down
```

This will stop and remove the containers, but preserve the data volumes (`postgres_data`, `redis_data`) unless you explicitly remove them.
