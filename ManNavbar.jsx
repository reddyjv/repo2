import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ onLogout }) {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getInitials = (name) => {
        const first = name?.charAt(0)?.toUpperCase() || '';
        const second = name?.charAt(1)?.toUpperCase() || '';
        return first + second;
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
        setDropdownOpen(false);
    };

    const confirmLogout = () => {
        localStorage.clear();
        setShowLogoutModal(false);
        setShowSuccessMessage(true);
        
        // Hide success message after 2 seconds and redirect
        setTimeout(() => {
            setShowSuccessMessage(false);
            navigate('/'); // Redirect to home page
            if (onLogout) onLogout();
        }, 2000);
    };

    const initials = getInitials(user?.name);

    return (
        <>
            {/* Success Message - Smaller Size */}
            {showSuccessMessage && (
                <div className="alert alert-success alert-dismissible fade show mb-0 rounded-0 py-2" 
                     style={{
                         position: 'fixed',
                         top: '0',
                         left: '0',
                         right: '0',
                         zIndex: 9999,
                         textAlign: 'center',
                         fontSize: '0.875rem',
                         padding: '0.5rem 1rem'
                     }}>
                    <strong>Success!</strong> You have been logged out successfully.
                </div>
            )}

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3 py-2 shadow-sm" 
                 style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' }}>
                <div className="container-fluid">
                    {/* Brand/Logo */}
                    <div className="d-flex align-items-center">
                        <i className="bi bi-shop-window me-2" style={{ fontSize: '1.5rem' }}></i>
                        <span className="navbar-brand fw-bold fs-4">
                            {user?.role === "manager" ? "Manager Portal" : "Vendor Portal"}
                        </span>
                    </div>

                    {/* Profile Dropdown */}
                    {user && (
                        <div className="dropdown" ref={dropdownRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 rounded-pill px-2 py-1"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div 
                                    className="rounded-circle bg-white text-primary d-flex justify-content-center align-items-center"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {initials}
                                </div>
                                <span className="fw-semibold">{user.name}</span>
                                <i className={`bi bi-caret-down-fill small ${dropdownOpen ? 'rotate-180' : ''}`}
                                   style={{ transition: 'transform 0.3s ease' }}></i>
                            </button>

                            {dropdownOpen && (
                                <ul className="dropdown-menu dropdown-menu-end show mt-2 shadow" 
                                    style={{
                                        minWidth: '220px',
                                        border: 'none',
                                        borderRadius: '10px'
                                    }}>
                                    <li>
                                        <button className="dropdown-item d-flex align-items-center py-2">
                                            <i className="bi bi-person-circle me-2 text-primary"></i>
                                            My Profile
                                        </button>
                                    </li>
                                    <li>
                                        <button className="dropdown-item d-flex align-items-center py-2">
                                            <i className="bi bi-gear me-2 text-primary"></i>
                                            Settings
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider my-1" /></li>
                                    <li>
                                        <button 
                                            onClick={handleLogout} 
                                            className="dropdown-item d-flex align-items-center py-2 text-danger"
                                        >
                                            <i className="bi bi-box-arrow-right me-2"></i>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Logout</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowLogoutModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to logout?</p>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowLogoutModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={confirmLogout}
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;