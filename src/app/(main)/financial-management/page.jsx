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
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  FileText,
  Calculator,
  Loader2,
} from "lucide-react";
import {
  getTransactions,
  createTransaction,
  getFinancialStats,
} from "@/services/financial";
import { getFuelSalesStats } from "@/services/fuelSales";

function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    today: { income: 0, expenses: 0, netIncome: 0, fuelSalesRevenue: 0 },
    monthly: { income: 0, expenses: 0, netIncome: 0 },
    recentTransactions: [],
  });

  const [transactions, setTransactions] = useState([]);

  const [transactionForm, setTransactionForm] = useState({
    type: "",
    category: "",
    description: "",
    amount: "",
    paymentMethod: "",
    reference: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // Load data on component mount
  useEffect(() => {
    loadTransactions();
    loadStats();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await getTransactions({ limit: 50 });
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load financial stats and fuel sales stats in parallel
      const [financialResponse, fuelSalesResponse] = await Promise.all([
        getFinancialStats(),
        getFuelSalesStats(),
      ]);

      const financialData = financialResponse.success
        ? financialResponse.data
        : {};
      const fuelSalesData = fuelSalesResponse.success
        ? fuelSalesResponse.data
        : {};

      setStats({
        today: {
          income: financialData.today?.income || 0,
          expenses: financialData.today?.expenses || 0,
          netIncome: financialData.today?.netIncome || 0,
          fuelSalesRevenue: fuelSalesData.totalSalesAmount || 0,
        },
        monthly: {
          income: financialData.monthly?.income || 0,
          expenses: financialData.monthly?.expenses || 0,
          netIncome: financialData.monthly?.netIncome || 0,
        },
        recentTransactions: financialData.recentTransactions || [],
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };


  const incomeCategories = [
    "Fuel Sales",
    "Other Income",
    "Investment Returns",
  ];

  const expenseCategories = [
    "Fuel Purchase",
    "Utilities",
    "Salaries",
    "Maintenance",
    "Insurance",
    "Rent",
    "Marketing",
    "Other Expenses",
  ];

  const paymentMethods = [
    "cash",
    "bank_transfer",
    "mobile_money",
    "cheque",
    "card",
  ];

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const transactionData = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        recordedBy: "Current User", // You might want to get this from auth context
        reference:
          transactionForm.reference ||
          `${transactionForm.type.toUpperCase().slice(0, 2)}-${new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "")}-${String(transactions.length + 1).padStart(
            3,
            "0"
          )}`,
      };

      const response = await createTransaction(transactionData);
      if (response.success) {
        setTransactions((prev) => [response.data, ...prev]);
        toast.success("Transaction recorded successfully");

        // Reset form
        setTransactionForm({
          type: "",
          category: "",
          description: "",
          amount: "",
          paymentMethod: "",
          reference: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setShowTransactionForm(false);

        // Refresh stats
        loadStats();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to record transaction"
      );
    } finally {
      setSaving(false);
    }
  };

  // Financial calculations - use stats from API or calculate locally
  const todaysIncome = stats.today?.income || 0;
  const todaysExpenses = stats.today?.expenses || 0;
  const monthlyIncome = stats.monthly?.income || 0;
  const monthlyExpenses = stats.monthly?.expenses || 0;
  const fuelSalesRevenue = stats.today?.fuelSalesRevenue || 0;


  const cashBalance = transactions
    .filter((t) => t.paymentMethod === "cash")
    .reduce(
      (sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount),
      0
    );

  const bankBalance = transactions
    .filter((t) => t.paymentMethod === "bank_transfer")
    .reduce(
      (sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount),
      0
    );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Financial Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track income, expenses, and financial performance
          </p>
        </div>
        <Button
          onClick={() => setShowTransactionForm(true)}
          className="bg-black text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        {["overview", "transactions"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className="rounded-b-none"
          >
            {tab.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    todaysIncome - todaysExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₵{(todaysIncome - todaysExpenses).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Income - Expenses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    monthlyIncome - monthlyExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₵{(monthlyIncome - monthlyExpenses).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Cash Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{cashBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Cash on hand</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Bank Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{bankBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Bank transfers</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>Income</span>
                    </div>
                    <span className="font-medium text-green-600">
                      ₵{todaysIncome.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span>Expenses</span>
                    </div>
                    <span className="font-medium text-red-600">
                      ₵{todaysExpenses.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Net Profit</span>
                      <span
                        className={
                          todaysIncome - todaysExpenses >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        ₵{(todaysIncome - todaysExpenses).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash & Bank Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <span>Cash on Hand</span>
                    </div>
                    <span className="font-medium">
                      ₵{cashBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Bank Account</span>
                    </div>
                    <span className="font-medium">
                      ₵{bankBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Available</span>
                      <span>₵{(cashBalance + bankBalance).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          {/* Transaction Form */}
          {showTransactionForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Transaction</CardTitle>
                <CardDescription>
                  Record income or expense transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Transaction Type
                      </label>
                      <Select
                        value={transactionForm.type}
                        onValueChange={(value) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            type: value,
                            category: "",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={transactionForm.category}
                        onValueChange={(value) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                        disabled={!transactionForm.type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(transactionForm.type === "income"
                            ? incomeCategories
                            : expenseCategories
                          ).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (₵)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={transactionForm.amount}
                        onChange={(e) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Payment Method
                      </label>
                      <Select
                        value={transactionForm.paymentMethod}
                        onValueChange={(value) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            paymentMethod: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem value="mobile_money">
                            Mobile Money
                          </SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={transactionForm.date}
                        onChange={(e) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={transactionForm.description}
                        onChange={(e) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter transaction description"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="bg-black text-white">
                      Add Transaction
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTransactionForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All income and expense transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === "income" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.type.charAt(0).toUpperCase() +
                              transaction.type.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}₵
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {transaction.paymentMethod.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {transaction.reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FinancialManagement;
