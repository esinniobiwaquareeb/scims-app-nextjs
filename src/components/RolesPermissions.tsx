import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  Settings,
  Loader2,
  Search,
  Lock,
  Eye
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { usePermissions } from '@/contexts/PermissionsContext';

interface RolesPermissionsProps {
  onBack: () => void;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  business_id?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  business_id: string;
  store_id: string | null;
  assigned_at: string;
  is_active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  };
  role: {
    id: string;
    name: string;
    description: string;
  };
}

export const RolesPermissions: React.FC<RolesPermissionsProps> = ({ onBack }) => {
  const { user, currentBusiness } = useAuth();
  const { hasPermission } = usePermissions();
  const { logActivity } = useActivityLogger();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false);
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false);
  const [isViewPermissionsDialogOpen, setIsViewPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  
  // Helper function to check if user can edit a role
  const canEditRole = useCallback((role: Role) => {
    const isBusinessAdmin = user?.role === 'business_admin' || 
                           userRoles.some(ur => ur.role.name === 'business_admin' && ur.user_id === user?.id);
    
    // Business admins can edit all roles, others can only edit custom roles
    return isBusinessAdmin || !role.is_system_role;
  }, [user, userRoles]);

  const loadData = useCallback(async () => {
    if (!currentBusiness?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Load roles from API
      const rolesResponse = await fetch(`/api/roles?business_id=${currentBusiness.id}`);
      if (!rolesResponse.ok) throw new Error('Failed to load roles');
      const rolesData = await rolesResponse.json();
      setRoles(rolesData.roles || []);

      // Load user roles from API
      const userRolesResponse = await fetch(`/api/roles/user-roles?business_id=${currentBusiness.id}`);
      if (!userRolesResponse.ok) throw new Error('Failed to load user roles');
      const userRolesData = await userRolesResponse.json();
      setUserRoles(userRolesData.userRoles || []);

      // Load business-specific permissions from API
      const permissionsResponse = await fetch(`/api/permissions?business_id=${currentBusiness.id}`);
      if (!permissionsResponse.ok) throw new Error('Failed to load permissions');
      const permissionsData = await permissionsResponse.json();
      setPermissions(permissionsData.permissions || []);

    } catch (err: unknown) {
      console.error('Failed to load roles and permissions data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness?.id]);

  // Load data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group permissions by category for the modal
  const groupedPermissions = useMemo(() => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  }, [permissions]);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    let filtered = roles;
    
    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(role => 
        role.permissions.some(perm => {
          const permission = permissions.find(p => p.id === perm);
          return permission?.category === selectedCategory;
        })
      );
    }
    
    return filtered;
  }, [roles, searchTerm, selectedCategory, permissions]);

  const openEditDialog = (role: Role) => {
    // Check if user can edit this role
    if (!canEditRole(role)) {
      toast.error('Only business admins can edit system roles');
      return;
    }
    
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsEditRoleDialogOpen(true);
  };

  const openViewPermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    setIsViewPermissionsDialogOpen(true);
  };

  const handleAddRole = async () => {
    if (!currentBusiness?.id || !newRole.name.trim()) return;

    try {
      setIsSaving(true);
      
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: currentBusiness.id,
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create role');
      }
      
      toast.success('Role created successfully');
      setIsAddRoleDialogOpen(false);
      setNewRole({ name: '', description: '', permissions: [] });
      loadData();
      
      logActivity('user_create', 'roles', `Role "${newRole.name}" created`, {
        role_name: newRole.name,
        permissions: newRole.permissions.join(', ')
      });
    } catch (err: unknown) {
      console.error('Failed to create role:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!currentBusiness?.id || !selectedRole || !newRole.name.trim()) return;

    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: currentBusiness.id,
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }
      
      toast.success('Role updated successfully');
      setIsEditRoleDialogOpen(false);
      setSelectedRole(null);
      setNewRole({ name: '', description: '', permissions: [] });
      loadData();
      
      logActivity('user_update', 'roles', `Role "${selectedRole.name}" updated`, {
        role_name: selectedRole.name,
        new_permissions: newRole.permissions.join(', ')
      });
    } catch (err: unknown) {
      console.error('Failed to update role:', err);
      
      // Handle specific error cases
      let errorMessage = 'Failed to update role';
      
      if (err instanceof Error && err.message) {
        if (err.message.includes('Role not found')) {
          errorMessage = 'Role not found or access denied';
        } else {
          errorMessage = err.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!currentBusiness?.id) return;

    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: currentBusiness.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete role');
      }
      
      toast.success('Role deleted successfully');
      loadData();
      
      logActivity('user_delete', 'roles', `Role "${role.name}" deleted`, {
        role_name: role.name
      });
    } catch (err: unknown) {
      console.error('Failed to delete role:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignRole = async () => {
    if (!currentBusiness?.id || !selectedUser || !selectedUser.role_id) return;

    try {
      setIsSaving(true);
      
      const response = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: currentBusiness.id,
          user_id: selectedUser.user_id,
          role_id: selectedUser.role_id,
          store_id: selectedUser.store_id || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign role');
      }
      
      toast.success('Role assigned successfully');
      setIsAssignRoleDialogOpen(false);
      setSelectedUser(null);
      loadData();
      
      logActivity('user_update', 'roles', `Role assigned to user "${selectedUser.user.name}"`, {
        user_name: selectedUser.user.name,
        role_name: roles.find(r => r.id === selectedUser.role_id)?.name || 'Unknown'
      });
    } catch (err: unknown) {
      console.error('Failed to assign role:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to assign role');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const selectAllCategoryPermissions = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category).map(p => p.id);
    setNewRole(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
    }));
  };

  const deselectAllCategoryPermissions = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category).map(p => p.id);
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
    }));
  };

  const closeAddDialog = () => {
    setIsAddRoleDialogOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const closeEditDialog = () => {
    setIsEditRoleDialogOpen(false);
    setSelectedRole(null);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading roles and permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Roles & Permissions"
        subtitle={`Manage staff roles and access permissions${currentBusiness ? ` for ${currentBusiness.name}` : ''}`}
        showBackButton
        onBack={onBack}
      >
        <Button onClick={() => setIsAddRoleDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Roles</p>
                  <p className="text-2xl font-semibold">{roles.length}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Roles</p>
                  <p className="text-2xl font-semibold">{roles.filter(r => r.is_system_role).length}</p>
                  <p className="text-sm text-muted-foreground">{roles.filter(r => !r.is_system_role).length} custom</p>
                </div>
                <Lock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-semibold">{userRoles.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Permissions</p>
                  <p className="text-2xl font-semibold">{permissions.length}</p>
                </div>
                <Settings className="w-8 h-8 text-orange-600" />
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
                  placeholder="Search roles or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <div className="flex gap-2 sm:gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {Array.from(new Set(permissions.map(perm => perm.category)))
                      .sort()
                      .map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Roles ({filteredRoles.length})</CardTitle>
              {searchTerm && (
                <div className="text-sm text-muted-foreground">
                  {filteredRoles.length} of {roles.length} roles found
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredRoles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                {searchTerm ? (
                  <div>
                    <p className="text-muted-foreground mb-2">No roles found for &quot;{searchTerm}&quot;</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="text-sm"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No roles found</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRoles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{role.name}</h3>
                        {role.is_system_role && (
                          <div className="flex items-center gap-1">
                            <Lock className="w-4 h-4 text-blue-500" />
                            <Badge variant="outline" className="text-xs text-blue-600">System</Badge>
                            {canEditRole(role) && (
                              <Badge variant="secondary" className="text-xs text-green-600">Editable</Badge>
                            )}
                          </div>
                        )}
                        {role.name === 'business_admin' && (
                          <Badge variant="secondary" className="text-xs">Owner</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {role.permissions.length} permissions
                        </Badge>
                        <Badge variant={role.is_active ? "default" : "secondary"} className="text-xs">
                          {role.is_system_role ? 'System' : 'Custom'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openViewPermissionsDialog(role)}
                        title="View permissions"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditDialog(role)}
                        disabled={!hasPermission('roles_edit') || !canEditRole(role)}
                        title={!canEditRole(role) ? 'Only business admins can edit system roles' : 'Edit role permissions'}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setRoleToDelete(role);
                          setIsDeleteRoleDialogOpen(true);
                        }}
                        disabled={isSaving || !hasPermission('roles_delete') || role.is_system_role}
                        title={role.is_system_role ? 'System roles cannot be deleted' : 'Delete this role'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Roles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Role Assignments ({userRoles.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {userRoles.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No user role assignments found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userRoles.map(userRole => (
                  <div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{userRole.user.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          @{userRole.user.username}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{userRole.user.email}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {userRole.role.name}
                        </Badge>
                        {userRole.store_id && (
                          <Badge variant="outline" className="text-xs">
                            Store Assigned
                          </Badge>
                        )}
                        <Badge variant={userRole.is_active ? "default" : "secondary"} className="text-xs">
                          {userRole.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(userRole);
                          setIsAssignRoleDialogOpen(true);
                        }}
                        disabled={userRole.role.name === 'business_admin' || !hasPermission('roles_assign')}
                        title={userRole.role.name === 'business_admin' ? 'Business admin role cannot be changed' : 'Change user role'}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Modify role permissions and description
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Role name"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Role description"
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectAllCategoryPermissions(category)}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deselectAllCategoryPermissions(category)}
                          className="text-xs"
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-2" />
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={closeEditDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isSaving || !newRole.name.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Role'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Permissions Dialog */}
      <Dialog open={isViewPermissionsDialogOpen} onOpenChange={setIsViewPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Role Permissions: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              View all permissions assigned to this role
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{selectedRole?.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedRole?.permissions.length || 0} permissions
                </Badge>
                {selectedRole?.is_system_role && (
                  <Badge variant="secondary">System Role</Badge>
                )}
              </div>
            </div>

            <div>
              <Label>Assigned Permissions</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => {
                  const categoryPermissions = perms.filter(p => selectedRole?.permissions.includes(p.id));
                  if (categoryPermissions.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                      <div className="space-y-2">
                        {categoryPermissions.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <Checkbox checked={true} disabled />
                            <Label className="text-sm font-medium">
                              {permission.name}
                            </Label>
                            <span className="text-xs text-gray-500 ml-2">
                              {permission.description}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  );
                })}
                
                {/* Show message if no permissions found */}
                {(!selectedRole?.permissions || selectedRole.permissions.length === 0) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded text-center">
                    <p className="text-gray-500">No permissions assigned to this role</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsViewPermissionsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignRoleDialogOpen} onOpenChange={setIsAssignRoleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
            <DialogDescription>
              Change the role assigned to this user. This will affect their access permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedUser?.user.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser?.user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current role: <Badge variant="outline" className="text-xs">{selectedUser?.role.name}</Badge>
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="assign-role">New Role</Label>
              <Select
                value={selectedUser?.role_id}
                onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, role_id: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a new role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span>{role.name}</span>
                        {role.is_system_role && <Lock className="w-3 h-3 text-blue-500" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show permissions for selected role */}
            {selectedUser?.role_id && (
              <div>
                <Label>Role Permissions</Label>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  {(() => {
                    const selectedRole = roles.find(r => r.id === selectedUser.role_id);
                    if (!selectedRole) return <p className="text-sm text-muted-foreground">No role selected</p>;

                    return (
                      <div>
                        <p className="text-sm font-medium mb-2">{selectedRole.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedRole.permissions.map(permission => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission === '*' ? 'All Permissions' : permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAssignRoleDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleAssignRole} disabled={isSaving || !selectedUser?.role_id}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Role'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={isDeleteRoleDialogOpen} onOpenChange={setIsDeleteRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;{roleToDelete?.name}&quot;? This action cannot be undone.
              {roleToDelete?.is_system_role && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ This is a system role. Deleting it may affect system functionality.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteRoleDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (roleToDelete) {
                  handleDeleteRole(roleToDelete);
                  setIsDeleteRoleDialogOpen(false);
                  setRoleToDelete(null);
                }
              }}
              disabled={isSaving || !hasPermission('roles_delete')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Role'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Senior Manager"
              />
            </div>
            
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this role can do"
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectAllCategoryPermissions(category)}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deselectAllCategoryPermissions(category)}
                          className="text-xs"
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <Label htmlFor={permission.id} className="text-sm">
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-2" />
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={closeAddDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={isSaving || !newRole.name.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Role'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
