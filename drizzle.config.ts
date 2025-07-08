//import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL || "libsql://customer-mail-app-cbam-estimator.turso.io",
    authToken: process.env.DATABASE_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTE4MDA4NDUsImlkIjoiZWExMWM2ZjYtMjZkYS00OGRlLTlkNmUtNTJjYWEzMjhiOWQwIn0.UyQHZuV1VS4xuiU6b9UKn9iDQtAECuqVfnI5RLa8JSwXDd8bRJoNdBoYTgVwjIHOKAM2Zr3L8jkudW5Jn4kyDA",
  },
} 
//satisfies Config;
