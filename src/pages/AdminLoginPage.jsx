// src/pages/AdminLoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/AdminLogin.scss";
import { loginAdmin } from "../api/admin";

const AdminLoginPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await loginAdmin(form);
            // ✅ 로그인 성공 시 관리자 대시보드로 이동 (추후 구현)
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            setError("관리자 아이디 또는 비밀번호를 다시 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-inner">
                {/* 왼쪽: 소개 영역 (디자인만 유지, 애니메이션 없음) */}
                <div className="admin-login-left">
                    <p className="admin-login-eyebrow">Admin Console</p>
                    <h1 className="admin-login-title">관리자 로그인</h1>
                    <p className="admin-login-desc">
                        AI 콜렉터 서비스의 영상, 사용자, 통계를 관리하는
                        <br />
                        관리자 전용 페이지입니다.
                    </p>
                </div>

                {/* 오른쪽: 로그인 카드 */}
                <div className="admin-login-right">
                    <div className="admin-login-card">
                        <h2 className="admin-login-card-title">Sign in as Admin</h2>

                        {error && <div className="admin-login-error">{error}</div>}

                        <form className="admin-login-form" onSubmit={onSubmit}>
                            <div className="form-group">
                                <label htmlFor="username">관리자 아이디</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="관리자 아이디를 입력하세요"
                                    value={form.username}
                                    onChange={onChange}
                                    autoComplete="username"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">비밀번호</label>
                                <div className="password-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPw ? "text" : "password"}
                                        placeholder="비밀번호를 입력하세요"
                                        value={form.password}
                                        onChange={onChange}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="pw-toggle-btn"
                                        onClick={() => setShowPw((v) => !v)}
                                    >
                                        {showPw ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="admin-login-submit"
                                disabled={loading}
                            >
                                {loading ? "로그인 중..." : "로그인"}
                            </button>
                        </form>
                    </div>

                    <p className="admin-login-notice">
                        이 페이지는 관리자 전용입니다. 일반 사용자는 접근할 수 없습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
