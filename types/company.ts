export interface CompanyInfo {
  name: string
  street: string
  houseNumber: string
  additionalAddress: string
  postalCode: string
  city: string
  country: string
  eoriNumber: string
  contactPerson: string
  contactPosition: string
}

export const DEFAULT_COMPANY: CompanyInfo = {
  name: "Acme Business",
  street: "",
  houseNumber: "",
  additionalAddress: "",
  postalCode: "",
  city: "",
  country: "",
  eoriNumber: "",
  contactPerson: "",
  contactPosition: "",
}
