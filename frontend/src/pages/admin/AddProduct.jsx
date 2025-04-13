import React, { useState, useContext } from 'react';
import { CategoryContext } from '../../state-management/CategoryContext';
import { ProductContext } from '../../state-management/ProductContext';

function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    colors: '',
    sizes: '',
    imageFile: null,
    category: '',
  });

  // const categories = ['Electronics', 'Clothing', 'Books', 'Home Appliances'];

  const {categories} = useContext(CategoryContext);
  const {addProduct, loading, error, message} = useContext(ProductContext);

  const handleChange = (e) => {

    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // set in formData
    const product = new FormData();
    product.append('name', formData.name);
    product.append('description', formData.description);
    product.append('price', formData.price);
    product.append('stock', formData.stock);
    product.append('brand', formData.brand);
    product.append('colors', formData.colors);
    product.append('sizes', formData.sizes);
    product.append('imageFile', formData.imageFile);
    product.append('category', formData.category);

    
    // Submission logic here
    addProduct(product);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      brand: '',
      colors: '',
      sizes: '',
      imageFile: null,
      category: '',
    });
  };

  const isFormValid = !Object.values(formData).some((value) => value === '' || value === null);

  return (
    <div className="mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows="3"
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              min="0"
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              min="0"
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Brand and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              name="brand"
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sizes and Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sizes or Specifications (comma separated)</label>
            <input
              type="text"
              name="sizes"
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.sizes}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Colors (comma separated)</label>
            <input
              type="text"
              name="colors"
              className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.colors}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="form-input cursor-pointer mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={handleChange}
            required
          />
        </div>

        <div className="pt-4 flex justify-end ">
          <button
            type="submit"
            className={`primary-button ${!isFormValid || loading ? 'disable-button' : ''}`}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
