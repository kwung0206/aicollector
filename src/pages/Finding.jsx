// src/pages/Finding.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../scss/Finding.scss";
import {
    FaSearch,
    FaFire,
    FaClock,
    FaArrowUp,
    FaArrowDown,
    FaThumbsUp,
    FaThumbsDown,
    FaPlay,
} from "react-icons/fa";

const EXAMPLE_PROMPTS = [
    "RAG 구조를 쉽게 설명해주는 강의 추천해줘",
    "파이토치 Transformer 구현 과정 설명해 주는 영상",
    "자연어 처리 입문자를 위한 개념 총정리",
];

const MOCK_VIDEOS = [
    {
        id: 1,
        title: "RAG(Retrieval-Augmented Generation) 아키텍처 한 번에 이해하기",
        description: "문서 검색 + 생성 결합 구조를 실제 코드 예제와 함께 설명합니다.",
        views: 18423,
        likes: 920,
        dislikes: 12,
        createdAt: "2025-11-04T10:00:00Z",
        duration: "18:32",
        tags: ["RAG", "LLM", "검색"],
    },
    {
        id: 2,
        title: "PyTorch로 Transformer 인코더를 처음부터 구현해보기",
        description: "Multi-Head Attention, Positional Encoding까지 디테일하게 구현.",
        views: 32501,
        likes: 1580,
        dislikes: 20,
        createdAt: "2025-10-28T08:30:00Z",
        duration: "27:15",
        tags: ["PyTorch", "Transformer", "딥러닝"],
    },
    {
        id: 3,
        title: "자연어 처리 개념 총정리: 토큰화부터 GPT까지",
        description: "NLP 개념을 그림과 함께 직관적으로 설명하는 입문용 강의.",
        views: 9050,
        likes: 610,
        dislikes: 5,
        createdAt: "2025-09-15T14:20:00Z",
        duration: "22:47",
        tags: ["NLP", "입문", "GPT"],
    },
    {
        id: 4,
        title: "컴퓨터 비전으로 실시간 객체 탐지 시스템 만들기",
        description: "YOLO 기반 실시간 탐지 파이프라인 구현 과정.",
        views: 45210,
        likes: 2103,
        dislikes: 44,
        createdAt: "2025-07-02T11:10:00Z",
        duration: "31:09",
        tags: ["CV", "YOLO", "실시간"],
    },
    {
        id: 5,
        title: "LLM 프롬프트 엔지니어링 실전 팁 10가지",
        description: "실제 서비스에 쓰이는 프롬프트 패턴과 실전 노하우를 정리합니다.",
        views: 12890,
        likes: 870,
        dislikes: 10,
        createdAt: "2025-08-10T09:00:00Z",
        duration: "16:40",
        tags: ["프롬프트", "LLM", "서비스"],
    },
];

const SORT_OPTIONS = [
    { id: "views", label: "조회수", icon: FaFire },
    { id: "latest", label: "최신순", icon: FaArrowDown },
    { id: "oldest", label: "오래된순", icon: FaArrowUp },
    { id: "likes", label: "좋아요순", icon: FaThumbsUp },
    { id: "dislikes", label: "싫어요순", icon: FaThumbsDown },
];

const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const z = (v) => String(v).padStart(2, "0");
    return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())}`;
};

const formatNumber = (n) => n.toLocaleString("ko-KR");

const Finding = () => {
    const [prompt, setPrompt] = useState("");
    const [lastQuery, setLastQuery] = useState("");
    const [sort, setSort] = useState("latest");
    const [isSearching, setIsSearching] = useState(false);
    const [typingHint, setTypingHint] = useState(false);
    const [exampleIdx, setExampleIdx] = useState(0);

    // 예시 프롬프트 순환
    useEffect(() => {
        const timer = setInterval(() => {
            setExampleIdx((idx) => (idx + 1) % EXAMPLE_PROMPTS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // 입력 중 상태 (살짝 반짝이는 "AI가 이해 중..." 표시)
    useEffect(() => {
        if (!prompt) {
            setTypingHint(false);
            return;
        }
        setTypingHint(true);
        const t = setTimeout(() => setTypingHint(false), 800);
        return () => clearTimeout(t);
    }, [prompt]);

    const handleSearch = () => {
        const q = prompt.trim();
        setLastQuery(q);
        setIsSearching(true);
        // 실제 API 연동 시 여기서 호출
        setTimeout(() => {
            setIsSearching(false);
        }, 500); // UX용 가짜 로딩
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSearch();
        }
    };

    const filteredVideos = useMemo(() => {
        let list = [...MOCK_VIDEOS];

        if (lastQuery) {
            const q = lastQuery.toLowerCase();
            list = list.filter(
                (v) =>
                    v.title.toLowerCase().includes(q) ||
                    v.description.toLowerCase().includes(q) ||
                    v.tags.some((t) => t.toLowerCase().includes(q))
            );
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
    }, [lastQuery, sort]);

    const resultCount = filteredVideos.length;

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
                        나중에 백엔드에서 임베딩 기반으로 유사한 영상을 찾아줄 예정입니다.
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
                                        ? `“${lastQuery}” 기준으로 임시 결과를 보여주고 있어요.`
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
                                        {isSearching ? "검색 중..." : "프롬프트로 찾기"}
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
                                        ? `“${lastQuery}” 와(과) 유사한 후보 ${resultCount}개`
                                        : `예시 데이터 ${MOCK_VIDEOS.length}개를 보여주고 있어요.`}
                                </p>
                            </div>

                            <div className="finding-sortbar">
                                {SORT_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
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
                                            <Icon />
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
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
                            ) : resultCount === 0 ? (
                                <div className="finding-empty">
                                    <p>아직 조건에 맞는 영상이 없어요.</p>
                                    <p>프롬프트를 조금 더 넓게 적어보는 건 어떨까요?</p>
                                </div>
                            ) : (
                                filteredVideos.map((v) => (
                                    <article
                                        key={v.id}
                                        className="finding-video-card"
                                    >
                                        <div className="finding-thumb">
                                            <div className="finding-thumb-overlay">
                                                <FaPlay />
                                            </div>
                                            <span className="finding-thumb-duration">
                                                {v.duration}
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
                                                    조회수 {formatNumber(v.views)}
                                                </span>
                                                <span>·</span>
                                                <span>{formatDate(v.createdAt)}</span>
                                            </div>
                                            <div className="finding-video-stats">
                                                <span>
                                                    <FaThumbsUp />{" "}
                                                    {formatNumber(v.likes)}
                                                </span>
                                                <span>
                                                    <FaThumbsDown />{" "}
                                                    {formatNumber(v.dislikes)}
                                                </span>
                                            </div>
                                            <div className="finding-video-tags">
                                                {v.tags.map((t) => (
                                                    <span
                                                        key={t}
                                                        className="finding-tag"
                                                    >
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Finding;
