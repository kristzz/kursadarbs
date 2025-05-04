# Messaging Application

A full-stack messaging application with real-time WebSocket communication between users. The application includes a Laravel backend, React frontend with Next.js, and a dedicated WebSocket server.

## Architecture

The project consists of three main components:

1. **Laravel Backend** - Provides REST API endpoints for user authentication, profile management, and messaging
2. **Next.js Frontend** - Client-side application with user interface for messaging
3. **WebSocket Server** - Handles real-time communication between users

## Prerequisites

- Node.js 16+ and npm
- PHP 8.1+ and Composer
- MySQL database

## Installation

Clone the repository and set up each component:

### Backend (Laravel)

1. Navigate to the Laravel directory:
   ```
   cd laravel
   ```

2. Install dependencies:
   ```
   composer install
   ```

3. Copy the environment example file:
   ```
   cp .env.example .env
   ```

4. Generate an application key:
   ```
   php artisan key:generate
   ```

5. Generate a JWT secret:
   ```
   php artisan jwt:secret
   ```

6. Configure your database in the `.env` file.

7. Run migrations:
   ```
   php artisan migrate
   ```

8. Start the development server:
   ```
   php artisan serve
   ```

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the environment example file:
   ```
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local` as needed.

5. Start the development server:
   ```
   npm run dev
   ```

### WebSocket Server

1. Navigate to the WebSocket server directory:
   ```
   cd websocket-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the environment example file:
   ```
   cp .env.example .env
   ```

4. Configure the WebSocket server in the `.env` file:
   ```
   PORT=6001
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   SKIP_WS_AUTH=false
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```
   
   **Important**: The `JWT_SECRET` must match the one in the Laravel `.env` file.

5. Start the WebSocket server:
   ```
   npm run dev
   ```

## Environment Configuration

### Laravel Backend (.env)

Key environment variables for the Laravel backend:

```
APP_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret_key
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

### Frontend (.env.local)

Key environment variables for the Next.js frontend:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WEBSOCKET_HOST=localhost
NEXT_PUBLIC_WEBSOCKET_PORT=6001
NEXT_PUBLIC_WEBSOCKET_SECURE=false
NODE_ENV=development
```

### WebSocket Server (.env)

Key environment variables for the WebSocket server:

```
PORT=6001
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
SKIP_WS_AUTH=false
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Security Best Practices

1. **Never hardcode sensitive values** in your application code. Always use environment variables.
2. Use different values for development and production environments.
3. Add `.env` files to your `.gitignore` to prevent committing sensitive information.
4. Rotate your JWT secrets regularly in production.

## Development Workflow

1. Start all three servers (Laravel, Next.js, and WebSocket).
2. Make sure the JWT secret is the same across Laravel and WebSocket server.
3. Use the browser developer tools to debug WebSocket connections.
4. Check server logs for connection issues.

## Production Deployment

For production deployment, consider the following:

1. Set `NODE_ENV=production` in the WebSocket server and frontend.
2. Configure HTTPS for secure communication.
3. Set up a reverse proxy (like Nginx) to handle WebSocket connections.
4. Use process managers like PM2 for the Node.js servers.
5. Set `NEXT_PUBLIC_WEBSOCKET_SECURE=true` for the frontend.

## Troubleshooting

- **WebSocket connection errors**: Check that the WebSocket server is running and that the JWT secret matches between Laravel and the WebSocket server.
- **Authentication issues**: Make sure cookies are being properly set and that CORS is configured correctly.
- **Database connection problems**: Verify your database credentials and connection settings.

## License

This project is licensed under the MIT License.
