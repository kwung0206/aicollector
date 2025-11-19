// src/pages/VideoGallery.jsx
import { useState, useEffect, useMemo } from "react";
import "../scss/VideoGallery.scss";
import {
    getPublicVideos,
    toggleVideoReaction,
    increaseVideoView,
} from "../api/video";
import { FaThumbsUp, FaThumbsDown, FaPlay, FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";

// src/constants/tags.js (예시)

export const TAGS = [
    { id: "all",             label: "전체" },

    { id: "game",            label: "게임" },
    { id: "nature",          label: "자연" },
    { id: "people",          label: "사람" },
    { id: "daily_life",      label: "일상" },

    { id: "dance",           label: "춤" },
    { id: "animation",       label: "애니메이션" },
    { id: "music",           label: "음악" },
    { id: "visual_art",      label: "시각 예술" },

    { id: "world_travel",    label: "세계·여행" },
    { id: "space",           label: "우주" },
    { id: "city",            label: "도시" },
    { id: "landscape",       label: "풍경" },
    { id: "ocean",           label: "바다" },
    { id: "mountain",        label: "산" },
    { id: "sky",             label: "하늘" },

    { id: "animals",         label: "동물" },
    { id: "pets",            label: "반려동물" },
    { id: "cats",            label: "고양이" },
    { id: "dogs",            label: "강아지" },

    { id: "sports_general",  label: "스포츠(일반)" },
    { id: "soccer",          label: "축구" },
    { id: "basketball",      label: "농구" },
    { id: "fitness",         label: "운동·피트니스" },

    { id: "technology",      label: "기술" },
    { id: "programming",     label: "프로그래밍" },
    { id: "ai_ml",           label: "AI·머신러닝" },
    { id: "robotics",        label: "로봇" },
    { id: "science",         label: "과학" },

    { id: "education_class",     label: "교육·수업" },
    { id: "lecture_presentation",label: "강연·발표" },

    { id: "vlog",            label: "브이로그" },
    { id: "review_unboxing", label: "리뷰·언박싱" },

    { id: "food_cooking",    label: "음식·요리" },
    { id: "restaurant_dining",label: "맛집·외식" },

    { id: "fashion_style",   label: "패션·스타일" },
    { id: "beauty_makeup",   label: "뷰티·메이크업" },

    { id: "craft_diy",       label: "공예·DIY" },
    { id: "3d_graphics",     label: "3D·그래픽" },
    { id: "drawing_illustration", label: "드로잉·일러스트" },

    { id: "car_motorcycle",  label: "자동차·오토바이" },
    { id: "drone_aerial",    label: "드론·항공 뷰" },

    { id: "office_work",     label: "사무·업무" },
    { id: "kids_family",     label: "키즈·가족" },

    { id: "comedy_meme",     label: "코미디·밈" },
    { id: "news_politics",   label: "뉴스·정치" },
    { id: "documentary",     label: "다큐멘터리" },
    { id: "horror_scary",    label: "공포" },
    { id: "romantic_love",   label: "로맨스·연애" },

    { id: "kpop_dance",      label: "K-POP 댄스" },
    { id: "kpop_music",      label: "K-POP 음악" },
];


// ✅ 정렬 옵션
const SORT_OPTIONS = [
    { id: "latest", label: "최신순" },
    { id: "oldest", label: "오래된순" },
    { id: "views", label: "조회수순" },
    { id: "dislikes", label: "싫어요순" },
];

const PAGE_SIZE = 36;
const STREAM_BASE = "/api/videos";

/** 🔍 갤러리 영상 상세 모달 */
const VideoDetailModal = ({
                              video,
                              reactionState,
                              handleReaction,
                              formatDate,
                              onClose,
                              isLoggedIn,
                          }) => {
    if (!video) return null;

    const rs =
        reactionState[video.videoNo] || {
            likeCount: video.likeCount ?? 0,
            dislikeCount: video.dislikeCount ?? 0,
            myReaction: null,
        };

    const liked = rs.myReaction === "like";
    const disliked = rs.myReaction === "dislike";

    return createPortal(
        <div className="gallery-modal-backdrop" onClick={onClose}>
            <div
                className="gallery-modal"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="gallery-modal-header">
                    <div>
                        <p className="gallery-modal-eyebrow">영상 상세 보기</p>
                        <h2 className="gallery-modal-title">{video.title}</h2>

                        <div className="video-meta-stats gallery-modal-header-stats">
                            <span className="video-meta-view">
                                조회수 {video.viewCount}
                            </span>
                            {video.uploadDate && (
                                <span className="video-meta-date">
                                    업로드 {formatDate(video.uploadDate)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="gallery-modal-close"
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        <FaTimes />
                    </button>
                </header>

                <div className="gallery-modal-body">
                    <div className="gallery-modal-player-wrap">
                        <video
                            className="gallery-modal-player"
                            src={`${STREAM_BASE}/${video.videoNo}/stream`}
                            controls
                            autoPlay
                        />
                    </div>

                    <div className="gallery-modal-meta">
                        <div className="gallery-modal-field">
                            <div className="video-meta-actions">
                                <button
                                    type="button"
                                    className={
                                        "video-like-btn" +
                                        (liked ? " is-active" : "") +
                                        (!isLoggedIn ? " is-disabled" : "")
                                    }
                                    disabled={!isLoggedIn}
                                    onClick={() => {
                                        if (!isLoggedIn) return;
                                        handleReaction(video.videoNo, "like");
                                    }}
                                    aria-label="좋아요"
                                >
                                    <FaThumbsUp />
                                </button>
                                <span className="video-meta-count">
                                    {rs.likeCount}
                                </span>

                                <button
                                    type="button"
                                    className={
                                        "video-dislike-btn" +
                                        (disliked ? " is-active" : "") +
                                        (!isLoggedIn ? " is-disabled" : "")
                                    }
                                    disabled={!isLoggedIn}
                                    onClick={() => {
                                        if (!isLoggedIn) return;
                                        handleReaction(video.videoNo, "dislike");
                                    }}
                                    aria-label="싫어요"
                                >
                                    <FaThumbsDown />
                                </button>
                                <span className="video-meta-count">
                                    {rs.dislikeCount}
                                </span>
                            </div>
                        </div>

                        {video.description && (
                            <div className="gallery-modal-field">
                                <span className="gallery-modal-label">설명</span>
                                <p className="gallery-modal-text">
                                    {video.description}
                                </p>
                            </div>
                        )}

                        {video.tag1 && (
                            <div className="gallery-modal-field">
                                <span className="gallery-modal-label">태그</span>
                                <div className="gallery-modal-tags">
                                    {[
                                        video.tag1,
                                        video.tag2,
                                        video.tag3,
                                        video.tag4,
                                        video.tag5,
                                    ]
                                        .filter(Boolean)
                                        .map((t, idx) => (
                                            <span
                                                key={idx}
                                                className="gallery-modal-tag"
                                            >
                                                #{t}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const VideoGallery = () => {
    const auth = useAuth();
    const user = auth?.user;
    const isLoggedIn = !!user;

    // ✅ 여러 태그 선택 가능
    const [selectedTags, setSelectedTags] = useState(["all"]);
    const [keyword, setKeyword] = useState("");

    // ✅ 승인된 영상 목록 + 페이지 정보
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    // ✅ 모달용 선택된 영상
    const [selectedVideo, setSelectedVideo] = useState(null);

    // ✅ 좋아요/싫어요 상태
    const [reactionState, setReactionState] = useState({});

    // ✅ 정렬 상태
    const [sort, setSort] = useState("latest");

    const currentModalVideoNo = selectedVideo?.videoNo;

    // ✅ 모달 열릴 때 조회수 1 증가
    useEffect(() => {
        if (!currentModalVideoNo) return;

        (async () => {
            try {
                const { viewCount } = await increaseVideoView(currentModalVideoNo);

                // 리스트 카드 조회수 갱신
                setVideos((prev) =>
                    prev.map((v) =>
                        v.videoNo === currentModalVideoNo
                            ? { ...v, viewCount }
                            : v
                    )
                );

                // 모달 안 숫자 갱신
                setSelectedVideo((prev) =>
                    prev && prev.videoNo === currentModalVideoNo
                        ? { ...prev, viewCount }
                        : prev
                );
            } catch (e) {
                console.error("조회수 증가 실패", e);
            }
        })();
    }, [currentModalVideoNo]);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        await fetchVideos(0, keyword);
    };

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

            if (next.length === 0) {
                return ["all"];
            }
            return next;
        });
    };

    const isActiveTag = (id) => selectedTags.includes(id);

    // ✅ 승인된 영상 목록 로드
    const fetchVideos = async (pageToLoad = 0, keywordParam = "") => {
        try {
            setLoading(true);
            const data = await getPublicVideos({
                page: pageToLoad,
                size: PAGE_SIZE,
                keyword: keywordParam,
                tags: selectedTags,
            });

            const content = data.content || [];

            setVideos(content);
            setPage(data.number ?? pageToLoad);
            setTotalPages(data.totalPages ?? 0);
            setTotalElements(data.totalElements ?? 0);

            setReactionState((prev) => {
                const next = { ...prev };
                content.forEach((v) => {
                    if (!next[v.videoNo]) {
                        next[v.videoNo] = {
                            likeCount: v.likeCount ?? 0,
                            dislikeCount: v.dislikeCount ?? 0,
                            myReaction: v.myReaction
                                ? v.myReaction.toLowerCase()
                                : null,
                        };
                    }
                });
                return next;
            });
        } catch (err) {
            console.error("영상 목록 불러오기 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // 첫 진입 시 0페이지 로드
    useEffect(() => {
        fetchVideos(0, keyword);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTags]);

    // 모달 열릴 때 body 스크롤 막기 + ESC 닫기
    useEffect(() => {
        if (selectedVideo) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";

            const onKeyDown = (e) => {
                if (e.key === "Escape") {
                    setSelectedVideo(null);
                }
            };
            window.addEventListener("keydown", onKeyDown);

            return () => {
                document.body.style.overflow = originalOverflow;
                window.removeEventListener("keydown", onKeyDown);
            };
        }
    }, [selectedVideo]);

    // ✅ 정렬 적용된 리스트
    const sortedVideos = useMemo(() => {
        const list = [...videos];

        switch (sort) {
            case "views":
                list.sort(
                    (a, b) =>
                        (b.viewCount ?? 0) - (a.viewCount ?? 0)
                );
                break;
            case "dislikes":
                list.sort(
                    (a, b) =>
                        (b.dislikeCount ?? 0) - (a.dislikeCount ?? 0)
                );
                break;
            case "oldest":
                list.sort(
                    (a, b) =>
                        new Date(a.uploadDate ?? 0) -
                        new Date(b.uploadDate ?? 0)
                );
                break;
            case "latest":
            default:
                list.sort(
                    (a, b) =>
                        new Date(b.uploadDate ?? 0) -
                        new Date(a.uploadDate ?? 0)
                );
                break;
        }

        return list;
    }, [videos, sort]);

    // 페이지 버튼 계산 (현재 기준 앞뒤로 최대 5개)
    const pageNumbers = useMemo(() => {
        if (totalPages <= 1) return [];
        const maxVisible = 5;
        const pages = [];

        let start = Math.max(0, page - 2);
        let end = Math.min(totalPages - 1, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(0, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }, [page, totalPages]);

    const handlePageChange = (nextPage) => {
        if (nextPage < 0 || nextPage >= totalPages || nextPage === page) return;
        fetchVideos(nextPage, keyword);
    };

    const openModal = (video) => {
        setSelectedVideo(video);
    };

    const closeModal = () => {
        setSelectedVideo(null);
    };

    // ✅ 좋아요/싫어요 토글
    const handleReaction = async (videoNo, type) => {
        if (!isLoggedIn) {
            // 필요하면 안내 문구 띄우기
            // alert("좋아요/싫어요는 로그인 후 이용 가능합니다.");
            return;
        }

        try {
            const action = type === "like" ? "LIKE" : "DISLIKE";
            const data = await toggleVideoReaction(videoNo, action);
            setReactionState((prev) => ({
                ...prev,
                [videoNo]: {
                    likeCount: data.likeCount ?? 0,
                    dislikeCount: data.dislikeCount ?? 0,
                    myReaction: data.myReaction
                        ? data.myReaction.toLowerCase()
                        : null,
                },
            }));
        } catch (err) {
            console.error("좋아요/싫어요 처리 실패:", err);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return dateStr.replace("T", " ").slice(0, 16);
    };

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
                        태그를 여러 개 선택하거나 제목을 검색해서 원하는 AI 영상을 빠르게
                        찾을 수 있는 공간입니다. Google Video Intelligence API로 자동
                        심사된 승인된 영상만 이 영역에 노출됩니다.
                    </p>
                </header>

                {/* 검색 + 태그 카드 */}
                <div className="video-controls-card">
                    <form
                        className="video-search-row"
                        onSubmit={handleSearchSubmit}
                    >
                        <div className="video-search-field">
                            <input
                                type="text"
                                placeholder="제목이나 키워드로 검색해보세요"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary video-search-btn"
                        >
                            검색
                        </button>
                    </form>

                    <div className="video-tag-row">
                        {TAGS.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                className={
                                    "video-tag-pill" +
                                    (isActiveTag(tag.id)
                                        ? " video-tag-pill--active"
                                        : "")
                                }
                                onClick={() => toggleTag(tag.id)}
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 로딩 표시 */}
                {loading && (
                    <div className="video-loading">
                        영상 목록을 불러오는 중입니다...
                    </div>
                )}

                {/* 영상 없음 */}
                {!loading && videos.length === 0 && (
                    <div className="video-empty-card">
                        <p className="video-empty-title">
                            아직 승인된 영상이 없어요.
                        </p>
                        <p className="video-empty-desc">
                            영상이 업로드되면 Google Video Intelligence API로 자동
                            심사를 거친 뒤, 승인 상태(A)가 된 영상만 이 영역에 표시됩니다.
                        </p>
                    </div>
                )}

                {/* 영상 그리드 */}
                {!loading && videos.length > 0 && (
                    <>
                        {/* ✅ 정렬 바 */}
                        <div className="video-sort-row">
                            <span className="video-sort-label">정렬</span>
                            <div className="video-sort-pill-group">
                                {SORT_OPTIONS.map((opt) => {
                                    const active = sort === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={
                                                "video-sort-pill" +
                                                (active ? " is-active" : "")
                                            }
                                            onClick={() => setSort(opt.id)}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="video-sort-count">
                                총 {totalElements}개
                            </span>
                        </div>

                        <div className="video-grid">
                            {sortedVideos.map((v) => {
                                const reaction =
                                    reactionState[v.videoNo] || {
                                        likeCount: v.likeCount ?? 0,
                                        dislikeCount: v.dislikeCount ?? 0,
                                        myReaction: null,
                                    };
                                const isLiked =
                                    reaction.myReaction === "like";
                                const isDisliked =
                                    reaction.myReaction === "dislike";

                                return (
                                    <article
                                        key={v.videoNo}
                                        className="video-tile"
                                    >
                                        <div
                                            className="video-thumb"
                                            onClick={() => openModal(v)}
                                        >
                                            <video
                                                src={`${STREAM_BASE}/${v.videoNo}/stream`}
                                                muted
                                                playsInline
                                                preload="metadata"
                                                controls={false}
                                            />
                                            <div className="video-thumb-overlay">
                                                <div className="video-thumb-play">
                                                    <FaPlay className="video-thumb-play-icon" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="video-meta">
                                            <div className="video-meta-header">
                                                <h3 className="video-meta-title">
                                                    {v.title}
                                                </h3>

                                                <div className="video-meta-actions">
                                                    <button
                                                        type="button"
                                                        className={
                                                            "video-like-btn" +
                                                            (isLiked
                                                                ? " is-active"
                                                                : "") +
                                                            (!isLoggedIn
                                                                ? " is-disabled"
                                                                : "")
                                                        }
                                                        disabled={!isLoggedIn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!isLoggedIn) return;
                                                            handleReaction(
                                                                v.videoNo,
                                                                "like"
                                                            );
                                                        }}
                                                        aria-label="좋아요"
                                                    >
                                                        <FaThumbsUp />
                                                    </button>
                                                    <span className="video-meta-count">
                                                        {reaction.likeCount}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className={
                                                            "video-dislike-btn" +
                                                            (isDisliked
                                                                ? " is-active"
                                                                : "") +
                                                            (!isLoggedIn
                                                                ? " is-disabled"
                                                                : "")
                                                        }
                                                        disabled={!isLoggedIn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!isLoggedIn) return;
                                                            handleReaction(
                                                                v.videoNo,
                                                                "dislike"
                                                            );
                                                        }}
                                                        aria-label="싫어요"
                                                    >
                                                        <FaThumbsDown />
                                                    </button>
                                                    <span className="video-meta-count">
                                                        {
                                                            reaction.dislikeCount
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {v.tag1 && (
                                                <div className="video-meta-tags">
                                                    {[
                                                        v.tag1,
                                                        v.tag2,
                                                        v.tag3,
                                                        v.tag4,
                                                        v.tag5,
                                                    ]
                                                        .filter(Boolean)
                                                        .map((t, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="video-meta-tag"
                                                            >
                                                                #{t}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}

                                            <div className="video-meta-stats">
                                                <span className="video-meta-view">
                                                    조회수 {v.viewCount}
                                                </span>
                                                {v.uploadDate && (
                                                    <span className="video-meta-date">
                                                        업로드{" "}
                                                        {formatDate(
                                                            v.uploadDate
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <nav
                                className="video-pagination"
                                aria-label="영상 페이지 이동"
                            >
                                <button
                                    type="button"
                                    className="video-page-btn"
                                    disabled={page === 0}
                                    onClick={() =>
                                        handlePageChange(page - 1)
                                    }
                                >
                                    이전
                                </button>

                                {pageNumbers.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={
                                            "video-page-btn" +
                                            (p === page
                                                ? " video-page-btn--active"
                                                : "")
                                        }
                                        onClick={() =>
                                            handlePageChange(p)
                                        }
                                    >
                                        {p + 1}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className="video-page-btn"
                                    disabled={page === totalPages - 1}
                                    onClick={() =>
                                        handlePageChange(page + 1)
                                    }
                                >
                                    다음
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </div>

            {/* ✅ 갤러리 상세 모달 */}
            {selectedVideo && (
                <VideoDetailModal
                    video={selectedVideo}
                    reactionState={reactionState}
                    handleReaction={handleReaction}
                    formatDate={formatDate}
                    onClose={closeModal}
                    isLoggedIn={isLoggedIn}
                />
            )}
        </section>
    );
};

export default VideoGallery;
