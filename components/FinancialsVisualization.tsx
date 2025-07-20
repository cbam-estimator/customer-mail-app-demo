"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import type { GoodsImportRow } from "@/types/excel";
import { cn } from "@/lib/utils";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Register ChartJS components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface FinancialsVisualizationProps {
  goodsImports: GoodsImportRow[];
}

export function FinancialsVisualization({
  goodsImports,
}: FinancialsVisualizationProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [uniqueSuppliers, setUniqueSuppliers] = useState<string[]>([]);
  const [uniqueQuarters, setUniqueQuarters] = useState<string[]>([]);
  const [uniqueCnCodes, setUniqueCnCodes] = useState<string[]>([]);
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]);
  const [uniqueGoodCategories, setUniqueGoodCategories] = useState<string[]>(
    []
  );
  const [viewMode, setViewMode] = useState<"quarters" | "suppliers">(
    "quarters"
  );
  const [isDataReady, setIsDataReady] = useState(false);

  // Filter states
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [selectedCnCodes, setSelectedCnCodes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedGoodCategories, setSelectedGoodCategories] = useState<
    string[]
  >([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Search states
  const [supplierSearch, setSupplierSearch] = useState("");
  const [cnCodeSearch, setCnCodeSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Extract good category from CN code description
  const extractGoodCategory = (cnCode: string): string => {
    // This is a simplified example - in a real app, you would have a mapping
    // of CN codes to categories or extract it from the description
    if (cnCode.startsWith("72") || cnCode.startsWith("73"))
      return "Iron and Steel";
    if (cnCode.startsWith("76")) return "Aluminum";
    if (cnCode.startsWith("25")) return "Cement";
    if (cnCode.startsWith("31")) return "Fertilizers";
    if (cnCode.startsWith("28")) return "Chemicals";
    return "Other";
  };

  // Calculate filter counts - how many items would remain if a filter is applied
  const calculateFilterCounts = useMemo(() => {
    if (!goodsImports || goodsImports.length === 0) {
      return {
        suppliers: {},
        quarters: {},
        cnCodes: {},
        countries: {},
        goodCategories: {},
      };
    }

    // Apply current filters except the one we're calculating for
    const getFilteredData = (
      excludeFilter:
        | "suppliers"
        | "quarters"
        | "cnCodes"
        | "countries"
        | "goodCategories"
    ) => {
      return goodsImports.filter((item) => {
        const supplierMatch =
          excludeFilter === "suppliers"
            ? true
            : selectedSuppliers.includes(item.manufacturer || "Unknown");
        const quarterMatch =
          excludeFilter === "quarters"
            ? true
            : selectedQuarters.includes(item.quarter || "Unknown");
        const cnCodeMatch =
          excludeFilter === "cnCodes"
            ? true
            : selectedCnCodes.includes(item.cnCode || "Unknown");

        // Extract country from manufacturer (simplified example)
        const country = item.manufacturer?.includes("China")
          ? "China"
          : item.manufacturer?.includes("Turkey")
          ? "Turkey"
          : "Other";
        const countryMatch =
          excludeFilter === "countries"
            ? true
            : selectedCountries.includes(country);

        // Extract good category
        const goodCategory = extractGoodCategory(item.cnCode || "");
        const goodCategoryMatch =
          excludeFilter === "goodCategories"
            ? true
            : selectedGoodCategories.includes(goodCategory);

        return (
          supplierMatch &&
          quarterMatch &&
          cnCodeMatch &&
          countryMatch &&
          goodCategoryMatch
        );
      });
    };

    // Calculate counts for each filter type
    const supplierCounts: Record<string, number> = {};
    const quarterCounts: Record<string, number> = {};
    const cnCodeCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const goodCategoryCounts: Record<string, number> = {};

    // For suppliers
    uniqueSuppliers.forEach((supplier) => {
      const filteredData = getFilteredData("suppliers");
      supplierCounts[supplier] = filteredData.filter(
        (item) => (item.manufacturer || "Unknown") === supplier
      ).length;
    });

    // For quarters
    uniqueQuarters.forEach((quarter) => {
      const filteredData = getFilteredData("quarters");
      quarterCounts[quarter] = filteredData.filter(
        (item) => (item.quarter || "Unknown") === quarter
      ).length;
    });

    // For CN codes
    uniqueCnCodes.forEach((cnCode) => {
      const filteredData = getFilteredData("cnCodes");
      cnCodeCounts[cnCode] = filteredData.filter(
        (item) => (item.cnCode || "Unknown") === cnCode
      ).length;
    });

    // For countries
    uniqueCountries.forEach((country) => {
      const filteredData = getFilteredData("countries");
      // Simplified country matching
      countryCounts[country] = filteredData.filter((item) => {
        const itemCountry = item.manufacturer?.includes("China")
          ? "China"
          : item.manufacturer?.includes("Turkey")
          ? "Turkey"
          : "Other";
        return itemCountry === country;
      }).length;
    });

    // For good categories
    uniqueGoodCategories.forEach((category) => {
      const filteredData = getFilteredData("goodCategories");
      goodCategoryCounts[category] = filteredData.filter((item) => {
        const goodCategory = extractGoodCategory(item.cnCode || "");
        return goodCategory === category;
      }).length;
    });

    return {
      suppliers: supplierCounts,
      quarters: quarterCounts,
      cnCodes: cnCodeCounts,
      countries: countryCounts,
      goodCategories: goodCategoryCounts,
    };
  }, [
    goodsImports,
    selectedSuppliers,
    selectedQuarters,
    selectedCnCodes,
    selectedCountries,
    selectedGoodCategories,
    uniqueSuppliers,
    uniqueQuarters,
    uniqueCnCodes,
    uniqueCountries,
    uniqueGoodCategories,
  ]);

  useEffect(() => {
    // Reset data ready state when inputs change
    setIsDataReady(false);

    if (!goodsImports || goodsImports.length === 0) {
      setUniqueSuppliers([]);
      setUniqueQuarters([]);
      setUniqueCnCodes([]);
      setUniqueCountries([]);
      setUniqueGoodCategories([]);
      setSelectedSuppliers([]);
      setSelectedQuarters([]);
      setSelectedCnCodes([]);
      setSelectedCountries([]);
      setSelectedGoodCategories([]);
      return;
    }

    // Extract unique suppliers, quarters, and CN codes
    const suppliers = Array.from(
      new Set(goodsImports.map((item) => item.manufacturer || "Unknown"))
    );
    const quarters = Array.from(
      new Set(goodsImports.map((item) => item.quarter || "Unknown"))
    ).sort((a, b) => {
      // Sort quarters chronologically in descending order (most recent first)
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;

      const [aQ, aY] = a.split("-");
      const [bQ, bY] = b.split("-");
      // Reverse the comparison for descending order
      return aY === bY
        ? bQ.localeCompare(aQ) // Reverse quarter comparison
        : bY.localeCompare(aY); // Reverse year comparison
    });
    const cnCodes = Array.from(
      new Set(goodsImports.map((item) => item.cnCode || "Unknown"))
    );

    // Extract countries (simplified example)
    const countries = ["China", "Turkey", "Other"]; // In a real app, extract from data

    // Extract good categories
    const goodCategories = Array.from(
      new Set(cnCodes.map((code) => extractGoodCategory(code)))
    );

    setUniqueSuppliers(suppliers);
    setUniqueQuarters(quarters);
    setUniqueCnCodes(cnCodes);
    setUniqueCountries(countries);
    setUniqueGoodCategories(goodCategories);

    // Initialize with all items selected
    setSelectedSuppliers(suppliers);
    setSelectedQuarters(quarters);
    setSelectedCnCodes(cnCodes);
    setSelectedCountries(countries);
    setSelectedGoodCategories(goodCategories);
  }, [goodsImports]);

  useEffect(() => {
    if (!goodsImports || goodsImports.length === 0) {
      setChartData({
        labels: [],
        datasets: [],
      });
      setIsDataReady(false);
      return;
    }

    try {
      // Apply filters
      const filteredData = goodsImports.filter((item) => {
        const supplierMatch = selectedSuppliers.includes(
          item.manufacturer || "Unknown"
        );
        const quarterMatch = selectedQuarters.includes(
          item.quarter || "Unknown"
        );
        const cnCodeMatch = selectedCnCodes.includes(item.cnCode || "Unknown");

        // Extract country from manufacturer (simplified example)
        const country = item.manufacturer?.includes("China")
          ? "China"
          : item.manufacturer?.includes("Turkey")
          ? "Turkey"
          : "Other";
        const countryMatch = selectedCountries.includes(country);

        // Extract good category
        const goodCategory = extractGoodCategory(item.cnCode || "");
        const goodCategoryMatch = selectedGoodCategories.includes(goodCategory);

        return (
          supplierMatch &&
          quarterMatch &&
          cnCodeMatch &&
          countryMatch &&
          goodCategoryMatch
        );
      });

      // Create detailed data for the raw data table
      let detailedData: any[] = [];
      let labels: string[] = [];
      let datasets: any[] = [];

      if (viewMode === "quarters") {
        // Use quarters that have data after filtering
        const activeQuarters = uniqueQuarters.filter((quarter) =>
          filteredData.some((item) => (item.quarter || "Unknown") === quarter)
        );

        labels = activeQuarters;

        if (activeQuarters.length === 0) {
          setChartData({
            labels: [],
            datasets: [],
          });
          setIsDataReady(false);
          return;
        }

        // Calculate costs based on emissions (direct + indirect) * multiplier
        const costMultiplier = 100; // 100€ per ton of CO2

        const quarterCosts = activeQuarters.map((quarter) => {
          const quarterItems = filteredData.filter(
            (item) => (item.quarter || "Unknown") === quarter
          );
          const totalCosts = quarterItems.reduce((sum, item) => {
            const emissionFactor =
              (item.seeDirect || 0) + (item.seeIndirect || 0);
            const emissions = emissionFactor * (item.quantity || 0);
            return sum + emissions * costMultiplier;
          }, 0);
          return Math.round(totalCosts);
        });

        const quarterImports = activeQuarters.map((quarter) => {
          const quarterItems = filteredData.filter(
            (item) => (item.quarter || "Unknown") === quarter
          );
          return quarterItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
        });

        // Create detailed data for each quarter
        detailedData = activeQuarters.map((quarter, index) => {
          const quarterItems = filteredData.filter(
            (item) => (item.quarter || "Unknown") === quarter
          );
          const uniqueSupplierCount = new Set(
            quarterItems.map((item) => item.manufacturer)
          ).size;
          const uniqueGoodsCount = new Set(
            quarterItems.map((item) => item.cnCode)
          ).size;
          const importQuantity = quarterItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );

          // Calculate total emissions and costs
          let totalEmissions = 0;

          if (quarterItems.length > 0) {
            quarterItems.forEach((item) => {
              const emissionFactor =
                (item.seeDirect || 0) + (item.seeIndirect || 0);
              totalEmissions += emissionFactor * (item.quantity || 0);
            });
          }

          const totalCosts = totalEmissions * costMultiplier;

          return {
            label: quarter,
            supplierCount: uniqueSupplierCount,
            goodsCount: uniqueGoodsCount,
            importQuantity,
            totalEmissions: Math.round(totalEmissions * 100) / 100, // Round to 2 decimal places
            totalCosts: Math.round(totalCosts * 100) / 100, // Round to 2 decimal places
            costPerTon:
              importQuantity > 0
                ? Math.round((totalCosts / importQuantity) * 100) / 100
                : 0,
          };
        });

        datasets = [
          {
            label: "CBAM Costs (€)",
            data: quarterCosts,
            backgroundColor: "#F28585", // Pastel red for cost bars
            borderColor: "#F28585", // Match background color
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
          },
          {
            label: "Import Quantity",
            data: quarterImports,
            backgroundColor: "#111827", // Dark blue/almost black for imports
            borderColor: "#111827", // Match background color
            borderWidth: 0, // Remove border
            yAxisID: "y1", // Secondary axis (right)
          },
        ];
      } else {
        // Use suppliers that have data after filtering
        let activeSuppliers = uniqueSuppliers.filter((supplier) =>
          filteredData.some(
            (item) => (item.manufacturer || "Unknown") === supplier
          )
        );

        // Calculate costs for each supplier for sorting
        const supplierCosts = new Map<string, number>();
        const costMultiplier = 100; // 100€ per ton of CO2

        activeSuppliers.forEach((supplier) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          const totalEmissions = supplierItems.reduce((sum, item) => {
            const emissionFactor =
              (item.seeDirect || 0) + (item.seeIndirect || 0);
            return sum + emissionFactor * (item.quantity || 0);
          }, 0);
          const totalCosts = totalEmissions * costMultiplier;
          supplierCosts.set(supplier, totalCosts);
        });

        // Sort suppliers by costs (highest first)
        activeSuppliers = activeSuppliers.sort((a, b) => {
          const costsA = supplierCosts.get(a) || 0;
          const costsB = supplierCosts.get(b) || 0;
          return costsB - costsA; // Descending order
        });

        labels = activeSuppliers;

        if (activeSuppliers.length === 0) {
          setChartData({
            labels: [],
            datasets: [],
          });
          setIsDataReady(false);
          return;
        }

        // Calculate costs for each supplier
        const supplierCostsArray = activeSuppliers.map((supplier) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          const totalEmissions = supplierItems.reduce((sum, item) => {
            const emissionFactor =
              (item.seeDirect || 0) + (item.seeIndirect || 0);
            return sum + emissionFactor * (item.quantity || 0);
          }, 0);
          return Math.round(totalEmissions * costMultiplier);
        });

        const supplierImports = activeSuppliers.map((supplier) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          return supplierItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
        });

        // Create detailed data for each supplier
        detailedData = activeSuppliers.map((supplier, index) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          const uniqueQuarterCount = new Set(
            supplierItems.map((item) => item.quarter)
          ).size;
          const uniqueGoodsCount = new Set(
            supplierItems.map((item) => item.cnCode)
          ).size;
          const importQuantity = supplierItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );

          // Calculate total emissions and costs
          let totalEmissions = 0;

          if (supplierItems.length > 0) {
            supplierItems.forEach((item) => {
              const emissionFactor =
                (item.seeDirect || 0) + (item.seeIndirect || 0);
              totalEmissions += emissionFactor * (item.quantity || 0);
            });
          }

          const totalCosts = totalEmissions * costMultiplier;

          return {
            label: supplier,
            quarterCount: uniqueQuarterCount,
            goodsCount: uniqueGoodsCount,
            importQuantity,
            totalEmissions: Math.round(totalEmissions * 100) / 100, // Round to 2 decimal places
            totalCosts: Math.round(totalCosts * 100) / 100, // Round to 2 decimal places
            costPerTon:
              importQuantity > 0
                ? Math.round((totalCosts / importQuantity) * 100) / 100
                : 0,
          };
        });

        datasets = [
          {
            label: "CBAM Costs (€)",
            data: supplierCostsArray,
            backgroundColor: "#F28585", // Pastel red for cost bars
            borderColor: "#F28585", // Match background color
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
          },
          {
            label: "Import Quantity",
            data: supplierImports,
            backgroundColor: "#111827", // Dark blue/almost black for imports
            borderColor: "#111827", // Match background color
            borderWidth: 0, // Remove border
            yAxisID: "y1", // Secondary axis (right)
          },
        ];
      }

      // Ensure we have valid data before setting chart data
      if (
        labels.length > 0 &&
        datasets.length > 0 &&
        datasets[0].data.length > 0
      ) {
        setChartData({
          labels,
          datasets,
          detailedData,
        });
        setIsDataReady(true);
      } else {
        setChartData({
          labels: [],
          datasets: [],
        });
        setIsDataReady(false);
      }
    } catch (error) {
      console.error("Error processing chart data:", error);
      setChartData({
        labels: [],
        datasets: [],
      });
      setIsDataReady(false);
    }
  }, [
    goodsImports,
    uniqueQuarters,
    uniqueSuppliers,
    viewMode,
    selectedSuppliers,
    selectedQuarters,
    selectedCnCodes,
    selectedCountries,
    selectedGoodCategories,
  ]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
            if (context.datasetIndex === 0) {
              return `CBAM Costs: ${value} €`;
            } else {
              return `Import Quantity: ${value} tons`;
            }
          },
        },
      },
      datalabels: {
        display: (context: any) => {
          // Only show data labels for each dataset
          return context.dataset.data && context.dataset.data.length > 0;
        },
        anchor: "end",
        align: "top",
        formatter: (value: number, context: any) => {
          if (!value && value !== 0) return "";
          if (context.datasetIndex === 0) {
            // Costs
            return value.toLocaleString() + "\n€";
          } else if (context.datasetIndex === 1) {
            // Import quantity
            return value.toLocaleString() + "\ntons";
          }
          return "";
        },
        font: {
          weight: "bold",
          size: 12,
        },
        color: "#000000", // Black color for all labels
        padding: {
          top: 6,
        },
        textAlign: "center",
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "CBAM Costs (€)",
        },
        ticks: {
          padding: 5,
          callback: (value) => {
            if (typeof value === "string") {
              value = parseFloat(value);
            }

            if (value >= 1_000_000) {
              return (value / 1_000_000).toLocaleString() + "M €";
            } else if (value >= 1_000) {
              return (value / 1_000).toLocaleString() + "K €";
            }

            return value + " €";
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Import Quantity (tons)",
        },
        ticks: {
          padding: 5,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: viewMode === "quarters" ? "Quarter" : "Supplier",
        },
      },
    },
    layout: {
      padding: {
        top: 80,
      },
    },
  };

  // Filter toggle handlers
  const handleToggleSupplier = (supplier: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplier)
        ? prev.filter((s) => s !== supplier)
        : [...prev, supplier]
    );
  };

  const handleToggleQuarter = (quarter: string) => {
    setSelectedQuarters((prev) =>
      prev.includes(quarter)
        ? prev.filter((q) => q !== quarter)
        : [...prev, quarter]
    );
  };

  const handleToggleCnCode = (cnCode: string) => {
    setSelectedCnCodes((prev) =>
      prev.includes(cnCode)
        ? prev.filter((c) => c !== cnCode)
        : [...prev, cnCode]
    );
  };

  const handleToggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const handleToggleGoodCategory = (category: string) => {
    setSelectedGoodCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Select all handlers
  const handleSelectAllSuppliers = () => {
    setSelectedSuppliers([...uniqueSuppliers]);
  };

  const handleSelectAllQuarters = () => {
    setSelectedQuarters([...uniqueQuarters]);
  };

  const handleSelectAllCnCodes = () => {
    setSelectedCnCodes([...uniqueCnCodes]);
  };

  const handleSelectAllCountries = () => {
    setSelectedCountries([...uniqueCountries]);
  };

  const handleSelectAllGoodCategories = () => {
    setSelectedGoodCategories([...uniqueGoodCategories]);
  };

  // Clear handlers
  const handleClearSuppliers = () => {
    setSelectedSuppliers([]);
  };

  const handleClearQuarters = () => {
    setSelectedQuarters([]);
  };

  const handleClearCnCodes = () => {
    setSelectedCnCodes([]);
  };

  const handleClearCountries = () => {
    setSelectedCountries([]);
  };

  const handleClearGoodCategories = () => {
    setSelectedGoodCategories([]);
  };

  // Filtered lists based on search
  const filteredSuppliers = uniqueSuppliers.filter((supplier) =>
    supplier.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredCnCodes = uniqueCnCodes.filter((cnCode) =>
    cnCode.toLowerCase().includes(cnCodeSearch.toLowerCase())
  );

  const filteredCountries = uniqueCountries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredGoodCategories = uniqueGoodCategories.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-1 w-fit">
              <button
                onClick={() => setViewMode("quarters")}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  viewMode === "quarters"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                By Quarters
              </button>
              <button
                onClick={() => setViewMode("suppliers")}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  viewMode === "suppliers"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                By Suppliers
              </button>
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {isFilterOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mb-6 border rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-lg">Filter Options</h3>
              <p className="text-sm text-gray-500">
                Refine your data visualization by applying multiple filters
              </p>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Suppliers filter (shown in quarters view) */}
              <div className={viewMode === "suppliers" ? "hidden" : ""}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Suppliers</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={handleSelectAllSuppliers}
                          className="text-xs h-6 px-2"
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={handleClearSuppliers}
                          className="text-xs h-6 px-2"
                        >
                          None
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="relative mb-3">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        placeholder="Search suppliers..."
                        className="pl-8 text-sm h-8"
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                      {filteredSuppliers.map((supplier) => (
                        <div
                          key={supplier}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`supplier-${supplier}`}
                              checked={selectedSuppliers.includes(supplier)}
                              onCheckedChange={() =>
                                handleToggleSupplier(supplier)
                              }
                            />
                            <label
                              htmlFor={`supplier-${supplier}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {supplier}
                            </label>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {calculateFilterCounts.suppliers[supplier] || 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quarters filter (shown in suppliers view) */}
              <div className={viewMode === "quarters" ? "hidden" : ""}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Quarters</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={handleSelectAllQuarters}
                          className="text-xs h-6 px-2"
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={handleClearQuarters}
                          className="text-xs h-6 px-2"
                        >
                          None
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                      {uniqueQuarters.map((quarter) => (
                        <div
                          key={quarter}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`quarter-${quarter}`}
                              checked={selectedQuarters.includes(quarter)}
                              onCheckedChange={() =>
                                handleToggleQuarter(quarter)
                              }
                            />
                            <label
                              htmlFor={`quarter-${quarter}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {quarter}
                            </label>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {calculateFilterCounts.quarters[quarter] || 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CN Codes filter */}
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>CN Codes</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleSelectAllCnCodes}
                        className="text-xs h-6 px-2"
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearCnCodes}
                        className="text-xs h-6 px-2"
                      >
                        None
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search CN codes..."
                      className="pl-8 text-sm h-8"
                      value={cnCodeSearch}
                      onChange={(e) => setCnCodeSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {filteredCnCodes.map((cnCode) => (
                      <div
                        key={cnCode}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`cncode-${cnCode}`}
                            checked={selectedCnCodes.includes(cnCode)}
                            onCheckedChange={() => handleToggleCnCode(cnCode)}
                          />
                          <label
                            htmlFor={`cncode-${cnCode}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cnCode}
                          </label>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {calculateFilterCounts.cnCodes[cnCode] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Countries filter */}
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>Countries</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleSelectAllCountries}
                        className="text-xs h-6 px-2"
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearCountries}
                        className="text-xs h-6 px-2"
                      >
                        None
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search countries..."
                      className="pl-8 text-sm h-8"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {filteredCountries.map((country) => (
                      <div
                        key={country}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`country-${country}`}
                            checked={selectedCountries.includes(country)}
                            onCheckedChange={() => handleToggleCountry(country)}
                          />
                          <label
                            htmlFor={`country-${country}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {country}
                          </label>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {calculateFilterCounts.countries[country] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Good Categories filter */}
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>Good Categories</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleSelectAllGoodCategories}
                        className="text-xs h-6 px-2"
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearGoodCategories}
                        className="text-xs h-6 px-2"
                      >
                        None
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search categories..."
                      className="pl-8 text-sm h-8"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {filteredGoodCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedGoodCategories.includes(category)}
                            onCheckedChange={() =>
                              handleToggleGoodCategory(category)
                            }
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {calculateFilterCounts.goodCategories[category] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-gray-50 border-t">
              <div className="flex flex-wrap gap-2">
                {selectedSuppliers.length < uniqueSuppliers.length && (
                  <Badge variant="secondary" className="px-2 py-1">
                    Suppliers: {selectedSuppliers.length}/
                    {uniqueSuppliers.length}
                  </Badge>
                )}
                {selectedQuarters.length < uniqueQuarters.length && (
                  <Badge variant="secondary" className="px-2 py-1">
                    Quarters: {selectedQuarters.length}/{uniqueQuarters.length}
                  </Badge>
                )}
                {selectedCnCodes.length < uniqueCnCodes.length && (
                  <Badge variant="secondary" className="px-2 py-1">
                    CN Codes: {selectedCnCodes.length}/{uniqueCnCodes.length}
                  </Badge>
                )}
                {selectedCountries.length < uniqueCountries.length && (
                  <Badge variant="secondary" className="px-2 py-1">
                    Countries: {selectedCountries.length}/
                    {uniqueCountries.length}
                  </Badge>
                )}
                {selectedGoodCategories.length <
                  uniqueGoodCategories.length && (
                  <Badge variant="secondary" className="px-2 py-1">
                    Categories: {selectedGoodCategories.length}/
                    {uniqueGoodCategories.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="h-[400px]">
          {isDataReady &&
          chartData.labels &&
          chartData.labels.length > 0 &&
          chartData.datasets &&
          chartData.datasets.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500">
                  No data available for the selected filters.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your filters or adding more data.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Raw Data</h3>
          <div className="border rounded-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {viewMode === "quarters" ? "Quarter" : "Supplier"}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {viewMode === "quarters" ? "# Suppliers" : "# Quarters"}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    # Goods
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Import Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Emissions
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total CBAM Costs
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cost per Ton
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.detailedData && chartData.detailedData.length > 0 ? (
                  chartData.detailedData.map((item: any) => (
                    <tr key={item.label}>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {item.label}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {viewMode === "quarters"
                          ? item.supplierCount
                          : item.quarterCount}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.goodsCount}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.importQuantity.toLocaleString()} tons
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.totalEmissions.toLocaleString()} tCO₂
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.totalCosts.toLocaleString()} €
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.costPerTon.toLocaleString()} €/ton
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-2 text-center text-xs text-gray-500"
                    >
                      No data available for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
