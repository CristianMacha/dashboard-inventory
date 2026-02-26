import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, Search, X } from "lucide-react";
import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";
import { useDebounce } from "@/hooks/useDebounce";

import { getJobsAction } from "@/admin/actions/get-jobs.action";
import { jobKeys } from "@/admin/queryKeys";
import { JOB_STATUSES } from "@/lib/job-status";
import { jobColumns } from "./Columns";

const DEFAULT_PAGE_SIZE = 10;

export const JobsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<string>("");
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status || undefined,
    }),
    [page, debouncedSearch, status],
  );

  const { data, isLoading } = useQuery({
    queryKey: jobKeys.list(queryParams),
    queryFn: () => getJobsAction(queryParams),
  });

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setStatus("");
  }, []);

  const hasFilters = !!debouncedSearch || !!status;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Jobs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button asChild>
          <Link to="/jobs/new">
            <PlusIcon className="size-4" />
            New Job
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search by project or client…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <DataTable
          columns={jobColumns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyMessage="No jobs found. Create your first job to get started."
        />
        <div className="p-4 border-t bg-muted">
          <CustomPagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            totalCount={data?.total ?? 0}
            pageSize={DEFAULT_PAGE_SIZE}
            itemLabel="jobs"
            onPageChange={setPage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
