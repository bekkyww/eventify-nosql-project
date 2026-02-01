# Marketplace 

## Run with Docker
1) Create server/.env from server/.env.example
2) Start:
   docker compose up --build
3) Seed database from JSON files:
   docker compose exec api npm run seed

## URLs
- Frontend: http://localhost:5173

## Recreate volume(db) in Docker
- docker volume create eventify_mongo_data
- put file in this location: C:\eventify\eventify_mongo_data_backup.tar.gz
- execute this: cd C:\eventify

docker run --rm `
  -v eventify_mongo_data:/data `
  -v ${PWD}:/backup `
  alpine sh -c "cd /data && tar -xzf /backup/eventify_mongo_data_backup.tar.gz"
docker compose up -d

