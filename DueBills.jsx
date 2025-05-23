// File: src/pages/DueBills.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VendorNavbar from './VendorNavbar';
// Add this import at the top
import { toast } from 'react-toastify'; // Optional: For success/error messages
import 'react-toastify/dist/ReactToastify.css';



const DueBills = () => {
  const [dueBills, setDueBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDueBills = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/invoices/due');
        setDueBills(response.data);
      } catch (err) {
        console.error('Error fetching due bills:', err);
        setError('Failed to load due bills.');
      } finally {
        setLoading(false);
      }
    };

    fetchDueBills();
  }, []);

  const sendReminderEmail = async (bill) => {
    try {
      await axios.post('http://localhost:5000/send-reminder', {
        invoiceNumber: bill.invoiceNumber,
        date: bill.date,
        time: bill.time,
        customerName: bill.customer?.cname,
        customerEmail: bill.customer?.mailId,
        customerPhone: bill.customer?.cphone,
        amount: bill.totals?.finalAmount,
        paymentMode: bill.totals.paymentMode,
      });
      toast.success('Reminder email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send reminder email.');
    }
  };


  if (loading) return <div className="container mt-5"><p>Loading due bills...</p></div>;
  if (error) return <div className="container mt-5"><p className="text-danger">{error}</p></div>;

  return (
    <>
      <VendorNavbar />
      <div className="container mt-5">
        <h2 className="mb-4">Due Bills (Credit Payments)</h2>
        {dueBills.length === 0 ? (
          <p>No due bills found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-primary">
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Total Amount</th>
                  <th>Payment Mode</th>
                  <th>Action</th> {/* New Column */}
                </tr>
              </thead>
              <tbody>
                {dueBills.map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.invoiceNumber}</td>
                    <td>{bill.date}</td>
                    <td>{bill.time}</td>
                    <td>{bill.customer?.cname || 'N/A'}</td>
                    <td>{bill.customer?.cphone || 'N/A'}</td>
                    <td>₹{bill.totals?.finalAmount?.toFixed(2) || '0.00'}</td>
                    <td>{bill.totals.paymentMode}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => sendReminderEmail(bill)}
                      >
                        Send Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DueBills;
