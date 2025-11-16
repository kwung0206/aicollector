// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import "../scss/Profile.scss";
import { useAuth } from "../context/AuthContext";
import {
    updateNickname,
    changePassword,
    checkNickname,
    updateProfileImage,
} from "../api/auth";
import { getMyVideos, updateVideoMeta, deleteVideo } from "../api/video";

const API_ROOT =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9999/api";

// 아바타 매핑 (회원가입/헤더에서 쓰는 거랑 동일하게)
const AVATAR_MAP = {
    blue: "/avatars/avatar-blue.svg",
    purple: "/avatars/avatar-purple.svg",
    orange: "/avatars/avatar-orange.svg",
    green: "/avatars/avatar-green.svg",
    pink: "/avatars/avatar-pink.svg",
    mono: "/avatars/avatar-mono.svg",
};

// 아바타 선택용 옵션
const avatarOptions = [
    { id: "blue", label: "블루", src: AVATAR_MAP.blue },
    { id: "purple", label: "퍼플", src: AVATAR_MAP.purple },
    { id: "orange", label: "오렌지", src: AVATAR_MAP.orange },
    { id: "green", label: "그린", src: AVATAR_MAP.green },
    { id: "pink", label: "핑크", src: AVATAR_MAP.pink },
    { id: "mono", label: "화이트", src: AVATAR_MAP.mono },
];

const resolveAvatarSrc = (profileImage) => {
    if (!profileImage || typeof profileImage !== "string") {
        return AVATAR_MAP.blue;
    }
    const key = profileImage.trim();
    if (AVATAR_MAP[key]) return AVATAR_MAP[key];
    return key; // 그냥 URL 이면 그대로 사용
};

// 업로드 날짜 포맷터
const formatDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    const pad = (v) => String(v).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 리뷰 상태 + 차단 여부 → 뱃지 텍스트 & 스타일 타입
const getVideoStatus = (reviewStatus, isBlocked) => {
    if (isBlocked === "Y") {
        return { label: "차단됨 (유해 영상)", variant: "blocked" };
    }
    switch (reviewStatus) {
        case "A":
            return { label: "승인됨", variant: "approved" };
        case "H":
            return { label: "보류 중", variant: "hold" };
        case "P":
        default:
            return { label: "심사 대기", variant: "pending" };
    }
};

/** 프로필 이미지 변경 모달 */
const AvatarSelectModal = ({
                               open,
                               currentProfileImage,
                               onClose,
                               onApply, // (selectedId) => void
                           }) => {
    const [selected, setSelected] = useState(currentProfileImage || "blue");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (open) {
            setSelected(currentProfileImage || "blue");
            setErrorMsg("");
        }
    }, [open, currentProfileImage]);

    // ESC 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const handleApply = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            await onApply(selected);
        } catch (err) {
            console.error("프로필 이미지 변경 실패:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "프로필 이미지 변경 중 오류가 발생했습니다.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="avatar-modal-backdrop" onClick={onClose}>
            <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="avatar-modal-title">프로필 이미지 변경</h3>
                <p className="avatar-modal-desc">
                    기본 프로필 이미지 중 하나를 선택해 주세요.
                </p>

                <div className="avatar-grid">
                    {avatarOptions.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={
                                "avatar-option" +
                                (selected === opt.id ? " avatar-option--active" : "")
                            }
                            onClick={() => setSelected(opt.id)}
                        >
                            <img
                                src={opt.src}
                                alt={opt.label}
                                className="avatar-option-img"
                            />
                            <span className="avatar-option-label">{opt.label}</span>
                        </button>
                    ))}
                </div>

                {errorMsg && <p className="avatar-modal-error">{errorMsg}</p>}

                <div className="avatar-modal-actions">
                    <button
                        type="button"
                        className="btn avatar-modal-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary avatar-modal-btn"
                        onClick={handleApply}
                        disabled={loading}
                    >
                        {loading ? "변경 중..." : "적용하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/** 비밀번호 변경 모달 */
const PasswordChangeModal = ({ open, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // 모달 열릴 때마다 필드 초기화
    useEffect(() => {
        if (open) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setErrorMsg("");
            setSuccessMsg("");
        }
    }, [open]);

    // ESC 로 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!currentPassword.trim() || !newPassword.trim()) {
            setErrorMsg("현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.");
            return;
        }

        // 🔹 회원가입과 동일하게 8자리 이상으로 통일
        if (newPassword.length < 8) {
            setErrorMsg("새 비밀번호는 최소 8자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        try {
            setLoading(true);
            await changePassword({
                currentPassword: currentPassword.trim(),
                newPassword: newPassword.trim(),
            });
            setSuccessMsg("비밀번호가 성공적으로 변경되었습니다.");
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (err) {
            console.error("비밀번호 변경 실패:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "비밀번호 변경 중 오류가 발생했습니다.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pw-modal-backdrop" onClick={onClose}>
            <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="pw-modal-title">비밀번호 변경</h3>
                <p className="pw-modal-desc">
                    현재 비밀번호를 확인한 뒤, 새 비밀번호로 안전하게 변경합니다.
                </p>

                <form className="pw-modal-form" onSubmit={handleSubmit}>
                    <div className="pw-modal-field">
                        <label htmlFor="pw-current">현재 비밀번호</label>
                        <input
                            id="pw-current"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="pw-modal-field">
                        <label htmlFor="pw-new">새 비밀번호</label>
                        <input
                            id="pw-new"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="pw-modal-field">
                        <label htmlFor="pw-confirm">새 비밀번호 확인</label>
                        <input
                            id="pw-confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    {errorMsg && <p className="pw-modal-error">{errorMsg}</p>}
                    {successMsg && <p className="pw-modal-success">{successMsg}</p>}

                    <div className="pw-modal-actions">
                        <button
                            type="button"
                            className="btn pw-modal-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            닫기
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary pw-modal-btn"
                            disabled={loading}
                        >
                            {loading ? "변경 중..." : "비밀번호 변경"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/** 영상 상세 모달 (제목 수정 + 삭제, 태그는 읽기 전용) */
const VideoDetailModal = ({ open, video, onClose, onDeleted, onUpdated }) => {
    const [titleInput, setTitleInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // 🔴 삭제 확인 모달 상태
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        if (open && video) {
            setTitleInput(video.title || "");
            setErrorMsg("");
            setSuccessMsg("");
            setDeleteConfirmOpen(false); // 새로 열릴 때 항상 닫힘
        }
    }, [open, video]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") {
                if (deleteConfirmOpen) {
                    setDeleteConfirmOpen(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose, deleteConfirmOpen]);

    if (!open || !video) return null;

    const handleSaveTitle = async () => {
        const trimmed = titleInput.trim();
        setErrorMsg("");
        setSuccessMsg(""); // ✅ 이전 메시지 초기화

        if (!trimmed) {
            setErrorMsg("제목을 입력해 주세요.");
            return;
        }
        if (trimmed === video.title) {
            setSuccessMsg("변경된 내용이 없습니다.");
            return;
        }

        try {
            setSaving(true);
            const updated = await updateVideoMeta(video.videoNo, { title: trimmed });

            setSuccessMsg("제목이 저장되었습니다.");

            if (onUpdated) {
                onUpdated(updated || { ...video, title: trimmed });
            }
        } catch (err) {
            console.error("제목 변경 실패:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "제목 변경 중 오류가 발생했습니다.";
            setErrorMsg(msg);
        } finally {
            setSaving(false);
        }
    };

    // 🔴 실제 삭제 실행 (window.confirm 사용 X)
    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            setErrorMsg("");
            await deleteVideo(video.videoNo);
            if (onDeleted) {
                onDeleted(video.videoNo);
            }
            setDeleteConfirmOpen(false);
            onClose();
        } catch (err) {
            console.error("영상 삭제 실패:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "영상 삭제 중 오류가 발생했습니다.";
            setErrorMsg(msg);
        } finally {
            setDeleting(false);
        }
    };

    const status = getVideoStatus(video.reviewStatus, video.isBlocked);
    const tags = [
        video.tag1,
        video.tag2,
        video.tag3,
        video.tag4,
        video.tag5,
    ].filter(Boolean);

    const videoSrc = `${API_ROOT}/videos/${video.videoNo}/stream`;

    return (
        <>
            <div className="video-modal-backdrop" onClick={onClose}>
                <div className="video-modal" onClick={(e) => e.stopPropagation()}>
                    <header className="video-modal-header">
                        <span
                            className={`video-modal-status video-modal-status--${status.variant}`}
                        >
                            {status.label}
                        </span>
                        <button
                            type="button"
                            className="video-modal-close"
                            onClick={onClose}
                            aria-label="닫기"
                        >
                            ×
                        </button>
                    </header>

                    <div className="video-modal-body">
                        <div className="video-modal-player-wrap">
                            <video
                                className="video-modal-player"
                                src={videoSrc}
                                controls
                            />
                        </div>

                        <div className="video-modal-meta">
                            <label className="video-modal-field">
                                <span className="video-modal-label">제목</span>
                                <input
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => {
                                        setTitleInput(e.target.value);
                                        setErrorMsg("");
                                        setSuccessMsg("");
                                    }}
                                    maxLength={255}
                                />
                            </label>

                            {tags.length > 0 && (
                                <div className="video-modal-tags">
                                    {tags.map((t) => (
                                        <span key={t} className="video-modal-tag">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="video-modal-date">
                                업로드: {formatDateTime(video.uploadDate)}
                            </p>

                            <div className="video-modal-stats">
                                <span>조회수 {video.viewCount ?? 0}</span>
                                <span>좋아요 {video.likeCount ?? 0}</span>
                                <span>싫어요 {video.dislikeCount ?? 0}</span>
                            </div>
                        </div>
                    </div>

                    {errorMsg && <p className="video-modal-error">{errorMsg}</p>}
                    {successMsg && !errorMsg && (
                        <p className="video-modal-success">{successMsg}</p>
                    )}

                    <footer className="video-modal-footer">
                        <button
                            type="button"
                            className="video-modal-btn video-modal-btn--danger"
                            onClick={() => setDeleteConfirmOpen(true)}
                            disabled={deleting}
                        >
                            {deleting ? "삭제 중..." : "영상 삭제"}
                        </button>
                        <div className="video-modal-footer-right">
                            <button
                                type="button"
                                className="video-modal-btn"
                                onClick={onClose}
                                disabled={saving || deleting}
                            >
                                닫기
                            </button>
                            <button
                                type="button"
                                className="video-modal-btn video-modal-btn--primary"
                                onClick={handleSaveTitle}
                                disabled={saving || deleting}
                            >
                                {saving ? "저장 중..." : "제목 저장"}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>

            {/* 🔴 삭제 확인 모달 (업로드 완료 모달 느낌) */}
            {deleteConfirmOpen && (
                <div
                    className="video-delete-backdrop"
                    onClick={() => !deleting && setDeleteConfirmOpen(false)}
                >
                    <div
                        className="video-delete-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="video-delete-icon">⚠️</div>
                        <h3 className="video-delete-title">영상 삭제</h3>
                        <p className="video-delete-desc">
                            이 영상을 정말 삭제하시겠어요?
                            <br />
                            삭제 후에는 되돌릴 수 없습니다.
                        </p>
                        <div className="video-delete-actions">
                            <button
                                type="button"
                                className="video-delete-btn video-delete-btn--cancel"
                                onClick={() => setDeleteConfirmOpen(false)}
                                disabled={deleting}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className="video-delete-btn video-delete-btn--danger"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "삭제 중..." : "삭제하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ProfilePage = () => {
    const auth = useAuth();
    const ctxUser = auth?.user || null;

    // 로컬 표시용 유저 정보
    const [localUser, setLocalUser] = useState(() => ({
        userId: ctxUser?.userId || "-",
        nickname: ctxUser?.nickname || "-",
        email: ctxUser?.email || "-",
        profileImage: ctxUser?.profileImage || "blue",
        tokenCount: ctxUser?.tokenCount ?? 0,
    }));

    const { userId, nickname, email, profileImage, tokenCount } = localUser;

    // 컨텍스트 유저가 바뀔 때마다 동기화
    useEffect(() => {
        if (!ctxUser) return;
        setLocalUser((prev) => ({
            ...prev,
            userId: ctxUser.userId ?? prev.userId,
            nickname: ctxUser.nickname ?? prev.nickname,
            email: ctxUser.email ?? prev.email,
            profileImage: ctxUser.profileImage ?? prev.profileImage,
            tokenCount: ctxUser.tokenCount ?? prev.tokenCount,
        }));
    }, [ctxUser]);

    // 닉네임 인라인 수정 관련 상태
    const [editingNickname, setEditingNickname] = useState(false);
    const [nickInput, setNickInput] = useState(
        nickname && nickname !== "-" ? nickname : ""
    );
    const [nickLoading, setNickLoading] = useState(false);
    const [nickError, setNickError] = useState("");
    const [nickSaveMessage, setNickSaveMessage] = useState("");

    // 닉네임 중복 검사 상태
    const [nickCheckStatus, setNickCheckStatus] = useState("idle"); // idle | checking | ok | taken | error
    const [nickCheckMessage, setNickCheckMessage] = useState("");

    // nickname 값이 바뀌면 인풋도 같이 맞춰주기
    useEffect(() => {
        setNickInput(nickname && nickname !== "-" ? nickname : "");
        setNickError("");
        setNickSaveMessage("");
        setNickCheckStatus("idle");
        setNickCheckMessage("");
    }, [nickname]);

    const openNicknameEdit = () => {
        setEditingNickname(true);
        setNickInput(nickname && nickname !== "-" ? nickname : "");
        setNickError("");
        setNickSaveMessage("");
        setNickCheckStatus("idle");
        setNickCheckMessage("");
    };

    const cancelNicknameEdit = () => {
        setEditingNickname(false);
        setNickInput(nickname && nickname !== "-" ? nickname : "");
        setNickError("");
        setNickSaveMessage("");
        setNickCheckStatus("idle");
        setNickCheckMessage("");
    };

    // 프로필에서 닉네임 중복 검사
    const handleCheckNicknameProfile = async () => {
        const trimmed = nickInput.trim();
        setNickError("");
        setNickSaveMessage("");

        if (!trimmed) {
            setNickCheckStatus("error");
            setNickCheckMessage("닉네임을 먼저 입력해 주세요.");
            return;
        }
        if (trimmed.length < 2) {
            setNickCheckStatus("error");
            setNickCheckMessage("닉네임은 최소 2글자 이상이어야 합니다.");
            return;
        }

        // 기존 닉네임과 같으면 굳이 서버 중복검사 안 해도 됨
        if (trimmed === nickname) {
            setNickCheckStatus("taken");
            setNickCheckMessage("현재 사용 중인 닉네임입니다.");
            return;
        }

        try {
            setNickCheckStatus("checking");
            setNickCheckMessage("닉네임 중복 여부를 확인 중입니다...");

            const res = await checkNickname(trimmed); // { available, message }
            const ok = !!res?.available;
            setNickCheckStatus(ok ? "ok" : "taken");
            setNickCheckMessage(
                res?.message ||
                (ok
                    ? "사용 가능한 닉네임입니다."
                    : "이미 사용 중인 닉네임입니다.")
            );
        } catch (err) {
            console.error("닉네임 중복 검사 실패:", err);
            setNickCheckStatus("error");
            setNickCheckMessage(
                err?.response?.data?.message ||
                "닉네임 중복 확인 중 오류가 발생했습니다."
            );
        }
    };

    // 닉네임 저장
    const handleSaveNickname = async () => {
        const trimmed = nickInput.trim();
        setNickError("");
        setNickSaveMessage("");

        if (!trimmed) {
            setNickError("닉네임을 입력해 주세요.");
            return;
        }
        if (trimmed.length < 2) {
            setNickError("닉네임은 최소 2글자 이상이어야 합니다.");
            return;
        }

        // 변경이 없으면 그냥 닫기
        if (trimmed === nickname) {
            setEditingNickname(false);
            return;
        }

        // 중복검사 먼저 요구
        if (nickCheckStatus !== "ok") {
            setNickError("먼저 닉네임 중복 검사를 완료해 주세요.");
            return;
        }

        try {
            setNickLoading(true);
            const res = await updateNickname(trimmed);
            const updatedNickname = res?.nickname || trimmed;

            // 로컬 표시 갱신
            setLocalUser((prev) => ({
                ...prev,
                nickname: updatedNickname,
            }));

            // AuthContext 안의 user 도 갱신
            if (ctxUser && auth?.login) {
                auth.login({
                    ...ctxUser,
                    nickname: updatedNickname,
                });
            }

            setNickSaveMessage("닉네임이 변경되었습니다.");
            setEditingNickname(false);
            setNickCheckStatus("idle");
            setNickCheckMessage("");
        } catch (err) {
            console.error("닉네임 변경 실패:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "닉네임 변경 중 오류가 발생했습니다.";
            setNickError(msg);
        } finally {
            setNickLoading(false);
        }
    };

    const [pwModalOpen, setPwModalOpen] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);

    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [activeVideo, setActiveVideo] = useState(null);

    // 아바타 적용 핸들러
    const handleApplyAvatar = async (selectedId) => {
        const updated = await updateProfileImage(selectedId); // UserResponse

        // 로컬 유저 갱신
        setLocalUser((prev) => ({
            ...prev,
            profileImage: updated.profileImage || selectedId,
        }));

        // AuthContext 유저도 갱신 (Header 반영)
        if (ctxUser && auth?.login) {
            auth.login({
                ...ctxUser,
                profileImage: updated.profileImage || selectedId,
            });
        }

        setAvatarModalOpen(false);
    };

    // ===== 내 영상 목록 상태 =====
    const [videos, setVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [videosError, setVideosError] = useState("");

    // 내 영상 불러오기
    useEffect(() => {
        if (!ctxUser) return;

        const fetchMyVideos = async () => {
            try {
                setVideosLoading(true);
                setVideosError("");
                const data = await getMyVideos();
                setVideos(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("내 영상 목록 조회 실패:", err);
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "내 영상 목록을 불러오는 중 오류가 발생했습니다.";
                setVideosError(msg);
            } finally {
                setVideosLoading(false);
            }
        };

        fetchMyVideos();
    }, [ctxUser]);

    const handleOpenVideoModal = (video) => {
        setActiveVideo(video);
        setVideoModalOpen(true);
    };

    const handleCloseVideoModal = () => {
        setVideoModalOpen(false);
        setActiveVideo(null);
    };

    const handleVideoUpdated = (updated) => {
        if (!updated) return;
        setVideos((prev) =>
            prev.map((v) =>
                v.videoNo === updated.videoNo ? { ...v, ...updated } : v
            )
        );
        setActiveVideo((prev) =>
            prev && prev.videoNo === updated.videoNo ? { ...prev, ...updated } : prev
        );
    };

    const handleVideoDeleted = (deletedVideoNo) => {
        setVideos((prev) => prev.filter((v) => v.videoNo !== deletedVideoNo));
    };

    return (
        <>
            <section className="profile-page">
                <h2 className="profile-title">내 프로필</h2>

                <div className="profile-card">
                    {/* 왼쪽: 아바타 + 토큰 */}
                    <div className="profile-left">
                        <button
                            type="button"
                            className="profile-avatar-wrap"
                            onClick={() => setAvatarModalOpen(true)}
                        >
                            <img
                                src={resolveAvatarSrc(profileImage)}
                                alt="프로필 이미지"
                                className="profile-avatar"
                            />
                            <span className="profile-avatar-overlay">변경하기</span>
                        </button>

                        <div className="profile-token-box">
                            <span className="profile-token-label">남은 토큰</span>
                            <span className="profile-token-value">
                                {tokenCount ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* 오른쪽: 정보 리스트 */}
                    <div className="profile-right">
                        <dl className="profile-info-list">
                            {/* 아이디 */}
                            <div className="profile-info-row">
                                <dt>아이디</dt>
                                <dd>{userId || "-"}</dd>
                            </div>

                            {/* 닉네임 */}
                            <div className="profile-info-row">
                                <dt>닉네임</dt>
                                <dd>
                                    {editingNickname ? (
                                        <>
                                            <div className="profile-nick-edit-row nickname-input-row">
                                                <input
                                                    type="text"
                                                    className="profile-nick-input"
                                                    value={nickInput}
                                                    onChange={(e) => {
                                                        setNickInput(e.target.value);
                                                        setNickError("");
                                                        setNickSaveMessage("");
                                                        setNickCheckStatus("idle");
                                                        setNickCheckMessage("");
                                                    }}
                                                    maxLength={20}
                                                />

                                                <button
                                                    type="button"
                                                    className="nickname-check-link"
                                                    onClick={handleCheckNicknameProfile}
                                                    disabled={
                                                        nickLoading ||
                                                        nickCheckStatus === "checking"
                                                    }
                                                >
                                                    {nickCheckStatus === "checking"
                                                        ? "검사 중..."
                                                        : "중복 검사"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="profile-nick-btn profile-nick-btn--save"
                                                    onClick={handleSaveNickname}
                                                    disabled={nickLoading}
                                                >
                                                    {nickLoading ? "저장 중..." : "저장"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="profile-nick-btn profile-nick-btn--cancel"
                                                    onClick={cancelNicknameEdit}
                                                    disabled={nickLoading}
                                                >
                                                    취소
                                                </button>
                                            </div>

                                            {nickCheckMessage && (
                                                <p
                                                    className={`nickname-status nickname-status--${nickCheckStatus}`}
                                                >
                                                    {nickCheckMessage}
                                                </p>
                                            )}

                                            {nickError && (
                                                <p className="profile-nick-error">
                                                    {nickError}
                                                </p>
                                            )}
                                            {nickSaveMessage && !nickError && (
                                                <p className="profile-nick-success">
                                                    {nickSaveMessage}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="profile-nick-row">
                                            <span className="profile-nick-text">
                                                {nickname || "-"}
                                            </span>
                                            <button
                                                type="button"
                                                className="profile-nick-edit-link"
                                                onClick={openNicknameEdit}
                                            >
                                                변경
                                            </button>
                                        </div>
                                    )}
                                </dd>
                            </div>

                            {/* 이메일 */}
                            <div className="profile-info-row">
                                <dt>이메일</dt>
                                <dd>{email || "-"}</dd>
                            </div>

                            {/* 비밀번호 변경 버튼 */}
                            <div className="profile-info-row">
                                <dt />
                                <dd>
                                    <div className="profile-actions">
                                        <button
                                            type="button"
                                            className="profile-action-btn"
                                            onClick={() => setPwModalOpen(true)}
                                        >
                                            비밀번호 변경
                                        </button>
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* ===== 내 영상 섹션 ===== */}
                <section className="profile-video-section">
                    <h3 className="profile-video-title">내가 올린 영상</h3>

                    <div className="profile-video-card-wrap">
                        {videosLoading && (
                            <div className="profile-video-loading">
                                <div className="profile-spinner" />
                                <span>내 영상을 불러오는 중입니다...</span>
                            </div>
                        )}

                        {!videosLoading && videosError && (
                            <p className="profile-video-error">{videosError}</p>
                        )}

                        {!videosLoading && !videosError && videos.length === 0 && (
                            <p className="profile-video-empty">
                                아직 업로드한 영상이 없습니다. 첫 영상을 업로드해 보세요!
                            </p>
                        )}

                        {!videosLoading && !videosError && videos.length > 0 && (
                            <div className="profile-video-scroll">
                                <div className="profile-video-grid">
                                    {videos.map((v) => {
                                        const status = getVideoStatus(
                                            v.reviewStatus,
                                            v.isBlocked
                                        );
                                        const tags = [
                                            v.tag1,
                                            v.tag2,
                                            v.tag3,
                                            v.tag4,
                                            v.tag5,
                                        ].filter(Boolean);

                                        return (
                                            <article
                                                key={v.videoNo}
                                                className="profile-video-card"
                                                onClick={() => handleOpenVideoModal(v)}
                                            >
                                                <div className="profile-video-thumb-wrap">
                                                    {v.thumbnailUrl ? (
                                                        <img
                                                            src={v.thumbnailUrl}
                                                            alt={v.title}
                                                            className="profile-video-thumb-img"
                                                        />
                                                    ) : (
                                                        <div className="profile-video-thumb-placeholder">
                                                            <span>▶</span>
                                                        </div>
                                                    )}

                                                    <span
                                                        className={`profile-video-status profile-video-status--${status.variant}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <div className="profile-video-body">
                                                    <h4 className="profile-video-title-text">
                                                        {v.title}
                                                    </h4>
                                                    <p className="profile-video-date">
                                                        업로드:{" "}
                                                        {formatDateTime(v.uploadDate)}
                                                    </p>

                                                    {tags.length > 0 && (
                                                        <div className="profile-video-tags">
                                                            {tags.map((t) => (
                                                                <span
                                                                    key={t}
                                                                    className="profile-video-tag"
                                                                >
                                                                    #{t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="profile-video-meta">
                                                        <span>
                                                            조회수 {v.viewCount ?? 0}
                                                        </span>
                                                        <span>
                                                            좋아요 {v.likeCount ?? 0}
                                                        </span>
                                                        <span>
                                                            싫어요 {v.dislikeCount ?? 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </section>

            {/* 비밀번호 변경 모달 */}
            <PasswordChangeModal
                open={pwModalOpen}
                onClose={() => setPwModalOpen(false)}
            />

            {/* 프로필 이미지 변경 모달 */}
            <AvatarSelectModal
                open={avatarModalOpen}
                currentProfileImage={profileImage}
                onClose={() => setAvatarModalOpen(false)}
                onApply={handleApplyAvatar}
            />

            {/* 영상 상세 모달 */}
            <VideoDetailModal
                open={videoModalOpen}
                video={activeVideo}
                onClose={handleCloseVideoModal}
                onDeleted={handleVideoDeleted}
                onUpdated={handleVideoUpdated}
            />
        </>
    );
};

export default ProfilePage;
