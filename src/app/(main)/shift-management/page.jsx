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
  Clock,
  Play,
  Square,
  FileText,
  DollarSign,
  Users,
  Loader2,
  Coffee,
  Activity,
} from "lucide-react";
import {
  getShifts,
  startShift,
  endShift,
  getActiveShifts,
  getShiftStats,
  addBreak,
} from "@/services/shifts";
import { getEmployees } from "@/services/employees";

function ShiftManagement() {
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);

  const [shifts, setShifts] = useState([]);
  totalCash: 2450.75;
  transactionCount: 12;
  summary: "All transactions completed successfully";
  {
    id: 2;
    employeeName: "Jane Smith";
    employeeId: "EMP002";
    startTime: "2024-01-15T14:00:00";
    endTime: "2024-01-15T22:00:00";
    shiftType: "Evening";
    status: "completed";
    totalSales: 3120.5;
    totalCash: 3100.5;
    transactionCount: 18;
    summary: "Minor cash variance: ₵20.00";
  }
  {
    id: 3;
    employeeName: "Mike Johnson";
    employeeId: "EMP003";
    startTime: "2024-01-16T06:00:00";
    endTime: null;
    shiftType: "Morning";
    status: "active";
    totalSales: 1250.25;
    totalCash: 1250.25;
    transactionCount: 7;
    summary: "Shift in progress";
  }

  const [shiftForm, setShiftForm] = useState({
    employeeName: "",
    employeeId: "",
    startTime: new Date().toISOString().slice(0, 16),
    shiftType: "",
  });

  // const [employees] = useState
  setEmployees([
    { id: "EMP001", name: "John Doe" },
    { id: "EMP002", name: "Jane Smith" },
    { id: "EMP003", name: "Mike Johnson" },
    { id: "EMP004", name: "Sarah Wilson" },
    { id: "EMP005", name: "David Brown" },
  ]);

  const handleStartShift = (e) => {
    e.preventDefault();
    const newShift = {
      id: shifts.length + 1,
      ...shiftForm,
      endTime: null,
      status: "active",
      totalSales: 0,
      totalCash: 0,
      transactionCount: 0,
      summary: "Shift in progress",
    };

    setShifts((prev) => [newShift, ...prev]);
    setActiveShift(newShift);
    setShiftForm({
      employeeName: "",
      employeeId: "",
      startTime: new Date().toISOString().slice(0, 16),
      shiftType: "",
    });
    setShowShiftForm(false);
  };

  const handleEndShift = (shiftId) => {
    setShifts((prev) =>
      prev.map((shift) => {
        if (shift.id === shiftId && shift.status === "active") {
          return {
            ...shift,
            endTime: new Date().toISOString(),
            status: "completed",
            summary: "Shift completed successfully",
          };
        }
        return shift;
      })
    );
    setActiveShift(null);
  };

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    setShiftForm((prev) => ({
      ...prev,
      employeeId: employeeId,
      employeeName: employee?.name || "",
    }));
  };

  // Use stats from API or calculate locally
  const totalDailySales = stats.todayShifts ? 0 : 0; // This would come from sales data
  const activeShiftsCount = stats.activeShifts || activeShifts.length;
  const completedShiftsToday =
    stats.completedShiftsToday ||
    shifts.filter((shift) => {
      if (!shift.startTime) return false;
      const today = new Date().toISOString().slice(0, 10);
      const shiftDate = new Date(shift.startTime).toISOString().slice(0, 10);
      return shift.status === "completed" && shiftDate === today;
    }).length;

  const getShiftDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const generateShiftReport = (shift) => {
    // This would typically generate a PDF or detailed report
    toast.info(`Generating shift report for ${shift.employeeName}...`);
  };

  const handleStartBreak = async (shiftId) => {
    try {
      const response = await addBreak(shiftId, {
        action: "start",
        breakTime: new Date(),
      });
      if (response.success) {
        toast.success("Break started");
        loadActiveShifts();
      }
    } catch (error) {
      toast.error("Failed to start break");
    }
  };

  const handleEndBreak = async (shiftId) => {
    try {
      const response = await addBreak(shiftId, {
        action: "end",
        breakTime: new Date(),
      });
      if (response.success) {
        toast.success("Break ended");
        loadActiveShifts();
      }
    } catch (error) {
      toast.error("Failed to end break");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Shift Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage employee shifts, track sales, and generate reports
          </p>
        </div>
        <Button
          onClick={() => setShowShiftForm(true)}
          className="bg-black text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Shift
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{(totalDailySales || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All shifts combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeShiftsCount}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedShiftsToday}</div>
            <p className="text-xs text-muted-foreground">Shifts finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵
              {completedShiftsToday.length > 0
                ? (totalDailySales / completedShiftsToday.length).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per completed shift</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Shifts Alert */}
      {activeShifts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Shifts
            </CardTitle>
            <CardDescription className="text-blue-600">
              {activeShifts.length} shift(s) currently in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeShifts.map((shift) => (
                <div
                  key={shift._id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg"
                >
                  <div>
                    <span className="font-medium">{shift.employeeName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Started: {new Date(shift.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartBreak(shift._id)}
                    >
                      <Coffee className="h-4 w-4 mr-1" />
                      Break
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEndShift(shift._id)}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      End Shift
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Shift Form */}
      {showShiftForm && (
        <Card>
          <CardHeader>
            <CardTitle>Start New Shift</CardTitle>
            <CardDescription>
              Assign an employee to start a new shift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartShift} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee</label>
                  <Select
                    value={shiftForm.employeeId}
                    onValueChange={handleEmployeeSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name} ({employee.employeeID || employee._id}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={shiftForm.notes}
                    onChange={(e) =>
                      setShiftForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Optional shift notes"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={shiftForm.startTime}
                    onChange={(e) =>
                      setShiftForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
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
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start Shift
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowShiftForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle>Shift History</CardTitle>
          <CardDescription>Recent and current shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Shift Type</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">
                      Loading shifts...
                    </p>
                  </TableCell>
                </TableRow>
              ) : shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">No shifts found</p>
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow key={shift._id || shift.shiftId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{shift.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {shift.employee?._id || shift.employeeId || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{shift.shiftType || "Regular"}</TableCell>
                    <TableCell>
                      {new Date(shift.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {shift.endTime
                        ? new Date(shift.endTime).toLocaleString()
                        : "In Progress"}
                    </TableCell>
                    <TableCell>
                      {getShiftDuration(shift.startTime, shift.endTime)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₵{(shift.totalSales || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{shift.transactionCount || 0}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          shift.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {shift.status.charAt(0).toUpperCase() +
                          shift.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateShiftReport(shift)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {shift.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEndShift(shift._id || shift.shiftId)
                            }
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShiftManagement;
