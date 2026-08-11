#!/bin/bash

set -Eeuo pipefail

APP_DIR="/root/Deduckly"
BACKEND_DIR="$APP_DIR/backend"

CONTAINER_NAME="deductly-api"
IMAGE_NAME="deductly-backend"

BACKUP_DIR="$APP_DIR/backups"
HEALTH_URL="http://localhost:8000/api/v1/health"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

DB_BACKUP="$BACKUP_DIR/deduckly_${TIMESTAMP}.sql"
CURRENT_IMAGE="$IMAGE_NAME:$TIMESTAMP"
PREVIOUS_IMAGE="$IMAGE_NAME:previous"

mkdir -p "$BACKUP_DIR"

echo "======================================"
echo "Deduckly deployment starting"
echo "======================================"

cd "$APP_DIR"

echo "Pulling latest main..."

git fetch origin main
git reset --hard origin/main

echo "Reading database configuration..."

DATABASE_URL=$(grep '^DATABASE_URL=' "$BACKEND_DIR/.env" | cut -d '=' -f2-)

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not found."
    exit 1
fi

echo "Creating database backup..."

/usr/lib/postgresql/18/bin/pg_dump "$DATABASE_URL" > "$DB_BACKUP"

echo "Database backup created:"
echo "$DB_BACKUP"
echo "Cleaning old database backups..."

find "$BACKUP_DIR" \
    -type f \
    -name "deduckly_*.sql" \
    -printf '%T@ %p\n' \
    | sort -nr \
    | awk 'NR>10 {print $2}' \
    | xargs -r rm -f

echo "Keeping the 10 most recent backups."
echo "Saving previous Docker image..."

if docker image inspect "$IMAGE_NAME:latest" >/dev/null 2>&1; then
    docker tag "$IMAGE_NAME:latest" "$PREVIOUS_IMAGE"
    echo "Previous image saved."
else
    echo "No previous image exists."
fi

echo "Building new Docker image..."

docker build \
    -t "$CURRENT_IMAGE" \
    "$BACKEND_DIR"

echo "Starting new container..."

docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    --env-file "$BACKEND_DIR/.env" \
    -p 8000:8000 \
    "$CURRENT_IMAGE"

echo "Waiting for application startup..."

sleep 5

echo "Running database migrations..."

if ! docker exec "$CONTAINER_NAME" alembic upgrade head; then

    echo "======================================"
    echo "MIGRATION FAILED"
    echo "ROLLING BACK"
    echo "======================================"

    docker logs --tail 100 "$CONTAINER_NAME" || true

    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true

    if docker image inspect "$PREVIOUS_IMAGE" >/dev/null 2>&1; then

        echo "Restoring previous application image..."

        docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            --env-file "$BACKEND_DIR/.env" \
            -p 8000:8000 \
            "$PREVIOUS_IMAGE"

        sleep 5

        echo "Previous application restored."

    else

        echo "ERROR: Previous Docker image not available."

    fi

    exit 1
fi

echo "Database migration successful."

echo "Checking application health..."

HEALTHY=false

for i in {1..10}; do

    if curl --fail --silent "$HEALTH_URL" > /dev/null; then
        HEALTHY=true
        break
    fi

    echo "Health check attempt $i failed."

    sleep 2

done

if [ "$HEALTHY" != true ]; then

    echo "======================================"
    echo "HEALTH CHECK FAILED"
    echo "ROLLING BACK"
    echo "======================================"

    docker logs --tail 100 "$CONTAINER_NAME" || true

    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true

    if docker image inspect "$PREVIOUS_IMAGE" >/dev/null 2>&1; then

        echo "Restoring previous application image..."

        docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            --env-file "$BACKEND_DIR/.env" \
            -p 8000:8000 \
            "$PREVIOUS_IMAGE"

        sleep 5

        echo "Previous application restored."

    else

        echo "ERROR: Previous Docker image not available."

    fi

    exit 1
fi

echo "Health check passed."

echo "Promoting new image to latest..."

docker tag "$CURRENT_IMAGE" "$IMAGE_NAME:latest"

echo "Cleaning old deployment images..."

docker image prune -f

echo "======================================"
echo "DEPLOYMENT SUCCESSFUL"
echo "======================================"

echo "Image: $CURRENT_IMAGE"
echo "Database backup: $DB_BACKUP"

echo "======================================"
