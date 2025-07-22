#!/bin/bash

# Debug Docker Build Script
# This script helps debug Docker build issues locally

set -e

cd "$(dirname "$0")/server"

echo "=== Docker Build Debug Script ==="
echo "Current directory: $(pwd)"
echo "Timestamp: $(date)"

echo ""
echo "=== System Resources ==="
echo "Available disk space:"
df -h
echo ""
echo "Available memory:"
free -h 2>/dev/null || echo "free command not available on macOS"
echo ""
echo "Docker version:"
docker --version
echo ""

echo "=== Docker System Info ==="
docker system df
echo ""

echo "=== Cleaning up previous builds ==="
docker image rm boatowner-api:latest 2>/dev/null || echo "No existing image to remove"
docker builder prune -f
echo ""

echo "=== Starting Docker Build (with timeout) ==="
echo "Build started at: $(date)"

# Build with detailed output and timeout
timeout 15m docker build \
  --build-arg API_DB_URL="postgresql://test:test@localhost:5432/test" \
  --progress=plain \
  --no-cache \
  -t boatowner-api:latest . || {
  echo ""
  echo "=== BUILD FAILED OR TIMED OUT ==="
  echo "Build failed at: $(date)"
  echo ""
  echo "=== Docker System Status After Failure ==="
  docker system df
  echo ""
  echo "=== Running Containers ==="
  docker ps -a
  echo ""
  echo "=== Docker Logs (if any) ==="
  docker logs $(docker ps -aq --filter ancestor=node:22) 2>/dev/null || echo "No container logs available"
  exit 1
}

echo ""
echo "=== BUILD SUCCESSFUL ==="
echo "Build completed at: $(date)"

echo ""
echo "=== Final Image Info ==="
docker images boatowner-api:latest
echo ""

echo "=== Image Size Details ==="
docker history boatowner-api:latest
echo ""

echo "=== Testing Image ==="
echo "Starting container test..."
docker run --rm -d --name test-container \
  -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
  -p 3001:3001 \
  boatowner-api:latest || {
  echo "Container failed to start"
  exit 1
}

echo "Waiting for container to be ready..."
sleep 5

echo "Container status:"
docker ps | grep test-container || echo "Container not running"

echo "Stopping test container..."
docker stop test-container 2>/dev/null || echo "Container already stopped"

echo ""
echo "=== Debug Script Complete ==="
