-- Add username column to user table and create index
ALTER TABLE "user" ADD COLUMN username VARCHAR(50) UNIQUE;
CREATE INDEX idx_user_username ON "user"(username);
