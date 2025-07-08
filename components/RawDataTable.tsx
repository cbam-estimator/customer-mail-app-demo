"use client"

import { ScrollArea } from "@/components/ui/scroll-area"

// Certificate price determination methods
type PriceMethod = "live" | "manual"

// Aggregation types for raw data
type AggregationType = "supplier" | "category" | "country" | "cnCode"

interface RawDataTableProps {
  data: any[]
  aggregationType: AggregationType
  priceMethod: PriceMethod
  liveCertificatePrice: number
  manualPrice: number
}

export function RawDataTable({
  data,
  aggregationType,
  priceMethod,
  liveCertificatePrice,
  manualPrice,
}: RawDataTableProps) {
  // Get the header label based on aggregation type
  const getHeaderLabel = () => {
    switch (aggregationType) {
      case "supplier":
        return "Supplier"
      case "category":
        return "Product Category"
      case "country":
        return "Export Country"
      case "cnCode":
        return "CN Code"
    }
  }

  return (
    <div className="rounded-md p-0 overflow-hidden">
      <ScrollArea>
        <div className="relative min-w-[600px]">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 font-medium text-left border-b text-muted-foreground">{getHeaderLabel()}</th>
                <th className="px-4 py-2 font-medium text-left border-b [&:not([:first-child])]:border-l text-muted-foreground">
                  # Items
                </th>
                <th className="px-4 py-2 font-medium text-left border-b [&:not([:first-child])]:border-l text-muted-foreground">
                  Import Quantity (tons)
                </th>
                <th className="px-4 py-2 font-medium text-left border-b [&:not([:first-child])]:border-l text-muted-foreground">
                  Base Emissions (tCO₂)
                </th>
                <th className="px-4 py-2 font-medium text-left border-b [&:not([:first-child])]:border-l text-muted-foreground">
                  Avg Emissions (tCO₂/t)
                </th>
                <th className="px-4 py-2 font-medium text-left border-b [&:not([:first-child])]:border-l text-muted-foreground">
                  CBAM Cost (€)
                </th>
                <th className="px-4 py-2 font-medium text-left border-b [&:not([:first-child])]:border-l text-muted-foreground">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((item, index) => {
                  const totalEmissions = data.reduce((sum, i) => sum + i.emissions, 0)
                  const percentage = totalEmissions > 0 ? (item.emissions / totalEmissions) * 100 : 0

                  // Calculate CBAM cost based on current certificate price
                  let certificatePrice = 0
                  switch (priceMethod) {
                    case "live":
                      certificatePrice = liveCertificatePrice
                      break
                    case "manual":
                      certificatePrice = manualPrice
                      break
                    default:
                      certificatePrice = liveCertificatePrice
                      break
                  }
                  const cbamCost = item.emissions * certificatePrice

                  return (
                    <tr key={index} className="border-b transition-colors hover:bg-accent hover:text-accent-foreground">
                      <td className="p-4">{item.name}</td>
                      <td className="p-4 [&:not([:first-child])]:border-l">{item.items}</td>
                      <td className="p-4 [&:not([:first-child])]:border-l">{item.quantity.toLocaleString()}</td>
                      <td className="p-4 [&:not([:first-child])]:border-l">{item.emissions.toLocaleString()}</td>
                      <td className="p-4 [&:not([:first-child])]:border-l">
                        {(item.avgEmissions || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 [&:not([:first-child])]:border-l">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        }).format(cbamCost)}
                      </td>
                      <td className="p-4 [&:not([:first-child])]:border-l">
                        {percentage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  )
}
