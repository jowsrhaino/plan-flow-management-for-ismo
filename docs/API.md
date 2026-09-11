# PlanFlow API Documentation

Base URL: `http://localhost:5000/api`

Protected endpoints require a JWT in the request header:

```http
Authorization: Bearer <token>
```

## Health

### `GET /health`

Checks whether the API is running.

Response `200`:

```json
{
  "status": "OK",
  "message": "PlanFlow API is running!"
}
```

## Authentication

### `POST /auth/register`

Creates a user account.

Request body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

Returns the created user and a JWT on success.

### `POST /auth/login`

Authenticates a user.

Request body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Returns the user and JWT on success.

### `POST /auth/logout`

Logs out the client. The frontend should remove its stored token.

### `GET /auth/me`

Protected. Returns the authenticated user profile.

## Projects

All project endpoints are protected.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/projects` | List the authenticated user's projects |
| `GET` | `/projects/:id` | Get one project |
| `POST` | `/projects` | Create a project |
| `POST` | `/projects/starter` | Create a starter project |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project |

Project body fields include `name`, `description`, `status`, `startDate`, and `endDate`. Valid statuses are `Not Started`, `In Progress`, and `Completed`.

## Tasks

All task endpoints are protected.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/tasks` | List the authenticated user's tasks |
| `GET` | `/tasks/:id` | Get one task |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |

Task body fields include `projectId`, `name`, `description`, `priority`, `status`, and `dueDate`. Valid priorities are `Low`, `Medium`, and `High`. Valid statuses are `Pending`, `In Progress`, and `Completed`.

## Dashboard

### `GET /dashboard/stats`

Protected. Returns project and task totals for the authenticated user.

## Chatbot

### `POST /chatbot/ask`

Protected. Sends a message to the Groq-backed PlanFlow assistant.

Request body:

```json
{
  "message": "Which tasks are still pending?"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "reply": "..."
  }
}
```

The backend returns `503` when `GROQ_API_KEY` is missing and `502` when the upstream Groq request fails.

## GitHub Integration

The GitHub callback is public because GitHub redirects to it. The remaining integration endpoints are protected.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/integrations/github/callback` | OAuth callback from GitHub |
| `POST` | `/integrations/github/connect` | Begin GitHub connection |
| `GET` | `/integrations/github/status` | Get connection status |
| `GET` | `/integrations/github/repositories` | List connected repositories |
| `DELETE` | `/integrations/github` | Disconnect GitHub |

## Error format

Validation and application errors use JSON with an `error` message. Authentication failures return `401`; validation failures return `400`; missing server configuration returns `503`.
