import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle, FaArrowLeft } from 'react-icons/fa';
import loginImage from '../../assets/login-page-front-image.png';
import { toast } from 'react-toastify';
import { AuthContext } from '../../state-management/AuthContext';
import { API_URL } from '../../api-services/apiConfig';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
const Login = () => {
    // console.log('login page');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotForm, setShowForgotForm] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [resetData, setResetData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });
    const [tokenState, setTokenState] = useState(null);
    const [errorResponseState, setErrorResponseState] = useState(null);
    const [successResponseState, setSuccessResponseState] = useState(null);

    // state values
    const { loading, error, message,
        verifyToken,
         login, sendOtpToEmail, verifyOtp, clearLogs } = useContext(AuthContext);

    const isAdmin = localStorage.getItem('isAdmin');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // fetching values after successfull login with google
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const success = params.get("success");
        const token = params.get("token");

        if (error) setErrorResponseState(error);
        if (success && token) {
            setSuccessResponseState(success);
            setTokenState(token);
        }

        // Optional: clean up the URL
        // window.history.replaceState({}, document.title, window.location.pathname);
    }, []);

    useEffect(() => {
        const handleOAuthLogin = async () => {
            if (errorResponseState) {
                toast.error(errorResponseState);
                setErrorResponseState(null);
            }

            else if (successResponseState && tokenState) {
                try {
                    const result = await verifyToken(tokenState);
                    // toast.success(result.message);
                    if (isAdmin) {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                } catch (err) {
                    toast.error("Token verification failed");
                    console.error(err);
                } finally {
                    setSuccessResponseState(null);
                    setTokenState(null);
                }
            }
        };

        handleOAuthLogin();
    }, [errorResponseState, successResponseState, tokenState, navigate]);

  
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Login logic will be implemented later
        await login(formData);
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await sendOtpToEmail(forgotEmail);
            setOtpSent(true);
            // toast.success(result.message);
        } catch (err) {
            toast.error(err || "Failed to send OTP!");
        }
        
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        console.log(resetData);
        // Reset password logic will be implemented later
        // calling verifyOtp
        try {
            const result = await verifyOtp({email: forgotEmail, otp: resetData.otp, password: resetData.newPassword});
            toast.success(result.message);
        } catch (err) {
            toast.error(err || "Failed to verify OTP!");
        }
        
    };

    const handleResetChange = (e) => {
        const { name, value } = e.target;
        setResetData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'newPassword') {
            checkPasswordStrength(value);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = () => {
        // Google login logic will be implemented later
        window.location.href = API_URL + '/auth/oauth/login?mode=login';
    };

    const checkPasswordStrength = (password) => {
        setPasswordStrength({
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const isPasswordValid = () => {
        return Object.values(passwordStrength).every(requirement => requirement);
    };

    const isValidLoginForm = formData.email &&
        formData.password &&
        formData.password.length >= 8;

    const isValidResetForm = resetData.otp &&
        resetData.newPassword &&
        resetData.confirmPassword &&
        resetData.newPassword === resetData.confirmPassword &&
        isPasswordValid();

    

    const PasswordRequirements = () => (
        <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">Password must contain:</p>
            <ul className="text-sm space-y-1">
                <li className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{passwordStrength.hasMinLength ? '✓' : '•'}</span>
                    At least 8 characters
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
                    At least one special character (!@#$%^&*)
                </li>
            </ul>
        </div>
    );

    const renderForgotPasswordForm = () => (
        <div className="max-w-sm w-full space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                    Forgot Password
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Follow the steps to reset your password
                </p>
            </div>

            <form onSubmit={otpSent ? handleResetSubmit : handleForgotSubmit} className="space-y-6">
                {/* Email Field - Always visible */}
                <div>
                    <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        id="forgotEmail"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your email"
                        // disabled={otpSent}
                    />
                </div>

                {!otpSent ? (
                    /* Send OTP Button */
                    <div>
                        <button
                            type="submit"
                            disabled={loading || !forgotEmail}
                            className={`${!forgotEmail || loading ? 'disable-button' : 'primary-button'} w-full`}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Resend OTP Link */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleForgotSubmit}
                                disabled={loading}
                                className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer"
                            >
                                {loading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        </div>

                        {/* OTP Field */}
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                Enter OTP
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                maxLength={6}
                                value={resetData.otp}
                                onChange={handleResetChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter 6-digit OTP"
                            />
                        </div>

                        {/* New Password Field */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    value={resetData.newPassword}
                                    onChange={handleResetChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    {showNewPassword ? (
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
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={resetData.confirmPassword}
                                    onChange={handleResetChange}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                        resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Confirm new password"
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
                            {resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={!isValidResetForm || loading}
                                className={`${!isValidResetForm || loading ? 'disable-button' : 'primary-button'} w-full`}
                                // className="primary-button w-full"
                                // disabled={!resetData.otp || !isPasswordValid() || 
                                //         resetData.newPassword !== resetData.confirmPassword}
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </div>
                    </>
                )}
            </form>

            {/* Navigation Links - Always visible */}
            <div className="space-y-4">
                <button
                    onClick={() => {
                        setShowForgotForm(false);
                        setOtpSent(false);
                        setResetData({ otp: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                    <FaArrowLeft className="h-4 w-4" />
                    Back to Login
                </button>
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 hover:underline hover:text-indigo-500 font-medium">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );

    const renderLoginForm = () => (
        <div className="max-w-sm w-full space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                    Welcome to Darla Stores
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Login here to continue
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
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
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

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        >
                            {showPassword ? (
                                <FaEyeSlash className="h-5 w-5 text-gray-400" />
                            ) : (
                                <FaEye className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={() => setShowForgotForm(true)}
                        className="text-sm text-indigo-600 hover:underline cursor-pointer"
                    >
                        Forgot your password?
                    </button>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={loading || !isValidLoginForm}
                        className={`${!isValidLoginForm || loading ? 'disable-button' : 'primary-button'} w-full`}
                    >
                        {loading ? 'Logging in..' : 'Login'}
                    </button>
                </div>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 hover:underline hover:text-indigo-500 font-medium">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex">
            {/* Left Side - Image */}
            <div className="hidden md:block w-1/2 bg-gray-100">
                <img
                    src={loginImage}
                    alt="Login"
                    className="w-full object-cover"
                />
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex justify-center py-8 px-4 overflow-y-auto">
                {showForgotForm ? renderForgotPasswordForm() : renderLoginForm()}
            </div>
        </div>
    );
};

export default Login; 