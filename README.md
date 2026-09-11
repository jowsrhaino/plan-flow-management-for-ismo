# PlanFlow Management System

PlanFlow is a full-stack project management system for organizing projects, tasks, team workflow, GitHub connections, and AI-assisted project insights.

## Repository

This repository is intended to be public and accessible without requesting access:

https://github.com/jowsrhaino/plan-flow-management-for-ismo

## Features

- JWT authentication with bcrypt password hashing
- Project and task CRUD workflows
- Dashboard project and task statistics
- GitHub OAuth connection and repository listing
- Floating Groq-powered AI assistant
- MySQL persistence through Sequelize ORM
- Docker and deployment configuration under `docker-compose.yml`, `Jenkinsfile`, and `k8s/`

## Project Structure

```text
backend/     Express API, Sequelize models, authentication, integrations
frontend/    React and Vite client application
docs/        API reference and database schema
```

## Requirements

- Node.js 18 or newer
- MySQL 8 or compatible MySQL server
- A Groq API key for the chatbot
- GitHub OAuth credentials for GitHub integration (optional)

## Configuration

Copy the backend example environment file and update the values:

```powershell
Copy-Item backend/.env.example backend/.env
```

Required backend values include:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-local-mysql-password
DB_NAME=project_management_db
GROQ_API_KEY=your-groq-api-key
```

Never commit `backend/.env` or any real API keys. The repository ignores environment files while keeping `.env.example` tracked.

## Run Locally

Install backend dependencies and start the API:

```powershell
Set-Location backend
npm install
npm run dev
```

In a second terminal, install frontend dependencies and start the client:

```powershell
Set-Location frontend
npm install
npm run dev
```

The API runs on `http://localhost:5000`. Vite normally runs on `http://localhost:5173`; if that port is occupied, use the URL printed by Vite.

## Documentation

- [API documentation](docs/API.md)
- [Database schema and ER diagram](docs/database-schema.md)

## Validation

Build the frontend before submission:

```powershell
Set-Location frontend
npm run build
```

Check the backend health endpoint after startup:

```text
GET http://localhost:5000/api/health
```

## License

This project is provided for educational and project submission use.