import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const PageNotFound = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-16">
            <div className="text-center">
                {/* Error Icon */}
                <div className="mb-4">
                    <FaExclamationTriangle className="mx-auto h-16 w-16 text-yellow-500" />
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-900 mb-4">
                    4<span className="text-indigo-600">0</span>4
                </h1>

                {/* Error Message */}
                <h2 className="text-3xl font-semibold text-gray-700 mb-4">
                    Page Not Found
                </h2>
                
                {/* Error Description */}
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                {/* Back to Home Button */}
                <Link 
                    to="/"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                    <FaHome className="h-5 w-5" />
                    Back to Home
                </Link>
            </div>

            {/* Optional: Additional Links */}
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Need help? {' '}
                    <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default PageNotFound; 