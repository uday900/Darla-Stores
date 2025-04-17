import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../state-management/UserContext';

// Dummy data simulating the UserDto
const dummyUsers = [
  {
    id: 1,
    name: 'Vishnu Vardhan',
    email: 'vishnu@example.com',
    city: 'Kandukuru',
    state: 'Andhra Pradesh',
    country: 'India',
    district: 'Prakasam',
    street: 'MG Road',
    phoneNumber: '9876543210',
    createdAt: '2025-04-01T10:00:00',
  },
  {
    id: 2,
    name: 'Meghana Sharma',
    email: 'meghana@example.com',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    district: 'Ranga Reddy',
    street: 'Banjara Hills',
    phoneNumber: '9123456780',
    createdAt: '2025-03-28T15:45:00',
  },
];

function ManageUsers() {
  const [search, setSearch] = useState('');

  // state values
  const { users, loading, error, message, fetchAllUsers } = useContext(UserContext);

  useEffect(() => {
    fetchAllUsers();
  }, []);
  const filteredUsers = users.filter(
    (user) =>
      user?.name.toLowerCase().includes(search.toLowerCase()) ||
      user?.email.toLowerCase().includes(search.toLowerCase()) ||
      user?.phoneNumber.includes(search)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                <th className="p-3 border">Id</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">City</th>
              <th className="p-3 border">District</th>
              <th className="p-3 border">State</th>
              <th className="p-3 border">Country</th>
              <th className="p-3 border">Street</th>
              <th className="p-3 border">Created At</th>
              {/* <th className="p-3 border">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr key={user.id} className="text-sm border-t">
                <td className="p-3 border">{user?.id}</td>
                <td className="p-3 border">{user?.name}</td>
                <td className="p-3 border">{user?.email}</td>
                <td className="p-3 border">{user?.phoneNumber || 'N/A'}</td>
                <td className="p-3 border">{user?.city || 'N/A'}</td>
                <td className="p-3 border">{user?.district || 'N/A'}</td>
                <td className="p-3 border">{user?.state || 'N/A'}</td>
                <td className="p-3 border">{user?.country || 'N/A'}</td>
                <td className="p-3 border">{user?.street || 'N/A'}</td>
                <td className="p-3 border">{new Date(user?.createdAt).toLocaleString()}</td>
                {/* <td className="p-3 border">
                    <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        // handle delete action
                        handleDeleteUser(user.id);
                      }
                    }}                    
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none cursor-pointer">
                      Delete
                    </button>
                  </td>   */}
              </tr>
            ))}
            {filteredUsers?.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsers;
