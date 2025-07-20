export enum SupplierStatus {
  None = "Not Contacted",
  Contacted = "Contacted",
  ConsultationRequested = "Consultation Requested",
  UnderConsultation = "Under Consultation",
  Pending = "Pending Info",
  SupportingDocumentsReceived = "Supporting Docs",
  EmissionDataReceived = "Emission Data Received",
  ContactFailed = "Contact Failed",
}

export interface SupplierFile {
  id: string
  filename: string
  dateReceived: string
  documentType: "emission data" | "supporting document" | "other"
  filesize: number
  url: string
}

export interface HistoryEvent {
  type: "email_sent" | "response_received" | "status_change" | "consultation" | "document_update"
  date: string
  description?: string
  messageContent: string
  icon?: string // Optional icon for the event
  nextReportingDays?: number // Optional field to indicate next reporting days
  title?: string // Optional title for the event
  sender:string;
  attachments:string[]
  
}

export interface Supplier {
  id?: number
  name: string
  country: string
  address: {
    country: string
    street: string
    streetNumber: string
    additionalLine: string
    postcode: string
    city: string
  }
  contactPerson: {
    name: string
    email: string
    phone: string
  }
  cnCodes: string[]
  remarks: string
  status: SupplierStatus
  
  rawStatus?: string // Add this field to store the original database status
  lastUpdate: string
  files: SupplierFile[]
  validUntil?: string
  consultationHours: number
  history?: HistoryEvent[]
  lastUpdated?: string
  see_direct:number,
  see_indirect:number,
  see_total:number,
  emission_factor:number,
  electricity_emissions:number
  productionMethodCode?: string 


}

export interface CNCode {
  code: string
  category: string
  description: string
}

export type FilterState = {
  [key: string]: boolean | "indeterminate"
}
