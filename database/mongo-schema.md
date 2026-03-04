# MongoDB Schema for CMS

## Users (`users`)

- `_id` ObjectId
- `name` String
- `email` String (unique)
- `passwordHash` String (bcrypt)
- `role` String: `"admin" | "faculty" | "student"`
- `profile` Object
  - `avatarUrl` String
  - `bio` String
  - `phone` String
  - `department` String
  - `year` String
- `createdAt` Date
- `updatedAt` Date

## Groups (`groups`)

- `_id` ObjectId
- `name` String
- `createdBy` ObjectId → `users._id`
- `members` [ObjectId] → `users._id`
- `lastMessageAt` Date
- `createdAt` Date
- `updatedAt` Date

## Messages (`messages`)

- `_id` ObjectId
- `group` ObjectId → `groups._id`
- `sender` ObjectId → `users._id`
- `text` String
- `reactions` Array of:
  - `user` ObjectId → `users._id`
  - `emoji` String
- `createdAt` Date
- `updatedAt` Date

## Notifications (`notifications`)

- `_id` ObjectId
- `user` ObjectId → `users._id`
- `type` String: `"message"`
- `group` ObjectId → `groups._id`
- `message` ObjectId → `messages._id`
- `readAt` Date
- `createdAt` Date
- `updatedAt` Date

