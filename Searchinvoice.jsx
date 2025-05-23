import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManNavbar from './ManNavbar';
import './invoiceDashboard.css';

const InvoiceDashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to parse price strings into numbers
    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        if (typeof price !== 'string') return 0;
        const numericString = price.replace(/[^0-9.]/g, '');
        return parseFloat(numericString) || 0;
    };

    // Format price for display
    const formatPrice = (price) => {
        const amount = parsePrice(price);
        return amount.toFixed(2);
    };
    const closeModal = () => {
        setShowModal(false);
    };
    // Fetch invoices from API
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/invoices/all');
                const processedInvoices = response.data.map(invoice => ({
                    ...invoice,
                    totals: {
                        ...invoice.totals,
                        finalAmount: parsePrice(invoice.totals?.finalAmount)
                    }
                }));

                setInvoices(processedInvoices);
                setFilteredInvoices(processedInvoices);
            } catch (err) {
                setError(err.message || 'Failed to fetch invoices');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    // Apply search filter
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredInvoices(invoices);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = invoices.filter(invoice => {
            return (
                invoice.invoiceNumber.toLowerCase().includes(term) ||
                (invoice.customer?.cname && invoice.customer.cname.toLowerCase().includes(term)) ||
                (invoice.customer?.cphone && invoice.customer.cphone.includes(term))
            );
        });

        setFilteredInvoices(filtered);
    }, [searchTerm, invoices]);

    // View invoice details
    const viewInvoiceDetails = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    // Print invoice
    const printInvoice = (invoice) => {
        // Open print dialog with invoice content
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { margin-bottom: 20px; }
            .invoice-details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; font-weight: bold; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h2>Invoice #${invoice.invoiceNumber}</h2>
            <p>Date: ${invoice.date} ${invoice.time || ''}</p>
          </div>
          
          <div class="invoice-details">
            <h3>Customer Details</h3>
            <p>Name: ${invoice.customer?.cname || 'N/A'}</p>
            <p>Phone: ${invoice.customer?.cphone || 'N/A'}</p>
            ${invoice.customer?.mailId ? `<p>Email: ${invoice.customer.mailId}</p>` : ''}
            ${invoice.customer?.address ? `<p>Address: ${invoice.customer.address}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map(item => `
                <tr>
                  <td>${item.pname || 'N/A'}</td>
                  <td>${item.qty || 0}</td>
                  <td>₹${formatPrice(item.saleprice)}</td>
                  <td>₹${formatPrice(item.discount)}</td>
                  <td>₹${formatPrice(item.gst)}</td>
                  <td>₹${formatPrice(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ₹${formatPrice(invoice.totals?.totalPrice)}</p>
            <p>Total Discount: ₹${formatPrice(invoice.totals?.totalDiscount)}</p>
            <p>Total GST: ₹${formatPrice(invoice.totals?.totalGST)}</p>
            ${invoice.totals?.specialDiscount ? `<p>Special Discount: ₹${formatPrice(invoice.totals.specialDiscount)}</p>` : ''}
            <p>Grand Total: ₹${formatPrice(invoice.totals?.finalAmount)}</p>
            <p>Payment Mode: ${invoice.totals?.paymentMode || 'N/A'}</p>
            <p>Amount Received: ₹${formatPrice(invoice.totals?.cashReceived)}</p>
            ${invoice.totals?.changeToBeReturned ? `<p>Change Returned: ₹${formatPrice(invoice.totals.changeToBeReturned)}</p>` : ''}
            <p>Status: ${invoice.totals?.dueStatus === 0 ? 'Paid' : 'Pending'}</p>
          </div>
          
          <button class="no-print" onclick="window.print()">Print Invoice</button>
          <button class="no-print" onclick="window.close()">Close</button>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="invoice-dashboard">
                <div className="loading-spinner">Loading invoices...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="invoice-dashboard">
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    return (
        <>
            <ManNavbar />
            <div className="invoice-dashboard">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Invoice Management</h1>
                </div>

                {/* Search Bar */}
                <div className='search-input'
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        margin: '20px 0',
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search by invoice number or customer name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            padding: '12px 16px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            outline: 'none',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                            transition: 'border-color 0.3s, box-shadow 0.3s',
                        }}
                        onFocus={(e) =>
                            (e.target.style.borderColor = '#007bff')
                        }
                        onBlur={(e) =>
                            (e.target.style.borderColor = '#ccc')
                        }
                    />
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
                                                    <button
                                                        className="view-button"
                                                        onClick={() => printInvoice(invoice)}
                                                    >
                                                        Download
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="no-invoices">
                        <h3>No invoices found</h3>
                        <p>Try adjusting your search or check back later.</p>
                    </div>
                )}

                {/* Invoice Detail Modal */}
                {showModal && selectedInvoice && (
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

                            {/* ... rest of the modal content remains the same ... */}
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