import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import image1 from "../../assets/2.jpg";
import { FaStar } from "react-icons/fa";
import ProductContext from "../../state-management/ProductContext";

const ManageProducts = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const navigate = useNavigate();

  // use context
  const { products, fetchProducts } = useContext(ProductContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  // for testing
  // const [products] = useState([
  //   {
  //     id: 1,
  //     name: "Product 1",
  //     description: "Product 1 description",
  //     price: 100,
  //     rating: 4.5,
  //     image: image1,
  //     category: "Men",
  //     brand: "Brand 1",
  //   },
  //   {
  //     id: 2,
  //     name: "Product 2",
  //     description: "Product 2 description",
  //     price: 200,
  //     rating: 4.5,
  //     image: image1,
  //     category: "Home-Kitchen",
  //     brand: "Brand 2",
  //   },
  //   {
  //     id: 3,
  //     name: "Product 3",
  //     description: "Product 3 description",
  //     price: 300,
  //     rating: 4.5,
  //     image: image1,
  //     category: "Women",
  //     brand: "Brand 1",
  //   },
  // ]);

  const filteredProducts = products.filter(
    (product) =>
      (categoryFilter === "All" || product.category === categoryFilter) &&
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()))
  );

  const uniqueCategories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, brand, category..."
            className="form-input w-full p-2 border rounded-md shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="primary-button px-4 py-2 rounded-md shadow-md"
          onClick={() => navigate("/admin/add-product")}
        >
          + Add Product
        </button>

        {/* Category Filter */}
      <div className="">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded-md"
        >
          {uniqueCategories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>
      </div>

    

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts?.length === 0 && <p className="text-gray-500">No products found</p>}
        {filteredProducts?.map((product) => (
          <div
            key={product.id}
            className=" rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={`data:image/png;base64,${product.imageData}`}
              alt={product.name}
              className="w-full h-56 object-contain rounded"
            />
            <h2 className="mt-3 font-semibold">{product.name}</h2>
           
            {/* Rating and reviews */}
            <div className="flex justify-between items-center text-sm mt-1">
                   <span>
                       <span className="text-md font-semibold text-gray-900">₹</span>
                       {product.price}
                   </span>
                   <span className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                       {product.rating}
                       <FaStar className="text-xs" />
                   </span>
               </div>
            <button
              className="primary-button mt-3 px-4 py-1 bg-blue-600 text-white rounded-md"
              onClick={() => navigate(`/admin/update-product/${product.id}`)}
            >
              Edit
            </button>
            {/* view product */}
            <button
              className="primary-button mt-3 ml-2 px-4 py-1 bg-slate-600 text-white rounded-md"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
