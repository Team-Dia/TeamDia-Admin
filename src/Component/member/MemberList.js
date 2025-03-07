import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SubMenu from '../SubMenu'
import '../../style/admin.css'
import jaxios from '../../util/jwtUtil'
import dayjs from 'dayjs'
import AdminLayout from '../AdminLayout'

const MemberList = () => {
  const navigate = useNavigate()
  const [key, setKey] = useState('') // input 값 (실시간 반영)
  const [searchKeyword, setSearchKeyword] = useState('') // 검색 요청 시 사용될 검색어
  const [memberList, setMemberList] = useState([])
  const [paging, setPaging] = useState({})
  const [beginEnd, setBeginEnd] = useState([])
  const inputRef = useRef(null) // input ref 생성

  // 정렬 상태 추가
  const [sortField, setSortField] = useState('inDate')
  const [sortOrder, setSortOrder] = useState('desc')

  const fetchMemberList = useCallback(
    (page, currentSearchKeyword) => {
      jaxios
        .get('/api/admin/member/getMemberList', {
          params: {
            page: page,
            key: currentSearchKeyword,
            sortField: sortField,
            sortOrder: sortOrder,
          },
        })
        .then((result) => {
          if (
            result &&
            result.data &&
            result.data.memberList &&
            Array.isArray(result.data.memberList) &&
            result.data.paging &&
            typeof result.data.paging === 'object' &&
            result.data.key !== undefined
          ) {
            setMemberList(result.data.memberList)
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
              '회원 목록을 불러오는 데 실패했습니다. 서버 응답이 올바르지 않습니다.',
            )
          }
        })
        .catch((err) => {
          console.error('API 요청 에러:', err)
          alert(
            '회원 목록을 불러오는 데 실패했습니다. 네트워크 오류 또는 서버 오류가 발생했습니다.',
          )
        })
    },
    [sortField, sortOrder],
  )

  useEffect(() => {
    fetchMemberList(1, '') // 컴포넌트 마운트 시 전체 목록 조회
  }, [fetchMemberList])

  // 정렬 처리 함수 추가
  const handleSort = (field) => {
    if (field === sortField) {
      // 같은 필드를 다시 클릭하면 정렬 방향 전환
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // 다른 필드를 클릭하면 해당 필드로 정렬하고 기본 정렬 방향은 내림차순
      setSortField(field)
      setSortOrder('desc')
    }

    // 현재 페이지에서 정렬된 데이터 다시 가져오기
    fetchMemberList(paging.page || 1, searchKeyword)
  }

  const onPageMove = (page) => {
    fetchMemberList(page, searchKeyword) // 페이지 이동 시 현재 검색어 유지
  }

  const handleSearch = () => {
    setSearchKeyword(key) // 검색 버튼 클릭 시 key 값을 searchKeyword 로 업데이트 (검색 요청 트리거)
    fetchMemberList(1, key) // 변경된 key 로 검색
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
        <h2>회원 관리</h2>

        <div className="search-bar">
          <input
            type="text"
            className="form-control search-input"
            value={key}
            onChange={handleInputChange}
            placeholder="Search name"
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <button className="action-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('memberId')}
                style={{ cursor: 'pointer' }}
              >
                ID{' '}
                {sortField === 'memberId' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('memberName')}
                style={{ cursor: 'pointer' }}
              >
                Name{' '}
                {sortField === 'memberName' &&
                  (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('memberPhone')}
                style={{ cursor: 'pointer' }}
              >
                Phone{' '}
                {sortField === 'memberPhone' &&
                  (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('memberEmail')}
                style={{ cursor: 'pointer' }}
              >
                Email{' '}
                {sortField === 'memberEmail' &&
                  (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Address</th>
              <th
                onClick={() => handleSort('inDate')}
                style={{ cursor: 'pointer' }}
              >
                가입일{' '}
                {sortField === 'inDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('memberBirthdate')}
                style={{ cursor: 'pointer' }}
              >
                생년월일{' '}
                {sortField === 'memberBirthdate' &&
                  (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {memberList && memberList.length > 0 ? (
              memberList.map((member) => (
                <tr key={member.memberId}>
                  <td>{member.memberId}</td>
                  <td>{member.memberName}</td>
                  <td>{member.memberPhone}</td>
                  <td data-full-text={member.memberEmail}>
                    {member.memberEmail}
                  </td>
                  <td
                    style={{ textAlign: 'left' }}
                    data-full-text={`${member.memberAddress1} ${member.memberAddress2} ${member.memberAddress3}`}
                  >
                    {member.memberAddress1} {member.memberAddress2}{' '}
                    {member.memberAddress3}
                  </td>
                  <td>
                    {member.inDate
                      ? dayjs(member.inDate).format('YYYY-MM-DD')
                      : ''}
                  </td>
                  <td>
                    {member.memberBirthdate
                      ? dayjs(member.memberBirthdate).format('YYYY-MM-DD')
                      : ''}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  <div className="empty-state">
                    <div className="empty-icon">👪</div>
                    <p className="empty-title">
                      앗! 원하시는 회원정보를 찾지 못했어요
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

export default MemberList
