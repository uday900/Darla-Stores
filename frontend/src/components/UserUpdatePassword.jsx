import React, { useContext, useEffect, useState } from 'react';
import { FaEdit, FaBoxOpen, FaEyeSlash, FaEye } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import UserContext from '../state-management/UserContext';
import { AuthContext } from '../state-management/AuthContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

function UserUpdatePassword() {
 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });


  // console.log("userpasswordupdate")

  const {
    updatePassword,
    loading, 
    error, 
    message,
    clearLogs,
  } = useContext(UserContext);

  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    else if (message) {
      toast.success(message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordStrength({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      })

    }
    clearLogs();  
  }, [error, message])
  const handleUpdatePassword = async () => {
    await updatePassword(userData.id, currentPassword, newPassword);
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


  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(requirement => requirement);
  };




  const isFormValid = isPasswordValid && newPassword === confirmPassword &&
    currentPassword &&
    newPassword &&
    confirmPassword;

  if (loading) return <Loading />
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">


        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaBoxOpen /> Update Password
          </h2>
          <form action="" onSubmit={handleUpdatePassword}>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-gray-600">Current Password</label>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="relative">
                <label className="block text-gray-600">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                  }}
                  max={16}
                  min={8}
                  className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <PasswordRequirements />

              <div className="relative">
                <label className="block text-gray-600">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordError(e.target.value !== newPassword ? 'Passwords do not match' : '')
                  }}
                  className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
                />
                {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
                <span
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>



              <button
                type="button"
                onClick={handleUpdatePassword}
                className={`${!isFormValid || loading ? 'disable-button' : 'primary-button'}`}
                disabled={!isFormValid || loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
            </div>
          </form>
        </div>
   

        </div>
      


  );
}

export default  UserUpdatePassword;
