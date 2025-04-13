import React, { useContext, useEffect, useState } from 'react';
import { FaEdit, FaBoxOpen, FaEyeSlash, FaEye } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import UserContext from '../state-management/UserContext';
import { AuthContext } from '../state-management/AuthContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { Link, Outlet } from 'react-router-dom';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      {/* Nav Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6 border-b w-full">
          <Link to = {`/user/profile`}
            className={`pb-2 text-lg font-medium cursor-pointer 
                ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </Link>
          <Link to = {`/user/orders`}
            className={`pb-2 text-lg font-medium cursor-pointer ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </Link>
          <Link to = '/user/update-password'
            className={`pb-2 text-lg font-medium cursor-pointer ${activeTab === 'update-password' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('update-password')}
          >
            Update Password
          </Link>
          <Link to = '/user/account-information'
            className={`pb-2 text-lg font-medium cursor-pointer 
                ${activeTab === 'more' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('more')}
          >
            More
          </Link>
        </div>
        
      </div>

     <Outlet />



    </div>
  );
}

export default UserDashboard;
