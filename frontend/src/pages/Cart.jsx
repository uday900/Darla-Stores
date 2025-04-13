import React, { useContext, useEffect, useState } from 'react';
import emptyCartImage from '../assets/empty-cart.webp'
import image from '../assets/2.jpg'

import { toast } from 'react-toastify';
import UserContext from '../state-management/UserContext';
import Loading from '../components/Loading';
import { CiCircleMinus } from 'react-icons/ci';
import api from '../api-services/apiConfig';
function Cart() {
const [paymentMode, setPaymentMode] = useState('Cash on Delivery');
const [paymentLoading, setPaymentLoading] = useState(false);
const [paymentDetails, setPaymentDetails] = useState(null);
const [errorDetails, setErrorDetails] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const [grandTotal, setGrandTotal] = React.useState(0);
  // console.log(user)
  const [shippingAddress, setShippingAddress] = useState(
    user?.street + ', ' 
    + user?.city + ', ' 
    + user?.district || '' + ', '
    + user?.state + ', ' 
    + user?.zipCode || '' 
    + ', ' + user?.country || ''
  );



  const { fetchUserCart, cart, loading, message, error,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    checkOut,
   } = useContext(UserContext);

   useEffect(() => {
    // console.log(user)  
    fetchUserCart(user.id);
    // console.log(user)
    console.log(cart, "cart");


   }, []);

   useEffect(() => {
    let total = 0;
    cart?.forEach((item) => {
      total += item.price * item.qunaitity;
    });
    setGrandTotal(total);
   }, [cart]);

    //  useEffect(() => {
    //    if (product) {
    //      setTotalPrice(product.price * quantity);
    //    }
    //  }, [product, quantity]);
     useEffect(() => {
       const script = document.createElement("script");
       script.src = "https://checkout.razorpay.com/v1/checkout.js";
       script.async = true;
       document.body.appendChild(script);
       return () => {
         document.body.removeChild(script);
       };
     }, []);

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
  const verifyPamentDetails = async (details) => {
    setPaymentLoading(true);
    console.log("payment details ", details)
    try {
      const res = await api.post('/user/order/verify', details,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }    
    );

      toast.success(res.data.message);
      await fetchUserCart(user.id);
      // navigate to user profile after 1 sec
      setTimeout(() => {
        navigate('/user/orders');
      }, 1000);

    } catch (error) {
      console.log("error while verifying data", error);
      toast.error(error.response?.data?.message || 'Verification failed');
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
   const checkOutWithRazorPay = async () => {
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
      userId:user.id,
      // productId:productId,
      // quantity:quantity,
      shippingAddress: shippingAddress,
      paymentMode:paymentMode
    }   
    const response = await api.post(`/user/order/checkout`, orderRquest);

    const orderDataFromServer = response.data?.razorpayOrder;
     console.log(orderDataFromServer, "response from server whith razorpay");
    //   "razorpayOrder": {
    //     "id": "order_QHkW8AZHhnzU7V",
    //     "currency": "INR",
    //     "amount": 9000000
    // },
      if (orderDataFromServer) {
        openRazorpay(orderDataFromServer);
      } else{
        toast.success(response.data.message);
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
   const handleCheckOut = () =>{
    // setting checkout;
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
      
    // checkOut(user.id);

    checkOutWithRazorPay();
    
   }

   if (loading || paymentLoading) return <Loading/>


  return (
    <div>

    <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Product Details */}
        <div className="md:col-span-2">
          {/* {console.log(cart)} */}
          {cart?.length === 0 ? (
            <div className="flex justify-center items-center">
              <div>
                <h1 className="text-3xl text-center mt-5">No items in cart</h1>
                <img src={emptyCartImage} alt="Cart empty" />
              </div>
            </div>
          ) : (
            cart?.map((cartItem, index) => (
              <div
                key={index}
                className="max-w-2xl mx-auto my-8 bg-white shadow-lg rounded-lg p-6 flex items-start mb-2"
              >
                <div className="flex space-x-10 flex-col md:flex-row justify-start items-start px-5">
                  {/* Product Image Section */}
                  <div className="w-2/6 flex relative">
                    <img
                        src={`data:image/png;base64,${cartItem.imageData}`}
                      alt={`${cartItem.productName} Image`}
                      className="w-full object-cover rounded-md"
                    />
                  </div>
                  {/* Product Details Section */}
                  <div className="flex-1 w-full">
                    <h1 className="text-xl font-bold">{cartItem.productName}</h1>
                    {/* <div className="text-sm text-gray-500 mt-2">
                      <span>By {cartItem.brand}</span>
                    </div> */}

                    <div className=" text-gray-900 mt-4">
                      Price:  <span className='text-xl font-bold'>₹{cartItem.price}</span> 
                    </div>
                    <div className="inline-block space-x-4 mt-6">
                      <button
                        className="delete-button text-sm"
                        onClick={() => removeFromCart(user.id, cartItem.id)}
                      >
                        Remove
                      </button>
                      {/* <button 
                      className="primary-button ">
                        Buy Now
                      </button> */}
                      <div className="inline-block ml-4">
                        <button
                          className="bg-slate-400 text-white text-sm py-1 px-3 rounded-lg shadow-md hover:bg-slate-500 cursor-pointer"
                          onClick={() => incrementQuantity(user.id, cartItem.id)}
                        
                        >
                          + 
                        </button>
                        <span className="mx-2">{cartItem.qunaitity}</span>
                        <button
                        onClick={() => decrementQuantity(user.id, cartItem.id)}
                          className={`${cartItem.qunaitity == 1 ? 
                            'bg-slate-400 text-white text-sm py-1 px-3 rounded-lg shadow-md cursor-not-allowed' 
                            : 'bg-slate-400 text-white text-sm py-1 px-3 rounded-lg shadow-md hover:bg-slate-500 cursor-pointer'}`}  
                          disabled={cartItem.qunaitity == 1}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Summary */}
        <div className="bg-white p-6 sticky top-16 h-full rounded-lg border border-slate-200">
          <h2 className="text-2xl mb-4">Total Products</h2>
          <p className="text-lg">
            Total Items: <span className="font-bold">{cart?.length}</span>
          </p>
          <p className="text-lg">
            Grand Total: <span className="font-bold">₹{grandTotal}</span>
          </p>
          <div className="mb-4">
          <p className="font-semibold mb-1">Payment Mode:</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="Cash on Delivery"
                checked={paymentMode === 'Cash on Delivery'}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMode === 'razorpay'}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              Other
            </label>

            {/* show shipping address */}
            <textarea
              name="shippingAddress"  
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Shipping Address"
              className="mt-2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
        </div>

          <button className={`mt-5 ${cart?.length === 0 ? 'disable-button' : 'primary-button'} `}
          onClick={()=> handleCheckOut()}
          disabled={cart?.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;