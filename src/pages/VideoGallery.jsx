// src/pages/VideoGallery.jsx
import { useState } from "react";
import "../scss/VideoGallery.scss";

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
    { id: "startup", label: "스타트업" }
];

const VideoGallery = () => {
    // ✅ 여러 태그 선택 가능
    const [selectedTags, setSelectedTags] = useState(["all"]);
    const [keyword, setKeyword] = useState("");

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // TODO: 나중에 실제 필터링 로직 연결 (selectedTags + keyword)
        // console.log({ selectedTags, keyword });
    };

    const toggleTag = (id) => {
        if (id === "all") {
            // 전체를 누르면 다른 태그 다 해제 + 전체만 선택
            setSelectedTags(["all"]);
            return;
        }

        setSelectedTags((prev) => {
            // 전체는 항상 제거
            let next = prev.filter((tagId) => tagId !== "all");

            if (next.includes(id)) {
                // 이미 선택된 태그면 해제
                next = next.filter((tagId) => tagId !== id);
            } else {
                // 새로 추가
                next = [...next, id];
            }

            // 아무 것도 안 남으면 다시 전체로
            if (next.length === 0) {
                return ["all"];
            }
            return next;
        });
    };

    const isActiveTag = (id) => selectedTags.includes(id);

    return (
        <section className="video-page">
            <div className="video-inner">
                {/* 상단 설명 영역 */}
                <header className="video-header">
                    <p className="video-eyebrow">VIDEO LIBRARY</p>
                    <h1 className="video-title">
                        AI 영상 모음 <span>둘러보기</span>
                    </h1>
                    <p className="video-desc">
                        태그를 여러 개 선택하거나 제목을 검색해서 원하는 AI 영상을 빠르게 찾을 수 있는 공간입니다.
                        지금은 UI만 준비된 상태이고, 추후 백엔드와 연결되면 실제 영상들이 이 아래에 표시될 거예요.
                    </p>
                </header>

                {/* 검색 + 태그 카드 */}
                <div className="video-controls-card">
                    {/* 검색 영역 */}
                    <form className="video-search-row" onSubmit={handleSearchSubmit}>
                        <div className="video-search-field">
                            <input
                                type="text"
                                placeholder="제목이나 키워드로 검색해보세요"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary video-search-btn">
                            검색
                        </button>
                    </form>

                    {/* 태그 필터 영역 */}
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

                {/* 아직 영상 없을 때 안내 카드 */}
                <div className="video-empty-card">
                    <p className="video-empty-title">아직 등록된 영상이 없어요.</p>
                    <p className="video-empty-desc">
                        태그와 검색 기능은 이미 준비되어 있습니다.
                        앞으로 AI 관련 영상을 업로드하고 나면,
                        선택한 태그와 검색어에 맞는 영상 목록이 이 영역에 나타나도록 연결할 예정입니다.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default VideoGallery;
