// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";   // ✅ 추가

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-inner">
                {/* 왼쪽: 로고 + 설명 */}
                <div className="footer-left">
                    <div className="footer-logo">
                        <img
                            src="/favicon.svg"
                            alt="AI 영상 사이트 아이콘"
                            className="footer-logo-icon"
                        />
                        <span className="footer-logo-text">AI 콜렉터</span>
                    </div>
                    <p className="footer-copy">
                        © {year} Kim Gwangjin · AI·보안 지향 영상 큐레이션 플랫폼.
                    </p>
                </div>

                {/* 오른쪽: 링크들 */}
                <div className="footer-links">
                    <a
                        href="https://github.com/kwung0206" // 실제 깃허브 주소로 바꿔도 됨
                        className="footer-link"
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub
                    </a>
                    <a href="mailto:your-email@example.com" className="footer-link">
                        문의
                    </a>

                    {/* ✅ 개인정보처리방침: 내부 라우트 */}
                    <Link to="/privacy" className="footer-link">
                        개인정보처리방침
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
