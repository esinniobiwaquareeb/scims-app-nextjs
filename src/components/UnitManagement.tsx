'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Ruler, Loader2, RefreshCw, Search } from 'lucide-react';
import {
  useBusinessUnits,
  useCreateBusinessUnit,
  useUpdateBusinessUnit,
  useDeleteBusinessUnit,
  type Unit,
  type UnitFormData,
} from '@/utils/hooks/units';

export const UnitManagement: React.FC = () => {
  const { user, currentBusiness } = useAuth();
  const { translate } = useSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const [newUnit, setNewUnit] = useState<Partial<UnitFormData>>({
    name: '',
    symbol: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  // React Query hooks
  const {
    data: units = [],
    isLoading: isLoadingUnits,
    error: unitsError,
    refetch: refetchUnits,
  } = useBusinessUnits(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id,
  });

  // React Query mutations
  const createUnitMutation = useCreateBusinessUnit(currentBusiness?.id || '');
  const updateUnitMutation = useUpdateBusinessUnit(currentBusiness?.id || '');
  const deleteUnitMutation = useDeleteBusinessUnit(currentBusiness?.id || '');

  // Loading states
  const isLoading = isLoadingUnits;
  const isSaving = createUnitMutation.isPending || updateUnitMutation.isPending || deleteUnitMutation.isPending;

  // Filtered units based on search
  const filteredUnits = useMemo(() => {
    return units.filter((unit: Unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  // Statistics
  const activeUnits = useMemo(() =>
    units.filter((unit: Unit) => unit.is_active).length,
    [units]
  );

  const totalProductsUsingUnits = useMemo(() =>
    units.reduce((sum: number, unit: Unit) => sum + (unit.product_count || 0), 0),
    [units]
  );

  // Handlers
  const handleAddUnit = useCallback(async () => {
    if (!currentBusiness?.id) {
      toast.error('Business context is missing');
      return;
    }

    if (!newUnit.name || !newUnit.name.trim()) {
      toast.error('Unit name is required');
      return;
    }

    if (newUnit.name.trim().length < 1) {
      toast.error('Unit name must be at least 1 character long');
      return;
    }

    if (newUnit.name.trim().length > 100) {
      toast.error('Unit name must be less than 100 characters');
      return;
    }

    try {
      const unitData: UnitFormData = {
        name: newUnit.name.trim(),
        symbol: newUnit.symbol?.trim() || null,
        description: newUnit.description?.trim() || null,
        business_id: currentBusiness.id,
        is_active: newUnit.is_active !== false,
        sort_order: newUnit.sort_order || 0,
      };

      await createUnitMutation.mutateAsync(unitData);

      // Reset form and close dialog
      setNewUnit({
        name: '',
        symbol: '',
        description: '',
        is_active: true,
        sort_order: 0,
      });
      setIsAddDialogOpen(false);
    } catch (error: unknown) {
      console.error('Error adding unit:', error);
    }
  }, [newUnit, currentBusiness, createUnitMutation]);

  const handleEditUnit = useCallback(async () => {
    if (!editingUnit || !currentBusiness?.id) {
      toast.error('Unit or business context is missing');
      return;
    }

    if (!editingUnit.name || !editingUnit.name.trim()) {
      toast.error('Unit name is required');
      return;
    }

    try {
      const updateData: Partial<UnitFormData> = {
        name: editingUnit.name.trim(),
        symbol: editingUnit.symbol?.trim() || null,
        description: editingUnit.description?.trim() || null,
        is_active: editingUnit.is_active,
        sort_order: editingUnit.sort_order || 0,
      };

      await updateUnitMutation.mutateAsync({
        unitId: editingUnit.id,
        unitData: updateData,
      });

      // Close dialog and reset editing state
      setEditingUnit(null);
      setIsEditDialogOpen(false);
    } catch (error: unknown) {
      console.error('Error updating unit:', error);
    }
  }, [editingUnit, currentBusiness, updateUnitMutation]);

  const handleDeleteUnit = useCallback(async () => {
    if (!unitToDelete || !currentBusiness?.id) return;

    try {
      await deleteUnitMutation.mutateAsync(unitToDelete.id);
      setUnitToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting unit:', error);
    }
  }, [unitToDelete, currentBusiness, deleteUnitMutation]);

  const handleRefresh = useCallback(async () => {
    try {
      await refetchUnits();
      toast.success('Units refreshed successfully');
    } catch (error) {
      console.error('Error refreshing units:', error);
      toast.error('Failed to refresh units');
    }
  }, [refetchUnits]);

  const columns = [
    {
      key: 'name',
      label: 'Unit Name',
      sortable: true,
      render: (unit: Unit) => (
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{unit.name}</span>
          {unit.symbol && (
            <Badge variant="outline" className="text-xs">
              {unit.symbol}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (unit: Unit) => (
        <span className="text-sm text-muted-foreground">
          {unit.description || '-'}
        </span>
      ),
    },
    {
      key: 'product_count',
      label: 'Products',
      render: (unit: Unit) => (
        <Badge variant="secondary">
          {unit.product_count || 0} product{(unit.product_count || 0) !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (unit: Unit) => (
        <Badge variant={unit.is_active ? 'default' : 'secondary'}>
          {unit.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'sort_order',
      label: 'Order',
      render: (unit: Unit) => unit.sort_order || 0,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (unit: Unit) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingUnit(unit);
              setIsEditDialogOpen(true);
            }}
            disabled={isSaving}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setUnitToDelete(unit)}
            disabled={isSaving || (unit.product_count || 0) > 0}
            title={(unit.product_count || 0) > 0 ? 'Cannot delete unit that is in use' : 'Delete unit'}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout
        title="Unit Management"
        subtitle="Loading units..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading units...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Unit Management"
      subtitle="Manage product units for your business"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="text-2xl font-semibold">{units.length}</p>
                </div>
                <Ruler className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Units</p>
                  <p className="text-2xl font-semibold text-green-600">{activeUnits}</p>
                </div>
                <Ruler className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products Using Units</p>
                  <p className="text-2xl font-semibold">{totalProductsUsingUnits}</p>
                </div>
                <Ruler className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {unitsError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800 text-sm">
                  {unitsError instanceof Error ? unitsError.message : 'Failed to load units'}
                </p>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search units..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Unit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Units</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Units"
              data={filteredUnits}
              columns={columns}
              searchable={false}
            />
          </CardContent>
        </Card>

        {/* Add Unit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Unit</DialogTitle>
              <DialogDescription>
                Add a new unit for your products (e.g., piece, packet, kg, liter)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Unit Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newUnit.name || ''}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  placeholder="e.g., Piece, Packet, Kilogram"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Symbol (Optional)</Label>
                <Input
                  value={newUnit.symbol || ''}
                  onChange={(e) => setNewUnit({ ...newUnit, symbol: e.target.value })}
                  placeholder="e.g., pcs, pkt, kg, L"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  Short symbol or abbreviation for this unit
                </p>
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={newUnit.description || ''}
                  onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                  placeholder="Describe when to use this unit"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={newUnit.sort_order || 0}
                    onChange={(e) => setNewUnit({ ...newUnit, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="add-is-active"
                    checked={newUnit.is_active !== false}
                    onCheckedChange={(checked) => setNewUnit({ ...newUnit, is_active: checked })}
                  />
                  <Label htmlFor="add-is-active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUnit} disabled={isSaving || !newUnit.name}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Unit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Unit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingUnit(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Unit</DialogTitle>
              <DialogDescription>
                Update unit details
              </DialogDescription>
            </DialogHeader>

            {editingUnit && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Unit Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={editingUnit.name}
                    onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                    placeholder="e.g., Piece, Packet, Kilogram"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Symbol (Optional)</Label>
                  <Input
                    value={editingUnit.symbol || ''}
                    onChange={(e) => setEditingUnit({ ...editingUnit, symbol: e.target.value })}
                    placeholder="e.g., pcs, pkt, kg, L"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={editingUnit.description || ''}
                    onChange={(e) => setEditingUnit({ ...editingUnit, description: e.target.value })}
                    placeholder="Describe when to use this unit"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={editingUnit.sort_order || 0}
                      onChange={(e) => setEditingUnit({ ...editingUnit, sort_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="edit-is-active"
                      checked={editingUnit.is_active}
                      onCheckedChange={(checked) => setEditingUnit({ ...editingUnit, is_active: checked })}
                    />
                    <Label htmlFor="edit-is-active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUnit(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditUnit} disabled={isSaving || !editingUnit.name}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Unit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Unit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{unitToDelete?.name}&quot;?{' '}
                {(unitToDelete?.product_count || 0) > 0 && (
                  <span className="font-semibold text-orange-600">
                    This unit is used by {unitToDelete?.product_count || 0} product(s). 
                    Deleting it may affect those products.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUnit}
                className="bg-red-600 hover:bg-red-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

