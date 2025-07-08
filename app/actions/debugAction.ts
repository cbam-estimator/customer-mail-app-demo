"use server"

// A simple server action that returns a string
export async function debugAction(message: string) {
  console.log("Debug action called with:", message)
  return {
    success: true,
    message: `Debug action received: ${message}`,
    timestamp: new Date().toISOString(),
  }
}
