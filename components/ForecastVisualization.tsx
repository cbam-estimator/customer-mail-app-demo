"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from "chart.js"
import { Bar } from "react-chartjs-2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GoodsImportRow } from "@/types/excel"
import { Info, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RawDataTable } from "./RawDataTable"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler)

interface ForecastVisualizationProps {
  goodsImports?: GoodsImportRow[]
}

// Certificate price determination methods
type PriceMethod = "live" | "manual"

// Aggregation types for raw data
type AggregationType = "supplier" | "category" | "country" | "cnCode" | "goodsImport"

// Extract good category from CN code description
const extractGoodCategory = (cnCode: string): string => {
  // This is a simplified example - in a real app, you would have a mapping
  // of CN codes to categories or extract it from the description
  if (cnCode.startsWith("72") || cnCode.startsWith("73")) return "Iron and Steel"
  if (cnCode.startsWith("76")) return "Aluminum"
  if (cnCode.startsWith("25")) return "Cement"
  if (cnCode.startsWith("31")) return "Fertilizers"
  if (cnCode.startsWith("28")) return "Chemicals"
  return "Other"
}

// Extract country from manufacturer (simplified example)
const extractCountry = (manufacturer: string): string => {
  if (manufacturer?.includes("China")) return "China"
  if (manufacturer?.includes("Turkey")) return "Turkey"
  return "Other"
}

// Get the base timeframe for the forecast
const getBaseTimeframe = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed

  // Determine the end of the last quarter
  let endQuarterMonth, endQuarterYear

  if (currentMonth <= 3) {
    // Q4 of previous year
    endQuarterMonth = 12
    endQuarterYear = currentYear - 1
  } else if (currentMonth <= 6) {
    // Q1 of current year
    endQuarterMonth = 3
    endQuarterYear = currentYear
  } else if (currentMonth <= 9) {
    // Q2 of current year
    endQuarterMonth = 6
    endQuarterYear = currentYear
  } else {
    // Q3 of current year
    endQuarterMonth = 9
    endQuarterYear = currentYear
  }

  // Format the end date of the last quarter
  const endDate = `${endQuarterMonth === 3 ? "31" : endQuarterMonth === 6 ? "30" : endQuarterMonth === 9 ? "30" : "31"}/${endQuarterMonth < 10 ? "0" + endQuarterMonth : endQuarterMonth}/${endQuarterYear}`

  // Calculate the start date (one year before the end date)
  const startQuarterYear = endQuarterYear - 1

  // Format the start date
  const startDate = `${endQuarterMonth === 3 ? "31" : endQuarterMonth === 6 ? "30" : endQuarterMonth === 9 ? "30" : "31"}/${endQuarterMonth < 10 ? "0" + endQuarterMonth : endQuarterMonth}/${startQuarterYear}`

  return `${startDate} - ${endDate}`
}

// Default emissions data for goods without emissions data
const defaultEmissionsData = {
  ironAndSteel: 1.83, // tons CO2 per ton of product
  aluminum: 2.65,
  cement: 0.92,
  fertilizers: 1.45,
  chemicals: 1.2,
  other: 1.0,
}

export function ForecastVisualization({ goodsImports = [] }: ForecastVisualizationProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })
  const [totalEmissions, setTotalEmissions] = useState<number>(7656) // Set to 7,656 tons for demo purposes
  const [baseEmissions, setBaseEmissions] = useState<number>(7656) // Base emissions without defaults
  const [defaultEmissions, setDefaultEmissions] = useState<number>(2344) // Additional emissions from defaults
  const [isDataReady, setIsDataReady] = useState(true) // Set to true for demo purposes
  const [priceMethod, setPriceMethod] = useState<PriceMethod>("live")
  const [liveCertificatePrice, setLiveCertificatePrice] = useState<number>(65.72) // More realistic EU ETS price
  const [manualPrice, setManualPrice] = useState<number>(100)
  const [aggregationType, setAggregationType] = useState<AggregationType>("supplier")
  const [aggregatedData, setAggregatedData] = useState<any[]>([])
  const [editedGoodsImports, setEditedGoodsImports] = useState<Record<string, { quantity: number; items: number }>>({})
  const [modifiedImports, setModifiedImports] = useState<GoodsImportRow[]>([])

  // Filter states
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // Checkbox states
  const [useBenchmarkEstimates, setUseBenchmarkEstimates] = useState<boolean>(true)
  const [excludeIndirectEmissions, setExcludeIndirectEmissions] = useState<boolean>(true)
  const [includeDefaultData, setIncludeDefaultData] = useState<boolean>(false)

  // Phase-in factors for each year
  const phaseInFactors = {
    2026: 0.025, // 2.5%
    2027: 0.05, // 5%
    2028: 0.1, // 10%
    2029: 0.225, // 22.5%
    2030: 0.485, // 48.5%
    2031: 0.61, // 61%
    2032: 0.735, // 73.5%
    2033: 0.86, // 86%
    2034: 1.0, // 100%
  }

  // Get emissions breakdown text
  const getEmissionsBreakdownText = () => {
    return `${baseEmissions.toLocaleString()} tons CO₂`
  }

  // Extract unique suppliers, categories, and CN codes from goodsImports
  const { suppliers, categories, cnCodes } = useMemo(() => {
    const suppliersSet = new Set<string>()
    const categoriesSet = new Set<string>()
    const cnCodesSet = new Set<string>()

    goodsImports.forEach((item) => {
      if (item.manufacturer) suppliersSet.add(item.manufacturer)
      if (item.cnCode) {
        cnCodesSet.add(item.cnCode)
        const category = extractGoodCategory(item.cnCode)
        categoriesSet.add(category)
      }
    })

    return {
      suppliers: Array.from(suppliersSet).sort(),
      categories: Array.from(categoriesSet).sort(),
      cnCodes: Array.from(cnCodesSet).sort(),
    }
  }, [goodsImports])

  // Add these state variables at the top of the component
  const [supplierFilterOpen, setSupplierFilterOpen] = useState(false)
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false)
  const [cnCodeFilterOpen, setCnCodeFilterOpen] = useState(false)
  const [countryFilterOpen, setCountryFilterOpen] = useState(false)

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCnCodes, setSelectedCnCodes] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  // Add these refs
  const supplierFilterRef = useRef<HTMLDivElement>(null)
  const categoryFilterRef = useRef<HTMLDivElement>(null)
  const cnCodeFilterRef = useRef<HTMLDivElement>(null)
  const countryFilterRef = useRef<HTMLDivElement>(null)

  // Add this effect to handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (supplierFilterRef.current && !supplierFilterRef.current.contains(event.target as Node)) {
        setSupplierFilterOpen(false)
      }
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target as Node)) {
        setCategoryFilterOpen(false)
      }
      if (cnCodeFilterRef.current && !cnCodeFilterRef.current.contains(event.target as Node)) {
        setCnCodeFilterOpen(false)
      }
      if (countryFilterRef.current && !countryFilterRef.current.contains(event.target as Node)) {
        setCountryFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add these helper functions
  const toggleSupplierSelection = (supplier: string) => {
    setSelectedSuppliers((prev) => (prev.includes(supplier) ? prev.filter((s) => s !== supplier) : [...prev, supplier]))
  }

  const toggleCategorySelection = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleCnCodeSelection = (cnCode: string) => {
    setSelectedCnCodes((prev) => (prev.includes(cnCode) ? prev.filter((c) => c !== cnCode) : [...prev, cnCode]))
  }

  const toggleCountrySelection = (country: string) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  const selectAllSuppliers = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([])
    } else {
      setSelectedSuppliers([...suppliers])
    }
  }

  const selectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories([...categories])
    }
  }

  const selectAllCnCodes = () => {
    if (selectedCnCodes.length === cnCodes.length) {
      setSelectedCnCodes([])
    } else {
      setSelectedCnCodes([...cnCodes])
    }
  }

  const selectAllCountries = () => {
    const countries = Array.from(new Set(goodsImports.map((item) => extractCountry(item.manufacturer || ""))))
    if (selectedCountries.length === countries.length) {
      setSelectedCountries([])
    } else {
      setSelectedCountries([...countries])
    }
  }

  const clearAllFilters = () => {
    setSelectedSuppliers([])
    setSelectedCategories([])
    setSelectedCnCodes([])
    setSelectedCountries([])
  }

  const hasActiveFilters =
    selectedSuppliers.length > 0 ||
    selectedCategories.length > 0 ||
    selectedCnCodes.length > 0 ||
    selectedCountries.length > 0

  // Filter goodsImports based on selected filters
  const filteredGoodsImports = useMemo(() => {
    let filtered = goodsImports

    const hasSupplierFilter = selectedSuppliers.length > 0
    const hasCategoryFilter = selectedCategories.length > 0
    const hasCnCodeFilter = selectedCnCodes.length > 0
    const hasCountryFilter = selectedCountries.length > 0

    if (hasSupplierFilter || hasCategoryFilter || hasCnCodeFilter || hasCountryFilter) {
      filtered = goodsImports.filter((item) => {
        const matchesSupplier = !hasSupplierFilter || selectedSuppliers.includes(item.manufacturer || "")
        const matchesCategory =
          !hasCategoryFilter || selectedCategories.includes(extractGoodCategory(item.cnCode || ""))
        const matchesCnCode = !hasCnCodeFilter || selectedCnCodes.includes(item.cnCode || "")
        const matchesCountry = !hasCountryFilter || selectedCountries.includes(extractCountry(item.manufacturer || ""))

        return matchesSupplier && matchesCategory && matchesCnCode && matchesCountry
      })
    }

    // Apply any edits to the filtered imports
    return filtered.map((item) => {
      const itemId = `${item.manufacturer}-${item.cnCode}`
      const editedItem = editedGoodsImports[itemId]

      if (editedItem && editedItem.quantity) {
        return {
          ...item,
          quantity: editedItem.quantity * 1000, // Convert tons back to kg
        }
      }

      return item
    })
  }, [goodsImports, selectedSuppliers, selectedCategories, selectedCnCodes, selectedCountries, editedGoodsImports])

  // Reset all filters
  const resetFilters = () => {
    setSelectedSuppliers([])
    setSelectedCategories([])
    setSelectedCnCodes([])
    setSelectedCountries([])
  }

  // Check if any filter is active
  const isFilterActive =
    selectedSuppliers.length > 0 ||
    selectedCategories.length > 0 ||
    selectedCnCodes.length > 0 ||
    selectedCountries.length > 0

  // Calculate base emissions from goods imports and aggregate data
  useEffect(() => {
    if (filteredGoodsImports && filteredGoodsImports.length > 0) {
      // Calculate total emissions from goods imports
      let calculatedEmissions = 0
      let defaultEmissionsTotal = 0
      let goodsWithoutEmissions = 0

      // Prepare aggregation data structures
      const supplierData: Record<string, { emissions: number; quantity: number; items: number }> = {}
      const categoryData: Record<string, { emissions: number; quantity: number; items: number }> = {}
      const countryData: Record<string, { emissions: number; quantity: number; items: number }> = {}
      const cnCodeData: Record<string, { emissions: number; quantity: number; items: number }> = {}

      filteredGoodsImports.forEach((item) => {
        const seeDirect = item.seeDirect || 0
        // Only include indirect emissions if not excluded
        const seeIndirect = excludeIndirectEmissions ? 0 : item.seeIndirect || 0
        const totalSee = seeDirect + seeIndirect
        const quantity = item.quantity || 0
        const quantityInTons = quantity / 1000 // Convert kg to tons

        // Check if this item has emissions data
        const hasEmissionsData = totalSee > 0

        // Calculate emissions based on actual data
        const emissions = totalSee * quantityInTons
        calculatedEmissions += emissions

        // If no emissions data, calculate default emissions
        if (!hasEmissionsData && quantity > 0) {
          goodsWithoutEmissions++
          const category = extractGoodCategory(item.cnCode || "")
          let defaultEmissionFactor = defaultEmissionsData.other // Default to "other" if category not found

          // Determine emission factor based on category
          if (category === "Iron and Steel") defaultEmissionFactor = defaultEmissionsData.ironAndSteel
          else if (category === "Aluminum") defaultEmissionFactor = defaultEmissionsData.aluminum
          else if (category === "Cement") defaultEmissionFactor = defaultEmissionsData.cement
          else if (category === "Fertilizers") defaultEmissionFactor = defaultEmissionsData.fertilizers
          else if (category === "Chemicals") defaultEmissionFactor = defaultEmissionsData.chemicals

          // Calculate default emissions for this item
          const itemDefaultEmissions = defaultEmissionFactor * quantityInTons
          defaultEmissionsTotal += itemDefaultEmissions
        }

        // Aggregate by supplier
        const supplier = item.manufacturer || "Unknown"
        if (!supplierData[supplier]) {
          supplierData[supplier] = { emissions: 0, quantity: 0, items: 0 }
        }
        supplierData[supplier].emissions += emissions
        supplierData[supplier].quantity += quantityInTons
        supplierData[supplier].items += 1

        // Aggregate by category
        const category = extractGoodCategory(item.cnCode || "")
        if (!categoryData[category]) {
          categoryData[category] = { emissions: 0, quantity: 0, items: 0 }
        }
        categoryData[category].emissions += emissions
        categoryData[category].quantity += quantityInTons
        categoryData[category].items += 1

        // Aggregate by country
        const country = extractCountry(item.manufacturer || "")
        if (!countryData[country]) {
          countryData[country] = { emissions: 0, quantity: 0, items: 0 }
        }
        countryData[country].emissions += emissions
        countryData[country].quantity += quantityInTons
        countryData[country].items += 1

        // Aggregate by CN code
        const cnCode = item.cnCode || "Unknown"
        if (!cnCodeData[cnCode]) {
          cnCodeData[cnCode] = { emissions: 0, quantity: 0, items: 0 }
        }
        cnCodeData[cnCode].emissions += emissions
        cnCodeData[cnCode].quantity += quantityInTons
        cnCodeData[cnCode].items += 1
      })

      // If we have calculated emissions, use them, otherwise keep the default
      if (calculatedEmissions > 0) {
        // Apply benchmark estimates if enabled
        const finalBaseEmissions = useBenchmarkEstimates ? calculatedEmissions * 1.15 : calculatedEmissions
        setBaseEmissions(finalBaseEmissions)

        // Store default emissions
        setDefaultEmissions(defaultEmissionsTotal)

        // Calculate total emissions based on whether to include defaults
        const finalTotalEmissions = includeDefaultData ? finalBaseEmissions + defaultEmissionsTotal : finalBaseEmissions

        setTotalEmissions(finalTotalEmissions)
      }

      // Update aggregated data based on current aggregation type
      updateAggregatedData(supplierData, categoryData, countryData, cnCodeData)
    }
  }, [filteredGoodsImports, aggregationType, useBenchmarkEstimates, excludeIndirectEmissions, includeDefaultData])

  // Update aggregated data when aggregation type changes
  const updateAggregatedData = (
    supplierData: Record<string, any>,
    categoryData: Record<string, any>,
    countryData: Record<string, any>,
    cnCodeData: Record<string, any>,
  ) => {
    let data: any[] = []

    switch (aggregationType) {
      case "supplier":
        data = Object.entries(supplierData).map(([supplier, values]) => ({
          name: supplier,
          emissions: values.emissions,
          quantity: values.quantity,
          items: values.items,
          avgEmissions: values.emissions / values.quantity,
        }))
        break
      case "category":
        data = Object.entries(categoryData).map(([category, values]) => ({
          name: category,
          emissions: values.emissions,
          quantity: values.quantity,
          items: values.items,
          avgEmissions: values.emissions / values.quantity,
        }))
        break
      case "country":
        data = Object.entries(countryData).map(([country, values]) => ({
          name: country,
          emissions: values.emissions,
          quantity: values.quantity,
          items: values.items,
          avgEmissions: values.emissions / values.quantity,
        }))
        break
      case "cnCode":
        data = Object.entries(cnCodeData).map(([cnCode, values]) => ({
          name: cnCode,
          emissions: values.emissions,
          quantity: values.quantity,
          items: values.items,
          avgEmissions: values.emissions / values.quantity,
        }))
        break
    }

    // Sort by emissions (highest first)
    data.sort((a, b) => b.emissions - a.emissions)
    setAggregatedData(data)
  }

  // Handle manual price change
  const handleManualPriceChange = (price: string) => {
    const numericPrice = Number.parseFloat(price)
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      setManualPrice(numericPrice)
    }
  }

  // Calculate forecast data
  useEffect(() => {
    if (totalEmissions <= 0) {
      setChartData({
        labels: [],
        datasets: [],
      })
      return
    }

    try {
      const years = Object.keys(phaseInFactors).map((year) => Number.parseInt(year))

      // Calculate costs for each year based on the selected price method
      const costs = years.map((year) => {
        const phaseFactor = phaseInFactors[year as keyof typeof phaseInFactors]
        let certificatePrice = 0

        // Determine certificate price based on selected method
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

        return ((totalEmissions * phaseFactor * certificatePrice )*100000);
      })

      setChartData({
        labels: years,
        datasets: [
          {
            label: "Annual CBAM Costs",
            data: costs,
            backgroundColor: "#2f4269", // Medium blue like in emissions tab
            borderColor: "#2f4269", // Match background color to remove outline
            borderWidth: 0, // Remove border
          },
        ],
      })
    } catch (error) {
      console.error("Error calculating forecast data:", error)
      setChartData({
        labels: [],
        datasets: [],
      })
    }
  }, [totalEmissions, priceMethod, liveCertificatePrice, manualPrice])

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
        titleFont: {
          weight: "bold",
          size: 14,
        },
        bodyFont: {
          weight: "bold",
          size: 14,
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: () => "", // Remove title
          label: (context: any) => {
            if (context.parsed.y !== null) {
              return new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(context.parsed.y)
            }
            return ""
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          display: true, // Keep year labels
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Annual CBAM Costs (€)",
          font: {
            size: 14,
            weight: "bold",
          },
          padding: {
            top: 0,
            bottom: 10,
          },
        },
        ticks: {
          callback: (value: any) => {
            if (value >= 1000000) {
              return (value / 1000000).toLocaleString() + " M €"
            } else if (value >= 1000) {
              return (value / 1000).toLocaleString() + " K €"
            }
            return value + " €"
          },
          maxTicksLimit: 8,
          padding: 10,
          display: true, // Keep y-axis labels
        },
        suggestedMin: 0,
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    elements: {
      point: {
        radius: 6, // Show points with this radius
        hoverRadius: 8, // Slightly larger on hover
        hitRadius: 10, // Area for hit detection
        borderWidth: 2, // Border width for points
      },
      line: {
        tension: 0.3,
        borderWidth: 4,
      },
    },
    // Disable all animations to prevent any values from appearing
    animation: {
      duration: 0,
    },
  }

  // Get the price method description
  const getPriceMethodDescription = () => {
    switch (priceMethod) {
      case "live":
        return "Using current EU-ETS price"
      case "manual":
        return "Using custom price values"
      default:
        return "Using current EU-ETS price"
    }
  }

  // Get the aggregation type label
  const getAggregationTypeLabel = () => {
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

  // Calculate forecast costs for a specific entity
  const calculateForecastCosts = (baseEmissions: number) => {
    const years = Object.keys(phaseInFactors).map((year) => Number.parseInt(year))

    return years.map((year) => {
      const phaseFactor = phaseInFactors[year as keyof typeof phaseInFactors]
      let certificatePrice = 0

      // Determine certificate price based on selected method
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

      return {
        year,
        cost: baseEmissions * phaseFactor * certificatePrice,
        phaseFactor,
        certificatePrice,
      }
    })
  }

  // Initialize edited goods imports
  useEffect(() => {
    const initialEdits: Record<string, { quantity: number; items: number }> = {}

    goodsImports.forEach((item) => {
      const itemId = `${item.manufacturer}-${item.cnCode}`
      initialEdits[itemId] = {
        items: 1,
        quantity: (item.quantity || 0) / 1000, // Convert kg to tons
      }
    })

    setEditedGoodsImports(initialEdits)
  }, [goodsImports])

  // Handle edits to goods imports
  const handleGoodsImportEdit = (id: string, field: "items" | "quantity", value: number) => {
    // Update the edited values
    setEditedGoodsImports((prev) => {
      const newEdits = { ...prev }
      if (!newEdits[id]) {
        newEdits[id] = { items: 1, quantity: 0 }
      }
      newEdits[id][field] = value
      return newEdits
    })
  }

  // Calculate row data for the goods import table
  const calculateRowData = (item: GoodsImportRow, index: number) => {
    const itemId = `${item.manufacturer}-${item.cnCode}`
    const seeDirect = item.seeDirect || 0
    const seeIndirect = excludeIndirectEmissions ? 0 : item.seeIndirect || 0
    const totalSee = seeDirect + seeIndirect

    // Use edited quantity if available
    const editedItem = editedGoodsImports[itemId]
    const quantityInTons = editedItem?.quantity || (item.quantity || 0) / 1000

    // Calculate emissions based on the edited quantity
    const emissions = totalSee * quantityInTons
    const avgEmissions = quantityInTons > 0 ? emissions / quantityInTons : 0

    // Calculate CBAM cost
    const certificatePrice = priceMethod === "live" ? liveCertificatePrice : manualPrice
    const cbamCost = emissions * certificatePrice

    // Calculate percentage of total
    const percentOfTotal = totalEmissions > 0 ? (emissions / totalEmissions) * 100 : 0

    return {
      itemId,
      manufacturer: item.manufacturer || "Unknown",
      country: extractCountry(item.manufacturer || ""),
      cnCode: item.cnCode || "Unknown",
      items: editedItem?.items || 1,
      quantity: quantityInTons,
      emissions,
      avgEmissions,
      cbamCost,
      percentOfTotal,
    }
  }

  return (
    <>
      {/* Certificate Price Determination - moved to top */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-medium mb-3">Certificate Price Determination</h4>
        <RadioGroup
          value={priceMethod}
          onValueChange={(value) => setPriceMethod(value as PriceMethod)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="live" id="live" />
            <Label htmlFor="live">Live Certificate Price</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Manual Input</Label>
          </div>
        </RadioGroup>

        {priceMethod === "live" && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Current EU Carbon Permits (EUR)</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-green-600 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    65.72
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Last Updated</div>
                <div className="text-sm">Apr 12, 2024</div>
              </div>
            </div>
          </div>
        )}

        {priceMethod === "manual" && (
          <div className="mt-4 pt-4 border-t">
            <Label htmlFor="manual-price">Certificate Price (€/ton CO₂)</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="manual-price"
                type="number"
                min="0"
                value={manualPrice}
                onChange={(e) => handleManualPriceChange(e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-gray-500">€/ton</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This price will be applied to all years in the forecast (2026-2034).
            </p>
          </div>
        )}
      </div>

      {/* Filter container */}
      <div className="mb-6 p-3 bg-neutral-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Filter Options</div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-col gap-3 mt-3">
            <div className="flex items-center justify-end">
              {isFilterActive && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7 px-2">
                  Reset filters
                </Button>
              )}
            </div>

            <div>
              {/* Selected filter tags */}
              {hasActiveFilters && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedSuppliers.map((supplier) => (
                    <div
                      key={supplier}
                      className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md flex items-center"
                    >
                      {supplier}
                      <button
                        onClick={() => toggleSupplierSelection(supplier)}
                        className="ml-1 text-orange-800 hover:text-orange-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {selectedCategories.map((category) => (
                    <div
                      key={category}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center"
                    >
                      {category}
                      <button
                        onClick={() => toggleCategorySelection(category)}
                        className="ml-1 text-blue-800 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {selectedCnCodes.map((cnCode) => (
                    <div
                      key={cnCode}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md flex items-center"
                    >
                      {cnCode}
                      <button
                        onClick={() => toggleCnCodeSelection(cnCode)}
                        className="ml-1 text-green-800 hover:text-green-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {selectedCountries.map((country) => (
                    <div
                      key={country}
                      className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-md flex items-center"
                    >
                      {country}
                      <button
                        onClick={() => toggleCountrySelection(country)}
                        className="ml-1 text-purple-800 hover:text-purple-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={clearAllFilters}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md hover:bg-gray-200"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Supplier filter */}
                <div className="relative" ref={supplierFilterRef}>
                  <button
                    onClick={() => {
                      setSupplierFilterOpen(!supplierFilterOpen)
                      setCategoryFilterOpen(false)
                      setCnCodeFilterOpen(false)
                      setCountryFilterOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white"
                  >
                    <span>Suppliers ({selectedSuppliers.length || "All"})</span>
                    <span>{supplierFilterOpen ? "▲" : "▼"}</span>
                  </button>

                  {supplierFilterOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="px-3 py-2 border-b cursor-pointer hover:bg-gray-50" onClick={selectAllSuppliers}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSuppliers.length === suppliers.length && suppliers.length > 0}
                            onChange={selectAllSuppliers}
                            className="mr-2"
                          />
                          <span>Select All</span>
                        </div>
                      </div>

                      {suppliers.map((supplier) => (
                        <div
                          key={supplier}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleSupplierSelection(supplier)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedSuppliers.includes(supplier)}
                                onChange={() => toggleSupplierSelection(supplier)}
                                className="mr-2"
                              />
                              <span>{supplier}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              ({goodsImports.filter((item) => item.manufacturer === supplier).length})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category filter */}
                <div className="relative" ref={categoryFilterRef}>
                  <button
                    onClick={() => {
                      setCategoryFilterOpen(!categoryFilterOpen)
                      setSupplierFilterOpen(false)
                      setCnCodeFilterOpen(false)
                      setCountryFilterOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white"
                  >
                    <span>Categories ({selectedCategories.length || "All"})</span>
                    <span>{categoryFilterOpen ? "▲" : "▼"}</span>
                  </button>

                  {categoryFilterOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="px-3 py-2 border-b cursor-pointer hover:bg-gray-50" onClick={selectAllCategories}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.length === categories.length && categories.length > 0}
                            onChange={selectAllCategories}
                            className="mr-2"
                          />
                          <span>Select All</span>
                        </div>
                      </div>

                      {categories.map((category) => (
                        <div
                          key={category}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCategorySelection(category)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={() => toggleCategorySelection(category)}
                                className="mr-2"
                              />
                              <span>{category}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              (
                              {
                                goodsImports.filter((item) => extractGoodCategory(item.cnCode || "") === category)
                                  .length
                              }
                              )
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CN Code filter */}
                <div className="relative" ref={cnCodeFilterRef}>
                  <button
                    onClick={() => {
                      setCnCodeFilterOpen(!cnCodeFilterOpen)
                      setSupplierFilterOpen(false)
                      setCategoryFilterOpen(false)
                      setCountryFilterOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white"
                  >
                    <span>CN Codes ({selectedCnCodes.length || "All"})</span>
                    <span>{cnCodeFilterOpen ? "▲" : "▼"}</span>
                  </button>

                  {cnCodeFilterOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="px-3 py-2 border-b cursor-pointer hover:bg-gray-50" onClick={selectAllCnCodes}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCnCodes.length === cnCodes.length && cnCodes.length > 0}
                            onChange={selectAllCnCodes}
                            className="mr-2"
                          />
                          <span>Select All</span>
                        </div>
                      </div>

                      {cnCodes.map((cnCode) => (
                        <div
                          key={cnCode}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCnCodeSelection(cnCode)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedCnCodes.includes(cnCode)}
                                onChange={() => toggleCnCodeSelection(cnCode)}
                                className="mr-2"
                              />
                              <span>{cnCode}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              ({goodsImports.filter((item) => item.cnCode === cnCode).length})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Country filter */}
                <div className="relative" ref={countryFilterRef}>
                  <button
                    onClick={() => {
                      setCountryFilterOpen(!countryFilterOpen)
                      setSupplierFilterOpen(false)
                      setCategoryFilterOpen(false)
                      setCnCodeFilterOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white"
                  >
                    <span>Countries ({selectedCountries.length || "All"})</span>
                    <span>{countryFilterOpen ? "▲" : "▼"}</span>
                  </button>

                  {countryFilterOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="px-3 py-2 border-b cursor-pointer hover:bg-gray-50" onClick={selectAllCountries}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedCountries.length ===
                              Array.from(new Set(goodsImports.map((item) => extractCountry(item.manufacturer || ""))))
                                .length
                            }
                            onChange={selectAllCountries}
                            className="mr-2"
                          />
                          <span>Select All</span>
                        </div>
                      </div>

                      {Array.from(new Set(goodsImports.map((item) => extractCountry(item.manufacturer || "")))).map(
                        (country) => (
                          <div
                            key={country}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleCountrySelection(country)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedCountries.includes(country)}
                                  onChange={() => toggleCountrySelection(country)}
                                  className="mr-2"
                                />
                                <span>{country}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                (
                                {
                                  goodsImports.filter((item) => extractCountry(item.manufacturer || "") === country)
                                    .length
                                }
                                )
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <Card className="w-full border-0 bg-neutral-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-benchmark"
                    checked={useBenchmarkEstimates}
                    onCheckedChange={(checked) => setUseBenchmarkEstimates(checked as boolean)}
                    disabled
                  />
                  <Label htmlFor="use-benchmark" className="text-sm font-medium text-gray-400 cursor-not-allowed">
                    Use benchmark estimates (coming soon)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-default-data"
                    checked={includeDefaultData}
                    onCheckedChange={(checked) => setIncludeDefaultData(checked as boolean)}
                  />
                  <Label htmlFor="include-default-data" className="text-sm font-medium cursor-pointer">
                    Include default data for goods imports without emissions
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">Based on {getEmissionsBreakdownText()}</div>
              </div>
            </div>

            <div className="h-[500px] mb-4">
              {isDataReady && chartData.labels && chartData.labels.length > 0 ? (
                <div className="relative h-full">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "bottom",
                        },
                        title: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              return new Intl.NumberFormat("de-DE", {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 0,
                              }).format(context.raw as number)
                            },
                          },
                        },
                        datalabels: {
                          display: true,
                          anchor: "end",
                          align: "top",
                          formatter: (value) => {
                            return new Intl.NumberFormat("de-DE", {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            }).format(value)
                          },
                          font: {
                            weight: "bold",
                            size: 12,
                          },
                          color: "#000000",
                          padding: {
                            top: 6,
                          },
                          textAlign: "center",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Annual CBAM Costs (€)",
                            font: {
                              size: 14,
                              weight: "bold",
                            },
                          },
                          ticks: {
                            callback: (value: any) => {
                              if (value >= 1000000) {
                                return ((value as number) / 1000000).toLocaleString() + " M €"
                              } else if (value >= 1000) {
                                return ((value as number) / 1000).toLocaleString() + " K €"
                              }
                              return value + " €"
                            },
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: "Year",
                            font: {
                              size: 14,
                              weight: "bold",
                            },
                          },
                        },
                      },
                      layout: {
                        padding: {
                          top: 80,
                        },
                      },
                    }}
                    data={{
                      labels: chartData.labels,
                      datasets: [
                        {
                          label: "Annual CBAM Costs",
                          data: chartData.datasets[0].data,
                          backgroundColor: "#2f4269",
                          borderColor: "#2f4269",
                          borderWidth: 0,
                        },
                      ],
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500">No data available for forecast.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Import data with emissions information to see forecasts.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 bg-white p-3 rounded-md border border-gray-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Base timeframe for this forecast:</p>
                  <p>
                    This forecast uses goods imports data from the past year, ending at the last completed quarter.
                    Current base period: {getBaseTimeframe()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full mt-8 border">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-xl font-semibold">Raw Data</CardTitle>
          </CardHeader>
          <div className="px-4 py-3 border-b bg-neutral-50">
            <TabsList>
              <TabsTrigger
                value="goodsImport"
                onClick={() => setAggregationType("goodsImport" as AggregationType)}
                className={aggregationType === "goodsImport" ? "bg-white" : ""}
              >
                By Goods Import
              </TabsTrigger>
              <TabsTrigger
                value="supplier"
                onClick={() => setAggregationType("supplier" as AggregationType)}
                className={aggregationType === "supplier" ? "bg-white" : ""}
              >
                By Supplier
              </TabsTrigger>
              <TabsTrigger
                value="category"
                onClick={() => setAggregationType("category" as AggregationType)}
                className={aggregationType === "category" ? "bg-white" : ""}
              >
                By Product Category
              </TabsTrigger>
              <TabsTrigger
                value="country"
                onClick={() => setAggregationType("country" as AggregationType)}
                className={aggregationType === "country" ? "bg-white" : ""}
              >
                By Export Country
              </TabsTrigger>
              <TabsTrigger
                value="cnCode"
                onClick={() => setAggregationType("cnCode" as AggregationType)}
                className={aggregationType === "cnCode" ? "bg-white" : ""}
              >
                By CN Code
              </TabsTrigger>
            </TabsList>
          </div>
          {aggregationType === "goodsImport" ? (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-2 border-b font-medium text-sm">Supplier</th>
                      <th className="p-2 border-b font-medium text-sm">Export Country</th>
                      <th className="p-2 border-b font-medium text-sm">CN Code</th>
                      <th className="p-2 border-b font-medium text-sm"># Items</th>
                      <th className="p-2 border-b font-medium text-sm">Import Quantity (tons)</th>
                      <th className="p-2 border-b font-medium text-sm">Base Emissions (tCO₂)</th>
                      <th className="p-2 border-b font-medium text-sm">Avg Emissions (tCO₂/t)</th>
                      <th className="p-2 border-b font-medium text-sm">CBAM Cost (€)</th>
                      <th className="p-2 border-b font-medium text-sm">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGoodsImports.map((item, index) => {
                      const rowData = calculateRowData(item, index)

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{rowData.manufacturer}</td>
                          <td className="p-2">{rowData.country}</td>
                          <td className="p-2">{rowData.cnCode}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              value={rowData.items}
                              onChange={(e) => handleGoodsImportEdit(rowData.itemId, "items", Number(e.target.value))}
                              className="w-20 h-8 text-sm"
                              onFocus={(e) => e.target.select()}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={rowData.quantity.toFixed(2)}
                              onChange={(e) =>
                                handleGoodsImportEdit(rowData.itemId, "quantity", Number(e.target.value))
                              }
                              className="w-24 h-8 text-sm"
                              onFocus={(e) => e.target.select()}
                            />
                          </td>
                          <td className="p-2">{rowData.emissions.toFixed(2)}</td>
                          <td className="p-2">{rowData.avgEmissions.toFixed(2)}</td>
                          <td className="p-2">
                            {new Intl.NumberFormat("de-DE", {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            }).format(rowData.cbamCost)}
                          </td>
                          <td className="p-2">{rowData.percentOfTotal.toFixed(2)}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <RawDataTable
              data={aggregatedData}
              aggregationType={aggregationType}
              priceMethod={priceMethod}
              liveCertificatePrice={liveCertificatePrice}
              manualPrice={manualPrice}
            />
          )}
        </Card>
      </div>
    </>
  )
}
