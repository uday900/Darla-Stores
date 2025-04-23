import React, { useContext, useEffect, useState } from 'react';
import './LandingPage.css';
import image1 from '../assets/2.jpg'
import { FaStar } from "react-icons/fa";
import testImage from '../assets/test-image.jpg'
import { Link } from 'react-router-dom';
import ProductContext from '../state-management/ProductContext';
import CategoryContext from '../state-management/CategoryContext';
import Loading from '../components/Loading';
const LandingPage = () => {

    const [currentSlide, setCurrentSlide] = useState(0);
    const [sampleProducts, setSampleProducts] = useState([]);

    const { loading, error } = useContext(CategoryContext);
    const { products, loading: productsLoading, error: productsError,
        carousels,
        fetchCarousels,
        fetchShowcaseProducts
    } = useContext(ProductContext);


    const handleNextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % carousels.length);
    };

    const handlePrevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === 0 ? carousels.length - 1 : prevSlide - 1));
    };
    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentSlide((prevSlide) => (prevSlide + 1) % carousels.length);
        }, 2000);
        return () => clearInterval(interval);
      }, [carousels.length])

      useEffect(() => {
        const handlefetch = async () =>{
            const res= await fetchShowcaseProducts();
            console.log(res);
            setSampleProducts(res);
        }
        handlefetch()
        fetchCarousels();
        // setSampleProducts(fetchShowcaseProducts());
    }, []);

    if (loading || productsLoading) {
        return <Loading />;
    }
       
    const renderShowcaseProducts = () => {
        // console.log(sampleProducts)
        const filtered = {
            topTenProducts: sampleProducts?.topTenProducts,
            ...Object.fromEntries(Object.entries(sampleProducts).filter(([key]) => key !== 'topTenProducts'))

        }
        return (
            <>
                {sampleProducts && Object.entries(filtered).map(([category, products]) => {
                    // if (category === "topTenProducts") return null
                    if (products?.length === 0 || products?.length <= 4   ) return null
                    
                    return <div className="p-4" key={category}>
                        <h2 className="text-xl font-semibold mb-4">
                            {category === "topTenProducts" ? 'New Arrivals' : category}
                            <Link to={`/category/${category}`} className='text-sm text-gray-500 ml-4 hover:text-indigo-500'>{category === "topTenProducts" ? '' : 'View All'}</Link>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {products?.slice(0, 4).map((product, index) => (
                                <Link to={`/product/${product.id}`} key={index} className='hover:scale-105 transition-all duration-300'>
                                    <div className="bg-white p-3 rounded-lg shadow hover:shadow-lg transition duration-300">
                                        <div className="w-full items-center mb-2">
                                            <img
                                                src={`data:image/png;base64,${product.imageData}`}
                                                alt={product.name}
                                                className="max-h-full object-contain"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-800">{product.name}</h3>
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
    })}
            </>
        );
    };
    


    return (
        <>
            {/* slider */}
            <div className='relative overflow-hidden max-h-screen mb-8'>

                <div className='flex transition-transform duration-500'
                    style={{
                        transform: `translateX(-${currentSlide * 100}%)`
                    }}
                >
                    {/* { carousels?.length === 0 && <div className='w-full flex justify-center items-center h-screen bg-gray-200'>No carousels</div>} */}
                    {carousels?.map((image, index) => (
                        //w-screen flex-shrink-0
                        <div className="w-[100%] flex-shrink-0" key={index}>
                            <img src={`data:image/png;base64,${image.imageData}`} alt={image.alt} 
                            className='w-full h-[200px] md:h-[500px] object-cover' />

                        </div>
                    ))}

                </div>

                {/* Arrows */}
                <div>
                    {carousels && carousels.length > 1 && (
                        <>
                            <button
                                className="absolute top-1/2 left-0 transform -translate-y-1/2 backdrop-blur-sm text-xl font-bold
                                 cursor-pointer rounded-full p-2 px-4
                                 "
                                onClick={handlePrevSlide}
                            >
                                &lt;
                            </button>
                            <button
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 backdrop-blur-sm text-xl font-bold
                                 cursor-pointer rounded-full p-2 px-4
                                 "
                                onClick={handleNextSlide}
                            >
                                &gt;
                            </button>
                        </>
                    )}

                </div>


            </div>

            {/* Products by category */}
            <div className='space-y-4'>
                {/* {categories.slice(0, 3).map((category, index) => (
                    <div key={index}>
                        {renderProductsByCategory(category)}
                    </div>
                ))} */}
                { renderShowcaseProducts() }    
            </div>
        </>
    );
};

export default LandingPage; 