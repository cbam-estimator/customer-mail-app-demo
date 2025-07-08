"use client"

import { ChevronDown, Edit, FileIcon, Filter, Plus } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type Supplier = {
  id: number
  name: string
  country: string
  status: "active" | "inactive"
  contactPerson: string
  email: string
  phone: string
  goodsImportId: number
}

export type GoodsImportRow = {
  id: number
  date: string
  supplierId: number
  items: string
  quantity: number
  unitPrice: number
  totalAmount: number
}

type FilterState = {
  [key: string]: boolean
}

interface SupplierTableProps {
  suppliers: Supplier[]
  selectedSuppliers: number[]
  sortConfig: { key: keyof Supplier | null; direction: "asc" | "desc" }
  onSelectSupplier: (id: number, checked: boolean) => void
  onSelectAllSuppliers: (checked: boolean) => void
  onSort: (key: keyof Supplier) => void
  onEditSupplier: (supplier: Supplier) => void
  onFileIconClick: (supplier: Supplier) => void
  countryFilter: FilterState
  statusFilter: FilterState
  onFilterChange: (filterType: "country" | "status" | "supplier", key: string, value: boolean) => void
  onUpdateSupplier: (updatedSupplier: Supplier) => void
  onAddSupplier: () => void
  isAdmin: boolean
  goodsImports?: GoodsImportRow[]
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
  onAddSupplier,
  isAdmin,
  goodsImports = [],
}: SupplierTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const columns: ColumnDef<Supplier>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && true)}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
            onSelectSupplier(row.original.id, !!value)
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => onSort("name")}>
            Name
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => onSort("country")}>
            Country
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => onSort("status")}>
            Status
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string

        return (
          <div className="flex items-center">
            {status === "active" ? (
              <Badge variant="outline" className="text-green-500 border-green-500">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-500 border-red-500">
                Inactive
              </Badge>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "contactPerson",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => onSort("contactPerson")}>
            Contact Person
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => onSort("email")}>
            Email
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => onSort("phone")}>
            Phone
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={() => onEditSupplier(supplier)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onFileIconClick(supplier)}>
              <FileIcon className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: suppliers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting: sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center space-x-3">
        <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-[180px]">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => onAddSupplier()}
            className="border-gray-200 bg-white text-black hover:bg-gray-50 hover:text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        )}
      </div>
      <div className="hidden items-center py-4 md:flex">
        <Input
          placeholder="Filter suppliers..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <ScrollArea>
          <div className="relative min-w-[600px]">
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          className="px-4 py-2 font-medium text-left [&:not([:first-child])]:border-l"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : "unchecked"}
                      className={cn(
                        "border-b transition-colors data-[state=selected]:bg-muted hover:bg-accent hover:text-accent-foreground",
                        row.getIsSelected() ? "bg-muted" : "",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 [&:not([:first-child])]:border-l">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="p-4 text-center">
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
