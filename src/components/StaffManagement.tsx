import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSystem } from "@/contexts/SystemContext";
import { useActivityLogger } from "@/contexts/ActivityLogger";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Header } from "@/components/common/Header";
import { DataTable } from "@/components/common/DataTable";
import { PasswordResetDialog } from "@/components/common/PasswordResetDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useBusinessStaff,
  useStoreStaff,
  useBusinessStores,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  useResetUserPassword,
} from "@/utils/hooks/useStoreData";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Clock,
  Loader2,
  Search,
  Eye,
  Key,
  Users,
} from "lucide-react";

interface StaffManagementProps {
  onBack: () => void;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
}

interface Staff {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  store_id?: string;
  storeName?: string;
  is_active: boolean;
  role: "business_admin" | "store_admin" | "cashier";
  permissions?: string[];
  created_at: string;
  last_login?: string;
  totalSales?: number;
  transactionCount?: number;
}

interface Store {
  id: string;
  name: string;
  is_active?: boolean;
}

const ROLE_OPTIONS = [
  { value: "business_admin", label: "Business Admin", color: "bg-red-500" },
  { value: "store_admin", label: "Store Admin", color: "bg-blue-500" },
  { value: "cashier", label: "Cashier", color: "bg-green-500" },
];

const PERMISSION_OPTIONS = [
  { value: "pos", label: "Point of Sale" },
  { value: "products", label: "Product Management" },
  { value: "customers", label: "Customer Management" },
  { value: "reports", label: "Reports & Analytics" },
  { value: "settings", label: "Store Settings" },
  { value: "staff", label: "Staff Management" },
  { value: "inventory", label: "Inventory Control" },
  { value: "suppliers", label: "Supplier Management" },
];

// Move StaffForm outside to prevent recreation on every render
const StaffForm = ({
  staffMember,
  onChange,
  onSave,
  onCancel,
  stores,
  isSaving,
}: {
  staffMember: Partial<Staff> | Staff;
  onChange: (staffMember: Partial<Staff>) => void;
  onSave: () => void;
  onCancel: () => void;
  stores: Store[];
  isSaving: boolean;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={staffMember.name || ""}
          onChange={(e) => onChange({ ...staffMember, name: e.target.value })}
          placeholder="Enter full name"
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={staffMember.username || ""}
          onChange={(e) =>
            onChange({ ...staffMember, username: e.target.value })
          }
          placeholder="Enter username"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={staffMember.email || ""}
          onChange={(e) => onChange({ ...staffMember, email: e.target.value })}
          placeholder="Enter email address"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          value={staffMember.phone || ""}
          onChange={(e) => onChange({ ...staffMember, phone: e.target.value })}
          placeholder="Enter phone number (optional)"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          value={staffMember.role || "cashier"}
          onValueChange={(value) =>
            onChange({ ...staffMember, role: value as "business_admin" | "store_admin" | "cashier" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role">
              {staffMember.role ? 
                ROLE_OPTIONS.find(r => r.value === staffMember.role)?.label || "Unknown Role"
                : "Select role"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="store">Assigned Store</Label>
        <Select
          value={staffMember.store_id || ""}
          onValueChange={(value) =>
            onChange({ ...staffMember, store_id: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select store">
              {staffMember.store_id ? 
                stores.find(s => s.id === staffMember.store_id)?.name || "Unknown Store" 
                : "Select store"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {stores
              .filter((s) => s.is_active)
              .map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label>Permissions</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {PERMISSION_OPTIONS.map((permission) => (
          <div key={permission.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={permission.value}
              checked={
                staffMember.permissions?.includes(permission.value) || false
              }
              onChange={(e) => {
                const permissions = e.target.checked
                  ? [...(staffMember.permissions || []), permission.value]
                  : (staffMember.permissions || []).filter(
                      (p) => p !== permission.value
                    );
                onChange({ ...staffMember, permissions });
              }}
            />
            <Label htmlFor={permission.value} className="text-sm">
              {permission.label}
            </Label>
          </div>
        ))}
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Switch
        id="active"
        checked={staffMember.is_active}
        onCheckedChange={(checked) =>
          onChange({ ...staffMember, is_active: checked })
        }
      />
      <Label htmlFor="active">Active Staff Member</Label>
    </div>

    <div className="flex gap-2 justify-end pt-4 border-t">
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        onClick={onSave}
        disabled={isSaving || !staffMember.name || !staffMember.username}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Staff Member"
        )}
      </Button>
    </div>
  </div>
);

export const StaffManagement: React.FC<StaffManagementProps> = ({
  onBack,
}) => {
  const router = useRouter();
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { logActivity } = useActivityLogger();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState(
    user?.role === 'store_admin' ? currentStore?.id || "" : "All"
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  
  // Password reset state
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [staffForPasswordReset, setStaffForPasswordReset] = useState<Staff | null>(null);
  
  // Credentials modal state
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);
  
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    name: "",
    username: "",
    email: "",
    phone: "",
    store_id: currentStore?.id || "",
    is_active: true,
    role: "cashier",
    permissions: ["pos"],
  });

  // React Query hooks - use appropriate hook based on user role
  const {
    data: businessStaff = [],
    isLoading: isLoadingBusinessStaff,
    error: businessStaffError,
  } = useBusinessStaff(currentBusiness?.id || "", {
    enabled: !!currentBusiness?.id && user?.role === 'business_admin',
  });

  const {
    data: storeStaff = [],
    isLoading: isLoadingStoreStaff,
    error: storeStaffError,
  } = useStoreStaff(currentStore?.id || "", {
    enabled: !!currentStore?.id && user?.role === 'store_admin',
  });

  // Combine staff data based on user role
  const dbStaff = user?.role === 'business_admin' ? businessStaff : storeStaff;
  const isLoadingStaff = user?.role === 'business_admin' ? isLoadingBusinessStaff : isLoadingStoreStaff;
  const staffError = user?.role === 'business_admin' ? businessStaffError : storeStaffError;
  const {
    data: stores = [],
    isLoading: isLoadingStores,
  } = useBusinessStores(currentBusiness?.id || "", {
    enabled: !!currentBusiness?.id,
  });

  // React Query mutations
  const createStaffMutation = useCreateStaff(currentBusiness?.id || "", currentStore?.id);
  const updateStaffMutation = useUpdateStaff(currentBusiness?.id || "", currentStore?.id);
  const deleteStaffMutation = useDeleteStaff(currentBusiness?.id || "", currentStore?.id);
  const resetUserPasswordMutation = useResetUserPassword();

  // Loading states
  const isLoading = isLoadingStaff || isLoadingStores;
  const isSaving =
    createStaffMutation.isPending ||
    updateStaffMutation.isPending ||
    deleteStaffMutation.isPending ||
    resetUserPasswordMutation.isPending;

  // Reset newStaff when store changes
  useEffect(() => {
    setNewStaff((prev) => ({
      ...prev,
      store_id: currentStore?.id || "",
    }));
  }, [currentStore?.id]);

  // Update store filter when user role or current store changes
  useEffect(() => {
    if (user?.role === 'store_admin' && currentStore?.id) {
      setSelectedStoreFilter(currentStore.id);
    } else if (user?.role === 'business_admin') {
      setSelectedStoreFilter("All");
    }
  }, [user?.role, currentStore?.id]);

  // Staff data is already filtered by role - no additional filtering needed
  const accessibleStaff = useMemo(() => {
    console.log('StaffManagement Debug - dbStaff:', dbStaff);
    return dbStaff;
  }, [dbStaff]);

  const filteredStaff = useMemo(() => {
    return accessibleStaff.filter((staff: Staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.username &&
          staff.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // For store admin users, all staff are from their store, so no store filtering needed
      // For business admin users, apply store filter if selected
      const matchesStore = user?.role === 'store_admin' || 
        selectedStoreFilter === "All" || 
        staff.store_id === selectedStoreFilter;
      
      return matchesSearch && matchesStore;
    });
  }, [accessibleStaff, searchTerm, selectedStoreFilter, user?.role]);

  // Statistics
  const totalStaff = useMemo(() => filteredStaff.length, [filteredStaff]);
  const activeStaff = useMemo(
    () => filteredStaff.filter((s: Staff) => s.is_active).length,
    [filteredStaff]
  );
  const totalSales = useMemo(
    () => filteredStaff.reduce((sum: number, s: Staff) => sum + (s.totalSales || 0), 0),
    [filteredStaff]
  );
  const avgPerformance = useMemo(
    () => (totalStaff > 0 ? totalSales / totalStaff : 0),
    [totalStaff, totalSales]
  );

  const handleAddStaff = useCallback(async () => {
    if (!currentBusiness?.id || !newStaff.name || !newStaff.username || !newStaff.email) {
      toast.error('Please fill in all required fields (Name, Username, and Email)');
      return;
    }

    try {
      const staffData = {
        name: newStaff.name!,
        username: newStaff.username!,
        email: newStaff.email!,
        phone: newStaff.phone || "",
        role: newStaff.role || "cashier",
        store_id: newStaff.store_id,
        permissions: newStaff.permissions || ["pos"],
        is_active: newStaff.is_active !== false,
      };

      const result = await createStaffMutation.mutateAsync(staffData);

      // Show credentials modal with the returned default password
      setGeneratedCredentials({
        username: newStaff.username!,
        password: result.default_password || '123456' // Fallback if not returned
      });
      setIsCredentialsModalOpen(true);

      // Reset form
      setNewStaff({
        name: "",
        username: "",
        email: "",
        phone: "",
        store_id: currentStore?.id || "",
        is_active: true,
        role: "cashier",
        permissions: ["pos"],
      });
      setIsAddDialogOpen(false);

      // The staff data will be automatically refreshed via React Query
    } catch (error: unknown) {
      console.error("Error adding staff member:", error);
      // Error handling is done in the mutation
    }
  }, [newStaff, currentBusiness, currentStore, createStaffMutation]);

  const handleEditStaff = useCallback(async () => {
    if (!selectedStaff || !selectedStaff.id || !currentBusiness?.id) {
      return;
    }

    try {
      await updateStaffMutation.mutateAsync({ staffId: selectedStaff.id, staffData: selectedStaff });

      setIsEditDialogOpen(false);
      setSelectedStaff(null);

      // Data will be automatically refreshed via React Query invalidation
    } catch (error: unknown) {
      console.error("Error updating staff member:", error);
      toast.error("Failed to update staff member");
    }
  }, [selectedStaff, currentBusiness, updateStaffMutation]);

  const handleDeleteStaff = useCallback(
    async (staff: Staff) => {
      if (!currentBusiness?.id) return;

      try {
        await deleteStaffMutation.mutateAsync(staff.id);

        // Data will be automatically refreshed via React Query invalidation
      } catch (error: unknown) {
        console.error("Error deleting staff member:", error);
        // Error handling is done in the mutation
      }
    },
    [currentBusiness, deleteStaffMutation]
  );

  const toggleStaffStatus = useCallback(
    async (id: string) => {
      if (!id || !currentBusiness?.id) {
        console.error("Invalid staff ID or business ID:", {
          id,
          businessId: currentBusiness?.id,
        });
        return;
      }

      const staff = dbStaff.find((s: Staff) => s.id === id);
      if (!staff) {
        console.error("Staff not found with ID:", id);
        return;
      }

      try {
        const updatedStaff = { ...staff, is_active: !staff.is_active };
        await updateStaffMutation.mutateAsync({
          staffId: id,
          staffData: updatedStaff
        });
      } catch (error: unknown) {
        console.error("Error toggling staff status:", error);
        toast.error("Failed to update staff status");
      }
    },
    [dbStaff, currentBusiness, updateStaffMutation]
  );

  const openEditDialog = useCallback((staffMember: Staff) => {
    setSelectedStaff({ ...staffMember }); // Create a copy to avoid reference issues
    setIsEditDialogOpen(true);
  }, []);

  const openAddDialog = useCallback(() => {
    setNewStaff({
      name: "",
      username: "",
      email: "",
      phone: "",
      store_id: currentStore?.id || "",
      is_active: true,
      role: "cashier",
      permissions: ["pos"],
    });
    setIsAddDialogOpen(true);
  }, [currentStore?.id]);

  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setNewStaff({
      name: "",
      username: "",
      email: "",
      phone: "",
      store_id: currentStore?.id || "",
      is_active: true,
      role: "cashier",
      permissions: ["pos"],
    });
  }, [currentStore?.id]);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedStaff(null);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Memoized change handlers to prevent unnecessary re-renders
  const handleNewStaffChange = useCallback((updatedStaff: Partial<Staff>) => {
    setNewStaff(updatedStaff);
  }, []);

  const handleSelectedStaffChange = useCallback((updatedStaff: Partial<Staff>) => {
    setSelectedStaff(updatedStaff as Staff);
  }, []);

  // Password reset functions
  const handlePasswordReset = useCallback((staffMember: Partial<Staff>) => {
    setStaffForPasswordReset(staffMember as Staff);
    setIsPasswordResetDialogOpen(true);
  }, []);

  const resetStaffPassword = useCallback(async (newPassword: string) => {
    if (!staffForPasswordReset) {
      throw new Error('No staff member selected for password reset');
    }

    try {
      // Use the password reset mutation hook
      await resetUserPasswordMutation.mutateAsync({
        userId: staffForPasswordReset.id,
        newPassword: newPassword
      });
      
      // Log the activity
      logActivity('user_update', 'staff', `Password reset for staff member "${staffForPasswordReset.name}"`, {
        staff_id: staffForPasswordReset.id,
        staff_name: staffForPasswordReset.name,
        business_id: currentBusiness?.id || "",
        user_id: user?.id || ""
      });
      
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      throw error; // Re-throw to let the component handle it
    }
  }, [staffForPasswordReset, resetUserPasswordMutation, currentBusiness, user, logActivity]);

  const closePasswordResetDialog = useCallback(() => {
    setIsPasswordResetDialogOpen(false);
    setStaffForPasswordReset(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading staff...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Staff Management"
        subtitle={`Manage staff members${
          currentStore ? ` for ${currentStore.name}` : ""
        }`}
        showBackButton
        onBack={onBack}
        showLogout={false}
      >
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {staffError && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">
                {staffError.message || "Failed to load staff data"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      totalStaff
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalStaff - activeStaff} inactive
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      activeStaff
                    )}
                  </p>
                  <p className="text-sm text-green-600">Currently active</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      formatCurrency(totalSales)
                    )}
                  </p>
                  <p className="text-sm text-blue-600">Across all staff</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Performance
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      formatCurrency(avgPerformance)
                    )}
                  </p>
                  <p className="text-sm text-orange-600">Per staff member</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1 w-full min-w-0 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search staff by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <div className="flex gap-2 sm:gap-4">
                {user?.role === "business_admin" && stores.length > 1 && (
                  <Select
                    value={selectedStoreFilter}
                    onValueChange={setSelectedStoreFilter}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Stores</SelectItem>
                      {stores
                        .filter((s: Store) => s.is_active)
                        .map((store: Store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff DataTable */}
        <DataTable
          title={`Staff Members (${filteredStaff.length})`}
          data={filteredStaff}
          columns={[
            {
              key: "staff",
              label: "Staff Member",
              render: (staff: Staff) => (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {staff.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{staff.username}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "store",
              label: "Store",
              render: (staff: Staff) => (
                <div>
                  <p className="font-medium">
                    {staff.storeName || "Not assigned"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {staff.store_id ? `ID: ${staff.store_id}` : "No store assigned"}
                  </p>
                </div>
              ),
            },
            {
              key: "contact",
              label: "Contact",
              render: (staff: Staff) => (
                <div>
                  <p className="text-sm font-medium">
                    {staff.phone || "No phone"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {staff.email}
                  </p>
                </div>
              ),
            },
            {
              key: "role",
              label: "Role",
              render: (staff: Staff) => (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${
                      ROLE_OPTIONS.find((r) => r.value === staff.role)?.color ||
                      "bg-gray-500"
                    } text-white`}
                  >
                    {ROLE_OPTIONS.find((r) => r.value === staff.role)?.label ||
                      staff.role}
                  </Badge>
                </div>
              ),
            },
            {
              key: "performance",
              label: "Performance",
              render: (staff: Staff) => (
                <div className="text-sm">
                  <p className="font-medium">
                    {formatCurrency(staff.totalSales || 0)}
                  </p>
                  <p className="text-muted-foreground">
                    {staff.transactionCount || 0} transactions
                  </p>
                </div>
              ),
            },
            {
              key: "permissions",
              label: "Permissions",
              render: (staff: Staff) => (
                <div className="flex flex-wrap gap-1">
                  {(staff.permissions || ["pos"]).map((permission) => (
                    <Badge
                      key={permission}
                      variant="secondary"
                      className="text-xs"
                    >
                      {permission.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (staff: Staff) => (
                <div className="flex items-center gap-2">
                  {staff.id ? (
                    <Switch
                      checked={staff.is_active}
                      onCheckedChange={() => toggleStaffStatus(staff.id)}
                      disabled={isSaving || !canEdit("user")}
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                  )}
                  <Badge variant={staff.is_active ? "default" : "secondary"}>
                    {staff.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ),
            },
            {
              key: "created",
              label: "Created",
              render: (staff: Staff) => (
                <div>
                  <p className="text-sm">
                    {new Date(staff.created_at).toLocaleDateString()}
                  </p>
                  {staff.last_login && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last login:{" "}
                      {new Date(staff.last_login).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (staff: Staff) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { 
                      router.push(`/staff/${staff.id}`);
                    }}
                    disabled={!staff.store_id}
                    title={
                      !staff.store_id
                        ? "Staff not assigned to store"
                        : "View details"
                    }
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(staff)}
                    disabled={!canEdit("staff")}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handlePasswordReset(staff)}
                    disabled={!canEdit("staff")}
                    title="Reset Password"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <Key className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isSaving || !canDelete("user")}
                    onClick={() => {
                      setStaffToDelete(staff);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ),
            },
          ]}
          searchable={false}
          tableName="staff"
          userRole={user?.role}
          pagination={{
            enabled: true,
            pageSize: 20,
            showPageSizeSelector: true,
            showPageInfo: true,
          }}
          emptyMessage={
            <div className="text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No staff members found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          }
          actions={
            <Button 
              onClick={openAddDialog}
              disabled={!canCreate("user")}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          }
        />

        {/* Edit Staff Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update staff member information, role, and permissions.
              </DialogDescription>
            </DialogHeader>
            {selectedStaff && (
              <StaffForm
                staffMember={selectedStaff}
                onChange={handleSelectedStaffChange}
                onSave={handleEditStaff}
                onCancel={closeEditDialog}
                stores={stores}
                isSaving={isSaving}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Staff Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff account and assign to a store.
              </DialogDescription>
            </DialogHeader>
            <StaffForm
              staffMember={newStaff}
              onChange={handleNewStaffChange}
              onSave={handleAddStaff}
              onCancel={closeAddDialog}
              stores={stores}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>

        {/* Staff Credentials Modal */}
        <Dialog open={isCredentialsModalOpen} onOpenChange={setIsCredentialsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Staff Account Created Successfully!</DialogTitle>
              <DialogDescription>
                Please save these credentials securely. The staff member should change their password on first login.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Username:</span>
                    <span className="font-mono text-sm">{generatedCredentials?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Default Password:</span>
                    <span className="font-mono text-sm bg-background px-2 py-1 rounded border">{generatedCredentials?.password}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>🔐 <strong>Security Note:</strong> This is the default password &quot;123456&quot;.</p>
                <p>⚠️ <strong>Important:</strong> Share these credentials securely with the staff member.</p>
                <p>🔄 <strong>First Login:</strong> They should change their password immediately.</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCredentialsModalOpen(false)}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (staffToDelete) {
                    handleDeleteStaff(staffToDelete);
                    setIsDeleteDialogOpen(false);
                    setStaffToDelete(null);
                  }
                }}
                disabled={isSaving || !canDelete("user")}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Staff Member"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Password Reset Dialog */}
        <PasswordResetDialog
          isOpen={isPasswordResetDialogOpen}
          onClose={closePasswordResetDialog}
          userName={staffForPasswordReset?.name || ''}
          onResetPassword={resetStaffPassword}
          title="Reset Staff Password"
          description={`Reset password for ${staffForPasswordReset?.name}`}
          buttonText="Reset Password"
        />
      </main>
    </div>
  );
};
