import React, { useContext, useEffect, useState } from "react";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import ProductContext from "../state-management/ProductContext";
import CategoryContext from "../state-management/CategoryContext";

const Footer = () => {

  const [latestProducts, setLatestProducts] = useState([]);
  const {
    loading,
    products,
    fetchShowcaseProducts,
  } = useContext(ProductContext);

  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useContext(CategoryContext);

  useEffect(() => {

    // Fetch categories when the component mounts
    fetchCategories();
    // fetchProducts();
  }, []);

  return (
    <footer className=" bg-gray-900 text-white py-6 mt-auto">
      {loading || categoriesLoading && <Loading />}
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Shop Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Shop by Category</h3>
          <ul className="space-y-2">
            {categories.slice(0, 5).map((category) => ( // Only display the first 4 categories
              <li key={category.id}><a href={`/category/${category.name}`} className="hover:underline">{category.name}</a></li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
       { latestProducts?.length > 0 &&  <div>
          <h3 className="text-lg font-semibold mb-3">View Out Latest Products</h3>
          <ul className="space-y-2">
            {latestProducts?.slice(0, 4)?.map((product) => ( // Only display the first 4 products
              <li key={product.id}>
                <Link to={`/user/shop/${product.categoryName}/${product.id}`} className="hover:underline">
                  {product.name}
                </Link></li>
            ))}
          </ul>
        </div>
}
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">About Us</h3>
          <ul className="space-y-2">
            <li><Link to = '/'
            onClick={() => window.scrollTo(0, 0)}
             className="hover:underline">Darla's Store</Link></li>
            <li><a href="mailto:udaykirandarla2002gmail.com" className="hover:underline">darlastore2025@gmail.com</a></li>
            <li >+91 6301436515</li>
          </ul>
        </div>


        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://www.linkedin.com/in/darla-uday-kiran-18a450239/"
              target="_blank" className="hover:underline">LinkedIn</a>
            <a href="https://www.instagram.com/uday1709_?igsh=MTU1a2s4dWdlcWVmcQ==" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">Instagram</a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-gray-400 text-sm mt-6">
        © {new Date().getFullYear()} Darla's Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
