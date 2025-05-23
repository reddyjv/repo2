import React, { useEffect, useState } from 'react';
import Navbar from './ManNavbar';
import { 
  AiFillHome,
  AiOutlineUser,
  AiOutlineMenu
} from 'react-icons/ai';
import {
  FaRegFileAlt,
  FaRegClock,
  FaCogs,
  FaUsers,
  FaChartLine,
  FaBoxes,
  FaMoneyBillWave
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalDueBills: 0,
    totalCustomers: 0,
    loading: true
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setVendor(JSON.parse(storedUser));
    }

    // Fetch metrics data sequentially
    const fetchMetrics = async () => {
      try {
        const salesRes = await axios.get('http://localhost:5000/api/invoices/totals/today');
        const productsRes = await axios.get('http://localhost:5000/api/products');
        const dueRes = await axios.get('http://localhost:5000/api/invoices/due');
        const customersRes = await axios.get('http://localhost:5000/api/customers');

        setMetrics({
          totalSales: salesRes.data.totalSales || 0,
          totalProducts: productsRes.data.length || 0,
          totalDueBills: dueRes.data.length || 0,
          totalCustomers: customersRes.data.count || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetrics();
  }, []);

  const sidebarItems = [
    { icon: <AiFillHome size={20} />, text: 'Home', route: '/vendor/dashboard' },
    { icon: <AiOutlineUser size={20} />, text: 'Profile', route: '/profile' },
    { icon: <FaRegFileAlt size={20} />, text: 'Create Bill', route: '/billing' },
    { icon: <FaMoneyBillWave size={20} />, text: 'Due Status', route: '/dueBills' },
    { icon: <FaBoxes size={20} />, text: 'Products', route: '/viewproducts' },
    { icon: <FaUsers size={20} />, text: 'Customers', route: '/manage/customers' },
    { icon: <FaChartLine size={20} />, text: 'Sales Report', route: '/sales-report' },
    { icon: <FaCogs size={20} />, text: 'Settings', route: '/settings' }
  ];

  const dashboardCards = [
    { 
      icon: <FaRegFileAlt size={24} />, 
      title: 'Create Bill', 
      text: 'Generate new invoices for customers', 
      route: '/billing',
      color: '#4e73df'
    },
    { 
      icon: <FaMoneyBillWave size={24} />, 
      title: 'Due Status', 
      text: 'Track pending payments and dues', 
      route: '/dueBills',
      color: '#1cc88a'
    },
    { 
      icon: <FaBoxes size={24} />, 
      title: 'Manage Products', 
      text: 'Add, edit or view products', 
      route: '/viewproducts',
      color: '#36b9cc'
    },
    { 
      icon: <FaUsers size={24} />, 
      title: 'Manage Customers', 
      text: 'View and manage customer details', 
      route: '/manage/customers',
      color: '#f6c23e'
    },
    { 
      icon: <FaChartLine size={24} />, 
      title: 'Sales Report', 
      text: 'View sales analytics and reports', 
      route: '/sales-report',
      color: '#e74a3b'
    },
    { 
      icon: <FaCogs size={24} />, 
      title: 'Settings', 
      text: 'Configure your account settings', 
      route: '/settings',
      color: '#858796'
    }
  ];

  const metricCards = [
    {
      title: "Total Sales",
      value: `₹${metrics.totalSales.toLocaleString()}`,
      icon: <FaChartLine size={20} />,
      color: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)",
      subtitle: "+12% from last month"
    },
    {
      title: "Total Products",
      value: metrics.totalProducts,
      icon: <FaBoxes size={20} />,
      color: "linear-gradient(135deg, #1cc88a 0%, #13855c 100%)",
      subtitle: "12 low in stock"
    },
    {
      title: "Due Bills",
      value: metrics.totalDueBills,
      icon: <FaMoneyBillWave size={20} />,
      color: "linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)",
      subtitle: "3 overdue"
    },
    {
      title: "Total Customers",
      value: metrics.totalCustomers,
      icon: <FaUsers size={20} />,
      color: "linear-gradient(135deg, #e74a3b 0%, #be2617 100%)",
      subtitle: "+5 new this month"
    }
  ];

  return (
    <div style={{ 
      backgroundColor: '#f8f9fc', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      
      <div style={{ 
        display: 'flex',
        flex: 1,
        marginTop: '60px' /* Navbar height */
      }}>
        {/* Sidebar - Fixed to stay with navbar */}
        <div
          style={{
            display:'fixed',
            width: expanded ? '250px' : '80px',
            height: 'calc(100vh - 60px)',
            position: 'absolute',
            top: '60px',
            left: 0,
            background: 'linear-gradient(180deg, #224abe 0%, #4e73df 100%)',
            color: 'white',
            transition: 'width 0.3s ease',
            zIndex: 800,
            boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)'
          }}
        >
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: expanded ? 'space-between' : 'center',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              position: 'sticky',
              top: 0,
              backgroundColor: '#224abe',
              zIndex: 801
            }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded && <span style={{ fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Navigation</span>}
            <AiOutlineMenu size={20} />
          </div>

          <div style={{ padding: '0.5rem' }}>
            {sidebarItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  margin: '0.25rem 0',
                  borderRadius: '0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  color: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: window.location.pathname === item.route ? 'rgba(255,255,255,0.2)' : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = window.location.pathname === item.route ? 'rgba(255,255,255,0.2)' : 'transparent'}
                onClick={() => navigate(item.route)}
              >
                <span style={{ minWidth: '30px', display: 'flex', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                {expanded && <span style={{ marginLeft: '10px', fontSize: '0.85rem' }}>{item.text}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            marginLeft: expanded ? '250px' : '80px',
            padding: '20px',
            width: `calc(100% - ${expanded ? '250px' : '80px'})`,
            transition: 'margin-left 0.3s ease, width 0.3s ease'
          }}
        >
          {/* Welcome Card */}
          <div className="card shadow mb-4 border-0">
            <div className="card-body py-3">
              <h5 className="m-0 font-weight-bold text-primary">
                Welcome back, <span style={{ color: '#2c3e50' }}>{vendor?.name || 'User'}</span>!
              </h5>
              <p className="mt-2 mb-0 text-muted">Here's what's happening with your business today.</p>
            </div>
          </div>

          {/* Metric Cards - 4 in a row */}
          <div className="row mb-4 g-3">
            {metricCards.map((card, index) => (
              <div key={index} className="col-xl-3 col-md-6">
                <div 
                  className="card shadow h-100 border-0"
                  style={{
                    background: card.color,
                    color: 'white',
                    borderRadius: '0.35rem',
                    transition: 'transform 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div className="card-body py-3">
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px',
                          flexShrink: 0
                        }}
                      >
                        {React.cloneElement(card.icon, { color: 'white' })}
                      </div>
                      <div>
                        <div className="text-xs font-weight-bold text-uppercase mb-1" style={{ opacity: 0.8 }}>
                          {card.title}
                        </div>
                        <div className="h5 mb-0 font-weight-bold">{card.value}</div>
                        {card.subtitle && (
                          <div className="mt-1 text-xs" style={{ opacity: 0.8 }}>
                            <i className="bi bi-arrow-up"></i> {card.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Cards - 3 in a row */}
          <div className="row g-3">
            {dashboardCards.map((card, index) => (
              <div key={index} className="col-xl-4 col-md-6">
                <div
                  className="card border-left-primary shadow h-100 py-2"
                    style={{
                      borderLeft: `4px solid ${card.color}`,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      cursor: 'pointer'
                    }}
                  onClick={() => navigate(card.route)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div className="card-body py-3">
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: `${card.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px',
                          flexShrink: 0
                        }}
                      >
                        {React.cloneElement(card.icon, { color: card.color })}
                      </div>
                      <div>
                        <div 
                          className="text-xs font-weight-bold text-uppercase mb-1"
                          style={{ color: card.color }}
                        >
                          {card.title}
                        </div>
                        <div className="text-gray-800">{card.text}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;