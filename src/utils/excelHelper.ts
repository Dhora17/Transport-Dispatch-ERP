import * as XLSX from 'xlsx';
import { DispatchRecord } from '../types';

export const exportToExcel = (data: DispatchRecord[], filename: string) => {
  // Map our database schema into clean, reader-friendly Excel column headers
  const cleanData = data.map(item => ({
    'Dispatch Date': item.date,
    'LR Number': item.lrNo,
    'From Location': item.from,
    'Customer Name': item.customerName,
    'Destination': item.destination,
    'Invoice Number': item.invoiceNo,
    'Truck Number': item.truckNo,
    'Loaded Quantity (MT)': item.loadedQty,
    'Paid Quantity (MT)': item.paidQty,
    'Samrat Bill Quantity (MT)': item.samratBillQty,
    'Our Payout Rate (INR)': item.ourRate,
    'Samrat Rate (INR)': item.samratRate,
    'Transporter Payout (INR)': item.paidAmount,
    'Samrat Bill Amount (INR)': item.samratBillAmount,
    'Net Profit (INR)': item.profit,
    'Transporter Name': item.transporterName
  }));

  const worksheet = XLSX.utils.json_to_sheet(cleanData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dispatch Log");
  
  // Output and download spreadsheet file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
export default exportToExcel;
