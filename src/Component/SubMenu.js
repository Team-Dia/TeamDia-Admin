// SubMenu.js
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import '../style/admin.css'

const SubMenu = () => {
  const location = useLocation()
  function onLogout() {
    document.cookie =
      'adminUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = 'http://localhost:3000/'
  }

  return (
    <div className="adminmenu">
      {' '}
      <NavLink
        to="/productList"
        className={({ isActive }) => {
          return location.pathname.startsWith('/productList') ||
            location.pathname.startsWith('/updateProduct') ||
            location.pathname.startsWith('/writeProduct') ||
            location.pathname.startsWith('/productView')
            ? 'active-link'
            : 'inactive-link'
        }}
      >
        PRODUCT
      </NavLink>
      <NavLink
        to="/orderList"
        className={({ isActive }) => {
          return location.pathname.startsWith('/orderList')
            ? 'active-link'
            : 'inactive-link'
        }}
      >
        ORDER
      </NavLink>
      <NavLink
        to="/memberList"
        className={({ isActive }) => {
          return location.pathname.startsWith('/memberList')
            ? 'active-link'
            : 'inactive-link'
        }}
      >
        MEMBER
      </NavLink>
      <NavLink
        to="/qnaList"
        className={({ isActive }) => {
          return location.pathname.startsWith('/qnaList') ||
            location.pathname.startsWith('/qnaView')
            ? 'active-link'
            : 'inactive-link'
        }}
      >
        Q & A
      </NavLink>
      {/* 로그아웃 버튼에 gold-gradient-button 클래스 적용 */}
      <button className="gold-gradient-button" onClick={onLogout}>
        LOGOUT
      </button>
    </div>
  )
}

export default SubMenu
