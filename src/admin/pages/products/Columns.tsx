import { Link } from "react-router";
import { Eye, PackagePlus, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductResponse } from "@/interfaces/product.response";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export const productColumns = (
  onAddBundle: (product: ProductResponse) => void,
): ColumnDef<ProductResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    size: 280,
    cell: ({ row }) => {
      return (
        <div className="min-w-0 max-w-[280px]">
          <p className="font-medium truncate">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {row.original.description}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const name = row.original.category?.name;
      if (!name) return <span className="text-muted-foreground">—</span>;
      return (
        <StatusBadge label={name} className="bg-primary/10 text-primary ring-1 ring-primary/20" />
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      const name = row.original.brand?.name;
      if (!name) return <span className="text-muted-foreground">—</span>;
      return (
        <StatusBadge label={name} className="bg-secondary text-secondary-foreground ring-1 ring-border" />
      );
    },
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const name = row.original.level?.name;
      if (!name) return <span className="text-muted-foreground">—</span>;
      return <span className="text-sm">{name}</span>;
    },
  },
  {
    accessorKey: "finish",
    header: "Finish",
    cell: ({ row }) => {
      const name = row.original.finish?.name;
      if (!name) return <span className="text-muted-foreground">—</span>;
      return <span className="text-sm">{name}</span>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.isActive ? "Active" : "Inactive"}
        className={
          row.original.isActive
            ? "bg-green-100 text-green-800 ring-1 ring-green-200"
            : "bg-muted text-muted-foreground ring-1 ring-border"
        }
      />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddBundle(row.original)}
            aria-label="Add bundle"
            title="Add bundle & slabs"
          >
            <PackagePlus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild title="View detail">
            <Link
              to={`/products/${row.original.id}/detail`}
              aria-label="View product detail"
            >
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Edit product">
            <Link to={`/products/${row.original.id}`} aria-label="Edit product">
              <Pencil className="size-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
