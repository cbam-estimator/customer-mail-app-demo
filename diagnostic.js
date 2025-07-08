import { execSync } from "child_process"
import { loadInitialData } from "./scripts/loadInitialData.js"
import { db } from "./lib/db/config"

function runCommand(command) {
  console.log(`Running command: ${command}`)
  try {
    const output = execSync(command, { encoding: "utf-8" })
    console.log(output)
  } catch (error) {
    console.error(`Error executing command: ${command}`)
    console.error(error.message)
    if (error.stdout) console.log(`stdout: ${error.stdout}`)
    if (error.stderr) console.error(`stderr: ${error.stderr}`)
  }
}

async function runDiagnostics() {
  console.log("Starting diagnostics...")

  console.log("\n--- Database Connection Test ---")
  try {
    const result = await db.select({ now: sql`SELECT CURRENT_TIMESTAMP` })
    console.log("Database connection successful:", result)
  } catch (error) {
    console.error("Database connection failed:", error.message)
  }

  console.log("\n--- Running Migrations ---")
  runCommand("npm run migrate")

  console.log("\n--- Loading Initial Data ---")
  try {
    await loadInitialData()
  } catch (error) {
    console.error("Error loading initial data:", error.message)
  }

  console.log("\n--- Checking Database Content ---")
  try {
    const supplierCount = await db.select({ count: sql`COUNT(*)` }).from(suppliers)
    console.log("Number of suppliers in the database:", supplierCount[0].count)

    const cnCodeCount = await db.select({ count: sql`COUNT(*)` }).from(cnCodes)
    console.log("Number of CN codes in the database:", cnCodeCount[0].count)
  } catch (error) {
    console.error("Error checking database content:", error.message)
  }

  console.log("\nDiagnostics completed.")
}

runDiagnostics().catch(console.error)
