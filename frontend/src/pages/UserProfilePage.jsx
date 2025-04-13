import React, { useContext, useEffect, useState } from 'react';
import { FaEdit, FaBoxOpen, FaEyeSlash, FaEye } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import UserContext from '../state-management/UserContext';
import { AuthContext } from '../state-management/AuthContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

function UserProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [user, setUser] = useState({
  });

  const { updateProfile,
    updatePassword,
    loading, error, message,
    orders,
    fetchOrdersByUser,
    updateOrder,

  } = useContext(UserContext);

  const { loading: authLoading, logout, deleteAccount } = useContext(AuthContext);

  // const [user, setUser] = useState({
  //   name: 'John Doe',
  //   email: 'john@gmail.com',
  //   phone: '1234567890',
  //   city: 'New York',
  //   state: 'NY',
  //   country: 'USA',
  //   zipCode: '10001',
  //   street: '123 Main St',
  // });
  const userData = JSON.parse(localStorage.getItem('user'));

  const handleUpdatePassword = () => {
    updatePassword(user.id, currentPassword, newPassword);
  };
  useEffect(() => {
    // console.log(userData);
    if (userData) {
      setUser({
        id: userData.id || '',
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        city: userData.city || '',
        state: userData.state || '',
        country: userData.country || '',
        zipCode: userData.zipCode || '',
        street: userData.street || '',
        role: userData.role || '',
        createdAt: userData.createdAt || '',
      });
    }
    fetchOrdersByUser(userData.id);
  }, []); // ✅ Only run once on mount

  useEffect(() => {
    if (orders) {
      const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFilteredOrders(sorted);
    }
  }, [orders]);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount =  () => {
    // Perform delete account logic here
    const handlerFunction = async (param) => {
      await deleteAccount(param);
    };
    const password = prompt('Please enter your password to confirm account deletion');
    if (password) {
      handlerFunction(password);
    }
    else{
      toast.error('Please enter your password to confirm account deletion');
    }
  };

  // const orders = [
  //   {
  //     id: 1,
  //     productName: 'Product 1',
  //     productId: 1,
  //     quantity: 1,
  //     totalAmount: 100,
  //     orderDate: '2021-01-01',
  //     status: 'Delivered',
  //     paymentMethod: 'Cash on Delivery',
  //   },
  // ];

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8 && password.length <= 16,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@#$%^&+=!]/.test(password),
    });
  };
  const PasswordRequirements = () => (
    <div className="mt-2 space-y-1">
      <p className="text-sm text-gray-600">Password must contain:</p>
      <ul className="text-sm space-y-1">
        <li className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasMinLength ? '✓' : '•'}</span>
          Between 8 and 16 characters
        </li>
        <li className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasUpperCase ? '✓' : '•'}</span>
          At least one uppercase letter
        </li>
        <li className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasLowerCase ? '✓' : '•'}</span>
          At least one lowercase letter
        </li>
        <li className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '•'}</span>
          At least one number
        </li>
        <li className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasSpecialChar ? '✓' : '•'}</span>
          At least one special character (@#$%^&+=!)
        </li>
      </ul>
    </div>
  );


  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(requirement => requirement);
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditMode(false);
    const updatedProfile = new FormData();
    updatedProfile.append('name', user.name);
    updatedProfile.append('email', user.email);
    updatedProfile.append('phoneNumber', user.phone);
    updatedProfile.append('city', user.city);
    updatedProfile.append('state', user.state);
    updatedProfile.append('country', user.country);
    updatedProfile.append('zipCode', user.zipCode);
    updatedProfile.append('street', user.street);


    updateProfile(user.id, user);
    // alert('Profile Updated!');

  };
  function formatDateTime(isoString) {
    const date = new Date(isoString);

    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Month is 0-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12

    return `${day}-${month}-${year} at ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
  }

  const handleCancelOrder = async (orderId) => {

    // logic to cancel the order, update status to CANCELED;
    updateOrder(orderId, 'CANCELED');
  };

  const getColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'text-green-800 bg-green-200 '
      case 'DELIVERED':
      case 'REFUNDED':
      case 'COMPLETED':
        return 'text-green-600  bg-green-200';
      case 'CONFIRMED':
        return 'text-blue-800 rounded text-sm bg-blue-200';
      case 'SHIPPED':
        return 'text-yellow-600 font-bold bg-yellow-200';
      case 'CANCELLED':
      case 'CANCELED':
      case 'REFUND_INITIATED':
      case 'REFUND_ISSUED':
      case 'FAILED':
        return 'text-red-600 font-bold bg-red-200';
      case 'PENDING':
        return 'text-red-600 font-bold bg-red-200';
      case 'RETURNED':
        return 'text-red-600 font-bold bg-red-200';
      default:
        return 'text-gray-600 font-bold bg-gray-200';
    }
  };


  const isFormValid = isPasswordValid && newPassword === confirmPassword &&
    currentPassword &&
    newPassword &&
    confirmPassword;

  if (loading || authLoading) return <Loading />
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      {/* Nav Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6 border-b w-full">
          <button
            className={`pb-2 text-lg font-medium cursor-pointer ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`pb-2 text-lg font-medium cursor-pointer ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`pb-2 text-lg font-medium cursor-pointer ${activeTab === 'update-password' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('update-password')}
          >
            Update Password
          </button>
          <button
            className={`pb-2 text-lg font-medium cursor-pointer ${activeTab === 'more' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('more')}
          >
            More
          </button>
        </div>
        {/* <button
          onClick={handleLogout}   
         className="flex cursor-pointer items-center gap-1 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          <FiLogOut className="text-white" /> Logout
        </button>
        */}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl font-bold">{userData.name}</h1>
            <FaEdit
              className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-600"
              onClick={() => setEditMode(!editMode)}
            />
          </div>

          {Object.keys(user).map((key) => (
            key !== 'id' && key !== 'role' && key !== 'createdAt' &&
            <div key={key}>
              <label className="block text-gray-600 capitalize">{key}</label>
              {editMode ? (
                <input
                  type="text"
                  name={key}
                  value={user[key] || ''}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-gray-800">{user[key] || 'N/A'}</p>
              )}
            </div>
          ))}

          {editMode && (
            <button
              onClick={handleSave}
              className={`${loading ? 'disable-button' : 'mt-4 cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'}`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save'}
            </button>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaBoxOpen /> Your Orders
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 border border-gray-200 rounded flex flex-col md:flex-row gap-4 items-start">
  
                {/* Left: Product Image */}
                <div className="w-full md:w-40 h-40 flex-shrink-0">
                  <img
                    src={`data:image/png;base64,${order.imageData}`} // replace with your image field or placeholder
                    alt={order?.productName}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              
                {/* Right: Order Details */}
                <div className="flex-1">
                  <p><span className="font-medium">Order ID:</span> {order.id}</p>
                  <p><span className="font-medium">Product:</span> {order.productName}</p>
                  <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                  <p><span className="font-medium">Total Amount:</span> ₹{order.totalAmount}</p>
                  <p><span className="font-medium">Order Date:</span> {formatDateTime(order.createdAt || '')}</p>
              
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ' + getColor(order.status)}>
                      {order.status}
                    </span>
                  </p>
              
                  <p>
                    <span className="font-medium">Payment:</span> {order.paymentMethod || 'Cash on Delivery'}
                  </p>
              
                  <p>
                    <span className="font-medium">Payment Status:</span>
                    <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ' + getColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </span>
                  </p>
              
                  {order?.paymentId && (
                    <p><span className="font-medium">Payment ID:</span> {order.paymentId}</p>
                  )}
              
                  <p><span className="font-medium">Delivery Address:</span> {order.shippingAddress || 'N/A'}</p>
              
                  {order?.status !== 'CANCELED' && order?.status !== 'DELIVERED' && (
                    <button
                      className="mt-3 cursor-pointer text-white rounded-full bg-red-500 px-4 py-2 text-sm hover:bg-red-600"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
              
                // <div key={order.id} className="p-4 border border-gray-200 rounded">
                //   <p><span className="font-medium">Order ID:</span> {order.id}</p>
                //   <p><span className="font-medium">Product:</span> {order.productName}</p>
                //   <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                //   <p><span className="font-medium">Total Amount:</span> ₹{order.totalAmount}</p>
                //   <p><span className="font-medium">Order Date:</span> {formatDateTime(order.createdAt || '')}</p>
                //   <p><span className="font-medium">Status:</span> 
                //   <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm' + getColor(order.status)}>
                //     {order.status}</span>
                //   </p>
                //   <p><span className="font-medium">Payment:</span> {order.paymentMethod || 'Cash on Delivery'}</p>
                  
                //   <p><span className="font-medium">Payment Status:</span> 
                //   <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm' + getColor(order.paymentStatus)}>
                //   {order.paymentStatus}</span>
                //   </p>
                //   {order?.paymentId && <p><span className="font-medium">Payment ID:</span> {order?.paymentId}</p>}

                //   <p><span className="font-medium">Delivery Address:</span> {order.shippingAddress || 'N/A'}</p>
                //   <p>{order?.status !== 'CANCELED' && 
                //   order?.status !== 'DELIVERED' 
                //   && <button className="mt-2 cursor-pointer  text-white rounded-full bg-red-500 px-4 py-2 text-sm hover:bg-red-600 " 
                //   onClick={() => handleCancelOrder(order.id)}
                //   >Cancel Order</button>}
                  
                //    </p>

                // </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'update-password' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaBoxOpen /> Update Password
          </h2>
          <form action="" onSubmit={handleUpdatePassword}>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-gray-600">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="relative">
                <label className="block text-gray-600">New Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                  }}
                  className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <PasswordRequirements />

              <div className="relative">
                <label className="block text-gray-600">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordError(e.target.value !== newPassword ? 'Passwords do not match' : '')
                  }}
                  className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
                />
                {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
                <span
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>



              <button
                type="button"
                onClick={handleUpdatePassword}
                className={`${!isFormValid || loading ? 'disable-button' : 'primary-button'}`}
                disabled={!isFormValid || loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
            </div>
          </form>
        </div>
      )}
      {activeTab === 'more' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaBoxOpen /> More
          </h2>

          {/* User Info (Simple View) */}
          <div className="mb-4 space-y-2">
            <h3 className="text-lg font-semibold">User Info</h3>
            {Object.entries(user).map(([key, value]) => (
              key !== 'id' && key !== 'role' && key !== 'createdAt' && (
                <div key={key} className="text-sm text-gray-700">
                  <span className="font-medium capitalize">{key}:</span> {value || 'N/A'}
                </div>
              )
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">


            <button
              type="button"
              onClick={handleDeleteAccount}
              className="text-sm hover:text-red-500 cursor-pointer block font-bold"
            >
              Delete or Deactivate Account
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="delete-button"
            >
              Logout
            </button>
          </div>
        </div>
      )}



    </div>
  );
}

export default UserProfilePage;
