// App.js
import React from 'react'
import { Routes, Route } from 'react-router-dom' // ✅ BrowserRouter as Router 제거, Routes 와 Route 유지
import Admin from './Component/Admin'
import ProductList from './Component/product/ProductList'
import WriteProduct from './Component/product/WriteProduct'
import ProductView from './Component/product/ProductView'
import UpdateProduct from './Component/product/UpdateProduct'
import OrderList from './Component/order/OrderList'
import MemberList from './Component/member/MemberList'
import QnaList from './Component/qna/QnaList'
import QnaView from './Component/qna/QnaView'
import { Navigate } from 'react-router-dom' // import

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/productList" element={<ProductList />} />
        <Route path="/writeProduct" element={<WriteProduct />} />
        <Route path="/productView/:productSeq" element={<ProductView />} />
        <Route path="/updateProduct/:productSeq" element={<UpdateProduct />} />
        <Route path="/orderList" element={<OrderList />} />
        <Route path="/memberList" element={<MemberList />} />
        <Route path="/qnaList" element={<QnaList />} />
        <Route path="/qnaView/:qnaSeq" element={<QnaView />} />
      </Routes>
    </div>
  )
}

export default App
