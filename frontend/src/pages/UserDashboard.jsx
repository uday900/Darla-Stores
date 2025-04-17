import React, { useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function UserDashboard() {
  // fetch active tab from url 
  const location = useLocation();
  const path = location.pathname; // "/user/update-password"

  const lastSegment = path.split("/").filter(Boolean).pop(); // "update-password"

  const [activeTab, setActiveTab] = useState(lastSegment);
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
