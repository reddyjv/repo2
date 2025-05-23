import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManNavbar from './ManNavbar'
import * as XLSX from 'xlsx';
import './invoiceDashboard.css';

const InvoiceDashboard = () => {
  // State management
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: { startDate: '', endDate: '' },
    customer: '',
    product: '',
    amountRange: { min: '', max: '' },
    paymentMode: ''
  });

  // Helper function to parse price strings into numbers
  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price !== 'string') return 0;
    // Remove any non-numeric characters except decimal point
    const numericString = price.replace(/[^0-9.]/g, '');
    return parseFloat(numericString) || 0;
  };

  // Format price for display
  const formatPrice = (price) => {
    const amount = parsePrice(price);
    return amount.toFixed(2);
  };

  // Calculate total for an item
  const calculateItemTotal = (item) => {
    const price = parsePrice(item.saleprice);
    const qty = parseInt(item.qty) || 0;
    const discount = parsePrice(item.discount) || 0;
    const gst = parsePrice(item.gst) || 0;
    return (price * qty - discount + gst).toFixed(2);
  };

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/invoices/all');
        // Process invoices to ensure proper number formatting
        const processedInvoices = response.data.map(invoice => ({
          ...invoice,
          items: invoice.items?.map(item => ({
            ...item,
            // Convert string prices to numbers for calculations
            parsedPrice: parsePrice(item.saleprice),
            parsedDiscount: parsePrice(item.discount),
            parsedGst: parsePrice(item.gst),
            calculatedTotal: calculateItemTotal(item)
          })),
          totals: {
            ...invoice.totals,
            // Convert string totals to numbers
            totalPrice: parsePrice(invoice.totals?.totalPrice),
            totalDiscount: parsePrice(invoice.totals?.totalDiscount),
            totalGST: parsePrice(invoice.totals?.totalGST),
            finalAmount: parsePrice(invoice.totals?.finalAmount),
            specialDiscount: parsePrice(invoice.totals?.specialDiscount),
            cashReceived: parsePrice(invoice.totals?.cashReceived),
            changeToBeReturned: parsePrice(invoice.totals?.changeToBeReturned)
          }
        }));

        // Filter out any invalid invoices
        const validInvoices = processedInvoices.filter(invoice =>
          invoice && invoice.customer && invoice.invoiceNumber
        );

        setInvoices(validInvoices);
        setFilteredInvoices(validInvoices);
      } catch (err) {
        setError(err.message || 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Apply filters to invoices
  const applyFilters = () => {
    let filtered = [...invoices];

    // Date range filter
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(`${invoice.date} ${invoice.time}`);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    // Customer filter
    if (filters.customer) {
      filtered = filtered.filter(invoice => {
        const cust = invoice.customer || {};
        return (
          (cust.cname && cust.cname.toLowerCase().includes(filters.customer.toLowerCase())) ||
          (cust.cphone && cust.cphone.includes(filters.customer)) ||
          (cust.mailId && cust.mailId.toLowerCase().includes(filters.customer.toLowerCase()))
        );
      });
    }

    // Product filter
    if (filters.product) {
      filtered = filtered.filter(invoice =>
        invoice.items?.some(item =>
          item.pname && item.pname.toLowerCase().includes(filters.product.toLowerCase())
        )
      );
    }

    // Amount range filter
    if (filters.amountRange.min || filters.amountRange.max) {
      const min = filters.amountRange.min ? parseFloat(filters.amountRange.min) : 0;
      const max = filters.amountRange.max ? parseFloat(filters.amountRange.max) : Infinity;

      filtered = filtered.filter(invoice =>
        (invoice.totals?.finalAmount || 0) >= min &&
        (invoice.totals?.finalAmount || 0) <= max
      );
    }

    // Payment mode filter
    if (filters.paymentMode) {
      filtered = filtered.filter(invoice =>
        invoice.totals?.paymentMode?.toLowerCase().includes(filters.paymentMode.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      dateRange: { startDate: '', endDate: '' },
      customer: '',
      product: '',
      amountRange: { min: '', max: '' },
      paymentMode: ''
    });
    setFilteredInvoices(invoices);
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle range filter changes
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setFilters(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  // View invoice details
  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredInvoices.map(invoice => ({
        'Invoice Number': invoice.invoiceNumber,
        'Date': invoice.date,
        'Customer Name': invoice.customer?.cname || 'N/A',
        'Customer Phone': invoice.customer?.cphone || 'N/A',
        'Total Items': invoice.items?.length || 0,
        'Total Amount': invoice.totals?.finalAmount || 0,
        'Payment Mode': invoice.totals?.paymentMode || 'N/A',
        'Due Status': invoice.totals?.dueStatus === 0 ? 'Paid' : 'Pending'
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    XLSX.writeFile(workbook, 'invoices_report.xlsx');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading state
  if (loading) {
    return (
      <div className="invoice-dashboard">
        <div className="loading-spinner">Loading invoices...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="invoice-dashboard">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
    <ManNavbar/>
    <div className="invoice-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Invoice Management</h1>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3>Filter Invoices</h3>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                name="dateRange.startDate"
                className="filter-input"
                value={filters.dateRange.startDate}
                onChange={handleRangeChange}
              />
              <input
                type="date"
                name="dateRange.endDate"
                className="filter-input"
                value={filters.dateRange.endDate}
                onChange={handleRangeChange}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Customer</label>
            <input
              type="text"
              name="customer"
              className="filter-input"
              value={filters.customer}
              onChange={handleFilterChange}
              placeholder="Search customers..."
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Product</label>
            <input
              type="text"
              name="product"
              className="filter-input"
              value={filters.product}
              onChange={handleFilterChange}
              placeholder="Search products..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Amount Range</label>
            <div className="amount-range-inputs">
              <input
                type="number"
                name="amountRange.min"
                className="filter-input"
                value={filters.amountRange.min}
                onChange={handleRangeChange}
                placeholder="Min"
              />
              <input
                type="number"
                name="amountRange.max"
                className="filter-input"
                value={filters.amountRange.max}
                onChange={handleRangeChange}
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Payment Mode</label>
            <select
              name="paymentMode"
              className="filter-input"
              value={filters.paymentMode}
              onChange={handleFilterChange}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="credit">credit</option>
            </select>
          </div>

          <div className="filter-group actions">
            <button className="filter-button apply" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="filter-button reset" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      {filteredInvoices.length > 0 ? (
        <>
          <div className="table-responsive">
            <table className="invoice-table">
              <thead className="table-header">
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id || invoice.invoiceNumber} className="table-row">
                    <td>{invoice.invoiceNumber}</td>
                    <td>{formatDate(invoice.date)}</td>
                    <td>{invoice.customer?.cname || 'N/A'}</td>
                    <td>{invoice.items?.length || 0}</td>
                    <td>₹{(invoice.totals?.finalAmount || 0).toFixed(2)}</td>
                    <td>{invoice.totals?.paymentMode || 'N/A'}</td>
                    <td>
                      {invoice.totals?.dueStatus === 0 ? (
                        <span className="status-paid">Paid</span>
                      ) : (
                        <span className="status-pending">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-button"
                          onClick={() => viewInvoiceDetails(invoice)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <button className="export-button" onClick={exportToExcel}>
              Export to Excel
            </button>
          </div>
        </>
      ) : (
        <div className="no-invoices">
          <h3>No invoices found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      )}

      {/* Invoice Detail Modal */}
        { showModal && selectedInvoice && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  Invoice Details - {selectedInvoice.invoiceNumber}
                </h2>
                <button className="close-button" onClick={closeModal}>
                  &times;
                </button>
              </div>

              <div className="invoice-details">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>
                    {formatDate(selectedInvoice.date)} at {selectedInvoice.time || 'N/A'}
                  </span>
                </div>

                {selectedInvoice.customer && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Customer:</span>
                      <span>{selectedInvoice.customer.cname || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span>{selectedInvoice.customer.cphone || 'N/A'}</span>
                    </div>
                    {selectedInvoice.customer.mailId && (
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span>{selectedInvoice.customer.mailId}</span>
                      </div>
                    )}
                    {selectedInvoice.customer.address && (
                      <div className="detail-row">
                        <span className="detail-label">Address:</span>
                        <span>{selectedInvoice.customer.address}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="items-section">
                <h4>Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>GST</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.pname || 'N/A'}</td>
                        <td>{item.qty || 0}</td>
                        <td>₹{formatPrice(item.saleprice)}</td>
                        <td>₹{formatPrice(item.discount)}</td>
                        <td>₹{formatPrice(item.gst)}</td>
                        <td>₹{item.calculatedTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-totals">
                <h4>Totals</h4>
                <div className="totals-grid">
                  <div className="totals-row">
                    <span className="detail-label">Subtotal:</span>
                    <span>₹{(selectedInvoice.totals?.totalPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <span className="detail-label">Total Discount:</span>
                    <span>₹{(selectedInvoice.totals?.totalDiscount || 0).toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <span className="detail-label">Total GST:</span>
                    <span>₹{(selectedInvoice.totals?.totalGST || 0).toFixed(2)}</span>
                  </div>
                  {(selectedInvoice.totals?.specialDiscount || 0) > 0 && (
                    <div className="totals-row">
                      <span className="detail-label">Special Discount:</span>
                      <span>₹{(selectedInvoice.totals.specialDiscount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="totals-row grand-total">
                    <span className="detail-label">Grand Total:</span>
                    <span>₹{(selectedInvoice.totals?.finalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <span className="detail-label">Payment Mode:</span>
                    <span>{selectedInvoice.totals?.paymentMode || 'N/A'}</span>
                  </div>
                  <div className="totals-row">
                    <span className="detail-label">Amount Received:</span>
                    <span>₹{(selectedInvoice.totals?.cashReceived || 0).toFixed(2)}</span>
                  </div>
                  {(selectedInvoice.totals?.changeToBeReturned || 0) > 0 && (
                    <div className="totals-row">
                      <span className="detail-label">Change Returned:</span>
                      <span>₹{(selectedInvoice.totals.changeToBeReturned || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="totals-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-${selectedInvoice.totals?.dueStatus === 0 ? 'paid' : 'pending'}`}>
                      {selectedInvoice.totals?.dueStatus === 0 ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
    </>
  );
};

export default InvoiceDashboard;