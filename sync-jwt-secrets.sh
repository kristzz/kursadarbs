#!/bin/bash

# Script to synchronize JWT secrets between Laravel and WebSocket server
# This ensures that the same JWT secret is used in both environments

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}JWT Secret Synchronization Tool${NC}"
echo "This script will synchronize JWT secrets between Laravel and WebSocket server"
echo ""

# Check if Laravel .env exists
if [ ! -f "./laravel/.env" ]; then
    echo -e "${RED}Error: Laravel .env file not found${NC}"
    echo "Please make sure you're running this script from the root directory of the project"
    echo "and that you've created an .env file in the Laravel directory."
    exit 1
fi

# Check if WebSocket .env exists
if [ ! -f "./websocket-server/.env" ]; then
    echo -e "${RED}Error: WebSocket .env file not found${NC}"
    echo "Please make sure you're running this script from the root directory of the project"
    echo "and that you've created an .env file in the WebSocket server directory."
    exit 1
fi

# Get current JWT secrets
LARAVEL_JWT_SECRET=$(grep -E "^JWT_SECRET=" ./laravel/.env | cut -d '=' -f2)
WS_JWT_SECRET=$(grep -E "^JWT_SECRET=" ./websocket-server/.env | cut -d '=' -f2)

echo "Current JWT secrets:"
echo "- Laravel:    ${LARAVEL_JWT_SECRET:-Not set}"
echo "- WebSocket:  ${WS_JWT_SECRET:-Not set}"
echo ""

# Ask user for synchronization direction
echo "How would you like to synchronize the JWT secrets?"
echo "1) Use Laravel's JWT secret for both"
echo "2) Use WebSocket's JWT secret for both"
echo "3) Generate a new JWT secret for both"
echo "4) Exit without changes"
read -p "Your choice (1-4): " CHOICE

case $CHOICE in
    1)
        if [ -z "$LARAVEL_JWT_SECRET" ]; then
            echo -e "${RED}Error: Laravel JWT secret is not set${NC}"
            exit 1
        fi
        # Update WebSocket .env
        sed -i "s/^JWT_SECRET=.*$/JWT_SECRET=$LARAVEL_JWT_SECRET/" ./websocket-server/.env
        echo -e "${GREEN}WebSocket JWT secret updated successfully${NC}"
        ;;
    2)
        if [ -z "$WS_JWT_SECRET" ]; then
            echo -e "${RED}Error: WebSocket JWT secret is not set${NC}"
            exit 1
        fi
        # Update Laravel .env
        sed -i "s/^JWT_SECRET=.*$/JWT_SECRET=$WS_JWT_SECRET/" ./laravel/.env
        echo -e "${GREEN}Laravel JWT secret updated successfully${NC}"
        ;;
    3)
        # Generate new JWT secret
        NEW_JWT_SECRET=$(openssl rand -base64 32)
        # Update both .env files
        sed -i "s/^JWT_SECRET=.*$/JWT_SECRET=$NEW_JWT_SECRET/" ./laravel/.env
        sed -i "s/^JWT_SECRET=.*$/JWT_SECRET=$NEW_JWT_SECRET/" ./websocket-server/.env
        echo -e "${GREEN}New JWT secret generated and applied to both environments${NC}"
        ;;
    4)
        echo "Exiting without changes"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}JWT secrets synchronized successfully!${NC}"
echo "Please restart your Laravel and WebSocket servers for the changes to take effect." 