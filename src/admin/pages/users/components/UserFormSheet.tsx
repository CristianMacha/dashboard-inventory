import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

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

import { updateUserAction } from "@/admin/actions/update-user.action";
import { getRolesAction } from "@/admin/actions/get-roles.action";
import { userKeys, roleKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { UserResponse } from "@/interfaces/user.response";

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roleNames: z.array(z.string()),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: UserResponse | null;
}

export const UserFormSheet = ({
  open,
  onOpenChange,
  editingUser,
}: UserFormSheetProps) => {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: roleKeys.all,
    queryFn: getRolesAction,
    enabled: open,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: "", roleNames: [] },
  });

  const { reset } = form;

  useEffect(() => {
    if (open && editingUser) {
      reset({
        name: editingUser.name,
        roleNames: editingUser.roles.map((r) => r.name),
      });
    }
  }, [open, editingUser, reset]);

  const handleClose = () => onOpenChange(false);

  const updateMutation = useMutation({
    mutationFn: (values: UserFormValues) =>
      updateUserAction(editingUser!.id, {
        name: values.name,
        roleNames: values.roleNames,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User updated successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update user"));
    },
  });

  const isSubmitting = updateMutation.isPending;

  const onSubmit = (values: UserFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>Update the user&apos;s name and assigned roles.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Read-only email */}
          {editingUser && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">{editingUser.email}</span>
            </div>
          )}

          <form
            id="user-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="user-name">Name</FieldLabel>
                    <Input
                      id="user-name"
                      {...field}
                      placeholder="Full name"
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
                  Roles
                </div>
              </FieldSeparator>

              <Controller
                control={form.control}
                name="roleNames"
                render={({ field }) => (
                  <Field>
                    {rolesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="size-4 animate-spin" />
                        Loading roles…
                      </div>
                    ) : roles.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No roles available.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {roles.map((role) => {
                          const checked = field.value.includes(role.name);
                          return (
                            <label
                              key={role.id}
                              className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(val) => {
                                  if (val) {
                                    field.onChange([...field.value, role.name]);
                                  } else {
                                    field.onChange(
                                      field.value.filter((n) => n !== role.name),
                                    );
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium leading-none">
                                  {role.name}
                                </p>
                                {role.permissions.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {role.permissions.slice(0, 4).map((p) => p.description ?? p.name).join(", ")}
                                    {role.permissions.length > 4 && ` +${role.permissions.length - 4} more`}
                                  </p>
                                )}
                              </div>
                            </label>
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
          <Button type="submit" form="user-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
