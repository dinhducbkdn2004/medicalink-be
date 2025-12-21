# Local Development Guide

This guide provides instructions for setting up a local development environment for the Medicalink microservices
project. It covers the necessary tools, configurations, and steps to get the services running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 20 or higher, recommend 24.x.x)
- [Docker](https://www.docker.com/) (for containerized services)
- [Docker Compose](https://docs.docker.com/compose/install/) (for managing multi-container Docker applications)
- [Git](https://git-scm.com/) (for version control)

## Setting Up the Environment

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Docker Containers (Optional for faster connections between services)

The project requires some services to be running in Docker containers. You can use the provided `docker-compose.yml`
file to set up these services.

```bash
pnpm dev-docker:up

# To stop and remove the containers, use:
pnpm dev-docker:down
# To view the logs of the containers, use:
pnpm dev-docker:logs
```

This command will start the necessary services in detached mode.

### 3. Configure Environment Variables

Create a `.env` file in the root directory of project and add the necessary configurations. Refer to the `.env.example`
file provided.

If using local Docker containers for services like PostgreSQL, Redis, etc., ensure the connection strings in your `.env`
files point to the correct Docker container addresses.

```plaintext
DATABASE_URL="postgresql://postgres:postgres@localhost:54321/postgres?pgbouncer=true"

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
REDIS_USERNAME=default
REDIS_PORT=15796
REDIS_DB=0
```

### 4. Set Up the Database

#### 4.1. Generate Prisma Client

```bash
pnpm prisma:generate
```

#### 4.2. Run Database Migrations and Sync Schema

```bash
pnpm prisma:push
```

#### 4.3. Seed the Database

```bash
# Create default SUPER ADMIN user
pnpm script -- --service=accounts-service --filename=create-super-admin

# Clear old permission if needed
pnpm script -- --service=accounts-service --filename=clear-permissions

# Seed permissions data
pnpm script -- --service=accounts-service --filename=permission-seeds
```

### 5. Start the Microservices

You can start each microservice individually using the following command:

```bash
# API Gateway (Required)
pnpm start:gateway

# Microservices
pnpm start:accounts
pnpm start:provider
pnpm start:booking
pnpm start:content
pnpm start:notification
```

That's it! Now you can access the services locally in url `http://localhost:3000` (API Gateway).