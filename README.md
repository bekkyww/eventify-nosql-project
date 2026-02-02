# Eventify

## Run with Docker
1) Start:
   docker compose up -d --build
2) Seed database from JSON files:
   docker compose exec backend npm run seed

## URLs
- Frontend: http://localhost:5173

## Recreate volume(db) in Docker
- docker volume create eventify_mongo_data
- put file in this location: C:\eventify\eventify_mongo_data_backup.tar.gz
- execute this: cd C:\eventify


# THIS COMMAND UNPACKS eventify_mongo_data_backup.tar.gz INTO THE MONGO VOLUME

docker cp .\eventify_mongo_data_backup.tar.gz eventify-mongo:/data/db/backup.tar.gz

docker exec eventify-mongo sh -c "cd /data/db && tar -xzf backup.tar.gz && rm backup.tar.gz"

# RESTART CONTAINERS AFTER DATABASE RESTORE
docker compose restart

# VIEW BACKEND LOGS (CHECK MONGODB CONNECTION)
docker compose logs -f backend

# OPEN MONGODB TERMINAL INSIDE CONTAINER
docker compose exec mongo mongosh

# SWITCH TO PROJECT DATABASE
use eventify

# SHOW COLLECTIONS
show collections

# VIEW USERS
db.users.find().pretty()

# VIEW EVENTS (ONLY NOT DELETED)
db.events.find({ deletedAt: null }).pretty()

# GET OWNER ID (ADMIN OR ORGANIZER)
db.users.find(
  { role: { $in: ["admin", "organizer"] } },
  { _id: 1, email: 1, role: 1 }
)

# INSERT EVENT MANUALLY (SEED)
db.events.insertOne({
  ownerId: ObjectId("PASTE_USER_ID_HERE"),
  title: "Almaty Tech Meetup",
  description: "Web development and MongoDB",
  city: "Almaty",
  place: "Coworking Hub",
  startAt: new Date("2026-02-03T17:00:00.000Z"),
  endAt: new Date("2026-02-03T19:00:00.000Z"),
  capacity: 60,
  tags: ["mongodb", "react", "docker"],
  schedule: [],
  status: "published",
  deletedAt: null,
  counters: { views: 0, registrations: 0, checkins: 0 }
})

# SOFT DELETE EVENT
db.events.updateOne(
  { _id: ObjectId("EVENT_ID_HERE") },
  { $set: { deletedAt: new Date() } }
)

# HARD DELETE EVENT
db.events.deleteOne({ _id: ObjectId("EVENT_ID_HERE") })

# STOP ALL CONTAINERS
docker compose down

# STOP AND REMOVE DATABASE VOLUME (FULL RESET)
docker compose down -v
