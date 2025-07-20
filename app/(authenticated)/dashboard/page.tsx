"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { AddEditSupplier } from "@/components/SupplierGoods/Suppliers/AddEditSupplier";
import {
  type Supplier,
  SupplierStatus,
  type FilterState,
  type SupplierFile,
} from "@/types/supplier";
import type { GoodsImportRow } from "@/types/excel";
import { cnCodes } from "@/data/cnCodes";
import { useRouter } from "next/navigation";
import type { CheckedState } from "@/components/ui/three-way-checkbox";
import { FileManagementDialog } from "@/components/FileManagementDialog";
import { useToast } from "@/components/ui/use-toast";
import { EditGoodsEntryDialog } from "@/components/SupplierGoods/Goods/EditGoodsEntryDialog";
import { AddGoodsEntryDialog } from "@/components/SupplierGoods/Goods/AddGoodsEntryDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileUp } from "lucide-react";
import { db } from "@/lib/db/config";
import {
  suppliers as suppliersTable,
  goods as goodsTable,
  cnCodes as cnCodesTable,
  persons as personsTable,
} from "@/lib/db/schema";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { useCompany } from "@/context/company-context";
import { ImportDataModal } from "@/components/ImportDataModal";

// Helper function to convert Unix timestamp to Date object
const unixTimestampToDate = (
  timestamp: number | null | undefined
): Date | null => {
  if (timestamp === null || timestamp === undefined) return null;
  // Check if the timestamp is in seconds (Unix timestamp) or milliseconds (JS timestamp)
  return new Date(timestamp * (timestamp > 10000000000 ? 1 : 1000));
};

// Helper function to generate random SEE value
const generateRandomSEEValue = (): number => {
  return Number.parseFloat((Math.random() * 3 + 1.5).toFixed(2)); // Random value between 1.5 and 4.5
};

const assignRandomCnCodes = (): string[] => {
  const numberOfCodes = Math.floor(Math.random() * 5); // 0 to 4
  const shuffled = [...cnCodes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numberOfCodes).map((code) => code.code);
};

interface ImportedFile {
  id: string;
  filename: string;
  importDate: string;
  suppliers: number;
  goodsEntries: number;
  selected?: boolean;
  supplierIds: number[];
  goodsEntryIndices: number[];
  period: string;
}

type SortConfig = {
  key: keyof Supplier | null;
  direction: "asc" | "desc";
};

// Initialize with empty arrays instead of sample data
let sharedSuppliers: Supplier[] = [];
let sharedGoodsImports: GoodsImportRow[] = [];
let sharedImportedFiles: ImportedFile[] = [];

// Sample data as fallback
const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: "St-Steel Trading",
    country: "Turkey",
    cnCodes: ["7230 4332", "7432 4323", "2523 2100", "3102 1000"],
    status: SupplierStatus.EmissionDataReceived,
    lastUpdate: new Date().toISOString(),
    validUntil: new Date(2026, 0, 1).toISOString(),
    address: {
      country: "Turkey",
      street: "Atayolu Sk.",
      streetNumber: "5 c",
      additionalLine: "",
      postcode: "34050",
      city: "Istanbul",
    },
    contactPerson: {
      name: "Elifnur Kunt",
      email: "st.steel@info.com",
      phone: "0090 123 45 67",
    },
    remarks: "Die Beispiele werden nicht erfasst. Bitte nicht löschen.",
    files: [],
    consultationHours: 0,
    see_direct: 2.5,
    see_indirect: 3.0,
    productionMethodCode: "P34",
    see_total: 5.5,
    emission_factor: 0.8,
    electricity_emissions: 0.2,
  },
  // Add more sample suppliers if needed
];

const initialGoodsImports: GoodsImportRow[] = [
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
  // Add more sample goods if needed
];

export default function Dashboard() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [goodsImports, setGoodsImports] = useState<GoodsImportRow[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [countryFilter, setCountryFilter] = useState<FilterState>({});
  const [statusFilter, setStatusFilter] = useState<FilterState>({});
  const [fileManagementOpen, setFileManagementOpen] = useState(false);
  const [selectedSupplierFiles, setSelectedSupplierFiles] = useState<
    SupplierFile[]
  >([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null
  );
  const [importedFiles, setImportedFiles] =
    useState<ImportedFile[]>(sharedImportedFiles);
  const [goodsImportFilter, setGoodsImportFilter] = useState<FilterState>({});
  const { toast } = useToast();
  const [editingGoodsEntry, setEditingGoodsEntry] =
    useState<GoodsImportRow | null>(null);
  const [isEditGoodsEntryOpen, setIsEditGoodsEntryOpen] = useState(false);
  const [selectedGoodsEntries, setSelectedGoodsEntries] = useState<number[]>(
    []
  );
  const [isAddGoodsEntryOpen, setIsAddGoodsEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { company } = useCompany();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const cnCodesData = cnCodes;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAdmin(user.isAdmin);

      // Fetch data from the database
      fetchDataFromDatabase();
    } else {
      router.push("/");
    }
  }, [router]);

  // Function to fetch data from the database - using the same approach as the preview tables
  const fetchDataFromDatabase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch suppliers
      const fetchSuppliersResult = async () => {
        try {
          // Fetch suppliers from the database
          const dbSuppliers = await db.select().from(suppliersTable);

          // Fetch all persons for contact information
          const persons = await db.select().from(personsTable);

          // Transform database suppliers to match the frontend model
          const transformedSuppliers = dbSuppliers.map((supplier) => {
            // Find contact person
            const contactPerson =
              persons.find((p) => p.id === supplier.contact_person_id) || null;

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
                  // Log unexpected status values for debugging
                  console.log(
                    `Unrecognized status: ${supplier.emission_data_status}`
                  );
                  status = SupplierStatus.None;
              }
            }

            // Convert Unix timestamp to Date object for lastUpdate
            const lastUpdateDate = unixTimestampToDate(
              supplier.last_update ? Number(supplier.last_update) : null
            );
            const lastUpdateIso = lastUpdateDate
              ? lastUpdateDate.toISOString()
              : undefined;

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
              cnCodes: [], // Will be populated later
              remarks: supplier.remarks || "",
              status: status,
              rawStatus: supplier.emission_data_status || "none", // Add the raw status
              lastUpdate: lastUpdateIso || "", // Use empty string instead of current date
              validUntil: validUntilIso,
              files: [], // Files are not in the database schema yet
              consultationHours: supplier.consulting_hours || 0,
              see_direct: 2.5,
              see_indirect: 3.0,
              productionMethodCode: "P34",
              see_total: 5.5,
              emission_factor: 0.8,
              electricity_emissions: 0.2,
            };
          });

          return { success: true, data: transformedSuppliers };
        } catch (error) {
          console.error("Error fetching suppliers:", error);
          return { success: false, error: String(error) };
        }
      };

      // Fetch goods
      const fetchGoodsResult = async () => {
        try {
          // Fetch goods from the database
          const dbGoods = await db.select().from(goodsTable);

          // Fetch suppliers for relation
          const dbSuppliers = await db.select().from(suppliersTable);

          // Fetch CN codes for relation
          const dbCnCodes = await db.select().from(cnCodesTable);

          // Transform database goods to match the frontend model
          const transformedGoods = dbGoods.map((good) => {
            // Find related supplier
            const supplier = dbSuppliers.find((s) => s.id === good.supplier_id);

            // Find related CN code
            const cnCode = dbCnCodes.find((c) => c.id === good.cn_code_id);

            // Convert Unix timestamp to Date object
            const goodDate = unixTimestampToDate(
              good.date ? Number(good.date) : null
            );

            // Generate a quarter string from the date
            let quarter = "Unknown";
            if (goodDate) {
              const quarterNum = Math.floor(goodDate.getMonth() / 3) + 1;
              const year = goodDate.getFullYear();
              quarter = `Q${quarterNum}-${year}`;
            }

            return {
              id: good.id,
              remarks: good.remarks || "",
              cnCode: cnCode?.code || "Unknown",
              manufacturer: supplier?.name || "Unknown Supplier",
              quantity: good.quantity || 0,
              unit: "Kg", // Default unit if not specified
              productionMethod: good.production_method_code
                ? `${good.production_method_code}${
                    good.production_method_desc
                      ? ` - ${good.production_method_desc}`
                      : ""
                  }`
                : "",
              customsProcedure: good.customer_proc_code
                ? `${good.customer_proc_code}${
                    good.customer_proc_desc
                      ? ` - ${good.customer_proc_desc}`
                      : ""
                  }`
                : "",
              date: goodDate || null,
              quarter: quarter,
              seeDirect: good.see_direct !== null ? good.see_direct : 0,
              seeIndirect: good.see_indirect !== null ? good.see_indirect : 0,
              supplierId: 1,
            };
          });

          return { success: true, data: transformedGoods };
        } catch (error) {
          console.error("Error fetching goods:", error);
          return { success: false, error: String(error) };
        }
      };

      // Execute both fetch operations
      const suppliersResult = await fetchSuppliersResult();
      const goodsResult = await fetchGoodsResult();

      // Handle suppliers result
      if (suppliersResult.success && suppliersResult.data) {
        setSuppliers(suppliersResult.data);
        sharedSuppliers = suppliersResult.data;
      } else {
        console.warn(
          "Using sample supplier data due to fetch error:",
          suppliersResult.error
        );
        setSuppliers(initialSuppliers);
        sharedSuppliers = initialSuppliers;
      }

      // Handle goods result
      if (goodsResult.success && goodsResult.data) {
        setGoodsImports(goodsResult.data);
        sharedGoodsImports = goodsResult.data;

        // Save to localStorage for insights page
        localStorage.setItem("goodsImports", JSON.stringify(goodsResult.data));
      } else {
        console.warn(
          "Using sample goods data due to fetch error:",
          goodsResult.error
        );
        setGoodsImports(initialGoodsImports);
        sharedGoodsImports = initialGoodsImports;

        // Save sample data to localStorage for insights page
        localStorage.setItem(
          "goodsImports",
          JSON.stringify(initialGoodsImports)
        );
      }

      // If both failed, show error
      if (!suppliersResult.success && !goodsResult.success) {
        throw new Error("Failed to fetch both suppliers and goods data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : String(error));

      // Use sample data as fallback
      setSuppliers(initialSuppliers);
      setGoodsImports(initialGoodsImports);
      sharedSuppliers = initialSuppliers;
      sharedGoodsImports = initialGoodsImports;

      // Save sample data to localStorage for insights page
      localStorage.setItem("goodsImports", JSON.stringify(initialGoodsImports));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter suppliers based on company selection
  const filteredSuppliers = useMemo(() => {
    // If not using Example Corp, filter out suppliers with Pending status
    if (company.name && company.name !== "Example Corp") {
      return suppliers.filter(
        (supplier) => supplier.status !== SupplierStatus.Pending
      );
    }

    // Otherwise return all suppliers
    return suppliers;
  }, [suppliers, company.name]);

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsAddEditOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsAddEditOpen(true);
  };

  // Update the handleSaveSupplier function to set validUntil based on status
  const handleSaveSupplier = (supplier: Supplier) => {
    // Set validUntil to January 1, 2026 if status is Emission Data or Supporting Docs
    const updatedSupplier = { ...supplier };
    if (
      supplier.status === SupplierStatus.EmissionDataReceived ||
      supplier.status === SupplierStatus.SupportingDocumentsReceived
    ) {
      updatedSupplier.validUntil = new Date(2026, 0, 1).toISOString(); // January 1, 2026
    } else {
      // For other statuses, remove the validUntil property
      updatedSupplier.validUntil = undefined;
    }

    if (supplier.id) {
      const updatedSuppliers = filteredSuppliers.map((s) =>
        s.id === supplier.id ? updatedSupplier : s
      );
      setSuppliers(updatedSuppliers);
      sharedSuppliers = updatedSuppliers;
    } else {
      const newSupplier = {
        ...updatedSupplier,
        id:
          filteredSuppliers.length > 0
            ? Math.max(...filteredSuppliers.map((s) => s.id || 0)) + 1
            : 1,
        cnCodes:
          supplier.cnCodes.length === 0
            ? assignRandomCnCodes()
            : supplier.cnCodes,
        consultationHours: 0, // Initialize consultationHours for new suppliers
      };
      const updatedSuppliers = [...filteredSuppliers, newSupplier];
      setSuppliers(updatedSuppliers);
      sharedSuppliers = updatedSuppliers;
    }
    setIsAddEditOpen(false);
  };

  const handleSendMail = () => {
    const updatedSuppliers = filteredSuppliers.map((s) =>
      selectedSuppliers.includes(s.id!)
        ? { ...s, status: SupplierStatus.Contacted }
        : s
    );
    setSuppliers(updatedSuppliers);
    sharedSuppliers = updatedSuppliers;
    setSelectedSuppliers([]);
  };

  const handleFilterChange = (
    filterType: "country" | "status",
    key: string,
    value: CheckedState
  ) => {
    if (filterType === "country") {
      setCountryFilter((prev) => ({ ...prev, [key]: value }));
    } else {
      setStatusFilter((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSort = (key: keyof Supplier) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleRemoveSuppliers = () => {
    const updatedSuppliers = filteredSuppliers.filter(
      (s) => !selectedSuppliers.includes(s.id!)
    );
    setSuppliers(updatedSuppliers);
    sharedSuppliers = updatedSuppliers;
    setSelectedSuppliers([]);
  };

  const handleSelectSupplier = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers((prev) => [...prev, id]);
    } else {
      setSelectedSuppliers((prev) =>
        prev.filter((supplierId) => supplierId !== id)
      );
    }
  };

  // Then update the handleImport function
  const handleImport = (data: {
    suppliers: Supplier[];
    goodsImports: GoodsImportRow[];
    period: string;
  }) => {
    // Update suppliers with the imported data, ensuring unique IDs and assigning random CN Codes
    const lastId =
      filteredSuppliers.length > 0
        ? Math.max(...filteredSuppliers.map((s) => s.id || 0))
        : 0;
    const newSuppliers = data.suppliers.map((supplier, index) => ({
      ...supplier,
      id: lastId + index + 1,
      cnCodes:
        supplier.cnCodes.length === 0
          ? assignRandomCnCodes()
          : supplier.cnCodes,
    }));
    const updatedSuppliers = [...filteredSuppliers, ...newSuppliers];
    setSuppliers(updatedSuppliers);
    sharedSuppliers = updatedSuppliers;

    // Update goods imports with SEE values
    const lastGoodsIndex = goodsImports.length;
    const updatedGoodsImports = [
      ...goodsImports,
      ...data.goodsImports.map((entry) => ({
        ...entry,
        seeDirect: generateRandomSEEValue(),
        seeIndirect: generateRandomSEEValue(),
      })),
    ];
    setGoodsImports(updatedGoodsImports);
    sharedGoodsImports = updatedGoodsImports;

    // Add the imported file to the history
    const newImportedFile: ImportedFile = {
      id: Date.now().toString(),
      filename: `Import_${new Date().toISOString().split("T")[0]}.xlsx`,
      importDate: new Date().toLocaleDateString("en-GB"),
      period: data.period, // Add this line
      suppliers: newSuppliers.length,
      goodsEntries: data.goodsImports.length,
      supplierIds: newSuppliers.map((s) => s.id as number),
      goodsEntryIndices: Array.from(
        { length: data.goodsImports.length },
        (_, i) => lastGoodsIndex + i
      ),
    };
    const updatedImportedFiles = [newImportedFile, ...importedFiles];
    setImportedFiles(updatedImportedFiles);
    sharedImportedFiles = updatedImportedFiles;

    toast({
      title: "Import Successful",
      description: `Imported ${newSuppliers.length} suppliers and ${data.goodsImports.length} goods entries.`,
    });
  };

  const handleFileDownload = (fileId: string) => {
    const file = importedFiles.find((f) => f.id === fileId);
    if (file) {
      // In a real application, you would generate the file content here
      const fileContent = `Dummy content for ${file.filename}`;
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "File Downloaded",
        description: `${file.filename} has been downloaded.`,
      });
    }
  };

  const handleFileUndo = (fileId: string) => {
    const file = importedFiles.find((f) => f.id === fileId);
    if (file) {
      // Remove the suppliers associated with this file
      const updatedSuppliers = filteredSuppliers.filter(
        (s) => !file.supplierIds.includes(s.id as number)
      );
      setSuppliers(updatedSuppliers);
      sharedSuppliers = updatedSuppliers;
      // Remove the goods entries associated with this file
      const updatedGoodsImports = goodsImports.filter(
        (_, index) => !file.goodsEntryIndices.includes(index)
      );
      setGoodsImports(updatedGoodsImports);
      sharedGoodsImports = updatedGoodsImports;
      // Remove the file from the import history
      const updatedImportedFiles = importedFiles.filter((f) => f.id !== fileId);
      setImportedFiles(updatedImportedFiles);
      sharedImportedFiles = updatedImportedFiles;
      toast({
        title: "Import Undone",
        description: `The import of ${file.filename} has been undone.`,
      });
    }
  };

  const handleFileSelect = (fileId: string, selected: boolean) => {
    const updatedImportedFiles = importedFiles.map((file) =>
      file.id === fileId ? { ...file, selected } : file
    );
    setImportedFiles(updatedImportedFiles);
    sharedImportedFiles = updatedImportedFiles;

    const selectedFile = importedFiles.find((f) => f.id === fileId);
    if (selectedFile) {
      setSelectedSuppliers((prevSelected) => {
        if (selected) {
          //return [...new Set([...prevSelected, ...selectedFile.supplierIds])];
          return Array.from(
            new Set([...prevSelected, ...selectedFile.supplierIds])
          );
        } else {
          return prevSelected.filter(
            (id) => !selectedFile.supplierIds.includes(id)
          );
        }
      });
      setSelectedGoodsEntries((prevSelected) => {
        if (selected) {
          // return [
          //   ...new Set([...prevSelected, ...selectedFile.goodsEntryIndices]),
          // ];
          return Array.from(
            new Set([...prevSelected, ...selectedFile.goodsEntryIndices])
          );
        } else {
          return prevSelected.filter(
            (index) => !selectedFile.goodsEntryIndices.includes(index)
          );
        }
      });
    }
  };

  const handleFileIconClick = (supplier: Supplier) => {
    setSelectedSupplierFiles(supplier.files);
    setSelectedSupplierId(supplier.id!);
    setFileManagementOpen(true);
  };

  const handleFileUpload = (file: File, documentType: string) => {
    const newFile: SupplierFile = {
      id: Date.now().toString(),
      filename: file.name,
      dateReceived: new Date().toISOString(),
      documentType: documentType as
        | "emission data"
        | "supporting document"
        | "other",
      filesize: file.size,
      url: URL.createObjectURL(file),
    };

    const updatedSuppliers = filteredSuppliers.map((s) =>
      s.id === selectedSupplierId ? { ...s, files: [...s.files, newFile] } : s
    );
    setSuppliers(updatedSuppliers);
    sharedSuppliers = updatedSuppliers;

    setSelectedSupplierFiles((prev) => [...prev, newFile]);
  };

  const handleFileDelete = (fileId: string) => {
    // Find the supplier with the selected ID
    const updatedSuppliers = filteredSuppliers.map((s) => {
      if (s.id === selectedSupplierId) {
        // Filter out the file with the matching ID
        return {
          ...s,
          files: s.files.filter((file) => file.id !== fileId),
        };
      }
      return s;
    });

    setSuppliers(updatedSuppliers);
    sharedSuppliers = updatedSuppliers;

    // Update the selected files list to reflect the deletion
    setSelectedSupplierFiles((prev) =>
      prev.filter((file) => file.id !== fileId)
    );

    toast({
      title: "File Deleted",
      description: "The file has been successfully deleted.",
    });
  };

  const handleGoodsImportFilterChange = (key: string, value: CheckedState) => {
    setGoodsImportFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectAllGoodsEntries = (checked: boolean) => {
    if (checked) {
      setSelectedGoodsEntries(goodsImports.map((_, index) => index));
    } else {
      setSelectedGoodsEntries([]);
    }
  };

  const handleSelectGoodsEntry = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedGoodsEntries((prev) => [...prev, index]);
    } else {
      setSelectedGoodsEntries((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleEditGoodsEntry = (entry: GoodsImportRow) => {
    setEditingGoodsEntry({ ...entry });
    setIsEditGoodsEntryOpen(true);
  };

  const handleSaveGoodsEntry = (updatedEntry: GoodsImportRow) => {
    setGoodsImports((prevGoodsImports) =>
      prevGoodsImports.map((entry, index) =>
        selectedGoodsEntries.includes(index) ? updatedEntry : entry
      )
    );
    setEditingGoodsEntry(null);
    setIsEditGoodsEntryOpen(false);
    toast({
      title: "Entry Updated",
      description: "The goods entry has been successfully updated.",
    });
  };

  const handleAddGoodsEntry = () => {
    setIsAddGoodsEntryOpen(true);
  };

  const handleSaveGoodsEntryNew = (newEntry: GoodsImportRow) => {
    setGoodsImports((prevGoodsImports) => [...prevGoodsImports, newEntry]);
    toast({
      title: "Entry Added",
      description: "The new goods entry has been successfully added.",
    });
  };

  const handleDeleteGoodsEntry = (index: number) => {
    setGoodsImports((prevGoodsImports) =>
      prevGoodsImports.filter((_, i) => i !== index)
    );
    toast({
      title: "Entry Deleted",
      description: "The goods entry has been successfully deleted.",
    });
  };

  const handleDeleteSelectedGoodsEntries = () => {
    setGoodsImports((prevGoodsImports) =>
      prevGoodsImports.filter(
        (_, index) => !selectedGoodsEntries.includes(index)
      )
    );
    setSelectedGoodsEntries([]);
    toast({
      title: "Entries Deleted",
      description: `${selectedGoodsEntries.length} goods entries have been successfully deleted.`,
    });
  };

  // Also update the handleUpdateSupplier function to maintain the same logic
  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    // Apply the same validUntil logic
    if (
      updatedSupplier.status === SupplierStatus.EmissionDataReceived ||
      updatedSupplier.status === SupplierStatus.SupportingDocumentsReceived
    ) {
      updatedSupplier.validUntil = new Date(2026, 0, 1).toISOString(); // January 1, 2026
    } else {
      // For other statuses, remove the validUntil property
      updatedSupplier.validUntil = undefined;
    }

    const updatedSuppliers = filteredSuppliers.map((s) =>
      s.id === updatedSupplier.id ? updatedSupplier : s
    );
    setSuppliers(updatedSuppliers);
    sharedSuppliers = updatedSuppliers;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading data from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load data from database: {error}
            <div className="mt-2">
              <Button onClick={fetchDataFromDatabase}>Retry</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Data Import Button */}
        <div className="mt-6 mb-8 flex justify-end">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Data Import
          </Button>
        </div>

        {/* Enhanced Dashboard */}
        <EnhancedDashboard
          suppliers={filteredSuppliers}
          goodsImports={goodsImports}
        />

        {/* Data Import Button */}

        {isAddEditOpen && (
          <AddEditSupplier
            supplier={editingSupplier}
            onSave={handleSaveSupplier}
            onCancel={() => setIsAddEditOpen(false)}
            isAdmin={isAdmin}
          />
        )}
        <FileManagementDialog
          isOpen={fileManagementOpen}
          onClose={() => setFileManagementOpen(false)}
          files={selectedSupplierFiles}
          onUpload={handleFileUpload}
          onDelete={handleFileDelete}
          isAdmin={isAdmin}
        />
        {editingGoodsEntry && (
          <EditGoodsEntryDialog
            isOpen={isEditGoodsEntryOpen}
            onClose={() => setIsEditGoodsEntryOpen(false)}
            onSave={handleSaveGoodsEntry}
            entry={editingGoodsEntry}
          />
        )}
        <AddGoodsEntryDialog
          isOpen={isAddGoodsEntryOpen}
          onClose={() => setIsAddGoodsEntryOpen(false)}
          onSave={handleSaveGoodsEntryNew}
        />
        <ImportDataModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          importedFiles={importedFiles}
          onImport={handleImport}
          onDownload={handleFileDownload}
          onUndo={handleFileUndo}
          onSelect={handleFileSelect}
        />
      </div>
    </TooltipProvider>
  );
}
