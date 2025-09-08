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
  Plus,
  Users,
  UserCheck,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeStats,
} from "@/services/employees";
import { getUsers, updateUserStatus, deleteUser } from "@/services/users";

function EmployeeManagement() {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({});

  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [allPersonnel, setAllPersonnel] = useState([]);

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    department: "",
    dateJoined: new Date().toISOString().slice(0, 10),
  });

  const roles = [
    "Station Manager",
    "Supervisor",
    "Pump Attendant",
    "Cashier",
    "Security Guard",
    "Maintenance",
  ];

  const departments = ["Management", "Operations", "Security", "Maintenance"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingEmployee) {
        // Update existing employee
        const response = await updateEmployee(
          editingEmployee._id,
          employeeForm
        );
        if (response.success) {
          setEmployees((prev) =>
            prev.map((emp) =>
              emp._id === editingEmployee._id ? response.data : emp
            )
          );
          toast.success("Employee updated successfully");
        }
        setEditingEmployee(null);
      } else {
        // Add new employee
        const response = await createEmployee(employeeForm);
        if (response.success) {
          setEmployees((prev) => [response.data, ...prev]);
          toast.success("Employee created successfully");
        }
      }

      // Reset form
      setEmployeeForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "",
        department: "",
        dateJoined: new Date().toISOString().slice(0, 10),
      });
      setShowEmployeeForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      role: employee.role,
      department: employee.department,
      dateJoined: employee.dateJoined
        ? new Date(employee.dateJoined).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    });
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDelete = async (personId, personType) => {
    const confirmMessage = personType === 'employee' 
      ? "Are you sure you want to delete this employee?" 
      : "Are you sure you want to delete this user?";
    
    if (confirm(confirmMessage)) {
      try {
        let response;
        if (personType === 'employee') {
          response = await deleteEmployee(personId);
          if (response.success) {
            setEmployees((prev) => prev.filter((emp) => emp._id !== personId));
          }
        } else {
          response = await deleteUser(personId);
          if (response.success) {
            setUsers((prev) => prev.filter((user) => user._id !== personId));
          }
        }
        
        if (response.success) {
          setAllPersonnel((prev) => prev.filter((person) => person._id !== personId));
          toast.success(`${personType === 'employee' ? 'Employee' : 'User'} deleted successfully`);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || `Failed to delete ${personType}`
        );
      }
    }
  };

  const handleStatusChange = async (personId, newStatus, personType) => {
    try {
      let response;
      if (personType === 'employee') {
        response = await updateEmployeeStatus(personId, newStatus);
        if (response.success) {
          setEmployees((prev) =>
            prev.map((emp) => (emp._id === personId ? response.data : emp))
          );
        }
      } else {
        response = await updateUserStatus(personId, newStatus);
        if (response.success) {
          setUsers((prev) =>
            prev.map((user) => (user._id === personId ? response.data : user))
          );
        }
      }
      
      if (response.success) {
        // Update allPersonnel list
        setAllPersonnel((prev) =>
          prev.map((person) => 
            person._id === personId ? { ...response.data, type: personType } : person
          )
        );
        toast.success(`${personType === 'employee' ? 'Employee' : 'User'} status updated successfully`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadEmployees(),
      loadUsers(),
      loadStats(),
    ]);
    setLoading(false);
  };

  const loadEmployees = async () => {
    try {
      const response = await getEmployees();
      if (response.success) {
        setEmployees(response.data);
        updateAllPersonnel(response.data, users);
      }
    } catch (error) {
      toast.error("Failed to load employees");
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data);
        updateAllPersonnel(employees, response.data);
      }
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const updateAllPersonnel = (employeesList, usersList) => {
    // Combine employees and users, marking their type
    const combinedList = [
      ...employeesList.map(emp => ({ ...emp, type: 'employee' })),
      ...usersList.map(user => ({ ...user, type: 'user' }))
    ];
    setAllPersonnel(combinedList);
  };

  const loadStats = async () => {
    try {
      const response = await getEmployeeStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const activeEmployees = employees.filter((emp) => emp.status === "active");
  const activeUsers = users.filter((user) => user.status === "active" || !user.status);
  const totalActive = activeEmployees.length + activeUsers.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Employee Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff profiles and roles
          </p>
        </div>
        <Button
          onClick={() => setShowEmployeeForm(true)}
          className="bg-black text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allPersonnel.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {employees.length} employees, {users.length} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Personnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalActive}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeEmployees.length} employees, {activeUsers.length} users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Form */}
      {showEmployeeForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </CardTitle>
            <CardDescription>
              {editingEmployee
                ? "Update employee information"
                : "Enter employee details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={employeeForm.name}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </label>
                  <Input
                    value={employeeForm.phone}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={employeeForm.role}
                    onValueChange={(value) =>
                      setEmployeeForm((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={employeeForm.department}
                    onValueChange={(value) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        department: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Joined</label>
                  <Input
                    type="date"
                    value={employeeForm.dateJoined}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        dateJoined: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </label>
                  <Input
                    value={employeeForm.address}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter full address"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="bg-black text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingEmployee ? "Update Employee" : "Add Employee"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEditingEmployee(null);
                    setEmployeeForm({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                      role: "",
                      department: "",
                      dateJoined: new Date().toISOString().slice(0, 10),
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Personnel List */}
      <Card>
        <CardHeader>
          <CardTitle>Personnel Directory</CardTitle>
          <CardDescription>
            Manage all employees and system users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Role & Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">
                      Loading personnel...
                    </p>
                  </TableCell>
                </TableRow>
              ) : allPersonnel.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No personnel found</p>
                  </TableCell>
                </TableRow>
              ) : (
                allPersonnel.map((person) => (
                  <TableRow key={person._id || person.employeeID}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{person.name || person.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {person.employeeID || person._id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined:{" "}
                          {person.dateJoined || person.createdAt
                            ? new Date(person.dateJoined || person.createdAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        person.type === 'employee' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {person.type === 'employee' ? 'Employee' : 'User'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{person.role || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {person.department || person.branch || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {person.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {person.phone || 'N/A'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={person.status || 'active'}
                        onValueChange={(value) =>
                          handleStatusChange(person._id, value, person.type)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {person.type === 'employee' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(person)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(person._id, person.type)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats by Department */}
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>
            Employee distribution and performance by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => {
              const deptEmployees = employees.filter(
                (emp) => emp.department === dept
              );
              const deptUsers = users.filter(
                (user) => user.department === dept || user.branch === dept
              );
              const totalInDept = deptEmployees.length + deptUsers.length;

              return (
                <div key={dept} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{dept}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">
                        {totalInDept}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Employees: {deptEmployees.length}</span>
                      <span>Users: {deptUsers.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmployeeManagement;
