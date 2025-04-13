import { Navigate } from "react-router-dom";

const AuthRequired = () => {
  
  
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
          <p className="text-gray-700 mt-2">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  
};

export default AuthRequired;
