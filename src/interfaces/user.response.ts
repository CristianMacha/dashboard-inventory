/** Minimal role shape returned inside the users list (UserPresentationDto) */
export interface UserRolePresentation {
  id: string;
  name: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description?: string;
}

/** Full role shape returned by GET /roles */
export interface RoleResponse {
  id: string;
  name: string;
  permissions: PermissionResponse[];
}

/** Shape returned by GET /users (UserPresentationDto) */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  roles: UserRolePresentation[];
}

export interface UserUpdate {
  name?: string;
  roleNames?: string[];
}
