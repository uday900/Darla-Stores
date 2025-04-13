import React, { useContext, useEffect, useState } from 'react';
import CategoryContext from '../../state-management/CategoryContext';

// Dummy category data
const dummyCategories = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Devices, gadgets, and accessories',
  },
  {
    id: 2,
    name: 'Fashion',
    description: 'Clothing and lifestyle accessories',
  },
];

function ManageCategories() {
  // const [categories, setCategories] = useState(dummyCategories);
  const [search, setSearch] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  // use context
  const { categories, fetchCategories,
    loading,
    error,
    message,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useContext(CategoryContext);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.description) return;

    const newEntry = {
      id: Date.now(),
      ...newCategory,
    };
    addCategory(newEntry);
    setNewCategory({ name: '', description: '' });
  };

  const handleDelete = (id) => {
    deleteCategory(id);
  };

  const handleUpdate = () => {  
    updateCategory(editingCategory);
    setEditingCategory(null);
    // setNewCategory({ name: '', description: '' });
  };

  const isFormValid = !Object.values(newCategory).some((value) => value === '' || value === null);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Categories</h2>

      {/* Form to Add Category */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          className="w-full p-2 border rounded"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Category Description"
          className="w-full p-2 border rounded"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          required
        />
        <button
          type="submit"
          className={`${loading || !isFormValid ? 'disable-button' : 'primary-button'}`}
          disabled={loading || !isFormValid}
        >
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or description..."
          className="w-full border border-gray-300 rounded-md p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      
      {/* Category Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
  {filteredCategories.length > 0 ? (
    filteredCategories.map((cat) => (
      <div
        key={cat.id}
        className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 relative"
      >
        {/* If Editing */}
        {editingCategory?.id === cat.id ? (
          <>
            <input
              type="text"
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
              placeholder="Category Name"
            />
            <textarea
              value={editingCategory.description}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring"
              placeholder="Description"
              rows={3}
            />
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{cat.name}</h3>
            <p className="text-gray-600 text-sm">{cat.description}</p>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center mt-4 text-sm">
          {editingCategory?.id === cat.id ? (
            <button
              onClick={handleUpdate}
              className={`${loading  ? 'disable-button' : 'primary-button'}`}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              onClick={() => setEditingCategory(cat)}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => handleDelete(cat.id)}
            className={`${loading ? 'disable-button' : 'text-red-600 hover:underline cursor-pointer'}`}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500 col-span-full">No categories found.</p>
  )}
</div>

    </div>
  );
}

export default ManageCategories;
