import { Link } from "react-router";
import { PackagePlus, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductResponse } from "@/interfaces/product.response";
import { Button } from "@/components/ui/button";

const pillClasses =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

export const productColumns = (
  onAddBundle: (product: ProductResponse) => void,
): ColumnDef<ProductResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="min-w-0">
          <p className="font-medium truncate">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
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
        <span
          className={`${pillClasses} bg-primary/10 text-primary ring-1 ring-primary/20`}
        >
          {name}
        </span>
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
        <span
          className={`${pillClasses} bg-secondary text-secondary-foreground ring-1 ring-border`}
        >
          {name}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={
          row.original.isActive
            ? "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 ring-1 ring-green-200"
            : "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground ring-1 ring-border"
        }
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
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
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/products/${row.original.id}`} aria-label="Edit product">
              <Pencil className="size-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
