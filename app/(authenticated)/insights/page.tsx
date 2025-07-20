"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  BarChart,
  FilterIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EmissionsVisualization } from "@/components/EmissionsVisualization";
import { ForecastVisualization } from "@/components/ForecastVisualization";
import { Checkbox } from "@/components/ui/checkbox";
import type { GoodsImportRow } from "@/types/excel";

// This is a client-side component, so we need to initialize with empty data
// and then fetch the actual data on the client
export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("emissions");
  const [goodsImports, setGoodsImports] = useState<GoodsImportRow[]>([]);
  const [viewMode, setViewMode] = useState<
    "quarters" | "suppliers" | "cnCodes"
  >("quarters");
  const [showFilters, setShowFilters] = useState(false);
  const [limitData, setLimitData] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    startDate: "",
    endDate: "",
    minQuantity: "",
    maxQuantity: "",
    selectedSuppliers: [],
    selectedCnCodes: [],
  });

  // New filter state variables
  const [openFilter, setOpenFilter] = useState<
    "categories" | "cnCodes" | "countries" | "suppliers" | null
  >(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCnCodes, setSelectedCnCodes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  // Refs for handling outside clicks
  const categoriesFilterRef = useRef<HTMLDivElement>(null);
  const cnCodesFilterRef = useRef<HTMLDivElement>(null);
  const countriesFilterRef = useRef<HTMLDivElement>(null);
  const suppliersFilterRef = useRef<HTMLDivElement>(null);

  // Sample data for the filters
  const categories = [
    "Iron and Steel",
    "Aluminum",
    "Cement",
    "Fertilizers",
    "Electricity",
    "Hydrogen",
  ];
  const cnCodes = [
    "73084000",
    "73269098",
    "76169990",
    "84212300",
    "84213100",
    "84219990",
  ];
  const countries = [
    "China",
    "Germany",
    "United States",
    "India",
    "Japan",
    "South Korea",
  ];
  const suppliers = [
    "Jinhua Ruifeng",
    "Jinhua Huagang Athletic Equipment",
    "Jinhua Zhenfei Tools Co., LTD",
  ];

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    // For now, we'll use the data from localStorage if available
    const storedGoodsImports = localStorage.getItem("goodsImports");
    if (storedGoodsImports) {
      try {
        const parsedData = JSON.parse(storedGoodsImports);
        setGoodsImports(parsedData);
      } catch (error) {
        console.error("Error parsing goods imports from localStorage:", error);
      }
    } else {
      // Fallback to some sample data if nothing is in localStorage
      setGoodsImports([
        {
          id: 1,
          remarks: "",
          cnCode: "73084000",
          manufacturer: "Jinhua Ruifeng",
          quantity: 15048,
          unit: "Kg",
          productionMethod: "P34 - Eisen- oder Stahlprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q1-2023",
          seeDirect: 2.34,
          seeIndirect: 3.12,
          supplierId: 1,
        },
        {
          id: 2,
          remarks: "",
          cnCode: "73269098",
          manufacturer: "Jinhua Huagang Athletic Equipment",
          quantity: 16289,
          unit: "Kg",
          productionMethod: "P34 - Eisen- oder Stahlprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q1-2023",
          seeDirect: 1.87,
          seeIndirect: 2.65,
          supplierId: 1,
        },
        {
          id: 3,
          remarks: "",
          cnCode: "76169990",
          manufacturer: "Jinhua Zhenfei Tools Co., LTD",
          quantity: 36159,
          unit: "Kg",
          productionMethod: "P45 - Aluminiumprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q1-2023",
          seeDirect: 3.45,
          seeIndirect: 2.98,
          supplierId: 1,
        },
        {
          id: 4,
          remarks: "",
          cnCode: "73269098",
          manufacturer: "Jinhua Zhenfei Tools Co., LTD",
          quantity: 4,
          unit: "Kg",
          productionMethod: "P34 - Eisen- oder Stahlprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q1-2023",
          seeDirect: 2.12,
          seeIndirect: 1.78,
          supplierId: 1,
        },
        // Add some data for Q2-2023
        {
          id: 5,
          remarks: "",
          cnCode: "73084000",
          manufacturer: "Jinhua Ruifeng",
          quantity: 18500,
          unit: "Kg",
          productionMethod: "P34 - Eisen- oder Stahlprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q2-2023",
          seeDirect: 2.45,
          seeIndirect: 3.22,
          supplierId: 1,
        },
        {
          id: 6,
          remarks: "",
          cnCode: "73269098",
          manufacturer: "Jinhua Huagang Athletic Equipment",
          quantity: 14200,
          unit: "Kg",
          productionMethod: "P34 - Eisen- oder Stahlprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q2-2023",
          seeDirect: 1.92,
          seeIndirect: 2.78,
          supplierId: 1,
        },
        // Add some data for Q3-2023
        {
          id: 7,
          remarks: "",
          cnCode: "76169990",
          manufacturer: "Jinhua Zhenfei Tools Co., LTD",
          quantity: 42000,
          unit: "Kg",
          productionMethod: "P45 - Aluminiumprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q3-2023",
          seeDirect: 3.51,
          seeIndirect: 3.05,
          supplierId: 1,
        },
        {
          id: 8,
          remarks: "",
          cnCode: "73084000",
          manufacturer: "Jinhua Ruifeng",
          quantity: 22300,
          unit: "Kg",
          productionMethod: "P34 - Eisen- oder Stahlprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q3-2023",
          seeDirect: 2.38,
          seeIndirect: 3.18,
          supplierId: 1,
        },
        // Add some data for Q4-2023
        {
          id: 9,
          remarks: "",
          cnCode: "73269098",
          manufacturer: "Jinhua Huagang Athletic Equipment",
          quantity: 19800,
          unit: "Kg",
          productionMethod: "P34 - Eisen- oder Stahlprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q4-2023",
          seeDirect: 1.95,
          seeIndirect: 2.72,
          supplierId: 1,
        },
        {
          id: 10,
          remarks: "",
          cnCode: "76169990",
          manufacturer: "Jinhua Zhenfei Tools Co., LTD",
          quantity: 38500,
          unit: "Kg",
          productionMethod: "P45 - Aluminiumprodukte",
          customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
          date: new Date(),
          quarter: "Q4-2023",
          seeDirect: 3.48,
          seeIndirect: 3.02,
          supplierId: 1,
        },
      ]);
    }
  }, []);

  const handleApplyFilters = () => {
    // In a real application, you would apply the filters to the data
    // For now, we'll just close the filter panel
    setShowFilters(false);
  };

  // Handle clicks outside the filter dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openFilter === "categories" &&
        categoriesFilterRef.current &&
        !categoriesFilterRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
      if (
        openFilter === "cnCodes" &&
        cnCodesFilterRef.current &&
        !cnCodesFilterRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
      if (
        openFilter === "countries" &&
        countriesFilterRef.current &&
        !countriesFilterRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
      if (
        openFilter === "suppliers" &&
        suppliersFilterRef.current &&
        !suppliersFilterRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
    }

    // Add event listener when a filter is open
    if (openFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedCnCodes([]);
    setSelectedCountries([]);
    setSelectedSuppliers([]);
  };

  // Handle removing a filter tag
  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  const handleRemoveCnCode = (cnCode: string) => {
    setSelectedCnCodes(selectedCnCodes.filter((c) => c !== cnCode));
  };

  const handleRemoveCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== country));
  };

  const handleRemoveSupplier = (supplier: string) => {
    setSelectedSuppliers(selectedSuppliers.filter((s) => s !== supplier));
  };

  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
      <Tabs
        defaultValue="emissions"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="mt-6 mb-4">
          <TabsList className="bg-gray-100 p-1 rounded-md w-auto shadow-sm border border-gray-200">
            <TabsTrigger
              value="emissions"
              className="flex items-center gap-2 flex-1 py-2 px-4 text-base rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 ease-in-out hover:bg-gray-200 data-[state=active]:hover:bg-primary/90"
            >
              <BarChart className="h-4 w-4" />
              <span>Emissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              className="flex items-center gap-2 flex-1 py-2 px-4 text-base rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 ease-in-out hover:bg-gray-200 data-[state=active]:hover:bg-primary/90"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Forecast</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="mt-4 mb-8">
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 p-4"
            style={{ padding: "1rem" }}
          >
            <CardTitle
              className="text-xl font-semibold"
              style={{
                fontSize: "1.25rem",
                lineHeight: "1.75rem",
                fontWeight: 600,
              }}
            >
              {activeTab === "emissions"
                ? "Emissions"
                : "CBAM Cost Forecast (2026-2034)"}
            </CardTitle>
          </CardHeader>

          {activeTab === "emissions" && (
            <div className="border-t bg-neutral-50 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between">
                <div className="w-full md:w-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors bg-white text-gray-700 border-gray-200 hover:bg-gray-100 w-fit"
                  >
                    <FilterIcon className="mr-2 h-4 w-4" />
                    Filter
                    {showFilters ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-col mt-4 md:mt-0">
                  <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-1 w-fit">
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        viewMode === "quarters"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-white text-gray-500"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500`}
                      onClick={() => setViewMode("quarters")}
                    >
                      By Quarters
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        viewMode === "suppliers"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-white text-gray-500"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500`}
                      onClick={() => {
                        setViewMode("suppliers");
                        setLimitData(true); // Ensure limitData is true when switching to suppliers view
                      }}
                    >
                      By Suppliers
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        viewMode === "cnCodes"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-white text-gray-500"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500`}
                      onClick={() => setViewMode("cnCodes")}
                    >
                      By CN Codes
                    </button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                  <div className="flex flex-col gap-4">
                    {/* Selected filter tags */}
                    {(selectedCategories.length > 0 ||
                      selectedCnCodes.length > 0 ||
                      selectedCountries.length > 0 ||
                      selectedSuppliers.length > 0) && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCategories.map((category) => (
                          <div
                            key={`tag-category-${category}`}
                            className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded"
                          >
                            Category: {category}
                            <button
                              onClick={() => handleRemoveCategory(category)}
                              className="ml-1.5 text-blue-700 hover:text-blue-900"
                              aria-label={`Remove ${category} filter`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {selectedCnCodes.map((cnCode) => (
                          <div
                            key={`tag-cncode-${cnCode}`}
                            className="flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded"
                          >
                            CN Code: {cnCode}
                            <button
                              onClick={() => handleRemoveCnCode(cnCode)}
                              className="ml-1.5 text-green-700 hover:text-green-900"
                              aria-label={`Remove ${cnCode} filter`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {selectedCountries.map((country) => (
                          <div
                            key={`tag-country-${country}`}
                            className="flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded"
                          >
                            Country: {country}
                            <button
                              onClick={() => handleRemoveCountry(country)}
                              className="ml-1.5 text-purple-700 hover:text-purple-900"
                              aria-label={`Remove ${country} filter`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {selectedSuppliers.map((supplier) => (
                          <div
                            key={`tag-supplier-${supplier}`}
                            className="flex items-center bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded"
                          >
                            Supplier: {supplier}
                            <button
                              onClick={() => handleRemoveSupplier(supplier)}
                              className="ml-1.5 text-orange-700 hover:text-orange-900"
                              aria-label={`Remove ${supplier} filter`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={resetFilters}
                          className="flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded hover:bg-gray-200"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Good Categories filter */}
                      <div className="relative" ref={categoriesFilterRef}>
                        <button
                          onClick={() =>
                            setOpenFilter(
                              openFilter === "categories" ? null : "categories"
                            )
                          }
                          className="w-full flex items-center justify-between bg-white border rounded px-3 py-2 text-sm"
                        >
                          <span>
                            Good Categories{" "}
                            {selectedCategories.length > 0 &&
                              `(${selectedCategories.length})`}
                          </span>
                          <span className="text-gray-500">
                            {openFilter === "categories" ? "▲" : "▼"}
                          </span>
                        </button>

                        {openFilter === "categories" && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            <div className="p-2">
                              <div className="mb-2 border-b pb-1">
                                <Checkbox
                                  id="select-all-categories"
                                  checked={
                                    selectedCategories.length ===
                                    categories.length
                                  }
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCategories(categories);
                                    } else {
                                      setSelectedCategories([]);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="select-all-categories"
                                  className="ml-2 text-sm font-medium"
                                >
                                  Select All
                                </label>
                              </div>

                              {categories.map((category) => {
                                // In a real app, you would count items for each category
                                const count =
                                  Math.floor(Math.random() * 20) + 1; // Dummy count
                                return (
                                  <div
                                    key={`category-${category}`}
                                    className="flex items-center mb-1"
                                  >
                                    <Checkbox
                                      id={`category-${category}`}
                                      checked={selectedCategories.includes(
                                        category
                                      )}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedCategories([
                                            ...selectedCategories,
                                            category,
                                          ]);
                                        } else {
                                          setSelectedCategories(
                                            selectedCategories.filter(
                                              (c) => c !== category
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`category-${category}`}
                                      className="ml-2 text-sm"
                                    >
                                      {category} ({count})
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CN Codes filter */}
                      <div className="relative" ref={cnCodesFilterRef}>
                        <button
                          onClick={() =>
                            setOpenFilter(
                              openFilter === "cnCodes" ? null : "cnCodes"
                            )
                          }
                          className="w-full flex items-center justify-between bg-white border rounded px-3 py-2 text-sm"
                        >
                          <span>
                            CN Codes{" "}
                            {selectedCnCodes.length > 0 &&
                              `(${selectedCnCodes.length})`}
                          </span>
                          <span className="text-gray-500">
                            {openFilter === "cnCodes" ? "▲" : "▼"}
                          </span>
                        </button>

                        {openFilter === "cnCodes" && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            <div className="p-2">
                              <div className="mb-2 border-b pb-1">
                                <Checkbox
                                  id="select-all-cncodes"
                                  checked={
                                    selectedCnCodes.length === cnCodes.length
                                  }
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCnCodes(cnCodes);
                                    } else {
                                      setSelectedCnCodes([]);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="select-all-cncodes"
                                  className="ml-2 text-sm font-medium"
                                >
                                  Select All
                                </label>
                              </div>

                              {cnCodes.map((cnCode) => {
                                // Count items with this CN code
                                const count = goodsImports.filter(
                                  (g) => g.cnCode === cnCode
                                ).length;
                                return (
                                  <div
                                    key={`cncode-${cnCode}`}
                                    className="flex items-center mb-1"
                                  >
                                    <Checkbox
                                      id={`cncode-${cnCode}`}
                                      checked={selectedCnCodes.includes(cnCode)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedCnCodes([
                                            ...selectedCnCodes,
                                            cnCode,
                                          ]);
                                        } else {
                                          setSelectedCnCodes(
                                            selectedCnCodes.filter(
                                              (c) => c !== cnCode
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`cncode-${cnCode}`}
                                      className="ml-2 text-sm"
                                    >
                                      {cnCode} ({count})
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Countries filter */}
                      <div className="relative" ref={countriesFilterRef}>
                        <button
                          onClick={() =>
                            setOpenFilter(
                              openFilter === "countries" ? null : "countries"
                            )
                          }
                          className="w-full flex items-center justify-between bg-white border rounded px-3 py-2 text-sm"
                        >
                          <span>
                            Countries{" "}
                            {selectedCountries.length > 0 &&
                              `(${selectedCountries.length})`}
                          </span>
                          <span className="text-gray-500">
                            {openFilter === "countries" ? "▲" : "▼"}
                          </span>
                        </button>

                        {openFilter === "countries" && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            <div className="p-2">
                              <div className="mb-2 border-b pb-1">
                                <Checkbox
                                  id="select-all-countries"
                                  checked={
                                    selectedCountries.length ===
                                    countries.length
                                  }
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCountries(countries);
                                    } else {
                                      setSelectedCountries([]);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="select-all-countries"
                                  className="ml-2 text-sm font-medium"
                                >
                                  Select All
                                </label>
                              </div>

                              {countries.map((country) => {
                                // In a real app, you would count items for each country
                                const count =
                                  Math.floor(Math.random() * 15) + 1; // Dummy count
                                return (
                                  <div
                                    key={`country-${country}`}
                                    className="flex items-center mb-1"
                                  >
                                    <Checkbox
                                      id={`country-${country}`}
                                      checked={selectedCountries.includes(
                                        country
                                      )}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedCountries([
                                            ...selectedCountries,
                                            country,
                                          ]);
                                        } else {
                                          setSelectedCountries(
                                            selectedCountries.filter(
                                              (c) => c !== country
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`country-${country}`}
                                      className="ml-2 text-sm"
                                    >
                                      {country} ({count})
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Suppliers filter */}
                      <div className="relative" ref={suppliersFilterRef}>
                        <button
                          onClick={() =>
                            setOpenFilter(
                              openFilter === "suppliers" ? null : "suppliers"
                            )
                          }
                          className="w-full flex items-center justify-between bg-white border rounded px-3 py-2 text-sm"
                        >
                          <span>
                            Suppliers{" "}
                            {selectedSuppliers.length > 0 &&
                              `(${selectedSuppliers.length})`}
                          </span>
                          <span className="text-gray-500">
                            {openFilter === "suppliers" ? "▲" : "▼"}
                          </span>
                        </button>

                        {openFilter === "suppliers" && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            <div className="p-2">
                              <div className="mb-2 border-b pb-1">
                                <Checkbox
                                  id="select-all-suppliers"
                                  checked={
                                    selectedSuppliers.length ===
                                    suppliers.length
                                  }
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedSuppliers(suppliers);
                                    } else {
                                      setSelectedSuppliers([]);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="select-all-suppliers"
                                  className="ml-2 text-sm font-medium"
                                >
                                  Select All
                                </label>
                              </div>

                              {suppliers.map((supplier) => {
                                // Count items from this supplier
                                const count = goodsImports.filter(
                                  (g) => g.manufacturer === supplier
                                ).length;
                                return (
                                  <div
                                    key={`supplier-${supplier}`}
                                    className="flex items-center mb-1"
                                  >
                                    <Checkbox
                                      id={`supplier-${supplier}`}
                                      checked={selectedSuppliers.includes(
                                        supplier
                                      )}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedSuppliers([
                                            ...selectedSuppliers,
                                            supplier,
                                          ]);
                                        } else {
                                          setSelectedSuppliers(
                                            selectedSuppliers.filter(
                                              (s) => s !== supplier
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`supplier-${supplier}`}
                                      className="ml-2 text-sm"
                                    >
                                      {supplier} ({count})
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleApplyFilters}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/90"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <CardContent className="border-t pt-4">
            {activeTab === "emissions" ? (
              <TabsContent value="emissions">
                <EmissionsVisualization
                  goodsImports={goodsImports}
                  viewMode={viewMode}
                  showFilters={false} // We're handling filters in the UI now
                  hideControls={true}
                  //limitData={limitData}
                  //maxItems={limitData ? 10 : undefined}
                />
              </TabsContent>
            ) : (
              <ForecastVisualization goodsImports={goodsImports} />
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
