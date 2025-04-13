import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../state-management/UserContext';
import Loading from '../../components/Loading';
import { getColor } from '../../components/getColor';

const dummyOrders = [
  // ... (your existing data)
  {
    id: 1,
    userId: 1,
    productName: 'Product 1',
    quantity: 2,
    totalAmount: 100,
    status: 'Pending',
    createdAt: '2023-01-01',
  },
  {
    id: 2,
    userId: 2,
    productName: 'Product 2',
    quantity: 1,
    totalAmount: 50,
    status: 'Delivered',
    createdAt: '2023-01-02',
  },
  {
    id: 3,
    userId: 3,
    productName: 'Product 3',
    quantity: 3,
    totalAmount: 150,
    status: 'Cancelled',
    createdAt: '2023-01-03',
  },
];

function ManageOrders() {
  // const [orders, setOrders] = useState(dummyOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editedStatuses, setEditedStatuses] = useState({});
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState('');


  // 'REFUND_ISSUED', 'REFUND_INITIATED', 
  const statusOptions = ['PENDING','CONFIRMED',  'SHIPPED', 'OUT_OF_DELIVERY', 'DELIVERED', 'CANCELED', 'COMPLETED'];
  const statusOptionsForFilter = ['PENDING','CONFIRMED',  'SHIPPED', 'OUT_OF_DELIVERY', 'DELIVERED', 'CANCELED', 'COMPLETED', 'REFUND_ISSUED', 'REFUND_INITIATED'];

  // state values
  const { orders, loading, message, error, 
    updateOrder,
     fetchAllOrders,
     refund 
     } = useContext(UserContext);

  useEffect(() => {
    fetchAllOrders();
  }, [])


  // useEffect(() => {
  //   if (searchTerm === '') {
  //     setFilteredOrders(orders);
  //     return;
  //   }
  //   setFilteredOrders(
  //     // FILTER ONLY ORDER ID
  //     orders.filter((order) => order.id.toString().startsWith(searchTerm) || order.id === Number(searchTerm) || order.status == statusFilter )
  //   );
  // }, [orders, searchTerm]);

  // useEffect(() => {
  //   if (statusFilter === '') {
  //     setFilteredOrders(orders);
  //     return;
  //   }
  //   setFilteredOrders(
  //     orders.filter((order) => order.status === statusFilter)
  //   );
  // }, [orders, statusFilter]);

  useEffect(() => {
    let filtered = orders;

    // sort by date latest
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    if (searchTerm !== '') {
      filtered = filtered.filter((order) =>
        order.id.toString().startsWith(searchTerm) ||
        order.id === Number(searchTerm)
      );
    }
  
    if (statusFilter !== '') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

 
  
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);
  

  const handleRefund = async (id) => {
    await refund(id);
  }
  const handleStatusChange = (id, newStatus) => {
    setEditedStatuses({ id: id, status: newStatus });
  };

  const handleSave = (id) => {
    // updateOrder(id, );
    console.log(editedStatuses)
    updateOrder(id, editedStatuses.status);
    setEditedStatuses({});

    fetchAllOrders();
  };
  // const getColor = (status) => {
  //   switch (status?.toUpperCase()) {
  //     case 'PAID': return 'text-green-800 bg-green-200 '
  //     case 'DELIVERED':
  //     case 'REFUNDED':
  //     case 'COMPLETED':
  //     case 'OUT_OF_DELIVERY':
  //       return 'text-green-600  bg-green-200';
  //     case 'CONFIRMED':
  //       return 'text-blue-800 rounded text-sm bg-blue-200';
  //     case 'SHIPPED':
  //       return 'text-yellow-600 font-bold bg-yellow-200';
  //     case 'CANCELLED':
  //     case 'CANCELED':
  //     case 'REFUND_INITIATED':
  //     case 'REFUND_ISSUED':
  //     case 'FAILED':
  //       return 'text-red-600 font-bold bg-red-200';
  //     case 'PENDING':
  //       return 'text-red-600 font-bold bg-red-200';
  //     case 'RETURNED':
  //       return 'text-red-600 font-bold bg-red-200';
  //     default:
  //       return 'text-gray-600 font-bold bg-gray-200';
  //   }
  // };

  if (loading ) {
    return <Loading />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🧾 Manage Orders</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Order ID..."
          className="border border-gray-300 rounded-md p-2 w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <select 
        value={sortOrder} 
        onChange={(e) => setSortOrder(e.target.value)} 
        
        className="border border-gray-300 rounded-md p-2 w-full md:w-1/4">
  <option value="">Sort by Date</option>
  <option value="asc">Oldest First</option>
  <option value="desc">Newest First</option>
</select> */}

        <select
          className="border border-gray-300 rounded-md p-2 w-full md:w-1/4"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statusOptionsForFilter.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm text-left text-gray-700 border">
          <thead className="bg-gray-100">
            <tr className='w-auto'>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">User ID</th>
              <th className="p-3 border">Product</th>
              <th className="p-3 border">Qty</th>
              <th className="p-3 border">Total Amount</th>
              <th className="p-3 border">Payment Id</th>
              <th className="p-3 border">Payment Method</th>
              <th className="p-3 border">Payment Status</th>
              <th className="p-3 border">Order Status</th>

              <th className="p-3 border">Order At</th>
              
              <th className="p-3 border">Update Order Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{order.id}</td>
                  <td className="p-3 border">{order.userId}</td>
                  <td className="p-3 border">{order.productName}</td>
                  <td className="p-3 border">{order.quantity}</td>
                  <td className="p-3 border">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="p-3 border">{order.paymentId || 'N/A'}</td>
                  <td className="p-3 border">{order.paymentMethod}</td>
                  <td className="p-3 border">
                  <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm 
                      ${getColor(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                    {/* {order.paymentStatus} */}
                    </td>
                  <td className="p-3 border">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm 
                      ${getColor(order.status)}`}
                    >
                      {order.status}
                    </span>

                   
                  </td>
                  <td className="p-3 border">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  
                  <td className="p-3 border">
                  <select
                      value={editedStatuses.id == order.id ? editedStatuses.status : order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}
                        >
                          {status == 'COMPLETED' ? "COMPLETED (FOR PAYMENT STATUS)" : status}

                        </option>
                      ))}
                    </select>
                  </td>
                 
                  <td className="p-3 border">
                    <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(order.id)}
                      className={`${
                        loading || editedStatuses.id !== order.id
                          ? 'disable-button'
                          : 'primary-button'
                      } `}
                      disabled={loading || editedStatuses.id !== order.id}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    { order?.status == 'REFUND_ISSUED' &&
                    <button
                      onClick={() => handleRefund(order.id)}
                      className="primary-button"
                    >
                      Refund
                    </button>
                    }
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="8">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageOrders;
