import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogger } from "@/contexts/ActivityLogger";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Brand,
  BrandFormData,
  validateBrandForm,
} from "@/components/brand/BrandHelpers";
import {
  BRAND_TABLE_COLUMNS,
  INITIAL_BRAND_FORM_DATA,
  BRAND_FORM_FIELDS,
} from "@/components/brand/BrandConstants";
import {
  useBusinessBrands,
  useCreateBusinessBrand,
  useUpdateBusinessBrand,
  useDeleteBusinessBrand,
} from "@/utils/hooks/brands";

interface BrandManagementProps {
  onBack?: () => void; // Optional for backward compatibility
}

export const BrandManagement: React.FC<BrandManagementProps> = ({ onBack }) => {
  const { user, currentBusiness } = useAuth();
  const { logActivity } = useActivityLogger();

  // Dialog and form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(
    INITIAL_BRAND_FORM_DATA
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [logoFilter, setLogoFilter] = useState<
    "all" | "with-logo" | "without-logo"
  >("all");

  // Image upload state
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null);
  const [editingLogoPreview, setEditingLogoPreview] = useState<string | null>(
    null
  );

  // Use React Query hooks for data fetching with smart caching
  // Brands are always business-level entities
  const {
    data: brands = [],
    isLoading: brandsLoading,
  } = useBusinessBrands(currentBusiness?.id || "", {
    enabled: !!currentBusiness?.id,
  });

  // Use mutations for CRUD operations
  // Brands are always business-level entities
  const createBrandMutation = useCreateBusinessBrand(currentBusiness?.id || "");
  const updateBrandMutation = useUpdateBusinessBrand(currentBusiness?.id || "");
  const deleteBrandMutation = useDeleteBusinessBrand(currentBusiness?.id || "");

  // Combined loading state
  const isLoading = brandsLoading;

  // Combined mutation loading state
  const isMutating =
    createBrandMutation.isPending ||
    updateBrandMutation.isPending ||
    deleteBrandMutation.isPending;

  // Initialize form data with business_id when component mounts
  useEffect(() => {
    if (currentBusiness?.id) {
      setFormData((prev: BrandFormData) => ({
        ...prev,
        business_id: currentBusiness.id,
      }));
    }
  }, [currentBusiness?.id]);

  const resetForm = () => {
    setFormData({
      ...INITIAL_BRAND_FORM_DATA,
      business_id: currentBusiness?.id || "",
    });
    setSelectedBrand(null);
    setBrandToDelete(null);
    setSearchTerm(""); // Reset search when form is reset
    setSelectedLogoFile(null);
    setLogoPreview(null);
    setEditingLogoFile(null);
    setEditingLogoPreview(null);
  };

  // Logo upload function
  const uploadLogo = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file || !currentBusiness?.id) return null;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("storeId", currentBusiness.id); // Use business ID for brand logos
        formData.append("type", "brand");

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload logo");
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error("Logo upload error:", error);
        toast.error("Failed to upload logo. Please try again.");
        return null;
      }
    },
    [currentBusiness?.id]
  );

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
    setShowDeleteDialog(true);
  };

  const handleFormChange = (field: keyof BrandFormData, value: string) => {
    setFormData((prev: BrandFormData) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!currentBusiness?.id || !user?.id) return;

    const validationError = validateBrandForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      let logoUrl = formData.logo_url || "";

      // Upload logo if a new file is selected
      if (selectedLogoFile) {
        const uploadedUrl = await uploadLogo(selectedLogoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          // If logo upload fails, don't proceed with brand creation
          toast.error("Failed to upload logo. Please try again.");
          return;
        }
      }

      // Create brand data with uploaded logo URL
      const brandData = {
        ...formData,
        logo_url: logoUrl,
      };

      // Use the mutation hook - this will automatically invalidate cache on success
      const brand = await createBrandMutation.mutateAsync(brandData);

      // Close dialog and reset form on success
      setShowCreateDialog(false);
      resetForm();

      // Log activity
      if (brand) {
        logActivity(
          "brand_create",
          "Brand Management",
          `Created brand: ${brand.name}`,
          { brandId: brand.id }
        );
      }

      // Note: Cache invalidation is handled automatically by the mutation hook
      // The brands table will automatically refresh with the new data
    } catch (err: unknown) {
      console.error("Error creating brand:", err);
      // Don't close dialog on error - let user fix and retry
    }
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      logo_url: brand.logo_url || "",
      website: brand.website || "",
      contact_person: brand.contact_person || "",
      contact_email: brand.contact_email || "",
      contact_phone: brand.contact_phone || "",
      business_id: currentBusiness?.id || "",
    });
    setShowEditDialog(true);
    // Reset editing logo state
    setEditingLogoFile(null);
    setEditingLogoPreview(null);
  };

  const handleUpdate = async () => {
    if (!selectedBrand || !currentBusiness?.id || !user?.id) return;

    const validationError = validateBrandForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      let logoUrl = formData.logo_url || "";

      // Upload logo if a new file is selected
      if (editingLogoFile) {
        const uploadedUrl = await uploadLogo(editingLogoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          // If logo upload fails, don't proceed with brand update
          toast.error("Failed to upload logo. Please try again.");
          return;
        }
      }

      // Create brand data with uploaded logo URL
      const brandData = {
        ...formData,
        logo_url: logoUrl,
      };

      // Use the mutation hook - this will automatically invalidate cache on success
      const brand = await updateBrandMutation.mutateAsync({
        brandId: selectedBrand.id,
        brandData: brandData,
      });

      // Close dialog and reset form on success
      setShowEditDialog(false);
      resetForm();

      // Log activity
      if (brand) {
        logActivity(
          "brand_update",
          "Brand Management",
          `Updated brand: ${brand.name}`,
          { brandId: brand.id }
        );
      }

      // Note: Cache invalidation is handled automatically by the mutation hook
      // The brands table will automatically refresh with the updated data
    } catch (err: unknown) {
      console.error("Error updating brand:", err);
      // Don't close dialog on error - let user fix and retry
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete || !currentBusiness?.id || !user?.id) return;

    try {
      // Use the mutation hook - this will automatically invalidate cache on success
      await deleteBrandMutation.mutateAsync(brandToDelete.id);

      // Log activity
      logActivity(
        "brand_delete",
        "Brand Management",
        `Deleted brand: ${brandToDelete.name}`,
        { brandId: brandToDelete.id }
      );

      // Close dialog and reset state
      setShowDeleteDialog(false);
      setBrandToDelete(null);

      // Note: Cache invalidation is handled automatically by the mutation hook
      // The brands table will automatically refresh with the updated data
    } catch (err: unknown) {
      console.error("Error deleting brand:", err);
      // Don't close dialog on error - let user retry
    }
  };

  const enhancedColumns = [
    ...BRAND_TABLE_COLUMNS,
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (brand: Brand) => (
        <div className="flex items-center gap-2 flex-shrink-0 min-w-[100px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(brand)}
            disabled={isMutating}
            title={`Edit ${brand.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(brand)}
            className="text-destructive hover:text-destructive"
            disabled={isMutating || deleteBrandMutation.isPending}
            title={`Delete ${brand.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <DashboardLayout
        title="Brand Management"
        subtitle="Loading brands..."
      >
        <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading brands...</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
        title="Brand Management"
        subtitle={`Manage product brands for ${
          currentBusiness?.name || "your business"
        }`}
    >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Brands</p>
                  <p className="text-2xl font-semibold">{brands.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">B</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Brands with Logos
                  </p>
                  <p className="text-2xl font-semibold text-green-600">
                    {brands.filter((b: Brand) => b.logo_url).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">🎨</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brands DataTable */}
        <DataTable
          title="Brands"
          data={brands.filter((brand: Brand) => {
            if (logoFilter === "with-logo") return !!brand.logo_url;
            if (logoFilter === "without-logo") return !brand.logo_url;
            return true;
          })}
          columns={enhancedColumns}
          searchable={true}
          searchPlaceholder="Search brands..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          emptyMessage="No brands found for your business. Create your first brand to get started!"
          tableName="brands"
          userRole={user?.role}
          actions={
            <Button
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          }
        />

        {/* Create Brand Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Brand</DialogTitle>
              <DialogDescription>
                Add a new brand to your business with logo and details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Logo Upload Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Brand Logo</Label>

                {/* Current Logo Display */}
                {formData.logo_url && !logoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={formData.logo_url}
                      alt="Current brand logo"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => handleFormChange("logo_url", "")}
                      disabled={isMutating}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* New Logo Preview */}
                {logoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => {
                        setSelectedLogoFile(null);
                        setLogoPreview(null);
                      }}
                      disabled={isMutating}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* Logo Upload Input */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedLogoFile(file);
                          // Create preview
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setLogoPreview(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="flex-1"
                      disabled={isMutating}
                    />
                  </div>

                  {/* File Info */}
                  {selectedLogoFile && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>File: {selectedLogoFile.name}</p>
                      <p>
                        Size:{" "}
                        {(selectedLogoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <p>Type: {selectedLogoFile.type}</p>
                      <p className="text-blue-600">
                        Logo will be uploaded when you save the brand
                      </p>
                    </div>
                  )}

                  {/* Help Text */}
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Upload a logo to make your brand more recognizable.
                    Recommended size: 200x200px
                  </p>
                </div>
              </div>

              {/* Regular Form Fields */}
              {Object.entries(BRAND_FORM_FIELDS).map(
                ([field, config]: [
                  string,
                  { label: string; required: boolean; placeholder: string }
                ]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {config.label}
                      {config.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {field === "description" ? (
                      <Textarea
                        id={field}
                        value={formData[field as keyof BrandFormData]}
                        onChange={(e) =>
                          handleFormChange(
                            field as keyof BrandFormData,
                            e.target.value
                          )
                        }
                        placeholder={config.placeholder}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={field}
                        type={
                          field.includes("email")
                            ? "email"
                            : field.includes("website")
                            ? "url"
                            : "text"
                        }
                        value={formData[field as keyof BrandFormData]}
                        onChange={(e) =>
                          handleFormChange(
                            field as keyof BrandFormData,
                            e.target.value
                          )
                        }
                        placeholder={config.placeholder}
                        required={config.required}
                      />
                    )}
                  </div>
                )
              )}

              {/* Form Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={createBrandMutation.isPending || isMutating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Brand"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-4">
                {selectedBrand?.logo_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-100">
                    <img
                      src={selectedBrand.logo_url}
                      alt={selectedBrand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <DialogTitle>Edit Brand: {selectedBrand?.name}</DialogTitle>
                  <DialogDescription>
                    Update brand information and logo
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {/* Logo Upload Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Brand Logo</Label>

                {/* Current Logo Display */}
                {formData.logo_url && !editingLogoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={formData.logo_url}
                      alt="Current brand logo"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => handleFormChange("logo_url", "")}
                      disabled={isMutating}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* New Logo Preview */}
                {editingLogoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={editingLogoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => {
                        setEditingLogoFile(null);
                        setEditingLogoPreview(null);
                      }}
                      disabled={isMutating}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* Logo Upload Input */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditingLogoFile(file);
                          // Create preview
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setEditingLogoPreview(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="flex-1"
                      disabled={isMutating}
                    />
                  </div>

                  {/* File Info */}
                  {editingLogoFile && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>File: {editingLogoFile.name}</p>
                      <p>
                        Size:{" "}
                        {(editingLogoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <p>Type: {editingLogoFile.type}</p>
                      <p className="text-blue-600">
                        Logo will be uploaded when you save the brand
                      </p>
                    </div>
                  )}

                  {/* Help Text */}
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Upload a logo to make your brand more recognizable.
                    Recommended size: 200x200px
                  </p>
                </div>
              </div>

              {/* Regular Form Fields */}
              {Object.entries(BRAND_FORM_FIELDS).map(
                ([field, config]: [
                  string,
                  { label: string; required: boolean; placeholder: string }
                ]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {config.label}
                      {config.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {field === "description" ? (
                      <Textarea
                        id={field}
                        value={formData[field as keyof BrandFormData]}
                        onChange={(e) =>
                          handleFormChange(
                            field as keyof BrandFormData,
                            e.target.value
                          )
                        }
                        placeholder={config.placeholder}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={field}
                        type={
                          field.includes("email")
                            ? "email"
                            : field.includes("website")
                            ? "url"
                            : "text"
                        }
                        value={formData[field as keyof BrandFormData]}
                        onChange={(e) =>
                          handleFormChange(
                            field as keyof BrandFormData,
                            e.target.value
                          )
                        }
                        placeholder={config.placeholder}
                        required={config.required}
                      />
                    )}
                  </div>
                )
              )}

              {/* Form Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    resetForm();
                  }}
                  disabled={isMutating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Brand"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Brand</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{brandToDelete?.name}
                &quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowDeleteDialog(false);
                  setBrandToDelete(null);
                }}
                disabled={isMutating}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isMutating}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isMutating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </DashboardLayout>
  );
};
