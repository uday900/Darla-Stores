import React, { useContext, useEffect } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PageNotFound from './components/PageNotFound'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import CategoriesBar from './components/CategoriesBar'
import LandingPage from './pages/LandingPage'
import ProductPage from './pages/ProductPage'
import CategoryPage from './pages/CategoryPage'
import CheckOutPage from './pages/CheckOutPage'
import { ToastContainer } from 'react-toastify'
import UserProfilePage from './pages/UserProfilePage'
import Cart from './pages/Cart'
import AdminRoutes from './pages/admin/AdminRoutes'
import PrivateRoute from './components/PrivateRoute'
import ErrorPage from './components/Errorpage'
import AuthRequired from './components/AuthRequired'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Search from './pages/Search'
import UserDashboard from './pages/UserDashboard'
import UserProfile from './components/UserProfile'
import UserOrders from './components/UserOrders'
import UserAccountInformation from './components/UserAccountInformation'
import UserUpdatePassword from './components/UserUpdatePassword'
import ProductContext from './state-management/ProductContext'
import Loading from './components/Loading'
function App() {
  const location = useLocation();
  const { setSearchQuery } = useContext(ProductContext)

  useEffect(() => {
    if (location.pathname !== '/search') {
      setSearchQuery('');
    }
  }, [location])
  return (
    <>
      <Navbar />
      <CategoriesBar />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/product/:productId' element={<ProductPage />} />
        <Route path='/category/:categoryName' element={<CategoryPage />} />
        <Route path='/checkout/:productId' element={<PrivateRoute><CheckOutPage /></PrivateRoute>} />
        <Route path='/search' element={<Search />} />

        <Route path="/user" element={<PrivateRoute><UserDashboard /></PrivateRoute>}>
          <Route index element={<UserProfile />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="update-password" element={<UserUpdatePassword />} />
          <Route path="account-information" element={<UserAccountInformation />} />
        </Route>

        <Route path='/cart' element={<PrivateRoute><Cart /></PrivateRoute>} />


        <Route path='/admin/*' element={<PrivateRoute adminRoute={true}><AdminRoutes /></PrivateRoute>} />
        <Route path='/error' element={<ErrorPage />} />
        <Route path='/unauthorized' element={<AuthRequired />} />
        <Route path='/loading' element={<Loading />} /> 

        <Route path='*' element={<PageNotFound />} />
      </Routes>
      <Footer />

      <ScrollToTop />
      <ToastContainer position='top-right' autoClose={3000} />
    </>
  )
}

export default App