// src/components/layout/Footer.jsx

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

                {/* 오른쪽: 링크들 (나중에 진짜 링크로 교체) */}
                <div className="footer-links">
                    <a href="#" className="footer-link">
                        GitHub
                    </a>
                    <a href="#" className="footer-link">
                        문의
                    </a>
                    <a href="#" className="footer-link">
                        개인정보처리방침
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
