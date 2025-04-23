import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import image1 from '../assets/2.jpg'
import ProductContext from '../state-management/ProductContext';
import { FaStar } from 'react-icons/fa';
import UserContext from '../state-management/UserContext';
import { toast } from 'react-toastify';

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    // const [reviews, setReviews] = useState([
    //     {
    //         id: 1,
    //         userName: 'John Doe',
    //         rating: 5,
    //         comment: 'This is a great product!',
    //         createdAt: '2021-01-01'
    //     },
    //     {
    //         id: 2,
    //         userName: 'Jane Smith',
    //         rating: 4,
    //         comment: 'I like this product.',
    //         createdAt: '2021-01-02'
    //     }
    // ]);
    const [rating, setRating] = useState("5");
    const [review, setReview] = useState("");
    const [localReviews, setLocalReviews] = useState([]);

    // const [product, setProduct] = useState({
    //     id: 1,
    //     name: 'Product 1',
    //     description: 'Product 1 description',
    //     price: 100,
    //     rating: 4.5,
    //     image: image1,
    //     category: 'Men',
    //     sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    //     colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    //     brand: 'Brand 1',


    // },);

    // dummy data
    const categories = [
        {
            name: 'Men',
            description: 'Men\'s clothing',

        },
        {
            name: 'Women',
            description: 'Women\'s clothing',
        },
        {
            name: 'Kids',
            description: 'Kids\' clothing',
        }
    ];

    const isAdmin = localStorage.getItem("isAdmin");
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const user = JSON.parse(localStorage.getItem('user')); //localStorage.getItem("user")

    const { product, 
        loading,
        fetchProductById,
        fetchProductReviews,
        fetchProductsByCategory,
        addReview,
        deleteReview,
        reviews,
        products,
        message,
        error,
        clearLogs,
    } = useContext(ProductContext);

    const { loading: loading2, message: message2,
        addToCart,

    } = useContext(UserContext);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (message) {
            toast.success(message);
            fetchProductById(productId);
            fetchProductReviews(productId);
        }

        clearLogs();
    }, [error, message])
    useEffect(() => {
        // fetchProductReviews(productId)
        console.log(reviews);
        if (reviews) {
            setLocalReviews(reviews)
            console.log("local", reviews)
        }
    }, [reviews])
    useEffect(() => {
        const handleFunction = async () => {
            await fetchProductById(productId)
            await fetchProductReviews(productId)
        }

        handleFunction();
    }, [productId])

    useEffect(() => {
        const handleFunction = async () => {
            console.log(product.category, 'category')
            await fetchProductsByCategory(product?.category)
            await fetchProductReviews(productId)
        }

        if (product) {
            handleFunction();
        }
        // console.log("reviews in productpage", reviews)
    }, [product])
    const handleAddToCart = () => {
        console.log('Adding to cart:', product);
        if (isAuthenticated) {
            addToCart(user.id, productId);
        } else {
            toast.error("Please login to add to cart");
            navigate('/login');
        }

    };

    const handleOrderNow = () => {
        console.log('Ordering now:', product);
        if (!isAuthenticated) {
            toast.error("Please login to order now");
            navigate('/login');
        }
        navigate(`/checkout/${product.id}`);
    };

    const handleDeleteReview = async (reviewId) => {
        // console.log('Deleting review:', reviewId, userId);
        if(window.confirm("Are you sure you want to delete this review?"))
        {
            await deleteReview(reviewId, user.id);
        }
        
    };

    const handleAddReview = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please login to add review");
            navigate('/login');
        } else {
            const formData = {
                productId,
                rating: Number(rating),
                comment: review,
                userId: user.id
            };

            addReview(formData);
        }

        setRating("5");
        setReview("");

        // console.log('Adding review:', { rating, review });
    };


    const renderProductsByCategory = () => {
        return (
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">{"Related Products"}
                    <Link to={`/category/${product.category}`} className='text-sm text-gray-500 ml-4 hover:text-indigo-500'>View All</Link>
                </h2>
                <div
                    // className='flex gap-4'
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
                >
                    {products.slice(0, 4).map((product, index) => (
                        // product card
                        <Link to={`/product/${product.id}`} key={index} className='hover:scale-105 transition-all duration-300'>
                            <div
                                className="bg-white p-3 rounded-lg shadow hover:shadow-lg transition duration-300"
                            >
                                <div className="w-full items-center mb-2">
                                    <img
                                        src={`data:image/png;base64,${product.imageData}`}
                                        alt={product.name}
                                        className="max-h-full object-contain"
                                    />
                                </div>

                                <h3 className="text-sm font-medium text-gray-800">
                                    {product.name}
                                </h3>

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
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };
    return (
        <>
            <div className="container mx-auto py-4 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className=''>
                        <img
                            src={`data:image/png;base64,${product?.imageData}`}
                            alt="Raven Hoodie"
                            className="w-full h-96 object-contain sticky top-28 rounded-lg"
                        />

                    </div>

                    <div>
                        <h1 className="text-3xl font-bold">{product?.name}</h1>
                        {/* display brand */}
                        <p className="text-sm text-gray-500 mb-4"> by {product?.brand}</p>

                        <div className="flex items-center mb-4">
                            {/* { stars.map(star => star) } */}
                            {[1, 2, 3, 4, 5].map((star, _) => {
                                return <span key={_} className={` ${star <= product?.rating ? 'text-yellow-500' : 'text-gray-400'}`}>★</span>
                            })}
                            <span className="text-sm text-gray-500 ml-2">
                                ({product?.rating})
                            </span>
                        </div>

                        <p className="text-2xl font-semibold mb-4">&#8377;{product?.price}</p>
                        <span
                            className={`inline-block px-3 py-1 text-sm font-medium rounded-full 
                                ${product?.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                            {product?.stock > 0 ?  `${product?.stock < 5? `only ${product?.stock} available` : `${product?.stock} in stock`}` : 'Out of stock'}
                        </span>

                        {product?.sizes &&
                            <div className="mt-6">
                                <h2 className="text-sm font-semibold mb-2">Sizes Avaliable</h2>

                                <div className="flex space-x-2">
                                    {product?.sizes.split(",").map(s => s.trim()).filter(s => s).map((size, index) => (
                                        <button
                                            key={index}
                                            className="border border-gray-200 rounded-md px-3 py-1 hover:bg-slate-200 cursor-pointer"
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        }
                        {product?.colors &&
                            <div className="mt-5">
                                <h2 className="text-sm font-semibold mb-2">Colour Available</h2>
                                <div className="flex space-x-2 mb-4 ">
                                    {product.colors.split(",").map(s => s.trim()).filter(s => s).map((color, index) => (
                                        <span
                                            key={index}
                                            className="inline-block border border-slate-200 p-2 w-5 h-5 rounded-full cursor-pointer"
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            title={color}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                        }

                        <div className='flex gap-4 mt-4 max-w-md justify-center'>
                            <button
                                // className="
                                onClick={() => handleAddToCart()}
                                className={`${loading2 ? 'disable-button' : 'w-full cursor-pointer hover:bg-yellow-300 transition-all duration-300 bg-yellow-200 text-black font-semibold py-2 px-4 rounded-md'}`}
                                disabled={loading2}
                            >
                                {loading2 ? 'Adding...' : 'Add to Cart'}
                            </button>

                            <button
                                className="primary-button w-full"
                                onClick={() => handleOrderNow()}
                            >Buy Now</button>
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">Product Description</h2>
                            <p className="text-gray-600 mb-4">{product?.description}</p>
                        </div>

                        {/* Ratings and Reviews Section */}
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">Ratings and Reviews</h2>
                            <div className="space-y-4">
                                {localReviews?.length ? (
                                    localReviews.map((review, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 p-4 rounded-md shadow-sm"
                                        >
                                            <div> <span className='font-semibold'>{review.userName}</span>
                                                <span className='text-sm ml-4'>reviewed on {new Date(review.createdAt).toLocaleString()}</span>

                                                {isAuthenticated && review.userId === user.id && <button className='ml-2 text-sm text-red-600 cursor-pointer hover:text-red-900'
                                                    onClick={() => handleDeleteReview(review.id, review.userId)}>remove review
                                                </button>
                                                }
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>

                                                    {[1, 2, 3, 4, 5].map((star, _) => {
                                                        return <span key={_} className={` ${star <= review.rating ? 'text-yellow-500' : 'text-gray-400'}`}>★</span>
                                                    })}
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        ({review.rating}/5)
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {review.date}
                                                </p>
                                            </div>
                                            <p className="text-gray-800 mt-2">{review.comment}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                - by {review.userName}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600">No reviews available.</p>
                                )}
                                {/* <AddReview productId={productId} /> */}
                                <div className="relative w-full  bg-white p-6 rounded-lg shadow-md">
                                    <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>

                                    <form onSubmit={handleAddReview}>
                                        {/* Rating Selection */}
                                        <label className="block font-medium">Rating:</label>
                                        <select
                                            className="w-full mt-2 p-2 border rounded-md text-sm"
                                            value={rating}
                                            onChange={(e) => setRating(e.target.value)}
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                            <option value="4">⭐⭐⭐⭐ - Good</option>
                                            <option value="3">⭐⭐⭐ - Average</option>
                                            <option value="2">⭐⭐ - Poor</option>
                                            <option value="1">⭐ - Very Bad</option>
                                        </select>

                                        {/* Review Input */}
                                        <label className="block font-medium mt-4">Your Review:</label>
                                        <textarea
                                            className="w-full mt-2 p-2 border rounded-md resize-none h-24"
                                            placeholder="Write your review here..."
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}

                                        />

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className={`${!review || loading ? 'disable-button' : 'primary-button text-sm'} mt-4`}
                                            disabled={!review || loading}
                                        >
                                            {loading ? 'Adding...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* related products */}
                {product && renderProductsByCategory(product?.category)}
            </div>


        </>
    )
}

export default ProductPage