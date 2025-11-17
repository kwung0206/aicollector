// src/pages/SignUpEmail.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/Login.scss";
import { sendEmailCode, verifyEmailCode } from "../api/auth";

const SignUpEmail = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState("email"); // "email" | "code"
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const isValidEmail =
        email.trim().length > 3 && email.includes("@") && email.includes(".");

    /** ✅ 인증번호 보내기 */
    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!isValidEmail || loading) return;

        setError("");
        setInfo("");

        try {
            setLoading(true);
            // 백엔드로 실제 요청
            await sendEmailCode(email.trim());
            setInfo("인증번호를 전송했습니다. 이메일을 확인해 주세요.");
            setStep("code");
        } catch (err) {
            console.error("이메일 인증번호 발송 실패:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "인증 메일을 보내는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    /** ✅ 인증번호 확인 */
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!code.trim() || loading) return;

        setError("");
        setInfo("");

        try {
            setLoading(true);
            // 백엔드로 실제 검증 요청
            await verifyEmailCode(email.trim(), code.trim());
            setInfo("이메일 인증이 완료되었습니다.");

            // ✅ 다음 단계(회원 정보 입력)으로 이동하면서 이메일 넘기기
            navigate("/signup/form", {
                state: { email: email.trim() },
            });
        } catch (err) {
            console.error("이메일 인증번호 검증 실패:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "인증번호 확인 중 오류가 발생했습니다. 다시 시도해 주세요.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const goBackToEmail = () => {
        setStep("email");
        setCode("");
        setError("");
        setInfo("");
    };

    return (
        <section className="login signup-email">
            {/* 부드러운 배경 */}
            <div className="login-orbit login-orbit--one" />
            <div className="login-orbit login-orbit--two" />

            <div className="login-inner">
                {/* 왼쪽 설명 영역 (가로 배치 유지) */}
                <div className="login-copy">
                    <p className="section-eyebrow">AI 콜렉터 회원가입</p>
                    {step === "email" ? (
                        <>
                            <h2 className="login-title">
                                이메일로,
                                <br />
                                <span>AI 콜렉터 계정을 안전하게 지켜요.</span>
                            </h2>
                            <p className="login-desc">
                                로그인과 비밀번호 찾기를 위해 이메일이 꼭 필요해요.
                                <br />
                                자주 사용하는 이메일을 입력해 주세요. 입력하신 주소로
                                인증번호를 보내 드립니다.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="login-title">
                                방금 보낸
                                <br />
                                <span>인증번호를 확인해 주세요.</span>
                            </h2>
                            <p className="login-desc">
                                아래 주소로 인증번호를 보냈어요.
                                <br />
                                {`10분 이내에 인증번호를 입력하면 다음 단계로 이동합니다.`}
                                <br />
                                <br />
                                <strong
                                    style={{ color: "#e5e7eb", fontWeight: 500 }}
                                >
                                    {email}
                                </strong>
                            </p>
                        </>
                    )}
                </div>

                {/* 오른쪽 카드 영역 */}
                <div className="login-card">
                    {step === "email" ? (
                        <>
                            <h3 className="login-card-title">이메일 입력</h3>
                            <p className="login-card-sub">
                                계정에 사용할 이메일 주소를 입력해 주세요. 로그인 및 비밀번호
                                찾기에 사용됩니다.
                            </p>

                            <form className="login-form" onSubmit={handleSendCode}>
                                <div className="form-field">
                                    <label htmlFor="signup-email">이메일</label>
                                    <input
                                        id="signup-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* 서버에서 온 메시지 */}
                                {info && (
                                    <p
                                        style={{
                                            color: "#38bdf8",
                                            fontSize: "0.85rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {info}
                                    </p>
                                )}
                                {error && (
                                    <p
                                        style={{
                                            color: "#f87171",
                                            fontSize: "0.85rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {error}
                                    </p>
                                )}

                                <div className="login-actions-top">
                                    <button
                                        type="submit"
                                        className="btn btn-primary login-submit"
                                        disabled={!isValidEmail || loading}
                                    >
                                        {loading ? "전송 중..." : "다음 (인증번호 보내기)"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <h3 className="login-card-title">인증번호 확인</h3>
                            <p className="login-card-sub">
                                입력하신 이메일 주소로 전송된 인증번호 6자리를 입력해 주세요.
                            </p>

                            <form className="login-form" onSubmit={handleVerifyCode}>
                                <div className="form-field">
                                    <label htmlFor="signup-code">인증번호</label>
                                    <input
                                        id="signup-code"
                                        type="text"
                                        maxLength={10}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </div>

                                {/* 서버에서 온 메시지 */}
                                {info && (
                                    <p
                                        style={{
                                            color: "#38bdf8",
                                            fontSize: "0.85rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {info}
                                    </p>
                                )}
                                {error && (
                                    <p
                                        style={{
                                            color: "#f87171",
                                            fontSize: "0.85rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {error}
                                    </p>
                                )}

                                <div className="login-actions-top">
                                    <button
                                        type="submit"
                                        className="btn btn-primary login-submit"
                                        disabled={!code.trim() || loading}
                                    >
                                        {loading ? "확인 중..." : "인증하고 다음 단계로"}
                                    </button>

                                    <div className="login-links">
                                        <button
                                            type="button"
                                            className="link-button"
                                            onClick={handleSendCode}
                                            disabled={loading}
                                        >
                                            인증번호 다시 받기
                                        </button>
                                        <span className="link-divider">|</span>
                                        <button
                                            type="button"
                                            className="link-button"
                                            onClick={goBackToEmail}
                                            disabled={loading}
                                        >
                                            이메일 주소 변경
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SignUpEmail;
