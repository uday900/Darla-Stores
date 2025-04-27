import { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../state-management/AuthContext';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import logo from '../assets/logo.jpg'
import UserContext from '../state-management/UserContext';
import { ImCross } from "react-icons/im";
import ProductContext from '../state-management/ProductContext';

const Navbar = () => {
    // const [searchQuery, setSearchQuery] = useState('');
    const { searchQuery, setSearchQuery } = useContext(ProductContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();


    // state values
    const { loading,logout } = useContext(AuthContext);
    const { fetchUserCart, loading: cartLoading, cart } = useContext(UserContext);
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';


    useEffect(() => {
        // Clear the search query when navigating away from /search
        if (location.pathname !== "/search") {
          setSearchQuery("");
        }
      }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            
            // setSearchQuery('');
            setShowMobileSearch(false);
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };


    const handleLogout = () => {
        
        if(window.confirm("Are you sure you want to logout?")){
            logout();
        
        toast.success('Logged out successfully');
        navigate('/login');
        }
        
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setShowMobileSearch(false);
    };

    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        if (isAuthenticated && !isAdmin) {
            fetchUserCart(user.id);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (cart) {
            // setCartCount(cart?.length || 0);
            // iterate through the cart and count the number of items
            let count = 0;
            cart.forEach((item) => {
                count += item.quantity;
            });
            setCartCount(count);
        }
    }, [cart]);

    return (
        <nav className="bg-white shadow-md sticky w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Firm Name */}
                    <div className="flex-shrink-0">
  <Link
    to="/"
    className="text-2xl font-bold scroll-smooth cursor-pointer"
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  >
    {/* Darla <span className="text-indigo-600">Stores</span> */}
    <img src={logo} alt="logo" className="w-32" />
  </Link>
</div>


                    {/* Search Bar - Desktop & Tablet */}
                    <div className="hidden md:block lg:block flex-1 max-w-2xl mx-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input w-full px-4 py-2 pr-10"
                                required
                            />
                            {/* remove button */}
                            { searchQuery && (
                            
                                <button
                                type='button'
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-5 pr-5 flex items-center cursor-pointer">
                                    <ImCross className="text-gray-400 text-sm hover:text-gray-500" />
                                </button>
                            
                            )}
                            <button
                            type="submit"
                            onClick={()=>handleSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                                <FaSearch className="text-gray-400 hover:text-gray-500" />
                            </button>
                        </form>
                    </div>

                    {/* Mobile Icons (Search & Menu) */}
                    <div className="flex items-center gap-2 md:hidden">
                    { searchQuery && (
                            
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 top-16 right-5 pr-7 flex items-center cursor-pointer">
                                <ImCross className="text-gray-400 text-sm hover:text-gray-500" />
                            </button>
                        
                        )}
                        {/* Mobile Search Icon */}
                        <button
                            onClick={toggleMobileSearch}
                            className="p-2 rounded-md text-gray-700 hover:text-indigo-600"
                        >
                            <FaSearch className="h-5 w-5" />
                        </button>

                        {/* Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-700 hover:text-indigo-600"
                        >
                            {isMenuOpen ? (
                                <FaTimes className="h-6 w-6" />
                            ) : (
                                <FaBars className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {!isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="primary-button text-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                {user?.role === "USER" && (
                                    <>
                                        {/* User profile */}
                                        <Link to="/user/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-full hover:text-indigo-600">
                                            <FaUser className="h-4 w-4" />
                                            <span className="text-gray-700 font-medium">
                                                {user?.name}
                                            </span>
                                        </Link>
                                        {/* Shopping Cart */}
                                        <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full group">
                                            <FaShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-indigo-600" />
                                          
                                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {cartCount}
                                                </span>
                                         
                                        </Link>
                                    </>
                                )}

                                {/* Admin Dashboard Link */}
                                {user?.role === 'ADMIN' && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-700 hover:text-red-600 cursor-pointer px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                >
                                    Logout
                                    <FaSignOutAlt className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showMobileSearch && (
                    <div className="md:hidden py-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input w-full px-4 py-2 pr-10"
                                autoFocus
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                        </form>
                    </div>
                )}

                {/* Mobile & Tablet Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {user?.role === "USER" && (
                                        <>
                                            <div className="px-3 py-2 rounded-md text-base font-medium text-gray-700">
                                                <FaUser className="inline h-4 w-4 mr-2" />
                                                {user?.name}
                                            </div>
                                            <Link
                                                to="/cart"
                                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                            >
                                                <FaShoppingCart className="h-5 w-5 mr-2" />
                                                Cart
                                                {cartCount > 0 && (
                                                    <span className="ml-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {cartCount
                                                        }
                                                    </span>
                                                )}
                                            </Link>
                                        </>
                                    )}
                                    {user?.role === 'ADMIN' && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 flex items-center"
                                    >
                                        Logout
                                        <FaSignOutAlt className="h-4 w-4 ml-2" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;