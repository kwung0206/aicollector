// src/pages/Home.jsx
import Story from "../components/home/Story.jsx";

const Home = () => {
    return (
        <>
            {/* 기존 히어로 섹션 */}
            <section className="hero">
                <section className="hero-left">
                    <p className="eyebrow">AI · 보안 · 개발 영상 큐레이션</p>
                    <h1 className="hero-title">
                        흩어져 있는 <span>AI 영상</span>
                        <br />
                        한 곳에서 깔끔하게 모아보기
                    </h1>
                    <p className="hero-desc">
                        ChatGPT, RAG, MLOps, 보안까지.
                        <br />
                        유튜브 구독함에서 뒤지지 말고, 주제·난이도별로 정리된 영상만 쏙
                        골라보세요.
                    </p>

                    <div className="hero-actions">
                        <button className="btn btn-primary">지금 영상 보러가기</button>
                        <button className="btn btn-ghost">내 컬렉션 만들기</button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-value">128+</span>
                            <span className="stat-label">선별된 AI 관련 영상</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">12</span>
                            <span className="stat-label">
                카테고리(LLM · RAG · 보안 등)
              </span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">Soon</span>
                            <span className="stat-label">AI 기반 자동 추천 예정</span>
                        </div>
                    </div>
                </section>

                <section className="hero-right">
                    <div className="glass-card">
                        <div className="glass-header">
                            <span className="pill pill-live">LIVE 추천</span>
                            <span className="pill pill-ai">AI TAG</span>
                        </div>

                        <div className="glass-main">
                            <div className="thumbnail-skeleton">
                                <div className="thumbnail-noise" />
                                <div className="thumbnail-play">▶</div>
                            </div>

                            <div className="glass-info">
                                <h2>RAG로 AI 검색 서비스 만들기</h2>
                                <p>
                                    벡터 DB와 임베딩을 활용해서, 자소서·문서·영상까지 검색하는 AI
                                    검색 시스템을 구현하는 과정을 다룹니다.
                                </p>
                                <div className="tag-row">
                                    <span className="tag">#RAG</span>
                                    <span className="tag">#벡터DB</span>
                                    <span className="tag">#SpringBoot</span>
                                    <span className="tag">#LLM</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-footer">
                            <div className="wave-bar">
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="glass-footer-text">
                실제 서비스에서는 시청 기록과 태그를 기반으로 실시간 추천이
                들어옵니다.
              </span>
                        </div>
                    </div>
                </section>
            </section>

            {/* 🔽 여기서 우리가 만든 스토리/기능 섹션 사용 */}
            <Story />
        </>
    );
};

export default Home;
