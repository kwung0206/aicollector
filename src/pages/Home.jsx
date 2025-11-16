// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Story from "../components/home/Story.jsx";
import {
    getHomeSummary,
    toggleVideoReaction,
    increaseVideoView,
} from "../api/video";
import { FaThumbsUp, FaThumbsDown, FaTimes } from "react-icons/fa";

const ROTATE_MS = 6000;
const STREAM_BASE = "/api/videos";
const HOME_REACTION_KEY = "homeReactions"; // ✅ 홈 전용 로컬스토리지 키

const Home = () => {
    const navigate = useNavigate();

    const goVideos = () => navigate("/videos");
    const goUpload = () => navigate("/videos/upload");

    const [summary, setSummary] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // 👍👎 상태 (videoNo 기준)
    const [reactionState, setReactionState] = useState({});

    // ✅ 1) 처음 마운트 시, localStorage에서 홈 좋아요/싫어요 상태 복원
    useEffect(() => {
        try {
            const raw = localStorage.getItem(HOME_REACTION_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                setReactionState(parsed);
            }
        } catch (e) {
            console.error("홈 리액션 상태 복원 실패", e);
        }
    }, []);

    // 2) 홈 요약 데이터 한번 가져오기
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getHomeSummary();
                setSummary(data);

                // 요약에 있는 top 3 영상들에 대해 초기 좋아요/싫어요 상태 세팅
                setReactionState((prev) => {
                    const next = { ...prev };

                    const applyVideo = (v) => {
                        if (!v || !v.videoNo) return;
                        // ⚠ 이미 localStorage에서 복원된 값이 있으면 덮어쓰지 않음
                        if (next[v.videoNo]) return;
                        next[v.videoNo] = {
                            likeCount: v.likeCount ?? 0,
                            dislikeCount: v.dislikeCount ?? 0,
                            myReaction: v.myReaction ? v.myReaction.toLowerCase() : null,
                        };
                    };

                    applyVideo(data.topLiked);
                    applyVideo(data.topViewed);
                    applyVideo(data.topDisliked);

                    return next;
                });
            } catch (e) {
                console.error("홈 요약 데이터 불러오기 실패", e);
            }
        };
        fetchSummary();
    }, []);

    // topLiked / topViewed / topDisliked -> 슬라이드용 리스트로 정리
    const featuredList = useMemo(() => {
        if (!summary) return [];

        const list = [];

        if (summary.topLiked) {
            list.push({
                ...summary.topLiked,
                badge: "좋아요 1위",
                badgeType: "like",
            });
        }
        if (summary.topViewed) {
            list.push({
                ...summary.topViewed,
                badge: "조회수 1위",
                badgeType: "view",
            });
        }
        if (summary.topDisliked) {
            list.push({
                ...summary.topDisliked,
                badge: "싫어요 1위",
                badgeType: "dislike",
            });
        }

        return list;
    }, [summary]);

    // 자동 슬라이드
    useEffect(() => {
        if (!featuredList.length) return;
        const id = setInterval(
            () => setCurrentIdx((prev) => (prev + 1) % featuredList.length),
            ROTATE_MS
        );
        return () => clearInterval(id);
    }, [featuredList]);

    const currentVideo = featuredList[currentIdx] || null;

    // 현재 카드에 표시할 좋아요/싫어요 상태
    const currentReaction =
        currentVideo && reactionState[currentVideo.videoNo]
            ? reactionState[currentVideo.videoNo]
            : currentVideo
                ? {
                    likeCount: currentVideo.likeCount ?? 0,
                    dislikeCount: currentVideo.dislikeCount ?? 0,
                    myReaction: currentVideo.myReaction
                        ? currentVideo.myReaction.toLowerCase()
                        : null,
                }
                : null;

    const isLiked = currentReaction?.myReaction === "like";
    const isDisliked = currentReaction?.myReaction === "dislike";

    const likeCount =
        currentReaction?.likeCount ??
        (currentVideo ? currentVideo.likeCount ?? 0 : 0);
    const dislikeCount =
        currentReaction?.dislikeCount ??
        (currentVideo ? currentVideo.dislikeCount ?? 0 : 0);

    const totalVideosLabel = summary ? `${summary.totalCount}편` : "로딩 중...";

    const formatDate = (iso) => {
        if (!iso) return "";
        return iso.replace("T", " ").slice(0, 16);
    };

    // 👍 / 👎 토글
    const handleReaction = async (videoNo, type) => {
        try {
            const action = type === "like" ? "LIKE" : "DISLIKE";
            const data = await toggleVideoReaction(videoNo, action);

            setReactionState((prev) => {
                const next = {
                    ...prev,
                    [videoNo]: {
                        likeCount: data.likeCount ?? 0,
                        dislikeCount: data.dislikeCount ?? 0,
                        myReaction: data.myReaction
                            ? data.myReaction.toLowerCase()
                            : null,
                    },
                };

                // ✅ 홈 좋아요/싫어요 상태를 localStorage에 저장
                try {
                    localStorage.setItem(HOME_REACTION_KEY, JSON.stringify(next));
                } catch (e) {
                    console.error("홈 리액션 상태 저장 실패", e);
                }

                return next;
            });
        } catch (e) {
            console.error("홈 좋아요/싫어요 처리 실패", e);
        }
    };

    // 모달 열기/닫기
    const openModal = (video) => {
        if (!video) return;
        const rs = reactionState[video.videoNo];
        if (rs) {
            setSelectedVideo({ ...video, ...rs });
        } else {
            setSelectedVideo(video);
        }
    };

    const closeModal = () => setSelectedVideo(null);
    const currentModalVideoNo = selectedVideo?.videoNo;

    // ✅ 모달에 영상이 선택되면 조회수 1 증가
    useEffect(() => {
        if (!currentModalVideoNo) return;

        (async () => {
            try {
                const { viewCount } = await increaseVideoView(currentModalVideoNo);

                // 모달 안 숫자 갱신
                setSelectedVideo((prev) =>
                    prev && prev.videoNo === currentModalVideoNo
                        ? { ...prev, viewCount }
                        : prev
                );

                // 상단 슬라이드 카드에도 반영
                setSummary((prev) => {
                    if (!prev) return prev;

                    const patch = (v) =>
                        v && v.videoNo === currentModalVideoNo ? { ...v, viewCount } : v;

                    return {
                        ...prev,
                        topLiked: patch(prev.topLiked),
                        topViewed: patch(prev.topViewed),
                        topDisliked: patch(prev.topDisliked),
                    };
                });
            } catch (e) {
                console.error("조회수 증가 실패", e);
            }
        })();
    }, [currentModalVideoNo]);

    // 모달 열릴 때 body 스크롤 막기 + ESC 닫기
    useEffect(() => {
        if (!selectedVideo) return;

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
    }, [selectedVideo]);

    // 상단 랭킹 pill 색상 클래스
    const rankPillClass = currentVideo
        ? `pill ${
            currentVideo.badgeType === "like"
                ? "pill-rank-like"
                : currentVideo.badgeType === "view"
                    ? "pill-rank-view"
                    : "pill-rank-dislike"
        }`
        : "pill pill-live";

    return (
        <>
            {/* 히어로 섹션 */}
            <section className="hero">
                <section className="hero-left">
                    <p className="eyebrow">생성형 AI 영상 콜렉터</p>
                    <h1 className="hero-title">
                        흩어져 있는 <span>AI 영상</span>
                        <br />
                        한 곳에서 깔끔하게 모아보기
                    </h1>
                    <p className="hero-desc">
                        다양한 생성형 AI로 만든 영상
                        <br />
                        불편하게 인터넷을 찾아 다니지 말고, 여러 사용자들이 만든 영상들을
                        감상하고,
                        <br />
                        무료로 다운로드 받으세요.
                    </p>

                    <div className="hero-actions">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={goVideos}
                        >
                            지금 영상 보러가기
                        </button>

                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={goUpload}
                        >
                            지금 업로드하기
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-value">{totalVideosLabel}</span>
                            <span className="stat-label">등록된 AI 관련 영상</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">50+</span>
                            <span className="stat-label">
                카테고리(자연 · 게임 · 우주 등)
              </span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">파인딩</span>
                            <span className="stat-label">AI 기반 자동 추천</span>
                        </div>
                    </div>
                </section>

                {/* 오른쪽 카드 – 슬라이드 + 썸네일 + 좋아요/싫어요 + 모달 */}
                <section className="hero-right">
                    <div className="glass-card">
                        <div className="glass-header">
              <span className={rankPillClass}>
                {currentVideo ? currentVideo.badge : "추천 준비 중"}
              </span>
                            <span className="pill pill-ai">
                {currentVideo ? "AI 기반 큐레이션" : "AI TAG"}
              </span>
                        </div>

                        <div className="glass-main">
                            {/* 썸네일 부분 */}
                            <button
                                type="button"
                                className="thumbnail-button"
                                onClick={() => currentVideo && openModal(currentVideo)}
                                disabled={!currentVideo}
                            >
                                {currentVideo ? (
                                    <div className="thumbnail-image-wrapper">
                                        <video
                                            className="thumbnail-video"
                                            src={`${STREAM_BASE}/${currentVideo.videoNo}/stream`}
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                        <div className="thumbnail-play-icon">▶</div>
                                    </div>
                                ) : (
                                    <div className="thumbnail-skeleton">
                                        <div className="thumbnail-noise" />
                                        <div className="thumbnail-play">▶</div>
                                    </div>
                                )}
                            </button>

                            {/* 텍스트 정보 */}
                            <div className="glass-info">
                                <h2 className="glass-title-heading">
                                    {currentVideo
                                        ? currentVideo.title || "영상"
                                        : "추천 영상 불러오는 중..."}
                                </h2>

                                {currentVideo && (
                                    <div className="tag-row">
                                        {(currentVideo.tags || []).slice(0, 4).map((t) => (
                                            <span key={t} className="tag">
                        #{t}
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 🔻 좋아요/싫어요/조회수 – 카드 맨 아래 */}
                        <div className="glass-footer">
                            <div className="glass-footer-main">
                                <div className="hero-carousel-dots">
                                    {featuredList.map((v, idx) => (
                                        <button
                                            key={`${v.videoNo}-${v.badgeType}`}
                                            type="button"
                                            className={
                                                "hero-carousel-dot" +
                                                (idx === currentIdx
                                                    ? " hero-carousel-dot--active"
                                                    : "")
                                            }
                                            onClick={() => setCurrentIdx(idx)}
                                            aria-label={`${v.badge} 영상 보기`}
                                        />
                                    ))}
                                </div>

                                {currentVideo && (
                                    <div className="glass-stats-row glass-stats-row--footer">
                                        <div className="glass-stats-actions">
                                            <button
                                                type="button"
                                                className={
                                                    "video-like-btn" + (isLiked ? " is-active" : "")
                                                }
                                                onClick={() =>
                                                    handleReaction(currentVideo.videoNo, "like")
                                                }
                                                aria-label="좋아요"
                                            >
                                                <FaThumbsUp />
                                            </button>
                                            <span className="video-meta-count">{likeCount}</span>

                                            <button
                                                type="button"
                                                className={
                                                    "video-dislike-btn" + (isDisliked ? " is-active" : "")
                                                }
                                                onClick={() =>
                                                    handleReaction(currentVideo.videoNo, "dislike")
                                                }
                                                aria-label="싫어요"
                                            >
                                                <FaThumbsDown />
                                            </button>
                                            <span className="video-meta-count">{dislikeCount}</span>
                                        </div>

                                        <div className="glass-stats-view">
                                            조회수 {currentVideo.viewCount ?? 0}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </section>

            {/* 스토리/기능 섹션 */}
            <Story />

            {/* 🔍 영상 모달 – VideoGallery의 gallery-modal 스타일 재사용 */}
            {selectedVideo &&
                createPortal(
                    (() => {
                        const rs =
                            reactionState[selectedVideo.videoNo] || {
                                likeCount: selectedVideo.likeCount ?? 0,
                                dislikeCount: selectedVideo.dislikeCount ?? 0,
                                myReaction: selectedVideo.myReaction
                                    ? selectedVideo.myReaction.toLowerCase()
                                    : null,
                            };
                        const liked = rs.myReaction === "like";
                        const disliked = rs.myReaction === "dislike";

                        return (
                            <div
                                className="gallery-modal-backdrop"
                                onClick={closeModal}
                            >
                                <div
                                    className="gallery-modal"
                                    role="dialog"
                                    aria-modal="true"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <header className="gallery-modal-header">
                                        <div>
                                            <p className="gallery-modal-eyebrow">영상 상세 보기</p>
                                            <h2 className="gallery-modal-title">
                                                {selectedVideo.title}
                                            </h2>

                                            <div className="video-meta-stats gallery-modal-header-stats">
                        <span className="video-meta-view">
                          조회수 {selectedVideo.viewCount ?? 0}
                        </span>
                                                {selectedVideo.uploadDate && (
                                                    <span className="video-meta-date">
                            업로드 {formatDate(selectedVideo.uploadDate)}
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="gallery-modal-close"
                                            onClick={closeModal}
                                            aria-label="닫기"
                                        >
                                            <FaTimes />
                                        </button>
                                    </header>

                                    <div className="gallery-modal-body">
                                        <div className="gallery-modal-player-wrap">
                                            <video
                                                className="gallery-modal-player"
                                                src={`${STREAM_BASE}/${selectedVideo.videoNo}/stream`}
                                                controls
                                                autoPlay
                                            />
                                        </div>

                                        <div className="gallery-modal-meta">
                                            {/* 좋아요/싫어요 */}
                                            <div className="gallery-modal-field">
                                                <div className="video-meta-actions">
                                                    <button
                                                        type="button"
                                                        className={
                                                            "video-like-btn" + (liked ? " is-active" : "")
                                                        }
                                                        onClick={() =>
                                                            handleReaction(selectedVideo.videoNo, "like")
                                                        }
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
                                                            (disliked ? " is-active" : "")
                                                        }
                                                        onClick={() =>
                                                            handleReaction(selectedVideo.videoNo, "dislike")
                                                        }
                                                        aria-label="싫어요"
                                                    >
                                                        <FaThumbsDown />
                                                    </button>
                                                    <span className="video-meta-count">
                            {rs.dislikeCount}
                          </span>
                                                </div>
                                            </div>

                                            {/* 설명 */}
                                            {selectedVideo.description && (
                                                <div className="gallery-modal-field">
                                                    <span className="gallery-modal-label">설명</span>
                                                    <p className="gallery-modal-text">
                                                        {selectedVideo.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 태그 */}
                                            {selectedVideo.tag1 && (
                                                <div className="gallery-modal-field">
                                                    <span className="gallery-modal-label">태그</span>
                                                    <div className="gallery-modal-tags">
                                                        {[
                                                            selectedVideo.tag1,
                                                            selectedVideo.tag2,
                                                            selectedVideo.tag3,
                                                            selectedVideo.tag4,
                                                            selectedVideo.tag5,
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
                            </div>
                        );
                    })(),
                    document.body
                )}
        </>
    );
};

export default Home;
