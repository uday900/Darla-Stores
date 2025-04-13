import React, { useEffect, useContext } from 'react';
import { FaBox, FaShoppingCart, FaTags, FaUsers, FaPlus, FaThList, FaUserFriends } from 'react-icons/fa';
import { ProductContext } from '../../state-management/ProductContext';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';
import { GrUpdate } from 'react-icons/gr';
import { IoIosAddCircle } from 'react-icons/io';

function Dashboard() {
  // use context
  const { metrics, loading, error, fetchMetrics } = useContext(ProductContext);

  useEffect(() => {
    fetchMetrics();
  }, []);

  console.log("metrics", metrics);



  if (loading) return <Loading/>
  if (error) console.log(error)
  // if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  // if (!metrics) return null;

  const recentOrders = [
    { orderId: '1234567890', customerName: 'John Doe', orderDate: '2024-01-01 12:00:00', status: 'Pending' },
    { orderId: '1234567891', customerName: 'Jane Smith', orderDate: '2024-01-01 13:30:00', status: 'Delivered' },
    { orderId: '1234567892', customerName: 'Alice Johnson', orderDate: '2024-01-01 14:45:00', status: 'Shipped' },
    { orderId: '1234567893', customerName: 'Bob Brown', orderDate: '2024-01-01 15:00:00', status: 'Delivered' },
  ];
  const getStatusClass = (status) => {
    switch (status.lowerCase()) {
      case 'pending': return 'bg-yellow-200 text-yellow-800';
      case 'delivered': return 'bg-green-200 text-green-800';
      case 'shipped': return 'bg-blue-200 text-blue-800';
      default: return 'bg-gray-200 text-gray-800';
    }
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
  


  return (
    <div className="p-4 space-y-8">
      {/* Top: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-xl text-center shadow">
          <FaBox className="text-3xl mx-auto text-blue-700 mb-2" />
          <h2 className="text-xl font-semibold">Total Products</h2>
          <p className="text-2xl">{metrics?.totalProducts}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl text-center shadow">
          <FaShoppingCart className="text-3xl mx-auto text-green-700 mb-2" />
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-2xl">{metrics?.totalOrders}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center shadow">
          <FaTags className="text-3xl mx-auto text-yellow-700 mb-2" />
          <h2 className="text-xl font-semibold">Total Categories</h2>
          <p className="text-2xl">{metrics?.totalCategories}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl text-center shadow">
          <FaUsers className="text-3xl mx-auto text-purple-700 mb-2" />
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-2xl">{metrics?.totalUsers}</p>
        </div>
      </div>

      {/* Middle: Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Recent Activity */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <ul className="space-y-2">
            {/* show empty message if no activities */}
            {metrics?.activities?.length === 0 ? (
              <li className="border-b pb-2 text-gray-700">
                <span className="font-medium">No activities yet</span>
              </li>
            ) : (
              metrics?.activities?.map((activity, index) => (
                <li key={index} className="border-b pb-2 text-gray-700">
                  <span className="font-medium">{activity.message} message</span>
                <br />
                <span className="text-sm text-gray-500">{formatDateTime(activity.timestamp)}</span>
              </li>
              ))
            )}
          </ul>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/admin/add-product" className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition cursor-pointer">
              <FaPlus /> Add Product
            </Link>
            <Link to ="/admin/categories" className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition cursor-pointer">
            <IoIosAddCircle /> Add Category
            </Link>
            <Link to="/admin/orders" className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition cursor-pointer">
              <GrUpdate /> Update Orders
            </Link>
            <Link to="/admin/users" className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition cursor-pointer">
              <FaUserFriends /> View Customers
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom: Recent Orders */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-4 py-2 border">Order ID</th>
                <th className="text-left px-4 py-2 border">User ID</th>
                <th className="text-left px-4 py-2 border">Order Date</th>
                <th className="text-left px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No recent orders</td>
                </tr>
              ) : (
                metrics?.recentOrders?.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{order.id}</td>
                  <td className="px-4 py-2 border">{order.userId}</td>
                  <td className="px-4 py-2 border">{formatDateTime(order.createdAt)}</td>
                  {/* <td className="px-4 py-2 border">{order.status}</td> */}
                  <td className="px-4 py-2 border">
                    <span className={`px-2 py-1 rounded-full text-sm ${getColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>

                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
