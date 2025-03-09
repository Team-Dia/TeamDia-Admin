import React, { useState } from "react";
import jaxios from "../util/jwtUtil"; // ✅ JWT 포함된 Axios 인스턴스 사용

const FileUpload = ({ folder, onUploadSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploading, setUploading] = useState(false);

    // ✅ 파일 선택 시 실행되는 함수
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);

        // 미리보기 URL 생성
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    // ✅ S3 업로드 요청 함수 (폴더별 업로드 지원)
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert("업로드할 파일을 선택하세요.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("file", file));

        try {
            // ✅ 폴더명을 포함하여 업로드 요청
            const response = await jaxios.post(`/api/upload/${folder}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            console.log("업로드 성공:", response.data);
            alert("파일 업로드 성공!");
            setUploading(false);

            // ✅ 부모 컴포넌트에 업로드된 URL 전달
            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
        } catch (error) {
            console.error("업로드 실패:", error);
            alert("파일 업로드 중 오류 발생!");
            setUploading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? "업로드 중..." : "업로드"}
            </button>
            
            {/* 이미지 미리보기 */}
            <div className="preview-container">
                {previewUrls.map((url, index) => (
                    <img key={index} src={url} alt={`미리보기-${index}`} width="100" />
                ))}
            </div>
        </div>
    );
};

export default FileUpload;
