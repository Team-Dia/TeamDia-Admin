// import { createSlice } from '@reduxjs/toolkit'
// import { Cookies } from 'react-cookie'
// const cookies = new Cookies()

// const initialState = {
//   userid: '',
//   pwd: '',
//   name: '',
//   email: '',
//   phone: '',
//   zip_num: '',
//   address1: '',
//   address2: '',
//   address3: '',
//   indate: '',
//   provider: '',
// }

// const getLoginUser = () => {
//   const memberinfo = cookies.get('user')
//   if (memberinfo && memberinfo.userid) {
//     memberinfo.pwd = decodeURIComponent(memberinfo.pwd)
//     memberinfo.userid = decodeURIComponent(memberinfo.userid)
//     memberinfo.name = decodeURIComponent(memberinfo.name)
//     memberinfo.email = decodeURIComponent(memberinfo.email)
//     memberinfo.phone = decodeURIComponent(memberinfo.phone)
//     memberinfo.zip_num = decodeURIComponent(memberinfo.zip_num)
//     memberinfo.address1 = decodeURIComponent(memberinfo.address1)
//     memberinfo.address2 = decodeURIComponent(memberinfo.address2)
//     memberinfo.address3 = decodeURIComponent(memberinfo.address3)
//     memberinfo.indate = decodeURIComponent(memberinfo.indate)
//     memberinfo.provider = decodeURIComponent(memberinfo.provider)
//   }
//   return memberinfo
// }
// export const userSlice = createSlice({
//   name: 'user',
//   initialState: getLoginUser() || initialState,
//   reducers: {
//     loginAction: (state, action) => {
//       state.userid = action.payload.userid
//       state.pwd = action.payload.pwd
//       state.name = action.payload.name
//       state.email = action.payload.email
//       state.phone = action.payload.phone
//       state.zip_num = action.payload.zip_num
//       state.address1 = action.payload.address1
//       state.address2 = action.payload.address2
//       state.address3 = action.payload.address3
//       state.indate = action.payload.indate
//       state.provider = action.payload.provider
//     },
//     logoutAction: (state) => {
//       state.userid = ''
//       state.pwd = ''
//       state.name = ''
//       state.email = ''
//       state.phone = ''
//       state.zip_num = ''
//       state.address1 = ''
//       state.address2 = ''
//       state.address3 = ''
//       state.indate = ''
//       state.provider = ''
//     },
//   },
// })

// export const { loginAction, logoutAction } = userSlice.actions
// export default userSlice.reducer
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Cookies } from "react-cookie";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";  // 🔹 localStorage 사용

const cookies = new Cookies()

const persistConfig = {
    key: "user",
    storage,
};

// ✅ 사용자 정보 가져오기 (Thunk)
export const fetchUserInfo = createAsyncThunk(
    "user/fetchUserInfo",
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        if (state.user.memberId) return state.user;  // ✅ 기존 Redux 상태가 있으면 API 호출하지 않음

        try {
            const response = await axios.get("/api/member/userinfo", {
                withCredentials: true,  // ✅ 쿠키 포함하여 요청
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "API 호출 실패");
        }
    }
);


export const fetchOrders = createAsyncThunk(
    "user/fetchOrders",
    async ({ memberId, page = 0, size = 10 }, thunkAPI) => {
        if (!memberId) {
            console.error("❌ memberId가 없음. API 요청 중단");
            return thunkAPI.rejectWithValue("memberId가 없습니다.");
        }

        try {
            const apiUrl = `/api/orders/history/${memberId}?page=${page}&size=${size}`;
            console.log("📡 주문 내역 API 요청:", apiUrl); // ✅ 요청 URL 확인

            const response = await axios.get(apiUrl);

            console.log("✅ API 응답:", response.data); // ✅ 응답 확인

            if (!Array.isArray(response.data)) {
                console.error("🚨 API 응답이 배열이 아님:", response.data);
                return thunkAPI.rejectWithValue("올바른 데이터 형식이 아닙니다.");
            }

            return response.data;
        } catch (error) {
            console.error("🚨 주문 데이터 불러오기 실패:", error.response?.data || error.message);
            return thunkAPI.rejectWithValue("API 호출 실패");
        }
    }
);




// ✅ 초기 상태
const initialState = {
    memberId: "",
    memberPwd: "",
    memberName: "",
    memberBirthdate: "",  // ✅ 생년월일 추가
    memberPhone: "",
    memberEmail: "",
    zipNum: "",
    memberAddress1: "",
    memberAddress2: "",
    memberAddress3: "",
    memberPoints: "",
    inDate: "",
    provider: "",
    roleNames: [],
    accessToken:'',
    refreshToken:'',
    recentOrders: [],
    loading: false,
    error: null
};



// ✅ Redux Slice
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginAction: (state, action) => {
            let payload = action.payload;
        
            if (!payload || typeof payload !== "object") {
                console.error("❌ Redux 오류: 잘못된 로그인 데이터", payload);
                return;
            }
        
            if (payload?.loginUser) {
                payload = payload.loginUser;
            }
        
            if (!payload.memberId && !payload.kakaoId) {
                console.warn("⚠️ [loginAction] 유효하지 않은 로그인 데이터:", payload);
                return;
            }
        
            console.log("✅ Redux 상태 업데이트: ", payload);
        
            Object.assign(state, {
                ...payload,
                memberBirthdate: payload.memberBirthdate ?? null,
                provider: payload.provider || state.provider,
                accessToken: payload.accessToken,  // ✅ 로그인 후 accessToken 저장
            });
        
            cookies.set("loginUser", state, { path: "/" });
        },
        
        
        logoutAction: (state) => {
            cookies.remove("loginUser", { path: "/" });
        
            console.log("🔴 로그아웃 실행 - Redux 상태 초기화");
            
            Object.assign(state, {
                ...initialState,  // ✅ 안전한 초기 상태 유지
                recentOrders: [], // ✅ 추가적으로 초기화해야 할 상태 포함
                error: null,      // ✅ 오류 상태 초기화
                loading: false    // ✅ 로딩 상태 초기화
            });
        },
        

        setOrders: (state, action) => {
            state.recentOrders = action.payload;
        },

        updateBirthdate: (state, action) => {
            state.memberBirthdate = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                console.log("🟢 API 응답 데이터:", action.payload);
            
                Object.assign(state, {
                    ...action.payload,
                    memberBirthdate: action.payload.memberBirthdate ?? null
                });
            
                console.log("🟢 Redux 업데이트된 상태:", state);
            })
        
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // ✅ Redux 상태 업데이트 코드 수정
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.recentOrders = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "API 호출 실패";
                state.recentOrders = [];  // ✅ 오류 발생 시 주문 내역 초기화
            })
            
    },
});

// ✅ 액션 및 리듀서 내보내기

export default persistReducer(persistConfig, userSlice.reducer);
export const { loginAction, logoutAction, setOrders, updateBirthdate } = userSlice.actions;

