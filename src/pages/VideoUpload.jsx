// src/pages/VideoUploadPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/VideoUpload.scss";
import { uploadVideo } from "../api/video";

const VIDEO_TAGS = [
    { id: "nature", label: "자연" },
    { id: "forest", label: "숲" },
    { id: "tree", label: "나무" },
    { id: "flower", label: "꽃" },
    { id: "grass", label: "잔디" },
    { id: "mountain", label: "산" },
    { id: "river", label: "강" },
    { id: "sea", label: "바다" },
    { id: "beach", label: "해변" },

    { id: "sky", label: "하늘" },
    { id: "cloud", label: "구름" },
    { id: "sun", label: "태양" },
    { id: "moon", label: "달" },
    { id: "star", label: "별" },
    { id: "night", label: "밤" },
    { id: "sunrise", label: "일출" },
    { id: "sunset", label: "일몰" },

    { id: "rain", label: "비" },
    { id: "snow", label: "눈" },
    { id: "wind", label: "바람" },

    { id: "city", label: "도시" },
    { id: "street", label: "거리" },
    { id: "park", label: "공원" },
    { id: "school", label: "학교" },
    { id: "classroom", label: "교실" },

    { id: "home", label: "집" },
    { id: "kitchen", label: "주방" },
    { id: "office", label: "사무실" },
    { id: "library", label: "도서관" },
    { id: "playground", label: "놀이터" },

    { id: "people", label: "사람" },
    { id: "child", label: "아이" },
    { id: "family", label: "가족" },
    { id: "friends", label: "친구" },

    { id: "cat", label: "고양이" },
    { id: "dog", label: "강아지" },
    { id: "rabbit", label: "토끼" },
    { id: "bird", label: "새" },
    { id: "animal", label: "동물" },

    { id: "car", label: "자동차" },
    { id: "train", label: "기차" },
    { id: "bicycle", label: "자전거" },

    { id: "space", label: "우주" },
    { id: "planet", label: "행성" },
    { id: "earth", label: "지구" },
    { id: "galaxy", label: "은하" },
    { id: "universe", label: "우주 전체" },

    { id: "clock", label: "시계" },
    { id: "soil", label: "흙" },
    { id: "farm", label: "농장" },
];


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
    const [selectedTags, setSelectedTags] = useState([]);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [infoMsg, setInfoMsg] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // 🔹 제목 전용 에러
    const [titleError, setTitleError] = useState("");

    // 🔹 태그 5/5일 때 흔들림 플래그
    const [tagShake, setTagShake] = useState(false);

    // 🔹 미리보기 URL 메모리 정리
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // 태그 토글 (최대 5개, 초과 시 텍스트 흔들기)
    const toggleTag = (id) => {
        setErrorMsg("");
        setInfoMsg("");

        setSelectedTags((prev) => {
            if (prev.includes(id)) {
                return prev.filter((t) => t !== id);
            }
            if (prev.length >= 5) {
                // 🔸 5개 초과 시 "선택된 태그: 5 / 5" 흔들기
                setTagShake(true);
                setTimeout(() => setTagShake(false), 320);
                return prev;
            }
            return [...prev, id];
        });
    };

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
        if (selectedTags.length === 0) {
            setErrorMsg("태그를 1개 이상 선택해 주세요.");
            return;
        }

        try {
            setIsUploading(true);

            await uploadVideo({
                title: title.trim(),
                tags: selectedTags,
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
                    {/* 왼쪽: 제목 + 태그 */}
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

                            {/* 태그 선택 */}
                            <div className="vu-field">
                                <div className="vu-label-row">
                                    <label>태그</label>
                                    <span className="vu-label-badge">최대 5개</span>
                                </div>
                                <p className="vu-hint">
                                    AI, 보안, 코딩, 면접 등 영상을 잘 설명할 수 있는 태그를 선택해 주세요.
                                </p>

                                <div className="vu-tag-row">
                                    {VIDEO_TAGS.map((tag) => {
                                        const active = selectedTags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                className={
                                                    "vu-tag-chip" + (active ? " vu-tag-chip--active" : "")
                                                }
                                                onClick={() => toggleTag(tag.id)}
                                            >
                                                {tag.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedTags.length > 0 && (
                                    <p
                                        className={
                                            "vu-info vu-info--tag" +
                                            (selectedTags.length >= 5 ? " vu-info--max" : "") +
                                            (tagShake ? " vu-info--shake" : "")
                                        }
                                    >
                                        선택된 태그: {selectedTags.length} / 5
                                    </p>
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
