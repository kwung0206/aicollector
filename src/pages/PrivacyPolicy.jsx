// src/pages/PrivacyPolicy.jsx
import "../scss/Login.scss";
import {
    TERMS_USE,
    TERMS_PRIVACY,
    TERMS_POLICY,
} from "../constants/terms";

const PrivacyPolicy = () => {
    return (
        <section className="login signup-page privacy-page">
            <div className="login-orbit login-orbit--one" />
            <div className="login-orbit login-orbit--two" />

            <div className="login-inner">
                {/* 왼쪽 설명 */}
                <div className="login-copy">
                    <p className="section-eyebrow">약관 및 개인정보 처리방침</p>
                    <h2 className="login-title">
                        AI 콜렉터에서
                        <br />
                        <span>개인정보와 약관을 어떻게 처리하는지</span> 안내드립니다.
                    </h2>
                    <p className="login-desc">
                        이 페이지는 회원가입 시 동의하셨던 이용약관 및
                        개인정보 수집·이용 내용을 언제든지 다시 확인하실 수 있도록
                        제공되는 화면입니다.
                    </p>
                </div>

                {/* 오른쪽 약관 카드 */}
                <div className="login-card">
                    <h3 className="login-card-title">약관 및 개인정보 처리 안내</h3>
                    <p className="login-card-sub">
                        회원가입 단계에서 보았던 이용약관, 개인정보 수집·이용,
                        정책정보 제공 동의 내용을 그대로 제공합니다.
                    </p>

                    <div className="terms-list">
                        {/* 1. 이용약관 (필수) */}
                        <div className="terms-item">
                            <div className="terms-header">
                                <div className="terms-left">
                  <span className="terms-badge terms-badge--required">
                    필수
                  </span>
                                    <span className="terms-title">AI 콜렉터 이용약관 동의</span>
                                </div>
                            </div>
                            <div className="terms-scroll">
                                <pre>{TERMS_USE}</pre>
                            </div>
                        </div>

                        {/* 2. 개인정보 수집·이용 및 조회 (필수) */}
                        <div className="terms-item">
                            <div className="terms-header">
                                <div className="terms-left">
                  <span className="terms-badge terms-badge--required">
                    필수
                  </span>
                                    <span className="terms-title">
                    개인정보 수집·이용 및 조회 동의
                  </span>
                                </div>
                            </div>
                            <div className="terms-scroll">
                                <pre>{TERMS_PRIVACY}</pre>
                            </div>
                        </div>

                        {/* 3. 정책정보 제공을 위한 수집·이용 (선택) */}
                        <div className="terms-item">
                            <div className="terms-header">
                                <div className="terms-left">
                  <span className="terms-badge terms-badge--optional">
                    선택
                  </span>
                                    <span className="terms-title">
                    정책정보 제공을 위한 개인정보 수집·이용 동의
                  </span>
                                </div>
                            </div>
                            <div className="terms-scroll">
                                <pre>{TERMS_POLICY}</pre>
                            </div>
                        </div>
                    </div>

                    <div className="terms-footer">
                        <p className="terms-hint">
                            ※ 이 문서는 서비스 이용 중 언제든지 확인하실 수 있도록 제공되는
                            참고용 페이지입니다. 실제 동의 여부는 회원가입 시 체크한 내용을
                            기준으로 합니다.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrivacyPolicy;
