export interface FolderDto {
  id: string;
  name: string;
  parentId: string | null;
  organizationId: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecordDto {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  folderId: string;
  organizationId: string;
  createdByUserId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFileRecordsDto {
  data: FileRecordDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FolderContentsDto {
  folder: FolderDto;
  subfolders: FolderDto[];
  files: PaginatedFileRecordsDto;
}

export interface PaginatedFileSearchResultDto {
  data: FileRecordDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrganizationDto {
  id: string;
  name: string;
}
