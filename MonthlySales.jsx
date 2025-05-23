import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './InvoiceInsights.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const insightOptions = [
  { key: 'monthly', label: '📅 Monthly Sales' },
  { key: 'yearly', label: '📆 Yearly Sales'},
  { key: 'payment', label: '💳 Payment Methods'},
  { key: 'product', label: '📦 Product Sales'},
  { key: 'daywise', label: '📈 Daily Sales' }
];

const AllInvoicesWithFilters = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/invoices/all');
        setInvoices(res.data);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
        setError('Failed to load invoice data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getChartData = () => {
    if (!invoices.length) return null;

    switch (selectedInsight) {
      case 'monthly': {
        const monthTotals = Array(12).fill(0);
        invoices.forEach(inv => {
          const [d, m] = inv.date?.split('/') || [];
          if (m && inv.totals?.finalAmount) {
            monthTotals[parseInt(m, 10) - 1] += inv.totals.finalAmount;
          }
        });

        const labels = [...Array(12)].map((_, i) => 
          new Date(0, i).toLocaleString('default', { month: 'short' })
        );

        return { labels, data: monthTotals };
      }

      case 'yearly': {
        const yearTotals = {};
        invoices.forEach(inv => {
          const [, , y] = inv.date?.split('/') || [];
          if (y && inv.totals?.finalAmount) {
            yearTotals[y] = (yearTotals[y] || 0) + inv.totals.finalAmount;
          }
        });

        return {
          labels: Object.keys(yearTotals).sort(),
          data: Object.keys(yearTotals).sort().map(year => yearTotals[year])
        };
      }

      case 'payment': {
        const paymentModes = {};
        invoices.forEach(inv => {
          const mode = inv.totals.paymentMode || 'Unknown';
          paymentModes[mode] = (paymentModes[mode] || 0) + (inv.totals?.finalAmount || 0);
        });

        return {
          labels: Object.keys(paymentModes),
          data: Object.values(paymentModes)
        };
      }

      case 'product': {
        const productSales = {};
        invoices.forEach(inv => {
          inv.items.forEach(item => {
            productSales[item.pname] = (productSales[item.pname] || 0) + (item.qty * item.saleprice);
          });
        });

        // Sort by sales value (descending)
        const sortedEntries = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
        return {
          labels: sortedEntries.map(([name]) => name),
          data: sortedEntries.map(([, value]) => value)
        };
      }

      case 'daywise': {
        const daySales = {};
        invoices.forEach(inv => {
          const [d, m, y] = inv.date?.split('/') || [];
          const fullDate = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
          daySales[fullDate] = (daySales[fullDate] || 0) + (inv.totals?.finalAmount || 0);
        });

        // Sort by date
        const sortedEntries = Object.entries(daySales).sort((a, b) => {
          const [d1, m1, y1] = a[0].split('/');
          const [d2, m2, y2] = b[0].split('/');
          return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        });

        return {
          labels: sortedEntries.map(([date]) => date),
          data: sortedEntries.map(([, value]) => value)
        };
      }

      default:
        return null;
    }
  };

  const chartData = getChartData();
  const totalSales = invoices.reduce((acc, inv) => acc + (inv.totals?.finalAmount || 0), 0);

  const commonChartDataset = (label, backgroundColor, borderColor) => ({
    label,
    data: chartData?.data,
    backgroundColor,
    borderColor,
    borderWidth: 1,
    borderRadius: 4
  });

  return (
    <div className="insights-container">
      <div className="insights-card">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-lg-2 col-md-3 insights-sidebar">
            <h5 className="insights-title">Sales Insights</h5>
            {insightOptions.map(({ key, label, icon }) => (
              <div
                key={key}
                onClick={() => setSelectedInsight(key)}
                className={`insight-box ${selectedInsight === key ? 'active-insight' : ''}`}
              >
                <span className="me-2">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="col-lg-10 col-md-9 insights-main">
            {loading ? (
              <div className="loading-text">Loading sales data...</div>
            ) : error ? (
              <div className="error-text">{error}</div>
            ) : (
              <>
                {chartData && (
                  <>
                    <h5 className="chart-title">
                      {insightOptions.find(opt => opt.key === selectedInsight)?.label}
                    </h5>

                    {/* Charts Row */}
                    <div className="row">
                      <div className="col-md-4">
                        <div className="chart-container">
                          <Bar
                            data={{
                              labels: chartData.labels,
                              datasets: [
                                commonChartDataset(
                                  'Sales',
                                  'rgba(58, 87, 232, 0.6)',
                                  'rgba(58, 87, 232, 1)'
                                )
                              ]
                            }}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: { display: false },
                                tooltip: { 
                                  callbacks: {
                                    label: (context) => `₹ ${context.raw.toFixed(2)}`
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="chart-container">
                          <Line
                            data={{
                              labels: chartData.labels,
                              datasets: [
                                commonChartDataset(
                                  'Sales Trend',
                                  'rgba(105, 198, 110, 0.6)',
                                  'rgba(105, 198, 110, 1)'
                                )
                              ]
                            }}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: { display: false },
                                tooltip: { 
                                  callbacks: {
                                    label: (context) => `₹ ${context.raw.toFixed(2)}`
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="chart-container">
                          <Pie
                            data={{
                              labels: chartData.labels,
                              datasets: [{
                                label: 'Sales Distribution',
                                data: chartData.data,
                                backgroundColor: chartData.labels.map(
                                  (_, i) => `hsl(${(i * 360) / chartData.labels.length}, 70%, 60%)`
                                ),
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              responsive: true,
                              plugins: {
                                tooltip: { 
                                  callbacks: {
                                    label: (context) => {
                                      const value = context.raw;
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = Math.round((value / total) * 100);
                                      return `${context.label}: ₹ ${value.toFixed(2)} (${percentage}%)`;
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary Table */}
                    <div className="table-responsive mt-4">
                      <table className="table insights-table">
                        <thead>
                          <tr>
                            <th>{selectedInsight === 'product' ? 'Product' : 'Period'}</th>
                            <th>Sales Amount (₹)</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.labels.map((label, i) => {
                            const value = chartData.data[i];
                            const percentage = (value / chartData.data.reduce((a, b) => a + b, 0)) * 100;
                            return (
                              <tr key={i}>
                                <td>{label}</td>
                                <td>{value.toFixed(2)}</td>
                                <td>{percentage.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td>Total</td>
                            <td>₹ {chartData.data.reduce((a, b) => a + b, 0).toFixed(2)}</td>
                            <td>100%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="grand-total">
                      Grand Total Sales: ₹ {totalSales.toFixed(2)}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllInvoicesWithFilters;