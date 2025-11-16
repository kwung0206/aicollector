import React, { useEffect, useMemo, useState } from "react";
import "../scss/Finding.scss";
import {
    FaSearch,
    FaThumbsUp,
    FaThumbsDown,
    FaPlay,
    FaTimes,
} from "react-icons/fa";
import api from "../api/apiClient.js";
import { createPortal } from "react-dom";
import { toggleVideoReaction, increaseVideoView  } from "../api/video"; // 👍/👎 API 재사용

const EXAMPLE_PROMPTS = [
    "RAG 구조를 쉽게 설명해주는 강의 추천해줘",
    "파이토치 Transformer 구현 과정 설명해 주는 영상",
    "자연어 처리 입문자를 위한 개념 총정리",
];

const SORT_OPTIONS = [
    { id: "views", label: "조회수" },
    { id: "latest", label: "최신순" },
    { id: "oldest", label: "오래된순" },
    { id: "likes", label: "좋아요순" },
    { id: "dislikes", label: "싫어요순" },
];

const ACCURACY_OPTIONS = [
    { id: "all", label: "정확도 전체" },
    { id: "high", label: "높음" },
    { id: "medium", label: "보통" },
    { id: "low", label: "낮음" },
];

const STREAM_BASE = "/api/videos";

const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const z = (v) => String(v).padStart(2, "0");
    return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())}`;
};

const formatNumber = (n) => Number(n || 0).toLocaleString("ko-KR");

// 초 → "MM:SS"
const formatDurationFromSec = (sec) => {
    if (sec === null || sec === undefined) return "-";
    const total = Number(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    const z = (v) => String(v).padStart(2, "0");
    return `${m}:${z(s)}`;
};

/** 🔍 프롬프트 검색 결과용 영상 모달 (좋아요/싫어요 포함) */
const SearchVideoModal = ({ video, reaction, onReaction, onClose }) => {
    if (!video) return null;

    const rs =
        reaction || {
            likeCount: video.likes ?? 0,
            dislikeCount: video.dislikes ?? 0,
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
                                조회수 {formatNumber(rs.likeCount + rs.dislikeCount ? video.views : video.views)}
                            </span>
                            {video.createdAt && (
                                <span className="video-meta-date">
                                    업로드 {formatDate(video.createdAt)}
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
                    {/* ▶ 위쪽: 영상 플레이어 */}
                    <div className="gallery-modal-player-wrap">
                        <video
                            className="gallery-modal-player"
                            src={`${STREAM_BASE}/${video.videoNo}/stream`}
                            controls
                            autoPlay
                        />
                    </div>

                    {/* ▶ 아래쪽: 메타 정보 + 반응 */}
                    <div className="gallery-modal-meta">
                        {/* 좋아요 / 싫어요 */}
                        <div className="gallery-modal-field">
                            <span className="gallery-modal-label">반응</span>
                            <div className="video-meta-actions">
                                <button
                                    type="button"
                                    className={
                                        "video-like-btn" + (liked ? " is-active" : "")
                                    }
                                    onClick={() => onReaction(video.videoNo, "like")}
                                    aria-label="좋아요"
                                >
                                    <FaThumbsUp />
                                </button>
                                <span className="video-meta-count">
                                    {formatNumber(rs.likeCount)}
                                </span>

                                <button
                                    type="button"
                                    className={
                                        "video-dislike-btn" +
                                        (disliked ? " is-active" : "")
                                    }
                                    onClick={() => onReaction(video.videoNo, "dislike")}
                                    aria-label="싫어요"
                                >
                                    <FaThumbsDown />
                                </button>
                                <span className="video-meta-count">
                                    {formatNumber(rs.dislikeCount)}
                                </span>
                            </div>
                        </div>

                        {/* 설명 */}
                        {video.description && (
                            <div className="gallery-modal-field">
                                <span className="gallery-modal-label">설명</span>
                                <p className="gallery-modal-text">
                                    {video.description}
                                </p>
                            </div>
                        )}

                        {/* 태그 */}
                        {video.tags && video.tags.length > 0 && (
                            <div className="gallery-modal-field">
                                <span className="gallery-modal-label">태그</span>
                                <div className="gallery-modal-tags">
                                    {video.tags.map((t) => (
                                        <span key={t} className="gallery-modal-tag">
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

const Finding = () => {
    const [prompt, setPrompt] = useState("");
    const [lastQuery, setLastQuery] = useState("");
    const [sort, setSort] = useState("latest");
    const [accuracyFilter, setAccuracyFilter] = useState("all");
    const [isSearching, setIsSearching] = useState(false);
    const [typingHint, setTypingHint] = useState(false);
    const [exampleIdx, setExampleIdx] = useState(0);

    const [videos, setVideos] = useState([]); // 검색 결과
    const [intentSummary, setIntentSummary] = useState("");

    // 👍/👎 상태 (videoNo 기준)
    const [reactionState, setReactionState] = useState({});

    // 모달에 띄울 영상
    const [selectedVideo, setSelectedVideo] = useState(null);

    const currentModalVideoNo = selectedVideo?.videoNo;

    // ✅ 모달 열릴 때 조회수 1 증가
    useEffect(() => {
        if (!currentModalVideoNo) return;

        (async () => {
            try {
                const { viewCount } = await increaseVideoView(currentModalVideoNo);

                // 리스트(검색 결과)의 views 갱신
                setVideos((prev) =>
                    prev.map((v) =>
                        v.videoNo === currentModalVideoNo
                            ? { ...v, views: viewCount } // 🔹 Finding 쪽은 필드명이 views
                            : v
                    )
                );

                // 모달 안 숫자 갱신
                setSelectedVideo((prev) =>
                    prev && prev.videoNo === currentModalVideoNo
                        ? { ...prev, views: viewCount }
                        : prev
                );
            } catch (e) {
                console.error("조회수 증가 실패", e);
            }
        })();
    }, [currentModalVideoNo]);

    // 예시 프롬프트 순환
    useEffect(() => {
        const timer = setInterval(
            () => setExampleIdx((idx) => (idx + 1) % EXAMPLE_PROMPTS.length),
            5000
        );
        return () => clearInterval(timer);
    }, []);

    // 입력 중 상태
    useEffect(() => {
        if (!prompt) {
            setTypingHint(false);
            return;
        }
        setTypingHint(true);
        const t = setTimeout(() => setTypingHint(false), 800);
        return () => clearTimeout(t);
    }, [prompt]);

    // 모달 열릴 때 body 스크롤 잠그고 ESC 로 닫기
    useEffect(() => {
        if (!selectedVideo) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (e) => {
            if (e.key === "Escape") setSelectedVideo(null);
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [selectedVideo]);

    const handleSearch = async () => {
        const q = prompt.trim();
        if (!q) return;

        setLastQuery(q);
        setIsSearching(true);
        setAccuracyFilter("all");

        try {
            const { data } = await api.post("/finding/search", {
                prompt: q,
                sort,
            });

            setIntentSummary(data.intentSummary || "");

            const mapped =
                (data.videos || []).map((v) => ({
                    id: v.videoNo ?? v.id,
                    videoNo: v.videoNo ?? v.id,
                    title: v.title,
                    description: v.description,
                    views: v.views ?? 0,
                    likes: v.likes ?? 0,
                    dislikes: v.dislikes ?? 0,
                    createdAt: v.createdAt,
                    duration: v.durationSec
                        ? formatDurationFromSec(v.durationSec)
                        : v.duration,
                    tags: v.tags || [],
                    matchScore: v.matchScore ?? 0,
                    matchLevel: (v.matchLevel || "MEDIUM").toUpperCase(),
                    myReaction: v.myReaction
                        ? v.myReaction.toLowerCase()
                        : null,
                })) || [];

            setVideos(mapped);

            // 👍/👎 초기 상태 세팅
            setReactionState((prev) => {
                const next = { ...prev };
                mapped.forEach((v) => {
                    if (!next[v.videoNo]) {
                        next[v.videoNo] = {
                            likeCount: v.likes ?? 0,
                            dislikeCount: v.dislikes ?? 0,
                            myReaction: v.myReaction,
                        };
                    }
                });
                return next;
            });
        } catch (e) {
            console.error("프롬프트 검색 실패", e);
            setVideos([]);
            setIntentSummary("");
            setReactionState({});
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSearch();
        }
    };

    // 👍/👎 토글
    const handleReaction = async (videoNo, type) => {
        try {
            const action = type === "like" ? "LIKE" : "DISLIKE";
            const data = await toggleVideoReaction(videoNo, action);

            setReactionState((prev) => ({
                ...prev,
                [videoNo]: {
                    likeCount:
                        data.likeCount ??
                        prev[videoNo]?.likeCount ??
                        0,
                    dislikeCount:
                        data.dislikeCount ??
                        prev[videoNo]?.dislikeCount ??
                        0,
                    myReaction: data.myReaction
                        ? data.myReaction.toLowerCase()
                        : null,
                },
            }));

            // 리스트에 보이는 숫자도 같이 갱신
            setVideos((prev) =>
                prev.map((v) =>
                    v.videoNo === videoNo
                        ? {
                            ...v,
                            likes:
                                data.likeCount ??
                                v.likes,
                            dislikes:
                                data.dislikeCount ??
                                v.dislikes,
                            myReaction: data.myReaction
                                ? data.myReaction.toLowerCase()
                                : null,
                        }
                        : v
                )
            );
        } catch (err) {
            console.error("좋아요/싫어요 처리 실패:", err);
        }
    };

    const filteredVideos = useMemo(() => {
        let list = [...videos];

        if (accuracyFilter !== "all") {
            list = list.filter((v) => {
                const lvl = (v.matchLevel || "").toLowerCase();
                return lvl === accuracyFilter;
            });
        }

        switch (sort) {
            case "views":
                list.sort((a, b) => b.views - a.views);
                break;
            case "latest":
                list.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case "oldest":
                list.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                break;
            case "likes":
                list.sort((a, b) => b.likes - a.likes);
                break;
            case "dislikes":
                list.sort((a, b) => b.dislikes - a.dislikes);
                break;
            default:
                break;
        }

        return list;
    }, [videos, sort, accuracyFilter]);

    const resultCount = filteredVideos.length;

    const renderAccuracyPill = (level) => {
        const lvl = (level || "").toUpperCase();
        if (!lvl) return null;
        const label =
            lvl === "HIGH" ? "높음" : lvl === "LOW" ? "낮음" : "보통";

        return (
            <span
                className={`finding-accuracy-pill level-${lvl.toLowerCase()}`}
            >
                {label}
            </span>
        );
    };

    return (
        <section className="finding">
            <div className="finding-inner">
                {/* 왼쪽: 프롬프트 입력 */}
                <div className="finding-left">
                    <p className="finding-eyebrow">Prompt to Video</p>
                    <h1 className="finding-title">
                        프롬프트 한 줄로
                        <br />
                        <span>비슷한 AI 영상</span>을 찾아보세요
                    </h1>
                    <p className="finding-desc">
                        찾고 싶은 내용을 자연어로 편하게 적으면,
                        <br />
                        백엔드에서 ChatGPT로 프롬프트를 분석하고,
                        추출된 특징 태그를 기준으로 비슷한 영상을 찾아줍니다.
                    </p>

                    <div className="finding-prompt-card">
                        <div className="finding-prompt-header">
                            <div className="finding-pill finding-pill--ai">
                                <FaSearch />
                                <span>프롬프트 검색</span>
                            </div>
                            <span className="finding-example">
                                예시: {EXAMPLE_PROMPTS[exampleIdx]}
                            </span>
                        </div>

                        <div className="finding-prompt-body">
                            <textarea
                                className="finding-prompt-input"
                                placeholder="예) GPT와 RAG의 차이를 직관적으로 설명해주는 강의를 찾고 싶어요."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div className="finding-prompt-footer">
                            <div className="finding-prompt-status">
                                {typingHint && (
                                    <span className="finding-status-dot" />
                                )}
                                {typingHint
                                    ? "AI가 프롬프트를 이해하는 중..."
                                    : lastQuery
                                        ? "AI가 해당 프롬프트를 기준으로 영상을 검색한 결과예요."
                                        : "Ctrl + Enter 로 바로 검색할 수 있어요."}
                            </div>
                            <div className="finding-prompt-meta">
                                <span className="finding-char-count">
                                    {prompt.length}자
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-primary finding-search-btn"
                                    onClick={handleSearch}
                                    disabled={!prompt.trim() || isSearching}
                                >
                                    <FaSearch />
                                    <span>
                                        {isSearching
                                            ? "검색 중..."
                                            : "프롬프트로 찾기"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 결과 리스트 */}
                <div className="finding-right">
                    <div className="finding-results">
                        <div className="finding-results-top">
                            <div className="finding-results-info">
                                <p className="finding-results-title">
                                    검색 결과
                                </p>
                                <p className="finding-results-sub">
                                    {lastQuery
                                        ? `프롬프트 기준 유사한 후보 ${resultCount}개`
                                        : "프롬프트를 입력하면 검색 결과가 여기에 표시됩니다."}
                                </p>

                                {intentSummary && (
                                    <p className="finding-intent">
                                        AI 요약: {intentSummary}
                                    </p>
                                )}
                            </div>

                            <div className="finding-controls">
                                <div className="finding-sortbar">
                                    {SORT_OPTIONS.map((opt) => {
                                        const active = sort === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                className={
                                                    "finding-sort-pill" +
                                                    (active ? " is-active" : "")
                                                }
                                                onClick={() => setSort(opt.id)}
                                            >
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="finding-accuracy-filter">
                                    {ACCURACY_OPTIONS.map((opt) => {
                                        const active =
                                            accuracyFilter === opt.id;
                                        const levelClass =
                                            opt.id === "all"
                                                ? " is-all"
                                                : opt.id === "high"
                                                    ? " is-high"
                                                    : opt.id === "medium"
                                                        ? " is-medium"
                                                        : opt.id === "low"
                                                            ? " is-low"
                                                            : "";

                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                className={
                                                    "finding-accuracy-btn" +
                                                    (active ? " is-active" : "") +
                                                    (active ? levelClass : "")
                                                }
                                                onClick={() =>
                                                    setAccuracyFilter(opt.id)
                                                }
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="finding-results-scroll">
                            {isSearching ? (
                                <>
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className="finding-video-card finding-video-card--skeleton"
                                        >
                                            <div className="finding-thumb-skeleton" />
                                            <div className="finding-video-main">
                                                <div className="finding-line-skeleton finding-line-skeleton--lg" />
                                                <div className="finding-line-skeleton finding-line-skeleton--md" />
                                                <div className="finding-line-skeleton finding-line-skeleton--sm" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : !lastQuery ? (
                                <div className="finding-empty finding-empty--initial">
                                    <p>아직 검색 전이에요.</p>
                                    <p>왼쪽에 프롬프트를 입력하고 검색해 보세요.</p>
                                </div>
                            ) : resultCount === 0 ? (
                                <div className="finding-empty">
                                    <p>조건에 맞는 영상이 없어요.</p>
                                    <p>프롬프트를 조금 더 넓게 적어보는 건 어떨까요?</p>
                                </div>
                            ) : (
                                filteredVideos.map((v) => {
                                    const rs = reactionState[v.videoNo];
                                    const likes =
                                        rs?.likeCount ?? v.likes;
                                    const dislikes =
                                        rs?.dislikeCount ?? v.dislikes;

                                    return (
                                        <article
                                            key={v.id}
                                            className="finding-video-card"
                                        >
                                            <div
                                                className="finding-thumb"
                                                onClick={() =>
                                                    setSelectedVideo(v)
                                                }
                                            >
                                                <video
                                                    className="finding-thumb-video"
                                                    src={`${STREAM_BASE}/${v.videoNo}/stream`}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    controls={false}
                                                />
                                                <div className="finding-thumb-overlay">
                                                    <FaPlay />
                                                </div>
                                                <span className="finding-thumb-duration">
                                                    {v.duration || "-"}
                                                </span>
                                            </div>
                                            <div className="finding-video-main">
                                                <h3 className="finding-video-title">
                                                    {v.title}
                                                </h3>
                                                <p className="finding-video-desc">
                                                    {v.description}
                                                </p>
                                                <div className="finding-video-meta">
                                                    <span>
                                                        조회수{" "}
                                                        {formatNumber(
                                                            v.views
                                                        )}
                                                    </span>
                                                    <span>·</span>
                                                    <span>
                                                        {formatDate(
                                                            v.createdAt
                                                        )}
                                                    </span>
                                                    <span>·</span>
                                                    {renderAccuracyPill(
                                                        v.matchLevel
                                                    )}
                                                </div>
                                                <div className="finding-video-stats">
                                                    <span>
                                                        <FaThumbsUp />{" "}
                                                        {formatNumber(likes)}
                                                    </span>
                                                    <span>
                                                        <FaThumbsDown />{" "}
                                                        {formatNumber(
                                                            dislikes
                                                        )}
                                                    </span>
                                                </div>
                                                {v.tags &&
                                                    v.tags.length > 0 && (
                                                        <div className="finding-video-tags">
                                                            {v.tags.map(
                                                                (t) => (
                                                                    <span
                                                                        key={t}
                                                                        className="finding-tag"
                                                                    >
                                                                        #{t}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔍 모달 (여기서 좋아요/싫어요 가능) */}
            {selectedVideo && (
                <SearchVideoModal
                    video={selectedVideo}
                    reaction={reactionState[selectedVideo.videoNo]}
                    onReaction={handleReaction}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </section>
    );
};

export default Finding;
