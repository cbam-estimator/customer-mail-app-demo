"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { ForecastVisualization } from "@/components/ForecastVisualization";
import type { GoodsImportRow } from "@/types/excel";

// This is a client-side component, so we need to initialize with empty data
// and then fetch the actual data on the client
export default function FinancialForecastPage() {
  const [activeTab, setActiveTab] = useState("forecast");
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
          supplierId: 1, // Assuming a default supplier ID, adjust as needed
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
        defaultValue="forecast"
        onValueChange={setActiveTab}
        className="w-full"
      >
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
              CBAM Cost Forecast (2026-2034)
            </CardTitle>
          </CardHeader>

          <CardContent className="border-t pt-4">
            <ForecastVisualization goodsImports={goodsImports} />
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
