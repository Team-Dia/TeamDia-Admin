import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SubMenu from '../SubMenu'
import '../../style/admin.css'
import jaxios from '../../util/jwtUtil'
import AdminLayout from '../AdminLayout'

const ProductList = () => {
  const navigate = useNavigate()
  const [key, setKey] = useState('') // input 값 (실시간 반영)
  const [searchKeyword, setSearchKeyword] = useState('') // 검색 요청 시 사용될 검색어
  const [productList, setProductList] = useState([])
  const [paging, setPaging] = useState({})
  const [beginEnd, setBeginEnd] = useState([])
  const inputRef = useRef(null) // input ref 생성

  const fetchProductList = useCallback((page, currentSearchKeyword) => {
    jaxios
      .get('/api/admin/product/getProductList', {
        params: { page: page, key: currentSearchKeyword },
      })
      .then((result) => {
        if (
          result &&
          result.data &&
          result.data.productList &&
          Array.isArray(result.data.productList) &&
          result.data.paging &&
          typeof result.data.paging === 'object' &&
          result.data.key !== undefined
        ) {
          setProductList(result.data.productList)
          setPaging(result.data.paging)
          setKey(result.data.key || '')
          setSearchKeyword(result.data.key || '') // 검색 완료 후 searchKeyword 업데이트 (for 페이지 이동 시 검색어 유지)

          const newBeginEnd = []
          for (
            let i = result.data.paging.beginPage;
            i <= result.data.paging.endPage;
            i++
          ) {
            newBeginEnd.push(i)
          }
          setBeginEnd(newBeginEnd)
        } else {
          console.error('Invalid API response:', result)
          alert(
            '상품 목록을 불러오는 데 실패했습니다. 서버 응답이 올바르지 않습니다.',
          )
        }
      })
      .catch((err) => {
        console.error('API 요청 에러:', err)
        alert(
          '상품 목록을 불러오는 데 실패했습니다. 네트워크 오류 또는 서버 오류가 발생했습니다.',
        )
      })
  }, [])

  useEffect(() => {
    fetchProductList(1, '') // 처음 로드 시 첫 페이지 데이터 가져오기 (전체 목록)
  }, [fetchProductList])

  const onPageMove = (page) => {
    fetchProductList(page, searchKeyword) // 페이지 이동 시 현재 검색어 유지
  }

  const handleSearch = () => {
    setSearchKeyword(key) // 검색 버튼 클릭 시 key 값을 searchKeyword 로 업데이트 (검색 요청 트리거)
    fetchProductList(1, key) // 변경된 key 로 검색
  }

  const handleInputChange = (e) => {
    setKey(e.target.value) // input 값 변경 시 key 상태 업데이트 (실시간 반영)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch() // Enter 키 입력 시 검색 실행
    }
  }

  return (
    <AdminLayout>
      <div className="main-content">
        <h2>상품 관리</h2>
        {/* 검색창 및 상품등록 버튼 */}
        <div className="search-bar">
          <input
            type="text"
            value={key}
            onChange={handleInputChange}
            placeholder="Search product"
            className="form-control search-input"
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <button
            className="action-button"
            onClick={() => navigate('/writeProduct')}
          >
            상품등록
          </button>
        </div>

        {/* 상품 목록 테이블 */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>상품명</th>
              <th>원가</th>
              <th>판매가</th>
              <th>등록일</th>
              <th>사용 유무</th>
              <th>베스트 상품</th>
              <th>판매 상태</th>
            </tr>
          </thead>
          <tbody>
            {productList.length > 0 ? (
              productList.map((product) => (
                <tr key={product.productSeq}>
                  <td>{product.productSeq}</td>
                  {/*클릭시 상품상세 페이지로 이동*/}
                  <td
                    style={{ cursor: 'pointer', textAlign: 'left' }}
                    onClick={() =>
                      navigate(`/productView/${product.productSeq}`)
                    }
                  >
                    {product.productName}
                  </td>
                  <td>
                    ￦{' '}
                    {new Intl.NumberFormat('ko-KR').format(
                      product.productCostPrice,
                    )}
                  </td>
                  <td>
                    ￦{' '}
                    {new Intl.NumberFormat('ko-KR').format(
                      product.productSalePrice,
                    )}
                  </td>
                  <td>
                    {product.indate ? product.indate.substring(0, 10) : ''}
                  </td>
                  <td>{product.productUse}</td>
                  <td>{product.productBest}</td>
                  <td>{product.productStatus}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <p className="empty-title">
                      앗! 원하시는 상품정보를 찾지 못했어요
                    </p>
                    <div className="empty-tips">
                      <span>✨ 다른 키워드로 검색해볼까요?</span>
                      <span>🔍 철자가 정확한지 살펴보세요!</span>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 페이징 */}
        <div id="paging">
          {paging.prev && (
            <span
              className="page-nav"
              onClick={() => onPageMove(paging.beginPage - 1)}
            >
              ◀
            </span>
          )}

          {beginEnd.map((page) => (
            <span
              key={page}
              className={`page-number ${page === paging.page ? 'active' : ''}`}
              onClick={() => onPageMove(page)}
            >
              {page}
            </span>
          ))}

          {paging.next && (
            <span
              className="page-nav"
              onClick={() => onPageMove(paging.endPage + 1)}
            >
              ▶
            </span>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default ProductList
