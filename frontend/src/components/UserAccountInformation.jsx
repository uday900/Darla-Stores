import React, { useContext, useEffect, useState } from 'react';
import { FaEdit, FaBoxOpen, FaEyeSlash, FaEye } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import UserContext from '../state-management/UserContext';
import { AuthContext } from '../state-management/AuthContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

function UserAccountInformation() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

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
    console.log("account-info");
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
    // fetchOrdersByUser(userData.id);
  }, []); // ✅ Only run once on mount

 

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


  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(requirement => requirement);
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


  if (loading || authLoading) return <Loading />
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">

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
      



    </div>
  );
}

export default UserAccountInformation;
