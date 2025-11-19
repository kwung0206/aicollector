// src/pages/VideoUploadPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/VideoUpload.scss";
import { uploadVideo } from "../api/video";

// 파일 크기 표시용
const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "-";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
};

const VideoUploadPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [infoMsg, setInfoMsg] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // 🔹 제목 전용 에러
    const [titleError, setTitleError] = useState("");

    // 🔹 미리보기 URL 메모리 정리
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const setFileAndPreview = (f) => {
        setFile(f);
        setInfoMsg("영상 크기에 따라 업로드 시간이 다소 걸릴 수 있습니다.");

        if (f) {
            const url = URL.createObjectURL(f);
            setPreviewUrl(url);
        } else {
            setPreviewUrl("");
        }
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFileAndPreview(f);
    };

    // 드래그앤드롭
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (!f) return;
        setFileAndPreview(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setInfoMsg("");
        setTitleError("");

        if (!title.trim()) {
            // 🔸 제목 미입력 → 제목 아래에 표시
            setTitleError("영상 제목을 입력해 주세요.");
            return;
        }
        if (!file) {
            setErrorMsg("업로드할 영상을 선택해 주세요.");
            return;
        }

        try {
            setIsUploading(true);

            await uploadVideo({
                title: title.trim(),
                // 태그 선택 UI를 없앴으므로 tags는 보내지 않음
                file,
            });

            setShowResultModal(true);
        } catch (err) {
            console.error("영상 업로드 실패:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "영상 업로드 중 오류가 발생했습니다.";
            setErrorMsg(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleResultConfirm = () => {
        setShowResultModal(false);
        navigate("/profile");
    };

    return (
        <>
            <section className="video-upload-page">
                <h2 className="vu-title">영상 업로드</h2>

                <div className="vu-card">
                    {/* 왼쪽: 제목만 입력 */}
                    <form className="vu-form" onSubmit={handleSubmit}>
                        <div>
                            {/* 제목 */}
                            <div className="vu-field vu-field--title">
                                <div className="vu-label-row">
                                    <label htmlFor="v-title">제목</label>
                                    <span className="vu-label-badge">필수</span>
                                </div>
                                <input
                                    id="v-title"
                                    type="text"
                                    className="vu-input"
                                    maxLength={255}
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        if (titleError) setTitleError("");
                                    }}
                                />
                                {titleError && (
                                    <p className="vu-error-inline">{titleError}</p>
                                )}
                            </div>
                        </div>

                        {/* 제출 버튼 (왼쪽 아래) */}
                        <div className="vu-actions">
                            <button
                                type="submit"
                                className={
                                    "vu-submit-btn" +
                                    (isUploading ? " vu-submit-btn--disabled" : "")
                                }
                                disabled={isUploading}
                            >
                                {isUploading ? "업로드 중..." : "영상 업로드"}
                            </button>
                        </div>

                        {errorMsg && <p className="vu-error">{errorMsg}</p>}
                        {infoMsg && !errorMsg && <p className="vu-info">{infoMsg}</p>}
                    </form>

                    {/* 오른쪽: 파일 업로드 + 미리보기 */}
                    <aside className="vu-side">
                        <div
                            className={
                                "vu-file-drop" +
                                (isDragOver ? " vu-file-drop--dragover" : "")
                            }
                            onClick={handleFileClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="vu-file-icon">🎬</div>
                            <div className="vu-file-title">
                                영상 파일을 선택하거나 끌어다 놓기
                            </div>
                            <div className="vu-file-sub">
                                MP4, WEBM 등 대부분의 영상 포맷 지원
                            </div>
                            <div className="vu-file-meta">최대 1GB 권장</div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="vu-file-input"
                                accept="video/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* 선택된 파일 정보 */}
                        {file && (
                            <div className="vu-file-selected">
                                <span className="vu-file-selected-name">{file.name}</span>
                                <span className="vu-file-selected-size">
                                    {formatBytes(file.size)}
                                </span>
                            </div>
                        )}

                        {/* 🔹 영상 미리보기 */}
                        {previewUrl && (
                            <div className="vu-preview-box">
                                <video
                                    src={previewUrl}
                                    controls
                                    muted
                                    playsInline
                                    style={{ width: "100%", display: "block" }}
                                />
                            </div>
                        )}
                    </aside>
                </div>
            </section>

            {/* 업로드 중 오버레이 */}
            {isUploading && (
                <div className="vu-upload-overlay">
                    <div className="vu-upload-box">
                        <div className="vu-spinner" />
                        <h3 className="vu-upload-title">영상을 업로드 중입니다...</h3>
                        <p className="vu-upload-desc">
                            영상 크기에 따라 업로드 시간이 조금 걸릴 수 있어요.
                        </p>
                    </div>
                </div>
            )}

            {/* 업로드 완료 모달 */}
            {showResultModal && (
                <div className="vu-result-backdrop">
                    <div className="vu-result-modal">
                        <div className="vu-result-icon">✅</div>
                        <h3 className="vu-result-title">영상 업로드 완료</h3>
                        <p className="vu-result-desc">
                            영상이 성공적으로 업로드되었습니다.
                        </p>
                        <div className="vu-result-actions">
                            <button
                                type="button"
                                className="vu-result-btn"
                                onClick={handleResultConfirm}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoUploadPage;
