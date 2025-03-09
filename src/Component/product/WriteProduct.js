import React, { useState } from 'react'
import SubMenu from '../SubMenu'
import jaxios from '../../util/jwtUtil'
import '../../style/admin.css' // CSS import 경로 확인
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' // SweetAlert2 라이브러리 import
import AdminLayout from '../AdminLayout'
import FileUpload from "../FileUpload";  // ✅ 변경된 import 경로

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

  // AWS S3 업로드 후 저장할 이미지 URL 상태
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



  const navigate = useNavigate()

  // 마진 계산 함수 (이전과 동일)
  const calculateMarginPrice = (costPrice, salePrice) => {
    const cost = Number(costPrice) || 0
    const sale = Number(salePrice) || 0
    return String(sale - cost)
  }


  // ✅ S3 업로드 후 실행되는 함수 (각 필드별 저장)
  const handleUploadSuccess = (fieldName, fileUrl) => {
    setUploadedImages((prev) => ({
      ...prev,
      [fieldName]: fileUrl, // ✅ 해당 필드에 업로드된 S3 URL 저장
    }));

    setProduct((prev) => ({
      ...prev,
      [fieldName]: fileUrl, // ✅ product 상태에도 저장
    }));
  };


  // ✅ 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => {
      const updatedProduct = { ...prevProduct, [name]: value };
      if (name === "productCostPrice" || name === "productSalePrice") {
        updatedProduct.productMarginPrice = calculateMarginPrice(
          name === "productCostPrice" ? value : prevProduct.productCostPrice,
          name === "productSalePrice" ? value : prevProduct.productSalePrice
        );
      }
      return updatedProduct;
    });
  };

   // ✅ 라디오 버튼 변경 핸들러
   const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  // ✅ 파일 선택 시 자동 업로드
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
      
      setUploadedImages((prev) => ({
        ...prev,
        [fieldName]: fileUrl, // ✅ 해당 필드에 업로드된 S3 URL 저장
      }));

      setProduct((prev) => ({
        ...prev,
        [fieldName]: fileUrl, // ✅ product 상태에도 저장
      }));
    } catch (error) {
      console.error("파일 업로드 실패", error);
      alert("파일 업로드에 실패했습니다.");
    }
  };



  // ✅ 상품 등록 요청
  const onSubmit = (e) => {
    e.preventDefault();

    if (
      !product.categoryId ||
      isNaN(Number(product.categoryId)) ||
      !product.productName.trim() ||
      !product.productCostPrice ||
      isNaN(Number(product.productCostPrice)) ||
      !product.productSalePrice ||
      isNaN(Number(product.productSalePrice)) ||
      Number(product.productSalePrice) < Number(product.productCostPrice) ||
      !product.productContent
    ) {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "필수 입력 필드를 모두 채워주세요.",
      });
      return;
    }

    jaxios
      .post("/api/admin/product/writeProduct", {
        ...product,
        productCostPrice: Number(product.productCostPrice),
        productSalePrice: Number(product.productSalePrice),
        productMarginPrice: Number(product.productMarginPrice),
        categoryId: Number(product.categoryId),
      })
      .then((response) => {
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "성공",
            text: "상품이 등록되었습니다.",
          }).then(() => {
            navigate("/productList");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "등록 실패",
            text: "상품 등록에 실패했습니다.",
          });
        }
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "오류",
          text: "상품 등록 중 오류가 발생했습니다.",
        });
      });
  };

  // ✅ 폴더 매핑
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
        <h2>상품 등록</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>카테고리</label>
            <select name="categoryId" value={product.categoryId} onChange={handleInputChange} className="form-control category-select">
              <option value="">카테고리 선택</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
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

          {/* ✅ 이미지 업로드 UI (파일 선택만 하면 자동 업로드) */}
          {Object.keys(folderMapping).map((field, index) => (
            <div key={field} className="image-upload-group">
              <label><strong>상품 이미지{index + 1}</strong></label>
              {/* ✅ 이미지 미리보기 */}
              {uploadedImages[field] ? (
                <img src={uploadedImages[field]} alt={`미리보기 ${field}`} width="250" />
              ) : (
                <div className="image-placeholder">이미지 미리보기 없음</div>
              )}
              {/* ✅ 파일 선택 필드 (버튼 없음, 선택하면 자동 업로드) */}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, field)} />
            </div>
          ))}

          <button type="submit" className="gold-gradient-button">등록</button>
          <button type="button" className="gold-gradient-button" onClick={() => navigate("/productList")}>뒤로</button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default WriteProduct
