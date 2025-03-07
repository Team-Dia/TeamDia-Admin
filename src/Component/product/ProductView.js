import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SubMenu from '../SubMenu'
import jaxios from '../../util/jwtUtil'
import '../../style/admin.css'
import Swal from 'sweetalert2'
import AdminLayout from '../AdminLayout'

const PRODUCT_IMAGE_BASE_URL = 'http://localhost:8070/product_images/' // productImage Base URL (기존과 동일)
const INFO_IMAGE_BASE_URL = 'http://localhost:8070/product_infoimages/' // infoImage, hoverImage Base URL 수정 (웹 루트 경로)
const HOVER_IMAGE_BASE_URL = 'http://localhost:8070/product_hover/' // hoverImage Base URL (새로 추가)

const ProductView = () => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { productSeq } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    jaxios
      .get(`/api/admin/product/getProduct`, { params: { productSeq } })
      .then((response) => {
        setProduct(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching product:', error)
        setLoading(false)
        Swal.fire('오류', '상품 정보를 불러오는데 실패했습니다.', 'error')
      })
  }, [productSeq])

  const onDeleteProduct = async () => {
    if (await confirmDelete()) {
      setIsDeleting(true)
      try {
        await jaxios.delete(`/api/admin/product/deleteProduct/${productSeq}`)
        setIsDeleting(false)
        Swal.fire(
          '삭제 완료',
          '상품이 성공적으로 삭제되었습니다.',
          'success',
        ).then(() => {
          navigate('/productList')
        })
      } catch (error) {
        setIsDeleting(false)
        console.error('Error deleting product:', error)
        Swal.fire('삭제 실패', '상품 삭제 중 오류가 발생했습니다.', 'error')
      }
    }
  }

  const confirmDelete = async () => {
    const result = await Swal.fire({
      title: '상품 삭제',
      text: '정말로 상품을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    })
    return result.isConfirmed
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="main-content">
          <div className="loading-message">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="main-content">
          <div className="error-message">상품 정보를 불러올 수 없습니다.</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="main-content">
        <h2>상품 정보</h2>

        <div className="product-view-container">
          <div className="product-image-area">
            {(() => {
              const images = [
                { type: 'productImage', filename: product.productImage },
                { type: 'productImage', filename: product.productImage2 },
                { type: 'productImage', filename: product.productImage3 },
                { type: 'productImage', filename: product.productImage4 },
                { type: 'infoImage', filename: product.infoImage },
                { type: 'infoImage', filename: product.infoImage2 },
                { type: 'infoImage', filename: product.infoImage3 },
                { type: 'infoImage', filename: product.infoImage4 },
                { type: 'infoImage', filename: product.infoImage5 },
                { type: 'hoverImage', filename: product.hoverImage },
              ]

              const validImages = images.filter((image) => image.filename)

              if (validImages.length === 0) {
                return (
                  <img
                    src="/images/no-image.png"
                    alt="기본 이미지"
                    style={{
                      width: '130px', // 정사각형 너비 (CSS와 동일하게)
                      height: '130px', // 정사각형 높이 (CSS와 동일하게)
                      objectFit: 'cover', // 이미지 채우기 방식 (CSS와 동일하게)
                      borderRadius: '8px', // 테두리 둥글게 (CSS와 동일하게)
                      boxShadow: '3px 3px 7px rgba(0, 0, 0, 0.08)', // 그림자 효과 (CSS와 동일하게)
                    }}
                  />
                )
              }

              return validImages.map((image, index) => {
                let baseUrl
                let subPath = ''

                if (image.type === 'productImage') {
                  baseUrl = PRODUCT_IMAGE_BASE_URL // productImage 인 경우 해당 Base URL 사용
                } else if (image.type === 'infoImage') {
                  baseUrl = INFO_IMAGE_BASE_URL // infoImage 인 경우 해당 Base URL 사용
                } else if (image.type === 'hoverImage') {
                  baseUrl = HOVER_IMAGE_BASE_URL // hoverImage 인 경우 해당 Base URL 사용
                } else {
                  baseUrl = PRODUCT_IMAGE_BASE_URL // 기본적으로 productImage Base URL 사용 (혹시 모를 오류 대비)
                  subPath = 'product_images/' // 기본 subPath (혹시 모를 오류 대비)
                }

                const imageUrl = new URL(image.filename, baseUrl).href // URL 생성자 사용하여 URL 조합 (subPath 제거)

                return (
                  image.filename && (
                    <img
                      key={index}
                      src={imageUrl} // 생성된 이미지 URL 사용
                      alt={`Product ${index + 1}`}
                      style={{ marginRight: '5px' }}
                    />
                  )
                )
              })
            })()}
          </div>

          <div className="product-details">
            <div className="product-title">
              <h2>{product.productName}</h2>
              <div className="product-seq">#{product.productSeq}</div>
            </div>
            <div className="product-info">
              <div className="detail-section">
                <div className="info-item">
                  <label>카테고리</label>
                  <div className="info-value">
                    {product.categories
                      ? product.categories.join(', ')
                      : '카테고리 없음'}
                  </div>
                </div>
                <div className="info-item">
                  <label>신상품 여부</label>
                  <div className="info-value">
                    {product.productUse === 'Y' ? '예' : '아니오'}
                  </div>
                </div>
                <div className="info-item">
                  <label>베스트 상품 여부</label>
                  <div className="info-value">
                    {product.productBest === 'Y' ? '예' : '아니오'}
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <div className="info-item">
                  <label>원가</label>
                  <div className="info-value">
                    {product.productCostPrice
                      ? product.productCostPrice.toLocaleString('ko-KR')
                      : '0'}{' '}
                    원
                  </div>
                </div>
                <div className="info-item">
                  <label>판매가</label>
                  <div className="info-value">
                    {product.productSalePrice
                      ? product.productSalePrice.toLocaleString('ko-KR')
                      : '0'}{' '}
                    원
                  </div>
                </div>
                <div className="info-item">
                  <label>마진</label>
                  <div className="info-value">
                    {product.productMarginPrice
                      ? product.productMarginPrice.toLocaleString('ko-KR')
                      : '0'}{' '}
                    원
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <div className="info-item">
                  <label>상품 설명</label>
                  <div className="info-value content">
                    <pre>{product.productContent}</pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="button-group">
              <button
                className="gold-gradient-button"
                onClick={() => navigate(`/updateProduct/${productSeq}`)}
              >
                수정
              </button>
              <button
                className="gold-gradient-button"
                onClick={onDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                className="gold-gradient-button"
                onClick={() => navigate('/productList')}
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ProductView
