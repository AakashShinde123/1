// import React, { useState, useRef } from 'react';
// import * as XLSX from 'xlsx';

// // Define the data structure for each item in the table
// interface TableRow {
//   id: number;
//   itemName: string;
//   price: string;
//   mfgDate: string;
//   expDate: string;
//   noOfPrints: number;
// }

// const LabelPrintingSystem: React.FC = () => {
//   const [tableData, setTableData] = useState<TableRow[]>([
//     { id: 1, itemName: '', price: '', mfgDate: '', expDate: '', noOfPrints: 1 }
//   ]);
//   const [labelsToPrint, setLabelsToPrint] = useState<TableRow[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const labelContainerRef = useRef<HTMLDivElement>(null); // Ref to get the label HTML

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target?.result as ArrayBuffer);
//         const workbook = XLSX.read(data, { type: 'array' });
//         const ws = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData: any[] = XLSX.utils.sheet_to_json(ws);
        
//         const formattedData: TableRow[] = jsonData.map((row, index) => ({
//           id: index + 1,
//           itemName: String(row['Item Name'] || ''),
//           price: String(row['Price'] || ''),
//           mfgDate: formatDateFromExcel(row['Mfg Date']),
//           expDate: formatDateFromExcel(row['Exp Date']),
//           noOfPrints: Number(row['No of Prints'] || 1)
//         }));
//         setTableData(formattedData);
//       } catch (error) {
//         alert('Error reading Excel file.');
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const formatDateFromExcel = (excelDate: any): string => {
//     if (!excelDate) return '';
//     if (typeof excelDate === 'number') {
//       const date = new Date((excelDate - 25569) * 86400 * 1000);
//       return date.toISOString().split('T')[0];
//     }
//     return String(excelDate);
//   };

//   const handleTableChange = (id: number, field: keyof TableRow, value: string | number) => {
//     setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
//   };
  
//   const addTableRow = () => {
//     const newId = tableData.length > 0 ? Math.max(...tableData.map(row => row.id)) + 1 : 1;
//     setTableData(prev => [...prev, { id: newId, itemName: '', price: '', mfgDate: '', expDate: '', noOfPrints: 1 }]);
//   };
  
//   const removeTableRow = (id: number) => {
//     if (tableData.length > 1) {
//       setTableData(prev => prev.filter(row => row.id !== id));
//     }
//   };

//   const generateLabels = () => {
//     const generated: TableRow[] = [];
//     tableData.forEach(row => {
//       if (row.itemName.trim() !== '') {
//         for (let i = 0; i < row.noOfPrints; i++) {
//           generated.push(row);
//         }
//       }
//     });
//     setLabelsToPrint(generated);
//     if (generated.length > 0) {
//        alert(`Generated ${generated.length} total labels! You can now print.`);
//     } else {
//        alert("Please enter an Item Name before generating labels.");
//     }
//   };

//   const handlePrint = () => {
//     if (!labelContainerRef.current) {
//         alert("Could not find labels to print.");
//         return;
//     }

//     const labelsHtml = labelContainerRef.current.innerHTML;
//     const printStyles = `
//         <style>
//             @page {
//                 size: 85mm 55mm;
//                 margin: 0;
//             }
//             body {
//                 margin: 0;
//             }
//             .label {
//                 width: 85mm;
//                 height: 55mm;
//                 padding: 3mm;
//                 box-sizing: border-box;
//                 overflow: hidden;
//                 font-family: Arial, Helvetica, sans-serif;
//                 color: black;
//                 background: white;
//                 display: flex;
//                 flex-direction: column;
//                 page-break-after: always;
//                 page-break-inside: avoid !important;
//             }
//             .label-header { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 2mm; }
//             .brand-name { font-size: 14pt; font-weight: bold; }
//             .brand-division { font-size: 7pt; }
//             .reg-info { font-size: 7pt; text-align: right; }
//             .label-body { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
//             .product-name { font-size: 22pt; font-weight: bold; text-align: center; margin: 4mm 0; text-transform: uppercase; }
//             .details-grid { font-size: 10pt; }
//             .detail-row { display: flex; justify-content: space-between; padding: 1mm 0; }
//             .detail-label { font-weight: bold; }
//             .detail-value { text-align: right; }
//         </style>
//     `;

//     const printWindow = window.open('', '_blank', 'height=600,width=800');
//     if (printWindow) {
//         printWindow.document.write('<html><head><title>Print Labels</title>');
//         printWindow.document.write(printStyles);
//         printWindow.document.write('</head><body>');
//         printWindow.document.write(labelsHtml);
//         printWindow.document.write('</body></html>');
//         printWindow.document.close();
//         printWindow.focus();
//         setTimeout(() => {
//             printWindow.print();
//             printWindow.close();
//         }, 250);
//     }
//   };
  
//   const formatDateForDisplay = (dateString: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const totalLabels = tableData.reduce((sum, item) => sum + (item.noOfPrints || 0), 0);
  
//   return (
//     <div className="container">
//       <h1>Label Printing System</h1>
//       <div className="controls">
//         <h3>Upload Excel or Enter Manually</h3>
//         <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />
//         <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>📤 Upload Excel File</button>
//         <p className="file-info">Expected columns: Item Name, Price, Mfg Date, Exp Date, No of Prints</p>
//       </div>
      
//       <div className="table-section">
//         <table className="data-table">
//             <thead>
//                 <tr>
//                     <th>Item Name *</th>
//                     <th>Price (₹)</th>
//                     <th>Mfg Date</th>
//                     <th>Exp Date</th>
//                     <th>No of Prints</th>
//                     <th>Action</th>
//                 </tr>
//             </thead>
//             <tbody>
//             {tableData.map((row) => (
//                 <tr key={row.id}>
//                     <td><input type="text" value={row.itemName} placeholder="e.g., Kaju" onChange={e => handleTableChange(row.id, 'itemName', e.target.value)} /></td>
//                     <td><input type="text" value={row.price} placeholder="e.g., 111" onChange={e => handleTableChange(row.id, 'price', e.target.value)} /></td>
//                     <td><input type="date" value={row.mfgDate} onChange={e => handleTableChange(row.id, 'mfgDate', e.target.value)} /></td>
//                     <td><input type="date" value={row.expDate} onChange={e => handleTableChange(row.id, 'expDate', e.target.value)} /></td>
//                     <td><input type="number" min="1" value={row.noOfPrints} onChange={e => handleTableChange(row.id, 'noOfPrints', parseInt(e.target.value) || 1)} style={{width: '70px'}}/></td>
//                     <td><button className="btn-remove" onClick={() => removeTableRow(row.id)} disabled={tableData.length === 1}>Remove</button></td>
//                 </tr>
//             ))}
//             </tbody>
//         </table>
//         <div className="table-actions">
//             <button className="btn-add" onClick={addTableRow}>+ Add Row</button>
//             <div className="total-info">Total Labels to Generate: <strong>{totalLabels}</strong></div>
//         </div>
//       </div>

//       <div className="main-actions">
//         <button className="btn-generate" onClick={generateLabels}>🔄 Generate Labels</button>
//         <button className="btn-print" onClick={handlePrint}>🖨️ Print Labels</button>
//       </div>
      
//       {labelsToPrint.length > 0 && (
//         <div className="preview-section">
//           <h3>Label Preview</h3>
//           <div className="label-container" ref={labelContainerRef}>
//             {labelsToPrint.map((label, index) => (
//               <div className="label" key={index}>
//                 <div className="label-header">
//                   <div className="brand-info">
//                     <div className="brand-name">SUDHAMRIT</div>
//                     <div className="brand-division">(A DIVISION OF SUDHASTAR)</div>
//                   </div>
//                   <div className="reg-info">
//                     <div>FSSAI: 21523014001786</div>
//                     <div>GST: 27AAAAS0976Q1ZU</div>
//                   </div>
//                 </div>
//                 <div className="label-body">
//                   <div className="product-name">{label.itemName}</div>
//                   <div className="details-grid">
//                     <div className="detail-row">
//                       <span className="detail-label">MFG DATE:</span>
//                       <span className="detail-value">{formatDateForDisplay(label.mfgDate)}</span>
//                     </div>
//                     <div className="detail-row">
//                       <span className="detail-label">BEST BEFORE:</span>
//                       <span className="detail-value">{formatDateForDisplay(label.expDate)}</span>
//                     </div>
//                     <div className="detail-row">
//                       <span className="detail-label">PRICE:</span>
//                       <span className="detail-value">{label.price ? `₹${label.price}` : '_'}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       <style>{`
//         /* --- Global Styles --- */
//         body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
//         .container { max-width: 1200px; margin: 20px auto; padding: 25px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
//         h1 { text-align: center; color: #333; }
        
//         /* --- NEW: Styles for Main UI Sections --- */
//         .controls, .table-section, .main-actions {
//             margin-bottom: 25px;
//             padding: 20px;
//             background-color: #f8f9fa;
//             border: 1px solid #dee2e6;
//             border-radius: 8px;
//         }
//         h3 {
//             margin-top: 0;
//             margin-bottom: 15px;
//             color: #343a40;
//             border-bottom: 1px solid #e9ecef;
//             padding-bottom: 10px;
//         }
//         button {
//             border: none;
//             border-radius: 5px;
//             padding: 10px 15px;
//             font-size: 14px;
//             font-weight: bold;
//             cursor: pointer;
//             transition: all 0.2s ease-in-out;
//         }
//         .btn-upload { background-color: #28a745; color: white; }
//         .btn-upload:hover { background-color: #218838; }
//         .btn-add { background-color: #007bff; color: white; }
//         .btn-add:hover { background-color: #0069d9; }
//         .btn-remove { background-color: #dc3545; color: white; padding: 8px 12px; }
//         .btn-remove:hover { background-color: #c82333; }
//         .btn-generate { background-color: #17a2b8; color: white; padding: 12px 25px; }
//         .btn-generate:hover { background-color: #138496; }
//         .btn-print { background-color: #6c757d; color: white; padding: 12px 25px; }
//         .btn-print:hover { background-color: #5a6268; }
//         .file-info { font-size: 13px; color: #6c757d; margin-top: 10px; }
        
//         /* --- NEW: Data Table Styles --- */
//         .table-section { overflow-x: auto; }
//         .data-table { width: 100%; border-collapse: collapse; }
//         .data-table th, .data-table td { border: 1px solid #dee2e6; padding: 12px; text-align: left; vertical-align: middle; }
//         .data-table th { background-color: #f8f9fa; color: #495057; font-weight: 600; }
//         .data-table input {
//             width: 100%; border: 1px solid #ced4da; padding: 8px; border-radius: 4px;
//             box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;
//         }
//         .data-table input:focus { outline: none; border-color: #80bdff; box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); }
//         .table-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
//         .total-info { font-weight: bold; color: #343a40; }
        
//         /* --- Label Preview Styles --- */
//         .preview-section { margin-top: 30px; border-top: 2px solid #f0f0f0; padding-top: 20px; }
//         .label-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 10px; }
//         .label {
//             width: 85mm; height: 55mm; border: 1px dashed #ccc; padding: 3mm; box-sizing: border-box;
//             overflow: hidden; background: white; display: flex; flex-direction: column;
//             font-family: Arial, Helvetica, sans-serif; color: black;
//         }
//         .label-header { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 2mm; }
//         .brand-name { font-size: 14pt; font-weight: bold; }
//         .brand-division { font-size: 7pt; }
//         .reg-info { font-size: 7pt; text-align: right; }
//         .label-body { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
//         .product-name { font-size: 22pt; font-weight: bold; text-align: center; margin: 4mm 0; text-transform: uppercase; }
//         .details-grid { font-size: 10pt; }
//         .detail-row { display: flex; justify-content: space-between; padding: 1mm 0; }
//         .detail-label { font-weight: bold; }
//         .detail-value { text-align: right; }

//         /* A minimal print style is kept in case the user hits Ctrl+P by mistake */
//         @media print {
//             body > .container { display: none; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LabelPrintingSystem;

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LabelData {
  itemName: string;
  price: string;
  mfgDate: string;
  expDate: string;
  noOfPrints: number;
}

interface TableRow {
  id: number;
  itemName: string;
  price: string;
  mfgDate: string;
  expDate: string;
  noOfPrints: number;
}

const LabelPrintingSystem: React.FC = () => {
  const [tableData, setTableData] = useState<TableRow[]>([
    { id: 1, itemName: '', price: '', mfgDate: '', expDate: '', noOfPrints: 1 }
  ]);
  const [labels, setLabels] = useState<LabelData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelsContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        const formattedData: TableRow[] = jsonData.map((row, index) => ({
          id: index + 1,
          itemName: String(row['Item Name'] || row['itemName'] || row['ITEM NAME'] || ''),
          price: String(row['Price'] || row['price'] || row['PRICE'] || ''),
          mfgDate: formatDateFromExcel(row['Mfg Date'] || row['mfgDate'] || row['Manufacturing Date'] || row['MFG DATE'] || ''),
          expDate: formatDateFromExcel(row['Exp Date'] || row['expDate'] || row['Expiry Date'] || row['EXP DATE'] || ''),
          noOfPrints: Number(row['No of Prints'] || row['noOfPrints'] || row['Prints'] || row['NO OF PRINTS'] || 1)
        }));

        setTableData(formattedData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Error reading Excel file. Please make sure it\'s a valid Excel file with proper columns.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatDateFromExcel = (excelDate: any): string => {
    if (!excelDate) return '';
    if (typeof excelDate === 'string') { return excelDate; }
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return '';
  };

  const handleTableChange = (id: number, field: keyof TableRow, value: string | number) => {
    setTableData(prev => 
      prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const addTableRow = () => {
    const newId = tableData.length > 0 ? Math.max(...tableData.map(row => row.id)) + 1 : 0;
    setTableData(prev => [
      ...prev,
      { id: newId, itemName: '', price: '', mfgDate: '', expDate: '', noOfPrints: 1 }
    ]);
  };

  const removeTableRow = (id: number) => {
    if (tableData.length > 1) {
      setTableData(prev => prev.filter(row => row.id !== id));
    }
  };

  const generateLabels = () => {
    const invalidRows = tableData.filter(row => !row.itemName.trim());
    if (invalidRows.length > 0) {
      alert('Please fill Item Name for all rows.');
      return;
    }

    const generatedLabels: LabelData[] = [];
    tableData.forEach(item => {
      for (let i = 0; i < item.noOfPrints; i++) {
        generatedLabels.push({
          itemName: item.itemName,
          price: item.price,
          mfgDate: item.mfgDate,
          expDate: item.expDate,
          noOfPrints: 1
        });
      }
    });

    setLabels(generatedLabels);
  };

  const printAllLabels = () => {
    if (!labelsContainerRef.current) {
        alert("Could not find labels to print.");
        return;
    }

    const labelsHtml = labelsContainerRef.current.innerHTML;
    const printStyles = `
        <style>
            @page { size: 85mm 50mm; margin: 0; }
            body { margin: 0; }
            .label-preview {
                width: 85mm; height: 50mm; background-color: white; font-family: Arial, sans-serif;
                display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden;
                page-break-after: always; page-break-inside: avoid !important;
            }
            .label-border { width: 100%; height: 100%; border: 2px solid #000; box-sizing: border-box; display: flex; }
            .label-content { width: 100%; padding: 10px; display: flex; flex-direction: column; box-sizing: border-box; }
            .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }
            .left-section { text-align: left; flex: 1; }
            .right-section { text-align: right; flex: 1; }
            .company-name { font-size: 16px; font-weight: bold; margin-bottom: 1px; line-height: 1.1; }
            .company-subtitle { font-size: 9px; line-height: 1.1; }
            .fssai, .gst { font-size: 8px; line-height: 1.1; margin-bottom: 1px; }
            .product-name { font-size: 18px; font-weight: bold; text-align: center; margin: 10px 0; text-transform: uppercase; line-height: 1.1; flex-shrink: 0; }
            .details-section { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
            .detail-row { display: flex; justify-content: space-between; font-size: 11px; line-height: 1.2; padding: 2px 0; }
            .price-row { margin-top: 8px; padding-top: 6px; border-top: 1px solid #ddd; font-weight: bold; }
            .detail-label { font-weight: bold; }
            .detail-value { text-align: right; }
            .price-value { font-size: 14px; font-weight: bold; color: #e74c3c; }
        </style>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Print Labels</title>');
        printWindow.document.write(printStyles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(labelsHtml);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { 
            printWindow.print();
            printWindow.close();
        }, 250);
    }
  };

  const generatePDF = async () => {
    const labelsToProcess = document.querySelectorAll('.label-preview') as NodeListOf<HTMLElement>;
    if (labelsToProcess.length === 0) {
      alert('No labels to generate PDF.');
      return;
    }
    const pdf = new jsPDF('p', 'a4');
    for (let i = 0; i < labelsToProcess.length; i++) {
      const label = labelsToProcess[i];
      const canvas = await html2canvas(label, { scale: 3 });
      const imgData = canvas.toDataURL('image/png', 1.0);
      if (i > 0) { pdf.addPage(); }
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const labelWidth = 85;
      const labelHeight = 50;
      const x = (pageWidth - labelWidth) / 2;
      const y = (pageHeight - labelHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight);
    }
    pdf.save('sudhamrit-labels.pdf');
  };

  const resetForm = () => {
    setTableData([{ id: 1, itemName: '', price: '', mfgDate: '', expDate: '', noOfPrints: 1 }]);
    setLabels([]);
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.includes('/')) { return dateString; }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const totalLabels = tableData.reduce((sum, item) => sum + item.noOfPrints, 0);

  return (
    <div className="container">
      <h1>Label Printing System</h1>
      <div className="upload-section">
        <h3>Upload Excel File or Enter Data Manually</h3>
        <div className="upload-options">
          <div className="excel-upload">
            <p>Upload Excel file with product data:</p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
            <button className="upload-btn" onClick={triggerFileInput}>Upload Excel File</button>
            <div className="file-info">
              <p><strong>Expected columns:</strong> Item Name, Price, Mfg Date, Exp Date, No of Prints</p>
            </div>
          </div>
          <div className="manual-entry">
            <p>Or enter data manually in the table below:</p>
          </div>
        </div>
      </div>
      <div className="table-section">
        <h3>Product Data</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name *</th>
                <th>Price (₹)</th>
                <th>Mfg Date</th>
                <th>Exp Date</th>
                <th>No of Prints</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td><input type="text" value={row.itemName} onChange={(e) => handleTableChange(row.id, 'itemName', e.target.value)} placeholder="Enter item name" required /></td>
                  <td><input type="text" value={row.price} onChange={(e) => handleTableChange(row.id, 'price', e.target.value)} placeholder="e.g., 450" /></td>
                  <td>
                    <input type="date" value={row.mfgDate.includes('/') ? '' : row.mfgDate} onChange={(e) => handleTableChange(row.id, 'mfgDate', e.target.value)} />
                    {row.mfgDate.includes('/') && (<div className="date-display">{row.mfgDate}</div>)}
                  </td>
                  <td>
                    <input type="date" value={row.expDate.includes('/') ? '' : row.expDate} onChange={(e) => handleTableChange(row.id, 'expDate', e.target.value)} />
                    {row.expDate.includes('/') && (<div className="date-display">{row.expDate}</div>)}
                  </td>
                  <td><input type="number" value={row.noOfPrints} onChange={(e) => handleTableChange(row.id, 'noOfPrints', parseInt(e.target.value) || 1)} min="1" max="100" className="no-of-prints" /></td>
                  <td><button className="remove-btn" onClick={() => removeTableRow(row.id)} disabled={tableData.length === 1}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-actions">
          <button className="add-row-btn" onClick={addTableRow}>+ Add Another Row</button>
          <div className="total-info">Total labels to generate: <strong>{totalLabels}</strong></div>
        </div>
        <div className="actions">
          <button className="generate-btn" onClick={generateLabels}>Generate Labels ({totalLabels} total labels)</button>
          <button className="reset-btn" onClick={resetForm}>Reset All</button>
        </div>
      </div>
      {labels.length > 0 && (
        <div className="preview-section">
          <h3 className="preview-title">Label Preview ({labels.length} labels generated)</h3>
          <div className="actions">
            <button className="print-btn" onClick={printAllLabels}>Print All Labels</button>
            <button className="pdf-btn" onClick={generatePDF}>Download PDF</button>
          </div>
          <div className="labels-container" ref={labelsContainerRef}>
            {labels.map((label, index) => (
              <div key={index} className="label-preview">
                <div className="label-border">
                  <div className="label-content">
                    <div className="header-section">
                      <div className="left-section"><div className="company-name">SUDHAMRIT</div><div className="company-subtitle">(A DIVISION OF SUDHASTAR)</div></div>
                      <div className="right-section"><div className="fssai">FSSAI: 21523014001786</div><div className="gst">GST: 27AAAAS0976Q1ZU</div></div>
                    </div>
                    <div className="product-name">{label.itemName}</div>
                    <div className="details-section">
                      {label.mfgDate && (<div className="detail-row"><span className="detail-label">MFG DATE:</span><span className="detail-value">{formatDate(label.mfgDate)}</span></div>)}
                      {label.expDate && (<div className="detail-row"><span className="detail-label">BEST BEFORE:</span><span className="detail-value">{formatDate(label.expDate)}</span></div>)}
                      {label.price && (<div className="detail-row price-row"><span className="detail-label">PRICE:</span><span className="detail-value price-value">₹{label.price}</span></div>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); padding: 30px; }
        h1 { text-align: center; margin-bottom: 30px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h3 { margin-bottom: 20px; color: #2c3e50; }
        .upload-section { margin-bottom: 30px; padding: 25px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; }
        .upload-options { display: flex; flex-direction: column; gap: 20px; }
        .excel-upload, .manual-entry { padding: 15px; background: white; border-radius: 6px; border: 1px solid #ddd; }
        .file-info { margin-top: 10px; font-size: 14px; color: #666; }
        .hidden { display: none; }
        .upload-btn, .generate-btn, .print-btn, .pdf-btn, .reset-btn, .add-row-btn, .remove-btn {
          padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin: 5px;
        }
        .upload-btn { background-color: #3498db; color: white; }
        .upload-btn:hover { background-color: #2980b9; }
        .generate-btn, .print-btn { background-color: #2ecc71; color: white; }
        .generate-btn:hover, .print-btn:hover { background-color: #27ae60; }
        .pdf-btn { background-color: #9b59b6; color: white; }
        .pdf-btn:hover { background-color: #8e44ad; }
        .reset-btn { background-color: #e74c3c; color: white; }
        .reset-btn:hover { background-color: #c0392b; }
        .add-row-btn { background-color: #9b59b6; color: white; }
        .add-row-btn:hover { background-color: #8e44ad; }
        .remove-btn { background-color: #e67e22; color: white; padding: 6px 12px; font-size: 12px; }
        .remove-btn:hover:not(:disabled) { background-color: #d35400; }
        .remove-btn:disabled { background-color: #bdc3c7; cursor: not-allowed; }
        .table-section { margin-bottom: 30px; padding: 25px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; }
        .table-container { overflow-x: auto; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 6px; background: white; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef; }
        .data-table th { background-color: #3498db; color: white; font-weight: 600; font-size: 14px; }
        .data-table input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        .data-table input:focus { outline: none; border-color: #3498db; box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2); }
        .no-of-prints { width: 70px !important; }
        .date-display { font-size: 12px; color: #666; margin-top: 4px; }
        .table-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .total-info { font-size: 16px; color: #2c3e50; }
        .actions { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        .preview-section { margin-bottom: 30px; }
        .preview-title { font-size: 20px; margin-bottom: 15px; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; text-align: center; }
        .labels-container { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-top: 20px; }
        .label-preview {
          width: 321px; height: 189px; background-color: white; page-break-inside: avoid;
          font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center;
          box-sizing: border-box; overflow: hidden;
        }
        .label-border { width: 100%; height: 100%; border: 2px solid #000; display: flex; align-items: center; justify-content: center; }
        .label-content { width: 100%; height: 100%; padding: 10px; display: flex; flex-direction: column; box-sizing: border-box; }
        .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }
        .left-section { text-align: left; flex: 1; }
        .right-section { text-align: right; flex: 1; }
        .company-name { font-size: 16px; font-weight: bold; margin-bottom: 1px; line-height: 1.1; }
        .company-subtitle { font-size: 9px; line-height: 1.1; }
        .fssai, .gst { font-size: 8px; line-height: 1.1; margin-bottom: 1px; }
        .product-name { font-size: 18px; font-weight: bold; text-align: center; margin: 10px 0; text-transform: uppercase; line-height: 1.1; flex-shrink: 0; }
        .details-section { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
        .detail-row { display: flex; justify-content: space-between; font-size: 11px; line-height: 1.2; padding: 2px 0; }
        .price-row { margin-top: 8px; padding-top: 6px; border-top: 1px solid #ddd; font-weight: bold; }
        .detail-label { font-weight: bold; }
        .detail-value { text-align: right; }
        .price-value { font-size: 14px; font-weight: bold; color: #e74c3c; }
      `}</style>
    </div>
  );
};

export default LabelPrintingSystem;
