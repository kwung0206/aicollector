// src/pages/Login.jsx
import "../scss/Login.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!userId.trim() || !password.trim()) {
            setErrorMsg("아이디와 비밀번호를 모두 입력해 주세요.");
            return;
        }

        try {
            // ✅ 실제 로그인 API 호출 (api/auth.js 안의 loginUser 사용)
            const data = await loginUser({
                userId: userId.trim(),
                password,
            });

            // 🔐 응답 형식에 맞게 필드 이름만 맞춰줘
            const userInfo = {
                userId: data.userId,
                nickname: data.nickname,
                email: data.email,
                profileImage: data.profileImage || "blue", // 없으면 기본 아바타
            };

            // 전역 AuthContext + localStorage에 저장
            login(userInfo);

            // 홈으로 이동
            navigate("/");
        } catch (error) {
            console.error("로그인 실패:", error);
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.";
            setErrorMsg(msg);
        }
    };

    const goSignUp = () => {
        navigate("/signup");
    };

    return (
        <section className="login">
            {/* 로그인 전용 부드러운 그라디언트 오브젝트 */}
            <div className="login-orbit login-orbit--one" />
            <div className="login-orbit login-orbit--two" />

            <div className="login-inner">
                {/* 왼쪽 카피 영역 */}
                <div className="login-copy">
                    <p className="section-eyebrow">AI 콜렉터 계정</p>
                    <h2 className="login-title">
                        다시 오셨군요,
                        <br />
                        <span>AI 영상 콜렉션을 이어가 볼까요?</span>
                    </h2>
                    <p className="login-desc">
                        로그인하면 찜한 영상, 내가 만든 프롬프트, 나만의 컬렉션을 한 번에
                        관리할 수 있습니다.
                        <br />
                        앞으로는 단순 구독이 아니라,{" "}
                        <strong>“내가 쓰는 AI 영상 레퍼런스”</strong>를 모아가는 경험을
                        목표로 합니다.
                    </p>
                </div>

                {/* 오른쪽 로그인 카드 */}
                <div className="login-card">
                    <h3 className="login-card-title">로그인</h3>
                    <p className="login-card-sub">
                        AI 콜렉터에 로그인하여 나만의 AI 영상 콜렉션을 관리해보세요.
                    </p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="userId">아이디</label>
                            <input
                                type="text"
                                id="userId"
                                autoComplete="username"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {errorMsg && (
                            <p
                                style={{
                                    color: "#f97373",
                                    fontSize: "0.8rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {errorMsg}
                            </p>
                        )}

                        <div className="login-actions-top">
                            <button type="submit" className="btn btn-primary login-submit">
                                로그인
                            </button>

                            <div className="login-links">
                                <button type="button" className="link-button">
                                    아이디 찾기
                                </button>
                                <span className="link-divider">|</span>
                                <button type="button" className="link-button">
                                    비밀번호 찾기
                                </button>
                            </div>
                        </div>

                        <div className="login-divider">
                            <span />
                            <p>또는</p>
                            <span />
                        </div>

                        <div className="login-signup">
                            <span>아직 계정이 없으십니까?</span>
                            <button
                                type="button"
                                className="signup-text"
                                onClick={goSignUp}
                            >
                                회원가입
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Login;
