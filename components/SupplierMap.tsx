"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { GoodsImportRow } from "@/types/excel"
import { X, BarChart3, Globe } from "lucide-react"

// Fix Leaflet icon issues
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"

// Define supplier interface with coordinates
interface SupplierWithLocation {
  id: number
  name: string
  country: string
  city?: string
  coordinates: [number, number] // [latitude, longitude]
  totalImports?: number
  totalEmissions?: number
}

// Mock data for supplier locations
const supplierLocations: Record<string, [number, number]> = {
  China: [35.8617, 104.1954],
  Germany: [51.1657, 10.4515],
  "United States": [37.0902, -95.7129],
  India: [20.5937, 78.9629],
  Japan: [36.2048, 138.2529],
  "South Korea": [35.9078, 127.7669],
  Turkey: [38.9637, 35.2433],
  Italy: [41.8719, 12.5674],
  France: [46.2276, 2.2137],
  Spain: [40.4637, -3.7492],
  "United Kingdom": [55.3781, -3.436],
  Russia: [61.524, 105.3188],
  Brazil: [-14.235, -51.9253],
  Australia: [-25.2744, 133.7751],
  Canada: [56.1304, -106.3468],
}

// Add some city variations for each country to distribute markers
const citiesPerCountry: Record<string, Array<{ name: string; coordinates: [number, number] }>> = {
  China: [
    { name: "Beijing", coordinates: [39.9042, 116.4074] },
    { name: "Shanghai", coordinates: [31.2304, 121.4737] },
    { name: "Guangzhou", coordinates: [23.1291, 113.2644] },
    { name: "Shenzhen", coordinates: [22.5431, 114.0579] },
  ],
  Germany: [
    { name: "Berlin", coordinates: [52.52, 13.405] },
    { name: "Munich", coordinates: [48.1351, 11.582] },
    { name: "Hamburg", coordinates: [53.5511, 9.9937] },
    { name: "Frankfurt", coordinates: [50.1109, 8.6821] },
  ],
  "United States": [
    { name: "New York", coordinates: [40.7128, -74.006] },
    { name: "Los Angeles", coordinates: [34.0522, -118.2437] },
    { name: "Chicago", coordinates: [41.8781, -87.6298] },
    { name: "Houston", coordinates: [29.7604, -95.3698] },
  ],
  // Add more countries as needed
}

// Custom marker icon
const createCustomIcon = (color = "#3b82f6") => {
  return new L.Icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: `custom-marker-${color.replace("#", "")}`,
  })
}

interface SupplierMapProps {
  suppliers: string[]
  goodsImports: GoodsImportRow[]
}

export default function SupplierMap({ suppliers, goodsImports }: SupplierMapProps) {
  const [suppliersWithLocations, setSuppliersWithLocations] = useState<SupplierWithLocation[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithLocation | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0])
  const [mapZoom, setMapZoom] = useState(2)

  // Generate supplier data with locations
  useEffect(() => {
    const generatedSuppliers: SupplierWithLocation[] = suppliers.map((name, index) => {
      // Assign a random country from the list
      const countries = Object.keys(supplierLocations)
      const country = countries[Math.floor(Math.random() * countries.length)]

      // Get a random city from the country or use country coordinates with slight offset
      let coordinates: [number, number]
      let city: string | undefined

      if (citiesPerCountry[country] && citiesPerCountry[country].length > 0) {
        const cityData = citiesPerCountry[country][Math.floor(Math.random() * citiesPerCountry[country].length)]
        city = cityData.name
        coordinates = cityData.coordinates
      } else {
        // Add small random offset to country coordinates to avoid overlapping
        const baseCoords = supplierLocations[country]
        coordinates = [baseCoords[0] + (Math.random() - 0.5) * 2, baseCoords[1] + (Math.random() - 0.5) * 2]
      }

      // Calculate total imports and emissions for this supplier
      const supplierImports = goodsImports.filter((item) => item.manufacturer === name)
      const totalImports = supplierImports.reduce((sum, item) => sum + item.quantity, 0)
      const totalEmissions = supplierImports.reduce((sum, item) => {
        const directEmissions = (item.seeDirect || 0) * item.quantity
        const indirectEmissions = (item.seeIndirect || 0) * item.quantity
        return sum + directEmissions + indirectEmissions
      }, 0)

      return {
        id: index + 1,
        name,
        country,
        city,
        coordinates,
        totalImports,
        totalEmissions,
      }
    })

    setSuppliersWithLocations(generatedSuppliers)
  }, [suppliers, goodsImports])

  // Handle supplier selection
  const handleSupplierClick = (supplier: SupplierWithLocation) => {
    setSelectedSupplier(supplier)
    setIsPanelOpen(true)
  }

  // Close the side panel
  const closePanel = () => {
    setIsPanelOpen(false)
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 })
  }

  // Calculate averages for comparison
  const calculateAverages = (supplier: SupplierWithLocation) => {
    // National average (suppliers from same country)
    const countrySuppliers = suppliersWithLocations.filter((s) => s.country === supplier.country)
    const nationalAvgEmissions =
      countrySuppliers.reduce((sum, s) => sum + (s.totalEmissions || 0), 0) / countrySuppliers.length

    // Global average (all suppliers)
    const globalAvgEmissions =
      suppliersWithLocations.reduce((sum, s) => sum + (s.totalEmissions || 0), 0) / suppliersWithLocations.length

    // Importer's average (custom calculation - using 90% of global as an example)
    const importerAvgEmissions = globalAvgEmissions * 0.9

    return {
      national: nationalAvgEmissions,
      global: globalAvgEmissions,
      importer: importerAvgEmissions,
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount()
            return L.divIcon({
              html: `<div class="cluster-marker">${count}</div>`,
              className: "custom-marker-cluster",
              iconSize: L.point(40, 40),
            })
          }}
        >
          {suppliersWithLocations.map((supplier) => (
            <Marker
              key={supplier.id}
              position={supplier.coordinates}
              icon={createCustomIcon()}
              eventHandlers={{
                click: () => handleSupplierClick(supplier),
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm">{supplier.name}</h3>
                  <p className="text-xs">
                    {supplier.city ? `${supplier.city}, ` : ""}
                    {supplier.country}
                  </p>
                  {supplier.totalImports && (
                    <p className="text-xs mt-1">
                      <span className="font-semibold">Imports:</span> {formatNumber(supplier.totalImports)} kg
                    </p>
                  )}
                  {supplier.totalEmissions && (
                    <p className="text-xs">
                      <span className="font-semibold">Emissions:</span> {formatNumber(supplier.totalEmissions)} tCO₂
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Side Panel */}
      <div
        className={`absolute top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-y-auto ${
          isPanelOpen ? "w-96" : "w-0"
        }`}
      >
        {selectedSupplier && isPanelOpen && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedSupplier.name}</h2>
              <button onClick={closePanel} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center text-gray-600 mb-2">
                <Globe className="h-4 w-4 mr-2" />
                <span>
                  {selectedSupplier.city ? `${selectedSupplier.city}, ` : ""}
                  {selectedSupplier.country}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Total Imports</div>
                  <div className="text-xl font-semibold text-blue-700 mt-1">
                    {formatNumber(selectedSupplier.totalImports || 0)} kg
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Total Emissions</div>
                  <div className="text-xl font-semibold text-green-700 mt-1">
                    {formatNumber(selectedSupplier.totalEmissions || 0)} tCO₂
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
                Emissions Comparison
              </h3>

              {selectedSupplier.totalEmissions && (
                <div className="space-y-4">
                  {/* Calculate averages */}
                  {(() => {
                    const averages = calculateAverages(selectedSupplier)
                    const maxValue = Math.max(
                      selectedSupplier.totalEmissions,
                      averages.national,
                      averages.global,
                      averages.importer,
                    )

                    return (
                      <>
                        {/* Selected Supplier */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{selectedSupplier.name}</span>
                            <span>{formatNumber(selectedSupplier.totalEmissions)} tCO₂</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${(selectedSupplier.totalEmissions / maxValue) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* National Average */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{selectedSupplier.country} Average</span>
                            <span>{formatNumber(averages.national)} tCO₂</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{ width: `${(averages.national / maxValue) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Global Average */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Global Average</span>
                            <span>{formatNumber(averages.global)} tCO₂</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-purple-600 h-2.5 rounded-full"
                              style={{ width: `${(averages.global / maxValue) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Importer's Average */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Your Company Average</span>
                            <span>{formatNumber(averages.importer)} tCO₂</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-amber-600 h-2.5 rounded-full"
                              style={{ width: `${(averages.importer / maxValue) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-3">CN Codes</h3>
              <div className="space-y-2">
                {goodsImports
                  .filter((item) => item.manufacturer === selectedSupplier.name)
                  .reduce((acc: Record<string, number>, item) => {
                    if (item.cnCode) {
                      if (!acc[item.cnCode]) {
                        acc[item.cnCode] = 0
                      }
                      acc[item.cnCode] += item.quantity
                    }
                    return acc
                  }, {})
                  .map((entry, cnCode) => (
                    <div key={cnCode} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="font-mono text-sm">{cnCode}</span>
                      <span className="text-sm text-gray-600">{formatNumber(entry)} kg</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for custom markers */}
      <style jsx global>{`
        .custom-marker-cluster {
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        
        .cluster-marker {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}
