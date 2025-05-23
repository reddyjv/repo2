import React, { useState, useEffect } from 'react';

import { AiFillHome, AiOutlineUser, AiOutlineMenu } from 'react-icons/ai';

import { FaUserPlus, FaBoxOpen, FaUsers, FaRegClock, FaCogs } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';


 

const ManagerDashboard = () => {

  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [manager, setManager] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [showMessage, setShowMessage] = useState(false);


 

  const handleLogoutClick = () => setShowModal(true);

  const handleConfirmLogout = () => {

    localStorage.clear();

    setShowModal(false);

    setShowMessage(true);

    setTimeout(() => {

      setShowMessage(false);

      navigate('/');

    }, 2000);

  };

  const handleCancelLogout = () => setShowModal(false);


 

  useEffect(() => {

    const storedUser = localStorage.getItem('user');

    if (storedUser) {

      setManager(JSON.parse(storedUser));

    }

  }, []);


 

  const cardStyle = {

    height: '100%',

    borderRadius: '12px',

    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',

    background: '#ffffff',

    padding: '20px',

    transition: 'transform 0.2s',

  };


 

  const iconStyle = {

    fontSize: '38px',

    color: '#0d6efd',

    marginBottom: '10px',

  };


 

  const buttonStyle = {

    width: '60%',

  };


 

  return (

    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>

      {/* Sidebar */}

      <div

        className="text-white p-3"

        style={{

          width: isSidebarOpen ? '250px' : '80px',

          background: 'rgb(0, 0, 102)',

          transition: 'width 0.3s',

          position: 'fixed',

          height: '100vh',

        }}

      >

        <div

          style={{

            cursor: 'pointer',

            marginBottom: '30px',

            fontSize: '18px',

            display: 'flex',

            alignItems: 'center',

            justifyContent: isSidebarOpen ? 'space-between' : 'center',

          }}

          onClick={() => setIsSidebarOpen(!isSidebarOpen)}

        >

          {isSidebarOpen && <span style={{ marginLeft: 10, fontSize: 20 }}>Menu</span>}

          <AiOutlineMenu size={24} />

        </div>


 

        <ul className="nav flex-column">

          <li className="nav-item mb-3">

            <div className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/manager/dashboard')}>

              <AiFillHome size={20} className="me-2" />

              {isSidebarOpen && 'Home'}

            </div>

          </li>

          <li className="nav-item mb-3">

            <div className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/manageemployee')}>

              <AiOutlineUser size={20} className="me-2" />

              {isSidebarOpen && 'Manage Employees'}

            </div>

          </li>

          <li className="nav-item mb-3">

            <div className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/addcustomer')}>

              <FaUserPlus size={20} className="me-2" />

              {isSidebarOpen && 'Add Customer'}

            </div>

          </li>

          <li className="nav-item mb-3">

            <div className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/managecustomer')}>

              <FaUsers size={20} className="me-2" />

              {isSidebarOpen && 'Manage Customers'}

            </div>

          </li>

          <li className="nav-item mb-3">

            <div className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/addproducts')}>

              <FaBoxOpen size={20} className="me-2" />

              {isSidebarOpen && 'Add Products'}

            </div>

          </li>

          <li className="nav-item mb-3">

            <div className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/dueBills')}>

              <FaRegClock size={20} className="me-2" />

              {isSidebarOpen && 'Due Status'}

            </div>

          </li>

          <li className="nav-item">

            <div className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/manageProducts')}>

              <FaCogs size={20} className="me-2" />

              {isSidebarOpen && 'Manage Products'}

            </div>

          </li>

        </ul>

      </div>


 

      {/* Main */}

      <div className="flex-grow-1" style={{ marginLeft: isSidebarOpen ? '250px' : '80px', padding: '20px' }}>

        <nav

          style={{

            background: '#ffffff',

            borderRadius: '10px',

            padding: '15px 30px',

            boxShadow: '0 3px 6px rgba(0,0,0,0.05)',

            marginBottom: '20px',

          }}

        >

          <div className="d-flex justify-content-between align-items-center">

            <span className="h4 mb-0" style={{ color: '#334155' }}>

              Manager Dashboard

            </span>

            <button className="btn btn-outline-danger" onClick={handleLogoutClick}>

              Logout

            </button>

          </div>

        </nav>


 

        <h5 className="text-center mb-4">

          Welcome, <span className="fw-bold text-primary">{manager?.data.gender === 'Female' ? 'Ms.' : 'Mr.'} {manager?.data.name}</span>

        </h5>


 

        {/* Cards */}

        <div className="row g-4">

          <div className="col-md-4">

            <div style={cardStyle}>

              <div className="text-center">

                <FaUserPlus style={iconStyle} />

                <h5 className="mb-3">Add Customer</h5>

                <p>Create a new customer profile.</p>

                <button className="btn btn-primary" style={buttonStyle} onClick={() => navigate('/addcustomer')}>Add Customer</button>

              </div>

            </div>

          </div>


 

          <div className="col-md-4">

            <div style={cardStyle}>

              <div className="text-center">

                <FaUsers style={iconStyle} />

                <h5 className="mb-3">Manage Customers</h5>

                <p>View and update customer data.</p>

                <button className="btn btn-primary" style={buttonStyle} onClick={() => navigate('/managecustomer')}>Manage</button>

              </div>

            </div>

          </div>


 

          <div className="col-md-4">

            <div style={cardStyle}>

              <div className="text-center">

                <FaBoxOpen style={iconStyle} />

                <h5 className="mb-3">Add Products</h5>

                <p>Add new products to inventory.</p>

                <button className="btn btn-primary" style={buttonStyle} onClick={() => navigate('/addproducts')}>Add</button>

              </div>

            </div>

          </div>


 

          <div className="col-md-4">

            <div style={cardStyle}>

              <div className="text-center">

                <FaRegClock style={iconStyle} />

                <h5 className="mb-3">Due Status</h5>

                <p>Review unpaid dues and balances.</p>

                <button className="btn btn-primary" style={buttonStyle} onClick={() => navigate('/duebills')}>Check Dues</button>

              </div>

            </div>

          </div>


 

          <div className="col-md-4">

            <div style={cardStyle}>

              <div className="text-center">

                <FaUsers style={iconStyle} />

                <h5 className="mb-3">Manage Employees</h5>

                <p>Update employee information.</p>

                <button className="btn btn-primary" style={buttonStyle} onClick={() => navigate('/manageemployee')}>Manage</button>

              </div>

            </div>

          </div>


 

          <div className="col-md-4">

            <div style={cardStyle}>

              <div className="text-center">

                <FaCogs style={iconStyle} />

                <h5 className="mb-3">Manage Products</h5>

                <p>Modify or review your items.</p>

                <button className="btn btn-primary" style={buttonStyle} onClick={() => navigate('/manageProducts')}>Manage</button>

              </div>

            </div>

          </div>

        </div>


 

        {/* Modal */}

        {showModal && (

          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>

            <div className="bg-white rounded p-4 text-center shadow" style={{ width: '300px' }}>

              <p className="mb-4 text-dark">Are you sure you want to logout?</p>

              <button className="btn btn-danger me-2" onClick={handleConfirmLogout}>Yes</button>

              <button className="btn btn-secondary" onClick={handleCancelLogout}>No</button>

            </div>

          </div>

        )}


 

        {/* Logout Message */}

        {showMessage && (

          <div

            className="position-fixed top-0 start-50 translate-middle-x m-4 p-3 bg-success text-white rounded shadow"

            style={{

              zIndex: 1051,

              animation: 'fadeIn 0.5s ease-in-out',

            }}

          >

            You have successfully logged out.

          </div>

        )}

      </div>

    </div>

  );

};


 

export default ManagerDashboard;


 