import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
// import SubMenu from '../SubMenu';
import '../../style/admin.css'
import jaxios from '../../util/jwtUtil'
import AdminLayout from '../AdminLayout'

const QnaList = () => {
  const navigate = useNavigate()
  const [key, setKey] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [qnaList, setQnaList] = useState([])
  const [paging, setPaging] = useState({})
  const [beginEnd, setBeginEnd] = useState([])
  const inputRef = useRef(null)

  const fetchQnaList = useCallback((page, currentSearchKeyword) => {
    jaxios
      .get('/api/admin/getQnaList', {
        params: { page: page, key: currentSearchKeyword },
      })
      .then((result) => {
        if (
          result &&
          result.data &&
          result.data.qnaList &&
          Array.isArray(result.data.qnaList) &&
          result.data.paging &&
          typeof result.data.paging === 'object' &&
          result.data.key !== undefined
        ) {
          setQnaList(result.data.qnaList)
          setPaging(result.data.paging)
          setKey(result.data.key || '')
          setSearchKeyword(result.data.key || '')

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
          alert('Failed to load QnA list. Invalid server response.')
        }
      })
      .catch((err) => {
        console.error('API request error:', err)
        alert('Failed to load QnA list. Network or server error occurred.')
      })
  }, [])

  useEffect(() => {
    fetchQnaList(1, '')
  }, [fetchQnaList])

  const onPageMove = (page) => {
    fetchQnaList(page, searchKeyword)
  }

  const handleSearch = () => {
    setSearchKeyword(key)
    fetchQnaList(1, key)
  }

  const handleInputChange = (e) => {
    setKey(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <AdminLayout>
      <div className="main-content">
        <h2>Q & A 관리</h2>

        <div className="search-bar">
          <input
            type="text"
            value={key}
            onChange={handleInputChange}
            placeholder="Search title"
            className="form-control search-input"
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
              <th>No</th>
              <th>Title</th>
              <th>Writer</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {qnaList.length > 0 ? (
              qnaList.map((qna) => (
                <tr key={qna.qnaSeq}>
                  <td>{qna.qnaSeq}</td>
                  <td
                    style={{ cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => navigate(`/qnaView/${qna.qnaSeq}`)}
                  >
                    {qna.subject}
                  </td>
                  <td>{qna.memberId}</td>
                  <td>{qna.reply ? 'Y' : 'N'}</td>
                  <td>{qna.inDate.substring(2, 10)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  <div className="empty-state">
                    <div className="empty-icon">❓</div>
                    <p className="empty-title">
                      앗! 원하시는 Q&A정보를 찾지 못했어요
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

export default QnaList
