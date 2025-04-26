import { createContext, useState, useEffect } from "react";
import api from "../api-services/apiConfig";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [message, setMessage] = useState(null);
  const [reviews, setReviews] = useState([])

  const [searchQuery, setSearchQuery] = useState('');
  const [carousels, setCarousels] = useState([]);

  // === Pagination ===
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  

  
  async function fetchProductReviews(productId) {
    setLoading(true);
    console.log("Fetching reviews...");
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      
      if (response.status == 200) {
        setReviews(response.data);
        // console.log(response.data)

      } else {
        // console.log(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching reviews");
      console.log("Error fetching reviews:", error);

    } finally {
      setLoading(false);  // Stop loading after response or error
    }
  }

  const addReview = async (review) => {
    setLoading(true);
    console.log("Adding review...");
    try {
      // const response = await axios.post(`${BASE_URL}/category/add`, category);
      const response = await api.post(`/reviews`, review);
      if (response != null && response.status == 200) {
        //  setMessage(response.data.message);
        toast.success(response.data);
        fetchProductReviews(review.productId);
        fetchProductById(review.productId);
      } else {
        // setError(response.data.message);
        toast.error(response.data.message);
        // console.log("Error adding category");
      }
    } catch (error) {
      toast.error("Error adding reviws");
      console.log("Error adding category:", error);
    } finally {
      setLoading(false);  // Stop loading after response or error
    }
  };

  async function deleteReview(reviewId, userId) {

    // console.log(reviewId, userId);
    setLoading(true);

    try {
      const response = await api.delete(`/reviews/${reviewId}/user/${userId}`);
      // console.log(response)
      // if(response.status == 4)
     
      if (response != null && response.status == 200) {
        // toast.success(response.data);
        // fetchProductReviews(productId);
        // window.location.reload();
        // console.log("first")
        setMessage(response.data);
      } else {
        setError(response.data.message);
        // toast.error("Error deleting review");
      }
    } catch (error) {
      // toast.error("Error deleting review");
      setError(error.response.data.message || "Failed to delete review");
      console.log("Error deleting review:", error);
    } finally {
      setLoading(false);  // Stop loading after response or error
    }

  }

  // === PRODUCTS METRICS ===
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products/metrics");
      setMetrics(response.data.metrics);
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.href = "/login";
      }
      
      setError(error);
      toast.error(error.response?.data?.message || "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (size, page) => {
    setLoading(true);
    try {
      const response = await api.get(`/products?size=${size}&page=${page-1}`);
      setProducts(response.data.content);
      setCurrentPage(page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      // return response.data.product;
      setProduct(response.data.product);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (category, size , page) => {
    setLoading(true);
    console.log(category, size, page-1, "fetchProductsByCategory");
    // setProducts([])
    try {
      // console.log(category, "sfadf")
      const response = await api.get(`/products/category?category=${encodeURIComponent(category)}&size=${size}&page=${page-1}`);
      // console.log("calling fetchProductsByCategory ", category, response.data.products);
      console.log(response);
      setProducts(response.data.productsPage.content);
      setCurrentPage(page);
      setTotalPages(response.data.productsPage.totalPages);
  
      // return response.data.products;
    } catch (error) {
      setProducts([])
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };
  const fetchShowcaseProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/showcase`);
      // console.log("calling fetchProductsByCategory", response.data.products);
      // setProducts(response.data.products);
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsBySearch = async (search) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/search?query=${search}`);
      setProducts(response.data.products);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product) => {
    setLoading(true);
    try {
      const response = await api.post("/products", product);
      toast.success(response.data.message);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
      if (error.response?.data?.errors) {
              const errorsFromServer = error.response.data.errors;
              // console.log(errorsFromServer);
              Object.keys(errorsFromServer).forEach((key) => {
                toast.error(errorsFromServer[key]);
              })
            }
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, product) => {
    setLoading(true);
    try {
      const response = await api.put(`/products/${id}`, product);
      toast.success(response.data.message);
      fetchProducts();
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
      if (error.response?.data?.errors) {
              const errorsFromServer = error.response.data.errors;
              // console.log(errorsFromServer);
              Object.keys(errorsFromServer).forEach((key) => {
                toast.error(errorsFromServer[key]);
              })
            }
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) =>{
    setLoading(true);
    try {
      const response = await api.delete(`/products/${id}`);
      toast.success(response.data.message);
      fetchProducts();
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
      if (error.response?.data?.errors) {
              const errorsFromServer = error.response.data.errors;
              // console.log(errorsFromServer);
              Object.keys(errorsFromServer).forEach((key) => {
                toast.error(errorsFromServer[key]);
              })
            }
    } finally {
      setLoading(false);
    }
  }

  // === CAROUSEL APIs ===
  const fetchCarousels = async () => {
    try {
      const response = await api.get("/products/carousels");
      setCarousels(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch carousels");
    }
  };

  const uploadCarouselImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await api.post("/products/carousels/add", formData);
      toast.success(response.data.message);
      fetchCarousels(); // refresh carousel list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const deleteCarouselImage = async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/products/carousels/${id}`);
      toast.success(response.data.message);
      fetchCarousels(); // refresh carousel list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete image");
    } finally {
      setLoading(false);
    } 
  };

  const clearLogs = () => {
    setError(null);
    setMessage(null);
  }

  return (
    <ProductContext.Provider
      value={{
        
        loading,
        error,
        metrics,
        message,
        clearLogs,
        fetchMetrics,

        searchQuery, setSearchQuery,

        // Carousel State and Functions
        carousels,
        setCarousels,
        fetchCarousels,
        uploadCarouselImage,
        deleteCarouselImage,

        // Products State and Functions
        products,
        product,
        setProducts,
        fetchProducts,
        fetchProductsByCategory,
        fetchProductsBySearch,
        fetchShowcaseProducts,
        fetchProductById,
        addProduct,
        updateProduct,
        deleteProduct,

        // reviews
        reviews,
        fetchProductReviews,
        addReview,
        deleteReview,

        // pagination
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        itemsPerPage, setItemsPerPage,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
