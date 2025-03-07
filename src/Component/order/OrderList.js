import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import '../../style/OrderList.css'
import AdminLayout from '../AdminLayout'
import jaxios from '../../util/jwtUtil'

function OrderList() {
  const [orders, setOrders] = useState([])
  const [paging, setPaging] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchKey, setSearchKey] = useState('')
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([])
  const [beginEnd, setBeginEnd] = useState([])
  const [expandedOrderSeq, setExpandedOrderSeq] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // 드롭다운 토글 함수
  const handleDropdownToggle = (e, orderSeq) => {
    e.stopPropagation() // 이벤트 버블링 방지
    setOpenDropdownId(openDropdownId === orderSeq ? null : orderSeq)
  }

  // 주문 상태에 따른 배지 클래스
  const statusClass = {
    PENDING: 'status-pending',
    CONFIRMED: 'status-confirmed',
    SHIPPED: 'status-shipped',
    DELIVERED: 'status-delivered',
    CANCELED: 'status-canceled',
    RETURNED: 'status-returned',
    REFUNDED: 'status-refunded',

    '결제 대기': 'status-pending',
    '결제 완료': 'status-confirmed',
    '배송 중': 'status-shipped',
    '배송 완료': 'status-delivered',
    '주문 취소': 'status-canceled',
    '반품 처리': 'status-returned',
    '환불 처리': 'status-refunded',
  }

  // 드롭다운 메뉴에 표시할 상태 목록 (별도로 정의)
  const statusOptions = [
    { key: 'PENDING', label: '결제 대기' },
    { key: 'CONFIRMED', label: '결제 완료' },
    { key: 'SHIPPED', label: '배송 중' },
    { key: 'DELIVERED', label: '배송 완료' },
    { key: 'CANCELED', label: '주문 취소' },
    { key: 'RETURNED', label: '반품 처리' },
    { key: 'REFUNDED', label: '환불 처리' },
  ]

  // 인라인 상세보기 토글 함수
  const toggleOrderDetails = (orderSeq) => {
    if (expandedOrderSeq === orderSeq) {
      setExpandedOrderSeq(null) // 이미 열려있으면 닫기
    } else {
      setExpandedOrderSeq(orderSeq) // 닫혀있으면 열기
      fetchOrderDetails(orderSeq) // 상세 정보 가져오기
    }
  }

  // 주문 목록 조회
  const fetchOrders = useCallback(async (page = 1, key = '') => {
    try {
      const response = await jaxios.get(
        `/api/admin/getOrdersList?page=${page}&key=${key}`,
      )
      setOrders(response.data.ordersList)
      setPaging(response.data.paging)

      // 페이징 처리
      const newBeginEnd = []
      if (response.data.paging) {
        for (
          let i = response.data.paging.beginPage;
          i <= response.data.paging.endPage;
          i++
        ) {
          newBeginEnd.push(i)
        }
      }
      setBeginEnd(newBeginEnd)
    } catch (error) {
      console.error('주문 목록 조회 실패:', error)
    }
  }, [])

  // 주문 상세 조회
  const fetchOrderDetails = async (orderSeq) => {
    try {
      // 주문 상세 상품 목록 조회
      const detailsResponse = await jaxios.get(
        `/api/admin/getOrderDetails?orderSeq=${orderSeq}`,
      )
      setSelectedOrderDetails(detailsResponse.data.orderDetails)
      console.log(detailsResponse.data.orderDetails)
      // 주문 기본 정보 조회 추가
      const orderInfoResponse = await jaxios.get(
        `/api/admin/getOrderInfo?orderSeq=${orderSeq}`,
      )
      setSelectedOrder(orderInfoResponse.data)
    } catch (error) {
      console.error('주문 상세 조회 실패:', error)
    }
  }

  // 주문 상태 업데이트
  const updateOrderStatus = async (orderSeq, status) => {
    try {
      const response = await jaxios.post('/api/admin/updateOrderStatus', null, {
        params: {
          orderSeq: orderSeq,
          status: status,
        },
      })

      if (response.data.msg === 'ok') {
        fetchOrders(currentPage, searchKey)
      } else {
        alert('주문 상태 업데이트에 실패했습니다: ' + response.data.msg)
      }
    } catch (error) {
      console.error('주문 상태 업데이트 실패:', error)
      alert('주문 상태 업데이트에 실패했습니다.')
    }
  }

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchOrders(page, searchKey)
  }

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchOrders(1, searchKey)
  }

  // 검색어 입력 시 엔터키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    fetchOrders(currentPage, searchKey)
  }, [fetchOrders, currentPage])

  return (
    <AdminLayout>
      <div className="main-content">
        <h2>주문 관리</h2>

        {/* 검색 폼 */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="주문번호 또는 회원ID 검색"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="form-control search-input"
            onKeyDown={handleKeyDown}
          />
          <button className="action-button" onClick={handleSearch}>
            검색
          </button>
          <button
            className="action-button"
            onClick={() => {
              setSearchKey('')
              fetchOrders(1, '')
            }}
          >
            초기화
          </button>
        </div>

        {/* 주문 목록 테이블 */}
        <div className="table-container">
          <table className="admin-table order-table">
            <thead>
              <tr>
                <th width="10%">주문번호</th>
                <th width="12%">회원ID</th>
                <th width="18%">주문일자</th>
                <th width="12%">총 금액</th>
                <th width="12%">주문상태</th>
                <th width="20%">배송주소</th>
                <th width="16%">관리</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <React.Fragment key={order.orderSeq}>
                    <tr
                      className={
                        expandedOrderSeq === order.orderSeq ? 'active-row' : ''
                      }
                    >
                      <td className="order-id">{order.orderSeq}</td>
                      <td className="member-id">{order.memberId}</td>
                      <td className="order-date">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="price-cell">
                        ₩{' '}
                        {order.finalPrice
                          ? order.finalPrice.toLocaleString()
                          : '0'}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            order.orderStatus
                              ? statusClass[order.orderStatus]
                              : ''
                          }`}
                        >
                          {order.orderStatus || '상태 없음'}
                        </span>
                      </td>
                      <td className="address-cell">
                        <div className="address-wrapper">
                          {order.shippingAddress || '-'}
                        </div>
                      </td>
                      <td className="action-cell">
                        <button
                          className="detail-button"
                          onClick={() => toggleOrderDetails(order.orderSeq)}
                        >
                          {expandedOrderSeq === order.orderSeq
                            ? '접기'
                            : '상세보기'}
                        </button>
                        <div className="status-dropdown">
                          <button
                            className={`status-button ${
                              openDropdownId === order.orderSeq ? 'active' : ''
                            }`}
                            onClick={(e) =>
                              handleDropdownToggle(e, order.orderSeq)
                            }
                          >
                            상태변경
                          </button>
                          <div
                            className={`dropdown-content ${openDropdownId === order.orderSeq ? 'show' : ''}`}
                          >
                            {statusOptions.map(({ key, label }) => (
                              <a
                                key={key}
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  updateOrderStatus(order.orderSeq, key)
                                  setOpenDropdownId(null)
                                }}
                              >
                                {label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* 인라인 상세보기 */}
                    {expandedOrderSeq === order.orderSeq && (
                      <tr className="order-details-row">
                        <td colSpan="7">
                          <div className="order-details-container">
                            <div className="order-info-section">
                              <h3 className="section-title">주문 정보</h3>
                              <div className="order-info-grid">
                                <div className="info-group">
                                  <span className="info-label">주문번호</span>
                                  <span className="info-value">
                                    {order.orderSeq}
                                  </span>
                                </div>
                                <div className="info-group">
                                  <span className="info-label">주문일시</span>
                                  <span className="info-value">
                                    {order.orderDate
                                      ? new Date(
                                          order.orderDate,
                                        ).toLocaleString()
                                      : '-'}
                                  </span>
                                </div>
                                <div className="info-group">
                                  <span className="info-label">주문자</span>
                                  <span className="info-value">
                                    {order.memberId}
                                  </span>
                                </div>
                                <div className="info-group">
                                  <span className="info-label">연락처</span>
                                  <span className="info-value">
                                    {(selectedOrder && selectedOrder.phone) ||
                                      order.phone ||
                                      '-'}
                                  </span>
                                </div>
                                {/* 배송완료 날짜 추가 */}
                                {order.orderStatus === '배송 완료' && (
                                  <div className="info-group">
                                    <span className="info-label">
                                      배송완료 일시
                                    </span>
                                    <span className="info-value delivery-date">
                                      {order.deliveryDate
                                        ? new Date(
                                            order.deliveryDate,
                                          ).toLocaleString('ko-KR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : '-'}
                                    </span>
                                  </div>
                                )}
                                <div className="info-group">
                                  <span className="info-label">배송주소</span>
                                  <span className="info-value address-value">
                                    {order.shippingAddress || '-'}
                                  </span>
                                </div>
                                <div className="info-group">
                                  <span className="info-label">주문상태</span>
                                  <span
                                    className={`info-value status-value ${
                                      order.orderStatus
                                        ? statusClass[order.orderStatus]
                                        : ''
                                    }`}
                                  >
                                    {order.orderStatus || '상태 없음'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="order-products-section">
                              <h3 className="section-title">주문 상품 목록</h3>
                              <div className="order-products-table-wrapper">
                                <table className="order-products-table">
                                  <thead>
                                    <tr>
                                      <th>상품번호</th>
                                      <th>상품명</th>
                                      <th>옵션</th>
                                      <th>수량</th>
                                      <th>가격</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedOrderDetails.length > 0 ? (
                                      selectedOrderDetails.map(
                                        (item, index) => (
                                          <tr
                                            key={
                                              item.ordersDetailSeq ||
                                              `order-detail-${index}`
                                            }
                                          >
                                            <td>{item.productSeq || '-'}</td>
                                            <td className="product-name-cell">
                                              {item.productName ||
                                                '상품 정보 없음'}
                                            </td>
                                            <td>{item.sizeValue || '-'}</td>{' '}
                                            {/* 사이즈 값 표시 */}
                                            <td>{item.quantity || 0}</td>
                                            <td className="price-cell">
                                              ₩{' '}
                                              {item.price
                                                ? item.price.toLocaleString()
                                                : '0'}
                                            </td>
                                          </tr>
                                        ),
                                      )
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan="5"
                                          className="loading-cell"
                                        >
                                          <div className="loading-spinner"></div>
                                          <p>상세 정보를 불러오는 중...</p>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan="4" className="total-label">
                                        총 결제금액
                                      </td>
                                      <td className="total-value">
                                        ₩{' '}
                                        {selectedOrderDetails.length > 0
                                          ? selectedOrderDetails
                                              .reduce(
                                                (total, item) =>
                                                  total + item.price,
                                                0,
                                              )
                                              .toLocaleString()
                                          : '0'}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    <div className="empty-state">
                      <div className="empty-icon">🚚</div>
                      <p className="empty-title">
                        앗! 원하시는 주문내역을 찾지 못했어요
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
        </div>
        {/* 페이징 부분 수정 */}
        {paging && paging.totalCount > 0 && (
          <div id="paging">
            {paging.prev && (
              <span
                className="page-nav"
                onClick={() => handlePageChange(paging.prevPage)}
              >
                ◀
              </span>
            )}

            {beginEnd.map((page) => (
              <span
                key={page}
                className={`page-number ${
                  currentPage === page ? 'active' : ''
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </span>
            ))}

            {paging.next && (
              <span
                className="page-nav"
                onClick={() => handlePageChange(paging.nextPage)}
              >
                ▶
              </span>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default OrderList
