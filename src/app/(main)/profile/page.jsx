"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
  Save,
  Key,
  Bell,
  Settings,
  Loader2,
} from "lucide-react";
import { getToken } from "@/services/auth";
import api from "@/services/axios";

function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    department: "",
    employeeId: "",
    dateJoined: "",
    lastLogin: "",
    branch: "",
  });

  // Load current user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please log in to view profile");
        return;
      }

      // Get current user from token or API call
      const response = await api.get("/api/auth/profile"); // You'll need to create this endpoint
      if (response.data && response.data.success) {
        const userData = response.data.data;
        setProfileData({
          name: userData.fullName || userData.name || "Unknown User",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          role: userData.role || "Employee",
          department: userData.department || "Operations",
          employeeId: userData.employeeID || userData.userID || "N/A",
          dateJoined: userData.date_created || userData.createdAt || new Date().toISOString(),
          lastLogin: userData.lastLogin || new Date().toISOString(),
          branch: "Main Branch", // This would come from user data
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      // Set default data if API fails
      setProfileData({
        name: "Current User",
        email: "user@fsms.com",
        phone: "N/A",
        address: "N/A",
        role: "Employee",
        department: "Operations",
        employeeId: "USR001",
        dateJoined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        branch: "Main Branch",
      });
    } finally {
      setLoading(false);
    }
  };

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    lowStockAlerts: true,
    shiftReminders: true,
    reportFrequency: "daily",
    language: "english",
    timezone: "GMT",
  });

  const [activityLog] = useState([
    {
      id: 1,
      action: "Login",
      timestamp: "2024-01-16T08:30:00",
      ipAddress: "192.168.1.100",
      device: "Chrome on Windows",
    },
    {
      id: 2,
      action: "Updated fuel prices",
      timestamp: "2024-01-15T14:20:00",
      ipAddress: "192.168.1.100",
      device: "Chrome on Windows",
    },
    {
      id: 3,
      action: "Generated sales report",
      timestamp: "2024-01-15T09:15:00",
      ipAddress: "192.168.1.100",
      device: "Chrome on Windows",
    },
    {
      id: 4,
      action: "Login",
      timestamp: "2024-01-15T07:00:00",
      ipAddress: "192.168.1.100",
      device: "Chrome on Windows",
    },
  ]);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const response = await api.put("/api/auth/profile", {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
      });
      
      if (response.data && response.data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    setSaving(true);
    try {
      const response = await api.post("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      if (response.data && response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = () => {
    alert("Preferences saved successfully!");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            User Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <p className="text-muted-foreground">
                {profileData.role} • {profileData.department}
              </p>
              <p className="text-sm text-muted-foreground">
                Employee ID: {profileData.employeeId} • {profileData.branch}{" "}
                Branch
              </p>
              <p className="text-sm text-muted-foreground">
                Last login: {new Date(profileData.lastLogin).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        {["profile", "security", "preferences", "activity"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className="rounded-b-none"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Profile Information Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Profile Information
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() =>
                  isEditing ? handleProfileSave() : setIsEditing(true)
                }
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  "Edit Profile"
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <Input
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <Input
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </label>
                <Input
                  value={profileData.role}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                <Input
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={profileData.department}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Date Joined
                </label>
                <Input
                  value={new Date(profileData.dateJoined).toLocaleDateString()}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password for better security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <Button type="submit" className="bg-black text-white" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </div>
              <Button
                onClick={handlePreferencesSave}
                className="bg-black text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardTitle>
            <CardDescription>
              Customize your app experience and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Settings
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Button
                      variant={
                        preferences.emailNotifications ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          emailNotifications: !prev.emailNotifications,
                        }))
                      }
                    >
                      {preferences.emailNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Receive urgent alerts via SMS
                      </p>
                    </div>
                    <Button
                      variant={preferences.smsAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          smsAlerts: !prev.smsAlerts,
                        }))
                      }
                    >
                      {preferences.smsAlerts ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Low Stock Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when inventory is low
                      </p>
                    </div>
                    <Button
                      variant={
                        preferences.lowStockAlerts ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          lowStockAlerts: !prev.lowStockAlerts,
                        }))
                      }
                    >
                      {preferences.lowStockAlerts ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Shift Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Remind about upcoming shifts
                      </p>
                    </div>
                    <Button
                      variant={
                        preferences.shiftReminders ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          shiftReminders: !prev.shiftReminders,
                        }))
                      }
                    >
                      {preferences.shiftReminders ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">General Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Report Frequency
                    </label>
                    <Select
                      value={preferences.reportFrequency}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({
                          ...prev,
                          reportFrequency: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="twi">Twi</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log Tab */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Recent account activity and login history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLog.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.action}
                    </TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{activity.ipAddress}</TableCell>
                    <TableCell>{activity.device}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UserProfile;
