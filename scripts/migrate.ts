import { migrate } from "drizzle-orm/libsql/migrator"
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"

const client = createClient({
  url: "libsql://customer-email-qimerp.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzgwNjA2NzUsImlkIjoiNWM3ODJjM2YtMjY1YS00ZmU3LWI2M2QtZTA5NmJjZTg4NzE5In0.ryUxl1PXX76TohmrsMAuPlJ3W71GWt3fPEFYi0wg3ApV4j-Nn07qi4SbvbyyuYso61HZDu0Q88WXZL_LcRQKDg",
})

const db = drizzle(client)

async function main() {
  try {
    await migrate(db, { migrationsFolder: "drizzle" })
    console.log("Migration complete")
  } catch (error) {
    console.error("Error during migration:", error)
    process.exit(1)
  }
}

main()
