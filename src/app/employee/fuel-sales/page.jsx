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
import { Plus, Fuel, Calculator, User, Clock, Loader2 } from "lucide-react";
import {
  getFuelSales,
  createFuelSale,
  updateFuelSale,
  deleteFuelSale,
  getFuelSalesStats,
} from "@/services/fuelSales";
import { getCurrentFuelPrices } from "@/services/fuelPrices";
import { getCurrentUser } from "@/services/auth";

function FuelSales() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({});
  const [sales, setSales] = useState([]);
  const [fuelPrices, setFuelPrices] = useState({});
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    dateTime: new Date().toISOString().slice(0, 16),
    pumpNumber: "",
    fuelType: "",
    openingReading: "",
    closingReading: "",
    pricePerLiter: "",
    totalVolume: "",
    totalAmount: "",
    attendant: "",
  });

  const calculateValues = (openingReading, closingReading, pricePerLiter) => {
    const volume = parseFloat(closingReading) - parseFloat(openingReading);
    const amount = volume * parseFloat(pricePerLiter);
    return {
      totalVolume: volume.toFixed(2),
      totalAmount: amount.toFixed(2),
    };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate when all required fields are present
      if (
        field === "openingReading" ||
        field === "closingReading" ||
        field === "pricePerLiter"
      ) {
        if (
          updated.openingReading &&
          updated.closingReading &&
          updated.pricePerLiter
        ) {
          const calculations = calculateValues(
            updated.openingReading,
            updated.closingReading,
            updated.pricePerLiter
          );
          updated.totalVolume = calculations.totalVolume;
          updated.totalAmount = calculations.totalAmount;
        }
      }

      return updated;
    });

    // Auto-fetch price when fuel type is selected
    if (field === "fuelType" && value) {
      handleFuelTypeChange(value);
    }
  };

  const handleFuelTypeChange = async (fuelType) => {
    const price = await fetchFuelPrice(fuelType);
    if (price) {
      setFormData((prev) => {
        const updated = { ...prev, pricePerLiter: price.toString() };

        // Auto-calculate if we have all required values
        if (updated.openingReading && updated.closingReading) {
          const calculations = calculateValues(
            updated.openingReading,
            updated.closingReading,
            price
          );
          updated.totalVolume = calculations.totalVolume;
          updated.totalAmount = calculations.totalAmount;
        }

        return updated;
      });
    }
  };

  const fetchFuelPrice = async (fuelType) => {
    if (!fuelType || fuelPrices[fuelType]) {
      return fuelPrices[fuelType]?.price;
    }

    setFetchingPrice(true);
    try {
      const response = await getCurrentFuelPrices();
      if (response.success && response.data) {
        const pricesMap = {};
        response.data.forEach((priceData) => {
          pricesMap[priceData.fuelType] = priceData;
        });
        setFuelPrices(pricesMap);

        const selectedFuelPrice = pricesMap[fuelType];
        if (selectedFuelPrice) {
          toast.success(
            `Price loaded: ₵${selectedFuelPrice.price.toFixed(
              2
            )} per liter for ${fuelType}`
          );
          return selectedFuelPrice.price;
        } else {
          toast.warning(`No current price found for ${fuelType}`);
        }
      }
    } catch (error) {
      console.error("Error fetching fuel prices:", error);
      toast.error("Failed to fetch current fuel prices");
    } finally {
      setFetchingPrice(false);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.pumpNumber) {
        toast.error("Please select a pump number");
        setSaving(false);
        return;
      }
      
      if (!formData.fuelType) {
        toast.error("Please select a fuel type");
        setSaving(false);
        return;
      }
      
      if (!formData.openingReading || !formData.closingReading) {
        toast.error("Please enter both opening and closing readings");
        setSaving(false);
        return;
      }
      
      if (!formData.pricePerLiter) {
        toast.error("Please enter price per liter");
        setSaving(false);
        return;
      }

      // Validate readings
      const openingReading = parseFloat(formData.openingReading);
      const closingReading = parseFloat(formData.closingReading);
      
      if (closingReading <= openingReading) {
        toast.error("Closing reading must be greater than opening reading");
        setSaving(false);
        return;
      }

      const saleData = {
        ...formData,
        openingReading,
        closingReading,
        pricePerLiter: parseFloat(formData.pricePerLiter),
        totalVolume: parseFloat(formData.totalVolume),
        totalAmount: parseFloat(formData.totalAmount),
      };

      console.log("Submitting sale data:", saleData);

      const response = await createFuelSale(saleData);
      console.log("Sale response:", response);
      
      if (response.success) {
        setSales((prev) => [response.data, ...prev]);
        toast.success("Fuel sale recorded successfully");

        // Reset form but keep current user as attendant
        const attendantName = currentUser
          ? currentUser.fullName || currentUser.name || "Current User"
          : "Current User";

        setFormData({
          dateTime: new Date().toISOString().slice(0, 16),
          pumpNumber: "",
          fuelType: "",
          openingReading: "",
          closingReading: "",
          pricePerLiter: "",
          totalVolume: "",
          totalAmount: "",
          attendant: attendantName,
        });
        setShowForm(false);

        // Refresh stats
        await loadStats();
        await loadSales();
      } else {
        toast.error(response.message || "Failed to record sale");
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to record sale");
    } finally {
      setSaving(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadSales();
    loadStats();
    loadFuelPrices();
    loadCurrentUser();
  }, []);

  const loadFuelPrices = async () => {
    try {
      const response = await getCurrentFuelPrices();
      if (response.success && response.data) {
        const pricesMap = {};
        response.data.forEach((priceData) => {
          pricesMap[priceData.fuelType] = priceData;
        });
        setFuelPrices(pricesMap);
      }
    } catch (error) {
      console.error("Error loading fuel prices:", error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData && userData.success) {
        setCurrentUser(userData.data);
        // Update form data with current user's name
        setFormData((prev) => ({
          ...prev,
          attendant:
            userData.data.fullName || userData.data.name || "Unknown User",
        }));
      }
    } catch (error) {
      console.error("Error loading current user:", error);
      setFormData((prev) => ({
        ...prev,
        attendant: "Current User",
      }));
    }
  };

  const loadSales = async () => {
    try {
      const response = await getFuelSales({ limit: 50 });
      if (response.success) {
        setSales(response.data);
      }
    } catch (error) {
      toast.error("Failed to load fuel sales");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getFuelSalesStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const totalSalesAmount =
    stats.totalSalesAmount ||
    sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalVolume =
    stats.totalVolume || sales.reduce((sum, sale) => sum + sale.totalVolume, 0);
  const totalTransactions = stats.totalTransactions || sales.length;

  return (
    <div className="space-y-6 p-6 w-[800px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Fuel className="h-8 w-8" />
            Fuel Sales Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Record and manage all fuel sales transactions
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-black text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Sale
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{totalSalesAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volume Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolume.toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground">Total volume today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New Sale Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Fuel Sale</CardTitle>
            <CardDescription>
              Enter the details of the fuel sale transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) =>
                      handleInputChange("dateTime", e.target.value)
                    }
                    required
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pump Number *</label>
                  <Select
                    value={formData.pumpNumber}
                    onValueChange={(value) =>
                      handleInputChange("pumpNumber", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pump" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pump 01">Pump 01</SelectItem>
                      <SelectItem value="Pump 02">Pump 02</SelectItem>
                      <SelectItem value="Pump 03">Pump 03</SelectItem>
                      <SelectItem value="Pump 04">Pump 04</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Type *</label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) =>
                      handleInputChange("fuelType", value)
                    }
                    disabled={fetchingPrice}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          fetchingPrice
                            ? "Loading prices..."
                            : "Select fuel type"
                        }
                      />
                      {fetchingPrice && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">
                        <div className="flex justify-between items-center w-full">
                          <span>Petrol</span>
                          {fuelPrices.Petrol && (
                            <span className="text-sm text-muted-foreground ml-4">
                              ₵{fuelPrices.Petrol.price.toFixed(2)}/L
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="Diesel">
                        <div className="flex justify-between items-center w-full">
                          <span>Diesel</span>
                          {fuelPrices.Diesel && (
                            <span className="text-sm text-muted-foreground ml-4">
                              ₵{fuelPrices.Diesel.price.toFixed(2)}/L
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="Premium">
                        <div className="flex justify-between items-center w-full">
                          <span>Premium</span>
                          {fuelPrices.Premium && (
                            <span className="text-sm text-muted-foreground ml-4">
                              ₵{fuelPrices.Premium.price.toFixed(2)}/L
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Attendant Name
                    <span className="text-xs text-green-600 ml-2">
                      (Current User)
                    </span>
                  </label>
                  <Input
                    value={formData.attendant}
                    readOnly
                    className="bg-green-50 border-green-200"
                    placeholder="Loading user..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Opening Reading (L) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.openingReading}
                    onChange={(e) =>
                      handleInputChange("openingReading", e.target.value)
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Closing Reading (L) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.closingReading}
                    onChange={(e) =>
                      handleInputChange("closingReading", e.target.value)
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Price per Liter (₵) *
                    {formData.fuelType && fuelPrices[formData.fuelType] && (
                      <span className="text-xs text-green-600 ml-2">
                        (Auto-filled from current prices)
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricePerLiter}
                    onChange={(e) =>
                      handleInputChange("pricePerLiter", e.target.value)
                    }
                    placeholder={
                      formData.fuelType && fuelPrices[formData.fuelType]
                        ? `Current: ₵${fuelPrices[
                            formData.fuelType
                          ].price.toFixed(2)}`
                        : "0.00"
                    }
                    className={
                      formData.fuelType && fuelPrices[formData.fuelType]
                        ? "border-green-300 bg-green-50"
                        : ""
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Total Volume (L)
                    <span className="text-xs text-blue-600">
                      (Auto-calculated)
                    </span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalVolume}
                    readOnly
                    className="bg-blue-50 border-blue-200"
                    placeholder="Closing - Opening reading"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Total Amount (₵)
                    <span className="text-xs text-blue-600 ml-2">
                      (Auto-calculated)
                    </span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    readOnly
                    className="bg-blue-50 border-blue-200"
                    placeholder="Volume × Price per liter"
                  />
                </div>
              </div>
              
              {/* Form validation help text */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>Required fields (*):</strong> All fields marked with * must be completed before you can save the sale.
                  Price and volume calculations will be done automatically when you enter the readings.
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="bg-black text-white"
                  disabled={
                    saving ||
                    !formData.pumpNumber ||
                    !formData.fuelType ||
                    !formData.openingReading ||
                    !formData.closingReading ||
                    !formData.pricePerLiter ||
                    !formData.attendant
                  }
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {saving ? "Saving..." : "Save Sale"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>View all fuel sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Pump</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Volume (L)</TableHead>
                <TableHead>Price/L</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Attendant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">
                      Loading sales...
                    </p>
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No sales found</p>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale._id || sale.saleId}>
                    <TableCell>
                      {new Date(sale.dateTime).toLocaleString()}
                    </TableCell>
                    <TableCell>{sale.pumpNumber}</TableCell>
                    <TableCell>{sale.fuelType}</TableCell>
                    <TableCell>
                      {sale.totalVolume ? sale.totalVolume.toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell>
                      ₵
                      {sale.pricePerLiter
                        ? sale.pricePerLiter.toFixed(2)
                        : "0.00"}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₵{sale.totalAmount ? sale.totalAmount.toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell>{sale.attendant}</TableCell>
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

export default FuelSales;
