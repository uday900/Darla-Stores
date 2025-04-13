import React, { useContext, useEffect, useState } from 'react';
import { FaEdit, FaBoxOpen, FaEyeSlash, FaEye } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import UserContext from '../state-management/UserContext';
import { AuthContext } from '../state-management/AuthContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

function UserProfile() {
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
    console.log("user profile")
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
    // fetchOrdersByUser(userData.id);
  }, []); // ✅ Only run once on mount

 


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



  if (loading || authLoading) return <Loading />
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
     
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
    

    </div>
  );
}

export default UserProfile;
