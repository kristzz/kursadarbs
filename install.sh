#!/bin/bash

# Comprehensive installation script for the full-stack project
# This script installs and configures Laravel backend, Next.js frontend, and WebSocket server

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
check_port() {
    if ss -tuln | grep -q ":$1 "; then
        return 1
    else
        return 0
    fi
}

echo -e "${YELLOW}Full-Stack Project Installation Script${NC}"
echo "This script will install and configure all components of your project"
echo ""

# Check prerequisites
print_header "Checking Prerequisites"

if ! command_exists php; then
    print_error "PHP is not installed. Please install PHP 8.2 or later."
    exit 1
fi

if ! command_exists composer; then
    print_error "Composer is not installed. Please install Composer first."
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "All prerequisites are installed"

# Create logs directory
mkdir -p logs

# Laravel Backend Setup
print_header "Setting up Laravel Backend"

cd laravel

# Install composer dependencies
print_status "Installing Composer dependencies..."
if composer install --no-interaction --prefer-dist --optimize-autoloader; then
    print_success "Composer dependencies installed"
else
    print_error "Failed to install Composer dependencies"
    exit 1
fi

# Setup .env file
print_status "Setting up environment file..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success ".env file created from .env.example"
    else
        print_error ".env.example file not found"
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# Configure SQLite database
print_status "Configuring SQLite database..."
sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
sed -i 's/DB_HOST=127.0.0.1/#DB_HOST=127.0.0.1/' .env
sed -i 's/DB_PORT=3306/#DB_PORT=3306/' .env
sed -i 's/DB_DATABASE=.*/DB_DATABASE=database\/database.sqlite/' .env
sed -i 's/DB_USERNAME=.*/#DB_USERNAME=root/' .env
sed -i 's/DB_PASSWORD=.*/#DB_PASSWORD=/' .env
print_success "Database configured for SQLite"

# Generate application key
print_status "Generating Laravel application key..."
if php artisan key:generate --force; then
    print_success "Laravel application key generated"
else
    print_error "Failed to generate application key"
    exit 1
fi

# Generate JWT secret
print_status "Generating JWT secret..."
if php artisan jwt:secret --force; then
    print_success "JWT secret generated"
else
    print_warning "JWT secret generation failed, continuing..."
fi

# Setup database
print_status "Setting up database..."
if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
    print_success "SQLite database file created"
else
    print_success "Database file already exists"
fi

# Clear configuration cache before migrations
print_status "Clearing configuration cache..."
php artisan config:clear
php artisan cache:clear

# Run migrations
print_status "Running database migrations..."
if php artisan migrate --force; then
    print_success "Database migrations completed"
else
    print_warning "Database migrations failed, continuing..."
fi

# Seed database (optional)
print_status "Seeding database..."
if php artisan db:seed --force; then
    print_success "Database seeded successfully"
else
    print_warning "Database seeding failed or no seeders found, continuing..."
fi

# Clear and cache configuration
print_status "Optimizing Laravel..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
print_success "Laravel optimization completed"

# Install npm dependencies for Laravel (if package.json exists)
if [ -f package.json ]; then
    print_status "Installing Laravel npm dependencies..."
    if npm install; then
        print_success "Laravel npm dependencies installed"
    else
        print_warning "Failed to install Laravel npm dependencies"
    fi
fi

cd ..

# Frontend Setup
print_header "Setting up Next.js Frontend"

cd frontend

# Install npm dependencies with legacy peer deps to handle React version conflicts
print_status "Installing frontend dependencies (resolving React version conflicts)..."
if npm install --legacy-peer-deps; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Setup frontend environment file
print_status "Setting up frontend environment file..."
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        print_success "Frontend .env.local created from .env.example"
    else
        # Create a basic .env.local file
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:6001
EOF
        print_success "Basic frontend .env.local created"
    fi
else
    print_success "Frontend .env.local already exists"
fi

cd ..

# WebSocket Server Setup
print_header "Setting up WebSocket Server"

cd websocket-server

# Install npm dependencies
print_status "Installing WebSocket server dependencies..."
if npm install; then
    print_success "WebSocket server dependencies installed"
else
    print_error "Failed to install WebSocket server dependencies"
    exit 1
fi

# Setup WebSocket environment file
print_status "Setting up WebSocket server environment file..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "WebSocket .env created from .env.example"
    else
        # Create a basic .env file
        cat > .env << EOF
PORT=6001
JWT_SECRET=your-jwt-secret-here
NODE_ENV=development
EOF
        print_success "Basic WebSocket .env created"
    fi
else
    print_success "WebSocket .env already exists"
fi

cd ..

# Synchronize JWT Secrets
print_header "Synchronizing JWT Secrets"

# Get Laravel JWT secret
LARAVEL_JWT_SECRET=""
if [ -f "./laravel/.env" ]; then
    LARAVEL_JWT_SECRET=$(grep -E "^JWT_SECRET=" ./laravel/.env | cut -d '=' -f2)
fi

if [ -n "$LARAVEL_JWT_SECRET" ] && [ "$LARAVEL_JWT_SECRET" != "" ]; then
    print_status "Synchronizing JWT secret from Laravel to WebSocket server..."
    
    # Update WebSocket .env with Laravel's JWT secret
    if grep -q "^JWT_SECRET=" ./websocket-server/.env; then
        sed -i "s/^JWT_SECRET=.*$/JWT_SECRET=$LARAVEL_JWT_SECRET/" ./websocket-server/.env
    else
        echo "JWT_SECRET=$LARAVEL_JWT_SECRET" >> ./websocket-server/.env
    fi
    
    print_success "JWT secrets synchronized"
else
    print_warning "Laravel JWT secret not found or empty"
fi

# Final checks
print_header "Running Final Checks"

# Check if ports are available
print_status "Checking port availability..."

if ! check_port 8000; then
    print_warning "Port 8000 is already in use (Laravel backend)"
fi

if ! check_port 3000; then
    print_warning "Port 3000 is already in use (Next.js frontend)"
fi

if ! check_port 6001; then
    print_warning "Port 6001 is already in use (WebSocket server)"
fi

# Set up storage permissions
print_status "Setting up Laravel storage permissions..."
cd laravel
if [ -d "storage" ]; then
    chmod -R 775 storage
    chmod -R 775 bootstrap/cache
    print_success "Storage permissions set"
fi
cd ..

# Make scripts executable
print_status "Making scripts executable..."
chmod +x dev-start.sh
chmod +x sync-jwt-secrets.sh
chmod +x install.sh
print_success "Scripts made executable"

print_header "Installation Complete!"

echo ""
print_success "🎉 All components have been installed and configured successfully!"
echo ""
echo -e "${YELLOW}Configuration Summary:${NC}"
echo "- Database: SQLite (database/database.sqlite)"
echo "- Frontend: Next.js with React (legacy peer deps resolved)"
echo "- Backend: Laravel with JWT authentication"
echo "- WebSocket: Node.js server with synchronized JWT secrets"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review and update configuration files if needed:"
echo "   - laravel/.env (Laravel configuration)"
echo "   - frontend/.env.local (Frontend configuration)"
echo "   - websocket-server/.env (WebSocket configuration)"
echo ""
echo "2. Start the development environment:"
echo "   ./dev-start.sh"
echo ""
echo -e "${YELLOW}Services will be available at:${NC}"
echo "- Laravel API:      http://localhost:8000"
echo "- Next.js Frontend: http://localhost:3000"
echo "- WebSocket Server: ws://localhost:6001"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "- ./dev-start.sh        - Start all services"
echo "- ./sync-jwt-secrets.sh - Synchronize JWT secrets"
echo ""
print_success "Happy coding! 🚀" 