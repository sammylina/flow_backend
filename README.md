# Flow Backend

A Node.js backend application using TypeScript, Express framework, and Prisma ORM with logging functionality.

> **Note**: This repository has been restructured with a clean main branch setup for optimal development workflow.

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
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a task by ID
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Logging

The application uses Winston for logging. Logs are stored in the `logs` directory:

- `all.log` - All logs
- `error.log` - Error logs only

Log levels are configurable via the `LOG_LEVEL` environment variable.