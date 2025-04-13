import { useContext, useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { FaTachometerAlt, FaImages, FaShoppingCart, FaUsers, FaBox } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../../state-management/AuthContext";
import Loading from '../../components/Loading';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { loading, message, error } =  useContext(AuthContext)

  return (
    <div className="flex h-auto w-full">
      {/* Sidebar */}
      <aside
        className={`bg-[##f8f9f9] border-r border-slate-200  shadow-lg h-screen p-5
        fixed md:relative md:w-1/4 transition-transform duration-300 
        ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-64"} md:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          className="md:hidden text-2xl mb-4"
          onClick={() => setIsSidebarOpen(false)}
        >
          <IoClose className="text-xl" />
        </button>

        {/* Sidebar Links */}
        <ul className="mt-4 space-y-4 text-gray-800 font-medium">
          <li className="flex items-center gap-2 hover:text-purple-600 transition">
            <FaTachometerAlt />
            <Link to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
          </li>
          <li className="flex items-center gap-2 hover:text-purple-600 transition">
            <FaBox />
            <Link to="/admin/categories" onClick={() => setIsSidebarOpen(false)}>Categories</Link>
          </li>
          {/* Products */}
          <li className="flex items-center gap-2 hover:text-purple-600 transition">
            <FaBox />
            <Link to="/admin/products" onClick={() => setIsSidebarOpen(false)}>Products</Link>
          </li>
          <li className="flex items-center gap-2 hover:text-purple-600 transition">
            <FaImages />
            <Link to="/admin/carousels" onClick={() => setIsSidebarOpen(false)}>Carousel</Link>
          </li>
          <li className="flex items-center gap-2 hover:text-purple-600 transition">
            <FaShoppingCart />
            <Link to="/admin/orders" onClick={() => setIsSidebarOpen(false)}>Orders</Link>
          </li>
          <li className="flex items-center gap-2 hover:text-purple-600 transition">
            <FaUsers />
            <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)}>Customers</Link>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full md:w-3/4 md:ml-0 transition-all">
        {/* Mobile Navbar */}
        <nav className="bg-white shadow-md p-4 flex items-center md:hidden">
          <button
            className="text-2xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <CiMenuFries />
          </button>
          <h1 className="text-lg font-semibold ml-4">Admin Dashboard</h1>
        </nav>

        
        {/* Page Content */}
        <main className="p-6">
          {loading ? <Loading /> : children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
