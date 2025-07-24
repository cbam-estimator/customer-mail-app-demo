"use client";

import type React from "react";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Check,
  FileDown,
  Clock,
  Download,
  CheckCircle2,
  Users,
} from "lucide-react";
import { SupplierStatus } from "@/types/supplier";
import type { Supplier } from "@/types/supplier";
import type { GoodsImportRow } from "@/types/excel";

// Custom SVG Donut Chart Component
interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  centerText: string;
  centerSubText: string;
}

function DonutChart({ data, centerText, centerSubText }: DonutChartProps) {

  console.log("yydata", data);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const strokeWidth = 20;
  const innerRadius = radius - strokeWidth;
  const circumference = 2 * Math.PI * innerRadius;

  console.log("don", data);

  // Calculate each segment's arc length
  let startAngle = 0;
  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const arcLength = percentage * circumference;

    // Calculate SVG arc path
    const endAngle = startAngle + percentage * 2 * Math.PI;
    const largeArcFlag = percentage > 0.5 ? 1 : 0;

    const x1 = 100 + innerRadius * Math.cos(startAngle - Math.PI / 2);
    const y1 = 100 + innerRadius * Math.sin(startAngle - Math.PI / 2);
    const x2 = 100 + innerRadius * Math.cos(endAngle - Math.PI / 2);
    const y2 = 100 + innerRadius * Math.sin(endAngle - Math.PI / 2);

    const path =
      percentage === 0
        ? ""
        : `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    const result = {
      path,
      color: item.color,
      label: item.label,
      value: item.value,
      percentage,
      startAngle,
      endAngle,
    };

    startAngle = endAngle;
    return result;
  });

  // If no data, show a placeholder circle
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-gray-400 text-lg">No supplier data</div>
        <div className="text-gray-400 text-sm mt-2">
          Add suppliers to see statistics
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-80 h-80">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={innerRadius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segments.map(
          (segment, i) =>
            segment.path && (
              <path
                key={i}
                d={segment.path}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
              />
            )
        )}

        {/* Center text */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#000"
        >
          {centerText}
        </text>
        <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#666">
          {centerSubText}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
        {data.map(
          (item, i) =>
            item.value > 0 && (
              <div key={i} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-1"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs">
                  {item.label} ({item.value})
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
}

// Mock data for CBAM reports - this would normally come from your database or API
const mockCBAMReports = [
  { quarter: "Q3-2024", creationDate: "2024-10-15" },
  { quarter: "Q1-2024", creationDate: "2024-04-10" },
  { quarter: "Q4-2023", creationDate: "2024-01-15" },
  { quarter: "Q3-2023", creationDate: "2023-10-15" },
  { quarter: "Q2-2023", creationDate: "2023-07-10" },
  { quarter: "Q1-2023", creationDate: "2023-04-05" },
];

// Report Status Box Component
interface ReportStatusBoxProps {
  activeQuarter: string;
}

function ReportStatusBox({ activeQuarter }: ReportStatusBoxProps) {
  // Check if a report exists for the active quarter
  // const reportExists = useMemo(() => {
  //   // If "all" is selected, check if any reports exist
  //   if (activeQuarter === "all") {
  //     return mockCBAMReports.length > 0;
  //   }

  //   // Otherwise, check if a report exists for the specific quarter
  //   return mockCBAMReports.some((report) => report.quarter === activeQuarter);
  // }, [activeQuarter]);

  const reportExists = useMemo(() => {
    // If "all" is selected, check if any reports exist
    return true;
  }, [activeQuarter]);

  const reportUrl =
    "https://docs.google.com/spreadsheets/d/1P-P_KcQJ_B3zCwpFAV-d6vtnFSbFFnmF2B35H-ySxSw/edit?pli=1&gid=0#gid=0";

  // Function to handle XML download
  const handleDownloadXML = (e: React.MouseEvent) => {
    if (!reportExists) {
      e.preventDefault();
      return;
    }

    // Create a sample XML content for the CBAM report
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CBAMReport>
  <ReportingPeriod>${activeQuarter}</ReportingPeriod>
  <GenerationDate>${new Date().toISOString().split("T")[0]}</GenerationDate>
  <Emissions>
    <TotalDirectEmissions>1234.56</TotalDirectEmissions>
    <TotalIndirectEmissions>789.01</TotalIndirectEmissions>
  </Emissions>
  <Imports>
    <TotalWeight>5000.00</TotalWeight>
    <NumberOfSuppliers>12</NumberOfSuppliers>
  </Imports>
</CBAMReport>`;

    // Create a Blob with the XML content
    const blob = new Blob([xmlContent], { type: "application/xml" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = `CBAM_Report_${activeQuarter.replace("-", "_")}.xml`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between w-full text-lg">
      {activeQuarter === "all" ? (
        <></>
      ) : (
        <>
          {reportExists ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div className="flex flex-col">
                <span className="text-lg font-medium">
                  Report Available for {activeQuarter}
                </span>
                <span className="text-xs text-gray-500">
                  Ready to download and submit
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-lg font-medium">
                  No Report Available for {activeQuarter}
                </span>
                <span className="text-xs text-gray-500">
                  Complete data collection first
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleDownloadXML}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              reportExists
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!reportExists}
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </>
      )}
    </div>
  );
}

interface EnhancedDashboardProps {
  suppliers: Supplier[];
  goodsImports: GoodsImportRow[];
}

export function EnhancedDashboard({
  suppliers,
  goodsImports,
}: EnhancedDashboardProps) {
  // Function to check if a report exists for a specific quarter
  const checkReportExists = (quarter: string): boolean => {
    if (quarter === "all") {
      return mockCBAMReports.length > 0;
    }
    return mockCBAMReports.some((report) => report.quarter === quarter);
  };

  // Extract all available quarters from goods imports
  const availableQuarters = useMemo(() => {
    const quarters = new Set<string>();
    goodsImports.forEach((item) => {
      if (item.quarter) {
        quarters.add(item.quarter);
      }
    });

    console.log("quarters", quarters);

    return Array.from(quarters).sort((a, b) => {
      // Sort quarters chronologically (Q1-2023, Q2-2023, etc.)
      const [aQ, aY] = a.split("-");
      const [bQ, bY] = b.split("-");
      return aY === bY ? aQ.localeCompare(bQ) : aY.localeCompare(bY);
    });
  }, [goodsImports]);

  // Function to get the current quarter based on the current date
  const getCurrentQuarter = (): string => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${currentQuarter}-${currentYear}`;
  };

  // Create an array of all quarters to display
  const quartersToDisplay = useMemo(() => {
    // Only use available quarters
    const allQuarters = [...availableQuarters];

    // Sort the quarters in descending order (most recent first)
    allQuarters.sort((a, b) => {
      const [aQ, aY] = a.split("-");
      const [bQ, bY] = b.split("-");

      // Compare years first (descending)
      if (aY !== bY) {
        return Number.parseInt(bY) - Number.parseInt(aY);
      }

      // If years are the same, compare quarters (descending)
      return (
        Number.parseInt(bQ.substring(1)) - Number.parseInt(aQ.substring(1))
      );
    });

    return allQuarters;
  }, [availableQuarters]);

  // Get the current quarter
  const currentQuarter = getCurrentQuarter();

  // Set the default active quarter to the current quarter
  const [activeQuarter, setActiveQuarter] = useState<string>(
    quartersToDisplay[0] || "all"
  );

  // Get supplier IDs that have imports in a specific quarter
  const getSupplierIdsWithImportsInQuarter = (quarter: string): Set<number> => {
    const supplierIds = new Set<number>();

  

    goodsImports.forEach((item) => {
      if (quarter === "all" || item.quarter === quarter) {
        // Extract supplier ID from manufacturer field if possible
        // This is a workaround since we don't have direct supplier IDs in goodsImports
        // In a real application, you would have a proper relation
        const supplier = suppliers.find((s) => s.id === item.supplierId);
        if (supplier && supplier.id) {
          supplierIds.add(supplier.id);
        }
      }
    });

    return supplierIds;
  };

  // Filter suppliers by quarter based on their imports
  const getSuppliersByQuarter = (quarter: string): Supplier[] => {
    if (quarter === "all") return suppliers;

    const supplierIdsInQuarter = getSupplierIdsWithImportsInQuarter(quarter);
    return suppliers.filter(
      (supplier) => supplier.id && supplierIdsInQuarter.has(supplier.id)
    );
  };

  // Filter goods imports by quarter
  const getGoodsImportsByQuarter = (quarter: string): GoodsImportRow[] => {
    if (quarter === "all") return goodsImports;
    return goodsImports.filter((item) => item.quarter === quarter);
  };

  // Calculate supplier status distribution for a given quarter
  const getSupplierStatusDistribution = (quarter: string) => {
    const filteredSuppliers = getSuppliersByQuarter(quarter);

    // Robust status comparison helper
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "");

    const statusCounts = {
      pending: 2,
      emissionData: 3,
      supportingDocs: 2,
    };

    filteredSuppliers.forEach((supplier) => {
      const status = supplier.status;
      if (
        status === SupplierStatus.Pending ||
        status === SupplierStatus.Contacted ||
        status === SupplierStatus.ConsultationRequested
      ) {
        statusCounts.pending++;
      } else if (
        normalize(status) === normalize(SupplierStatus.EmissionDataReceived)
      ) {
        statusCounts.emissionData++;
      } else if (
        normalize(status) === normalize(SupplierStatus.SupportingDocumentsReceived)
      ) {
        statusCounts.supportingDocs++;
      }
    });

    // Format data for our custom donut chart
    return [
      { label: "Pending", value: statusCounts.pending, color: "#fbbf24" },
      {
        label: "Emission Data",
        value: statusCounts.emissionData,
        color: "#10b981",
      },
      {
        label: "Supporting Docs",
        value: statusCounts.supportingDocs,
        color: "#3b82f6",
      },
    ];
  };

  // Calculate total imports and emissions for a given quarter
  const getQuarterStats = (quarter: string) => {
    const filteredImports = getGoodsImportsByQuarter(quarter);
    const filteredSuppliers = getSuppliersByQuarter(quarter);

    // Calculate total imports (quantity)
    const totalImports = filteredImports.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    // Calculate total emissions
    const totalEmissions = filteredImports.reduce((sum, item) => {
      const emissionFactor = (item.seeDirect || 0) + (item.seeIndirect || 0);
      return sum + emissionFactor * (item.quantity || 0);
    }, 0);

    // Calculate suppliers covered percentage
    const totalSuppliers = filteredSuppliers.length;
    const coveredSuppliers = filteredSuppliers.filter(
      (s) =>
        s.status === SupplierStatus.EmissionDataReceived ||
        s.status === SupplierStatus.SupportingDocumentsReceived
    ).length;

    const suppliersCoveredPercentage =
      totalSuppliers > 0
        ? Math.round((coveredSuppliers / totalSuppliers) * 100)
        : 0;

    // Get previous quarter for comparison
    const previousQuarterStats = { totalImports: 0, totalEmissions: 0 };

    if (quarter !== "all" && availableQuarters.length > 1) {
      const currentIndex = availableQuarters.indexOf(quarter);
      if (currentIndex > 0) {
        const previousQuarter = availableQuarters[currentIndex - 1];
        const previousImports = getGoodsImportsByQuarter(previousQuarter);

        previousQuarterStats.totalImports = previousImports.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        previousQuarterStats.totalEmissions = previousImports.reduce(
          (sum, item) => {
            const emissionFactor =
              (item.seeDirect || 0) + (item.seeIndirect || 0);
            return sum + emissionFactor * (item.quantity || 0);
          },
          0
        );
      }
    }

    // Calculate percentage changes
    const importChange =
      previousQuarterStats.totalImports > 0
        ? ((totalImports - previousQuarterStats.totalImports) /
            previousQuarterStats.totalImports) *
          100
        : 0;

    const emissionChange =
      previousQuarterStats.totalEmissions > 0
        ? ((totalEmissions - previousQuarterStats.totalEmissions) /
            previousQuarterStats.totalEmissions) *
          100
        : 0;

    // Check if a report exists for this quarter
    const reportExists = checkReportExists(quarter);

    // Generate report status
    // Update the report status options to use Check instead of FileCheck and adjust colors
    const reportStatusOptions = [
      {
        text: "Report is ready for Creation",
        icon: Check,
        color: "text-gray-800",
        reportExists,
      },
      {
        text: "Report created (download)",
        icon: FileDown,
        color: "text-gray-800",
        reportExists,
      },
      {
        text: "Report is not ready yet",
        icon: Clock,
        color: "text-gray-800",
        reportExists,
      },
    ];

    // Use a deterministic approach based on supplier coverage
    let reportStatusIndex = 2; // Default to "not ready"
    if (suppliersCoveredPercentage >= 80) {
      reportStatusIndex = 1; // "Report created"
    } else if (suppliersCoveredPercentage >= 50) {
      reportStatusIndex = 0; // "Ready for creation"
    }

    const reportStatus = reportStatusOptions[reportStatusIndex];

    return {
      totalImports,
      totalEmissions,
      importChange,
      emissionChange,
      suppliersCoveredPercentage,
      reportStatus,
      totalSuppliers,
      reportExists,
    };
  };

  // Function to render the status icon in tabs
  const renderTabStatusIcon = (
    _quarterStats: ReturnType<typeof getQuarterStats>,
    isActive: boolean
  ) => {
    // Check if a report exists for this quarter in the CBAM Reports
    //const reportExists = quarterStats.reportExists;
    const reportExists = true;

    // If a report exists, show the check icon, otherwise show the pending/clock icon
    const IconComponent = reportExists ? CheckCircle2 : Clock;
    const iconColor = reportExists ? "text-green-500" : "text-amber-500";

    return (
      <IconComponent
        className={`h-4 w-4 mr-2 ${isActive ? "text-white" : iconColor}`}
      />
    );
  };

  return (
    <Card className="mt-8 mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-8 px-10">
        <CardTitle className="text-xl font-semibold my-0">Dashboard</CardTitle>
      </CardHeader>

      {/* Quarter selection buttons moved outside of CardContent */}
      <div className="px-10 py-6 border-t border-b bg-neutral-50">
        <div className="flex flex-wrap gap-8">
          {/* Available quarters */}
          {quartersToDisplay.map((quarter) => {
            const quarterStats = getQuarterStats(quarter);
            return (
              <button
                key={quarter}
                onClick={() => setActiveQuarter(quarter)}
                className={`flex items-center justify-center min-w-[110px] rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors
                  ${
                    activeQuarter === quarter
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
              >
                {renderTabStatusIcon(quarterStats, activeQuarter === quarter)}
                {quarter}
              </button>
            );
          })}

          {/* All Time at the end */}
          <button
            onClick={() => setActiveQuarter("all")}
            className={`flex items-center justify-center min-w-[110px] rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors
              ${
                activeQuarter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
          >
            All Time
          </button>
        </div>
      </div>

      <CardContent className="p-10">
        {/* Tabs component now only contains the content */}
        <Tabs value={activeQuarter}>
          {/* Content for quarters */}
          {quartersToDisplay.map(
            (quarter) =>
              activeQuarter === quarter && (
                <div key={quarter}>
                  <QuarterDashboard
                    quarter={quarter}
                    chartData={getSupplierStatusDistribution(quarter)}
                    stats={getQuarterStats(quarter)}
                    isPreviousQuarterAvailable={
                      availableQuarters.indexOf(quarter) > 0
                    }
                    availableQuarters={availableQuarters}
                  />
                </div>
              )
          )}

          {/* Content for "all" tab */}
          {activeQuarter === "all" && (
            <QuarterDashboard
              quarter="all"
              chartData={getSupplierStatusDistribution("all")}
              stats={getQuarterStats("all")}
              isPreviousQuarterAvailable={false}
              availableQuarters={availableQuarters}
            />
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="border-t py-8 px-10 bg-white rounded-b-lg">
        <ReportStatusBox activeQuarter={activeQuarter} />
      </CardFooter>
    </Card>
  );
}

interface QuarterDashboardProps {
  quarter: string;
  chartData: {
    label: string;
    value: number;
    color: string;
  }[];
  stats: {
    totalImports: number;
    totalEmissions: number;
    importChange: number;
    emissionChange: number;
    suppliersCoveredPercentage: number;
    reportStatus: {
      text: string;
      icon: any;
      color: string;
      reportExists: boolean;
    };
    totalSuppliers: number;
    reportExists: boolean;
  };
  isPreviousQuarterAvailable: boolean;
  availableQuarters: string[];
}

function QuarterDashboard({
  quarter,
  chartData,
  stats,
  isPreviousQuarterAvailable,
  availableQuarters,
}: QuarterDashboardProps) {
  // Helper function to get the previous quarter string
  const getPreviousQuarter = (currentQuarter: string): string => {
    if (currentQuarter === "all" || !isPreviousQuarterAvailable) return "";

    const currentIndex = availableQuarters.indexOf(currentQuarter);
    if (currentIndex > 0) {
      return availableQuarters[currentIndex - 1];
    }
    return "";
  };

  const ReportStatusIcon = stats.reportStatus.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 flex items-center justify-center">
        <div className="h-[320px] w-full flex items-center justify-center">
          <DonutChart
            data={chartData}
            centerText={stats.totalSuppliers.toString()}
            centerSubText="Suppliers"
          />
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Total Imports
            </h4>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">
                {((stats.totalImports / 1000) * 1000).toLocaleString()} tons
              </div>
              {isPreviousQuarterAvailable && (
                <div className="flex flex-col items-end">
                  <div
                    className={`flex items-center ${
                      stats.importChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.importChange >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {Math.abs(stats.importChange).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    from {getPreviousQuarter(quarter)}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Total Emissions
            </h4>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">
                {((stats.totalEmissions / 1000) * 1000).toLocaleString()} t CO₂
              </div>
              {isPreviousQuarterAvailable && (
                <div className="flex flex-col items-end">
                  <div
                    className={`flex items-center ${
                      stats.emissionChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.emissionChange >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {Math.abs(stats.emissionChange).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    from {getPreviousQuarter(quarter)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Supplier Information
            </h4>
            <div className="flex flex-col space-y-4">
              {/* Total Suppliers */}
              <div className="flex items-center">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-500" />
                  <div className="text-2xl font-bold">
                    {stats.totalSuppliers}
                  </div>
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">
                    Total Suppliers
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Suppliers Covered */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Suppliers Covered
                  </span>
                  <span className="text-xl font-bold">
                    {stats.suppliersCoveredPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${stats.suppliersCoveredPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Suppliers with emission data or supporting documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
