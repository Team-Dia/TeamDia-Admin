import React, { useState } from 'react'
import SubMenu from '../SubMenu'
import jaxios from '../../util/jwtUtil'
import '../../style/admin.css' // CSS import 경로 확인
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' // SweetAlert2 라이브러리 import
import AdminLayout from '../AdminLayout'

const WriteProduct = () => {
  // 카테고리 목록 추가
  const categories = [
    { id: 1, name: '반지' },
    { id: 2, name: '목걸이' },
    { id: 3, name: '귀걸이' },
    { id: 4, name: '팔찌' },
  ]

  const [product, setProduct] = useState({
    categoryId: '',
    productName: '',
    productCostPrice: '',
    productSalePrice: '',
    productContent: '',
    productImage: '', // 파일 이름 (서버에 저장된 후)
    productImage2: '', // 파일 이름
    productImage3: '', // 파일 이름
    productImage4: '', // 파일 이름
    infoImage: '', // 파일 이름
    infoImage2: '', // 파일 이름
    infoImage3: '', // 파일 이름
    infoImage4: '', // 파일 이름
    infoImage5: '', // 파일 이름
    hoverImage: '', // 파일 이름
    productUse: 'Y',
    productBest: 'N',
    productStatus: '판매중',
    productMarginPrice: '',
  })

  // 이미지 미리보기 URL 상태 (FileReader 사용, base64)
  const [imgSrc, setImgSrc] = useState('')
  const [imgSrc2, setImgSrc2] = useState('')
  const [imgSrc3, setImgSrc3] = useState('')
  const [imgSrc4, setImgSrc4] = useState('')
  const [infoImgSrc, setInfoImgSrc] = useState('')
  const [infoImgSrc2, setInfoImgSrc2] = useState('')
  const [infoImgSrc3, setInfoImgSrc3] = useState('')
  const [infoImgSrc4, setInfoImgSrc4] = useState('')
  const [infoImgSrc5, setInfoImgSrc5] = useState('')
  const [hoverImgSrc, setHoverImgSrc] = useState('')

  const navigate = useNavigate()

  // 마진 계산 함수 (이전과 동일)
  const calculateMarginPrice = (costPrice, salePrice) => {
    const cost = Number(costPrice) || 0
    const sale = Number(salePrice) || 0
    return String(sale - cost)
  }

  const handleImageUpload = (e, fieldName, setImgSrc) => {
    const file = e.target.files[0]
    if (!file) {
      setImgSrc('') // 미리보기 제거
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB 제한
      alert('파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImgSrc(e.target.result) // *미리보기*: base64 데이터 URL 사용
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    // 키 값을 백엔드와 일치
    formData.append('image', file) // 키 값을 'image'로 통일

    jaxios
      .post(`/api/admin/product/upload${fieldName}`, formData, {
        // 동적 URL
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        console.log(`${fieldName} Upload Success:`, response.data)
        setProduct({ ...product, [fieldName]: response.data.savefilename }) // 파일이름 저장
      })
      .catch((error) => {
        //에러 세분화
        console.error(`${fieldName} Upload Fail:`, error)
        setImgSrc('') //업로드 실패시, 미리보기 제거
        if (error.response) {
          console.error(
            '서버 응답:',
            error.response.status,
            error.response.data,
          )
          alert(
            `파일 업로드 실패: ${error.response.status} - ${
              error.response.data.error ||
              error.response.data.message ||
              '알 수 없는 오류'
            }`,
          )
        } else if (error.request) {
          console.error('요청 에러:', error.request)
          alert('파일 업로드 실패: 서버와 연결할 수 없습니다.')
        } else {
          console.error('알 수 없는 에러:', error)
          alert('파일 업로드 실패: 알 수 없는 오류가 발생했습니다.')
        }
      })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProduct((prevProduct) => {
      const updatedProduct = { ...prevProduct, [name]: value }
      if (name === 'productCostPrice' || name === 'productSalePrice') {
        updatedProduct.productMarginPrice = calculateMarginPrice(
          name === 'productCostPrice' ? value : prevProduct.productCostPrice,
          name === 'productSalePrice' ? value : prevProduct.productSalePrice,
        )
      }
      return updatedProduct
    })
  }

  const handleRadioChange = (e) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }

  const onSubmit = (e) => {
    e.preventDefault() // 필수 필드 검사

    if (
      !product.categoryId ||
      isNaN(Number(product.categoryId)) ||
      !product.productName ||
      product.productName.trim() === '' ||
      !product.productCostPrice ||
      isNaN(Number(product.productCostPrice)) ||
      !product.productSalePrice ||
      isNaN(Number(product.productSalePrice)) ||
      Number(product.productSalePrice) < Number(product.productCostPrice) ||
      !product.productContent
    ) {
      // sweetalert2 경고 알림
      Swal.fire({
        icon: 'warning', // warning, error, success, info, question
        title: '입력 오류',
        text: '필수 입력 필드를 모두 채워주세요.',
      })
      return
    }

    jaxios
      .post('/api/admin/product/writeProduct', {
        ...product,
        productCostPrice: Number(product.productCostPrice),
        productSalePrice: Number(product.productSalePrice),
        productMarginPrice: Number(product.productMarginPrice),
        categoryId: Number(product.categoryId),
      })
      .then((response) => {
        if (response.status === 200) {
          // sweetalert2 성공 알림
          Swal.fire({
            icon: 'success',
            title: '성공',
            text: '상품이 등록되었습니다.',
          }).then(() => {
            // confirm 버튼 클릭 후 리다이렉션
            navigate('/productList')
          })
        } else {
          console.error('Failed to register product', response) // sweetalert2 실패 알림
          Swal.fire({
            icon: 'error',
            title: '등록 실패',
            text: '상품 등록에 실패했습니다.',
          })
        }
      })
      .catch((error) => {
        console.error('Error registering product:', error) // sweetalert2 오류 알림
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '상품 등록 중 오류가 발생했습니다.',
        })
      })
  }

  return (
    <AdminLayout>
      <div className="main-content">
        <h2>상품 등록</h2>
        <form onSubmit={onSubmit}>
          {/* 입력 필드 그룹 */}
          <div className="form-group">
            <label htmlFor="categoryId">카테고리</label>
            <select
              name="categoryId"
              id="categoryId"
              value={product.categoryId}
              onChange={handleInputChange}
              className="form-control category-select"
            >
              <option value="">카테고리 선택</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="productName">상품명</label>
            <input
              type="text"
              name="productName"
              id="productName"
              value={product.productName}
              onChange={handleInputChange}
              placeholder="상품명"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productCostPrice">원가</label>
            <input
              type="number"
              name="productCostPrice"
              id="productCostPrice"
              value={product.productCostPrice}
              onChange={handleInputChange}
              placeholder="원가"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productSalePrice">판매가</label>
            <input
              type="number"
              name="productSalePrice"
              id="productSalePrice"
              value={product.productSalePrice}
              onChange={handleInputChange}
              placeholder="판매가"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productMarginPrice">마진</label>
            <input
              type="text"
              name="productMarginPrice"
              id="productMarginPrice"
              value={product.productMarginPrice}
              readOnly
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productStatus">판매 상태</label>
            <select
              name="productStatus"
              id="productStatus"
              value={product.productStatus}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="판매중">판매중</option>
              <option value="판매중지">판매중지</option>
              <option value="품절">품절</option>
            </select>
          </div>
          <div className="form-group">
            <label>사용 유무</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="productUse"
                  value="Y"
                  checked={product.productUse === 'Y'}
                  onChange={handleRadioChange}
                />{' '}
                예
              </label>
              <label>
                <input
                  type="radio"
                  name="productUse"
                  value="N"
                  checked={product.productUse === 'N'}
                  onChange={handleRadioChange}
                />{' '}
                아니오
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>베스트 상품</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="productBest"
                  value="Y"
                  checked={product.productBest === 'Y'}
                  onChange={handleRadioChange}
                />{' '}
                예
              </label>
              <label>
                <input
                  type="radio"
                  name="productBest"
                  value="N"
                  checked={product.productBest === 'N'}
                  onChange={handleRadioChange}
                />{' '}
                아니오
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productContent">상품 설명</label>
            <textarea
              name="productContent"
              id="productContent"
              value={product.productContent}
              onChange={handleInputChange}
              rows="5"
              placeholder="상품 설명"
              className="form-control"
            ></textarea>
          </div>

          {/* 이미지 업로드 필드들 */}
          <div className="form-group">
            <label htmlFor="productImageInput">상품 이미지1</label>
            <input
              type="file"
              name="productImage"
              onChange={(e) => handleImageUpload(e, 'productImage', setImgSrc)}
              id="productImageInput"
            />
            {imgSrc && <img src={imgSrc} alt="미리보기" width="200" />}
          </div>
          <div className="form-group">
            <label htmlFor="productImage2Input">상품 이미지2</label>
            <input
              type="file"
              name="productImage2"
              onChange={(e) =>
                handleImageUpload(e, 'productImage2', setImgSrc2)
              }
              id="productImage2Input"
            />
            {imgSrc2 && <img src={imgSrc2} alt="미리보기2" width="200" />}
          </div>
          <div className="form-group">
            <label htmlFor="productImage3Input">상품 이미지3</label>
            <input
              type="file"
              name="productImage3"
              onChange={(e) =>
                handleImageUpload(e, 'productImage3', setImgSrc3)
              }
              id="productImage3Input"
            />
            {imgSrc3 && <img src={imgSrc3} alt="미리보기3" width="200" />}
          </div>
          <div className="form-group">
            <label htmlFor="productImage4Input">상품 이미지4</label>
            <input
              type="file"
              name="productImage4"
              onChange={(e) =>
                handleImageUpload(e, 'productImage4', setImgSrc4)
              }
              id="productImage4Input"
            />
            {imgSrc4 && <img src={imgSrc4} alt="미리보기4" width="200" />}
          </div>

          <div className="form-group">
            <label htmlFor="infoImageInput">상세 정보 이미지1</label>
            <input
              type="file"
              name="infoImage"
              onChange={(e) => handleImageUpload(e, 'infoImage', setInfoImgSrc)}
              id="infoImageInput"
            />
            {infoImgSrc && (
              <img src={infoImgSrc} alt="상세 정보 미리보기" width="200" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="infoImage2Input">상세 정보 이미지2</label>
            <input
              type="file"
              name="infoImage2"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage2', setInfoImgSrc2)
              }
              id="infoImage2Input"
            />
            {infoImgSrc2 && (
              <img src={infoImgSrc2} alt="상세 정보 미리보기2" width="200" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="infoImage3Input">상세 정보 이미지3</label>
            <input
              type="file"
              name="infoImage3"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage3', setInfoImgSrc3)
              }
              id="infoImage3Input"
            />
            {infoImgSrc3 && (
              <img src={infoImgSrc3} alt="상세 정보 미리보기3" width="200" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="infoImage4Input">상세 정보 이미지4</label>
            <input
              type="file"
              name="infoImage4"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage4', setInfoImgSrc4)
              }
              id="infoImage4Input"
            />
            {infoImgSrc4 && (
              <img src={infoImgSrc4} alt="상세 정보 미리보기4" width="200" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="infoImage5Input">상세 정보 이미지5</label>
            <input
              type="file"
              name="infoImage5"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage5', setInfoImgSrc5)
              }
              id="infoImage5Input"
            />
            {infoImgSrc5 && (
              <img src={infoImgSrc5} alt="상세 정보 미리보기5" width="200" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="hoverImageInput">hover 이미지</label>
            <input
              type="file"
              name="hoverImage"
              onChange={(e) =>
                handleImageUpload(e, 'hoverImage', setHoverImgSrc)
              }
              id="hoverImageInput"
            />
            {hoverImgSrc && (
              <img src={hoverImgSrc} alt="hover 이미지" width="200" />
            )}
          </div>
          <div className="btns">
            {/* 버튼들에 gold-gradient-button 클래스 적용 */}
            <button type="submit" className="gold-gradient-button">
              등 록
            </button>
            <button
              type="button"
              className="gold-gradient-button"
              onClick={() => navigate('/productList')}
            >
              뒤로
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default WriteProduct
