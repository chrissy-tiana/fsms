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
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Boxes,
  Loader2,
} from "lucide-react";
import {
  getInventory,
  addStock,
  getInventoryStats,
  updateThresholds,
} from "@/services/inventory";

function InventoryManagement() {
  const [showStockInForm, setShowStockInForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({});
  const [inventory, setInventory] = useState([]);

  const [stockInForm, setStockInForm] = useState({
    fuelType: "",
    quantity: "",
    source: "",
    notes: "",
    date: new Date().toISOString().slice(0, 16),
  });

  const handleStockIn = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const stockData = {
        ...stockInForm,
        recordedBy: "Current User", // You might want to get this from auth context
        quantity: parseFloat(stockInForm.quantity),
      };

      const response = await addStock(stockData);
      if (response.success) {
        // Update local inventory with the returned data
        if (response.data.inventory) {
          setInventory((prev) =>
            prev.map((item) =>
              item.fuelType === response.data.inventory.fuelType
                ? response.data.inventory
                : item
            )
          );
        }
        
        toast.success("Stock added successfully");
        
        // Reset form
        setStockInForm({
          fuelType: "",
          quantity: "",
          source: "",
          notes: "",
          date: new Date().toISOString().slice(0, 16),
        });
        setShowStockInForm(false);
        
        // Refresh stats
        loadStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add stock");
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (current, min) => {
    if (current < min)
      return { status: "low", color: "text-red-600", bgColor: "bg-red-100" };
    if (current < min * 1.5)
      return {
        status: "medium",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return { status: "good", color: "text-green-600", bgColor: "bg-green-100" };
  };

  // Load data on component mount
  useEffect(() => {
    loadInventory();
    loadStats();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await getInventory();
      if (response.success) {
        setInventory(response.data);
      }
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getInventoryStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const lowStockItems = inventory.filter(
    (item) => item.currentStock < item.minThreshold
  );
  const totalValue = stats.totalValue || inventory.reduce(
    (sum, item) => sum + item.currentStock * 6.5,
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Boxes className="h-8 w-8" />
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor fuel stock levels and manage inventory
          </p>
        </div>
        <Button
          onClick={() => setShowStockInForm(true)}
          className="bg-black text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Stock In
        </Button>
      </div>

      {/* Alert Cards */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-red-600">
              {lowStockItems.length} fuel type(s) below minimum threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{item.fuelType}</span>
                  <span className="text-red-600">
                    {item.currentStock.toFixed(2)}L (Min:{" "}
                    {item.minThreshold.toFixed(2)}L)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalValue ? totalValue.toFixed(2) : '0.00'}</div>
            <p className="text-xs text-muted-foreground">Estimated value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStock ? stats.totalStock.toFixed(0) : 
                inventory.reduce((sum, item) => sum + item.currentStock, 0).toFixed(0)}
              L
            </div>
            <p className="text-xs text-muted-foreground">All fuel types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems !== undefined ? stats.lowStockItems : lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">Below threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fuel Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFuelTypes || inventory.length}</div>
            <p className="text-xs text-muted-foreground">Total varieties</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock In Form */}
      {showStockInForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Stock In</CardTitle>
            <CardDescription>
              Record new fuel stock received from supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStockIn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={stockInForm.date}
                    onChange={(e) =>
                      setStockInForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Type</label>
                  <Select
                    value={stockInForm.fuelType}
                    onValueChange={(value) =>
                      setStockInForm((prev) => ({ ...prev, fuelType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Quantity (Liters)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={stockInForm.quantity}
                    onChange={(e) =>
                      setStockInForm((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source/Supplier</label>
                  <Input
                    value={stockInForm.source}
                    onChange={(e) =>
                      setStockInForm((prev) => ({
                        ...prev,
                        source: e.target.value,
                      }))
                    }
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={stockInForm.notes}
                    onChange={(e) =>
                      setStockInForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes (optional)"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-black text-white" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Add Stock
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowStockInForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>Real-time fuel stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Threshold</TableHead>
                <TableHead>Max Capacity</TableHead>
                <TableHead>Fill Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">Loading inventory...</p>
                  </TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No inventory items found</p>
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => {
                const stockStatus = getStockStatus(
                  item.currentStock,
                  item.minThreshold
                );
                const fillPercentage = (
                  (item.currentStock / item.maxCapacity) *
                  100
                ).toFixed(1);

                return (
                  <TableRow key={item._id || item.fuelType}>
                    <TableCell className="font-medium">
                      {item.fuelType}
                    </TableCell>
                    <TableCell>{item.currentStock ? item.currentStock.toFixed(2) : '0.00'}L</TableCell>
                    <TableCell>{item.minThreshold ? item.minThreshold.toFixed(2) : '0.00'}L</TableCell>
                    <TableCell>{item.maxCapacity ? item.maxCapacity.toFixed(2) : '0.00'}L</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{fillPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
                      >
                        {stockStatus.status.charAt(0).toUpperCase() +
                          stockStatus.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(item.lastUpdated).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default InventoryManagement;
