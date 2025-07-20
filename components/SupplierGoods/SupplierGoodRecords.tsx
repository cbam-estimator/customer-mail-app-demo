"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationControls } from "@/components/Pagination";
import type { Supplier, FilterState } from "@/types/supplier";
import type { GoodsImportRow } from "@/types/excel";
import { SupplierTable } from "./Suppliers/SupplierTable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedSparkles } from "@/components/AnimatedSparkles";
import { Mail, Plus, Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SupplierStatus } from "@/types/supplier";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { utils, write } from "xlsx";
import { toast } from "@/components/ui/use-toast";
import { ImportDataModal } from "@/components/ImportDataModal";
import { addYears } from "date-fns";
import { db } from "@/lib/db/config";
import {
  suppliers as suppliersTable,
  cnCodes as cnCodesTable,
  persons as personsTable,
} from "@/lib/db/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SupplierGoodRecordsProps {
  suppliers: Supplier[];
  goodsImports: GoodsImportRow[];
  selectedSuppliers: number[];
  selectedGoodsEntries: number[];
  isAdmin: boolean;
  countryFilter: FilterState;
  statusFilter: FilterState;
  goodsImportFilter: FilterState;
  sortConfig: { key: keyof Supplier | null; direction: "asc" | "desc" };
  onAddSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onRemoveSuppliers: () => void;
  onSendMail: () => void;
  onSelectSupplier: (id: number, checked: boolean) => void;
  onSelectAllSuppliers: (checked: boolean) => void;
  onFilterChange: (
    filterType: "country" | "status" | "supplier",
    key: string,
    value: boolean
  ) => void;
  onSort: (key: keyof Supplier) => void;
  onFileIconClick: (supplier: Supplier) => void;
  onEditGoodsEntry: (entry: GoodsImportRow) => void;
  onDeleteGoodsEntry: (index: number) => void;
  onSelectGoodsEntry: (index: number, checked: boolean) => void;
  onSelectAllGoodsEntries: (checked: boolean) => void;
  onGoodsImportFilterChange: (key: string, value: boolean) => void;
  onAddGoodsEntry: () => void;
  onDeleteSelectedGoodsEntries: () => void;
  onUpdateSupplier: (updatedSupplier: Supplier) => void;
  // Add new props for import functionality
  importedFiles: any[];
  onImport: (data: {
    suppliers: any[];
    goodsImports: any[];
    period: string;
  }) => void;
  onDownloadImport: (fileId: string) => void;
  onUndoImport: (fileId: string) => void;
  onSelectImport: (fileId: string, selected: boolean) => void;
  // Optional function to update suppliers in parent component
  onSuppliersUpdated?: (suppliers: Supplier[]) => void;
}

export function SupplierGoodRecords({
  suppliers,
  goodsImports,
  selectedSuppliers,
  selectedGoodsEntries,
  isAdmin,
  countryFilter,
  statusFilter,
  goodsImportFilter,
  sortConfig,
  onAddSupplier,
  onEditSupplier,
  onRemoveSuppliers,
  onSendMail,
  onSelectSupplier,
  onSelectAllSuppliers,
  onFilterChange,
  onSort,
  onFileIconClick,
  onEditGoodsEntry,
  onDeleteGoodsEntry,
  onSelectGoodsEntry,
  onSelectAllGoodsEntries,
  onGoodsImportFilterChange,
  onAddGoodsEntry,
  onDeleteSelectedGoodsEntries,
  onUpdateSupplier,
  // New props
  importedFiles,
  onImport,
  onDownloadImport,
  onUndoImport,
  onSelectImport,
  onSuppliersUpdated,
}: SupplierGoodRecordsProps) {
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierItemsPerPage, setSupplierItemsPerPage] = useState(10);
  const [goodsImportPage, setGoodsImportPage] = useState(1);
  const [goodsImportItemsPerPage, setGoodsImportItemsPerPage] = useState(10);
  const [activeQuarter, setActiveQuarter] = useState<string | null>(null);
  // Add state for import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalType, setImportModalType] = useState<"suppliers" | "goods">(
    "suppliers"
  );
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>(suppliers);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [
    ,/*autoRefresh*/
    /*setAutoRefresh*/
  ] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [openFilter, setOpenFilter] = useState<
    "country" | "status" | "quarter" | null
  >(null);
  const exportStatus = SupplierStatus.EmissionDataReceived;
  const [includeExpiredData, setIncludeExpiredData] = useState(true);

  const countryFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const quarterFilterRef = useRef<HTMLDivElement>(null);

  // Helper function to convert Unix timestamp to Date object
  const unixTimestampToDate = (
    timestamp: number | null | undefined
  ): Date | null => {
    if (timestamp === null || timestamp === undefined) return null;
    // Check if the timestamp is in seconds (Unix timestamp) or milliseconds (JS timestamp)
    return new Date(timestamp * (timestamp > 10000000000 ? 1 : 1000));
  };

  const filteredSuppliers = useMemo(() => {
    if (
      selectedCountries.length === 0 &&
      selectedStatuses.length === 0 &&
      selectedQuarters.length === 0
    ) {
      return allSuppliers;
    }

    return allSuppliers.filter((supplier) => {
      const countryMatch =
        selectedCountries.length === 0 ||
        selectedCountries.includes(supplier.country);
      const statusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(supplier.status);

      // Quarter filtering - check if supplier has goods in any of the selected quarters
      const quarterMatch =
        selectedQuarters.length === 0 ||
        goodsImports.some((g) =>
          //g.supplierId === supplier.id && selectedQuarters.includes(g.quarter)
          selectedQuarters.includes(g.quarter)
        );

      return countryMatch && statusMatch && quarterMatch;
    });
  }, [
    allSuppliers,
    selectedCountries,
    selectedStatuses,
    selectedQuarters,
    goodsImports,
  ]);

  const sortedSuppliers = useMemo(() => {
    const sortableItems = [...filteredSuppliers];
    if (sortConfig?.key) {
      sortableItems.sort((a, b) => {
        // const aValue = a[sortConfig.key!];
        // const bValue = b[sortConfig.key!];
        const aValue = a[sortConfig.key!] ?? 0;
        const bValue = b[sortConfig.key!] ?? 0;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [filteredSuppliers, sortConfig]);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (supplierPage - 1) * supplierItemsPerPage;
    return sortedSuppliers.slice(startIndex, startIndex + supplierItemsPerPage);
  }, [sortedSuppliers, supplierPage, supplierItemsPerPage]);

  const availableQuarters = useMemo(() => {
    const quarters = new Set<string>();
    goodsImports.forEach((entry) => {
      if (entry.quarter) {
        quarters.add(entry.quarter);
      }
    });
    return Array.from(quarters).sort();
  }, [goodsImports]);

  const filteredGoodsImports = useMemo(() => {
    if (!activeQuarter) return goodsImports;
    return goodsImports.filter((entry) => entry.quarter === activeQuarter);
  }, [goodsImports, activeQuarter]);

  const paginatedGoodsImports = useMemo(() => {
    const startIndex = (goodsImportPage - 1) * goodsImportItemsPerPage;
    return filteredGoodsImports.slice(
      startIndex,
      startIndex + goodsImportItemsPerPage
    );
  }, [filteredGoodsImports, goodsImportPage, goodsImportItemsPerPage]);

  const handleQuarterFilterChange = (quarter: string) => {
    setActiveQuarter((prevQuarter) =>
      prevQuarter === quarter ? null : quarter
    );
    setGoodsImportPage(1); // Reset to first page when changing filter
  };

  // Function to open import modal
  const openImportModal = (type: "suppliers" | "goods") => {
    setImportModalType(type);
    setIsImportModalOpen(true);
  };

  // Get unique countries, statuses, and suppliers for filters
  const uniqueCountries = Array.from(
    new Set(allSuppliers.map((s) => s.country))
  );
  const uniqueStatuses = Object.values(SupplierStatus);
  const uniqueSuppliers = Array.from(new Set(allSuppliers.map((s) => s.name)));

  // Handle dropdown selection changes
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSupplierPage(1); // Reset to first page when changing filter
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setSupplierPage(1); // Reset to first page when changing filter
  };

  const handleSupplierChange = (value: string) => {
    setSelectedSupplier(value);
    setSupplierPage(1); // Reset to first page when changing filter
  };

  const handleQuarterChange = (value: string) => {
    setSelectedQuarter(value);
    setSupplierPage(1); // Reset to first page when changing filter
  };

  const handleRemoveCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== country));
    setSupplierPage(1);
  };

  const handleRemoveStatus = (status: string) => {
    setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    setSupplierPage(1);
  };

  const handleRemoveQuarter = (quarter: string) => {
    setSelectedQuarters(selectedQuarters.filter((q) => q !== quarter));
    setSupplierPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCountry("");
    setSelectedStatus("");
    setSelectedSupplier("");
    setSelectedQuarter("");
    setSelectedCountries([]);
    setSelectedStatuses([]);
    setSelectedQuarters([]);
    setSupplierPage(1);
  };

  // Function to fetch suppliers directly from the database
  const fetchSuppliersFromDatabase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch suppliers from the database
      const dbSuppliers = await db.select().from(suppliersTable);

      // Fetch all persons for contact information
      const persons = await db.select().from(personsTable);

      // Fetch CN codes for suppliers
      const allCnCodes = await db.select().from(cnCodesTable);

      // Transform database suppliers to match the frontend model
      const transformedSuppliers = dbSuppliers.map((supplier) => {
        // Find contact person
        const contactPerson =
          persons.find((p) => p.id === supplier.contact_person_id) || null;

        // Find CN codes for this supplier
        const supplierCnCodes = allCnCodes
          .filter((cc) => cc.supplierId === supplier.id)
          .map((cc) => cc.code);

        // Map status from database to enum
        let status = SupplierStatus.None;
        if (supplier.emission_data_status) {
          switch (supplier.emission_data_status) {
            case "emission_data_received":
              status = SupplierStatus.EmissionDataReceived;
              break;
            case "supporting_docs":
              status = SupplierStatus.SupportingDocumentsReceived;
              break;
            case "contact_failed":
              status = SupplierStatus.ContactFailed;
              break;
            case "pending_info":
              status = SupplierStatus.Pending;
              break;
            case "contacted":
              status = SupplierStatus.Contacted;
              break;
            case "consultation_requested":
              status = SupplierStatus.ConsultationRequested;
              break;
            default:
              status = SupplierStatus.None;
          }
        }

        // Convert Unix timestamp to Date object for lastUpdate
        const lastUpdateDate = unixTimestampToDate(
          supplier.last_update ? Number(supplier.last_update) : null
        );
        const lastUpdateIso = lastUpdateDate
          ? lastUpdateDate.toISOString()
          : new Date().toISOString();

        // Convert Unix timestamp to Date object for validUntil
        const validUntilDate = unixTimestampToDate(
          supplier.emission_data_valid_until
            ? Number(supplier.emission_data_valid_until)
            : null
        );
        const validUntilIso = validUntilDate
          ? validUntilDate.toISOString()
          : undefined;

        return {
          id: supplier.id,
          name: supplier.name || "Unnamed Supplier",
          country: supplier.country || "Unknown",
          address: {
            country: supplier.country || "Unknown",
            street: supplier.street || "",
            streetNumber: supplier.street_num || "",
            additionalLine: supplier.addr_additional_line || "",
            postcode: supplier.post_code || "",
            city: supplier.city || "",
          },
          contactPerson: {
            name: contactPerson?.name || "",
            email: contactPerson?.email || supplier.company_mail || "",
            phone: contactPerson?.phone || "",
          },
          cnCodes: supplierCnCodes,
          remarks: supplier.remarks || "",
          status: status,
          rawStatus: supplier.emission_data_status || "none",
          lastUpdate: lastUpdateIso,
          validUntil: validUntilIso,
          files: [], // Files are not in the database schema yet
          consultationHours: supplier.consulting_hours || 0,

          seeDirect: supplier.see_direct || 0,
          seeIndirect: supplier.see_indirect || 0,
          seeTotal: supplier.see_total || 0,
          emissionFactor: supplier.emission_factor || 0,
          electricityEmissions: supplier.electricity_emissions || 0,
        };
      });

      // Process suppliers to add validUntil dates if needed
      const processedSuppliers = transformedSuppliers.map((supplier) => {
        if (
          (supplier.status === SupplierStatus.EmissionDataReceived ||
            supplier.status === SupplierStatus.SupportingDocumentsReceived) &&
          !supplier.validUntil
        ) {
          const baseDate = supplier.lastUpdate
            ? new Date(supplier.lastUpdate)
            : new Date();
          const validUntil = addYears(baseDate, 1).toISOString(); // Valid for 1 year
          return { ...supplier, validUntil };
        }
        return supplier;
      });

      //setAllSuppliers(processedSuppliers);
      setLastRefreshed(new Date());

      // Notify parent component if callback exists
      if (onSuppliersUpdated) {
        //onSuppliersUpdated(processedSuppliers);
      }

      return processedSuppliers;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError(
        `Failed to fetch suppliers: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return []; // Return empty array instead of current suppliers
    } finally {
      setIsLoading(false);
    }
  }, [onSuppliersUpdated]); // Remove allSuppliers from dependencies

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchSuppliersFromDatabase();

    // Set up interval for auto-refresh
    // Commented out to disable auto-refresh
    /*
    const intervalId = setInterval(() => {
      fetchSuppliersFromDatabase()
    }, 30000) // Refresh every 30 seconds

    return () => {
      clearInterval(intervalId)
    }
    */
  }, [fetchSuppliersFromDatabase]);

  // Initial data load and processing
  useEffect(() => {
    // Only set initial suppliers from props once
    if (suppliers.length > 0 && allSuppliers.length === 0) {
      const updatedSuppliers = suppliers.map((supplier) => {
        // Only process suppliers with Emission Data or Supporting Docs status
        if (
          (supplier.status === SupplierStatus.EmissionDataReceived ||
            supplier.status === SupplierStatus.SupportingDocumentsReceived) &&
          !supplier.validUntil
        ) {
          // If no validUntil date exists, create one based on lastUpdate or current date
          const baseDate = supplier.lastUpdate
            ? new Date(supplier.lastUpdate)
            : new Date();
          const validUntil = addYears(baseDate, 1).toISOString(); // Valid for 1 year
          return { ...supplier, validUntil };
        }
        return supplier;
      });

      setAllSuppliers(updatedSuppliers);
    }

    // Only fetch from database on initial mount
    const initialFetch = async () => {
      await fetchSuppliersFromDatabase();
    };

    initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Handle supplier prop changes
  useEffect(() => {
    // Only update if suppliers prop changes and is different from current state
    if (
      suppliers.length > 0 &&
      JSON.stringify(suppliers) !== JSON.stringify(allSuppliers)
    ) {
      const updatedSuppliers = suppliers.map((supplier) => {
        // Only process suppliers with Emission Data or Supporting Docs status
        if (
          (supplier.status === SupplierStatus.EmissionDataReceived ||
            supplier.status === SupplierStatus.SupportingDocumentsReceived) &&
          !supplier.validUntil
        ) {
          // If no validUntil date exists, create one based on lastUpdate or current date
          const baseDate = supplier.lastUpdate
            ? new Date(supplier.lastUpdate)
            : new Date();
          const validUntil = addYears(baseDate, 1).toISOString(); // Valid for 1 year
          return { ...supplier, validUntil };
        }
        return supplier;
      });

      setAllSuppliers(updatedSuppliers);
    }
  }, [suppliers]);

  // Handle clicks outside the filter dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click was outside the open filter dropdown
      if (
        openFilter === "country" &&
        countryFilterRef.current &&
        !countryFilterRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
      if (
        openFilter === "status" &&
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
      if (
        openFilter === "quarter" &&
        quarterFilterRef.current &&
        !quarterFilterRef.current.contains(event.target as Node)
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

  // Generate export data with the specified columns
  const generateExportData = () => {
    // Get suppliers to export based on selected status and expired data option
    const suppliersToExport = getSuppliersToExport();

    // Map suppliers to the required export format
    return suppliersToExport.map((supplier) => {
      // Find related goods imports for this supplier
      const supplierGoods = goodsImports.filter(
        (g) => g.supplierId === supplier.id
      );

      // For each supplier, create an entry with the specified columns
      return {
        Supplier: supplier.name,
        "CN Code": supplierGoods.length > 0 ? supplierGoods[0].cnCode : "",
        // "Type of Determination": supplier.determinationType || "Default",
        "": "", // Empty column as specified
        "See Direct": supplier.see_direct || 0,
        "See Indirect": supplier.see_indirect || 0,
        "See Total":
          supplier.see_total ||
          (supplier.see_direct || 0) + (supplier.see_indirect || 0),
        "Emission Factor": supplier.emission_factor || 0,
        "Emissions from electricity usage": supplier.electricity_emissions || 0,
      };
    });
  };

  // Get suppliers to export based on selected status and expired data option
  const getSuppliersToExport = () => {
    let filteredSuppliers = allSuppliers.filter(
      (supplier) => supplier.status === exportStatus
    );

    // If not including expired data, filter out expired suppliers
    if (!includeExpiredData) {
      const now = new Date().toISOString();
      filteredSuppliers = filteredSuppliers.filter(
        (supplier) => !supplier.validUntil || supplier.validUntil > now
      );
    }

    return filteredSuppliers;
  };

  // Browser-compatible function to download data as a file
  const downloadFile = (data: Blob, filename: string) => {
    // Create a URL for the blob
    const url = URL.createObjectURL(data);

    // Create a link element
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up by revoking the object URL
    URL.revokeObjectURL(url);
  };

  // Handle export for both CSV and XLSX formats
  const handleExport = (format: "xlsx" | "csv") => {
    try {
      const exportData = generateExportData();

      if (exportData.length === 0) {
        toast({
          title: "No data to export",
          description: `No suppliers found with status: ${SupplierStatus.EmissionDataReceived}`,
          variant: "destructive",
        });
        return;
      }

      // Create a worksheet from the export data
      const worksheet = utils.json_to_sheet(exportData);

      // Create a workbook with the worksheet
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Suppliers");

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0];
      const filename = `supplier-export-${date}.${format}`;

      // Convert workbook to a binary string
      const wbout = write(workbook, { bookType: format, type: "binary" });

      // Convert binary string to ArrayBuffer
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xff;
      }

      // Create Blob and download
      const blob = new Blob([buf], {
        type:
          format === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv;charset=utf-8;",
      });

      downloadFile(blob, filename);

      toast({
        title: "Export successful",
        description: `${exportData.length} suppliers exported to ${filename}`,
        variant: "default",
      });

      // Close the modal after export
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while generating the export file",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <Card>
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
          <div className="flex flex-col">
            <CardTitle className="text-xl font-semibold my-0">
              Suppliers
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onAddSupplier}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
            <Button
              variant="outline"
              onClick={() => openImportModal("suppliers")}
              className="flex items-center gap-2"
            >
              <AnimatedSparkles className="h-4 w-4" />
              Import Data
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="border-t px-0 py-0">
          <div className="border-b bg-neutral-50">
            <div className="px-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="text-sm text-gray-600">
                  <span>Select options to filter the supplier list:</span>
                </div>

                {/* Selected filter tags */}
                {(selectedCountries.length > 0 ||
                  selectedStatuses.length > 0 ||
                  selectedQuarters.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCountries.map((country) => (
                      <div
                        key={`tag-country-${country}`}
                        className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded"
                      >
                        Country: {country}
                        <button
                          onClick={() => handleRemoveCountry(country)}
                          className="ml-1.5 text-blue-700 hover:text-blue-900"
                          aria-label={`Remove ${country} filter`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {selectedStatuses.map((status) => (
                      <div
                        key={`tag-status-${status}`}
                        className="flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded"
                      >
                        Status: {status}
                        <button
                          onClick={() => handleRemoveStatus(status)}
                          className="ml-1.5 text-purple-700 hover:text-purple-900"
                          aria-label={`Remove ${status} filter`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {selectedQuarters.map((quarter) => (
                      <div
                        key={`tag-quarter-${quarter}`}
                        className="flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded"
                      >
                        Quarter: {quarter}
                        <button
                          onClick={() => handleRemoveQuarter(quarter)}
                          className="ml-1.5 text-green-700 hover:text-green-900"
                          aria-label={`Remove ${quarter} filter`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {(selectedCountries.length > 0 ||
                      selectedStatuses.length > 0 ||
                      selectedQuarters.length > 0) && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded hover:bg-gray-200"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Country filter */}
                  <div className="relative" ref={countryFilterRef}>
                    <button
                      onClick={() =>
                        setOpenFilter(
                          openFilter === "country" ? null : "country"
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
                        {openFilter === "country" ? "▲" : "▼"}
                      </span>
                    </button>

                    {openFilter === "country" && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2">
                          <div className="mb-2 border-b pb-1">
                            <Checkbox
                              id="select-all-countries"
                              checked={
                                selectedCountries.length ===
                                uniqueCountries.length
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCountries(uniqueCountries);
                                } else {
                                  setSelectedCountries([]);
                                }
                                setSupplierPage(1);
                              }}
                            />
                            <label
                              htmlFor="select-all-countries"
                              className="ml-2 text-sm font-medium"
                            >
                              Select All
                            </label>
                          </div>

                          {uniqueCountries.map((country) => {
                            const count = allSuppliers.filter(
                              (s) => s.country === country
                            ).length;
                            return (
                              <div
                                key={`country-${country}`}
                                className="flex items-center mb-1"
                              >
                                <Checkbox
                                  id={`country-${country}`}
                                  checked={selectedCountries.includes(country)}
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
                                    setSupplierPage(1);
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

                  {/* Status filter */}
                  <div className="relative" ref={statusFilterRef}>
                    <button
                      onClick={() =>
                        setOpenFilter(openFilter === "status" ? null : "status")
                      }
                      className="w-full flex items-center justify-between bg-white border rounded px-3 py-2 text-sm"
                    >
                      <span>
                        Statuses{" "}
                        {selectedStatuses.length > 0 &&
                          `(${selectedStatuses.length})`}
                      </span>
                      <span className="text-gray-500">
                        {openFilter === "status" ? "▲" : "▼"}
                      </span>
                    </button>

                    {openFilter === "status" && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2">
                          <div className="mb-2 border-b pb-1">
                            <Checkbox
                              id="select-all-statuses"
                              checked={
                                selectedStatuses.length ===
                                uniqueStatuses.length
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStatuses(uniqueStatuses);
                                } else {
                                  setSelectedStatuses([]);
                                }
                                setSupplierPage(1);
                              }}
                            />
                            <label
                              htmlFor="select-all-statuses"
                              className="ml-2 text-sm font-medium"
                            >
                              Select All
                            </label>
                          </div>

                          {uniqueStatuses.map((status) => {
                            const count = allSuppliers.filter(
                              (s) => s.status === status
                            ).length;
                            return (
                              <div
                                key={`status-${status}`}
                                className="flex items-center mb-1"
                              >
                                <Checkbox
                                  id={`status-${status}`}
                                  checked={selectedStatuses.includes(status)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedStatuses([
                                        ...selectedStatuses,
                                        status,
                                      ]);
                                    } else {
                                      setSelectedStatuses(
                                        selectedStatuses.filter(
                                          (s) => s !== status
                                        )
                                      );
                                    }
                                    setSupplierPage(1);
                                  }}
                                />
                                <label
                                  htmlFor={`status-${status}`}
                                  className="ml-2 text-sm"
                                >
                                  {status} ({count})
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quarter filter */}
                  <div className="relative" ref={quarterFilterRef}>
                    <button
                      onClick={() =>
                        setOpenFilter(
                          openFilter === "quarter" ? null : "quarter"
                        )
                      }
                      className="w-full flex items-center justify-between bg-white border rounded px-3 py-2 text-sm"
                    >
                      <span>
                        Quarters{" "}
                        {selectedQuarters.length > 0 &&
                          `(${selectedQuarters.length})`}
                      </span>
                      <span className="text-gray-500">
                        {openFilter === "quarter" ? "▲" : "▼"}
                      </span>
                    </button>

                    {openFilter === "quarter" && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2">
                          <div className="mb-2 border-b pb-1">
                            <Checkbox
                              id="select-all-quarters"
                              checked={
                                selectedQuarters.length ===
                                availableQuarters.length
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedQuarters(availableQuarters);
                                } else {
                                  setSelectedQuarters([]);
                                }
                                setSupplierPage(1);
                              }}
                            />
                            <label
                              htmlFor="select-all-quarters"
                              className="ml-2 text-sm font-medium"
                            >
                              Select All
                            </label>
                          </div>

                          {availableQuarters.map((quarter) => {
                            // Count suppliers that have goods in this quarter
                            const suppliersInQuarter = new Set(
                              goodsImports
                                .filter((g) => g.quarter === quarter)
                                .map((g) => g.supplierId)
                            );
                            const count = suppliersInQuarter.size;

                            return (
                              <div
                                key={`quarter-${quarter}`}
                                className="flex items-center mb-1"
                              >
                                <Checkbox
                                  id={`quarter-${quarter}`}
                                  checked={selectedQuarters.includes(quarter)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedQuarters([
                                        ...selectedQuarters,
                                        quarter,
                                      ]);
                                    } else {
                                      setSelectedQuarters(
                                        selectedQuarters.filter(
                                          (q) => q !== quarter
                                        )
                                      );
                                    }
                                    setSupplierPage(1);
                                  }}
                                />
                                <label
                                  htmlFor={`quarter-${quarter}`}
                                  className="ml-2 text-sm"
                                >
                                  {quarter} ({count})
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SupplierTable
            suppliers={paginatedSuppliers}
            selectedSuppliers={selectedSuppliers}
            sortConfig={sortConfig}
            onSelectSupplier={onSelectSupplier}
            onSelectAllSuppliers={onSelectAllSuppliers}
            onSort={onSort}
            onEditSupplier={onEditSupplier}
            onFileIconClick={onFileIconClick}
            isAdmin={isAdmin}
            countryFilter={countryFilter}
            statusFilter={statusFilter}
            onFilterChange={onFilterChange}
            onUpdateSupplier={onUpdateSupplier}
            goodsImports={goodsImports}
            continuousIndexing={true} // Always enable continuous indexing
            currentPage={supplierPage} // Pass the current page
            itemsPerPage={supplierItemsPerPage} // Pass items per page
          />
        </CardContent>
        <CardFooter className="grid grid-cols-3 border-t py-4">
          <div className="flex items-center col-start-1">
            {selectedSuppliers.length > 0 && (
              <Button
                variant="destructive"
                onClick={onRemoveSuppliers}
                className="mr-2"
              >
                Remove Selected
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onSendMail}
              disabled={selectedSuppliers.length === 0}
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact {selectedSuppliers.length} Supplier
              {selectedSuppliers.length !== 1 ? "s" : ""}
            </Button>
          </div>
          <div className="flex justify-center col-start-2">
            <PaginationControls
              currentPage={supplierPage}
              totalPages={Math.ceil(
                sortedSuppliers.length / supplierItemsPerPage
              )}
              onPageChange={setSupplierPage}
            />
          </div>
          <div className="flex justify-end col-start-3">
            <Pagination
              currentPage={supplierPage}
              totalPages={Math.ceil(
                sortedSuppliers.length / supplierItemsPerPage
              )}
              totalItems={sortedSuppliers.length}
              itemsPerPage={supplierItemsPerPage}
              onPageChange={setSupplierPage}
              onItemsPerPageChange={setSupplierItemsPerPage}
            />
          </div>
        </CardFooter>
      </Card>
      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0">
          <div className="flex flex-row items-center justify-between space-y-0 py-4 px-6 border-b">
            <DialogTitle className="text-xl font-semibold my-0">
              Export Supplier Data
            </DialogTitle>
          </div>

          <div className="px-6 py-4">
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-4">
                Export suppliers with Emissions Data Received status
              </h4>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                <p>
                  This will export all suppliers with the status{" "}
                  <strong>Emissions Data Received</strong>. Currently there are{" "}
                  <strong>
                    {
                      allSuppliers.filter(
                        (s) => s.status === SupplierStatus.EmissionDataReceived
                      ).length
                    }
                  </strong>{" "}
                  suppliers with this status.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium mb-1">Include expired data</h5>
                  <p className="text-sm text-gray-600">
                    Use latest available data, even when expired
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                  <input
                    type="checkbox"
                    id="include-expired-toggle"
                    className="absolute w-0 h-0 opacity-0"
                    checked={includeExpiredData}
                    onChange={(e) => setIncludeExpiredData(e.target.checked)}
                  />
                  <label
                    htmlFor="include-expired-toggle"
                    className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      includeExpiredData ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        includeExpiredData ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={getSuppliersToExport().length === 0}
            >
              Export as CSV
            </Button>
            <Button
              onClick={() => handleExport("xlsx")}
              disabled={getSuppliersToExport().length === 0}
            >
              Export as Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportDataModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          importedFiles={importedFiles}
          onImport={onImport}
          onDownload={onDownloadImport}
          onUndo={onUndoImport}
          onSelect={onSelectImport}
        />
      )}
    </TooltipProvider>
  );
}
