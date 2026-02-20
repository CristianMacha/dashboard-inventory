import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getCategoriesAction } from "@/admin/actions/get-categories.action";
import { getBrandsAction } from "@/admin/actions/get-brands.action";
import { categoryKeys, brandKeys } from "@/admin/queryKeys";

export interface ProductFiltersValue {
  search: string;
  brandIds: string[];
  categoryIds: string[];
}

interface ProductFiltersProps {
  filters: ProductFiltersValue;
  onChange: (filters: ProductFiltersValue) => void;
}

interface MultiSelectFilterProps {
  placeholder: string;
  selectedIds: string[];
  items: { id: string; name: string }[];
  itemLabel: string;
  onChange: (ids: string[]) => void;
}

const MultiSelectFilter = ({
  placeholder,
  selectedIds,
  items,
  itemLabel,
  onChange,
}: MultiSelectFilterProps) => {
  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const triggerLabel = () => {
    if (selectedIds.length === 0) return placeholder;
    if (selectedIds.length === 1) {
      return items.find((i) => i.id === selectedIds[0])?.name ?? placeholder;
    }
    return `${selectedIds.length} ${itemLabel}s`;
  };

  const isActive = selectedIds.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1.5 font-normal",
            isActive && "border-primary text-primary",
          )}
        >
          <span className="max-w-[130px] truncate">{triggerLabel()}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {items.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No {itemLabel}s found
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.id}
              checked={selectedIds.includes(item.id)}
              onCheckedChange={() => toggle(item.id)}
            >
              {item.name}
            </DropdownMenuCheckboxItem>
          ))
        )}
        {isActive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onChange([])}
              className="justify-center text-xs text-muted-foreground"
            >
              Clear {itemLabel} filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ProductFilters = ({ filters, onChange }: ProductFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data: categories = [] } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategoriesAction,
  });

  const { data: brands = [] } = useQuery({
    queryKey: brandKeys.all,
    queryFn: getBrandsAction,
  });

  // Sync local input when parent clears the search externally
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Debounce search → notify parent after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleBrandChange = useCallback(
    (ids: string[]) => onChange({ ...filters, brandIds: ids }),
    [filters, onChange],
  );

  const handleCategoryChange = useCallback(
    (ids: string[]) => onChange({ ...filters, categoryIds: ids }),
    [filters, onChange],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    onChange({ search: "", brandIds: [], categoryIds: [] });
  }, [onChange]);

  const hasFilters =
    !!filters.search ||
    filters.brandIds.length > 0 ||
    filters.categoryIds.length > 0;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <MultiSelectFilter
        placeholder="All categories"
        selectedIds={filters.categoryIds}
        items={categories}
        itemLabel="category"
        onChange={handleCategoryChange}
      />

      <MultiSelectFilter
        placeholder="All brands"
        selectedIds={filters.brandIds}
        items={brands}
        itemLabel="brand"
        onChange={handleBrandChange}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
};
