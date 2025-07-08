"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, Download, BarChart3 } from "lucide-react";
import { SupplierStatus } from "@/types/supplier";
import type { Supplier } from "@/types/supplier";
import type { GoodsImportRow } from "@/types/excel";
import { AnimatedSparkles } from "@/components/AnimatedSparkles";
import { GoodsTable } from "@/components/SupplierGoods/Goods/GoodsTable";
import { Pagination } from "@/components/Pagination";

// Mock data for testing - in a real app, this would come from your database
const mockGoodsImports: GoodsImportRow[] = [
  {
    id: 1,
    quarter: "Q1-2023",
    manufacturer: "Supplier A",
    cnCode: "7201",
    quantity: 1000,
    unit: "tons",
    seeDirect: 1.2,
    seeIndirect: 0.8,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
  {
    id: 2,
    quarter: "Q1-2023",
    manufacturer: "Supplier B",
    cnCode: "7202",
    quantity: 800,
    unit: "tons",
    seeDirect: 1.5,
    seeIndirect: 0.9,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
  {
    id: 3,
    quarter: "Q2-2023",
    manufacturer: "Supplier A",
    cnCode: "7201",
    quantity: 1200,
    unit: "tons",
    seeDirect: 1.2,
    seeIndirect: 0.8,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
  {
    id: 4,
    quarter: "Q2-2023",
    manufacturer: "Supplier C",
    cnCode: "7203",
    quantity: 600,
    unit: "tons",
    seeDirect: 1.8,
    seeIndirect: 1.1,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
  {
    id: 5,
    quarter: "Q3-2023",
    manufacturer: "Supplier B",
    cnCode: "7202",
    quantity: 900,
    unit: "tons",
    seeDirect: 1.5,
    seeIndirect: 0.9,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
  {
    id: 6,
    quarter: "Q3-2023",
    manufacturer: "Supplier C",
    cnCode: "7203",
    quantity: 700,
    unit: "tons",
    seeDirect: 1.8,
    seeIndirect: 1.1,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
  {
    id: 7,
    quarter: "Q4-2023",
    manufacturer: "Supplier A",
    cnCode: "7201",
    quantity: 1100,
    unit: "tons",
    seeDirect: 1.2,
    seeIndirect: 0.8,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
  {
    id: 8,
    quarter: "Q4-2023",
    manufacturer: "Supplier B",
    cnCode: "7202",
    quantity: 850,
    unit: "tons",
    seeDirect: 1.5,
    seeIndirect: 0.9,
    remarks: "wow",
    productionMethod: "",
    customsProcedure: "",
    date: new Date("2023-01-15"),
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Supplier A",
    status: SupplierStatus.EmissionDataReceived,
    address: {
      country: "China",
      street: "",
      streetNumber: "",
      additionalLine: "",
      postcode: "",
      city: "",
    },
    contactPerson: { name: "", email: "", phone: "" },
    cnCodes: ["", ""],
    remarks: "",
    lastUpdate: "",
    files: [
      {
        id: "1",
        filename: "",
        dateReceived: "",
        documentType: "emission data",
        filesize: 23,
        url: "dfff",
      },
    ],
    consultationHours: 3,
    country: "",
  },
];

interface CBAMReportsPageProps {
  suppliers?: Supplier[];
  goodsImports?: GoodsImportRow[];
}

export default function CBAMReportsPage() {
  const suppliers = mockSuppliers;
  const goodsImports = mockGoodsImports;

  const getCurrentQuarter = (): string => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${currentQuarter}-${currentYear}`;
  };

  // Get the current quarter
  const currentQuarter = getCurrentQuarter();

  // Extract all available quarters from goods imports
  const availableQuarters = useMemo(() => {
    const quarters = new Set<string>();
    goodsImports.forEach((item) => {
      if (item.quarter) {
        quarters.add(item.quarter);
      }
    });
    return Array.from(quarters).sort((a, b) => {
      // Sort quarters chronologically (Q1-2023, Q2-2023, etc.)
      const [aQ, aY] = a.split("-");
      const [bQ, bY] = b.split("-");
      return aY === bY ? aQ.localeCompare(bQ) : aY.localeCompare(bY);
    });
  }, [goodsImports]);

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

  // Set the default active quarter to the most recent quarter with data
  const [activeQuarter, setActiveQuarter] = useState<string>(
    quartersToDisplay[0] || currentQuarter
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [goodsImportPage, setGoodsImportPage] = useState(1);
  const [goodsImportItemsPerPage, setGoodsImportItemsPerPage] = useState(10);
  const [selectedGoodsEntries, setSelectedGoodsEntries] = useState<number[]>(
    []
  );
  const [activeQuarterForGoods, setActiveQuarterForGoods] = useState<
    string | null
  >(null);

  // Goods table handlers
  const handleQuarterFilterChange = (quarter: string) => {
    setActiveQuarterForGoods((prevQuarter) =>
      prevQuarter === quarter ? null : quarter
    );
    setGoodsImportPage(1); // Reset to first page when changing filter
  };

  const handleSelectGoodsEntry = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedGoodsEntries((prev) => [...prev, index]);
    } else {
      setSelectedGoodsEntries((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleSelectAllGoodsEntries = (checked: boolean) => {
    if (checked) {
      setSelectedGoodsEntries(goodsImports.map((_, index) => index));
    } else {
      setSelectedGoodsEntries([]);
    }
  };

  const handleEditGoodsEntry = (entry: GoodsImportRow) => {
    // This would open an edit dialog in a real implementation
    console.log("Edit goods entry:", entry);
  };

  const handleDeleteGoodsEntry = (index: number) => {
    // This would delete the entry in a real implementation
    console.log("Delete goods entry at index:", index);
  };

  const handleDeleteSelectedGoodsEntries = () => {
    // This would delete selected entries in a real implementation
    console.log("Delete selected goods entries:", selectedGoodsEntries);
    setSelectedGoodsEntries([]);
  };

  // Get filtered goods imports for the active quarter for goods table
  const paginatedGoodsImports = useMemo(() => {
    const filtered = activeQuarterForGoods
      ? goodsImports.filter((item) => item.quarter === activeQuarterForGoods)
      : goodsImports;

    const startIndex = (goodsImportPage - 1) * goodsImportItemsPerPage;
    return filtered.slice(startIndex, startIndex + goodsImportItemsPerPage);
  }, [
    goodsImports,
    activeQuarterForGoods,
    goodsImportPage,
    goodsImportItemsPerPage,
  ]);

  // Update active quarter if quartersToDisplay changes
  useEffect(() => {
    if (
      quartersToDisplay.length > 0 &&
      !quartersToDisplay.includes(activeQuarter)
    ) {
      setActiveQuarter(quartersToDisplay[0]);
    }
  }, [quartersToDisplay, activeQuarter]);

  // Mock data for report status
  const getReportStatus = (quarter: string) => {
    // This is mock logic - in a real app, this would come from your database
    const quarterIndex = quartersToDisplay.indexOf(quarter);

    if (quarterIndex === 0) {
      return { status: "not_ready", label: "Not ready yet" };
    } else if (quarterIndex === 1) {
      return { status: "ready_for_creation", label: "Ready for creation" };
    } else {
      return { status: "created", label: "Created" };
    }
  };

  // Mock data for previous reports
  const previousReports = [
    {
      id: "1",
      quarter: "Q3-2023",
      creationDate: "2023-10-15",
      totalEmissions: 12500,
      suppliers: 24,
      goods: 156,
      realDataCoverage: 65,
      coverage: 85,
    },
    {
      id: "2",
      quarter: "Q2-2023",
      creationDate: "2023-07-10",
      totalEmissions: 11200,
      suppliers: 22,
      goods: 142,
      realDataCoverage: 60,
      coverage: 80,
    },
    {
      id: "3",
      quarter: "Q1-2023",
      creationDate: "2023-04-05",
      totalEmissions: 10800,
      suppliers: 20,
      goods: 128,
      realDataCoverage: 55,
      coverage: 75,
    },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handlePreviewReport = () => {
    setIsPreviewOpen(true);
  };

  // Function to render the status icon
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "created":
        return <Check className="h-4 w-4 mr-2 text-green-600" />;
      case "ready_for_creation":
        return <Clock className="h-4 w-4 mr-2 text-amber-500" />;
      case "not_ready":
        return <Clock className="h-4 w-4 mr-2 text-gray-400" />;
      default:
        return null;
    }
  };

  // Get filtered goods imports for the active quarter
  const filteredGoodsImports = useMemo(() => {
    return goodsImports.filter((item) => item.quarter === activeQuarter);
  }, [goodsImports, activeQuarter]);

  // Calculate metrics for the active quarter
  const quarterMetrics = useMemo(() => {
    // Calculate total emissions
    const totalEmissions = filteredGoodsImports.reduce((sum, item) => {
      const emissionFactor = (item.seeDirect || 0) + (item.seeIndirect || 0);
      return sum + emissionFactor * (item.quantity || 0);
    }, 0);

    // Get unique suppliers
    const uniqueSuppliers = new Set(
      filteredGoodsImports.map((item) => item.manufacturer)
    );
    const uniqueSuppliersArray = Array.from(uniqueSuppliers);

    // Calculate coverage metrics
    const suppliersWithEmissionData = suppliers.filter(
      (s) =>
        s.status === SupplierStatus.EmissionDataReceived &&
        uniqueSuppliersArray.includes(s.name)
    ).length;

    const suppliersWithSupportingDocs = suppliers.filter(
      (s) =>
        s.status === SupplierStatus.SupportingDocumentsReceived &&
        uniqueSuppliersArray.includes(s.name)
    ).length;

    const realDataCoverage =
      uniqueSuppliersArray.length > 0
        ? Math.round(
            (suppliersWithEmissionData / uniqueSuppliersArray.length) * 100
          )
        : 0;

    const coverage =
      uniqueSuppliersArray.length > 0
        ? Math.round(
            ((suppliersWithEmissionData + suppliersWithSupportingDocs) /
              uniqueSuppliersArray.length) *
              100
          )
        : 0;

    return {
      totalEmissions,
      supplierCount: uniqueSuppliersArray.length,
      goodsCount: filteredGoodsImports.length,
      realDataCoverage,
      coverage,
    };
  }, [filteredGoodsImports, suppliers]);

  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="mt-8 mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-semibold">CBAM Reports</CardTitle>
        </CardHeader>
        <CardContent className="border-t pt-6">
          {/* Report History Section - change background to transparent */}
          <div className="mb-8 bg-transparent p-6 rounded-lg border shadow-sm">
            <div className="mb-4">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-gray-700" />
                <h3 className="text-lg font-medium text-gray-800">
                  Report Creation History
                </h3>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead>Total Emissions</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead>Goods</TableHead>
                  <TableHead>Real Data Coverage</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.quarter}
                    </TableCell>
                    <TableCell>{report.creationDate}</TableCell>
                    <TableCell>
                      {report.totalEmissions.toLocaleString()} t CO₂
                    </TableCell>
                    <TableCell>{report.suppliers}</TableCell>
                    <TableCell>{report.goods}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${report.realDataCoverage}%` }}
                          ></div>
                        </div>
                        <span>{report.realDataCoverage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${report.coverage}%` }}
                          ></div>
                        </div>
                        <span>{report.coverage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {previousReports.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-4 text-gray-500"
                    >
                      No reports have been generated yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Goods Imports Section - change background to transparent */}
          <div className="bg-transparent p-6 rounded-lg border shadow-sm">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  Goods Imports
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <AnimatedSparkles className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </div>

            <GoodsTable
              goodsImports={paginatedGoodsImports}
              selectedGoodsEntries={selectedGoodsEntries}
              onEditGoodsEntry={handleEditGoodsEntry}
              onDeleteGoodsEntry={handleDeleteGoodsEntry}
              onSelectGoodsEntry={handleSelectGoodsEntry}
              onSelectAllGoodsEntries={handleSelectAllGoodsEntries}
              availableQuarters={availableQuarters}
              activeQuarter={activeQuarterForGoods}
              onQuarterFilterChange={handleQuarterFilterChange}
            />

            <div className="mt-4">
              <Pagination
                currentPage={goodsImportPage}
                totalPages={Math.ceil(
                  filteredGoodsImports.length / goodsImportItemsPerPage
                )}
                totalItems={filteredGoodsImports.length}
                itemsPerPage={goodsImportItemsPerPage}
                onPageChange={setGoodsImportPage}
                onItemsPerPageChange={setGoodsImportItemsPerPage}
              />
            </div>
            <div className="mt-4 flex justify-end">
              {selectedGoodsEntries.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelectedGoodsEntries}
                >
                  Delete Selected ({selectedGoodsEntries.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>CBAM Report Preview - {activeQuarter}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-4">
            <Tabs defaultValue="company">
              <TabsList className="mb-4">
                <TabsTrigger value="company">Company Data</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                <TabsTrigger value="goods">Goods Entries</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">ACME Corporation</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EORI Number</p>
                      <p className="font-medium">EU123456789</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reporting Period</p>
                      <p className="font-medium">{activeQuarter}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Report Generation Date
                      </p>
                      <p className="font-medium">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">Total Emissions</p>
                      <p className="text-xl font-bold">
                        {(
                          quarterMetrics.totalEmissions / 1000
                        ).toLocaleString()}{" "}
                        t CO₂
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">Total Suppliers</p>
                      <p className="text-xl font-bold">
                        {quarterMetrics.supplierCount}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">Total Goods</p>
                      <p className="text-xl font-bold">
                        {quarterMetrics.goodsCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Coverage Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">
                        Real Data Coverage
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="w-full h-3 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-3 bg-green-500 rounded-full"
                            style={{
                              width: `${quarterMetrics.realDataCoverage}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold min-w-[3rem] text-right">
                          {quarterMetrics.realDataCoverage}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">Total Coverage</p>
                      <div className="flex items-center mt-2">
                        <div className="w-full h-3 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-3 bg-blue-500 rounded-full"
                            style={{ width: `${quarterMetrics.coverage}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold min-w-[3rem] text-right">
                          {quarterMetrics.coverage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="suppliers">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Emissions Data</TableHead>
                      <TableHead>Goods Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers
                      .filter((s) =>
                        filteredGoodsImports.some(
                          (g) => g.manufacturer === s.name
                        )
                      )
                      .map((supplier, index) => (
                        <TableRow key={supplier.id || index}>
                          <TableCell className="font-medium">
                            {supplier.name}
                          </TableCell>
                          <TableCell>
                            {supplier.address?.country || "Unknown"}
                          </TableCell>
                          <TableCell>{supplier.status || "Unknown"}</TableCell>
                          <TableCell>
                            {supplier.status ===
                            SupplierStatus.EmissionDataReceived
                              ? "Yes"
                              : "No"}
                          </TableCell>
                          <TableCell>
                            {
                              filteredGoodsImports.filter(
                                (g) => g.manufacturer === supplier.name
                              ).length
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    {suppliers.filter((s) =>
                      filteredGoodsImports.some(
                        (g) => g.manufacturer === s.name
                      )
                    ).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 text-gray-500"
                        >
                          No supplier data available for this quarter
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="goods">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CN Code</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Direct Emissions</TableHead>
                      <TableHead>Indirect Emissions</TableHead>
                      <TableHead>Total Emissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGoodsImports.map((good, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {good.cnCode}
                        </TableCell>
                        <TableCell>{good.manufacturer}</TableCell>
                        <TableCell>
                          {good.quantity} {good.unit}
                        </TableCell>
                        <TableCell>{good.seeDirect} kg CO₂/t</TableCell>
                        <TableCell>{good.seeIndirect} kg CO₂/t</TableCell>
                        <TableCell>
                          {(
                            ((good.seeDirect + good.seeIndirect) *
                              good.quantity) /
                            1000
                          ).toFixed(2)}{" "}
                          t CO₂
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredGoodsImports.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-4 text-gray-500"
                        >
                          No goods data available for this quarter
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
