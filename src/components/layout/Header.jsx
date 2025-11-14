// src/components/layout/Header.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AVATAR_MAP = {
    blue: "/avatars/avatar-blue.svg",
    purple: "/avatars/avatar-purple.svg",
    orange: "/avatars/avatar-orange.svg",
    green: "/avatars/avatar-green.svg",
    pink: "/avatars/avatar-pink.svg",
    mono: "/avatars/avatar-mono.svg",
};

const resolveAvatarSrc = (profileImage) => {
    if (!profileImage || typeof profileImage !== "string") {
        return AVATAR_MAP.blue;
    }
    const key = profileImage.trim();
    if (AVATAR_MAP[key]) return AVATAR_MAP[key];
    return key; // 이미 URL 이면 그대로
};

const Header = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const user = auth?.user;
    const logout = auth?.logout;

    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef(null);

    const homeClass = ({ isActive }) =>
        "nav-link" + (isActive ? " nav-link--active" : "");

    const profileSrc = resolveAvatarSrc(user?.profileImage);

    // 바깥 클릭 시 드롭다운 닫기
    useEffect(() => {
        if (!openMenu) return;

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenu]);

    const handleLogout = () => {
        setOpenMenu(false);

        if (logout) {
            logout(); // 토큰/상태 정리
        }
        window.location.replace("/login");
    };

    // ✅ 새로고침 + 홈 이동용 핸들러
    const goHomeWithReload = (e) => {
        if (e) e.preventDefault();
        window.location.href = "/";
    };

    return (
        <header className="app-header">
            <div className="header-inner">
                {/* 왼쪽 로고 */}
                <div
                    className="logo"
                    onClick={goHomeWithReload}   // ✅ 여기 변경
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src="/favicon.svg"
                        alt="AI 콜렉터 아이콘"
                        className="logo-icon"
                    />
                    <span className="logo-text">AI 콜렉터</span>
                </div>

                {/* 오른쪽 네비게이션 */}
                <nav className="nav">
                    {/* ✅ 홈 클릭 시 새로고침 + 홈 */}
                    <NavLink
                        to="/"
                        className={homeClass}
                        onClick={goHomeWithReload}
                    >
                        홈
                    </NavLink>

                    <button type="button" className="nav-link">
                        영상 모음
                    </button>
                    <button type="button" className="nav-link">
                        컬렉션
                    </button>

                    {user ? (
                        // 🔽 프로필 + 드롭다운 래퍼
                        <div className="nav-profile-wrap" ref={menuRef}>
                            <button
                                type="button"
                                className="nav-profile"
                                onClick={() => setOpenMenu((v) => !v)}
                            >
                                <span className="nav-profile-avatar-wrapper">
                                    <img
                                        src={profileSrc}
                                        alt="프로필"
                                        className="nav-profile-avatar"
                                    />
                                </span>
                            </button>

                            {openMenu && (
                                <div className="nav-profile-menu">
                                    <button
                                        type="button"
                                        className="nav-profile-menu-item"
                                        onClick={() => {
                                            setOpenMenu(false);
                                            navigate("/mypage"); // ✅ 프로필
                                        }}
                                    >
                                        프로필
                                    </button>
                                    <button
                                        type="button"
                                        className="nav-profile-menu-item"
                                        onClick={() => {
                                            setOpenMenu(false);
                                            navigate("/settings");
                                        }}
                                    >
                                        세팅
                                    </button>
                                    <button
                                        type="button"
                                        className="nav-profile-menu-item nav-profile-menu-item--danger"
                                        onClick={handleLogout}
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="nav-link"
                            onClick={() => navigate("/login")}
                        >
                            로그인
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
