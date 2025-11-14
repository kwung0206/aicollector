// src/components/home/Story.jsx
import ScrollReveal from "../common/ScrollReveal.jsx";

const Story = () => {
    return (
        <section className="story">
            <div className="story-inner">
                {/* 1. 왜 AI 콜렉터인가? */}
                <div className="story-layout">
                    <div className="story-left">
                        <p className="section-eyebrow">왜 AI 콜렉터인가?</p>
                        <h2 className="story-title">
                            생성형 AI 영상,
                            <br />
                            <span>만들기는 긴데, 찾기는 더 어렵다</span>
                        </h2>
                        <p className="story-desc">
                            AI 영상 제작에는 시간이 오래 걸립니다. 길게는 몇 시간 동안 프롬프트를
                            다듬어도, 막상 결과물은 사용자가 원하던 느낌과 전혀 다를 때가 많습니다.
                            <br />
                            <br />
                            무료 영상 제작 도구들은 일일 생성 횟수 제한까지 있어 마음껏
                            시도해보기도 어렵죠. 그래서 우리는{" "}
                            <strong>“이미 잘 만들어진 AI 영상들을 서로 공유할 수 있는 곳”</strong>이
                            필요하다고 생각했습니다.
                        </p>
                    </div>

                    <div className="story-right">
                        <ScrollReveal>
                            <article className="story-card">
                                <h3>제작 시간 ⏱</h3>
                                <p>
                                    하나의 AI 영상을 만들기 위해 프롬프트를 바꾸고, 스타일을 바꾸고,
                                    여러 번 다시 생성하는 과정이 반복됩니다. 그 시간만 모으면 작은
                                    프로젝트 하나를 끝낼 수 있을지도 모릅니다.
                                </p>
                            </article>
                        </ScrollReveal>

                        <ScrollReveal delay={120}>
                            <article className="story-card">
                                <h3>내가 원하는 느낌과의 거리 🎭</h3>
                                <p>
                                    어렵게 생성한 결과물이
                                    <br />
                                    “조금 애매한데… 다시 만들어볼까?” 싶은 경우가 많습니다. 완벽하게
                                    맞는 영상을 얻기까지의 시행착오가 너무 크다는 게 문제였습니다.
                                </p>
                            </article>
                        </ScrollReveal>

                        <ScrollReveal delay={240}>
                            <article className="story-card">
                                <h3>무료 도구의 한계 🔐</h3>
                                <p>
                                    무료 영상 생성 서비스는 일일 생성 제한, 워터마크, 해상도 제한 등
                                    여러 가지 제약이 걸려 있습니다.
                                    <br />
                                    그래서 우리는{" "}
                                    <strong>
                                        이미 만들어진 영상을 공유하고, 필요한 사람은 쉽게 다운받는
                                        공간
                                    </strong>
                                    을 만들기로 했습니다.
                                </p>
                            </article>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            {/* 2. AI 콜렉터가 제공할 기능 */}
            <div className="story-inner story-inner--features">
                <div className="story-layout">
                    <div className="story-left">
                        <p className="section-eyebrow">AI 콜렉터가 하는 일</p>
                        <h2 className="story-title">
                            “어떤 영상이 필요해?”
                            <br />
                            <span>묻고, 찾고, 필터링해준다</span>
                        </h2>
                        <p className="story-desc">
                            AI 콜렉터는 단순히 영상을 늘어놓는 저장소가 아니라,
                            <br />
                            <strong>“원하는 영상을 가장 빠르게 찾게 돕는 큐레이션 플랫폼”</strong>을
                            목표로 합니다.
                        </p>
                    </div>

                    <div className="story-right">
                        <ScrollReveal>
                            <article className="story-card story-card--feature">
                                <div className="story-chip">기능 1 · 카테고리 분류</div>
                                <h3>카테고리별 AI 영상 정리</h3>
                                <p>
                                    주제・스타일・길이・플랫폼 등 다양한 기준으로 영상을 분류해서
                                    사용자가 원하는 느낌의 영상을 빠르게 찾을 수 있게 도와줍니다.
                                    <br />
                                    “튜토리얼”, “소개 영상”, “서비스 데모” 같은 유형별 정리도
                                    지원할 예정입니다.
                                </p>
                            </article>
                        </ScrollReveal>

                        <ScrollReveal delay={120}>
                            <article className="story-card story-card--feature">
                                <div className="story-chip">기능 2 · 프롬프트 기반 추천</div>
                                <h3>프롬프트만 적으면 비슷한 영상 추천</h3>
                                <p>
                                    만들고 싶은 영상의 목적과 스타일, 사용하려는 프롬프트를 입력하면,
                                    그와 유사한 실제 영상들을 AI가 찾아서 목록으로 추천해 줍니다.
                                    <br />
                                    “이미 누군가가 만들어 본 결과물”을 참고해서 더 빠르게 원하는
                                    영상을 얻을 수 있습니다.
                                </p>
                            </article>
                        </ScrollReveal>

                        <ScrollReveal delay={240}>
                            <article className="story-card story-card--feature">
                                <div className="story-chip">기능 3 · 유해 콘텐츠 필터링</div>
                                <h3>AI 기반 유해 영상 필터링</h3>
                                <p>
                                    폭력적이거나 성적인 내용 등, 공유되면 안 되는 영상은 AI가 먼저
                                    필터링합니다. 신고 시스템과 함께 AI 검증을 병행하여,
                                    <br />
                                    <strong>“안전하게 공유할 수 있는 AI 영상 공간”</strong>이 되도록
                                    설계할 예정입니다.
                                </p>
                            </article>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Story;
