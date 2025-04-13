import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ProductContext from '../../state-management/ProductContext';
import CategoryContext from '../../state-management/CategoryContext';

function UpdateProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    colors: '',
    sizes: '',
    imageFile: null,
    choosenImage: '',
    category: '',
  });

  const {productId} = useParams();
  const { product, loading, error, message, updateProduct,
    fetchProductById
   } = useContext(ProductContext);
  const {categories} = useContext(CategoryContext);
  // const categories = ['Electronics', 'Clothing', 'Books', 'Home Appliances'];

  useEffect(() => {
    fetchProductById(productId);
  }, [productId]);

  useEffect(() => {
    // Populate the form with existing data
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        brand: product.brand || '',
        colors: product.colors || '',
        sizes: product.sizes || '',
        imageFile: null, // You might show the current image separately
        choosenImage: product.imageName || '',
        category: product.category || '',
      });
    }

    console.log(product, product?.category)
  }, [product]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedProduct = new FormData();
    updatedProduct.append('name', formData.name);
    updatedProduct.append('description', formData.description);
    updatedProduct.append('price', formData.price);
    updatedProduct.append('stock', formData.stock);
    updatedProduct.append('brand', formData.brand);
    updatedProduct.append('colors', formData.colors);
    updatedProduct.append('sizes', formData.sizes);
    updatedProduct.append('imageFile', formData.imageFile);
    updatedProduct.append('category', formData.category);

    updateProduct(productId, updatedProduct);
    console.log("Updated Data Submitted");
  };

  const isFormValid = formData.name && formData.description && formData.price && formData.stock && formData.brand && formData.category;

  return (
    <div className="mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Update Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            className="form-input mt-1 block w-full"
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
            className="form-input mt-1 block w-full"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              min="0"
              className="form-input mt-1 block w-full"
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
              className="form-input mt-1 block w-full"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              name="brand"
              className="form-input mt-1 block w-full"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              className="form-input mt-1 block w-full bg-white"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (  
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sizes or Specifications</label>
            <input
              type="text"
              name="sizes"
              className="form-input mt-1 block w-full"
              value={formData.sizes}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Colors</label>
            <input
              type="text"
              name="colors"
              className="form-input mt-1 block w-full"
              value={formData.colors}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
        <p className='mb-2'>Current Image: {formData.choosenImage}</p>
          <label className="block text-sm font-medium text-gray-700">New Image</label>
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="form-input mt-1 block w-full"
            onChange={handleChange}
          />
          
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className={`primary-button ${!isFormValid || loading ? 'disable-button' : ''}`}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateProduct;
