#!/bin/bash

# Development startup script for running all services
# This script starts the Laravel backend, Next.js frontend, and WebSocket server

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Development Environment Startup Tool${NC}"
echo "This script will start all three services required for development"
echo ""

# Check if environment files exist
if [ ! -f "./laravel/.env" ]; then
    echo -e "${RED}Error: Laravel .env file not found${NC}"
    echo "Please copy .env.example to .env in the Laravel directory"
    exit 1
fi

if [ ! -f "./websocket-server/.env" ]; then
    echo -e "${RED}Error: WebSocket .env file not found${NC}"
    echo "Please copy .env.example to .env in the WebSocket server directory"
    exit 1
fi

if [ ! -f "./frontend/.env.local" ]; then
    echo -e "${RED}Error: Frontend .env.local file not found${NC}"
    echo "Please copy .env.example to .env.local in the frontend directory"
    exit 1
fi

# Check JWT secrets sync
LARAVEL_JWT_SECRET=$(grep -E "^JWT_SECRET=" ./laravel/.env | cut -d '=' -f2)
WS_JWT_SECRET=$(grep -E "^JWT_SECRET=" ./websocket-server/.env | cut -d '=' -f2)

if [ "$LARAVEL_JWT_SECRET" != "$WS_JWT_SECRET" ]; then
    echo -e "${RED}Warning: JWT secrets are not synchronized between Laravel and WebSocket server${NC}"
    echo "Run ./sync-jwt-secrets.sh to synchronize them before starting the services"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        echo "Exiting"
        exit 1
    fi
fi

# Start Laravel backend
echo -e "${BLUE}Starting Laravel backend...${NC}"
cd laravel
php artisan serve > ../logs/laravel.log 2>&1 &
LARAVEL_PID=$!
cd ..
echo -e "${GREEN}Laravel backend started (PID: $LARAVEL_PID)${NC}"

# Start WebSocket server
echo -e "${BLUE}Starting WebSocket server...${NC}"
cd websocket-server
npm run dev > ../logs/websocket.log 2>&1 &
WEBSOCKET_PID=$!
cd ..
echo -e "${GREEN}WebSocket server started (PID: $WEBSOCKET_PID)${NC}"

# Start Next.js frontend
echo -e "${BLUE}Starting Next.js frontend...${NC}"
cd frontend
GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true REACT_EDITOR=none FAST_REFRESH=false TSC_COMPILE_ON_ERROR=true npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}Next.js frontend started (PID: $FRONTEND_PID)${NC}"

# Create a logs directory if it doesn't exist
mkdir -p logs

echo ""
echo -e "${GREEN}All services started successfully!${NC}"
echo "- Laravel API:      http://localhost:8000"
echo "- Next.js Frontend: http://localhost:3000"
echo "- WebSocket Server: ws://localhost:6001"
echo ""
echo "Logs are being saved to the logs/ directory"
echo "- Laravel:    logs/laravel.log"
echo "- WebSocket:  logs/websocket.log"
echo "- Frontend:   logs/frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill all processes
trap "kill $LARAVEL_PID $WEBSOCKET_PID $FRONTEND_PID; echo -e '${RED}All services stopped${NC}'; exit 0" SIGINT

# Keep the script running
wait 