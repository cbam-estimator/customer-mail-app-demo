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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Minus,
  X,
  Info,
} from "lucide-react";
import type { GoodsImportRow } from "@/types/excel";
import { cn } from "@/lib/utils";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

type EmissionsVisualizationProps = {
  goodsImports: GoodsImportRow[];
  viewMode?: "quarters" | "suppliers" | "cnCodes";
  showFilters?: boolean;
  hideControls?: boolean;
};

export function EmissionsVisualization({
  goodsImports,
  viewMode: externalViewMode,
  showFilters: externalShowFilters,
  hideControls = false,
}: EmissionsVisualizationProps) {
  // Use external state if provided, otherwise use internal state
  const [internalViewMode, setInternalViewMode] = useState<
    "quarters" | "suppliers" | "cnCodes"
  >("quarters");
  const [internalShowFilters, setInternalShowFilters] = useState(false);

  const viewMode =
    externalViewMode !== undefined ? externalViewMode : internalViewMode;
  const showFilters =
    externalShowFilters !== undefined
      ? externalShowFilters
      : internalShowFilters;
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
        // If all suppliers are deselected, don't filter by supplier
        const supplierMatch =
          selectedSuppliers.length === 0 ||
          selectedSuppliers.includes(item.manufacturer || "Unknown");

        // If all quarters are deselected, don't filter by quarter
        const quarterMatch =
          selectedQuarters.length === 0 ||
          selectedQuarters.includes(item.quarter || "Unknown");

        // If all CN codes are deselected, don't filter by CN code
        const cnCodeMatch =
          selectedCnCodes.length === 0 ||
          selectedCnCodes.includes(item.cnCode || "Unknown");

        // Extract country from manufacturer (simplified example)
        const country = item.manufacturer?.includes("China")
          ? "China"
          : item.manufacturer?.includes("Turkey")
          ? "Turkey"
          : "Other";

        // If all countries are deselected, don't filter by country
        const countryMatch =
          selectedCountries.length === 0 || selectedCountries.includes(country);

        // Extract good category
        const goodCategory = extractGoodCategory(item.cnCode || "");

        // If all good categories are deselected, don't filter by good category
        const goodCategoryMatch =
          selectedGoodCategories.length === 0 ||
          selectedGoodCategories.includes(goodCategory);

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

        // Calculate direct and indirect emissions separately
        const quarterDirectEmissions = activeQuarters.map((quarter) => {
          const quarterItems = filteredData.filter(
            (item) => (item.quarter || "Unknown") === quarter
          );
          const directEmissions = quarterItems.reduce((sum, item) => {
            return sum + ((item.seeDirect || 0) * (item.quantity || 0) * 100000);
          }, 0);
          return Math.round(directEmissions);
        });

        const quarterIndirectEmissions = activeQuarters.map((quarter) => {
          const quarterItems = filteredData.filter(
            (item) => (item.quarter || "Unknown") === quarter
          );
          const indirectEmissions = quarterItems.reduce((sum, item) => {
            return sum + ((item.seeIndirect || 0) * (item.quantity || 0) * 100000);
          }, 0);
          return Math.round(indirectEmissions);
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

          // Calculate average SEE values
          let avgSeeDirect = 0;
          let avgSeeIndirect = 0;

          if (quarterItems.length > 0) {
            // Calculate weighted average SEE values
            const totalWeight = quarterItems.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0
            );

            if (totalWeight > 0) {
              avgSeeDirect =
                quarterItems.reduce(
                  (sum, item) =>
                    sum + (item.seeDirect || 0) * (item.quantity || 0),
                  0
                ) / totalWeight;

              avgSeeIndirect =
                quarterItems.reduce(
                  (sum, item) =>
                    sum + (item.seeIndirect || 0) * (item.quantity || 0),
                  0
                ) / totalWeight;
            }
          }

          const avgSeeTotal = avgSeeDirect + avgSeeIndirect;

          // Calculate total emissions (avg SEE * import quantity)
          const totalEmissions = avgSeeTotal * importQuantity * 100000; // Already in tCO2, now scaled

          return {
            label: quarter,
            supplierCount: uniqueSupplierCount,
            goodsCount: uniqueGoodsCount,
            importQuantity,
            avgSeeDirect: Math.round(avgSeeDirect * 100) / 100, // Round to 2 decimal places
            avgSeeIndirect: Math.round(avgSeeIndirect * 100) / 100, // Round to 2 decimal places
            avgSeeTotal: Math.round(avgSeeTotal * 100) / 100, // Round to 2 decimal places
            totalEmissions: Math.round(totalEmissions * 100) / 100, // Round to 2 decimal places
          };
        });

        datasets = [
          {
            label: "Direct Emissions (tCO₂)",
            data: quarterDirectEmissions,
            backgroundColor: "#2f4269", // Medium blue for direct emissions
            borderColor: "#2f4269", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
            stack: "emissions",
          },
          {
            label: "Indirect Emissions (tCO₂)",
            data: quarterIndirectEmissions,
            backgroundColor: "#5578c1", // Lighter blue for indirect emissions
            borderColor: "#5578c1", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
            stack: "emissions",
          },
          {
            label: "Import Quantity",
            data: quarterImports,
            backgroundColor: "#111827", // Dark blue/almost black for imports
            borderColor: "#111827", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y1", // Secondary axis (right)
          },
        ];
      } else if (viewMode === "suppliers") {
        // Use suppliers that have data after filtering
        let activeSuppliers = uniqueSuppliers.filter((supplier) =>
          filteredData.some(
            (item) => (item.manufacturer || "Unknown") === supplier
          )
        );

        // Calculate emissions for each supplier for sorting
        const supplierEmissions = new Map<string, number>();
        activeSuppliers.forEach((supplier) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          const totalEmissions = supplierItems.reduce((sum, item) => {
            const directEmissions =
              ((item.seeDirect || 0) * (item.quantity || 0) * 100000);
            const indirectEmissions =
              ((item.seeIndirect || 0) * (item.quantity || 0) * 100000);
            return sum + directEmissions + indirectEmissions;
          }, 0);
          supplierEmissions.set(supplier, totalEmissions);
        });

        // Sort suppliers by emissions (highest first)
        activeSuppliers = activeSuppliers.sort((a, b) => {
          const emissionsA = supplierEmissions.get(a) || 0;
          const emissionsB = supplierEmissions.get(b) || 0;
          return emissionsB - emissionsA; // Descending order
        });

        // Limit to top 10 suppliers
        const top10Suppliers = activeSuppliers.slice(0, 10);

        labels = top10Suppliers;

        if (top10Suppliers.length === 0) {
          setChartData({
            labels: [],
            datasets: [],
          });
          setIsDataReady(false);
          return;
        }

        // Calculate direct and indirect emissions separately
        const supplierDirectEmissions = top10Suppliers.map((supplier) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          const directEmissions = supplierItems.reduce((sum, item) => {
            return sum + ((item.seeDirect || 0) * (item.quantity || 0) * 100000);
          }, 0);
          return Math.round(directEmissions);
        });

        const supplierIndirectEmissions = top10Suppliers.map((supplier) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          const indirectEmissions = supplierItems.reduce((sum, item) => {
            return sum + ((item.seeIndirect || 0) * (item.quantity || 0) * 100000);
          }, 0);
          return Math.round(indirectEmissions);
        });

        const supplierImports = top10Suppliers.map((supplier) => {
          const supplierItems = filteredData.filter(
            (item) => (item.manufacturer || "Unknown") === supplier
          );
          return supplierItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
        });

        // Create detailed data for each supplier
        detailedData = top10Suppliers.map((supplier, index) => {
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

          // Calculate average SEE values
          let avgSeeDirect = 0;
          let avgSeeIndirect = 0;

          if (supplierItems.length > 0) {
            // Calculate weighted average SEE values
            const totalWeight = supplierItems.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0
            );

            if (totalWeight > 0) {
              avgSeeDirect =
                supplierItems.reduce(
                  (sum, item) =>
                    sum + (item.seeDirect || 0) * (item.quantity || 0),
                  0
                ) / totalWeight;

              avgSeeIndirect =
                supplierItems.reduce(
                  (sum, item) =>
                    sum + (item.seeIndirect || 0) * (item.quantity || 0),
                  0
                ) / totalWeight;
            }
          }

          const avgSeeTotal = avgSeeDirect + avgSeeIndirect;

          // Calculate total emissions (avg SEE * import quantity)
          const totalEmissions = avgSeeTotal * importQuantity * 100000; // Already in tCO2, now scaled

          return {
            label: supplier,
            quarterCount: uniqueQuarterCount,
            goodsCount: uniqueGoodsCount,
            importQuantity,
            avgSeeDirect: Math.round(avgSeeDirect * 100) / 100, // Round to 2 decimal places
            avgSeeIndirect: Math.round(avgSeeIndirect * 100) / 100, // Round to 2 decimal places
            avgSeeTotal: Math.round(avgSeeTotal * 100) / 100, // Round to 2 decimal places
            totalEmissions: Math.round(totalEmissions * 100) / 100, // Round to 2 decimal places
          };
        });

        datasets = [
          {
            label: "Direct Emissions (tCO₂)",
            data: supplierDirectEmissions,
            backgroundColor: "#2f4269", // Medium blue for direct emissions
            borderColor: "#2f4269", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
            stack: "emissions",
          },
          {
            label: "Indirect Emissions (tCO₂)",
            data: supplierIndirectEmissions,
            backgroundColor: "#5578c1", // Lighter blue for indirect emissions
            borderColor: "#5578c1", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
            stack: "emissions",
          },
          {
            label: "Import Quantity",
            data: supplierImports,
            backgroundColor: "#111827", // Dark blue/almost black for imports
            borderColor: "#111827", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y1", // Secondary axis (right)
          },
        ];
      } else if (viewMode === "cnCodes") {
        // Use CN codes that have data after filtering
        const activeCnCodes = uniqueCnCodes.filter((cnCode) =>
          filteredData.some((item) => (item.cnCode || "Unknown") === cnCode)
        );

        labels = activeCnCodes;

        if (activeCnCodes.length === 0) {
          setChartData({
            labels: [],
            datasets: [],
          });
          setIsDataReady(false);
          return;
        }

        // Calculate direct and indirect emissions separately
        const cnCodeDirectEmissions = activeCnCodes.map((cnCode) => {
          const cnCodeItems = filteredData.filter(
            (item) => (item.cnCode || "Unknown") === cnCode
          );
          const directEmissions = cnCodeItems.reduce((sum, item) => {
            return sum + ((item.seeDirect || 0) * (item.quantity || 0) * 100000);
          }, 0);
          return Math.round(directEmissions);
        });

        const cnCodeIndirectEmissions = activeCnCodes.map((cnCode) => {
          const cnCodeItems = filteredData.filter(
            (item) => (item.cnCode || "Unknown") === cnCode
          );
          const indirectEmissions = cnCodeItems.reduce((sum, item) => {
            return sum + ((item.seeIndirect || 0) * (item.quantity || 0) * 100000);
          }, 0);
          return Math.round(indirectEmissions);
        });

        const cnCodeImports = activeCnCodes.map((cnCode) => {
          const cnCodeItems = filteredData.filter(
            (item) => (item.cnCode || "Unknown") === cnCode
          );
          return cnCodeItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
        });

        // Create detailed data for each CN code
        detailedData = activeCnCodes.map((cnCode, index) => {
          const cnCodeItems = filteredData.filter(
            (item) => (item.cnCode || "Unknown") === cnCode
          );
          const uniqueSupplierCount = new Set(
            cnCodeItems.map((item) => item.manufacturer)
          ).size;
          const uniqueQuarterCount = new Set(
            cnCodeItems.map((item) => item.quarter)
          ).size;
          const importQuantity = cnCodeItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );

          // Calculate average SEE values
          let avgSeeDirect = 0;
          let avgSeeIndirect = 0;

          if (cnCodeItems.length > 0) {
            // Calculate weighted average SEE values
            const totalWeight = cnCodeItems.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0
            );

            if (totalWeight > 0) {
              avgSeeDirect =
                cnCodeItems.reduce(
                  (sum, item) =>
                    sum + (item.seeDirect || 0) * (item.quantity || 0),
                  0
                ) / totalWeight;

              avgSeeIndirect =
                cnCodeItems.reduce(
                  (sum, item) =>
                    sum + (item.seeIndirect || 0) * (item.quantity || 0),
                  0
                ) / totalWeight;
            }
          }

          const avgSeeTotal = avgSeeDirect + avgSeeIndirect;

          // Calculate total emissions (avg SEE * import quantity)
          const totalEmissions = avgSeeTotal * importQuantity * 100000; // Already in tCO2, now scaled

          return {
            label: cnCode,
            supplierCount: uniqueSupplierCount,
            quarterCount: uniqueQuarterCount,
            importQuantity,
            avgSeeDirect: Math.round(avgSeeDirect * 100) / 100, // Round to 2 decimal places
            avgSeeIndirect: Math.round(avgSeeIndirect * 100) / 100, // Round to 2 decimal places
            avgSeeTotal: Math.round(avgSeeTotal * 100) / 100, // Round to 2 decimal places
            totalEmissions: Math.round(totalEmissions * 100) / 100, // Round to 2 decimal places
          };
        });

        datasets = [
          {
            label: "Direct Emissions (tCO₂)",
            data: cnCodeDirectEmissions,
            backgroundColor: "#2f4269", // Medium blue for direct emissions
            borderColor: "#2f4269", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
            stack: "emissions",
          },
          {
            label: "Indirect Emissions (tCO₂)",
            data: cnCodeIndirectEmissions,
            backgroundColor: "#5578c1", // Lighter blue for indirect emissions
            borderColor: "#5578c1", // Match background color to remove outline
            borderWidth: 0, // Remove border
            yAxisID: "y", // Primary axis (left)
            stack: "emissions",
          },
          {
            label: "Import Quantity",
            data: cnCodeImports,
            backgroundColor: "#111827", // Dark blue/almost black for imports
            borderColor: "#111827", // Match background color to remove outline
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
          // Store whether we're showing limited suppliers
          isLimitedSuppliers:
            viewMode === "suppliers" && uniqueSuppliers.length > 10,
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
      const errorChartData = {
        labels: [],
        datasets: [],
        detailedData: [],
      };
      setChartData(errorChartData);

      setIsDataReady(false);
    }
  }, [
    goodsImports,
    uniqueQuarters,
    uniqueSuppliers,
    uniqueCnCodes,
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
        position: "bottom", // Change from 'top' to 'bottom'
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
              return `Direct Emissions: ${value} tCO₂`;
            } else if (context.datasetIndex === 1) {
              return `Indirect Emissions: ${value} tCO₂`;
            } else {
              return `Import Quantity: ${value} tons`;
            }
          },
        },
      },
      // Update data labels for stacked bars
      datalabels: {
        display: (context: any) => {
          // Only show data labels for the top of the stack or for the import quantity
          if (context.datasetIndex === 1) {
            // Indirect emissions (top of emissions stack)
            return context.dataset.data && context.dataset.data.length > 0;
          } else if (context.datasetIndex === 2) {
            // Import quantity
            return context.dataset.data && context.dataset.data.length > 0;
          }
          return false; // Hide for direct emissions (bottom of stack)
        },
        anchor: "end",
        align: "top",
        formatter: (value: number, context: any) => {
          if (!value && value !== 0) return "";
          if (context.datasetIndex === 1) {
            // Indirect emissions (show total emissions)
            // Calculate total emissions (direct + indirect) for this label
            const labelIndex = context.dataIndex;
            const directValue =
              context.chart.data.datasets[0].data[labelIndex] || 0;
            const indirectValue = value;
            const total = directValue + indirectValue;
            return total.toLocaleString() + "\ntCO₂";
          } else if (context.datasetIndex === 2) {
            // Import quantity
            return value.toLocaleString() + "\ntons";
          }
          return "";
        },
        font: {
          weight: "bold",
          size: 12, // Same size for all labels
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
          text: "Emissions (tCO₂)",
        },
        ticks: {
          padding: 5,
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
        // Grid lines are drawn for the right axis
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
      x: {
        title: {
          display: true,
          text:
            viewMode === "quarters"
              ? "Quarter"
              : viewMode === "suppliers"
              ? "Supplier"
              : "CN Code",
        },
      },
    },
    // Add padding to the entire chart
    layout: {
      padding: {
        top: 80, // Increased from 50 to 80 for more space
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
    <>
      {!hideControls && (
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => setInternalShowFilters(!internalShowFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {internalShowFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-1 w-fit">
              <button
                onClick={() => setInternalViewMode("quarters")}
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
                onClick={() => setInternalViewMode("suppliers")}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  viewMode === "suppliers"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                By Suppliers
              </button>
              <button
                onClick={() => setInternalViewMode("cnCodes")}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  viewMode === "cnCodes"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                By CN Codes
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full bg-neutral-50 border-0 shadow-sm">
        <CardContent className="pt-6">
          {showFilters && (
            <div className="mb-3 border rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-sm font-medium">Filter Options</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="default"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      handleSelectAllGoodCategories();
                      handleSelectAllCnCodes();
                      handleSelectAllCountries();
                      handleSelectAllSuppliers();
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="default"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      handleClearGoodCategories();
                      handleClearCnCodes();
                      handleClearCountries();
                      handleClearSuppliers();
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="p-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Good Categories filter */}
                <div className="border rounded-md p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Good Categories</span>
                    {selectedGoodCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearGoodCategories}
                        className="text-xs text-gray-500 h-5 px-1"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="relative mb-1">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
                  </div>
                  <div className="relative mb-1">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search..."
                      className="pl-7 text-xs h-6"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {filteredGoodCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="default"
                            onClick={() => handleToggleGoodCategory(category)}
                            className={cn(
                              "h-5 w-5 p-0 mr-1",
                              selectedGoodCategories.includes(category)
                                ? "text-primary"
                                : "text-gray-400"
                            )}
                          >
                            {selectedGoodCategories.includes(category) ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                          <label className="text-xs truncate max-w-[120px]">
                            {category}
                          </label>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs h-4 px-1 ml-1"
                        >
                          {calculateFilterCounts.goodCategories[category] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CN Codes filter */}
                <div className="border rounded-md p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">CN Codes</span>
                    {selectedCnCodes.length > 0 && (
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearCnCodes}
                        className="text-xs text-gray-500 h-5 px-1"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="relative mb-1">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search..."
                      className="pl-7 text-xs h-6"
                      value={cnCodeSearch}
                      onChange={(e) => setCnCodeSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {filteredCnCodes.map((cnCode) => (
                      <div
                        key={cnCode}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="default"
                            onClick={() => handleToggleCnCode(cnCode)}
                            className={cn(
                              "h-5 w-5 p-0 mr-1",
                              selectedCnCodes.includes(cnCode)
                                ? "text-primary"
                                : "text-gray-400"
                            )}
                          >
                            {selectedCnCodes.includes(cnCode) ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                          <label className="text-xs truncate max-w-[120px]">
                            {cnCode}
                          </label>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs h-4 px-1 ml-1"
                        >
                          {calculateFilterCounts.cnCodes[cnCode] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Countries filter */}
                <div className="border rounded-md p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Countries</span>
                    {selectedCountries.length > 0 && (
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearCountries}
                        className="text-xs text-gray-500 h-5 px-1"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="relative mb-1">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search..."
                      className="pl-7 text-xs h-6"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {filteredCountries.map((country) => (
                      <div
                        key={country}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="default"
                            onClick={() => handleToggleCountry(country)}
                            className={cn(
                              "h-5 w-5 p-0 mr-1",
                              selectedCountries.includes(country)
                                ? "text-primary"
                                : "text-gray-400"
                            )}
                          >
                            {selectedCountries.includes(country) ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                          <label className="text-xs truncate max-w-[120px]">
                            {country}
                          </label>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs h-4 px-1 ml-1"
                        >
                          {calculateFilterCounts.countries[country] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suppliers filter (shown in quarters view) */}
                <div
                  className={
                    viewMode === "suppliers"
                      ? "hidden"
                      : "border rounded-md p-2"
                  }
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Suppliers</span>
                    {selectedSuppliers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearSuppliers}
                        className="text-xs text-gray-500 h-5 px-1"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="relative mb-1">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search..."
                      className="pl-7 text-xs h-6"
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {filteredSuppliers.map((supplier) => (
                      <div
                        key={supplier}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="default"
                            onClick={() => handleToggleSupplier(supplier)}
                            className={cn(
                              "h-5 w-5 p-0 mr-1",
                              selectedSuppliers.includes(supplier)
                                ? "text-primary"
                                : "text-gray-400"
                            )}
                          >
                            {selectedSuppliers.includes(supplier) ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                          <label className="text-xs truncate max-w-[120px]">
                            {supplier}
                          </label>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs h-4 px-1 ml-1"
                        >
                          {calculateFilterCounts.suppliers[supplier] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quarters filter (shown in suppliers view) */}
                <div
                  className={
                    viewMode === "quarters" ? "hidden" : "border rounded-md p-2"
                  }
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Quarters</span>
                    {selectedQuarters.length > 0 && (
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleClearQuarters}
                        className="text-xs text-gray-500 h-5 px-1"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {uniqueQuarters.map((quarter) => (
                      <div
                        key={quarter}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="default"
                            onClick={() => handleToggleQuarter(quarter)}
                            className={cn(
                              "h-5 w-5 p-0 mr-1",
                              selectedQuarters.includes(quarter)
                                ? "text-primary"
                                : "text-gray-400"
                            )}
                          >
                            {selectedQuarters.includes(quarter) ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                          <label className="text-xs">{quarter}</label>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs h-4 px-1 ml-1"
                        >
                          {calculateFilterCounts.quarters[quarter] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add filter tags section above the chart */}
          <div className="mb-4 flex flex-wrap gap-1">
            {selectedGoodCategories.length < uniqueGoodCategories.length &&
              selectedGoodCategories.map((category) => (
                <Badge
                  key={`cat-${category}`}
                  variant="secondary"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <span className="text-xs">Category: {category}</span>
                  <Button
                    variant="ghost"
                    size="default"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleToggleGoodCategory(category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

            {selectedCnCodes.length < uniqueCnCodes.length &&
              selectedCnCodes.map((code) => (
                <Badge
                  key={`cn-${code}`}
                  variant="secondary"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <span className="text-xs">CN: {code}</span>
                  <Button
                    variant="ghost"
                    size="default"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleToggleCnCode(code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

            {selectedCountries.length < uniqueCountries.length &&
              selectedCountries.map((country) => (
                <Badge
                  key={`country-${country}`}
                  variant="secondary"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <span className="text-xs">Country: {country}</span>
                  <Button
                    variant="ghost"
                    size="default"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleToggleCountry(country)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

            {viewMode === "quarters" &&
              selectedSuppliers.length < uniqueSuppliers.length &&
              selectedSuppliers.map((supplier) => (
                <Badge
                  key={`supplier-${supplier}`}
                  variant="secondary"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <span className="text-xs">Supplier: {supplier}</span>
                  <Button
                    variant="ghost"
                    size="default"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleToggleSupplier(supplier)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

            {viewMode === "suppliers" &&
              selectedQuarters.length < uniqueQuarters.length &&
              selectedQuarters.map((quarter) => (
                <Badge
                  key={`quarter-${quarter}`}
                  variant="secondary"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <span className="text-xs">Quarter: {quarter}</span>
                  <Button
                    variant="ghost"
                    size="default"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleToggleQuarter(quarter)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
          </div>

          {/* Display info about top 10 suppliers limitation */}
          {viewMode === "suppliers" && uniqueSuppliers.length > 10 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200">
              <Info className="h-4 w-4" />
              <span>Showing top 10 suppliers by emissions</span>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="default"
                      className="h-5 w-5 p-0"
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      For better visualization, only the top 10 suppliers by
                      total emissions are shown in the chart.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          )}

          <div className="h-[450px]">
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
        </CardContent>
      </Card>

      <div className="rounded-lg border border-gray-200 mt-6">
        <div className="p-4 border-b bg-white">
          <h3 className="text-xl font-semibold">Raw Data</h3>
        </div>
        <div className="relative min-w-[600px] overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground">
                  {viewMode === "quarters"
                    ? "Quarter"
                    : viewMode === "suppliers"
                    ? "Supplier"
                    : "CN Code"}
                </th>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground [&:not([:first-child])]:border-l">
                  {viewMode === "quarters" ? "# Suppliers" : "# Quarters"}
                </th>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground [&:not([:first-child])]:border-l">
                  # Goods
                </th>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground [&:not([:first-child])]:border-l">
                  Import Quantity
                </th>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground [&:not([:first-child])]:border-l">
                  AVG SEE Direct
                </th>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground [&:not([:first-child])]:border-l">
                  AVG SEE Indirect
                </th>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground [&:not([:first-child])]:border-l">
                  AVG SEE
                </th>
                <th className="px-4 py-2 font-medium text-left border-b bg-white text-muted-foreground [&:not([:first-child])]:border-l">
                  Total Emissions
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.detailedData && chartData.detailedData.length > 0 ? (
                chartData.detailedData.map((item: any) => (
                  <tr
                    key={item.label}
                    className="border-b transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <td className="p-4">{item.label}</td>
                    <td className="p-4 [&:not([:first-child])]:border-l">
                      {viewMode === "quarters"
                        ? item.supplierCount
                        : item.quarterCount}
                    </td>
                    <td className="p-4 [&:not([:first-child])]:border-l">
                      {item.goodsCount}
                    </td>
                    <td className="p-4 [&:not([:first-child])]:border-l">
                      {item.importQuantity.toLocaleString()} tons
                    </td>
                    <td className="p-4 [&:not([:first-child])]:border-l">
                      {item.avgSeeDirect.toLocaleString()} tCO₂/t
                    </td>
                    <td className="p-4 [&:not([:first-child])]:border-l">
                      {item.avgSeeIndirect.toLocaleString()} tCO₂/t
                    </td>
                    <td className="p-4 [&:not([:first-child])]:border-l">
                      {item.avgSeeTotal.toLocaleString()} tCO₂/t
                    </td>
                    <td className="p-4 [&:not([:first-child])]:border-l">
                      {item.totalEmissions.toLocaleString()} tCO₂
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    No data available for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
