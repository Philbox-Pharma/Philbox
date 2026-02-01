// src/portals/admin/modules/roles-permissions/RolesPermissions.jsx
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt,
  FaChevronDown,
  FaChevronRight,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUsers,
  FaCodeBranch,
  FaUserMd,
  FaClipboardList,
  FaCalendarCheck,
  FaPrescriptionBottleAlt,
  FaChartBar,
  FaUserTie,
  FaUserFriends,
} from 'react-icons/fa';
import { rolesApi } from '../../../../core/api/admin/adminApi';

export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  // Fetch roles and permissions
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        rolesApi.getAllRoles(),
        rolesApi.getAllPermissions(),
      ]);

      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (permissionsRes.data) {
        setAllPermissions(permissionsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load roles and permissions');
      // Mock data for development
      setRoles([
        {
          _id: '1',
          name: 'super_admin',
          description: 'Super Administrator - Full system access',
          permissions: [],
        },
        {
          _id: '2',
          name: 'branch_admin',
          description: 'Branch Administrator - Manage branch operations',
          permissions: [],
        },
        {
          _id: '3',
          name: 'salesperson',
          description: 'Salesperson - Handle inventory and orders',
          permissions: [],
        },
        {
          _id: '4',
          name: 'doctor',
          description: 'Doctor - Manage consultations and prescriptions',
          permissions: [],
        },
        {
          _id: '5',
          name: 'customer',
          description: 'Customer - Browse and place orders',
          permissions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Format role name
  const formatRoleName = name => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get role icon
  const getRoleIcon = name => {
    const icons = {
      super_admin: FaShieldAlt,
      branch_admin: FaCodeBranch,
      doctor: FaUserMd,
      salesperson: FaUserTie,
      customer: FaUserFriends,
    };
    return icons[name] || FaUsers;
  };

  // Get role colors
  const getRoleColors = name => {
    const colors = {
      super_admin: {
        bg: 'bg-purple-500',
        light: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
      },
      branch_admin: {
        bg: 'bg-blue-500',
        light: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
      doctor: {
        bg: 'bg-green-500',
        light: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
      },
      salesperson: {
        bg: 'bg-orange-500',
        light: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200',
      },
      customer: {
        bg: 'bg-teal-500',
        light: 'bg-teal-100',
        text: 'text-teal-600',
        border: 'border-teal-200',
      },
    };
    return (
      colors[name] || {
        bg: 'bg-gray-500',
        light: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
      }
    );
  };

  // Get resource icon
  const getResourceIcon = resource => {
    const icons = {
      users: FaUsers,
      branches: FaCodeBranch,
      doctors: FaUserMd,
      customers: FaUserFriends,
      salespersons: FaUserTie,
      appointments: FaCalendarCheck,
      prescriptions: FaPrescriptionBottleAlt,
      reports: FaChartBar,
    };
    return icons[resource] || FaClipboardList;
  };

  // Get action badge color
  const getActionColor = action => {
    const colors = {
      create: 'bg-green-100 text-green-700 border-green-200',
      read: 'bg-blue-100 text-blue-700 border-blue-200',
      update: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      delete: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Group permissions by resource
  const groupPermissionsByResource = () => {
    const grouped = {};
    allPermissions.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  };

  // Check if role has permission
  const roleHasPermission = (role, permissionId) => {
    // Check pending changes first
    if (pendingChanges[role._id]?.[permissionId] !== undefined) {
      return pendingChanges[role._id][permissionId];
    }
    // Check actual role permissions
    return role.permissions.some(
      p => (typeof p === 'string' ? p : p._id) === permissionId
    );
  };

  // Toggle permission for a role
  const togglePermission = (roleId, permissionId, currentValue) => {
    setPendingChanges(prev => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] || {}),
        [permissionId]: !currentValue,
      },
    }));
  };

  // Save changes for a role
  const saveChanges = async role => {
    if (!pendingChanges[role._id]) return;

    setSaving(role._id);
    setError(null);
    setSuccess(null);

    try {
      // Calculate final permissions
      const currentPermissions = role.permissions.map(p =>
        typeof p === 'string' ? p : p._id
      );
      const changes = pendingChanges[role._id];

      let finalPermissions = [...currentPermissions];

      Object.entries(changes).forEach(([permId, shouldHave]) => {
        const hasIt = currentPermissions.includes(permId);
        if (shouldHave && !hasIt) {
          finalPermissions.push(permId);
        } else if (!shouldHave && hasIt) {
          finalPermissions = finalPermissions.filter(p => p !== permId);
        }
      });

      await rolesApi.updateRolePermissions(role._id, finalPermissions);

      // Update local state
      setRoles(prev =>
        prev.map(r => {
          if (r._id === role._id) {
            return {
              ...r,
              permissions: allPermissions.filter(p =>
                finalPermissions.includes(p._id)
              ),
            };
          }
          return r;
        })
      );

      // Clear pending changes for this role
      setPendingChanges(prev => {
        const { [role._id]: _, ...rest } = prev;
        return rest;
      });

      setSuccess(
        `${formatRoleName(role.name)} permissions updated successfully!`
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(null);
    }
  };

  // Check if role has pending changes
  const hasPendingChanges = roleId => {
    return (
      pendingChanges[roleId] && Object.keys(pendingChanges[roleId]).length > 0
    );
  };

  // Count permissions for a role
  const countPermissions = role => {
    const changes = pendingChanges[role._id] || {};
    let count = role.permissions.length;

    Object.entries(changes).forEach(([permId, shouldHave]) => {
      const hasIt = role.permissions.some(
        p => (typeof p === 'string' ? p : p._id) === permId
      );
      if (shouldHave && !hasIt) count++;
      if (!shouldHave && hasIt) count--;
    });

    return count;
  };

  const groupedPermissions = groupPermissionsByResource();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-[#1a365d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Roles & Permissions
        </h1>
        <p className="text-gray-600 mt-1">
          Manage access control for different user roles
        </p>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2"
          >
            <FaCheckCircle className="flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-2"
          >
            <FaExclamationTriangle className="flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={FaShieldAlt}
          label="Total Roles"
          value={roles.length}
          color="purple"
        />
        <StatsCard
          icon={FaClipboardList}
          label="Total Permissions"
          value={allPermissions.length}
          color="blue"
        />
        <StatsCard
          icon={FaCodeBranch}
          label="Resources"
          value={Object.keys(groupedPermissions).length}
          color="green"
        />
        <StatsCard
          icon={FaCheckCircle}
          label="Actions"
          value={4}
          color="orange"
        />
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {roles.map(role => {
          const RoleIcon = getRoleIcon(role.name);
          const colors = getRoleColors(role.name);
          const isExpanded = expandedRole === role._id;
          const hasChanges = hasPendingChanges(role._id);

          return (
            <motion.div
              key={role._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-lg border ${hasChanges ? 'border-yellow-300' : 'border-gray-100'} overflow-hidden`}
            >
              {/* Role Header */}
              <div
                onClick={() => setExpandedRole(isExpanded ? null : role._id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center`}
                  >
                    <RoleIcon className={`text-xl ${colors.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {formatRoleName(role.name)}
                      </h3>
                      {hasChanges && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Unsaved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${colors.light} ${colors.text}`}
                  >
                    {countPermissions(role)} permissions
                  </span>
                  {isExpanded ? (
                    <FaChevronDown className="text-gray-400" />
                  ) : (
                    <FaChevronRight className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Permission Matrix */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {/* Permission Groups */}
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(
                          ([resource, permissions]) => {
                            const ResourceIcon = getResourceIcon(resource);
                            return (
                              <div
                                key={resource}
                                className="bg-white rounded-lg border border-gray-200 p-4"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <ResourceIcon className="text-gray-500" />
                                  <h4 className="font-medium text-gray-800 capitalize">
                                    {resource}
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {permissions.map(perm => {
                                    const hasPermission = roleHasPermission(
                                      role,
                                      perm._id
                                    );
                                    return (
                                      <button
                                        key={perm._id}
                                        onClick={() =>
                                          togglePermission(
                                            role._id,
                                            perm._id,
                                            hasPermission
                                          )
                                        }
                                        className={`
                                                                                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                                                                border-2 flex items-center gap-2
                                                                                ${
                                                                                  hasPermission
                                                                                    ? getActionColor(
                                                                                        perm.action
                                                                                      )
                                                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                                                }
                                                                            `}
                                      >
                                        <span
                                          className={`w-2 h-2 rounded-full ${hasPermission ? 'bg-current' : 'bg-gray-300'}`}
                                        />
                                        {perm.action.charAt(0).toUpperCase() +
                                          perm.action.slice(1)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>

                      {/* Save Button */}
                      {hasChanges && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 flex justify-end"
                        >
                          <button
                            onClick={() => saveChanges(role)}
                            disabled={saving === role._id}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
                          >
                            {saving === role._id ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <FaSave />
                                Save Changes
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <h3 className="font-medium text-gray-800 mb-3">
          Permission Actions Legend
        </h3>
        <div className="flex flex-wrap gap-3">
          {['create', 'read', 'update', 'delete'].map(action => (
            <div
              key={action}
              className={`px-3 py-1.5 rounded-lg border ${getActionColor(action)} text-sm font-medium`}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
// eslint-disable-next-line no-unused-vars
const StatsCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <Icon className={`text-lg ${c.text}`} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};
