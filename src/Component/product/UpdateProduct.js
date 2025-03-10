import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import AdminLayout from '../AdminLayout'
import jaxios from '../../util/jwtUtil'
import '../../style/admin.css'

const UpdateProduct = () => {
  const { productSeq } = useParams()
  const navigate = useNavigate() // 상품 관련 상태 및 카테고리 목록 (WriteProduct.js와 유사한 구조)
   // ✅ 상품 정보 상태
  const [product, setProduct] = useState({})
  const [categories, setCategories] = useState([
    { id: 1, name: '반지' },
    { id: 2, name: '목걸이' },
    { id: 3, name: '귀걸이' },
    { id: 4, name: '팔찌' },
  ]) 

   // ✅ 마진 자동 계산
   const calculateMarginPrice = (costPrice, salePrice) => {
    const cost = Number(costPrice) || 0
    const sale = Number(salePrice) || 0
    return String(sale - cost)
  } 
  // ✅ 이미지 URL 상태 관리 (S3 적용)
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
  
  // ✅ S3 이미지 URL 저장 상태
  const [uploadedImages, setUploadedImages] = useState({
    productImage: "",
    productImage2: "",
    productImage3: "",
    productImage4: "",
    infoImage: "",
    infoImage2: "",
    infoImage3: "",
    infoImage4: "",
    infoImage5: "",
    hoverImage: "",
  });

  // ✅ S3 URL 확인 및 변환 함수
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/no-image.png"; 
    if (imagePath.startsWith("http")) return imagePath; 
    return `http://localhost:8070/product_images/${imagePath}`; 
  };

  // ✅ 상품 정보 불러오기 (S3 URL 유지)
  useEffect(() => {
    jaxios.get(`/api/admin/product/${productSeq}`)
      .then((response) => {
        if (response.status === 200) {
          setProduct(response.data);
          setUploadedImages({
            productImage: response.data.productImage || "",
            productImage2: response.data.productImage2 || "",
            productImage3: response.data.productImage3 || "",
            productImage4: response.data.productImage4 || "",
            infoImage: response.data.infoImage || "",
            infoImage2: response.data.infoImage2 || "",
            infoImage3: response.data.infoImage3 || "",
            infoImage4: response.data.infoImage4 || "",
            infoImage5: response.data.infoImage5 || "",
            hoverImage: response.data.hoverImage || "",
          });
        } else {
          Swal.fire({ icon: 'error', title: '불러오기 실패', text: '상품 정보를 불러오는 데 실패했습니다.' });
        }
      })
      .catch(() => {
        Swal.fire({ icon: 'error', title: '오류', text: '상품 정보를 불러오는 중 오류가 발생했습니다.' });
      });
  }, [productSeq]);

  // ✅ 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
      productMarginPrice: (name === 'productCostPrice' || name === 'productSalePrice') 
        ? calculateMarginPrice(name === 'productCostPrice' ? value : prevProduct.productCostPrice, 
                               name === 'productSalePrice' ? value : prevProduct.productSalePrice)
        : prevProduct.productMarginPrice,
    }));
  };
  
  // ✅ 파일 업로드 핸들러 (S3 적용)
  const handleFileChange = async (event, fieldName) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await jaxios.post(`/api/upload/${folderMapping[fieldName]}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = response.data;
      // setUploadedImages((prev) => ({ ...prev, [fieldName]: fileUrl }));
      // setProduct((prev) => ({ ...prev, [fieldName]: fileUrl }));

      // 기존 이미지(product) 상태는 유지하고, 신규 업로드된 이미지만 반영
      setUploadedImages((prev) => ({ ...prev, [fieldName]: fileUrl }));

    } catch (error) {
      console.error("파일 업로드 실패", error);
      alert("파일 업로드에 실패했습니다.");
    }
  };

  
  
  // ✅ S3 업로드 후 실행되는 함수
  const handleUploadSuccess = (fieldName, fileUrl) => {
    setUploadedImages((prev) => ({
      ...prev,
      [fieldName]: fileUrl, 
    }));

    setProduct((prev) => ({
      ...prev,
      [fieldName]: fileUrl, 
    }));
  };
  
  // 라디오 버튼 변경 처리
  const handleRadioChange = (e) => {
    const { name, value } = e.target
    setProduct((prev) => ({ ...prev, [name]: value }))
  } // 상품 정보를 페이지 로드 시 불러오기 (기존 이미지 미리보기 설정 포함)

  

  // ✅ 상품 수정 요청
  const onUpdateSubmit = (e) => {
    e.preventDefault();
    
    jaxios.put(`/api/admin/product/${productSeq}`, { ...product })
      .then(() => {
        Swal.fire({ icon: 'success', title: '성공', text: '상품 정보가 수정되었습니다.' })
          .then(() => navigate(`/productView/${productSeq}`));
      })
      .catch(() => {
        Swal.fire({ icon: 'error', title: '수정 실패', text: '상품 정보 수정에 실패했습니다.' });
      });
  };

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

  // ✅ 이미지 업로드 폴더 매핑
  const folderMapping = {
    productImage: "product_images",
    productImage2: "product_images",
    productImage3: "product_images",
    productImage4: "product_images",
    infoImage: "product_infoimages",
    infoImage2: "product_infoimages",
    infoImage3: "product_infoimages",
    infoImage4: "product_infoimages",
    infoImage5: "product_infoimages",
    hoverImage: "product_hover",
  };

  return (
    <AdminLayout>
      <div className="main-content">
        <h2>상품 수정</h2>
        <form onSubmit={onUpdateSubmit}>
          <div className="form-group">
            <label htmlFor="categoryId">카테고리</label>
            <select
              name="categoryId"
              id="categoryId"
              value={product.categoryId || ''}
              onChange={handleInputChange}
              className="form-control category-select"
            >
            <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
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
              className="form-control"
              value={product.productName || ''}
              onChange={handleInputChange}
              placeholder="상품명을 입력하세요"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productCostPrice">원가</label>
            <input
              type="number"
              name="productCostPrice"
              id="productCostPrice"
              className="form-control"
              value={product.productCostPrice || ''}
              onChange={handleInputChange}
              placeholder="원가를 입력하세요"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productSalePrice">판매가</label>
            <input
              type="number"
              name="productSalePrice"
              id="productSalePrice"
              className="form-control"
              value={product.productSalePrice || ''}
              onChange={handleInputChange}
              placeholder="판매가를 입력하세요"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productMarginPrice">마진</label>
            <input
              type="text"
              name="productMarginPrice"
              id="productMarginPrice"
              className="form-control"
              value={product.productMarginPrice || ''}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="productStatus">판매 상태</label>
            <select
              name="productStatus"
              id="productStatus"
              className="form-control"
              value={product.productStatus || ''}
              onChange={handleInputChange}
            >
              <option value="판매중">판매중</option>
              <option value="판매중지">판매중지</option>
              <option value="품절">품절</option>
            </select>
          </div>
          <div className="form-group">
            <label>사용 유무</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="productUse"
                  value="Y"
                  checked={product.productUse === 'Y'}
                  onChange={handleRadioChange}
                /> 예
              </label>
              <label>
                <input
                  type="radio"
                  name="productUse"
                  value="N"
                  checked={product.productUse === 'N'}
                  onChange={handleRadioChange}
                /> 아니오 
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>베스트 상품</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="productBest"
                  value="Y"
                  checked={product.productBest === 'Y'}
                  onChange={handleRadioChange}
                /> 예 
              </label>
              <label>
                <input
                  type="radio"
                  name="productBest"
                  value="N"
                  checked={product.productBest === 'N'}
                  onChange={handleRadioChange}
                />아니오 
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="productContent">상품 설명</label>
            <textarea
              name="productContent"
              id="productContent"
              className="form-control"
              value={product.productContent || ''}
              onChange={handleInputChange}
              rows="5"
              placeholder="상품 설명을 입력하세요"
            ></textarea>
          </div>
          {/* 이미지 업로드 필드 */}
          <div className="form-group">
            <label>상품 이미지1</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.productImage ? (
                  <img src={getImageUrl(product.productImage)} alt="기존 이미지" width="200" />
                ) : (
                  <p>없음</p>
                )}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" name="productImage1" id="productImage1Input" 
                  onChange={(e) => handleFileChange(e, 'productImage')} />
                {uploadedImages.productImage ? (
                  <img src={getImageUrl(uploadedImages.productImage)} alt="신규 이미지" width="200" />
                ) : (
                  <p>파일을 선택하세요</p>
                )}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>상품 이미지2</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.productImage2 ? (
                  <img src={getImageUrl(product.productImage2)} alt="기존 이미지" width="200" />
                ) : (
                  <p>없음</p>
                )}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" name="productImage2" id="productImage2Input" 
                  onChange={(e) => handleFileChange(e, 'productImage2')} />
                {uploadedImages.productImage2 ? (
                  <img src={getImageUrl(uploadedImages.productImage2)} alt="신규 이미지" width="200" />
                ) : (
                  <p>파일을 선택하세요</p>
                )}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>상품 이미지3</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.productImage3 ? (
                  <img src={getImageUrl(product.productImage3)} alt="기존 이미지" width="200" />
                ) : (
                  <p>없음</p>
                )}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" name="productImage3" id="productImage3Input" 
                  onChange={(e) => handleFileChange(e, 'productImage3')} />
                {uploadedImages.productImage3 ? (
                  <img src={getImageUrl(uploadedImages.productImage3)} alt="신규 이미지" width="200" />
                ) : (
                  <p>파일을 선택하세요</p>
                )}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>상품 이미지4</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.productImage4 ? (
                  <img src={getImageUrl(product.productImage4)} alt="기존 이미지" width="200" />
                ) : (
                  <p>없음</p>
                )}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" name="productImage4" id="productImage4Input" 
                  onChange={(e) => handleFileChange(e, 'productImage4')} />
                {uploadedImages.productImage4 ? (
                  <img src={getImageUrl(uploadedImages.productImage4)} alt="신규 이미지" width="200" />
                ) : (
                  <p>파일을 선택하세요</p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ 상세 정보 이미지 1~5 */}
          <div className="form-group">
            <label>상세 정보 이미지1</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.infoImage ? (
                  <img src={getImageUrl(product.infoImage)} alt="기존 상세 이미지" width="200" />
                ) : <p>없음</p>}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" onChange={(e) => handleFileChange(e, 'infoImage')} />
                {uploadedImages.infoImage ? (
                  <img src={getImageUrl(uploadedImages.infoImage)} alt="신규 상세 이미지" width="200" />
                ) : <p>파일을 선택하세요</p>}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>상세 정보 이미지2</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.infoImage2 ? (
                  <img src={getImageUrl(product.infoImage2)} alt="기존 상세 이미지" width="200" />
                ) : <p>없음</p>}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" onChange={(e) => handleFileChange(e, 'infoImage2')} />
                {uploadedImages.infoImage2 ? (
                  <img src={getImageUrl(uploadedImages.infoImage2)} alt="신규 상세 이미지" width="200" />
                ) : <p>파일을 선택하세요</p>}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>상세 정보 이미지3</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.infoImage3 ? (
                  <img src={getImageUrl(product.infoImage3)} alt="기존 상세 이미지" width="200" />
                ) : <p>없음</p>}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" onChange={(e) => handleFileChange(e, 'infoImage3')} />
                {uploadedImages.infoImage3 ? (
                  <img src={getImageUrl(uploadedImages.infoImage3)} alt="신규 상세 이미지" width="200" />
                ) : <p>파일을 선택하세요</p>}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>상세 정보 이미지4</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.infoImage4 ? (
                  <img src={getImageUrl(product.infoImage4)} alt="기존 상세 이미지" width="200" />
                ) : <p>없음</p>}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" onChange={(e) => handleFileChange(e, 'infoImage4')} />
                {uploadedImages.infoImage4 ? (
                  <img src={getImageUrl(uploadedImages.infoImage4)} alt="신규 상세 이미지" width="200" />
                ) : <p>파일을 선택하세요</p>}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>상세 정보 이미지5</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.infoImage5 ? (
                  <img src={getImageUrl(product.infoImage5)} alt="기존 상세 이미지" width="200" />
                ) : <p>없음</p>}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" onChange={(e) => handleFileChange(e, 'infoImage5')} />
                {uploadedImages.infoImage5 ? (
                  <img src={getImageUrl(uploadedImages.infoImage5)} alt="신규 상세 이미지" width="200" />
                ) : <p>파일을 선택하세요</p>}
              </div>
            </div>
          </div> 
          <div className="form-group">
            <label>Hover 이미지</label>
            <div className="image-container">
              <div className="image-preview">
                <p>기존 이미지</p>
                {product.hoverImage ? (
                  <img src={getImageUrl(product.hoverImage)} alt="기존 Hover 이미지" width="200" />
                ) : <p>없음</p>}
              </div>
              <div className="image-preview">
                <p>신규 업로드</p>
                <input type="file" onChange={(e) => handleFileChange(e, 'hoverImage')} />
                {uploadedImages.hoverImage ? (
                  <img src={getImageUrl(uploadedImages.hoverImage)} alt="신규 Hover 이미지" width="200" />
                ) : <p>파일을 선택하세요</p>}
              </div>
            </div>
          </div>
          
          <div className="btns">
            <button type="submit" className="gold-gradient-button">
              수정 완료
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="gold-gradient-button"
            > 취소 
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default UpdateProduct
