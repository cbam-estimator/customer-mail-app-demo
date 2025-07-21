"use client";

import type React from "react";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThreeWayCheckbox } from "@/components/ui/three-way-checkbox";
import { type Supplier, SupplierStatus } from "@/types/supplier";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  FileIcon,
  Handshake,
  MessageCircle,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  HelpCircle,
  XCircle,
  Mail,
  FileText,
  CheckCircle2,
  Paperclip,
  Download,
  FileDown,
} from "lucide-react";
import { SupplierHistoryDialog } from "./SupplierHistoryDialog";
import {
  format,
  isAfter,
  isValid,
  subDays,
  subMonths,
  differenceInDays,
  addYears,
  subYears,
} from "date-fns";
import type { FilterState } from "@/types/filter";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { ConsultationDialog } from "./ConsultationDialog";
import type { GoodsImportRow } from "@/types/excel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const dateToQuarter = (date: Date): string => {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const year = date.getFullYear().toString().slice(-2);
  return `Q${quarter}-${year}`;
};

interface SupplierTableProps {
  suppliers: Supplier[];
  selectedSuppliers: number[];
  sortConfig: { key: keyof Supplier | null; direction: "asc" | "desc" };
  onSelectSupplier: (id: number, checked: boolean) => void;
  onSelectAllSuppliers: (checked: boolean) => void;
  onSort: (key: keyof Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onFileIconClick: (supplier: Supplier) => void;
  countryFilter: FilterState;
  statusFilter: FilterState;
  onFilterChange: (
    filterType: "country" | "status" | "supplier",
    key: string,
    value: boolean
  ) => void;
  onUpdateSupplier: (updatedSupplier: Supplier) => void;
  isAdmin: boolean;
  goodsImports?: GoodsImportRow[]; // Add goodsImports prop
  isFilterOpen?: boolean; // Add this line to receive filter state from parent
  filterContent?: React.ReactNode; // Add this prop to receive filter content from parent
  currentPage?: number; // Add pagination props
  itemsPerPage?: number; // Add pagination props
  continuousIndexing?: boolean; // Add continuous indexing prop
}

export function SupplierTable({
  suppliers,
  selectedSuppliers,
  sortConfig,
  onSelectSupplier,
  onSelectAllSuppliers,
  onSort,
  onEditSupplier,
  onFileIconClick,
  countryFilter,
  statusFilter,
  onFilterChange,
  onUpdateSupplier,
  isAdmin,
  goodsImports = [], // Default to empty array
  isFilterOpen,
  filterContent,
  currentPage = 1, // Default to page 1
  itemsPerPage = 10, // Default to 10 items per page
  continuousIndexing = false, // Default to false for backward compatibility
}: SupplierTableProps) {
  console.log(
    `SupplierTable: continuousIndexing=${continuousIndexing}, currentPage=${currentPage}, itemsPerPage=${itemsPerPage}`
  );
  const [openHistoryDialog, setOpenHistoryDialog] = useState<number | null>(
    null
  );
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [selectedSupplierForConsultation, setSelectedSupplierForConsultation] =
    useState<Supplier | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{
    title: string;
    content: string;
    date?: string;
    sender?: string;
    attachments?: string[];
  } | null>(null);
  const [selectedCnCodes, setSelectedCnCodes] = useState<
    Record<number, string>
  >({});
  const [emissionFactors, setEmissionFactors] = useState<
    Record<number, string>
  >({});
  const [electricityUsages, setElectricityUsages] = useState<
    Record<number, string>
  >({});

  const allSuppliers = suppliers; // Store the full list of suppliers
  const uniqueCountries = Array.from(
    new Set(allSuppliers.map((s) => s.country))
  );
  const uniqueStatuses = Object.values(SupplierStatus);
  const uniqueSuppliers = Array.from(new Set(allSuppliers.map((s) => s.name)));

  // Calculate the starting index for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;

  const getCountryCode = (country: string): string => {
    const codes: { [key: string]: string } = {
      "United States": "US",
      Germany: "DE",
      China: "CN",
      Turkey: "TR",
      // Add more countries as needed
    };
    return codes[country] || country.slice(0, 2).toUpperCase();
  };

  const getDaysAgo = (date: string) => {
    if (!date || !isValid(new Date(date))) return "N/A";

    const days = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 3600 * 24)
    );
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getDaysAgoColor = (date: string) => {
    if (!date || !isValid(new Date(date))) return "text-gray-400";

    const days = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 3600 * 24)
    );
    if (days > 365) return "text-red-500";
    if (days > 300) return "text-orange-500";
    return "text-gray-500";
  };

  const toggleRowExpansion = (supplierId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(supplierId)) {
        newSet.delete(supplierId);
      } else {
        newSet.add(supplierId);
        // Auto-select the first CN code when expanding
        if (!selectedCnCodes[supplierId]) {
          const cnCodes = getSupplierCnCodes(supplierId);
          if (cnCodes.length > 0) {
            handleCnCodeSelect(supplierId, cnCodes[0]);
          }
        }
      }
      return newSet;
    });
  };

  // Function to get goods imports for a specific supplier
  const getSupplierGoods = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return [];

    return goodsImports.filter((g) => g.manufacturer === supplier.name);
  };

  // Add this function to get unique CN codes for a supplier
  const getSupplierCnCodes = (supplierId: number) => {
    const goods = getSupplierGoods(supplierId);
    const uniqueCnCodes = Array.from(
      new Set(goods.map((g) => g.cnCode || "Unknown"))
    );
    return uniqueCnCodes.sort();
  };

  // Add this function to get SEE values for a specific CN code
  const getEmissionsForCnCode = (supplierId: number, cnCode: string) => {
    const goods = getSupplierGoods(supplierId).filter(
      (g) => g.cnCode === cnCode
    );

    if (goods.length === 0) return { direct: 0, indirect: 0, total: 0 };

    // Calculate average direct SEE values (weighted by quantity)
    const totalQuantity = goods.reduce((sum, g) => sum + g.quantity, 0);
    const directSEE =
      goods.reduce((sum, g) => sum + (g.seeDirect || 0) * g.quantity, 0) /
      totalQuantity;

    // Calculate indirect SEE using the formula: Emission Factor × Electricity Usage
    const emissionFactor = Number.parseFloat(getEmissionFactor(supplierId));
    const electricityUsage = Number.parseFloat(getElectricityUsage(supplierId));
    const indirectSEE = emissionFactor * electricityUsage;

    return {
      direct: directSEE,
      indirect: indirectSEE,
      total: directSEE + indirectSEE,
    };
  };

  // Add this function to handle CN code selection
  const handleCnCodeSelect = (supplierId: number, cnCode: string) => {
    setSelectedCnCodes((prev) => ({
      ...prev,
      [supplierId]: cnCode,
    }));
  };

  // Function to calculate total emissions for a supplier
  const calculateTotalEmissions = (supplierId: number) => {
    const goods = getSupplierGoods(supplierId);
    return goods.reduce((total, good) => {
      const emissionFactor = (good.seeDirect || 0) + (good.seeIndirect || 0);
      return total + emissionFactor * good.quantity;
    }, 0);
  };

  // Function to calculate direct emissions for a supplier
  const calculateDirectEmissions = (supplierId: number) => {
    const goods = getSupplierGoods(supplierId);
    return goods.reduce(
      (total, good) => total + (good.seeDirect || 0) * good.quantity,
      0
    );
  };

  // Function to calculate indirect emissions for a supplier
  const calculateIndirectEmissions = (supplierId: number) => {
    const goods = getSupplierGoods(supplierId);
    return goods.reduce(
      (total, good) => total + (good.seeIndirect || 0) * good.quantity,
      0
    );
  };

  // Convert kg to metric tons
  const kgToTons = (kg: number) => {
    return (kg / 1000).toFixed(2);
  };

  // Function to get production method for a supplier
  const getProductionMethod = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    // Return the production method directly from the supplier object
    return supplier?.productionMethodCode || "---";
  };

  // Function to get or generate emission factor
  const getEmissionFactor = (supplierId: number) => {
    // Use a memoization approach to keep values static
    if (!emissionFactors[supplierId]) {
      // Generate a random value between 1.0 and 3.5
      emissionFactors[supplierId] = (Math.random() * 2.5 + 1.0).toFixed(2);
    }
    return emissionFactors[supplierId];
  };

  // Function to get or generate electricity usage
  const getElectricityUsage = (supplierId: number) => {
    // Use a memoization approach to keep values static
    if (!electricityUsages[supplierId]) {
      // Generate a random value between 1.0 and 3.5
      electricityUsages[supplierId] = (Math.random() * 2.5 + 1.0).toFixed(2);
    }
    return electricityUsages[supplierId];
  };

  // Function to group goods by CN code and quarter
  const groupGoodsByCnCodeAndQuarter = (supplierId: number) => {
    const goods = getSupplierGoods(supplierId);
    const groupedGoods: Record<
      string,
      Record<string, { quantity: number; emissions: number }>
    > = {};

    // Get all unique quarters
    const quarters = Array.from(
      new Set(goods.map((g) => g.quarter || "Unknown"))
    ).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return a.localeCompare(b);
    });

    // Initialize the structure
    goods.forEach((good) => {
      const cnCode = good.cnCode || "Unknown";
      if (!groupedGoods[cnCode]) {
        groupedGoods[cnCode] = {};
        quarters.forEach((q) => {
          groupedGoods[cnCode][q] = { quantity: 0, emissions: 0 };
        });
      }
    });

    // Fill in the data
    goods.forEach((good) => {
      const cnCode = good.cnCode || "Unknown";
      const quarter = good.quarter || "Unknown";
      const emissionFactor = (good.seeDirect || 0) + (good.seeIndirect || 0);
      const emissions = emissionFactor * good.quantity;

      groupedGoods[cnCode][quarter].quantity += good.quantity;
      groupedGoods[cnCode][quarter].emissions += emissions;
    });

    return { groupedGoods, quarters };
  };

  // Generate sample history if needed
  const getSupplierHistory = (supplier: Supplier) => {
    if (supplier.history && supplier.history.length > 0) {
      return supplier.history;
    }

    const now = new Date();
    const history = [];

    // Generate history based on supplier status
    if (supplier.status === SupplierStatus.EmissionDataReceived) {
      const emissionDataDate = now;
      const nextReportingDate = addYears(emissionDataDate, 1);
      const daysUntilNextReporting = differenceInDays(nextReportingDate, now);

      history.push(
        {
          type: "document_update" as const,
          date: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Emission Data is valid and complete",
          title: "Emission Data Validated",
          icon: "report_success",
          color: "green",
          nextReportingDays: daysUntilNextReporting,
        },
        {
          type: "response_received" as const,
          date: format(subDays(now, 3), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Response received with 2 attachments:",
          title: "Response Received",
          icon: "mail_in",
          color: "blue",
          messageContent:
            "Dear Team,\n\nPlease find attached our emission data as requested. We have compiled the information according to your specifications.\n\nBest regards,\nSupplier Team",
          sender: "supplier@example.com",
          attachments: ["emission_data.xlsx", "communication_template.xlsx"],
        },
        {
          type: "email_sent" as const,
          date: format(subDays(now, 10), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "No Response after 14 days -> Follow up mail was sent",
          title: "Follow Up Mail #1",
          icon: "mail_out",
          color: "blue",
          messageContent:
            "Dear Supplier,\n\nWe are following up on our previous request for emission data. Please let us know if you need any assistance with providing this information.\n\nBest regards,\nCBAM Team",
          sender: "cbam-team@example.com",
          attachments: ["communication_template.xlsx"],
        },
        {
          type: "email_sent" as const,
          date: format(subMonths(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Supplier was contacted",
          title: "Contacted for Emission Data",
          icon: "mail_out",
          color: "blue",
          messageContent:
            "Dear Supplier,\n\nAs part of our CBAM compliance efforts, we need to collect emission data for all imported goods. Please provide this information at your earliest convenience.\n\nBest regards,\nCBAM Team",
          sender: "cbam-team@example.com",
          attachments: ["communication_template.xlsx"],
        },
        {
          type: "status_change" as const,
          date: format(subMonths(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
          description: `${supplier.name} was created.`,
          title: "Supplier Created in System",
          icon: "created",
          color: "gray",
        }
      );
    }
    // Supporting Documents Received status
    else if (supplier.status === SupplierStatus.SupportingDocumentsReceived) {
      history.push(
        {
          type: "document_update" as const,
          date: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Supporting documents received and validated",
          title: "Supporting Documents Validated",
          icon: "report_success",
          color: "green",
        },
        {
          type: "response_received" as const,
          date: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Supporting documents received with 3 attachments:",
          title: "Supporting Documents Received",
          icon: "mail_in",
          color: "blue",
          messageContent:
            "Dear Team,\n\nAs requested, please find attached the supporting documents for our products. These include our production methodology, certification documents, and energy consumption reports.\n\nBest regards,\nSupplier Team",
          sender: "supplier@example.com",
          attachments: [
            "production_methodology.pdf",
            "certification.pdf",
            "energy_consumption.xlsx",
          ],
        },
        {
          type: "email_sent" as const,
          date: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Request for supporting documentation sent",
          title: "Supporting Documents Requested",
          icon: "mail_out",
          color: "blue",
          messageContent:
            "Dear Supplier,\n\nThank you for your cooperation so far. To complete our CBAM compliance process, we now need supporting documentation for your products. Please provide your production methodology, any relevant certifications, and energy consumption data.\n\nBest regards,\nCBAM Team",
          sender: "cbam-team@example.com",
          attachments: ["supporting_docs_template.xlsx"],
        },
        {
          type: "status_change" as const,
          date: format(subMonths(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          description: `${supplier.name} was created.`,
          title: "Supplier Created in System",
          icon: "created",
          color: "gray",
        }
      );
    }
    // Contacted status - MODIFIED: Only show initial contact, no follow-up
    else if (supplier.status === SupplierStatus.Contacted) {
      history.push(
        {
          type: "email_sent" as const,
          date: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Initial contact made with supplier",
          title: "Initial Contact",
          icon: "mail_out",
          color: "blue",
          messageContent:
            "Dear Supplier,\n\nAs part of our CBAM compliance efforts, we need to collect emission data for all imported goods. Please provide this information at your earliest convenience using the attached template.\n\nBest regards,\nCBAM Team",
          sender: "cbam-team@example.com",
          attachments: ["communication_template.xlsx"],
        },
        {
          type: "status_change" as const,
          date: format(subMonths(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          description: `${supplier.name} was created.`,
          title: "Supplier Created in System",
          icon: "created",
          color: "gray",
        }
      );
    }
    // Consultation Requested status
    else if (supplier.status === SupplierStatus.ConsultationRequested) {
      history.push(
        {
          type: "consultation" as const,
          date: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Consultation requested by supplier",
          title: "Consultation Requested",
          icon: "mail_in",
          color: "orange",
          messageContent:
            "Dear CBAM Team,\n\nWe would like to request a consultation to better understand the CBAM requirements and how they apply to our products. Please let us know when you would be available for a meeting.\n\nBest regards,\nSupplier Team",
          sender: "supplier@example.com",
        },
        {
          type: "email_sent" as const,
          date: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Initial contact made with supplier",
          title: "Initial Contact",
          icon: "mail_out",
          color: "blue",
          messageContent:
            "Dear Supplier,\n\nAs part of our CBAM compliance efforts, we need to collect emission data for all imported goods. Please provide this information at your earliest convenience using the attached template.\n\nBest regards,\nCBAM Team",
          sender: "cbam-team@example.com",
          attachments: ["communication_template.xlsx"],
        },
        {
          type: "status_change" as const,
          date: format(subMonths(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          description: `${supplier.name} was created.`,
          title: "Supplier Created in System",
          icon: "created",
          color: "gray",
        }
      );
    }
    // Under Consultation status
    else if (supplier.status === SupplierStatus.UnderConsultation) {
      history.push(
        {
          type: "consultation" as const,
          date: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Consultation scheduled with supplier",
          title: "Consultation Scheduled",
          icon: "mail_out",
          color: "green",
          messageContent:
            "Dear Supplier,\n\nWe have scheduled a consultation session to discuss your CBAM requirements. Our experts will be available to answer your questions and provide guidance.\n\nBest regards,\nCBAM Team",
          sender: "cbam-team@example.com",
        },
        {
          type: "consultation" as const,
          date: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Consultation requested by supplier",
          title: "Consultation Requested",
          icon: "mail_in",
          color: "orange",
          messageContent:
            "Dear CBAM Team,\n\nWe would like to request a consultation to better understand the CBAM requirements and how they apply to our products. Please let us know when you would be available for a meeting.\n\nBest regards,\nSupplier Team",
          sender: "supplier@example.com",
        },
        {
          type: "email_sent" as const,
          date: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss"),
          description: "Initial contact made with supplier",
          title: "Initial Contact",
          icon: "mail_out",
          color: "blue",
          messageContent:
            "Dear Supplier,\n\nAs part of our CBAM compliance efforts, we need to collect emission data for all imported goods. Please provide this information at your earliest convenience using the attached template.\n\nBest regards,\nCBAM Team",
          sender: "cbam-team@example.com",
          attachments: ["communication_template.xlsx"],
        },
        {
          type: "status_change" as const,
          date: format(subMonths(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          description: `${supplier.name} was created.`,
          title: "Supplier Created in System",
          icon: "created",
          color: "gray",
        }
      );
    }
    // Default history for other statuses
    else {
      history.push({
        type: "status_change" as const,
        date: format(subMonths(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
        description: `${supplier.name} was created.`,
        title: "Supplier Created in System",
        icon: "created",
        color: "gray",
      });
    }

    return history;
  };

  // Format date for timeline
  const formatTimelineDate = (dateString: string) => {
    if (!dateString || !isValid(new Date(dateString))) return ["", "", ""];
    const date = new Date(dateString);
    const day = format(date, "dd");
    const month = format(date, "MMM");
    const year = format(date, "yyyy");
    return [day, month, year];
  };

  // Calculate days between two dates
  const getDaysBetween = (date1: string, date2: string) => {
    if (
      !date1 ||
      !date2 ||
      !isValid(new Date(date1)) ||
      !isValid(new Date(date2))
    )
      return null;

    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs(differenceInDays(d1, d2));
  };

  // Open message dialog
  const openMessageDialog = (
    title: string,
    content: string,
    date?: string,
    sender?: string,
    attachments?: string[]
  ) => {
    setSelectedMessage({
      title,
      content,
      date,
      sender,
      attachments,
    });
    setMessageDialogOpen(true);
  };

  // Function to handle downloading emission data as PDF
  const handleDownloadPDF = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    console.log(`Downloading PDF for supplier: ${supplier.name}`);
    // In a real implementation, this would generate a PDF with the emission data
    // and trigger a download

    // Mock download by creating a simple text blob
    const emissionData = {
      supplier: supplier.name,
      country: supplier.country,
      cnCode: selectedCnCodes[supplierId] || "All",
      totalSEE: selectedCnCodes[supplierId]
        ? getEmissionsForCnCode(
            supplierId,
            selectedCnCodes[supplierId]
          ).total.toFixed(2)
        : "N/A",
      directSEE: selectedCnCodes[supplierId]
        ? getEmissionsForCnCode(
            supplierId,
            selectedCnCodes[supplierId]
          ).direct.toFixed(2)
        : "N/A",
      indirectSEE: selectedCnCodes[supplierId]
        ? getEmissionsForCnCode(
            supplierId,
            selectedCnCodes[supplierId]
          ).indirect.toFixed(2)
        : "N/A",
      productionMethod: getProductionMethod(supplierId),
      emissionFactor: getEmissionFactor(supplierId),
      electricityUsage: getElectricityUsage(supplierId),
      validFrom: format(new Date(), "dd MMM yyyy"),
      validTo: format(addYears(new Date(), 1), "dd MMM yyyy"),
    };

    const content = JSON.stringify(emissionData, null, 2);
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${supplier.name.replace(/\s+/g, "_")}_emission_data.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to handle downloading emission data as Excel
  const handleDownloadExcel = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    console.log(`Downloading Excel for supplier: ${supplier.name}`);
    // In a real implementation, this would generate an Excel file with the emission data
    // and trigger a download

    // Mock download by creating a simple text blob
    const emissionData = {
      supplier: supplier.name,
      country: supplier.country,
      cnCode: selectedCnCodes[supplierId] || "All",
      totalSEE: selectedCnCodes[supplierId]
        ? getEmissionsForCnCode(
            supplierId,
            selectedCnCodes[supplierId]
          ).total.toFixed(2)
        : "N/A",
      directSEE: selectedCnCodes[supplierId]
        ? getEmissionsForCnCode(
            supplierId,
            selectedCnCodes[supplierId]
          ).direct.toFixed(2)
        : "N/A",
      indirectSEE: selectedCnCodes[supplierId]
        ? getEmissionsForCnCode(
            supplierId,
            selectedCnCodes[supplierId]
          ).indirect.toFixed(2)
        : "N/A",
      productionMethod: getProductionMethod(supplierId),
      emissionFactor: getEmissionFactor(supplierId),
      electricityUsage: getElectricityUsage(supplierId),
      validFrom: format(new Date(), "dd MMM yyyy"),
      validTo: format(addYears(new Date(), 1), "dd MMM yyyy"),
    };

    const content = JSON.stringify(emissionData, null, 2);
    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${supplier.name.replace(/\s+/g, "_")}_emission_data.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      {filterContent}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <ThreeWayCheckbox
                checked={
                  selectedSuppliers.length === suppliers.length &&
                  suppliers.length > 0
                }
                onCheckedChange={(checked) =>
                  onSelectAllSuppliers(checked as boolean)
                }
              />
            </TableHead>
            <TableHead
              className="w-[50px] cursor-pointer"
              onClick={() => {
                // When sorting by index, we need to consider the pagination
                // This ensures sorting works correctly with continuous row numbers
                //onSort("index")
              }}
            >
              <div className="flex items-center">
                {/* <Tooltip Content={continuousIndexing ? "Continuous numbering across pages" : "Page-specific numbering"}>
                  <span className="mr-1">#</span>
                </Tooltip> */}
                {sortConfig.key === ("index" as any) &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer w-1/4"
              onClick={() => onSort("name")}
            >
              Supplier
              {sortConfig.key === "name" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("country")}
            >
              Country
              {sortConfig.key === "country" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </TableHead>
            <TableHead className="w-[100px]">Consultation</TableHead>
            <TableHead
              className="cursor-pointer w-96"
              onClick={() => onSort("status")}
            >
              Status
              {sortConfig.key === "status" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("validUntil")}
            >
              Valid Until
              {sortConfig.key === "validUntil" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("lastUpdate")}
            >
              Last Update
              {sortConfig.key === "lastUpdate" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </TableHead>
            <TableHead className=""></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplierItem, index) => (
            <>
              <TableRow
                key={supplierItem.id}
                className={
                  expandedRows.has(supplierItem.id!) ? "border-b-0" : ""
                }
              >
                <TableCell>
                  <ThreeWayCheckbox
                    checked={selectedSuppliers.includes(supplierItem.id!)}
                    onCheckedChange={(checked) =>
                      onSelectSupplier(supplierItem.id!, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="text-gray-400 font-mono text-sm w-12">
                  {(() => {
                    // Calculate row number based on pagination and continuous indexing setting
                    let rowNumber = index + 1;
                    if (
                      continuousIndexing &&
                      currentPage > 0 &&
                      itemsPerPage > 0
                    ) {
                      rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    }
                    return String(rowNumber).padStart(3, "0");
                  })()}
                </TableCell>
                <TableCell className="font-semibold w-1/4">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 mr-2 h-6 w-6"
                      onClick={() => toggleRowExpansion(supplierItem.id!)}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedRows.has(supplierItem.id!) ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                    {supplierItem.name}
                  </div>
                </TableCell>
                <TableCell className="w-16">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="text-sm">
                          {getCountryCode(supplierItem.country)}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <p>{supplierItem.country}</p>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSupplierForConsultation(supplierItem);
                      setConsultationDialogOpen(true);
                    }}
                    className={cn(
                      "relative w-10 h-10 p-0 rounded-full",
                      (supplierItem.consultationHours ?? 0) > 0
                        ? "bg-transparent"
                        : "hover:bg-transparent"
                    )}
                  >
                    <Handshake
                      className={cn(
                        "h-5 w-5",
                        (supplierItem.consultationHours ?? 0) > 0
                          ? "text-black"
                          : "text-gray-400"
                      )}
                    />
                    {(supplierItem.consultationHours ?? 0) > 0 && (
                      <span className="absolute inset-0 rounded-full animate-pulse bg-green-300 opacity-30" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="w-96">
                  <div className="flex items-center">
                    <Tooltip>
                      <span
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium w-56 justify-start ${
                          supplierItem.status ===
                          SupplierStatus.EmissionDataReceived
                            ? "bg-green-100 text-green-800"
                            : supplierItem.status ===
                              SupplierStatus.SupportingDocumentsReceived
                            ? "bg-blue-100 text-blue-800"
                            : supplierItem.status ===
                              SupplierStatus.ContactFailed
                            ? "bg-red-100 text-red-800"
                            : supplierItem.status === SupplierStatus.Pending
                            ? "bg-yellow-100 text-yellow-800"
                            : supplierItem.status === SupplierStatus.Contacted
                            ? "bg-purple-100 text-purple-800"
                            : supplierItem.status ===
                                SupplierStatus.ConsultationRequested ||
                              supplierItem.status ===
                                SupplierStatus.UnderConsultation
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center mr-2">
                          {supplierItem.status ===
                            SupplierStatus.EmissionDataReceived && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {supplierItem.status ===
                            SupplierStatus.SupportingDocumentsReceived && (
                            <FileText className="w-4 h-4" />
                          )}
                          {supplierItem.status ===
                            SupplierStatus.ContactFailed && (
                            <XCircle className="w-4 h-4" />
                          )}
                          {supplierItem.status === SupplierStatus.Pending && (
                            <Clock className="w-4 h-4" />
                          )}
                          {supplierItem.status === SupplierStatus.Contacted && (
                            <Mail className="w-4 h-4" />
                          )}
                          {(supplierItem.status ===
                            SupplierStatus.ConsultationRequested ||
                            supplierItem.status ===
                              SupplierStatus.UnderConsultation) && (
                            <MessageCircle className="w-4 h-4" />
                          )}
                          {supplierItem.status === SupplierStatus.None && (
                            <HelpCircle className="w-4 h-4" />
                          )}
                        </div>
                        <span className="truncate">{supplierItem.status}</span>
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
                {/* <TableCell className="w-32">
                  {supplierItem.validUntil &&
                  isValid(new Date(supplierItem.validUntil)) ? (
                    <Tooltip
                    // content={format(
                    //   new Date(supplierItem.validUntil),
                    //   "dd/MM/yyyy"
                    // )}
                    >
                      <span>
                        {dateToQuarter(new Date(supplierItem.validUntil))}
                        <br />
                        <span
                          className={`text-xs ${
                            isAfter(
                              new Date(supplierItem.validUntil),
                              new Date()
                            )
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {isAfter(
                            new Date(supplierItem.validUntil),
                            new Date()
                          )
                            ? "valid"
                            : "expired"}
                        </span>
                      </span>
                    </Tooltip>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell> */}
                <TableCell className="w-32">
                  <Tooltip
                  // content={format(new Date(), "dd/MM/yyyy")}
                  >
                    <span>{format(new Date(), "dd/MM/yyyy")}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSupplier(supplierItem)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <SupplierHistoryDialog
                    isOpen={openHistoryDialog === supplierItem.id}
                    onOpenChange={(open) =>
                      setOpenHistoryDialog(open ? supplierItem.id! : null)
                    }
                    supplier={supplierItem}
                  />
                </TableCell>
              </TableRow>
              {expandedRows.has(supplierItem.id!) && (
                <TableRow
                  key={`expanded-${supplierItem.id}`}
                  className="bg-gray-50"
                >
                  <TableCell colSpan={9} className="p-4">
                    <div className="mb-4 border rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-700">
                            File Management
                          </h4>
                          <p className="text-sm text-gray-500">
                            Access and manage supplier documentation
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            if (typeof onFileIconClick === "function") {
                              onFileIconClick(supplierItem);
                            } else {
                              console.error(
                                "onFileIconClick is not a function"
                              );
                            }
                          }}
                          className="relative"
                        >
                          <FileIcon className="h-4 w-4 mr-2" />
                          <span>Manage Files</span>
                          {supplierItem.files &&
                            supplierItem.files.length > 0 && (
                              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {supplierItem.files.length}
                              </span>
                            )}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4 w-full max-w-none">
                      {/* Left side: Emission Data (wider) */}
                      <div className="border rounded-lg p-4 bg-white col-span-5">
                        <div className="flex justify-between items-center mb-3 border-b pb-2">
                          <h4 className="font-medium text-gray-700">
                            Emission Data
                          </h4>
                        </div>
                        {supplierItem.status ===
                        SupplierStatus.EmissionDataReceived ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="text-sm text-gray-500 mb-1">
                                  CN Code
                                </div>
                                <Select
                                  value={
                                    selectedCnCodes[supplierItem.id!] || ""
                                  }
                                  onValueChange={(value) =>
                                    handleCnCodeSelect(supplierItem.id!, value)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a CN code" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getSupplierCnCodes(supplierItem.id!).map(
                                      (cnCode) => (
                                        <SelectItem key={cnCode} value={cnCode}>
                                          {cnCode}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {selectedCnCodes[supplierItem.id!] && (
                              <>
                                <div className="bg-green-50 p-3 rounded-md">
                                  <div className="text-sm text-gray-500">
                                    Total SEE
                                  </div>
                                  <div className="text-xl font-semibold text-green-700 mt-1">
                                    {getEmissionsForCnCode(
                                      supplierItem.id!,
                                      selectedCnCodes[supplierItem.id!]
                                    ).total.toFixed(2)}{" "}
                                    tCO₂/t
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-green-50 p-3 rounded-md">
                                    <div className="text-sm text-gray-500">
                                      Direct SEE
                                    </div>
                                    <div className="text-xl font-semibold text-green-700 mt-1">
                                      {getEmissionsForCnCode(
                                        supplierItem.id!,
                                        selectedCnCodes[supplierItem.id!]
                                      ).direct.toFixed(2)}{" "}
                                      tCO₂/t
                                    </div>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded-md">
                                    <div className="text-sm text-gray-500">
                                      Indirect SEE
                                    </div>
                                    <div className="text-xl font-semibold text-green-700 mt-1">
                                      {getEmissionsForCnCode(
                                        supplierItem.id!,
                                        selectedCnCodes[supplierItem.id!]
                                      ).indirect.toFixed(2)}{" "}
                                      tCO₂/t
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-green-50 p-3 rounded-md">
                                <div className="text-sm text-gray-500">
                                  Emission Factor
                                </div>
                                <div className="text-xl font-semibold text-green-700 mt-1">
                                  {getEmissionFactor(supplierItem.id!)} tCO₂/MWh
                                </div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-md">
                                <div className="text-sm text-gray-500">
                                  Electricity Usage
                                </div>
                                <div className="text-xl font-semibold text-green-700 mt-1">
                                  {getElectricityUsage(supplierItem.id!)} MWh/t
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 border-t pt-3">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 flex flex-col">
                                  <h5 className="font-medium text-sm text-gray-500 mb-1">
                                    Data Valid
                                  </h5>
                                  <div className="flex items-center">
                                    <span className="font-bold">
                                      {format(
                                        subYears(new Date(), 1),
                                        "dd MMM yyyy"
                                      )}
                                    </span>
                                    <span className="mx-1">to</span>
                                    <span className="font-bold">
                                      {format(new Date(), "dd MMM yyyy")}
                                    </span>
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="ml-2"
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download Data
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDownloadPDF(supplierItem.id!)
                                      }
                                    >
                                      <FileDown className="h-4 w-4 mr-2" />
                                      Download as PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDownloadExcel(supplierItem.id!)
                                      }
                                    >
                                      <FileDown className="h-4 w-4 mr-2" />
                                      Download as Excel
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic py-4 text-center">
                            No emission data available for this supplier
                          </div>
                        )}
                      </div>

                      {/* Right side: Communication History */}
                      <div className="border rounded-lg p-4 bg-white col-span-7">
                        <h4 className="font-medium mb-3 text-gray-700 border-b pb-2">
                          Communication History
                        </h4>
                        <div className="max-h-[32rem] overflow-y-auto pr-2">
                          {getSupplierHistory(supplierItem).length > 0 ? (
                            <div className="relative py-2">
                              {/* Timeline line */}
                              <div className="absolute left-16 top-0 bottom-0 w-1 bg-gray-200"></div>

                              {getSupplierHistory(supplierItem).map(
                                (event, idx, arr) => {
                                  // Reverse the index to start from the bottom
                                  const index = arr.length - 1 - idx;
                                  const [day, month, year] = formatTimelineDate(
                                    event.date
                                  );
                                  const isFirstEntry = idx === 0;

                                  // Get icon and color based on event type or custom properties
                                  const getEventIcon = () => {
                                    if (event.icon === "report_success")
                                      return (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      );
                                    if (event.icon === "mail_in")
                                      return (
                                        <Mail className="h-4 w-4 text-purple-500" />
                                      );
                                    if (event.icon === "mail_out")
                                      return (
                                        <Mail className="h-4 w-4 text-purple-500" />
                                      );
                                    if (event.icon === "created")
                                      return (
                                        <FileText className="h-4 w-4 text-gray-500" />
                                      );

                                    // Fallback to original logic
                                    if (event.type === "email_sent")
                                      return (
                                        <Mail className="h-4 w-4 text-purple-500" />
                                      );
                                    if (event.type === "response_received")
                                      return (
                                        <MessageCircle className="h-4 w-4 text-purple-500" />
                                      );
                                    if (event.type === "status_change")
                                      return (
                                        <RefreshCw className="h-4 w-4 text-orange-500" />
                                      );
                                    if (event.type === "consultation")
                                      return (
                                        <Handshake className="h-4 w-4 text-purple-500" />
                                      );
                                    return (
                                      <FileText className="h-4 w-4 text-gray-500" />
                                    );
                                  };

                                  // Get first line of message if available
                                  const getMessagePreview = () => {
                                    if (!event.messageContent) return null;
                                    const firstLine = event.messageContent
                                      .split("\n")
                                      .filter((line) => line.trim())[0];
                                    return firstLine;
                                  };

                                  const messagePreview = getMessagePreview();

                                  return (
                                    <div key={idx} className="mb-6 last:mb-0">
                                      {isFirstEntry &&
                                        "nextReportingDays" in event && (
                                          <div className="ml-24 mb-2 text-xs italic text-gray-500">
                                            Contacting Supplier automatically
                                            for next Emission Data Reporting
                                            Period in {event.nextReportingDays}{" "}
                                            days
                                          </div>
                                        )}
                                      <div className="flex items-center">
                                        {/* Date column */}
                                        <div className="w-16 text-center text-[#111827] text-xs">
                                          <div className="font-bold">{day}</div>
                                          <div>{month}</div>
                                          <div>{year}</div>
                                        </div>

                                        {/* Timeline elements */}
                                        <div className="relative flex-1">
                                          {/* Index number in circle */}
                                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center z-10 text-xs text-gray-400 font-medium">
                                            {index + 1}
                                          </div>

                                          {/* Horizontal branch line */}
                                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-[2px] bg-gray-200"></div>

                                          {/* Event icon */}
                                          <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white p-1 rounded-full border-2 border-gray-200 z-10">
                                            {getEventIcon()}
                                          </div>

                                          {/* Content box */}
                                          <div className="ml-16 bg-gray-100 rounded-lg p-3 relative">
                                            <div className="mb-1 text-sm font-medium">
                                              {event.title ||
                                                (event.type === "email_sent"
                                                  ? "Email Sent"
                                                  : event.type ===
                                                    "response_received"
                                                  ? "Response Received"
                                                  : event.type ===
                                                    "status_change"
                                                  ? "Status Changed"
                                                  : event.type ===
                                                    "consultation"
                                                  ? "Consultation"
                                                  : "Document Update")}
                                            </div>
                                            <div className="text-sm">
                                              {event.description ||
                                                "No description available"}
                                            </div>

                                            {/* Message preview in italic - limited to one line */}
                                            {messagePreview && (
                                              <div className="text-sm italic text-gray-600 mt-2 border-t border-gray-200 pt-2 truncate">
                                                {messagePreview}
                                              </div>
                                            )}

                                            {/* Details icon button */}
                                            {(event.type === "email_sent" ||
                                              event.type ===
                                                "response_received") &&
                                              event.messageContent && (
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="absolute top-2 right-2 h-6 w-6 text-purple-600 hover:text-purple-800"
                                                  onClick={() =>
                                                    openMessageDialog(
                                                      event.title ||
                                                        (event.type ===
                                                        "email_sent"
                                                          ? "Email Sent"
                                                          : "Response Received"),
                                                      event.messageContent,
                                                      event.date,
                                                      event.sender,
                                                      event.attachments
                                                    )
                                                  }
                                                >
                                                  <ExternalLink className="h-4 w-4" />
                                                </Button>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500 italic py-4 text-center">
                              No communication history available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMessage?.date && (
              <div className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {format(new Date(selectedMessage.date), "dd MMM yyyy, HH:mm")}
              </div>
            )}
            {selectedMessage?.sender && (
              <div className="text-sm">
                <span className="font-medium">From:</span>{" "}
                {selectedMessage.sender}
              </div>
            )}
            {selectedMessage?.attachments &&
              selectedMessage.attachments.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Attachments:</span>
                  <div className="mt-1 space-y-1">
                    {selectedMessage.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-purple-600"
                      >
                        <Paperclip className="h-3 w-3 mr-1" />
                        {attachment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
              {selectedMessage?.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConsultationDialog
        isOpen={consultationDialogOpen}
        onClose={() => setConsultationDialogOpen(false)}
        supplier={selectedSupplierForConsultation}
        onBookConsultation={(updatedSupplier) => {
          onUpdateSupplier(updatedSupplier);
        }}
      />
    </TooltipProvider>
  );
}
