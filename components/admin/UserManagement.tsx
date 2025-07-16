"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";
import { userService } from "@/lib/firebase/services";
import { presenceService } from "@/lib/firebase/presence";
import type { User } from "@/lib/firebase/services";

interface UserWithPresence extends User {
  isOnline?: boolean;
  lastSeen?: Date;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userPresence, setUserPresence] = useState<
    Record<string, { lastSeen: Date; isOnline: boolean }>
  >({});
  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Setup presence tracking
  useEffect(() => {
    const setupPresenceTracking = () => {
      const unsubscribe = presenceService.subscribeToOnlineUsers(
        (onlineUserIds) => {
          setOnlineUsers(new Set(onlineUserIds));
        }
      );

      const presenceUnsubscribe = presenceService.subscribeToUserPresence(
        (presenceData) => {
          setUserPresence(presenceData);
        }
      );

      return () => {
        unsubscribe();
        presenceUnsubscribe();
      };
    };

    return setupPresenceTracking();
  }, []);

  // Update users with presence data when presence changes
  useEffect(() => {
    if (users.length > 0) {
      const usersWithPresence = users.map((user) => ({
        ...user,
        isOnline: onlineUsers.has(user.id),
        lastSeen: userPresence[user.id]?.lastSeen,
      }));

      // Only update if there's actually a change to avoid infinite loops
      const hasChanges = usersWithPresence.some(
        (user, index) =>
          user.isOnline !== users[index]?.isOnline ||
          user.lastSeen !== users[index]?.lastSeen
      );

      if (hasChanges) {
        setUsers(usersWithPresence);
      }
    }
  }, [onlineUsers, userPresence, users]);
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user"
  ) => {
    try {
      setUpdating(true);
      setError(null);
      await userService.updateUser(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, role: newRole, updatedAt: new Date().toISOString() }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      setUpdating(true);
      setError(null);
      await userService.updateUser(userId, { isActive });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, isActive, updatedAt: new Date().toISOString() }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        setError(null);
        await userService.deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user. Please try again.");
      }
    }
  };
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.displayName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const userIsActive = user.isActive ?? true; // Default to true if undefined
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && userIsActive) ||
      (statusFilter === "inactive" && !userIsActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    return role === "admin" ? (
      <ShieldCheck className="w-4 h-4 text-red-500" />
    ) : (
      <Shield className="w-4 h-4 text-blue-500" />
    );
  };
  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getOnlineStatusIcon = (isOnline: boolean) => {
    return isOnline ? (
      <Wifi className="w-4 h-4 text-green-500" />
    ) : (
      <WifiOff className="w-4 h-4 text-gray-400" />
    );
  };

  const formatLastSeen = (lastSeen: Date | undefined, isOnline: boolean) => {
    if (isOnline) return "Online now";
    if (!lastSeen) return "Never seen";

    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
          Total Users: {users.length}
        </div>
      </div>{" "}
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Loading users...</span>
          </div>
        </div>
      )}
      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={loadUsers}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* Users List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {users.length === 0
                  ? "No users have registered yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border-b border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {(user.displayName || user.email || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || "Unknown User"}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {user.email || "No email"}
                          </div>
                        </div>
                      </div>{" "}
                      <div className="flex items-center space-x-1">
                        {user.role === "user" ? (
                          <button
                            onClick={() => handleRoleChange(user.id, "admin")}
                            disabled={updating}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            title="Promote to Admin"
                          >
                            Promote
                          </button>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(
                                user.id,
                                e.target.value as "admin" | "user"
                              )
                            }
                            disabled={updating}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                        <button
                          onClick={() =>
                            handleStatusToggle(
                              user.id,
                              !(user.isActive ?? true)
                            )
                          }
                          disabled={updating}
                          className={`p-1.5 rounded ${
                            user.isActive ?? true
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            user.isActive ?? true
                              ? "Deactivate User"
                              : "Activate User"
                          }
                        >
                          {user.isActive ?? true ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-1 text-gray-900 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(user.isActive ?? true)}
                        <span className="ml-1 text-gray-900">
                          {user.isActive ?? true ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {getOnlineStatusIcon(user.isOnline || false)}
                        <span className="ml-1 text-gray-900">
                          {formatLastSeen(
                            user.lastSeen,
                            user.isOnline || false
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-gray-900">
                          {user.createdAt
                            ? (typeof user.createdAt === "object" && user.createdAt !== null && "toDate" in user.createdAt && typeof (user.createdAt as { toDate: unknown }).toDate === "function")
                              ? (user.createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
                              : new Date(user.createdAt as string | number | Date).toLocaleDateString()
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Online Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {(user.displayName || user.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.displayName || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getOnlineStatusIcon(user.isOnline || false)}
                            <span className="ml-2 text-sm text-gray-900">
                              {formatLastSeen(
                                user.lastSeen,
                                user.isOnline || false
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(user.isActive ?? true)}
                            <span className="ml-2 text-sm text-gray-900">
                              {user.isActive ?? true ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.createdAt
                            ? (typeof user.createdAt === "object" && user.createdAt !== null && "toDate" in user.createdAt && typeof (user.createdAt as { toDate: unknown }).toDate === "function")
                              ? (user.createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
                              : new Date(user.createdAt as string | number | Date).toLocaleDateString()
                            : "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.lastLoginAt
                            ? (typeof user.lastLoginAt === "object" && user.lastLoginAt !== null && "toDate" in user.lastLoginAt && typeof (user.lastLoginAt as { toDate: unknown }).toDate === "function")
                              ? (user.lastLoginAt as { toDate: () => Date }).toDate().toLocaleDateString()
                              : new Date(user.lastLoginAt as string | number | Date).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {" "}
                          <div className="flex items-center justify-end space-x-2">
                            {user.role === "user" ? (
                              <button
                                onClick={() =>
                                  handleRoleChange(user.id, "admin")
                                }
                                disabled={updating}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                title="Promote to Admin"
                              >
                                Promote to Admin
                              </button>
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  handleRoleChange(
                                    user.id,
                                    e.target.value as "admin" | "user"
                                  )
                                }
                                disabled={updating}
                                className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                            <button
                              onClick={() =>
                                handleStatusToggle(
                                  user.id,
                                  !(user.isActive ?? true)
                                )
                              }
                              disabled={updating}
                              className={`p-2 rounded-lg ${
                                user.isActive ?? true
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              } ${
                                updating ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              title={
                                user.isActive ?? true
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              {user.isActive ?? true ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}{" "}
      {/* Summary Stats */}
      {!loading && !error && users.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Total
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <Wifi className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Online
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.isOnline).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Admins
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Active
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 col-span-2 md:col-span-1">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Inactive
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {users.filter((u) => !u.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
