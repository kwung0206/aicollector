// src/pages/VideoUpload.jsx
import { useState, useRef, useEffect } from "react";
import "../scss/VideoUpload.scss";
import { uploadVideo } from "../api/video"; // ✅ 실제 업로드 API

const TAGS = [
    { id: "all", label: "전체" },

    { id: "ai", label: "AI" },
    { id: "ml", label: "머신러닝" },
    { id: "deep-learning", label: "딥러닝" },
    { id: "nlp", label: "자연어 처리" },
    { id: "cv", label: "컴퓨터 비전" },
    { id: "speech", label: "음성·STT" },
    { id: "chatbot", label: "챗봇" },

    { id: "coding", label: "코딩" },
    { id: "python", label: "파이썬" },
    { id: "java", label: "자바" },
    { id: "javascript", label: "자바스크립트" },
    { id: "web", label: "웹 개발" },
    { id: "mobile", label: "모바일 앱" },
    { id: "game-dev", label: "게임 개발" },

    { id: "algorithm", label: "알고리즘" },
    { id: "data-structure", label: "자료구조" },
    { id: "big-data", label: "빅데이터" },
    { id: "database", label: "데이터베이스" },
    { id: "sql", label: "SQL" },
    { id: "nosql", label: "NoSQL" },

    { id: "security", label: "보안" },
    { id: "network", label: "네트워크" },
    { id: "cloud", label: "클라우드" },
    { id: "devops", label: "DevOps" },
    { id: "docker", label: "Docker" },
    { id: "kubernetes", label: "Kubernetes" },
    { id: "linux", label: "리눅스" },
    { id: "windows", label: "윈도우" },

    { id: "interview", label: "면접" },
    { id: "resume", label: "이력서·자소서" },
    { id: "portfolio", label: "포트폴리오" },

    { id: "tutorial", label: "튜토리얼" },
    { id: "lecture", label: "강의" },
    { id: "seminar", label: "세미나" },
    { id: "conference", label: "컨퍼런스" },
    { id: "review", label: "리뷰·소개" },
    { id: "vlog", label: "브이로그" },
    { id: "project", label: "프로젝트" },
    { id: "demo", label: "데모" },

    { id: "math", label: "수학" },
    { id: "statistics", label: "통계" },
    { id: "physics", label: "물리" },
    { id: "chemistry", label: "화학" },
    { id: "biology", label: "생물" },

    { id: "robotics", label: "로보틱스" },
    { id: "iot", label: "IoT" },
    { id: "finance", label: "금융·퀀트" },
    { id: "marketing", label: "마케팅" },
    { id: "startup", label: "스타트업" },
];

const VideoUpload = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(""); // ✅ 설명
    const [selectedTags, setSelectedTags] = useState(["all"]);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [loading, setLoading] = useState(false); // ✅ 로딩
    const [error, setError] = useState(null); // ✅ 에러 메시지
    const [success, setSuccess] = useState(null); // ✅ 성공 메시지

    const fileInputRef = useRef(null);

    const toggleTag = (id) => {
        if (id === "all") {
            setSelectedTags(["all"]);
            return;
        }

        setSelectedTags((prev) => {
            let next = prev.filter((tagId) => tagId !== "all");

            if (next.includes(id)) {
                next = next.filter((tagId) => tagId !== id);
            } else {
                next = [...next, id];
            }

            if (next.length === 0) return ["all"];
            return next;
        });
    };

    const isActiveTag = (id) => selectedTags.includes(id);

    const handleClickFileButton = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);

        // 기존 URL 정리
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        if (f) {
            const url = URL.createObjectURL(f);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    // 컴포넌트 언마운트 시 미리보기 URL 정리
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!title.trim()) {
            setError("영상 제목을 입력해주세요.");
            return;
        }
        if (!file) {
            setError("업로드할 영상 파일을 선택해주세요.");
            return;
        }

        const tagsToSend = selectedTags.includes("all") ? [] : selectedTags;

        try {
            setLoading(true);

            const res = await uploadVideo({
                title: title.trim(),
                description: description.trim(),
                tags: tagsToSend,
                file,
            });

            setSuccess("영상이 성공적으로 업로드되었습니다.");
            console.log("uploaded:", res);

            // 필요하면 여기서 폼 초기화
            // setTitle("");
            // setDescription("");
            // setSelectedTags(["all"]);
            // setFile(null);
            // if (previewUrl) URL.revokeObjectURL(previewUrl);
            // setPreviewUrl(null);
        } catch (err) {
            const msg =
                err?.response?.data ||
                err?.message ||
                "업로드 중 오류가 발생했습니다.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="video-upload-page">
            <div className="video-upload-inner">
                {/* 상단 설명 */}
                <header className="video-upload-header">
                    <p className="video-upload-eyebrow">UPLOAD</p>
                    <h1 className="video-upload-title">
                        영상 <span>업로드</span>
                    </h1>
                    <p className="video-upload-desc">
                        AI 영상 모음에 추가할 영상을 등록하는 페이지입니다.
                        제목과 태그를 설정하고, 로컬에서 영상을 선택해 업로드할 수 있습니다.
                        업로드된 영상은 AI 검수 상태에 따라 사이트에 노출되거나 관리자 페이지에서
                        관리됩니다.
                    </p>
                </header>

                {/* 업로드 카드 */}
                <form className="video-upload-card" onSubmit={handleSubmit}>
                    {/* 제목 입력 */}
                    <div className="form-field">
                        <label htmlFor="video-title">영상 제목</label>
                        <input
                            id="video-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* 태그 선택 */}
                    <div className="video-upload-section">
                        <div className="video-upload-section-header">
                            <span className="video-upload-section-title">태그 선택</span>
                            <span className="video-upload-section-hint">
                여러 개의 태그를 선택할 수 있습니다. <strong>전체</strong>를 누르면
                초기화됩니다.
              </span>
                        </div>
                        <div className="video-tag-row">
                            {TAGS.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={
                                        "video-tag-pill" +
                                        (isActiveTag(tag.id) ? " video-tag-pill--active" : "")
                                    }
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 영상 파일 선택 */}
                    <div className="video-upload-section">
                        <div className="video-upload-section-header">
                            <span className="video-upload-section-title">영상 파일</span>
                            <span className="video-upload-section-hint">
                로컬에 저장된 mp4, mov, webm 등의 동영상 파일을 선택할 수 있습니다.
              </span>
                        </div>

                        {/* 실제 file input은 숨기고, 버튼으로만 트리거 */}
                        <input
                            type="file"
                            accept="video/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />

                        <div className="video-upload-file-row">
                            <button
                                type="button"
                                className="btn btn-primary video-upload-file-btn"
                                onClick={handleClickFileButton}
                            >
                                영상 불러오기
                            </button>
                            <div className="video-upload-file-info">
                                <p className="video-upload-file-name">
                                    {file ? file.name : "선택된 파일이 없습니다."}
                                </p>
                                <p className="video-upload-file-hint">
                                    파일을 선택하면 여기에서 파일 이름을 확인할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        {/* 미리보기 영역 */}
                        {previewUrl && (
                            <div className="video-upload-preview">
                                <p className="video-upload-preview-title">미리보기</p>
                                <div className="video-upload-preview-player">
                                    <video src={previewUrl} controls />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 에러/성공 메시지 */}
                    {error && <p className="field-error">{error}</p>}
                    {success && (
                        <p
                            style={{
                                marginTop: "0.4rem",
                                fontSize: "0.85rem",
                                color: "#4ade80",
                            }}
                        >
                            {success}
                        </p>
                    )}

                    {/* 업로드 버튼 */}
                    <div className="video-upload-actions">
                        <button
                            type="submit"
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            {loading ? "업로드 중..." : "영상 업로드"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default VideoUpload;
