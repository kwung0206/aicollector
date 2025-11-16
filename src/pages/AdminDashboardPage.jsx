// src/pages/AdminDashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/AdminDashboard.scss";
import { fetchAdminUsers, fetchBlockedVideos } from "../api/admin";

const AdminDashboardPage = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [blockedVideos, setBlockedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            // 토큰 없으면 다시 로그인으로
            navigate("/admin");
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const [userRes, videoRes] = await Promise.all([
                    fetchAdminUsers(),
                    fetchBlockedVideos(),
                ]);

                setUsers(userRes || []);
                setBlockedVideos(videoRes || []);
            } catch (e) {
                console.error(e);
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
                // 401 등의 경우 다시 로그인으로 보낼 수도 있음
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin");
    };

    return (
        <div className="admin-dash">
            <div className="admin-dash-header">
                <div>
                    <h1 className="admin-dash-title">관리자 대시보드</h1>
                    <p className="admin-dash-sub">
                        전체 사용자와 차단된 동영상 현황을 한눈에 확인하세요.
                    </p>
                </div>
                <button className="admin-dash-logout" onClick={handleLogout}>
                    로그아웃
                </button>
            </div>

            {loading && <div className="admin-dash-message">불러오는 중...</div>}
            {error && <div className="admin-dash-error">{error}</div>}

            {!loading && !error && (
                <div className="admin-dash-grid">
                    {/* 유저 목록 카드 */}
                    <section className="admin-card">
                        <header className="admin-card-header">
                            <h2>전체 사용자</h2>
                            <span className="badge">{users.length}명</span>
                        </header>
                        <div className="admin-card-body">
                            {users.length === 0 ? (
                                <div className="admin-dash-empty">등록된 사용자가 없습니다.</div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>닉네임</th>
                                        <th>이메일</th>
                                        <th>가입일</th>
                                        <th>상태</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map((u) => (
                                        <tr key={u.userNo || u.id}>
                                            <td>{u.userId}</td>
                                            <td>{u.nickname}</td>
                                            <td>{u.email}</td>
                                            <td>{u.createdAt?.slice(0, 10) || "-"}</td>
                                            <td>{u.status || "ACTIVE"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>

                    {/* 차단된 동영상 목록 카드 */}
                    <section className="admin-card">
                        <header className="admin-card-header">
                            <h2>차단된 동영상</h2>
                            <span className="badge">{blockedVideos.length}개</span>
                        </header>
                        <div className="admin-card-body">
                            {blockedVideos.length === 0 ? (
                                <div className="admin-dash-empty">차단된 동영상이 없습니다.</div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>영상 ID</th>
                                        <th>제목</th>
                                        <th>업로더</th>
                                        <th>업로드일</th>
                                        <th>조회수</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {blockedVideos.map((v) => (
                                        <tr key={v.videoNo || v.id}>
                                            <td>{v.videoNo}</td>
                                            <td>{v.title}</td>
                                            <td>{v.uploaderNickname || v.uploaderId}</td>
                                            <td>{v.createdAt?.slice(0, 10) || "-"}</td>
                                            <td>{v.viewCount ?? 0}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
