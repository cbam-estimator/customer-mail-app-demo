"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Supplier, SupplierStatus, type SupplierFile } from "@/types/supplier"
import { cnCodes } from "@/data/cnCodes"
import { countryFlags } from "@/data/countryFlags"
import { X } from "lucide-react"

interface AddEditSupplierProps {
  supplier: Supplier | null
  onSave: (supplier: Supplier) => void
  onCancel: () => void
  isAdmin: boolean
}

interface FormErrors {
  name?: string
  country?: string
  "address.city"?: string
  "contactPerson.name"?: string
  "contactPerson.email"?: string
}

export function AddEditSupplier({ supplier, onSave, onCancel, isAdmin }: AddEditSupplierProps) {
  const [name, setName] = useState(supplier?.name || "")
  const [country, setCountry] = useState(supplier?.country || "")
  const [address, setAddress] = useState(
    supplier?.address || {
      country: "",
      street: "",
      streetNumber: "",
      additionalLine: "",
      postcode: "",
      city: "",
    },
  )
  const [contactPerson, setContactPerson] = useState(
    supplier?.contactPerson || {
      name: "",
      email: "",
      phone: "",
    },
  )
  const [cnCodesState, setCnCodes] = useState<string[]>(supplier?.cnCodes || [])
  const [remarks, setRemarks] = useState(supplier?.remarks || "")
  const [status, setStatus] = useState<SupplierStatus>(supplier?.status || SupplierStatus.None)
  const [errors, setErrors] = useState<FormErrors>({})
  const [files, setFiles] = useState<SupplierFile[]>(supplier?.files || [])
  const [validUntil, setValidUntil] = useState<Date | undefined>(
    supplier?.validUntil ? new Date(supplier.validUntil) : undefined,
  )

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) newErrors.name = "Supplier name is required"
    if (!country) newErrors.country = "Country is required"
    if (!address.city.trim()) newErrors["address.city"] = "City is required"
    if (!contactPerson.name.trim()) newErrors["contactPerson.name"] = "Contact person name is required"
    if (!contactPerson.email.trim()) newErrors["contactPerson.email"] = "Contact person email is required"
    if (contactPerson.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactPerson.email)) {
      newErrors["contactPerson.email"] = "Invalid email format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const handleSave = () => {
    if (validateForm()) {
      // Determine validUntil based on status
      let validUntilValue = undefined
      if (status === SupplierStatus.EmissionDataReceived || status === SupplierStatus.SupportingDocumentsReceived) {
        validUntilValue = new Date(2026, 0, 1).toISOString() // January 1, 2026
      } else {
        validUntilValue = undefined
      }

      onSave({
        id: supplier?.id,
        name,
        country,
        address: { ...address, country },
        contactPerson,
        cnCodes: cnCodesState,
        remarks,
        status,
        lastUpdate: new Date().toISOString(),
        files,
        validUntil: validUntilValue,
      })
    }
  }

  const handleAddCnCode = () => {
    if (cnCodesState.length < 7) {
      // Changed from 4 to 7
      setCnCodes([...cnCodesState, ""])
    }
  }

  const handleCnCodeChange = (index: number, value: string) => {
    const newCnCodes = [...cnCodesState]
    newCnCodes[index] = value
    setCnCodes(newCnCodes)
  }

  const handleRemoveCnCode = (index: number) => {
    const newCnCodes = [...cnCodesState]
    newCnCodes.splice(index, 1)
    setCnCodes(newCnCodes)
  }

  const getStatusColor = (status: SupplierStatus) => {
    switch (status) {
      case SupplierStatus.EmissionDataReceived:
        return "bg-green-100 text-green-800"
      case SupplierStatus.SupportingDocumentsReceived:
        return "bg-orange-100 text-orange-800"
      case SupplierStatus.ContactFailed:
        return "bg-red-100 text-red-800"
      case SupplierStatus.Pending:
        return "bg-blue-100 text-blue-800"
      case SupplierStatus.Contacted:
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden">
        <div className="flex flex-col h-[80vh]">
          <DialogHeader className="sticky top-0 z-50 bg-white border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <DialogTitle>{supplier ? `Edit Supplier: ${supplier.name}` : "Add Supplier"}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Supplier Name <span className="text-gray-700">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (e.target.value.trim()) clearError("name")
                      }}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Supplier Country <span className="text-gray-700">*</span>
                    </Label>
                    <Select
                      value={country}
                      onValueChange={(value) => {
                        setCountry(value)
                        if (value) clearError("country")
                      }}
                    >
                      <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(countryFlags).map((countryName) => (
                          <SelectItem key={countryName} value={countryName}>
                            {countryFlags[countryName]} {countryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">Street Number</Label>
                    <Input
                      id="streetNumber"
                      value={address.streetNumber}
                      onChange={(e) => setAddress({ ...address, streetNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-gray-700">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => {
                        setAddress({ ...address, city: e.target.value })
                        if (e.target.value.trim()) clearError("address.city")
                      }}
                      className={errors["address.city"] ? "border-red-500" : ""}
                    />
                    {errors["address.city"] && <p className="text-red-500 text-sm">{errors["address.city"]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Post Code</Label>
                    <Input
                      id="postcode"
                      value={address.postcode}
                      onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalLine">Additional Line</Label>
                  <Input
                    id="additionalLine"
                    value={address.additionalLine}
                    onChange={(e) => setAddress({ ...address, additionalLine: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Contact Person</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">
                      Name <span className="text-gray-700">*</span>
                    </Label>
                    <Input
                      id="contactName"
                      value={contactPerson.name}
                      onChange={(e) => {
                        setContactPerson({ ...contactPerson, name: e.target.value })
                        if (e.target.value.trim()) clearError("contactPerson.name")
                      }}
                      className={errors["contactPerson.name"] ? "border-red-500" : ""}
                    />
                    {errors["contactPerson.name"] && (
                      <p className="text-red-500 text-sm">{errors["contactPerson.name"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">
                      Email <span className="text-gray-700">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactPerson.email}
                      onChange={(e) => {
                        setContactPerson({ ...contactPerson, email: e.target.value })
                        if (e.target.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                          clearError("contactPerson.email")
                        }
                      }}
                      className={errors["contactPerson.email"] ? "border-red-500" : ""}
                    />
                    {errors["contactPerson.email"] && (
                      <p className="text-red-500 text-sm">{errors["contactPerson.email"]}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPerson.phone}
                    onChange={(e) => setContactPerson({ ...contactPerson, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">CN Codes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CN Code</TableHead>
                      <TableHead>Good Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cnCodesState.map((code, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select value={code} onValueChange={(value) => handleCnCodeChange(index, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select CN Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {cnCodes.map((cnCode) => (
                                <SelectItem key={cnCode.code} value={cnCode.code}>
                                  {cnCode.code} - {cnCode.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{cnCodes.find((c) => c.code === code)?.category || ""}</TableCell>
                        <TableCell>{cnCodes.find((c) => c.code === code)?.description || ""}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveCnCode(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button onClick={handleAddCnCode} className="mt-2" disabled={cnCodesState.length >= 7}>
                  Add CN Code
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-4 border-t-2 border-red-500 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-red-500">Admin Section</h3>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as SupplierStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SupplierStatus).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    {status === SupplierStatus.EmissionDataReceived ||
                    status === SupplierStatus.SupportingDocumentsReceived ? (
                      <div className="text-sm bg-gray-100 p-2 rounded border">
                        <span className="font-medium">Automatically set to January 1, 2026</span>
                        <p className="text-gray-500 mt-1">
                          This date is automatically set when status is "Emission Data" or "Supporting Docs"
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm bg-gray-100 p-2 rounded border">
                        <span className="font-medium">Not applicable</span>
                        <p className="text-gray-500 mt-1">
                          Valid until date is only set for "Emission Data" or "Supporting Docs" statuses
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 z-50 bg-white border-t px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
              >
                {status}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
