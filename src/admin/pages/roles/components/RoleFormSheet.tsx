import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

import { createRoleAction } from "@/admin/actions/create-role.action";
import { updateRoleAction } from "@/admin/actions/update-role.action";
import { getPermissionsAction } from "@/admin/actions/get-permissions.action";
import { roleKeys, permissionKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { RoleResponse, PermissionResponse } from "@/interfaces/user.response";

const roleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissionNames: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: RoleResponse | null;
}

/** Group permissions by the module prefix (e.g. "users" from "users.read") */
function groupByModule(permissions: PermissionResponse[]) {
  const groups: Record<string, PermissionResponse[]> = {};
  for (const p of permissions) {
    const module = p.name.split(".")[0] ?? "other";
    (groups[module] ??= []).push(p);
  }
  return groups;
}

export const RoleFormSheet = ({
  open,
  onOpenChange,
  editingRole,
}: RoleFormSheetProps) => {
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: permissionKeys.all,
    queryFn: getPermissionsAction,
    enabled: open,
  });

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "", permissionNames: [] },
  });

  const { reset } = form;

  useEffect(() => {
    if (!open) return;
    if (editingRole) {
      reset({
        name: editingRole.name,
        permissionNames: editingRole.permissions.map((p) => p.name),
      });
    } else {
      reset({ name: "", permissionNames: [] });
    }
  }, [open, editingRole, reset]);

  const isEditing = !!editingRole;
  const handleClose = () => onOpenChange(false);

  const createMutation = useMutation({
    mutationFn: (values: RoleFormValues) =>
      createRoleAction({ name: values.name, permissions: values.permissionNames }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create role"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: RoleFormValues) =>
      updateRoleAction(editingRole!.id, {
        name: values.name,
        permissions: values.permissionNames,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role updated successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update role"));
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: RoleFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const grouped = groupByModule(permissions);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Role" : "New Role"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the role name and its permissions."
              : "Create a new role and assign permissions."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="role-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="role-name">Name</FieldLabel>
                    <Input
                      id="role-name"
                      {...field}
                      placeholder="Role name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <FieldSeparator>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Permissions
                </div>
              </FieldSeparator>

              <Controller
                control={form.control}
                name="permissionNames"
                render={({ field }) => (
                  <Field>
                    {permissionsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="size-4 animate-spin" />
                        Loading permissions…
                      </div>
                    ) : permissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No permissions available.</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(grouped).map(([module, perms]) => {
                          const allChecked = perms.every((p) =>
                            field.value.includes(p.name),
                          );
                          const someChecked = perms.some((p) =>
                            field.value.includes(p.name),
                          );
                          return (
                            <div key={module} className="rounded-lg border overflow-hidden">
                              {/* Module header with select-all */}
                              <label className="flex items-center gap-3 px-3 py-2 bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                                <Checkbox
                                  checked={allChecked}
                                  data-state={someChecked && !allChecked ? "indeterminate" : undefined}
                                  onCheckedChange={(val) => {
                                    const names = perms.map((p) => p.name);
                                    if (val) {
                                      field.onChange([
                                        ...field.value.filter((n) => !names.includes(n)),
                                        ...names,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter((n) => !names.includes(n)),
                                      );
                                    }
                                  }}
                                />
                                <span className="text-sm font-semibold capitalize">{module}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {perms.filter((p) => field.value.includes(p.name)).length}/{perms.length}
                                </span>
                              </label>
                              {/* Individual permissions */}
                              <div className="divide-y">
                                {perms.map((perm) => {
                                  const checked = field.value.includes(perm.name);
                                  return (
                                    <label
                                      key={perm.id}
                                      className="flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
                                    >
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(val) => {
                                          if (val) {
                                            field.onChange([...field.value, perm.name]);
                                          } else {
                                            field.onChange(
                                              field.value.filter((n) => n !== perm.name),
                                            );
                                          }
                                        }}
                                        className="mt-0.5"
                                      />
                                      <div className="min-w-0">
                                        <p className="text-sm leading-none">
                                          {perm.description ?? perm.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                          {perm.name}
                                        </p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter className="flex-row justify-end border-t">
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Create Role"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
