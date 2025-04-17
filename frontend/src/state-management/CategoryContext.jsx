import { createContext, useState, useEffect } from "react";
import api from "../api-services/apiConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  // === FETCH ALL CATEGORIES ===
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/category");
      setCategories(response.data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch categories");
      setError(error);
      navigate("/error");
    
    } finally {
      setLoading(false);
    }
  };

  // === FETCH CATEGORY BY ID ===
  const fetchCategoryById = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/category/${id}`);
      setCategory(response.data.category);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch category");
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // === ADD SINGLE CATEGORY ===
  const addCategory = async (newCategory) => {
    setLoading(true);
    try {
      const response = await api.post("/category", newCategory);
      toast.success(response.data.message);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add category");
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

  // === ADD MULTIPLE CATEGORIES ===
  const addCategories = async (categoriesList) => {
    setLoading(true);
    try {
      const response = await api.post("/category/add-categories", categoriesList);
      toast.success(response.data.message);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add categories");
    } finally {
      setLoading(false);
    }
  };

  // === UPDATE CATEGORY ===
  const updateCategory = async (updatedData) => {
    setLoading(true);
    try {
      const response = await api.put(`/category/${updatedData.id}`, {id: updatedData.id, name: updatedData.name, description: updatedData.description});
      toast.success(response.data.message);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  // === DELETE CATEGORY ===
  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/category/${id}`);
      toast.success(response.data.message);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount (optional)
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        category,
        loading,
        error,
        message,

        fetchCategories,
        fetchCategoryById,
        addCategory,
        addCategories,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;
