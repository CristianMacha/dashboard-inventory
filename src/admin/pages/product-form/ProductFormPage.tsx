import { useEffect } from "react";
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
import { CustomFullScreenLoading } from "@/components/ui/custom/CustomFullScreenLoading";
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

import { createProductAction } from "@/admin/actions/create-product.action";
import { updateProductAction } from "@/admin/actions/update-product.action";
import { getCategoriesAction } from "@/admin/actions/get-categories.action";
import { getBrandsAction } from "@/admin/actions/get-brands.action";
import { getLevelsAction } from "@/admin/actions/get-levels.action";
import { getFinishesAction } from "@/admin/actions/get-finishes.action";
import { productKeys, categoryKeys, brandKeys, levelKeys, finishKeys, summaryKeys } from "@/admin/queryKeys";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  levelId: z.string().min(1, "Level is required"),
  finishId: z.string().min(1, "Finish is required"),
  brandId: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultFormValues: FormValues = {
  name: "",
  categoryId: "",
  levelId: "",
  finishId: "",
  brandId: "",
  description: "",
};

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id && id !== "new");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const { control, handleSubmit, reset } = form;

  const { data: product, isLoading: isLoadingProduct, isError } = useProduct(
    id || "",
  );

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategoriesAction,
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: brandKeys.all,
    queryFn: getBrandsAction,
  });

  const { data: levels = [], isLoading: isLoadingLevels } = useQuery({
    queryKey: levelKeys.all,
    queryFn: getLevelsAction,
  });

  const { data: finishes = [], isLoading: isLoadingFinishes } = useQuery({
    queryKey: finishKeys.all,
    queryFn: getFinishesAction,
  });

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
    mutationFn: ({ id: productId, data }: { id: string; data: FormValues }) =>
      updateProductAction(productId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      if (id) {
        void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      }
      toast.success("Product updated successfully");
      void navigate("/products");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isEditing && product) {
      reset({
        name: product.name,
        categoryId: product.category?.id ?? "",
        levelId: product.levelId ?? "",
        finishId: product.finishId ?? "",
        brandId: product.brand?.id ?? "",
        description: product.description ?? "",
      });
    }
  }, [isEditing, product, reset]);

  if (isEditing && isError) {
    return <Navigate to="/products" replace />;
  }

  if (isEditing && isLoadingProduct) {
    return <CustomFullScreenLoading />;
  }

  const onSubmit = (values: FormValues) => {
    if (isEditing && id) {
      updateMutation.mutate({ id, data: values });
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
                        aria-invalid={fieldState.invalid}
                        {...field}
                        onValueChange={field.onChange}
                        disabled={isLoadingBrands}
                      >
                        <SelectTrigger id="brandId">
                          <SelectValue
                            placeholder={
                              isLoadingBrands
                                ? "Loading brands..."
                                : "Select brand"
                            }
                          />
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
                        aria-invalid={fieldState.invalid}
                        {...field}
                        onValueChange={field.onChange}
                        disabled={isLoadingCategories}
                      >
                        <SelectTrigger id="categoryId">
                          <SelectValue
                            placeholder={
                              isLoadingCategories
                                ? "Loading categories..."
                                : "Select category"
                            }
                          />
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
                        aria-invalid={fieldState.invalid}
                        {...field}
                        onValueChange={field.onChange}
                        disabled={isLoadingLevels}
                      >
                        <SelectTrigger id="levelId">
                          <SelectValue
                            placeholder={
                              isLoadingLevels
                                ? "Loading levels..."
                                : "Select level"
                            }
                          />
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
                        aria-invalid={fieldState.invalid}
                        {...field}
                        onValueChange={field.onChange}
                        disabled={isLoadingFinishes}
                      >
                        <SelectTrigger id="finishId">
                          <SelectValue
                            placeholder={
                              isLoadingFinishes
                                ? "Loading finishes..."
                                : "Select finish"
                            }
                          />
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
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
