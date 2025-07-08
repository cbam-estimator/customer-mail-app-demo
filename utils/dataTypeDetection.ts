export type DataType = "INT" | "NUM" | "TXT" | "CNC" | "MIXED"

export function detectDataType(value: any): DataType {
  // Handle non-string values
  if (typeof value !== "string") {
    if (typeof value === "number") {
      return Number.isInteger(value) ? "INT" : "NUM"
    }
    return "TXT"
  }

  // Trim whitespace and handle empty strings
  const trimmedValue = value.trim()
  if (trimmedValue === "") return "TXT"

  // Check for CNC (8-digit code or list of 8-digit codes)
  const cncRegex = /^(\d{8}(,|;)?)+$/
  if (cncRegex.test(trimmedValue.replace(/\s/g, ""))) return "CNC"

  // Check for INT
  if (/^-?\d+$/.test(trimmedValue)) return "INT"

  // Check for NUM (allowing both . and , as decimal separators)
  if (/^-?\d+([.,]\d+)?$/.test(trimmedValue)) return "NUM"

  // If none of the above, it's TXT
  return "TXT"
}

export function getColumnDataType(data: any[]): DataType {
  if (data.length === 0) return "TXT"

  const types = data.map((value) => detectDataType(value))
  const uniqueTypes = new Set(types)

  if (uniqueTypes.size === 1) {
    return types[0]
  } else if (uniqueTypes.size === 2 && uniqueTypes.has("INT") && uniqueTypes.has("NUM")) {
    return "NUM"
  } else {
    return "MIXED"
  }
}
