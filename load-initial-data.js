import { loadInitialData } from "./scripts/loadInitialData.ts"

console.log("Starting to load initial data...")

try {
  await loadInitialData()
  console.log("Initial data loaded successfully")
} catch (error) {
  console.error("Error loading initial data:", error)
}
