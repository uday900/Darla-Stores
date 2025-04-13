import React, { useContext, useEffect, useState } from 'react';
import image1 from '../assets/2.jpg'
import { toast } from 'react-toastify';
import { data, useNavigate, useParams } from 'react-router-dom';
import ProductContext from '../state-management/ProductContext';
import UserContext from '../state-management/UserContext';
import api from '../api-services/apiConfig';
import Loading from '../components/Loading';

const CheckoutPage = () => {

  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('Madhapur, Hyderabad, Telangana, India');
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash on Delivery');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);




  const { productId } = useParams();
  const { fetchProductById, loading: productLoading,
    product,
  } = useContext(ProductContext);
  const { placeOrder, loading: orderLoading } = useContext(UserContext);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  useEffect(() => {
    if (productId) {
      fetchProductById(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      setTotalPrice(product.price * quantity);
    }
  }, [product, quantity]);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const verifyPamentDetails = async (details) => {
    setPaymentLoading(true);
    console.log("payment details ", details)
    try {
      const res = await api.post('/user/order/verify', details,
        {
          headers: {
            'Content-Type': 'application/json'
          }
      });

      toast.success(res.data.message);
      // navigate to user profile after 1 sec
      setTimeout(() => {
        navigate('/user/orders');
      }, 1000);

      // if (res.status === 200) {
      //   toast.success(res.data.message);
      //   // navigate to user profile
      //   navigate('/user/profile');
      // }
      // else {
      //   toast.error(res.data.message);
      // }

    } catch (error) {
      console.log("error while verifying data", error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const sendFailureDetailsToBackend = async (razorpay_order_id) => {
    setPaymentLoading(true);
    try {
      const res = await api.post(`/user/order/payment-failure?razorpay_order_id=${razorpay_order_id}`);
      toast.error(res.data.message);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed or verification failed');
      console.error('Error sending failure details to backend:', error);
    } finally {
      setPaymentLoading(false);
    }
  };


  const openRazorpay = (order) => {
    const options = {
      key: "rzp_test_Oshunm39FDxDGQ",
      amount: order.amount,
      currency: order.currency,
      name: "Darla Stores",
      description: "Payment for order #123",
      order_id: order.id,
      handler: function (response) {
        // ✅ Payment Successful
        setErrorDetails(null);
        setPaymentDetails({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });

        // send payment details to backend
        verifyPamentDetails({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });

        // ✅ Send verification request to backend
        // fetch("http://localhost:8080/verify", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     razorpay_payment_id: response.razorpay_payment_id,
        //     razorpay_order_id: response.razorpay_order_id,
        //     razorpay_signature: response.razorpay_signature,
        //   }),
        // })
        //   .then((res) => res.text())
        //   .then((message) => alert("Server Response: " + message))
        //   .catch((error) => console.error("Verification Error:", error));
      },
      modal: {
        ondismiss: function () {
          // User closed the popup
          const failInfo = {
            reason: "User closed the payment popup before completing payment.",
          };
          setErrorDetails(failInfo);


          sendFailureDetailsToBackend(order.id);

          // ❌ Log failure to backend
          // fetch("http://localhost:8080/payment/failure", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify(failInfo),
          // }).catch((err) => console.error("Failure logging error:", err));
        },
      },
      theme: { color: "#F37254" },
    };

    const rzp = new window.Razorpay(options);

    // ❌ Handle Razorpay’s payment.failed event
    rzp.on("payment.failed", function (response) {
      const errorData = {
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        order_id: order.id,
      };

      console.log(errorData);

      setPaymentDetails(null);
      setErrorDetails(errorData);

      sendFailureDetailsToBackend(order.id);

      // ❌ Send to backend failure endpoint
      // fetch("http://localhost:8080/payment/failure", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(errorData),
      // }).catch((err) => console.error("Backend failure log error:", err));
    });

    rzp.open();
  };
  const createOrder = async () => {
    setPaymentLoading(true);
    try {
      //   {
      //     "userId":2,
      //     "productId":1,
      //     "quantity":2,
      //     "shippingAddress":"tetst purpose",
      //     "paymentMode":"razorpay"
      // }
      const orderRquest = {
        userId: user.id,
        productId: productId,
        quantity: quantity,
        shippingAddress: shippingAddress,
        paymentMode: paymentMode
      }
      const response = await api.post(`/user/order/create`, orderRquest);

      const orderDataFromServer = response.data?.razorpayOrder;
      console.log(orderDataFromServer, "response from server whith razorpay");
      //   "razorpayOrder": {
      //     "id": "order_QHkW8AZHhnzU7V",
      //     "currency": "INR",
      //     "amount": 9000000
      // },
      if (orderDataFromServer) {
        openRazorpay(orderDataFromServer);
      } else {
        toast.success(response.data.message);
        navigate("/user/profile");
      }
      // openRazorpay(orderDataFromServer);
      // const response = await fetch("http://localhost:8080/createOrder?amount=20&currency=INR&receipt=receipt1", {
      //   method: "POST",
      // });
      // const orderData = await response.json();
      // openRazorpay(orderData);
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setPaymentLoading(false);
    }
  };
  const handlePlaceOrder = () => {

    // checking payment mode is selected or not
    if (!paymentMode) {
      toast.error('Please select payment mode');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    // placeOrder(user.id, product.id, quantity); old code

    createOrder(); // new code
  };

  if (orderLoading || productLoading || paymentLoading) {
    return <Loading/>
  }
  return (
    <div className="container mx-auto p-6 grid md:grid-cols-2 gap-8">
      {/* LEFT SIDE - Product Details */}
      <div >
        <img src={`data:image/png;base64,${product?.imageData}`} alt={product?.name} className="w-full max-w-sm md:w-56 mb-4 rounded shadow" />

        <h2 className="text-3xl font-bold">{product?.name}</h2>
        <p className="text-gray-500 mb-1">by {product?.brand}</p>
        {/* description */}
        <p className="text-gray-500 mb-1">{product?.description}</p>
        {/* rating */}
        <p className="text-yellow-500 text-lg">
          ★ ★ ★ ★ ☆ <span className="text-gray-500 text-base">({product?.rating})</span>
        </p>

        <p className="text-2xl font-bold text-black mt-2">₹{product?.price}</p>

        <span
                            className={`inline-block px-3 py-1 text-sm font-medium rounded-full 
                                ${product?.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                            {product?.stock > 0 ? `${product?.stock} in stock` : 'Out of stock'}
                        </span>
        <div className="inline-block ml-2">
          <button
            className={`${quantity >= product.stock ? 'bg-slate-200 text-white text-sm py-1 px-3 rounded-lg shadow-md cursor-not-allowed' :'bg-slate-400 text-white text-sm py-1 px-3 rounded-lg shadow-md hover:bg-slate-500 cursor-pointer'}`}
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= product.stock}
          >
            +
          </button>
          <span className="mx-2">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity - 1)}
          
            className={`${quantity == 1 ?
              'bg-slate-200 text-white text-sm py-1 px-3 rounded-lg shadow-md cursor-not-allowed'
              : 'bg-slate-400 text-white text-sm py-1 px-3 rounded-lg shadow-md hover:bg-slate-500 cursor-pointer'}`}
            disabled={quantity == 1}
          >
            -
          </button>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-1">{product?.sizes?.lenght > 0 && 'Sizes Available'}</p>
          <div className="flex flex-wrap gap-2">
            
            {product?.sizes?.split(',').map((size) => size.trim()).filter(s => s).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-1 border rounded cursor-pointer ${selectedSize === size
                  ? 'border-black font-semibold'
                  : 'border-gray-300 text-gray-700'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-1">Colour Available</p>
          <div className="flex gap-3">
            {product?.colors.split(',').map((size) => size.trim()).filter(s => s).map((color) => (
              <div
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-black' : 'border-gray-300'
                  }`}
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>
        </div>
{/* 
        <div className="mt-4">
          <label className="font-medium block mb-1">Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 border border-gray-300 rounded px-2 py-1"
          />
        </div> */}
       
      </div>

      {/* RIGHT SIDE - Summary */}
      <div className="border border-gray-200 rounded-lg p-6 shadow-md sticky top-28 ">
        <h3 className="text-2xl font-bold mb-4">Order Summary</h3>

        <div className="mb-4">
          <p className="text-gray-600">Product: <span className="font-medium">{product?.name}</span></p>
          <p className="text-gray-600">Price per item: ₹{product?.price}</p>
          <p className="text-gray-600">Quantity: {quantity}</p>
          <p className="text-gray-800 font-semibold text-xl mt-2">
            Total Price: ₹{totalPrice}
          </p>
        </div>

        <div className="mb-4">
          <label className="font-medium block mb-1">Shipping Address (Edit if you want):</label>
          {/* {shippingAddress}  */}
          <textarea name="shippingAddress" id=""
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 form-input"

          ></textarea>
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-1">Payment Mode:</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="Cash on Delivery"
                className='cursor-pointer'
                checked={paymentMode === 'Cash on Delivery'}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMode === 'razorpay'}
                className='cursor-pointer'
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              Other
            </label>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          className={`${orderLoading ? 'disable-button' : 'primary-button'} w-full`}
          disabled={orderLoading}
        >
          {orderLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
