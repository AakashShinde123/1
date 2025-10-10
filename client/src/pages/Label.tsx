import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

// Define the data structure for each item in the table
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
  const [labelsToPrint, setLabelsToPrint] = useState<TableRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null); // Ref to get the label HTML

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws);
        
        const formattedData: TableRow[] = jsonData.map((row, index) => ({
          id: index + 1,
          itemName: String(row['Item Name'] || ''),
          price: String(row['Price'] || ''),
          mfgDate: formatDateFromExcel(row['Mfg Date']),
          expDate: formatDateFromExcel(row['Exp Date']),
          noOfPrints: Number(row['No of Prints'] || 1)
        }));
        setTableData(formattedData);
      } catch (error) {
        alert('Error reading Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatDateFromExcel = (excelDate: any): string => {
    if (!excelDate) return '';
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return String(excelDate);
  };

  const handleTableChange = (id: number, field: keyof TableRow, value: string | number) => {
    setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };
  
  const addTableRow = () => {
    const newId = tableData.length > 0 ? Math.max(...tableData.map(row => row.id)) + 1 : 1;
    setTableData(prev => [...prev, { id: newId, itemName: '', price: '', mfgDate: '', expDate: '', noOfPrints: 1 }]);
  };
  
  const removeTableRow = (id: number) => {
    if (tableData.length > 1) {
      setTableData(prev => prev.filter(row => row.id !== id));
    }
  };

  const generateLabels = () => {
    const generated: TableRow[] = [];
    tableData.forEach(row => {
      if (row.itemName.trim() !== '') {
        for (let i = 0; i < row.noOfPrints; i++) {
          generated.push(row);
        }
      }
    });
    setLabelsToPrint(generated);
    if (generated.length > 0) {
       alert(`Generated ${generated.length} total labels! You can now print.`);
    } else {
       alert("Please enter an Item Name before generating labels.");
    }
  };

  const handlePrint = () => {
    if (!labelContainerRef.current) {
        alert("Could not find labels to print.");
        return;
    }

    const labelsHtml = labelContainerRef.current.innerHTML;
    const printStyles = `
        <style>
            @page {
                size: 85mm 55mm;
                margin: 0;
            }
            body {
                margin: 0;
            }
            .label {
                width: 85mm;
                height: 55mm;
                padding: 3mm;
                box-sizing: border-box;
                overflow: hidden;
                font-family: Arial, Helvetica, sans-serif;
                color: black;
                background: white;
                display: flex;
                flex-direction: column;
                page-break-after: always;
                page-break-inside: avoid !important;
            }
            .label-header { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 2mm; }
            .brand-name { font-size: 14pt; font-weight: bold; }
            .brand-division { font-size: 7pt; }
            .reg-info { font-size: 7pt; text-align: right; }
            .label-body { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
            .product-name { font-size: 22pt; font-weight: bold; text-align: center; margin: 4mm 0; text-transform: uppercase; }
            .details-grid { font-size: 10pt; }
            .detail-row { display: flex; justify-content: space-between; padding: 1mm 0; }
            .detail-label { font-weight: bold; }
            .detail-value { text-align: right; }
        </style>
    `;

    const printWindow = window.open('', '_blank', 'height=600,width=800');
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
  
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const totalLabels = tableData.reduce((sum, item) => sum + (item.noOfPrints || 0), 0);
  
  return (
    <div className="container">
      <h1>Label Printing System</h1>
      <div className="controls">
        <h3>Upload Excel or Enter Manually</h3>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />
        <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>📤 Upload Excel File</button>
        <p className="file-info">Expected columns: Item Name, Price, Mfg Date, Exp Date, No of Prints</p>
      </div>
      
      <div className="table-section">
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
                    <td><input type="text" value={row.itemName} placeholder="e.g., Kaju" onChange={e => handleTableChange(row.id, 'itemName', e.target.value)} /></td>
                    <td><input type="text" value={row.price} placeholder="e.g., 111" onChange={e => handleTableChange(row.id, 'price', e.target.value)} /></td>
                    <td><input type="date" value={row.mfgDate} onChange={e => handleTableChange(row.id, 'mfgDate', e.target.value)} /></td>
                    <td><input type="date" value={row.expDate} onChange={e => handleTableChange(row.id, 'expDate', e.target.value)} /></td>
                    <td><input type="number" min="1" value={row.noOfPrints} onChange={e => handleTableChange(row.id, 'noOfPrints', parseInt(e.target.value) || 1)} style={{width: '70px'}}/></td>
                    <td><button className="btn-remove" onClick={() => removeTableRow(row.id)} disabled={tableData.length === 1}>Remove</button></td>
                </tr>
            ))}
            </tbody>
        </table>
        <div className="table-actions">
            <button className="btn-add" onClick={addTableRow}>+ Add Row</button>
            <div className="total-info">Total Labels to Generate: <strong>{totalLabels}</strong></div>
        </div>
      </div>

      <div className="main-actions">
        <button className="btn-generate" onClick={generateLabels}>🔄 Generate Labels</button>
        <button className="btn-print" onClick={handlePrint}>🖨️ Print Labels</button>
      </div>
      
      {labelsToPrint.length > 0 && (
        <div className="preview-section">
          <h3>Label Preview</h3>
          <div className="label-container" ref={labelContainerRef}>
            {labelsToPrint.map((label, index) => (
              <div className="label" key={index}>
                <div className="label-header">
                  <div className="brand-info">
                    <div className="brand-name">SUDHAMRIT</div>
                    <div className="brand-division">(A DIVISION OF SUDHASTAR)</div>
                  </div>
                  <div className="reg-info">
                    <div>FSSAI: 21523014001786</div>
                    <div>GST: 27AAAAS0976Q1ZU</div>
                  </div>
                </div>
                <div className="label-body">
                  <div className="product-name">{label.itemName}</div>
                  <div className="details-grid">
                    <div className="detail-row">
                      <span className="detail-label">MFG DATE:</span>
                      <span className="detail-value">{formatDateForDisplay(label.mfgDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">BEST BEFORE:</span>
                      <span className="detail-value">{formatDateForDisplay(label.expDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">PRICE:</span>
                      <span className="detail-value">{label.price ? `₹${label.price}` : '_'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        /* --- Global Styles --- */
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 1200px; margin: 20px auto; padding: 25px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        h1 { text-align: center; color: #333; }
        
        /* --- NEW: Styles for Main UI Sections --- */
        .controls, .table-section, .main-actions {
            margin-bottom: 25px;
            padding: 20px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #343a40;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 10px;
        }
        button {
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        .btn-upload { background-color: #28a745; color: white; }
        .btn-upload:hover { background-color: #218838; }
        .btn-add { background-color: #007bff; color: white; }
        .btn-add:hover { background-color: #0069d9; }
        .btn-remove { background-color: #dc3545; color: white; padding: 8px 12px; }
        .btn-remove:hover { background-color: #c82333; }
        .btn-generate { background-color: #17a2b8; color: white; padding: 12px 25px; }
        .btn-generate:hover { background-color: #138496; }
        .btn-print { background-color: #6c757d; color: white; padding: 12px 25px; }
        .btn-print:hover { background-color: #5a6268; }
        .file-info { font-size: 13px; color: #6c757d; margin-top: 10px; }
        
        /* --- NEW: Data Table Styles --- */
        .table-section { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { border: 1px solid #dee2e6; padding: 12px; text-align: left; vertical-align: middle; }
        .data-table th { background-color: #f8f9fa; color: #495057; font-weight: 600; }
        .data-table input {
            width: 100%; border: 1px solid #ced4da; padding: 8px; border-radius: 4px;
            box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .data-table input:focus { outline: none; border-color: #80bdff; box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); }
        .table-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
        .total-info { font-weight: bold; color: #343a40; }
        
        /* --- Label Preview Styles --- */
        .preview-section { margin-top: 30px; border-top: 2px solid #f0f0f0; padding-top: 20px; }
        .label-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 10px; }
        .label {
            width: 85mm; height: 55mm; border: 1px dashed #ccc; padding: 3mm; box-sizing: border-box;
            overflow: hidden; background: white; display: flex; flex-direction: column;
            font-family: Arial, Helvetica, sans-serif; color: black;
        }
        .label-header { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 2mm; }
        .brand-name { font-size: 14pt; font-weight: bold; }
        .brand-division { font-size: 7pt; }
        .reg-info { font-size: 7pt; text-align: right; }
        .label-body { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
        .product-name { font-size: 22pt; font-weight: bold; text-align: center; margin: 4mm 0; text-transform: uppercase; }
        .details-grid { font-size: 10pt; }
        .detail-row { display: flex; justify-content: space-between; padding: 1mm 0; }
        .detail-label { font-weight: bold; }
        .detail-value { text-align: right; }

        /* A minimal print style is kept in case the user hits Ctrl+P by mistake */
        @media print {
            body > .container { display: none; }
        }
      `}</style>
    </div>
  );
};

export default LabelPrintingSystem;
