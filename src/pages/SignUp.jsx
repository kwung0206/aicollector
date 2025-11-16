// src/pages/SignUp.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/Login.scss";
import {
    TERMS_USE,
    TERMS_PRIVACY,
    TERMS_POLICY,
} from "../constants/terms";
// 긴 약관 텍스트는 pre 태그 안에서 줄바꿈 그대로 보여줄 거야.


const SignUp = () => {
    const navigate = useNavigate();

    const [agreeTerms, setAgreeTerms] = useState(false);     // 이용약관 (필수)
    const [agreePrivacy, setAgreePrivacy] = useState(false); // 개인정보 (필수)
    const [agreePolicy, setAgreePolicy] = useState(false);   // 정책정보 (선택)

    const allChecked = agreeTerms && agreePrivacy && agreePolicy;
    const canProceed = agreeTerms && agreePrivacy; // 필수 2개 동의해야 진행 가능

    const handleAllChange = (e) => {
        const checked = e.target.checked;
        setAgreeTerms(checked);
        setAgreePrivacy(checked);
        setAgreePolicy(checked);
    };

    const handleNext = () => {
        if (!canProceed) return;
        navigate("/signup/email");  // ✅ 이메일 인증 단계로 이동
    };
    return (
        <section className="login signup-page">
            <div className="login-orbit login-orbit--one" />
            <div className="login-orbit login-orbit--two" />

            <div className="login-inner">
                {/* 왼쪽 카피 영역 */}
                <div className="login-copy">
                    <p className="section-eyebrow">AI 콜렉터 회원가입</p>
                    <h2 className="login-title">
                        서비스 이용 전,
                        <br />
                        <span>약관과 개인정보 활용 내용을 확인해 주세요.</span>
                    </h2>
                    <p className="login-desc">
                        AI 콜렉터는 생성형 AI로 만든 영상들을 서로 공유하고,
                        <br />
                        원하는 영상을 쉽게 찾아 다운로드할 수 있는 플랫폼입니다.
                        <br />
                        아래 약관과 개인정보 처리 내용을 읽고 동의해 주세요.
                    </p>
                </div>

                {/* 오른쪽 약관 카드 */}
                <div className="login-card">
                    <h3 className="login-card-title">약관 동의</h3>
                    <p className="login-card-sub">
                        서비스 이용을 위해 필수 약관 두 개 이상에 동의해 주세요.
                    </p>

                    {/* 전체 동의 */}
                    <div className="terms-all">
                        <label>
                            <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={handleAllChange}
                            />
                            <span>전체 동의</span>
                        </label>
                        <p className="terms-all-desc">
                            이용약관, 개인정보 수집·이용(필수) 및 정책정보 제공(선택) 동의를
                            한 번에 처리합니다.
                        </p>
                    </div>

                    <div className="terms-list">
                        {/* 1. 이용약관 */}
                        <div className="terms-item">
                            <div className="terms-header">
                                <div className="terms-left">
                  <span className="terms-badge terms-badge--required">
                    필수
                  </span>
                                    <span className="terms-title">AI 콜렉터 이용약관 동의</span>
                                </div>
                                <label className="terms-agree">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                    />
                                    동의합니다
                                </label>
                            </div>
                            <div className="terms-scroll">
                                <pre>{TERMS_USE}</pre>
                            </div>
                        </div>

                        {/* 2. 개인정보 수집·이용 */}
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
                                <label className="terms-agree">
                                    <input
                                        type="checkbox"
                                        checked={agreePrivacy}
                                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                                    />
                                    동의합니다
                                </label>
                            </div>
                            <div className="terms-scroll">
                                <pre>{TERMS_PRIVACY}</pre>
                            </div>
                        </div>

                        {/* 3. 정책정보 제공 (선택) */}
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
                                <label className="terms-agree">
                                    <input
                                        type="checkbox"
                                        checked={agreePolicy}
                                        onChange={(e) => setAgreePolicy(e.target.checked)}
                                    />
                                    동의합니다
                                </label>
                            </div>
                            <div className="terms-scroll">
                                <pre>{TERMS_POLICY}</pre>
                            </div>
                        </div>
                    </div>

                    <div className="terms-footer">
                        <p className="terms-hint">
                            * 필수 항목에 동의하지 않으실 경우 서비스 이용이 제한될 수
                            있습니다.
                        </p>
                        <button
                            type="button"
                            className="btn btn-primary terms-submit"
                            disabled={!canProceed}
                            onClick={handleNext}
                        >
                            동의하고 회원가입 계속하기
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
