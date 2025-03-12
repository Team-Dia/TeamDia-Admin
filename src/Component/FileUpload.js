// import React, { useState } from "react";
// import jaxios from "../util/jwtUtil"; // ✅ JWT 포함된 Axios 인스턴스 사용

// const FileUpload = ({ folder, fieldName, onUploadSuccess }) => {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewUrl, setPreviewUrl] = useState("");
//     const [uploading, setUploading] = useState(false);

//     // ✅ 파일 선택 시 실행되는 함수
//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         setSelectedFile(file);
//         setPreviewUrl(URL.createObjectURL(file)); // 미리보기 URL 생성
//     };

//     // ✅ S3 업로드 요청 함수
//     const handleUpload = async () => {
//         if (!selectedFile) {
//             alert("업로드할 파일을 선택하세요.");
//             return;
//         }

//         setUploading(true);
//         const formData = new FormData();
//         formData.append("file", selectedFile);
//         const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
//         try {
//             const response = await jaxios.post(`${API_BASE_URL}/api/admin/product/upload/${folder}`, formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//               });

//             console.log("업로드 성공:", response.data);
//             alert("파일 업로드 성공!");
//             setUploading(false);

//             // ✅ 부모 컴포넌트에 업로드된 URL 전달
//             if (onUploadSuccess) {
//                 onUploadSuccess(fieldName, response.data.imageUrl);
//             }
//         } catch (error) {
//             console.error("업로드 실패:", error);
//             alert("파일 업로드 중 오류 발생!");
//             setUploading(false);
//         }
//     };

//     return (
//         <div className="file-upload-container">
//             <input type="file" onChange={handleFileChange} />
//             <button onClick={handleUpload} disabled={uploading}>
//                 {uploading ? "업로드 중..." : "업로드"}
//             </button>

//             {/* 이미지 미리보기 */}
//             {previewUrl && (
//                 <div className="preview-container">
//                     <img src={previewUrl} alt="미리보기" width="100" />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FileUpload;
