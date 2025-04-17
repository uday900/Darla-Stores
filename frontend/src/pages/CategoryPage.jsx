import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { FaFilter, FaStar } from 'react-icons/fa';
import image1 from '../assets/2.jpg'
import CategoryContext from '../state-management/CategoryContext';
import ProductContext from '../state-management/ProductContext';

function CategoryPage() {
    const { categoryName } = useParams();
    // dummy data
    // const categories = [
    //     {
    //         name: 'Men',
    //         description: 'Men\'s clothing',

    //     },
    //     {
    //         name: 'Women',
    //         description: 'Women\'s clothing',
    //     },
    //     {
    //         name: 'Kids',
    //         description: 'Kids\' clothing',
    //     }
    // ];
    // const products = [
    //     {
    //         id: 1,
    //         name: 'Product 1',
    //         description: 'Product 1 description',
    //         price: 100,
    //         rating: 4.5,
    //         image: image1,
    //         category: 'Men',
    //         brand: 'Brand 1'
    //     },
    //     {
    //         id: 2,
    //         name: 'Product 2',
    //         description: 'Product 2 description',
    //         price: 200,
    //         rating: 4.5,
    //         image: image1,
    //         category: 'Men',
    //         brand: 'Brand 2'
    //     },
    //     {
    //         id: 3,
    //         name: 'Product 3',
    //         description: 'Product 3 description',
    //         price: 300,
    //         rating: 4.5,
    //         image: image1,
    //         category: 'Men',
    //         brand: 'Brand 3'
    //     },
    //     {
    //         id: 4,
    //         name: 'Product 4',
    //         description: 'Product 4 description',
    //         price: 400,
    //         rating: 4.5,
    //         image: image1,
    //         category: 'Men',
    //         brand: 'Brand 4'
    //     },
    //     {
    //         id: 5,
    //         name: 'Product 5',
    //         description: 'Product 5 description',
    //         price: 501,
    //         rating: 4.5,
    //         image: image1,
    //         category: 'Men',
    //         brand: 'Brand 4'
    //     },

    // ];

    const [showAll, setShowAll] = useState(false);

    const [selectedBrands, setSelectedBrands] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false); // For mobile filter toggle
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

    // t2
    const [priceRanges, setPriceRanges] = useState([]);

    // state values
    const { categories, loading, error, message, fetchCategories } = useContext(CategoryContext);
    const { products, fetchProductsByCategory, loading: productsLoading, error: productsError } = useContext(ProductContext)
    const [filterProducts, setFilterProducts] = useState();
    useEffect(() => {
        fetchCategories()
    }, [])
    useEffect(() => {
        setFilterProducts(products)

        // t2 ---------
        const prices = products.map((product) => product.price);
        if (prices.length === 0) return;
        console.log(prices);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const step = Math.ceil((maxPrice - minPrice) / 5);
        const ranges = [];
        console.log(minPrice, maxPrice, step);
        for (let i = 0; i < 5; i++) {
            const start = minPrice + i * step;
            const end = i === 4 ? maxPrice : start + step - 1;
            ranges.push({ min:start, max:end, label: `${start} - ${end}` });
            console.log(start, end, "i is", i, "step is", step);
        }

        setPriceRanges(ranges);

        // t2 ---------
    }, [products])
    useEffect(() => {
        // fetchCategories(),

        const handleFunction = async () => {
            await fetchProductsByCategory(categoryName);
        }
        handleFunction();
    }, [categoryName])
    // const priceRanges = [
    //     { label: "0 - 500", min: 0, max: 500 },
    //     { label: "500 - 1000", min: 500, max: 1000 },
    //     { label: "1000 - 2000", min: 1000, max: 2000 },
    //     { label: "2000 - 5000", min: 2000, max: 5000 },
    //     { label: "5000+", min: 5000, max: Infinity },
    // ];

    const handleBrandFilter = (e) => {
        if (e.target.checked) {
            setSelectedBrands([...selectedBrands, e.target.value]);
        } else {
            setSelectedBrands(selectedBrands.filter((brand) => brand !== e.target.value));
        }
    };

    const handlePriceFilterChange = (e, min, max) => {
        // filter products man
        if (e.target.checked) {

            if (selectedPriceRanges.length === 0) {
                setSelectedPriceRanges([{ min, max }]);
                return;
            }
            setSelectedPriceRanges([...selectedPriceRanges, { min, max }]);

        } else {
            setSelectedPriceRanges(selectedPriceRanges.filter((range) => range.min !== min || range.max != max));
        }

    }

    useEffect(() => {
        let overAllFilteredProducts = products;
        if (selectedBrands.length > 0) {
            const filteredProductsbyBrand = products.filter((product) =>
                selectedBrands.includes(product.brand)
            );
            overAllFilteredProducts = filteredProductsbyBrand;
            // setFilterProducts(filteredProductsbyBrand);
        }
        // else {
        //     setFilterProducts(products);
        // }

        if (selectedPriceRanges && selectedPriceRanges.length > 0) {
            const filteredProductsByPrice = products.filter((product) =>
                selectedPriceRanges.some((range) =>
                    product.price >= range.min && product.price <= range.max
                )
            );
            overAllFilteredProducts = overAllFilteredProducts.filter((product) =>
                filteredProductsByPrice.includes(product)
            );
            // setFilterProducts(filteredProductsByPrice);
        }
        setFilterProducts(overAllFilteredProducts);
    }, [selectedBrands, selectedPriceRanges]);


    const Card = ({ product, categoryName }) => {
        return (
            <Link to={`/product/${product.id}`} className='hover:scale-105 transition-all duration-300'>
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
        );
    };
    const clearFilter = () => {
        setSelectedBrands([]);
        setSelectedPriceRanges([]);
        // remove checked values aslo
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });
    };
    return (
        <>
            <div className="flex flex-col md:flex-row">
                {/* Filter Sidebar - Hidden on mobile unless toggled */}
                <div
                    className={`w-1/2 md:w-1/4 p-4 border border-solid border-gray-200 mx-2 md:mx-10 my-4
                    bg-white fixed md:static top-0 left-0 h-full z-20 transition-transform duration-300 
                    ${isFilterVisible ? 'translate-x-0 z-100 top-28' : '-translate-x-full md:translate-x-0'}`}
                >
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg">Filter</h2>
                        <span className='text-sm text-gray-500 cursor-pointer' onClick={() => clearFilter()}>clear filter</span>
                        {/* Close Button for Mobile */}
                        <button className="md:hidden text-sm" onClick={() => setIsFilterVisible(false)}>✖</button>
                    </div>

                    {/* Brands Filter */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Brands</h3>
                        <ul className="space-y-1">
                            {products.slice(0, showAll ? products.length : 4).map((product) => (
                                <li key={product.id}>
                                    <label className="cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="mx-1 cursor-pointer"
                                            value={product.brand}
                                            onClick={(e) => handleBrandFilter(e)}
                                        />
                                        {product.brand}
                                    </label>
                                </li>
                            ))}
                            {products.length > 4 && (
                                <button
                                    className="text-purple-500 cursor-pointer"
                                    onClick={() => setShowAll(!showAll)}
                                >
                                    {showAll ? 'Show less' : `+ ${products.length - 4} more`}
                                </button>
                            )}
                        </ul>
                    </div>

                    {/* price filters */}
                    <div>
                        <p>Price Filter</p>
                        {priceRanges?.map(({ label, min, max }) => (
                            <label key={label} style={{ display: "block", cursor: "pointer" }}>
                                <input type='checkbox'
                                    className='mx-1 cursor-pointer'
                                    onClick={(e) => handlePriceFilterChange(e, min, max)}
                                // checked={priceRanges.some(range => range.min === min && range.max === max)}
                                />
                                {label}
                            </label>

                        ))}


                    </div>

                    {/* Other Categories */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Other Categories</h3>
                        <ul className="space-y-1">
                            {categories.map((category, _) => (
                                <li key={_}>
                                    <Link to={`/category/${category.name}`} className="cursor-pointer">
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Products Section */}
                <div className="w-full md:w-3/4 py-4 px-4">
                    <div className="flex justify-between mb-4 items-center">
                        {/* Breadcrumb Navigation */}
                        <nav className="text-sm text-gray-500">
                            <ol className="list-reset flex">
                                <li className="mr-2">Products</li>
                                <li className="mr-2">&gt;</li>
                                <li className="text-gray-800 font-medium">{categoryName}</li>
                            </ol>
                        </nav>

                        {/* Mobile Filter Icon */}
                        <button
                            className="text-sm md:hidden  text-purple-600 flex items-center gap-2"
                            onClick={() => setIsFilterVisible(!isFilterVisible)}
                        >
                            <FaFilter /> Filter
                        </button>

                        <div className="hidden md:flex gap-4">
                            <button className="text-purple-500">New</button>
                            <button>Recommended</button>
                        </div>
                    </div>

                    {/* Product Grid - Responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
                        {filterProducts?.map((product, index) => (
                            <Card key={index} product={product} categoryName={categoryName} />
                        ))}

                        {filterProducts?.length === 0 && <p>No products found.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}

export default CategoryPage;
