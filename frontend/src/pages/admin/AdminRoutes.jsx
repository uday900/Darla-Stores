import React from 'react'
import Layout from './Layout'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import ManageProducts from './ManageProducts'
import AddProduct from './AddProduct'
import UpdateProduct from './UpdateProduct'
import ManageCarousel from './ManageCarousel'
import ManageOrders from './ManageOrders'
import ManageUsers from './ManageUsers'
import ManageCategories from './ManageCategories'
function AdminRoutes() {
  return (
    <div>
      <Layout>
        <Routes>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/products' element={<ManageProducts />} />
          <Route path='/add-product' element={<AddProduct />} />
          <Route path='/update-product/:productId' element={<UpdateProduct />} />
          <Route path='/carousels' element={<ManageCarousel />} />
          <Route path='/orders' element={<ManageOrders />} />
          <Route path='/users' element={<ManageUsers />} />
          <Route path='/categories' element={<ManageCategories />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default AdminRoutes