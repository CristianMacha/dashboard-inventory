import { Navigate, useParams, useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProduct } from "@/admin/hooks/useProduct";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { createProductAction } from "@/admin/actions/create-product.action";
import { updateProductAction } from "@/admin/actions/update-product.action";
import { getActiveCategoriesAction } from "@/admin/actions/get-active-categories.action";
import { getActiveBrandsAction } from "@/admin/actions/get-active-brands.action";
import { getActiveLevelsAction } from "@/admin/actions/get-active-levels.action";
import { getActiveFinishesAction } from "@/admin/actions/get-active-finishes.action";
import {
  productKeys,
  categoryKeys,
  brandKeys,
  levelKeys,
  finishKeys,
  summaryKeys,
} from "@/admin/queryKeys";
import type { ProductResponse } from "@/interfaces/product.response";
import type { BrandResponse } from "@/interfaces/brand.response";
import type { CategoryResponse } from "@/interfaces/category.response";
import type { LevelResponse } from "@/interfaces/level.response";
import type { FinishResponse } from "@/interfaces/finish.response";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  levelId: z.string().min(1, "Level is required"),
  finishId: z.string().min(1, "Finish is required"),
  brandId: z.string().optional(),
  description: z.string().optional(),
  isOnline: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const emptyFormValues: FormValues = {
  name: "",
  categoryId: "",
  levelId: "",
  finishId: "",
  brandId: "",
  description: "",
  isOnline: true,
};

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
function productToFormValues(p: ProductResponse): FormValues {
  return {
    name: p.name,
    categoryId: p.category?.id ?? "",
    brandId: p.brand?.id ?? "",
    levelId: p.level?.id ?? "",
    finishId: p.finish?.id ?? "",
    description: p.description ?? "",
    isOnline: p.isOnline,
  };
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

// ---------------------------------------------------------------------------
// Wrapper: loads data, shows loading, then renders the form
// ---------------------------------------------------------------------------
export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== "new");

  const { data: product, isLoading: isLoadingProduct, isError } = useProduct(
    id || "",
  );

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.active,
    queryFn: getActiveCategoriesAction,
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: brandKeys.active,
    queryFn: getActiveBrandsAction,
  });

  const { data: levels = [], isLoading: isLoadingLevels } = useQuery({
    queryKey: levelKeys.active,
    queryFn: getActiveLevelsAction,
  });

  const { data: finishes = [], isLoading: isLoadingFinishes } = useQuery({
    queryKey: finishKeys.active,
    queryFn: getActiveFinishesAction,
  });

  if (isEditing && isError) {
    return <Navigate to="/products" replace />;
  }

  const isLoading =
    (isEditing && isLoadingProduct) ||
    isLoadingCategories ||
    isLoadingBrands ||
    isLoadingLevels ||
    isLoadingFinishes;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      product={isEditing ? product ?? null : null}
      brands={brands}
      categories={categories}
      levels={levels}
      finishes={finishes}
    />
  );
};

// ---------------------------------------------------------------------------
// Form: receives ALL data via props, initializes form with correct defaults
// ---------------------------------------------------------------------------
interface ProductFormProps {
  product: ProductResponse | null;
  brands: BrandResponse[];
  categories: CategoryResponse[];
  levels: LevelResponse[];
  finishes: FinishResponse[];
}

const ProductForm = ({
  product,
  brands,
  categories,
  levels,
  finishes,
}: ProductFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product ? productToFormValues(product) : emptyFormValues,
  });

  const { control, handleSubmit } = form;

  const createMutation = useMutation({
    mutationFn: createProductAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({ queryKey: summaryKeys.all });
      toast.success("Product created successfully");
      void navigate("/products");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormValues }) =>
      updateProductAction(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      if (product) {
        void queryClient.invalidateQueries({
          queryKey: productKeys.detail(product.id),
        });
      }
      toast.success("Product updated successfully");
      void navigate("/products");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (isEditing && product) {
      updateMutation.mutate({ id: product.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/products">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isEditing ? "Edit Product" : "New Product"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0 justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Edit the product details" : "Create a new product"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/products">
                <ArrowLeftIcon />
                Back to Products
              </Link>
            </Button>
            <Button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form
            id="product-form"
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input
                        id="name"
                        aria-invalid={fieldState.invalid}
                        {...field}
                        placeholder="Product name"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="brandId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="brandId">Brand</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        name={field.name}
                      >
                        <SelectTrigger
                          id="brandId"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        name={field.name}
                      >
                        <SelectTrigger
                          id="categoryId"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="levelId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="levelId">Level</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        name={field.name}
                      >
                        <SelectTrigger
                          id="levelId"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="finishId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="finishId">Finish</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        name={field.name}
                      >
                        <SelectTrigger
                          id="finishId"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select finish" />
                        </SelectTrigger>
                        <SelectContent>
                          {finishes.map((finish) => (
                            <SelectItem key={finish.id} value={finish.id}>
                              {finish.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea
                        id="description"
                        aria-invalid={fieldState.invalid}
                        {...field}
                        placeholder="Product description"
                        className="min-h-[100px] resize-y"
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="isOnline"
                  render={({ field }) => (
                    <Field className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isOnline"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel htmlFor="isOnline" className="mb-0 cursor-pointer">
                          Show in online catalog
                        </FieldLabel>
                      </div>
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
