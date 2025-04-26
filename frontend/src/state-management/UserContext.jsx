import { createContext, useState } from "react";
import api from "../api-services/apiConfig";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // === PLACE ORDER ===
  const placeOrder = async (userId, productId, quantity) => {
    setLoading(true);
    try {
      const response = await api.post("/user/order/place", null, {
        params: { userId, productId, quantity }
      });
      toast.success(response.data.message);
      setMessage(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // === UPDATE ORDER STATUS ===
  const updateOrder = async (orderId, status) => {
    setLoading(true);
    try {
      const response = await api.put(`/user/order/update?orderId=${orderId}&status=${status}`);
      toast.success(response.data.message);
      setMessage(response.data.message);

      const user = JSON.parse(localStorage.getItem("user"));
      if (user.role === "ADMIN") {
        fetchAllOrders();
      } else {
        fetchOrdersByUser(user.id);
      }
      // fetchAllOrders();
      // fetchOrdersByUser(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  // === FETCH ALL ORDERS ===
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/orders/all");
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // === FETCH ORDERS BY USER ===
  const fetchOrdersByUser = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/user/orders?userId=${userId}`);
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // === CHECKOUT ===
  const checkOut = async (userId) => {
    setLoading(true);
    try {
      const response = await api.post(`/user/order/check-out?userId=${userId}`);
      toast.success(response.data.message);
      setMessage(response.data.message);
      // fetchOrdersByUser(userId);
      fetchUserCart(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // === ADD TO CART ===
  const addToCart = async (userId, productId) => {
    setLoading(true);
    try {
      const response = await api.post(`/user/cart/add?userId=${userId}&productId=${productId}`);
      toast.success(response.data);
      fetchUserCart(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  // === REMOVE FROM CART ===
  const removeFromCart = async (userId, cartId) => {
    setLoading(true);
    try {
      const response = await api.delete("/user/cart/remove", {
        params: { userId, cartId }
      });
      toast.success(response.data);
      fetchUserCart(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove from cart");
    } finally {
      setLoading(false);
    }
  };

  // === INCREMENT QUANTITY ===
  const incrementQuantity = async (userId, cartId) => {
    setLoading(true);
    try {
      const response = await api.put("/user/cart/increment", null, {
        params: { userId, cartId }
      });
      toast.success(response.data);
      fetchUserCart(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to increment quantity");
    } finally {
      setLoading(false);
    }
  };

  // === DECREMENT QUANTITY ===
  const decrementQuantity = async (userId, cartId) => {
    setLoading(true);
    try {
      const response = await api.put("/user/cart/decrement", null, {
        params: { userId, cartId }
      });
      toast.success(response.data);
      fetchUserCart(userId);
      // window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decrement quantity");
    } finally {
      setLoading(false);
    }
  };

  // === FETCH USER CART ===
  const fetchUserCart = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/user/cart?userId=${userId}`);
      setCart(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  // === UPDATE USER PROFILE ===
  const updateProfile = async (userId, userData) => {
    setLoading(true);
    try {
      const response = await api.put(`/user/update/profile?userId=${userId}`, userData);
      // toast.success(response.data);
      setMessage(response.data);
      userInfo(userId);
    } catch (error) {
      // toast.error(error.response?.data?.message || "Failed to update profile");
      setError(error.response?.data?.message || "Failed to update profile");
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

  const userInfo = async (userId) => {
    try {
      const response = await api.get(`/user/info?userId=${userId}`);
      localStorage.setItem("user", JSON.stringify(response.data));
      window.location.reload();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user info");
    }
  };

  // === FETCH ALL USERS (Admin) ===
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/all");
      setUsers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (userId, currentPassword, newPassword) => {
    setLoading(true);
    try {
      const response = await api.post(`/user/update-password?userId=${userId}`, null, {
        params: { oldPassword:currentPassword, newPassword }
      });

      setMessage(response.data.message);
      // toast.success(response.data.message);
      // navigate('/user/profile');
    } catch (error) {
      // toast.error(error.response?.data?.message || "Failed to update password");
      setError(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };  

  const refund = async (orderId) => {
    setLoading(true);
    try {
      const response = await api.post(`/user/order/${orderId}/refund`);
      
      console.log(response, "refund");
      toast.success(response.data?.message);
      fetchAllOrders();
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to refund");
    } finally {
      setLoading(false);
    }
  }

  const clearLogs = () => {
    setError('');
    setMessage('');
  }

  return (
    <UserContext.Provider
      value={{
        clearLogs,
        orders,
        cart,
        users,
        loading,
        message,
        error,
        placeOrder,
        updateOrder,
        fetchAllOrders,
        fetchOrdersByUser,
        checkOut,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        fetchUserCart,
        updateProfile,
        fetchAllUsers,
        userInfo,
        updatePassword,

        refund
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
