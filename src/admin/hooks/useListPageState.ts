import { useState, useCallback } from "react";

type ListPageState<T> = {
  page: number;
  setPage: (page: number) => void;
  sheetOpen: boolean;
  editingItem: T | null;
  openCreate: () => void;
  openEdit: (item: T) => void;
  handleSheetOpenChange: (open: boolean) => void;
};

export function useListPageState<T>(): ListPageState<T> {
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setSheetOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) setEditingItem(null);
  }, []);

  return {
    page,
    setPage,
    sheetOpen,
    editingItem,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  };
}
