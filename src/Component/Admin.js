// Admin.js
import React, { useState, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../style/admin.css' // CSS import 확인
import { useDispatch, useSelector } from 'react-redux';
import { loginAction, logoutAction, fetchUserInfo } from '../store/userSlice';
import { Cookies } from 'react-cookie';

const Admin = () => {
  const [userid, setUserid] = useState('')
  const [pwd, setPwd] = useState('')
  const navigate = useNavigate()
  const dispatch= useDispatch();
  const cookies= new Cookies();
  

  const onLogin = useCallback(() => {
    if (!userid) {
      alert('Please enter your ID')
      return
    }
    if (!pwd) {
      alert('Please enter your password')
      return
    }
    console.log(userid)
    console.log(pwd)

    axios
      .post(
        '/api/member/loginLocal',null,
        {
           params:{
            username: userid,
            password: pwd,
          }, withCredentials: true
        },
      )
      .then((response) => {
        console.log(response.data);
        if ( response.data) {
          // document.cookie = `adminUser=${JSON.stringify(response.data.loginUser)}; path=/;`
          
          let loginUser = {
            memberId: response.data.memberId,
            memberName: response.data.memberName,
            memberEmail: response.data.memberEmail,
            memberPhone: response.data.memberPhone,
            memberAddress1: response.data.memberAddress1,
            memberAddress2: response.data.memberAddress2,
            memberAddress3: response.data.memberAddress3,
            roleNames: response.data.roleNames,
            // 추가적으로 필요한 값들
            accessToken: response.data.accessToken, // 응답에서 받은 accessToken
            refreshToken: response.data.refreshToken // 응답에서 받은 refreshToken
          };
          dispatch(loginAction(loginUser));
          cookies.set("loginUser", {
            ...loginUser,
            accessToken: response.data.accessToken, // 토큰을 쿠키에 저장
            refreshToken: response.data.refreshToken  // refreshToken도 저장
          }, { path: "/" });
          navigate('/productList')
        } 
      })
      .catch((error) => {
        let errorMessage = 'Error during login'
        if (error.response) {
          errorMessage =
            error.response.status === 401
              ? 'Invalid ID or password'
              : `Server error (${error.response.status}) - ${error.response.data}`
        } else if (error.request) {
          errorMessage = 'Login failed: Network error'
        }
        alert(`Login failed: ${errorMessage}`)
      })
  }, [userid, pwd, navigate])

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin()
  }

  return (
    <div className="admin-login-page">
      <form className="AdminForm" onSubmit={handleSubmit}>
        <div className="login-header">
          <h2>Admin Login</h2>
          <p className="login-subtitle">Welcome to Admin Dashboard</p>
        </div>
        <div className="login-body">
          <div className="field">
            <label htmlFor="adminId">Admin ID</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="adminId"
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
                placeholder="Enter your ID"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>
        <div className="btns">
          <button type="submit" className="gold-gradient-button">
            Login
          </button>
        </div>
      </form>
    </div>
  )
}

export default Admin
