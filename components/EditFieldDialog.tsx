"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Add import for the DatePicker component
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Update the EditFieldDialogProps interface to include "date" as a field type
interface EditFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingField: {
    tableName: string
    recordId: number
    fieldName: string
    fieldValue: any
    fieldType: "text" | "number" | "textarea" | "select" | "date"
    selectOptions?: { value: string; label: string }[]
  } | null
  onSave: (newValue: any) => Promise<{ success: boolean; message: string }>
}

export function EditFieldDialog({ open, onOpenChange, editingField, onSave }: EditFieldDialogProps) {
  const [value, setValue] = React.useState<any>(editingField?.fieldValue || "")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [rawResponse, setRawResponse] = React.useState<string | null>(null)

  // Update the useEffect to handle date values
  React.useEffect(() => {
    if (editingField) {
      if (editingField.fieldType === "date" && editingField.fieldValue) {
        // Convert Unix timestamp to Date object
        const date = new Date(Number.parseInt(editingField.fieldValue) * 1000)
        setValue(date)
      } else {
        setValue(editingField.fieldValue)
      }
      setError(null)
      setRawResponse(null)
    }
  }, [editingField])

  // Update the handleSave function to handle date values
  const handleSave = async () => {
    if (!editingField) return

    setIsLoading(true)
    setError(null)
    setRawResponse(null)

    try {
      let processedValue = value

      if (editingField.fieldType === "number" && value !== "") {
        processedValue = Number(value)
      } else if (editingField.fieldType === "date" && value instanceof Date) {
        // Convert Date to Unix timestamp (seconds since epoch)
        processedValue = Math.floor(value.getTime() / 1000).toString()
      }

      const response = await onSave(processedValue)

      setRawResponse(JSON.stringify(response, null, 2))

      if (response.success) {
        onOpenChange(false)
      } else {
        setError(response.message || "Unknown error occurred")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Field</AlertDialogTitle>
          <AlertDialogDescription>
            {editingField ? `Editing ${editingField.fieldName} in ${editingField.tableName}` : "No field selected"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {editingField ? (
          <div className="grid gap-4 py-4">
            {editingField.fieldType === "text" && (
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input id="value" value={value} onChange={(e) => setValue(e.target.value)} disabled={isLoading} />
              </div>
            )}
            {editingField.fieldType === "number" && (
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
            {editingField.fieldType === "textarea" && (
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Textarea id="value" value={value} onChange={(e) => setValue(e.target.value)} disabled={isLoading} />
              </div>
            )}
            {editingField.fieldType === "select" && editingField.selectOptions && (
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Select value={value} onValueChange={setValue} disabled={isLoading}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a value" />
                  </SelectTrigger>
                  <SelectContent>
                    {editingField.selectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {editingField.fieldType === "date" && (
              <div className="grid gap-2">
                <Label htmlFor="date-picker">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-picker"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {value instanceof Date ? format(value, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={value instanceof Date ? value : undefined}
                      onSelect={setValue}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {rawResponse && (
              <div className="text-xs bg-gray-100 p-2 rounded">
                <p className="font-semibold">Raw Response:</p>
                <pre className="whitespace-pre-wrap">{rawResponse}</pre>
              </div>
            )}
          </div>
        ) : (
          <p>No field selected</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading} onClick={handleSave}>
            {isLoading ? "Saving..." : "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
