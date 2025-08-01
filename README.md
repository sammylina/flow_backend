# Flow Backend

A Node.js backend application using TypeScript, Express framework, and Prisma ORM with logging functionality.

> **Status**: ✅ Project setup complete! All requirements from issue #1 have been implemented and tested.

## Features

- TypeScript for type safety
- Express.js for API development
- Prisma ORM for database operations
- Winston for logging
- Jest for testing
- Environment-based configuration

## Project Structure

```
flow_backend/
├── dist/                   # Compiled JavaScript files
├── logs/                   # Log files
├── node_modules/           # Dependencies
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma       # Database schema
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middlewares
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── tests/              # Test files
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── app.ts              # Express app setup
│   └── index.ts            # Entry point
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── jest.config.js          # Jest configuration
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sammylina/flow_backend.git
   cd flow_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

## API Endpoints

- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (requires authentication)

### Playlists
- `POST /api/playlists` - Create a new playlist (requires authentication)
- `GET /api/playlists` - Get all playlists for authenticated user (requires authentication)
- `GET /api/playlists/:id` - Get a specific playlist by ID (requires authentication)
- `PUT /api/playlists/:id` - Update a playlist (requires authentication)
- `DELETE /api/playlists/:id` - Delete a playlist (requires authentication)

#### Playlist Object Structure
```json
{
  "id": 1,
  "name": "Beginner French",
  "description": "A playlist for French beginners",
  "level": "beginner",
  "lessonCount": 0,
  "userId": 1,
  "createdAt": "2025-08-01T14:00:00.000Z",
  "updatedAt": "2025-08-01T14:00:00.000Z"
}
```

#### Valid Levels
- `beginner`
- `intermediate`
- `advanced`

## Logging

The application uses Winston for logging. Logs are stored in the `logs` directory:

- `all.log` - All logs
- `error.log` - Error logs only

Log levels are configurable via the `LOG_LEVEL` environment variable.
