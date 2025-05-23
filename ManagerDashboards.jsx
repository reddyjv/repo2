import React, { useState, useEffect } from 'react';
import { 
  AiFillHome,
  AiOutlineUser,
  AiOutlineMenu,
  AiOutlineLogout
} from 'react-icons/ai';
import {
  FaChartLine,
  FaBoxOpen,
  FaUsers,
  FaRegClock,
  FaCogs,
  FaUserTie,
  FaPlusCircle,
  FaFileInvoiceDollar,
  FaWarehouse,
  FaMoneyBillWave
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState(false);
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
      setManager(JSON.parse(storedUser));
    }

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
          totalCustomers: customersRes.data.length || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetrics();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    setLogoutMessage(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  // Sidebar navigation items
  const sidebarItems = [
    { icon: <AiFillHome size={20} />, label: 'Home', route: '/manager/dashboard' },
    { icon: <FaUserTie size={20} />, label: 'Manage Employees', route: '/manageemployee' },
    { icon: <FaPlusCircle size={20} />, label: 'Add Customer', route: '/addcustomer' },
    { icon: <FaUsers size={20} />, label: 'Manage Customers', route: '/managecustomer' },
    { icon: <FaPlusCircle size={20} />, label: 'Add Products', route: '/addproducts' },
    { icon: <FaRegClock size={20} />, label: 'Due Status', route: '/dueBills' },
    { icon: <FaBoxOpen size={20} />, label: 'Manage Products', route: '/manageProducts' }
  ];

  // Metric cards data
  const metricCards = [
    {
      title: "Total Sales",
      value: `₹${metrics.totalSales.toLocaleString()}`,
      icon: <FaChartLine size={24} />,
      color: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)",
      subtitle: metrics.totalSales > 0 ? "+12% from last month" : "No sales today"
    },
    {
      title: "Total Products",
      value: metrics.totalProducts,
      icon: <FaBoxOpen size={24} />,
      color: "linear-gradient(135deg, #1cc88a 0%, #13855c 100%)",
      subtitle: "12 low in stock"
    },
    {
      title: "Due Bills",
      value: metrics.totalDueBills,
      icon: <FaRegClock size={24} />,
      color: "linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)",
      subtitle: `${Math.min(3, metrics.totalDueBills)} overdue`
    },
    {
      title: "Total Customers",
      value: metrics.totalCustomers,
      icon: <FaUsers size={24} />,
      color: "linear-gradient(135deg, #e74a3b 0%, #be2617 100%)",
      subtitle: "+5 new this month"
    }
  ];

  // Inventory Management Cards
  const inventoryCards = [
    {
      icon: <FaBoxOpen size={30} />,
      title: 'Manage Products',
      description: 'View, edit or delete products in inventory',
      route: '/manageProducts',
      color: '#36b9cc'
    },
    {
      icon: <FaPlusCircle size={30} />,
      title: 'Add Products',
      description: 'Add new products to your inventory',
      route: '/addproducts',
      color: '#1cc88a'
    },
    {
      icon: <FaUserTie size={30} />,
      title: 'Manage Employees',
      description: 'Update employee information and access',
      route: '/manageemployee',
      color: '#4e73df'
    },
    {
      icon: <FaPlusCircle size={30} />,
      title: 'Add Customers',
      description: 'Register new customers to the system',
      route: '/addcustomer',
      color: '#f6c23e'
    },
    {
      icon: <FaUsers size={30} />,
      title: 'Manage Customers',
      description: 'View and update customer information',
      route: '/managecustomer',
      color: '#e74a3b'
    }
  ];

  // Sales Management Cards
  const salesCards = [
    {
      icon: <FaRegClock size={30} />,
      title: 'Due Bills',
      description: 'Review unpaid dues and balances',
      route: '/duebills',
      color: '#858796'
    },
    {
      icon: <FaChartLine size={30} />,
      title: 'Sales Report',
      description: 'View sales analytics and reports',
      route: '/sales-report',
      color: '#4e73df'
    },
    {
      icon: <FaFileInvoiceDollar size={30} />,
      title: 'Invoices',
      description: 'View and manage all invoices',
      route: '/invoices',
      color: '#1cc88a'
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>
      {/* Navbar */}
      <div style={{
        background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
        color: 'white',
        padding: '15px 30px',
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FaUserTie size={24} style={{ marginRight: '10px' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            Manager Portal
          </span>
        </div>
        <button 
          onClick={() => setShowLogoutModal(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            ':hover': {
              background: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <AiOutlineLogout />
          <span>Logout</span>
        </button>
      </div>

      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '250px' : '80px',
        height: 'calc(100vh - 60px)',
        position: 'fixed',
        top: '60px',
        left: 0,
        background: 'linear-gradient(180deg, #224abe 0%, #4e73df 100%)',
        color: 'white',
        transition: 'width 0.3s ease',
        zIndex: 800,
        overflowY: 'auto',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            justifyContent: isSidebarOpen ? 'space-between' : 'center',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            position: 'sticky',
            top: 0,
            backgroundColor: '#224abe',
            zIndex: 801
          }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen && <span style={{ fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Navigation</span>}
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
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                color: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: window.location.pathname === item.route ? 'rgba(255,255,255,0.2)' : 'transparent',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white'
                }
              }}
              onClick={() => navigate(item.route)}
            >
              <span style={{ minWidth: '30px', display: 'flex', justifyContent: 'center' }}>
                {item.icon}
              </span>
              {isSidebarOpen && <span style={{ marginLeft: '10px', fontSize: '0.85rem' }}>{item.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: isSidebarOpen ? '250px' : '80px',
        padding: '30px',
        transition: 'margin-left 0.3s ease',
        paddingTop: '90px'
      }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
            Welcome back, <span style={{ color: '#4e73df' }}>{manager?.name || 'Manager'}</span>
          </h2>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Here's what's happening with your business today
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="row mb-5 g-4">
          {metricCards.map((metric, index) => (
            <div key={index} className="col-xl-3 col-md-6">
              <div 
                className="h-100"
                style={{
                  background: metric.color,
                  color: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  height: '100%',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                  }}>
                    {metric.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>
                      {metric.title}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '600' }}>
                      {metric.value}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>
                  {metric.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Divider */}
        <div style={{
          borderTop: '2px solid #e3e6f0',
          margin: '40px 0',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '20px',
            background: '#f8f9fc',
            padding: '0 15px',
            color: '#4e73df',
            fontWeight: '600',
            fontSize: '18px'
          }}>
            <FaWarehouse style={{ marginRight: '10px' }} />
            Inventory Management
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="row g-4 mb-5">
          {inventoryCards.map((card, index) => (
            <div key={index} className="col-xl-4 col-md-6">
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  height: '100%',
                  borderLeft: `5px solid ${card.color}`,
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                  }
                }}
                onClick={() => navigate(card.route)}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: `${card.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px',
                    color: card.color
                  }}>
                    {card.icon}
                  </div>
                  <h5 style={{ margin: 0, color: '#2c3e50' }}>{card.title}</h5>
                </div>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  {card.description}
                </p>
                <button 
                  style={{
                    background: `${card.color}10`,
                    color: card.color,
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    ':hover': {
                      background: `${card.color}20`
                    }
                  }}
                >
                  {card.title.startsWith('Add') ? 'Add New' : 'Manage Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section Divider */}
        <div style={{
          borderTop: '2px solid #e3e6f0',
          margin: '40px 0',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '20px',
            background: '#f8f9fc',
            padding: '0 15px',
            color: '#4e73df',
            fontWeight: '600',
            fontSize: '18px'
          }}>
            <FaChartLine style={{ marginRight: '10px' }} />
            Sales Management
          </div>
        </div>

        {/* Sales Cards */}
        <div className="row g-4">
          {salesCards.map((card, index) => (
            <div key={index} className="col-xl-4 col-md-6">
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  height: '100%',
                  borderLeft: `5px solid ${card.color}`,
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                  }
                }}
                onClick={() => navigate(card.route)}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: `${card.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px',
                    color: card.color
                  }}>
                    {card.icon}
                  </div>
                  <h5 style={{ margin: 0, color: '#2c3e50' }}>{card.title}</h5>
                </div>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  {card.description}
                </p>
                <button 
                  style={{
                    background: `${card.color}10`,
                    color: card.color,
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    ':hover': {
                      background: `${card.color}20`
                    }
                  }}
                >
                  {card.title.startsWith('Add') ? 'Add New' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '400px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h5 style={{ marginBottom: '20px', color: '#2c3e50' }}>
              Confirm Logout
            </h5>
            <p style={{ color: '#6c757d', marginBottom: '30px' }}>
              Are you sure you want to logout from the system?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '10px 25px',
                  background: '#e74a3b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s',
                  ':hover': {
                    background: '#c53030'
                  }
                }}
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: '10px 25px',
                  background: '#f8f9fa',
                  color: '#495057',
                  border: '1px solid #e3e6f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s',
                  ':hover': {
                    background: '#e9ecef'
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Success Message */}
      {logoutMessage && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1cc88a',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '8px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
          zIndex: 1051,
          animation: 'fadeInOut 2s forwards'
        }}>
          You have been successfully logged out
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;