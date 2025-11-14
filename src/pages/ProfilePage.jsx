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
                                "avatar-option" + (selected === opt.id ? " avatar-option--active" : "")
                            }
                            onClick={() => setSelected(opt.id)}
                        >
                            <img src={opt.src} alt={opt.label} className="avatar-option-img" />
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
        if (newPassword.length < 6) {
            setErrorMsg("새 비밀번호는 최소 6자 이상이어야 합니다.");
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
            // 살짝 딜레이 후 모달 닫기
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
                (ok ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.")
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
                                            {/* 회원가입 페이지 스타일 재사용: 인풋 + 중복검사 + 저장/취소 */}
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
                                                        nickLoading || nickCheckStatus === "checking"
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

                                            {/* 중복검사 메시지 */}
                                            {nickCheckMessage && (
                                                <p
                                                    className={`nickname-status nickname-status--${nickCheckStatus}`}
                                                >
                                                    {nickCheckMessage}
                                                </p>
                                            )}

                                            {/* 에러/성공 메시지 */}
                                            {nickError && (
                                                <p className="profile-nick-error">{nickError}</p>
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
        </>
    );
};

export default ProfilePage;
