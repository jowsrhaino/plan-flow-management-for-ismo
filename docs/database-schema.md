# PlanFlow Database Schema

PlanFlow uses MySQL through Sequelize ORM. The database name is configured with `DB_NAME` and defaults to `project_management_db`.

## Entity relationship diagram

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    USERS ||--o{ TASKS : manages
    PROJECTS ||--o{ TASKS : contains
    USERS ||--o| GITHUB_INTEGRATIONS : connects

    USERS {
        int id PK
        varchar fullName
        varchar email UK
        varchar passwordHash
        datetime createdAt
        datetime updatedAt
    }

    PROJECTS {
        int id PK
        int userId FK
        varchar name
        text description
        enum status
        date startDate
        date endDate
        datetime createdAt
        datetime updatedAt
    }

    TASKS {
        int id PK
        int projectId FK
        int userId FK
        varchar name
        text description
        enum priority
        enum status
        date dueDate
        datetime createdAt
        datetime updatedAt
    }

    GITHUB_INTEGRATIONS {
        int id PK
        int userId FK UK
        varchar githubLogin
        varchar githubAvatarUrl
        text encryptedAccessToken
        datetime connectedAt
        datetime createdAt
        datetime updatedAt
    }
```

## Tables

### `users`

Stores registered accounts. Email addresses are unique. Passwords are stored as bcrypt hashes in `passwordHash`, never as plain text.

### `projects`

Stores projects owned by a user. `status` is one of `Not Started`, `In Progress`, or `Completed`.

### `tasks`

Stores tasks assigned to a project and owned by a user. `priority` is one of `Low`, `Medium`, or `High`; `status` is one of `Pending`, `In Progress`, or `Completed`.

### `github_integrations`

Stores one GitHub connection per user. The GitHub access token is encrypted before storage. `userId` is unique, enforcing the one-to-one relationship.

## Relationships and deletion behavior

- One user can own many projects.
- One user can manage many tasks.
- One project can contain many tasks.
- One user can have zero or one GitHub integration.
- Deleting a user cascades to their projects, tasks, and GitHub integration.
- Deleting a project cascades to its tasks.

The Sequelize models in `backend/src/models/` are the source of truth. The backend currently synchronizes the schema at startup with `sequelize.sync({ alter: true })` for local development.
