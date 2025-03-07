import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import AdminLayout from '../AdminLayout'
import jaxios from '../../util/jwtUtil'
import '../../style/admin.css'

const UpdateProduct = () => {
  const { productSeq } = useParams()
  const navigate = useNavigate() // 상품 관련 상태 및 카테고리 목록 (WriteProduct.js와 유사한 구조)

  const [product, setProduct] = useState({})
  const [categories, setCategories] = useState([
    { id: 1, name: '반지' },
    { id: 2, name: '목걸이' },
    { id: 3, name: '귀걸이' },
    { id: 4, name: '팔찌' },
  ]) // 이미지 미리보기 URL 상태

  const [imgSrc, setImgSrc] = useState('')
  const [imgSrc2, setImgSrc2] = useState('')
  const [imgSrc3, setImgSrc3] = useState('')
  const [imgSrc4, setImgSrc4] = useState('')
  const [infoImgSrc, setInfoImgSrc] = useState('')
  const [infoImgSrc2, setInfoImgSrc2] = useState('')
  const [infoImgSrc3, setInfoImgSrc3] = useState('')
  const [infoImgSrc4, setInfoImgSrc4] = useState('')
  const [infoImgSrc5, setInfoImgSrc5] = useState('')
  const [hoverImgSrc, setHoverImgSrc] = useState('') // 마진 계산 함수 (원가와 판매가의 차이를 자동으로 계산)

  const calculateMarginPrice = (costPrice, salePrice) => {
    const cost = Number(costPrice) || 0
    const sale = Number(salePrice) || 0
    return String(sale - cost)
  } // 이미지 업로드 핸들러 (파일 크기 제한 및 미리보기 기능 포함)

  const handleImageUpload = (e, fieldName, setImgSrcState) => {
    const file = e.target.files[0]
    if (!file) {
      setImgSrcState('')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImgSrcState(e.target.result)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('image', file)

    jaxios
      .post(`/api/admin/product/upload${fieldName}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        console.log(`${fieldName} Upload Success:`, response.data)
        setProduct((prev) => ({
          ...prev,
          [fieldName]: response.data.savefilename,
        }))
      })
      .catch((error) => {
        console.error(`${fieldName} Upload Fail:`, error)
        setImgSrcState('')
        let errorMessage = '파일 업로드 실패: 알 수 없는 오류가 발생했습니다.'
        if (error.response) {
          errorMessage = `파일 업로드 실패: ${error.response.status} - ${
            error.response.data.error ||
            error.response.data.message ||
            '알 수 없는 오류'
          }`
        } else if (error.request) {
          errorMessage = '파일 업로드 실패: 서버와 연결할 수 없습니다.'
        }
        Swal.fire({
          icon: 'error',
          title: '파일 업로드 실패',
          text: errorMessage,
        })
      })
  } // 입력 값 변경 처리 (마진 자동 계산 포함)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProduct((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'productCostPrice' || name === 'productSalePrice') {
        updated.productMarginPrice = calculateMarginPrice(
          name === 'productCostPrice' ? value : prev.productCostPrice,
          name === 'productSalePrice' ? value : prev.productSalePrice,
        )
      }
      return updated
    })
  } // 라디오 버튼 변경 처리

  const handleRadioChange = (e) => {
    const { name, value } = e.target
    setProduct((prev) => ({ ...prev, [name]: value }))
  } // 상품 정보를 페이지 로드 시 불러오기 (기존 이미지 미리보기 설정 포함)

  useEffect(() => {
    jaxios
      .get(`/api/admin/product/${productSeq}`)
      .then((response) => {
        if (response.status === 200) {
          setProduct(response.data)
          const defaultImageUrl = '/default_image.png' // 서버 기본 이미지 URL

          setImgSrc(
            response.data.productImage &&
              response.data.productImage !== defaultImageUrl
              ? `/product_images/${response.data.productImage}`
              : '',
          )
          setImgSrc2(
            response.data.productImage2 &&
              response.data.productImage2 !== defaultImageUrl
              ? `/product_images/${response.data.productImage2}`
              : '',
          )
          setImgSrc3(
            response.data.productImage3 &&
              response.data.productImage3 !== defaultImageUrl
              ? `/product_images/${response.data.productImage3}`
              : '',
          )
          setImgSrc4(
            response.data.productImage4 &&
              response.data.productImage4 !== defaultImageUrl
              ? `/product_images/${response.data.productImage4}`
              : '',
          )
          setInfoImgSrc(
            response.data.infoImage &&
              response.data.infoImage !== defaultImageUrl
              ? `/product_infoimages/${response.data.infoImage}`
              : '',
          )
          setInfoImgSrc2(
            response.data.infoImage2 &&
              response.data.infoImage2 !== defaultImageUrl
              ? `/product_infoimages/${response.data.infoImage2}`
              : '',
          )
          setInfoImgSrc3(
            response.data.infoImage3 &&
              response.data.infoImage3 !== defaultImageUrl
              ? `/product_infoimages/${response.data.infoImage3}`
              : '',
          )
          setInfoImgSrc4(
            response.data.infoImage4 &&
              response.data.infoImage4 !== defaultImageUrl
              ? `/product_infoimages/${response.data.infoImage4}`
              : '',
          )
          setInfoImgSrc5(
            response.data.infoImage5 &&
              response.data.infoImage5 !== defaultImageUrl
              ? `/product_infoimages/${response.data.infoImage5}`
              : '',
          )
          setHoverImgSrc(
            response.data.hoverImage &&
              response.data.hoverImage !== defaultImageUrl
              ? `/product_hover/${response.data.hoverImage}`
              : '',
          )
        } else {
          Swal.fire({
            icon: 'error',
            title: '불러오기 실패',
            text: '상품 정보를 불러오는 데 실패했습니다.',
          })
        }
      })
      .catch((error) => {
        console.error('Error fetching product:', error)
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '상품 정보를 불러오는 중 오류가 발생했습니다.',
        })
      })
  }, [productSeq])

  const onUpdateSubmit = (e) => {
    e.preventDefault()
    if (!product.categoryId || product.categoryId === '') {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '카테고리를 선택해주세요.',
      })
      return
    }

    jaxios
      .put(`/api/admin/product/${productSeq}`, {
        ...product,
        productCostPrice: Number(product.productCostPrice),
        productSalePrice: Number(product.productSalePrice),
        productMarginPrice: Number(product.productMarginPrice),
        categoryId: Number(product.categoryId),
      })
      .then((response) => {
        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: '성공',
            text: '상품 정보가 수정되었습니다.',
          }).then(() => {
            navigate(`/productView/${productSeq}`)
          })
          setProduct(response.data)
        } else {
          Swal.fire({
            icon: 'error',
            title: '수정 실패',
            text: '상품 정보 수정에 실패했습니다.',
          })
        }
      })
      .catch((error) => {
        console.error('Error updating product:', error)
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '상품 정보 수정 중 오류가 발생했습니다.',
        })
      })
  } // 수정 취소 시 확인 후 이전 페이지로 이동

  const handleCancel = () => {
    Swal.fire({
      title: '수정 취소',
      text: '상품 수정을 취소하고 이전 페이지로 돌아가시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '네',
      cancelButtonText: '아니오',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/productView/${productSeq}`)
      }
    })
  }

  return (
    <AdminLayout>
           {' '}
      <div className="main-content">
                <h2>상품 수정</h2>       {' '}
        <form onSubmit={onUpdateSubmit}>
                   {' '}
          <div className="form-group">
                        <label htmlFor="categoryId">카테고리</label>           {' '}
            <select
              name="categoryId"
              id="categoryId"
              value={product.categoryId || ''}
              onChange={handleInputChange}
              className="form-control category-select"
            >
                            <option value="">카테고리 선택</option>             {' '}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                                    {cat.name}               {' '}
                </option>
              ))}
                         {' '}
            </select>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label htmlFor="productName">상품명</label>           {' '}
            <input
              type="text"
              name="productName"
              id="productName"
              className="form-control"
              value={product.productName || ''}
              onChange={handleInputChange}
              placeholder="상품명을 입력하세요"
            />
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label htmlFor="productCostPrice">원가</label>         
             {' '}
            <input
              type="number"
              name="productCostPrice"
              id="productCostPrice"
              className="form-control"
              value={product.productCostPrice || ''}
              onChange={handleInputChange}
              placeholder="원가를 입력하세요"
            />
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label htmlFor="productSalePrice">판매가</label>       
               {' '}
            <input
              type="number"
              name="productSalePrice"
              id="productSalePrice"
              className="form-control"
              value={product.productSalePrice || ''}
              onChange={handleInputChange}
              placeholder="판매가를 입력하세요"
            />
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label htmlFor="productMarginPrice">마진</label>       
               {' '}
            <input
              type="text"
              name="productMarginPrice"
              id="productMarginPrice"
              className="form-control"
              value={product.productMarginPrice || ''}
              readOnly
            />
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label htmlFor="productStatus">판매 상태</label>       
               {' '}
            <select
              name="productStatus"
              id="productStatus"
              className="form-control"
              value={product.productStatus || ''}
              onChange={handleInputChange}
            >
                            <option value="판매중">판매중</option>             {' '}
              <option value="판매중지">판매중지</option>             {' '}
              <option value="품절">품절</option>           {' '}
            </select>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>사용 유무</label>           {' '}
            <div className="radio-group">
                           {' '}
              <label>
                               {' '}
                <input
                  type="radio"
                  name="productUse"
                  value="Y"
                  checked={product.productUse === 'Y'}
                  onChange={handleRadioChange}
                />{' '}
                                예              {' '}
              </label>
                           {' '}
              <label>
                               {' '}
                <input
                  type="radio"
                  name="productUse"
                  value="N"
                  checked={product.productUse === 'N'}
                  onChange={handleRadioChange}
                />{' '}
                                아니오              {' '}
              </label>
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>베스트 상품</label>           {' '}
            <div className="radio-group">
                           {' '}
              <label>
                               {' '}
                <input
                  type="radio"
                  name="productBest"
                  value="Y"
                  checked={product.productBest === 'Y'}
                  onChange={handleRadioChange}
                />{' '}
                                예              {' '}
              </label>
                           {' '}
              <label>
                               {' '}
                <input
                  type="radio"
                  name="productBest"
                  value="N"
                  checked={product.productBest === 'N'}
                  onChange={handleRadioChange}
                />{' '}
                                아니오              {' '}
              </label>
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label htmlFor="productContent">상품 설명</label>       
               {' '}
            <textarea
              name="productContent"
              id="productContent"
              className="form-control"
              value={product.productContent || ''}
              onChange={handleInputChange}
              rows="5"
              placeholder="상품 설명을 입력하세요"
            ></textarea>
                     {' '}
          </div>
                    {/* 이미지 업로드 필드 */}         {' '}
          <div className="form-group">
                        <label>상품 이미지1</label>           {' '}
            <input
              type="file"
              name="productImage"
              id="productImageInput"
              onChange={(e) => handleImageUpload(e, 'productImage', setImgSrc)}
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {imgSrc ? (
                <img src={imgSrc} alt="상품 이미지1 미리보기" width="200" />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상품 이미지2</label>           {' '}
            <input
              type="file"
              name="productImage2"
              id="productImage2Input"
              onChange={(e) =>
                handleImageUpload(e, 'productImage2', setImgSrc2)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {imgSrc2 ? (
                <img src={imgSrc2} alt="상품 이미지2 미리보기" width="200" />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상품 이미지3</label>           {' '}
            <input
              type="file"
              name="productImage3"
              id="productImage3Input"
              onChange={(e) =>
                handleImageUpload(e, 'productImage3', setImgSrc3)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {imgSrc3 ? (
                <img src={imgSrc3} alt="상품 이미지3 미리보기" width="200" />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상품 이미지4</label>           {' '}
            <input
              type="file"
              name="productImage4"
              id="productImage4Input"
              onChange={(e) =>
                handleImageUpload(e, 'productImage4', setImgSrc4)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {imgSrc4 ? (
                <img src={imgSrc4} alt="상품 이미지4 미리보기" width="200" />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상세 정보 이미지1</label>           {' '}
            <input
              type="file"
              name="infoImage"
              id="infoImageInput"
              onChange={(e) => handleImageUpload(e, 'infoImage', setInfoImgSrc)}
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {infoImgSrc ? (
                <img src={infoImgSrc} alt="상세 이미지1 미리보기" width="200" />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상세 정보 이미지2</label>           {' '}
            <input
              type="file"
              name="infoImage2"
              id="infoImage2Input"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage2', setInfoImgSrc2)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {infoImgSrc2 ? (
                <img
                  src={infoImgSrc2}
                  alt="상세 이미지2 미리보기"
                  width="200"
                />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상세 정보 이미지3</label>           {' '}
            <input
              type="file"
              name="infoImage3"
              id="infoImage3Input"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage3', setInfoImgSrc3)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {infoImgSrc3 ? (
                <img
                  src={infoImgSrc3}
                  alt="상세 이미지3 미리보기"
                  width="200"
                />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상세 정보 이미지4</label>           {' '}
            <input
              type="file"
              name="infoImage4"
              id="infoImage4Input"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage4', setInfoImgSrc4)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {infoImgSrc4 ? (
                <img
                  src={infoImgSrc4}
                  alt="상세 이미지4 미리보기"
                  width="200"
                />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>상세 정보 이미지5</label>           {' '}
            <input
              type="file"
              name="infoImage5"
              id="infoImage5Input"
              onChange={(e) =>
                handleImageUpload(e, 'infoImage5', setInfoImgSrc5)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {infoImgSrc5 ? (
                <img
                  src={infoImgSrc5}
                  alt="상세 이미지5 미리보기"
                  width="200"
                />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="form-group">
                        <label>hover 이미지</label>           {' '}
            <input
              type="file"
              name="hoverImage"
              id="hoverImageInput"
              onChange={(e) =>
                handleImageUpload(e, 'hoverImage', setHoverImgSrc)
              }
            />
                       {' '}
            <div className="image-preview">
                           {' '}
              {hoverImgSrc ? (
                <img
                  src={hoverImgSrc}
                  alt="hover 이미지 미리보기"
                  width="200"
                />
              ) : (
                <img
                  src="/images/no-image.png"
                  alt="기본 이미지"
                  style={{
                    width: '200px',
                    height: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                   {' '}
          <div className="btns">
                       {' '}
            <button type="submit" className="gold-gradient-button">
                            수정 완료            {' '}
            </button>
                       {' '}
            <button
              type="button"
              onClick={handleCancel}
              className="gold-gradient-button"
            >
                            취소            {' '}
            </button>
                     {' '}
          </div>
                 {' '}
        </form>
             {' '}
      </div>
         {' '}
    </AdminLayout>
  )
}

export default UpdateProduct
