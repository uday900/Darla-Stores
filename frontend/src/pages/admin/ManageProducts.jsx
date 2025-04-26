import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import image1 from "../../assets/2.jpg";
import { FaRegEdit, FaStar } from "react-icons/fa";
import ProductContext from "../../state-management/ProductContext";
import api from "../../api-services/apiConfig";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Pagination from "../../components/Pagination";



const ManageProducts = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isOpenBulkUploadModal, setIsOpenBulkUploadModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // use context
  const { products, fetchProducts, loading, deleteProduct,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    itemsPerPage,
    setItemsPerPage

  } = useContext(ProductContext);

  useEffect(() => {
    // size and page
    fetchProducts(itemsPerPage, currentPage);
  }, []);

  useEffect(() => {

    fetchProducts(itemsPerPage, currentPage);
  }, [currentPage, itemsPerPage]);


  const filteredProducts = products.filter(
    (product) =>
      (categoryFilter === "All" || product.category === categoryFilter) &&
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()))
  );

  const uniqueCategories = ["All", ...new Set(products.map((p) => p.category))];

  const handleUploadCsvFile = async () => {

    if (!csvFile || csvFile === null) {
      toast.error('Please select a CSV file');
      return;
    }
    const formData = new FormData();
    formData.append("file", csvFile);

    // console.log(csvFile);

    setIsLoading(true);
    try {
      const res = await api.post("/products/upload-csv", formData);
      // console.log(res); 
      if (res.status === 200) {
        toast.success(res.data.message);
        fetchProducts();
      }
      else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to upload CSV file');
      if (error.response?.data?.errors) {
        const errorsFromServer = error.response.data.errors;
        // console.log(errorsFromServer);
        Object.keys(errorsFromServer).forEach((key) => {
          toast.error(errorsFromServer[key]);
        })
      }
    } finally {
      setIsLoading(false);
      setIsOpenBulkUploadModal(false);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  }
  if (loading || isLoading) return <Loading />

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

        <button
          className="primary-button px-4 py-2 rounded-md shadow-md"
          onClick={() => setIsOpenBulkUploadModal(true)}
        >
          + Add Bulk
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
        {/* Pagination selection for choosing how many products to show */}
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-sm font-semibold">Products per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="border border-slate-400 rounded-md text-sm md:text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={10}>10</option>
            <option value={30}>30</option>
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
            <div className="flex justify-between items-center text-sm mt-1 mb-2">
              <span>
                <span className="text-md font-semibold text-gray-900">₹</span>
                {product.price}
              </span>
              <span className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                {product.rating}
                <FaStar className="text-xs" />
              </span>
            </div>
            {/* view product */}
            <button
              // className="primary-button mt-3 ml-2 px-4 py-1 bg-slate-600 text-white rounded-md"
              className="p-2 border border-slate-500 hover:bg-slate-200 rounded-full font-bold text-center cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              View Product

            </button>
            <button
              // className="primary-button mt-3 px-4 py-1 bg-blue-600 text-white rounded-md"
              className="p-2 border border-slate-500 hover:bg-slate-200  rounded-full font-bold text-center cursor-pointer ml-2"
              onClick={() => navigate(`/admin/update-product/${product.id}`)}
            >
              <FaRegEdit />
            </button>

            <button
              // className="primary-button mt-3 ml-2 px-4 py-1 bg-red-600 text-white rounded-md"
              className="p-2 border border-slate-500 hover:bg-slate-200 rounded-full font-bold text-center cursor-pointer ml-2 "
              onClick={() => handleDelete(product.id)}
            >
              <MdDelete />
            </button>
          </div>
        ))}
      </div>

      {/* Display pagination on the right side bottom */}
      <div className="flex justify-end mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          // setTotalPages={setTotalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>




      {/* Modal for bulk upload */}
      {isOpenBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white p-6 w-full max-w-md rounded-2xl shadow-xl">

            {/* Close Icon */}
            <button
              onClick={() => setIsOpenBulkUploadModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold">Upload File in CSV Format</h2>
            <p className="text-gray-600 mb-4">Select a CSV file to upload: with name, description, brand, category, price, image, sizes, colors, stock</p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="w-full mb-4 border rounded px-3 py-2 cursor-pointer"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsOpenBulkUploadModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadCsvFile()} // ✅ call the function, not return it
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
