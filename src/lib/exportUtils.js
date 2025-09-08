import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const formatted = value?.toString() || "";
          return formatted.includes(",") ? `"${formatted}"` : formatted;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data, filename, sheetName = "Sheet1") => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const generatePDFReport = (reportType, data, dateRange) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFontSize(20);
  doc.text(reportType, pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    30,
    { align: "center" }
  );
  
  if (dateRange) {
    doc.text(
      `Period: ${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(
        dateRange.endDate
      ).toLocaleDateString()}`,
      pageWidth / 2,
      35,
      { align: "center" }
    );
  }

  let startY = 45;

  switch (reportType) {
    case "Daily Sales Report":
      generateDailySalesPDF(doc, data, startY);
      break;
    case "Inventory Report":
      generateInventoryPDF(doc, data, startY);
      break;
    case "Profit & Loss Statement":
      generateProfitLossPDF(doc, data, startY);
      break;
    default:
      doc.text("No data available", pageWidth / 2, startY, { align: "center" });
  }

  doc.save(`${reportType.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
};

const generateDailySalesPDF = (doc, salesData, startY) => {
  if (!salesData || salesData.length === 0) {
    doc.text("No sales data available", 14, startY);
    return;
  }

  const tableColumns = [
    "Date",
    "Total Sales (₵)",
    "Petrol (₵)",
    "Diesel (₵)",
    "Premium (₵)",
    "Transactions",
  ];

  const tableRows = salesData.map((day) => [
    new Date(day.date).toLocaleDateString(),
    day.totalSales.toFixed(2),
    day.petrol.toFixed(2),
    day.diesel.toFixed(2),
    day.premium.toFixed(2),
    day.transactions.toString(),
  ]);

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: startY,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  const finalY = (doc.previousAutoTable?.finalY || startY + 100) + 10;
  
  const totalSales = salesData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0);
  
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text(`Total Sales: ₵${totalSales.toFixed(2)}`, 14, finalY);
  doc.text(`Total Transactions: ${totalTransactions}`, 14, finalY + 5);
};

const generateInventoryPDF = (doc, inventoryData, startY) => {
  if (!inventoryData || inventoryData.length === 0) {
    doc.text("No inventory data available", 14, startY);
    return;
  }

  const tableColumns = [
    "Fuel Type",
    "Opening Stock (L)",
    "Stock In (L)",
    "Stock Out (L)",
    "Closing Stock (L)",
    "Value (₵)",
  ];

  const tableRows = inventoryData.map((item) => [
    item.fuelType,
    item.openingStock.toFixed(2),
    item.stockIn.toFixed(2),
    item.stockOut.toFixed(2),
    item.closingStock.toFixed(2),
    item.value.toFixed(2),
  ]);

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: startY,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  const finalY = (doc.previousAutoTable?.finalY || startY + 100) + 10;
  
  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);
  const totalClosingStock = inventoryData.reduce((sum, item) => sum + item.closingStock, 0);
  
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text(`Total Stock: ${totalClosingStock.toFixed(2)} L`, 14, finalY);
  doc.text(`Total Value: ₵${totalValue.toFixed(2)}`, 14, finalY + 5);
};

const generateProfitLossPDF = (doc, financialData, startY) => {
  if (!financialData) {
    doc.text("No financial data available", 14, startY);
    return;
  }

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Revenue", 14, startY);
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Fuel Sales: ₵${financialData.totalRevenue.toFixed(2)}`, 20, startY + 7);
  
  doc.setFont(undefined, "bold");
  doc.text(`Total Revenue: ₵${financialData.totalRevenue.toFixed(2)}`, 20, startY + 14);
  
  doc.setFontSize(12);
  doc.text("Expenses", 14, startY + 25);
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  const cogs = financialData.totalRevenue - financialData.grossProfit;
  doc.text(`Cost of Goods Sold: ₵${cogs.toFixed(2)}`, 20, startY + 32);
  doc.text(`Operating Expenses: ₵${financialData.totalExpenses.toFixed(2)}`, 20, startY + 39);
  
  doc.setFont(undefined, "bold");
  doc.text(`Total Expenses: ₵${financialData.totalExpenses.toFixed(2)}`, 20, startY + 46);
  
  doc.setFontSize(12);
  doc.text("Summary", 14, startY + 57);
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Gross Profit: ₵${financialData.grossProfit.toFixed(2)}`, 20, startY + 64);
  
  doc.setFont(undefined, "bold");
  doc.text(`Net Profit: ₵${financialData.netProfit.toFixed(2)}`, 20, startY + 71);
  doc.text(`Profit Margin: ${financialData.profitMargin.toFixed(2)}%`, 20, startY + 78);

  if (financialData.incomeByCategory && Object.keys(financialData.incomeByCategory).length > 0) {
    doc.setFontSize(12);
    doc.text("Income by Category", 14, startY + 90);
    
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    let yPos = startY + 97;
    Object.entries(financialData.incomeByCategory).forEach(([category, amount]) => {
      doc.text(`${category}: ₵${amount.toFixed(2)}`, 20, yPos);
      yPos += 7;
    });
  }
};

export const generateQuickReport = (reportType, format, data, dateRange) => {
  switch (format.toLowerCase()) {
    case "pdf":
      generatePDFReport(reportType, data, dateRange);
      break;
    case "excel":
      exportToExcel(data, reportType.replace(/\s+/g, "_"));
      break;
    case "csv":
      exportToCSV(data, reportType.replace(/\s+/g, "_"));
      break;
    default:
      console.error("Unsupported format:", format);
  }
};