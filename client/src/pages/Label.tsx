import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
        
        // Map Excel data to our table format
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
    
    if (typeof excelDate === 'string') {
      return excelDate;
    }
    
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
    const newId = Math.max(...tableData.map(row => row.id), 0) + 1;
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
    // Validate required fields
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

  const printLabels = () => {
    window.print();
  };

  const generatePDF = async () => {
    const labels = document.querySelectorAll('.label-preview') as NodeListOf<HTMLElement>;
    
    if (labels.length === 0) {
      alert('No labels to generate PDF.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      
      // Use html2canvas with proper configuration for the label
      const canvas = await html2canvas(label, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: label.offsetWidth,
        height: label.offsetHeight,
        windowWidth: label.offsetWidth,
        windowHeight: label.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add new page for every label except the first one
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate position to center the label on A4 page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const labelWidth = 80; // mm
      const labelHeight = 50; // mm
      
      const x = (pageWidth - labelWidth) / 2;
      const y = (pageHeight - labelHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight);
    }

    pdf.save('sudhamrit-labels.pdf');
  };

  const resetForm = () => {
    setTableData([
      { id: 1, itemName: '', price: '', mfgDate: '', expDate: '', noOfPrints: 1 }
    ]);
    setLabels([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    if (dateString.includes('/')) {
      return dateString;
    }
    
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
      {/* Back button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
        <button className="back-btn" onClick={() => window.history.back()}>← Back</button>
      </div>
      <h1>Label Printing System</h1>

      {/* Upload Section */}
      <div className="upload-section">
        <h3>Upload Excel File or Enter Data Manually</h3>
        <div className="upload-options">
          <div className="excel-upload">
            <p>Upload Excel file with product data:</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <button className="upload-btn" onClick={triggerFileInput}>
              Upload Excel File
            </button>
            <div className="file-info">
              <p><strong>Expected columns:</strong> Item Name, Price, Mfg Date, Exp Date, No of Prints</p>
            </div>
          </div>

          <div className="manual-entry">
            <p>Or enter data manually in the table below:</p>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
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
                  <td>
                    <input
                      type="text"
                      value={row.itemName}
                      onChange={(e) => handleTableChange(row.id, 'itemName', e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.price}
                      onChange={(e) => handleTableChange(row.id, 'price', e.target.value)}
                      placeholder="e.g., 450"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={row.mfgDate.includes('/') ? '' : row.mfgDate}
                      onChange={(e) => handleTableChange(row.id, 'mfgDate', e.target.value)}
                    />
                    {row.mfgDate.includes('/') && (
                      <div className="date-display">{row.mfgDate}</div>
                    )}
                  </td>
                  <td>
                    <input
                      type="date"
                      value={row.expDate.includes('/') ? '' : row.expDate}
                      onChange={(e) => handleTableChange(row.id, 'expDate', e.target.value)}
                    />
                    {row.expDate.includes('/') && (
                      <div className="date-display">{row.expDate}</div>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.noOfPrints}
                      onChange={(e) => handleTableChange(row.id, 'noOfPrints', parseInt(e.target.value) || 1)}
                      min="1"
                      max="100"
                      className="no-of-prints"
                    />
                  </td>
                  <td>
                    <button 
                      className="remove-btn"
                      onClick={() => removeTableRow(row.id)}
                      disabled={tableData.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-actions">
          <button className="add-row-btn" onClick={addTableRow}>
            + Add Another Row
          </button>
          <div className="total-info">
            Total labels to generate: <strong>{totalLabels}</strong>
          </div>
        </div>

        <div className="actions">
          <button className="generate-btn" onClick={generateLabels}>
            Generate Labels ({totalLabels} total labels)
          </button>
          <button className="reset-btn" onClick={resetForm}>
            Reset All
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {labels.length > 0 && (
        <div className="preview-section">
          <h3 className="preview-title">
            Label Preview ({labels.length} labels generated)
          </h3>
          <div className="actions">
            <button className="print-btn" onClick={printLabels}>
              Print Labels
            </button>
            <button className="pdf-btn" onClick={generatePDF}>
              Download PDF
            </button>
          </div>
          <div className="labels-container">
            {labels.map((label, index) => (
              <div key={index} className="label-preview">
                {/* Exact design from your image */}
                <div className="label-content">
                  {/* Header Section - Left and Right aligned */}
                  <div className="header-section">
                    <div className="left-section">
                      <div className="company-name">SUDHAMRIT</div>
                      <div className="company-subtitle">(A DIVISION OF SUDHASTAR)</div>
                    </div>
                    <div className="right-section">
                      <div className="fssai">FSSAI: 21523014001786</div>
                      <div className="gst">GST: 27AAAAS0976Q1ZU</div>
                    </div>
                  </div>
                  
                  {/* Product Name - Centered */}
                  <div className="product-name">{label.itemName}</div>
                  
                  {/* Details Section */}
                  <div className="details-section">
                    {/* Manufacturing Date */}
                    {label.mfgDate && (
                      <div className="detail-row">
                        <span className="detail-label">MFG DATE:</span>
                        <span className="detail-value">{formatDate(label.mfgDate)}</span>
                      </div>
                    )}
                    
                    {/* Expiry Date */}
                    {label.expDate && (
                      <div className="detail-row">
                        <span className="detail-label">BEST BEFORE:</span>
                        <span className="detail-value">{formatDate(label.expDate)}</span>
                      </div>
                    )}
                    
                    {/* Price */}
                    {label.price && (
                      <div className="detail-row">
                        <span className="detail-label">PRICE:</span>
                        <span className="detail-values">₹{label.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .back-btn {
          background: transparent;
          border: 1px solid #ccc;
          color: #2c3e50;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .back-btn:hover { background: #f0f0f0; }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 30px;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
        
        h3 {
          margin-bottom: 20px;
          color: #2c3e50;
        }
        
        .upload-section {
          margin-bottom: 30px;
          padding: 25px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .upload-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .excel-upload, .manual-entry {
          padding: 15px;
          background: white;
          border-radius: 6px;
          border: 1px solid #ddd;
        }
        
        .file-info {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }
        
        .hidden {
          display: none;
        }
        
        .upload-btn, .generate-btn, .print-btn, .pdf-btn, .reset-btn, .add-row-btn, .remove-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 5px;
        }
        
        .upload-btn {
          background-color: #3498db;
          color: white;
        }
        
        .upload-btn:hover {
          background-color: #2980b9;
        }
        
        .generate-btn, .print-btn {
          background-color: #2ecc71;
          color: white;
        }
        
        .generate-btn:hover, .print-btn:hover {
          background-color: #27ae60;
        }
        
        .pdf-btn {
          background-color: #9b59b6;
          color: white;
        }
        
        .pdf-btn:hover {
          background-color: #8e44ad;
        }
        
        .reset-btn {
          background-color: #e74c3c;
          color: white;
        }
        
        .reset-btn:hover {
          background-color: #c0392b;
        }
        
        .add-row-btn {
          background-color: #9b59b6;
          color: white;
        }
        
        .add-row-btn:hover {
          background-color: #8e44ad;
        }
        
        .remove-btn {
          background-color: #e67e22;
          color: white;
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .remove-btn:hover:not(:disabled) {
          background-color: #d35400;
        }
        
        .remove-btn:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
        
        .table-section {
          margin-bottom: 30px;
          padding: 25px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .table-container {
          overflow-x: auto;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }
        
        .data-table th {
          background-color: #3498db;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }
        
        .data-table input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .data-table input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .no-of-prints {
          width: 70px !important;
        }
        
        .date-display {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
        
        .table-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .total-info {
          font-size: 16px;
          color: #2c3e50;
        }
        
        .actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .preview-section {
          margin-bottom: 30px;
        }
        
        .preview-title {
          font-size: 20px;
          margin-bottom: 15px;
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          text-align: center;
        }
        
        .labels-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }
        
        /* Label dimensions: 80mm × 50mm */
        /* Converted to pixels at 96 DPI: 302px × 189px */
        .label-preview {
          width: 302px;
          height: 189px;
          border: 1px solid #000;
          background-color: white;
          page-break-inside: avoid;
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        /* Label content matching your image design */
        .label-content {
          width: 100%;
          height: 100%;
          padding: 8px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #ddd;
        }
        
        .left-section {
          text-align: left;
          flex: 1;
        }
        
        .right-section {
          text-align: right;
          flex: 1;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 1px;
          line-height: 1.1;
        }
        
        .company-subtitle {
          font-size: 9px;
          line-height: 1.1;
        }
        
        .fssai, .gst {
          font-size: 8px;
          line-height: 1.1;
          margin-bottom: 1px;
        }
        
        .product-name {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 10px 0;
          text-transform: uppercase;
          line-height: 1.1;
          flex-shrink: 0;
        }
        
        .details-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          line-height: 1.2;
          padding: 2px 0;
        }
        
        .detail-label {
          font-weight: bold;
        }
        
        .detail-value {
          text-align: right;
        }
        .detail-values {
          text-align: right;
          font-weight: bold;
        }
        
        /* Print Styles */
        @media print {
          body * {
            visibility: hidden;
            margin: 0;
            padding: 0;
          }
          
          .preview-section, .preview-section * {
            visibility: visible;
          }
          
          .preview-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          
          .preview-title, .actions {
            display: none;
          }
          
          .labels-container {
            display: grid;
            grid-template-columns: repeat(2, 302px);
            gap: 10px;
            justify-content: center;
            align-items: start;
            width: 100%;
            margin: 0;
            padding: 10px;
          }
          
          .label-preview {
            width: 302px;
            height: 189px;
            border: 1px solid #000;
            box-shadow: none;
            margin: 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .upload-section, .table-section, .container > h1 {
            display: none;
          }

          /* Ensure consistent font sizes in print */
          .company-name { font-size: 16px !important; }
          .company-subtitle { font-size: 9px !important; }
          .fssai, .gst { font-size: 8px !important; }
          .product-name { font-size: 18px !important; }
          .detail-row { font-size: 11px !important; }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }
          
          .table-actions {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .labels-container {
            gap: 10px;
          }
          
          .label-preview {
            width: 280px;
            height: 175px;
          }
          
          .actions {
            flex-direction: column;
            align-items: center;
          }
          
          .upload-btn, .generate-btn, .print-btn, .pdf-btn, .reset-btn, .add-row-btn {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .label-preview {
            width: 260px;
            height: 163px;
          }
          
          .company-name {
            font-size: 14px;
          }
          
          .product-name {
            font-size: 16px;
          }
          
          .detail-row {
            font-size: 10px;
          }
          
          .data-table {
            font-size: 12px;
          }
          
          .data-table th,
          .data-table td {
            padding: 8px 6px;
          }
        }
      `}</style >
    </div>
  );
};

export default LabelPrintingSystem;