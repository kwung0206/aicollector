// src/pages/AdminDashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/AdminDashboard.scss";
import {
    fetchAdminUsers,
    fetchBlockedVideos,
    approveBlockedVideo,
    deleteBlockedVideo,
} from "../api/admin";

const AdminDashboardPage = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [blockedVideos, setBlockedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🔹 모달용 상태
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
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

    // 🔹 모달 닫기
    const closeModal = () => {
        setSelectedVideo(null);
        setModalError("");
        setModalLoading(false);
    };

    // 🔹 승인 (차단 해제)
    const handleApprove = async () => {
        if (!selectedVideo) return;
        if (!window.confirm("이 영상을 승인(차단 해제)하시겠습니까?")) return;

        try {
            setModalLoading(true);
            setModalError("");
            await approveBlockedVideo(selectedVideo.videoNo);
            // 목록에서 제거
            setBlockedVideos(prev =>
                prev.filter(v => v.videoNo !== selectedVideo.videoNo)
            );
            closeModal();
        } catch (e) {
            console.error(e);
            setModalError("영상 승인 중 오류가 발생했습니다.");
        } finally {
            setModalLoading(false);
        }
    };

    // 🔹 삭제
    const handleDelete = async () => {
        if (!selectedVideo) return;
        if (!window.confirm("정말 이 영상을 완전히 삭제하시겠습니까?")) return;

        try {
            setModalLoading(true);
            setModalError("");
            await deleteBlockedVideo(selectedVideo.videoNo);
            setBlockedVideos(prev =>
                prev.filter(v => v.videoNo !== selectedVideo.videoNo)
            );
            closeModal();
        } catch (e) {
            console.error(e);
            setModalError("영상 삭제 중 오류가 발생했습니다.");
        } finally {
            setModalLoading(false);
        }
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
                                        <tr
                                            key={v.videoNo || v.id}
                                            className="admin-table-row-clickable"
                                            onClick={() => setSelectedVideo(v)}
                                        >
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

            {/* 🔹 차단 영상 상세 모달 */}
            {selectedVideo && (
                <div className="admin-modal-backdrop" onClick={closeModal}>
                    <div
                        className="admin-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="admin-modal-header">
                            <h2>차단된 영상 상세</h2>
                            <button
                                className="admin-modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </header>

                        <div className="admin-modal-body">
                            {modalError && (
                                <div className="admin-modal-error">{modalError}</div>
                            )}

                            {/* 🔹 메타데이터 */}
                            <dl className="admin-modal-detail">
                                <div>
                                    <dt>영상 ID</dt>
                                    <dd>{selectedVideo.videoNo}</dd>
                                </div>
                                <div>
                                    <dt>제목</dt>
                                    <dd>{selectedVideo.title}</dd>
                                </div>
                                <div>
                                    <dt>업로더 닉네임</dt>
                                    <dd>{selectedVideo.uploaderNickname || "-"}</dd>
                                </div>
                                <div>
                                    <dt>업로더 ID</dt>
                                    <dd>{selectedVideo.uploaderId || "-"}</dd>
                                </div>
                                <div>
                                    <dt>업로드일</dt>
                                    <dd>{selectedVideo.createdAt?.slice(0, 19) || "-"}</dd>
                                </div>
                                <div>
                                    <dt>조회수</dt>
                                    <dd>{selectedVideo.viewCount ?? 0}</dd>
                                </div>

                                {selectedVideo.blockReason && (
                                    <div>
                                        <dt>차단 사유</dt>
                                        <dd>{selectedVideo.blockReason}</dd>
                                    </div>
                                )}
                            </dl>

                            {/* 🔹 영상 미리보기 */}
                            <div className="admin-modal-preview">
                                <h3>영상 미리보기</h3>
                                <video
                                    className="admin-modal-video"
                                    controls
                                    // 백엔드 스트리밍 엔드포인트 사용
                                    src={`/api/videos/${selectedVideo.videoNo}/stream`}
                                >
                                    브라우저에서 video 태그를 지원하지 않습니다.
                                </video>
                            </div>
                        </div>

                        <footer className="admin-modal-footer">
                            <button
                                className="admin-modal-btn secondary"
                                onClick={closeModal}
                                disabled={modalLoading}
                            >
                                닫기
                            </button>
                            <button
                                className="admin-modal-btn"
                                onClick={handleApprove}
                                disabled={modalLoading}
                            >
                                승인 (차단 해제)
                            </button>
                            <button
                                className="admin-modal-btn danger"
                                onClick={handleDelete}
                                disabled={modalLoading}
                            >
                                삭제
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
