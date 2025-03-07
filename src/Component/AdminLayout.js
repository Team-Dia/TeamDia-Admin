// AdminLayout.js
import React from 'react'
import SubMenu from './SubMenu'

const AdminLayout = ({ children }) => {
  return (
    <div className="adminContainer">
           {' '}
      <div className="brand-logo">
                <img src="/images/logo2.png" alt="Diamondz 로고" />     {' '}
      </div>
            <SubMenu />      {children}   {' '}
    </div>
  )
}

export default AdminLayout
