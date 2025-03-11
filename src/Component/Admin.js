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
    '/admin/loginAdmin',  // ✅ 백엔드 경로 수정
    { adminId: userid, adminPwd: pwd }, // ✅ 필드명 수정
    { withCredentials: true }
  )
  .then((response) => {
    console.log("로그인 응답 데이터:", response.data);

    if (response.data && response.data.accessToken && response.data.refreshToken) {
      let loginUser = {
        adminId: response.data.loginAdmin.adminId,
        adminName: response.data.loginAdmin.adminName,
        accessToken: response.data.accessToken, 
        refreshToken: response.data.refreshToken
      };

      dispatch(loginAction(loginUser));
      cookies.set("loginUser", loginUser, { path: "/" });

      console.log("로그인 성공! 쿠키 저장:", cookies.get("loginUser"));

      navigate('/productList');
    } else {
      console.error("로그인 응답에서 JWT가 누락됨", response.data);
      alert("로그인 실패: 서버에서 토큰을 받지 못했습니다.");
    }
  })
  .catch((error) => {
    console.error("로그인 요청 실패:", error);
    alert("로그인 실패: 네트워크 오류");
  });
  }, [userid, pwd, navigate])

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin()
  }

  return (
    <div className="admin-login-page">
      <form className="AdminForm" onSubmit={handleSubmit}>
        <div className="login-header">
          <h2>치원Admin님이 Login 하십니다</h2>
          <p className="login-subtitle">~~Welcome to Admin Dashboard~~</p>
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
