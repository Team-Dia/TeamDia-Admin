import React, { useState, useEffect } from 'react'
import '../../style/admin.css'
import { useNavigate, useParams } from 'react-router-dom'
import SubMenu from '../SubMenu'
import jaxios from '../../util/jwtUtil'

const QnaView = () => {
  const [qna, setQna] = useState(null)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { qnaSeq } = useParams()

  useEffect(() => {
    const fetchQna = async () => {
      try {
        setLoading(true)
        const result = await jaxios.get('/api/admin/getQna', {
          params: { qnaSeq },
        })
        setQna(result.data.qna)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQna()
  }, [qnaSeq])

  const writeReply = async () => {
    if (!reply.trim()) {
      alert('답변을 입력해주세요.')
      return
    }

    try {
      await jaxios.post('/api/admin/writeReply', null, {
        params: { reply, qnaSeq },
      })
      const result = await jaxios.get('/api/admin/getQna', {
        params: { qnaSeq },
      })
      setQna(result.data.qna)
      setReply('')
    } catch (err) {
      console.error(err)
      alert('답변 등록에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="adminContainer">
        <SubMenu />
        <div className="view-container qna-view">
          <div className="loading">데이터를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="adminContainer">
      <SubMenu />
      <div className="qna-container">
        <div className="qna-header">
          <h2>Q & A</h2>
        </div>
        {qna ? (
          <>
            <div className="qna-field">
              <label>번호</label>
              <div>{qna.qnaSeq}</div>
            </div>
            <div className="qna-field">
              <label>제목</label>
              <div>{qna.subject}</div>
            </div>
            <div className="qna-field">
              <label>작성자</label>
              <div>{qna?.memberId}</div>
            </div>
            <div className="qna-field">
              <label>내용</label>
              <div>{qna.content}</div>
            </div>
            <div className="qna-field">
              <label>작성일시</label>
              <div>{new Date(qna.inDate).toLocaleDateString()}</div>
            </div>
            <div className="reply-section">
              <label>답변</label>
              {qna.reply ? (
                <div>{qna.reply}</div>
              ) : (
                <div className="reply-input">
                  <textarea
                    placeholder="답변을 입력하세요"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button className="action-button" onClick={writeReply}>
                    답변 등록
                  </button>
                </div>
              )}
            </div>
            <div className="btns">
              <button
                className="gold-gradient-button"
                onClick={() => navigate('/qnaList')}
              >
                목록으로
              </button>
            </div>
          </>
        ) : (
          <div className="loading">데이터를 불러오는 중...</div>
        )}
      </div>
    </div>
  )
}

export default QnaView
