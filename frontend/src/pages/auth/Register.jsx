import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle, FaArrowLeft } from 'react-icons/fa';
import registerImage from '../../assets/login-page-front-image.png';
import { AuthContext } from '../../state-management/AuthContext';
import { toast } from 'react-toastify';
import { API_URL } from '../../api-services/apiConfig';

const Register = () => {
    console.log('register page');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        city: '',
        state: '',
        country: '',
        district: '',
        street: '',
        phoneNumber: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [errorResponseState, setErrorResponseState] = useState(null);
    const [successResponseState, setSuccessResponseState] = useState(null);
    // state values
    const { loading, error, message, isAuthenticated, isAdmin, user, register } = useContext(AuthContext);
    


    // 1️⃣ First useEffect: Parse query params only once
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const success = params.get('success');

        if (error) setErrorResponseState(error);
        if (success) setSuccessResponseState(success);
    }, []);

    // 2️⃣ Second useEffect: Trigger effects when states are updated
    useEffect(() => {
        if (errorResponseState) {
            toast.error(errorResponseState);
            setErrorResponseState(null); // clear after showing
        }

        if (successResponseState) {
            toast.success(successResponseState);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            setSuccessResponseState(null); // clear after showing
        }
    }, [errorResponseState, successResponseState, navigate]);


 
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'password') {
            checkPasswordStrength(value);
        }
        if (name === 'phoneNumber') {
            setPhoneNumberError(value.length !== 10 ? 'Phone number must be 10 digits long' : '');
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(formData);

        try {
            const result = await register(formData);
            toast.success(result.message);
            // navigate('/login');
            // navigate to login page after 2 seconds
        } catch (err) {
            toast.error(err || "Registration failed!");
        }
    };


    const handleGoogleLogin = () => {
        // Google login logic will be implemented later
        window.location.href = API_URL + '/auth/oauth/login?mode=register';
    };

    const checkPasswordStrength = (password) => {
        setPasswordStrength({
            hasMinLength: password.length >= 8 && password.length <= 16,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[@#$%^&+=!]/.test(password),
        });
    };

    const isPasswordValid = () => {
        return Object.values(passwordStrength).every(requirement => requirement);
    };

    const isValidForm = formData.name.length >= 3 &&
        formData.name.length <= 50 &&
        formData.email &&
        isPasswordValid() &&
        formData.password === formData.confirmPassword &&
        /^\d{10}$/.test(formData.phoneNumber);

    const PasswordRequirements = () => (
        <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">Password must contain:</p>
            <ul className="text-sm space-y-1">
                <li className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{passwordStrength.hasMinLength ? '✓' : '•'}</span>
                    Between 8 and 16 characters
                </li>
                <li className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{passwordStrength.hasUpperCase ? '✓' : '•'}</span>
                    At least one uppercase letter
                </li>
                <li className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{passwordStrength.hasLowerCase ? '✓' : '•'}</span>
                    At least one lowercase letter
                </li>
                <li className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '•'}</span>
                    At least one number
                </li>
                <li className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{passwordStrength.hasSpecialChar ? '✓' : '•'}</span>
                    At least one special character (@#$%^&+=!)
                </li>
            </ul>
        </div>
    );

    return (
        <div className="flex">
            {/* Left Side - Image */}
            <div className="hidden md:block w-1/2">
                <img
                    src={registerImage}
                    alt="Register"
                    className="w-full object-cover"
                />
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center py-8 px-4 overflow-y-auto">
                <div className="max-w-sm w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Create an Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join Darla Stores today
                        </p>
                    </div>

                    {/* Google Login Button */}
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full cursor-pointer flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FaGoogle className="h-5 w-5 text-indigo-600" />
                            Continue with Google
                        </button>
                    </div>

                    {/* Separator */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or register with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                minLength={3}
                                maxLength={50}
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your name (3-50 characters)"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Phone Number Field */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                pattern="[0-9]{10}"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter 10-digit phone number"
                            />
                            {phoneNumberError && <p className="mt-1 text-sm text-red-600">{phoneNumberError}</p>}
                        </div>

                        {/* Address Fields */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                                    Street
                                </label>
                                <input
                                    id="street"
                                    name="street"
                                    type="text"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter street address"
                                />
                            </div>

                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                                    District
                                </label>
                                <input
                                    id="district"
                                    name="district"
                                    type="text"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter district"
                                />
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter city"
                                />
                            </div>

                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <input
                                    id="state"
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter state"
                                />
                            </div>

                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                    Country
                                </label>
                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter country"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    maxLength={16}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <PasswordRequirements />
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        }`}
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    {showConfirmPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={!isValidForm || loading}
                                className={`${!isValidForm || loading ? 'disable-button' : 'primary-button'} w-full`}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 cursor-pointer hover:underline hover:text-indigo-500 font-medium">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;