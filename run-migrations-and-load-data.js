import { execSync } from "child_process"
import { loadInitialData } from "./scripts/loadInitialData.ts"

console.log("Generating migration files...")
execSync("npm run generate", { stdio: "inherit" })

console.log("Running migrations...")
execSync("npm run migrate", { stdio: "inherit" })

console.log("Loading initial data...")
await loadInitialData()

console.log("Process completed successfully")
