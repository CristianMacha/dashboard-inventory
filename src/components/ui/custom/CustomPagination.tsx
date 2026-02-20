import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "../pagination";
import { cn } from "@/lib/utils";

export interface CustomPaginationProps {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of items (e.g. 20). */
  totalCount: number;
  /** Items per page (e.g. 10). */
  pageSize: number;
  /** Label for the items (e.g. "products"). Default "items". */
  itemLabel?: string;
  /** Called when page changes. */
  onPageChange: (page: number) => void;
  /** Disabled state (e.g. while loading). */
  disabled?: boolean;
  /** Optional class name for the container. */
  className?: string;
}

export const CustomPagination = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  itemLabel = "items",
  onPageChange,
  disabled = false,
  className,
}: CustomPaginationProps) => {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleFirst = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canPrev) onPageChange(1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canPrev) onPageChange(page - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canNext) onPageChange(page + 1);
  };

  const handleLast = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canNext) onPageChange(totalPages);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4",
        className,
      )}
    >
      <div className="flex w-full flex-wrap items-center justify-center gap-3 md:w-auto md:justify-start md:gap-6">
        <p className="text-muted-foreground text-center text-sm md:text-left">
          Showing {start} to {end} of {totalCount} {itemLabel}
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center md:w-auto md:justify-end md:gap-4">
        <p className="text-muted-foreground order-2 text-center text-sm sm:order-1 sm:text-left whitespace-nowrap">
          Page {page} of {totalPages || 1}
        </p>
        <Pagination className="order-1 sm:order-2">
          <PaginationContent className="gap-0">
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={handleFirst}
                aria-label="First page"
                className={cn(
                  "min-h-10 min-w-10 touch-manipulation md:min-h-9 md:min-w-9",
                  (disabled || !canPrev) && "pointer-events-none opacity-50",
                )}
              >
                <ChevronsLeftIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={handlePrev}
                aria-label="Previous page"
                className={cn(
                  "min-h-10 min-w-10 touch-manipulation md:min-h-9 md:min-w-9",
                  (disabled || !canPrev) && "pointer-events-none opacity-50",
                )}
              >
                <ChevronLeftIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={handleNext}
                aria-label="Next page"
                className={cn(
                  "min-h-10 min-w-10 touch-manipulation md:min-h-9 md:min-w-9",
                  (disabled || !canNext) && "pointer-events-none opacity-50",
                )}
              >
                <ChevronRightIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={handleLast}
                aria-label="Last page"
                className={cn(
                  "min-h-10 min-w-10 touch-manipulation md:min-h-9 md:min-w-9",
                  (disabled || !canNext) && "pointer-events-none opacity-50",
                )}
              >
                <ChevronsRightIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
