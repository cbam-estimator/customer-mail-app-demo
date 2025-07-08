"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { testDatabaseConnection } from "@/lib/db/config"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Database } from "lucide-react"

export function DatabaseTestPopup() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    data: any
  } | null>(null)

  const runTest = async () => {
    setIsLoading(true)
    try {
      const result = await testDatabaseConnection()
      setTestResult(result)

      toast({
        title: result.success ? "Database Connection Successful" : "Database Connection Failed",
        description: (
          <div className="mt-2">
            <p>{result.message}</p>
            {result.success && result.data && (
              <div className="mt-2 max-h-40 overflow-auto text-xs bg-slate-100 p-2 rounded">
                <p className="font-semibold">Sample data:</p>
                <pre>{JSON.stringify(result.data.slice(0, 2), null, 2)}</pre>
              </div>
            )}
          </div>
        ),
        variant: result.success ? "default" : "destructive",
        duration: 5000,
      })
    } catch (error) {
      console.error("Error testing database:", error)
      toast({
        title: "Error Testing Database",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="absolute bottom-4 right-4">
      <Button variant="outline" size="sm" onClick={runTest} disabled={isLoading} className="flex items-center gap-2">
        <Database className="h-4 w-4" />
        {isLoading ? "Testing..." : "Test DB Connection"}
      </Button>

      {testResult && (
        <div
          className={`mt-2 text-xs p-2 rounded-md ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          <div className="flex items-center gap-1">
            {testResult.success ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            <span>{testResult.success ? "Connected" : "Failed"}</span>
          </div>
        </div>
      )}
    </div>
  )
}
