import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState, useRef, useContext } from 'react';
import CategoryContext from '../state-management/CategoryContext';
import './CategoryBar.css'

const CategoriesBar = () => {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    // const categories = [
    //     { name: 'Electronics', path: '/category/electronics' },
    //     { name: 'Fashion', path: '/category/fashion' },
    //     { name: 'Home & Kitchen', path: '/category/home-kitchen' },
    //     { name: 'Beauty', path: '/category/beauty' },
    //     { name: 'Sports', path: '/category/sports' },
    //     { name: 'Books', path: '/category/books' },
    //     { name: 'Toys', path: '/category/toys' },
    //     { name: 'Automotive', path: '/category/automotive' },
    //     { name: 'Grocery', path: '/category/grocery' },
    //     { name: 'Health', path: '/category/health' },
    //     { name: 'Pets', path: '/category/pets' },
    //     { name: 'Art', path: '/category/art' },
    //     { name: 'Music', path: '/category/music' },
    //     { name: 'Outdoors', path: '/category/outdoors' },
    //     { name: 'Toys', path: '/category/toys' },
    //     { name: 'Automotive', path: '/category/automotive' },
    //     { name: 'Grocery', path: '/category/grocery' },
    //     { name: 'Health', path: '/category/health' },
    //     { name: 'Pets', path: '/category/pets' },
    //     { name: 'Art', path: '/category/art' },

    // ];

    // state values
    const { categories, loading, error, message } = useContext(CategoryContext);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        }
    };

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 300;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="z-40 bg-white border-b border-gray-200 sticky top-16">
            <div className="max-w-7xl mx-auto">
                <div className="relative flex justify-center items-center">
                    {/* Left Navigation Button - Hidden on Mobile */}
                    {/* <div className="absolute left-0 z-10 hidden md:block">
                        <button
                            onClick={() => scroll('left')}
                            className={`h-full px-2 py-3 bg-gradient-to-r from-white to-transparent ${!showLeftArrow ? 'opacity-0 pointer-events-none' : 'opacity-100'
                                } transition-opacity duration-200 hover:from-gray-50`}
                        >
                            <FaChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                    </div> */}

                    {/* Categories Container */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        // className="flex space-x-8 py-2 overflow-x-auto md:overflow-x-hidden mx-2 md:mx-10 touch-pan-x"
                        className='flex space-x-8 py-2 whitespace-nowrap overflow-x-auto md:overflow-visible'
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {/* {categories.map((category, _) => (
                            <div className='relative group ' key = {_}>
                                <Link
                                    to={`/category/${category.name}`}
                                    className="flex-shrink-0 text-sm font-medium text-gray-700 hover:text-indigo-600 whitespace-nowrap transition-colors duration-200"
                                >
                                    {category.name}

                                </Link>
                                <span 
                                className="absolute z-50  w-max p-2 left-1/2 -translate-x-1/2 top-full hidden group-hover:flex bg-slate-500 text-white text-sm px-3 rounded shadow-md">
                                
                                    {category?.description}
                                </span>
                            </div>

                        ))} */}

{categories.map((category, index) => {
  const isLast = index === categories.length - 1;
  return (
    <div className="relative group" key={index}>
      <Link
        to={`/category/${category.name}`}
        className="text-sm font-medium text-gray-700 hover:text-indigo-600 whitespace-nowrap"
      >
        {category.name}
      </Link>
      <span
        className={`absolute z-50 top-full mt-1 hidden group-hover:flex 
                    bg-slate-500 text-white text-sm px-3 py-2 rounded shadow-md 
                    w-max max-w-xs whitespace-normal
                    ${isLast ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
      >
        {category?.description}
      </span>
    </div>
  );
})}

                    </div>

                    {/* Right Navigation Button - Hidden on Mobile */}
                    {/* <div className="absolute right-0 z-10 hidden md:block">
                        <button
                            onClick={() => scroll('right')}
                            className={`h-full px-2 py-3 bg-gradient-to-l from-white to-transparent ${!showRightArrow ? 'opacity-0 pointer-events-none' : 'opacity-100'
                                } transition-opacity duration-200 hover:from-gray-50`}
                        >
                            <FaChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default CategoriesBar; 