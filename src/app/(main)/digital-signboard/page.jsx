"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push } from "firebase/database";
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
  Monitor,
  Fuel,
  Edit,
  Save,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  History,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getCurrentFuelPrices,
  getFuelPriceHistory,
  updateFuelPrice,
  getFuelPriceStats,
} from "@/services/fuelPrices";

function DigitalSignboardManagement() {
  const [activeTab, setActiveTab] = useState("current");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State for backend data
  const [currentPrices, setCurrentPrices] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceStats, setPriceStats] = useState({});

  const [priceForm, setPriceForm] = useState({
    fuelType: "",
    newPrice: "",
    reason: "",
  });

  // Firebase Realtime Database states
  const [display1, setDisplay1] = useState("");
  const [display2, setDisplay2] = useState("");
  const [displayForm, setDisplayForm] = useState({
    display1Input: "",
    display2Input: "",
  });
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();

    // Set up Firebase Realtime Database listeners
    const display1Ref = ref(database, "Filling Station/display1");
    const display2Ref = ref(database, "Filling Station/display2");

    const unsubscribe1 = onValue(
      display1Ref,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Display1 data from Firebase:", data);
        if (data !== null) {
          setDisplay1(data);
          setDisplayForm((prev) => ({ ...prev, display1Input: data }));
        } else {
          setDisplay1("");
        }
      },
      (error) => {
        console.error("Error fetching display1:", error);
      }
    );

    const unsubscribe2 = onValue(
      display2Ref,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Display2 data from Firebase:", data);
        if (data !== null) {
          setDisplay2(data);
          setDisplayForm((prev) => ({ ...prev, display2Input: data }));
        } else {
          setDisplay2("");
        }
      },
      (error) => {
        console.error("Error fetching display2:", error);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.allSettled([
        loadCurrentPrices(),
        loadPriceHistory(),
        loadPriceStats(),
      ]);
    } catch (error) {
      console.error("Error loading signboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPrices = async () => {
    try {
      const response = await getCurrentFuelPrices();
      if (response.success && response.data) {
        setCurrentPrices(response.data);

        // Auto-sync MongoDB prices to Firebase if enabled
        if (autoSyncEnabled) {
          syncPricesToFirebase(response.data);
        }
      }
    } catch (error) {
      console.error("Error loading current prices:", error);
      toast.error("Failed to load current fuel prices");
    }
  };

  const loadPriceHistory = async () => {
    try {
      // Load history for all fuel types
      const fuelTypes = ["Petrol", "Diesel", "Premium"];
      const historyPromises = fuelTypes.map((fuelType) =>
        getFuelPriceHistory(fuelType, 20)
      );

      const historyResults = await Promise.allSettled(historyPromises);
      const allHistory = [];

      historyResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value.success) {
          allHistory.push(...result.value.data);
        }
      });

      // Sort by date (most recent first) and limit to 50 entries
      const sortedHistory = allHistory
        .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))
        .slice(0, 50);

      setPriceHistory(sortedHistory);
    } catch (error) {
      console.error("Error loading price history:", error);
    }
  };

  const loadPriceStats = async () => {
    try {
      const response = await getFuelPriceStats();
      if (response.success && response.data) {
        setPriceStats(response.data);
      }
    } catch (error) {
      console.error("Error loading price stats:", error);
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const priceData = {
        fuelType: priceForm.fuelType,
        price: parseFloat(priceForm.newPrice),
        effectiveDate: new Date().toISOString(),
        notes: priceForm.reason,
        updatedBy: "Current User", // This should come from authenticated user
      };

      const response = await updateFuelPrice(priceData);
      if (response.success) {
        toast.success(`${priceForm.fuelType} price updated successfully!`);

        // Reload all data to reflect changes
        await loadAllData();

        // Auto-sync to Firebase if this is Petrol or Premium
        if (
          autoSyncEnabled &&
          (priceForm.fuelType === "Petrol" || priceForm.fuelType === "Premium")
        ) {
          const updatedPrices = [...currentPrices];
          const index = updatedPrices.findIndex(
            (p) => p.fuelType === priceForm.fuelType
          );
          if (index >= 0) {
            updatedPrices[index] = {
              ...updatedPrices[index],
              price: parseFloat(priceForm.newPrice),
            };
          } else {
            updatedPrices.push({
              fuelType: priceForm.fuelType,
              price: parseFloat(priceForm.newPrice),
            });
          }
          await syncPricesToFirebase(updatedPrices);
        }

        // Reset form
        setPriceForm({
          fuelType: "",
          newPrice: "",
          reason: "",
        });
      } else {
        toast.error(response.message || "Failed to update price");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update fuel price");
    } finally {
      setUpdating(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast.success("Data refreshed successfully");
  };

  // Sync MongoDB fuel prices to Firebase
  const syncPricesToFirebase = async (prices) => {
    try {
      // Find Petrol and Premium prices
      const petrolPrice = prices.find((p) => p.fuelType === "Petrol");
      const premiumPrice = prices.find((p) => p.fuelType === "Premium");

      if (petrolPrice) {
        const petrolDisplay = `${petrolPrice.price.toFixed(3)}`;
        const display1Ref = ref(database, "Filling Station/display1");
        await set(display1Ref, petrolDisplay);
      }

      if (premiumPrice) {
        const premiumDisplay = `${premiumPrice.price.toFixed(3)}`;
        const display2Ref = ref(database, "Filling Station/display2");
        await set(display2Ref, premiumDisplay);
      }
    } catch (error) {
      console.error("Error syncing prices to Firebase:", error);
    }
  };

  // Manual sync function
  const handleManualSync = async () => {
    if (currentPrices.length > 0) {
      await syncPricesToFirebase(currentPrices);
      toast.success("Prices synced to Firebase successfully!");
    } else {
      toast.error("No prices available to sync");
    }
  };

  const getPriceChange = (currentPrice, history) => {
    if (!history || history.length < 2)
      return { change: "0.00", percentage: "0.00" };

    const previousPrice = history[1].price;
    const change = currentPrice - previousPrice;
    const percentage = ((change / previousPrice) * 100).toFixed(3);

    return {
      change: change.toFixed(3),
      percentage,
      previous: previousPrice,
    };
  };

  const getHistoryForFuelType = (fuelType) => {
    return priceHistory.filter((h) => h.fuelType === fuelType);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3 text-lg">Loading signboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Monitor className="h-8 w-8" />
            Digital Signboard Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage roadside fuel price display and pricing updates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPrices.length}</div>
            <p className="text-xs text-muted-foreground">
              Fuel types displayed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {currentPrices.length > 0
                ? new Date(
                    Math.max(
                      ...currentPrices.map((p) =>
                        new Date(p.effectiveDate).getTime()
                      )
                    )
                  ).toLocaleString()
                : "No updates"}
            </div>
            <p className="text-xs text-muted-foreground">Most recent change</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Price Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceHistory.length}</div>
            <p className="text-xs text-muted-foreground">Total updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{priceStats.averagePrice?.toFixed(3) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all fuel types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        {["current", "update", "history"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className="rounded-b-none"
          >
            {tab === "current" && <Monitor className="h-4 w-4 mr-2" />}
            {tab === "update" && <Edit className="h-4 w-4 mr-2" />}
            {tab === "history" && <History className="h-4 w-4 mr-2" />}
            {tab.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Current Prices Tab */}
      {activeTab === "current" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Signboard Display</CardTitle>
              <CardDescription>
                Fuel prices currently shown on the roadside digital signboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentPrices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentPrices.map((price) => {
                    const fuelHistory = getHistoryForFuelType(price.fuelType);
                    const priceChange = getPriceChange(
                      price.price,
                      fuelHistory
                    );

                    return (
                      <div
                        key={price.fuelType}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Fuel className="h-5 w-5" />
                            <h3 className="font-bold text-lg">
                              {price.fuelType}
                            </h3>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {price.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600 mb-2">
                            ₵{price.price.toFixed(3)}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            per liter
                          </div>
                          {priceChange.previous && (
                            <div className="flex items-center justify-center gap-2">
                              {parseFloat(priceChange.change) > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : parseFloat(priceChange.change) < 0 ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              ) : null}
                              <span
                                className={`text-sm ${
                                  parseFloat(priceChange.change) > 0
                                    ? "text-green-600"
                                    : parseFloat(priceChange.change) < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {parseFloat(priceChange.change) > 0 ? "+" : ""}₵
                                {priceChange.change} ({priceChange.percentage}%)
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            Updated:{" "}
                            {new Date(price.effectiveDate).toLocaleString()}
                          </div>
                          {price.updatedBy && (
                            <div className="text-xs text-muted-foreground">
                              By: {price.updatedBy}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active fuel prices found</p>
                  <p className="text-sm">
                    Add fuel prices to display on signboard
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Prices Tab */}
      {activeTab === "update" && (
        <div className="space-y-6">
          {/* Firebase Sync Section */}
          <Card>
            <CardHeader className="flex">
              <CardTitle>Firebase Realtime Sync</CardTitle>
              <CardDescription>
                Sync MongoDB fuel prices to Firebase displays
              </CardDescription>

              <div className="flex">
                <Button
                  onClick={handleManualSync}
                  className="bg-black text-white"
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Sync Prices
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Firebase Display Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium text-sm mb-2">
                    Display 1 (Petrol)
                  </h4>
                  <p className="text-lg font-semibold">
                    {display1 || "No content set"}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-medium text-sm mb-2">
                    Display 2 (Premium)
                  </h4>
                  <p className="text-lg font-semibold">
                    {display2 || "No content set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Prices Section */}
          <Card>
            <CardHeader>
              <CardTitle>Update Fuel Prices</CardTitle>
              <CardDescription>
                Change the prices displayed on the digital signboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePrice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fuel Type</label>
                    <Select
                      value={priceForm.fuelType}
                      onValueChange={(value) =>
                        setPriceForm((prev) => ({ ...prev, fuelType: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
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
                    <label className="text-sm font-medium">New Price (₵)</label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={priceForm.newPrice}
                      onChange={(e) =>
                        setPriceForm((prev) => ({
                          ...prev,
                          newPrice: e.target.value,
                        }))
                      }
                      placeholder="0.002"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Reason for Change
                    </label>
                    <Input
                      value={priceForm.reason}
                      onChange={(e) =>
                        setPriceForm((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder="Market adjustment, supplier change, etc."
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="bg-black text-white"
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Update Price
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setPriceForm({ fuelType: "", newPrice: "", reason: "" })
                    }
                  >
                    Clear
                  </Button>
                </div>
              </form>

              {priceForm.fuelType && priceForm.newPrice && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Price Change Preview</h4>
                  {(() => {
                    const currentPrice =
                      currentPrices.find(
                        (p) => p.fuelType === priceForm.fuelType
                      )?.price || 0;
                    const newPrice = parseFloat(priceForm.newPrice);
                    const change = newPrice - currentPrice;
                    const percentage =
                      currentPrice > 0
                        ? ((change / currentPrice) * 100).toFixed(3)
                        : "0.00";

                    return (
                      <div className="text-sm">
                        <p>
                          {priceForm.fuelType}: ₵{currentPrice.toFixed(3)} → ₵
                          {newPrice.toFixed(3)}
                        </p>
                        <p
                          className={
                            change > 0
                              ? "text-red-600"
                              : change < 0
                              ? "text-green-600"
                              : "text-gray-600"
                          }
                        >
                          Change: {change > 0 ? "+" : ""}₵{change.toFixed(3)} (
                          {change > 0 ? "+" : ""}
                          {percentage}%)
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Change History</CardTitle>
              <CardDescription>
                Complete history of all fuel price updates from the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {priceHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceHistory.map((entry, index) => (
                      <TableRow
                        key={`${entry.fuelType}-${entry.effectiveDate}-${index}`}
                      >
                        <TableCell>
                          {new Date(entry.effectiveDate).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.fuelType}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ₵{entry.price.toFixed(3)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm px-2 py-1 rounded-full ${
                              entry.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {entry.isActive ? "Active" : "Historical"}
                          </span>
                        </TableCell>
                        <TableCell>{entry.updatedBy || "System"}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {entry.notes || "No notes"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No price history available</p>
                  <p className="text-sm">Price changes will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DigitalSignboardManagement;
