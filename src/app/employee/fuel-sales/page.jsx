"use client";
import React, { useState, useEffect } from "react";
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
import { Plus, Fuel, Calculator, User, Clock } from "lucide-react";
import { createFuelSale, getFuelSales } from "@/services/fuelSales";

const employeeProfile = {
  name: "John Doe",
  role: "Attendant",
  branch: "Main Branch",
};

function FuelSales() {
  const [showForm, setShowForm] = useState(false);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    async function fetchSales() {
      setLoading(true);
      try {
        const data = await getFuelSales();
        setSales(Array.isArray(data) ? data : []);
      } catch {
        setSales([]);
      }
      setLoading(false);
    }
    fetchSales();
  }, []);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        openingReading: parseFloat(formData.openingReading),
        closingReading: parseFloat(formData.closingReading),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        totalVolume: parseFloat(formData.totalVolume),
        totalAmount: parseFloat(formData.totalAmount),
      };
      await createFuelSale(payload);
      setFormData({
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
      const data = await getFuelSales();
      setSales(Array.isArray(data) ? data : []);
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <main className="flex-1 space-y-4 md:space-y-6">
          <div className="flex flex-col items-center mb-2">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Fuel className="h-6 w-6 md:h-7 md:w-7" />
              Log Fuel Sale
            </h1>
            <p className="text-center text-muted-foreground text-sm md:text-base">
              Enter details for each fuel sale. Only fuel sales are available
              for employees.
            </p>
          </div>
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Fuel Sale Entry</CardTitle>
                <CardDescription>Fill out the form below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
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
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Pump Number</label>
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
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Fuel Type</label>
                      <Select
                        value={formData.fuelType}
                        onValueChange={(value) =>
                          handleInputChange("fuelType", value)
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
                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Attendant Name
                      </label>
                      <Input
                        value={formData.attendant}
                        onChange={(e) =>
                          handleInputChange("attendant", e.target.value)
                        }
                        placeholder="Enter attendant name"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Opening Reading (L)
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
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Closing Reading (L)
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
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Price per Liter (₵)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.pricePerLiter}
                        onChange={(e) =>
                          handleInputChange("pricePerLiter", e.target.value)
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Total Volume (L)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.totalVolume}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Total Amount (₵)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.totalAmount}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 justify-center">
                    <Button
                      type="submit"
                      className="bg-black text-white"
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : "Save Sale"}
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
          {!showForm && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-black text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Sale
              </Button>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                View all fuel sales transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6 text-muted-foreground">
                  Loading sales...
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No sales recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {new Date(sale.dateTime).toLocaleString()}
                          </TableCell>
                          <TableCell>{sale.pumpNumber}</TableCell>
                          <TableCell>{sale.fuelType}</TableCell>
                          <TableCell>
                            {Number(sale.totalVolume).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            ₵{Number(sale.pricePerLiter).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₵{Number(sale.totalAmount).toFixed(2)}
                          </TableCell>
                          <TableCell>{sale.attendant}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        {/* <aside className="w-full md:w-64 mt-4 md:mt-0">
          <Card className="shadow-md pt-2 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer">
            <CardContent>
              <div className="flex flex-col items-center gap-1">
                <div className="text-lg font-semibold">
                  {employeeProfile.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {employeeProfile.role}
                </div>
                <div className="text-xs text-muted-foreground">
                  {employeeProfile.branch}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside> */}
      </div>
    </div>
  );
}

export default FuelSales;
