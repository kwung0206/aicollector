// src/pages/SignUpForm.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../scss/Login.scss"; // 기존 로그인/회원가입 스타일 재사용
import {
    registerUser,
    checkUserId,
    checkNickname,
} from "../api/auth"; // ✅ API 함수들

// ✅ SVG 아바타 옵션 (public/avatars/ 아래에 저장된 파일들)
const avatarOptions = [
    { id: "blue",   label: "블루", src: "/avatars/avatar-blue.svg" },
    { id: "purple", label: "퍼플", src: "/avatars/avatar-purple.svg" },
    { id: "orange", label: "오렌지",    src: "/avatars/avatar-orange.svg" },
    { id: "green",  label: "그린",    src: "/avatars/avatar-green.svg" },
    { id: "pink",   label: "핑크",    src: "/avatars/avatar-pink.svg" },
    { id: "mono",   label: "화이트",  src: "/avatars/avatar-mono.svg" },
];

const SignUpForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ 이전 단계에서 넘겨준 값들
    const initialEmail = location.state?.email || "";
    const initialPassword = location.state?.password || "";

    // 이메일 없이 직접 들어오면 이메일 단계로 돌려보내기
    useEffect(() => {
        if (!initialEmail) {
            navigate("/signup/email", { replace: true });
        }
    }, [initialEmail, navigate]);

    // 🔹 폼 상태
    const [userId, setUserId] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("M");   // 기본값: 남자
    const [nickname, setNickname] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState("blue"); // "blue" 같은 id

    const [password, setPassword] = useState(initialPassword || "");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 🔹 아이디 / 닉네임 중복 상태
    const [userIdStatus, setUserIdStatus] = useState("idle"); // idle | checking | ok | taken | error
    const [userIdMessage, setUserIdMessage] = useState("");

    const [nickStatus, setNickStatus] = useState("idle");
    const [nickMessage, setNickMessage] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // 필드별 에러 메시지
    const [fieldErrors, setFieldErrors] = useState({});

    // 🔎 포커스 이동용 ref
    const userIdRef = useRef(null);
    const ageRef = useRef(null);
    const genderRef = useRef(null);
    const nicknameRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const avatarRef = useRef(null);

    // 🔢 나이는 숫자만 + 1~120 제한
    const handleAgeChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value === "") {
            setAge("");
            return;
        }

        let num = parseInt(value, 10);
        if (isNaN(num)) num = 0;

        num = Math.max(1, Math.min(120, num)); // 1~120 범위
        setAge(String(num));
    };

    // ✅ 아이디 중복 검사
    const handleCheckUserId = async () => {
        if (!userId.trim()) {
            setUserIdStatus("error");
            setUserIdMessage("아이디를 먼저 입력해 주세요.");
            return;
        }

        if (userId.trim().length < 4) {
            setUserIdStatus("error");
            setUserIdMessage("아이디는 최소 4글자 이상이어야 합니다.");
            return;
        }

        // 아이디 관련 에러 메시지 제거
        setFieldErrors((prev) => {
            const { userId, ...rest } = prev;
            return rest;
        });

        try {
            setUserIdStatus("checking");
            setUserIdMessage("아이디 중복 여부를 확인 중입니다...");

            const res = await checkUserId(userId.trim());
            // res === { available: boolean, message: string }
            setUserIdStatus(res.available ? "ok" : "taken");
            setUserIdMessage(res.message);
        } catch (error) {
            console.error("아이디 중복 검사 실패:", error);
            setUserIdStatus("error");
            setUserIdMessage(
                error.response?.data?.message ||
                "아이디 중복 확인 중 오류가 발생했습니다."
            );
        }
    };

    // ✅ 닉네임 중복 검사
    const handleCheckNickname = async () => {
        if (!nickname.trim()) {
            setNickStatus("error");
            setNickMessage("닉네임을 먼저 입력해 주세요.");
            return;
        }

        // 닉네임 관련 에러 메시지 제거
        setFieldErrors((prev) => {
            const { nickname, ...rest } = prev;
            return rest;
        });

        try {
            setNickStatus("checking");
            setNickMessage("닉네임 중복 여부를 확인 중입니다...");

            const res = await checkNickname(nickname.trim());
            setNickStatus(res.available ? "ok" : "taken");
            setNickMessage(res.message);
        } catch (error) {
            console.error("닉네임 중복 검사 실패:", error);
            setNickStatus("error");
            setNickMessage(
                error.response?.data?.message ||
                "닉네임 중복 확인 중 오류가 발생했습니다."
            );
        }
    };

    const canSubmit = !isSubmitting;

    // ✅ 실제 회원가입 API 요청
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setFieldErrors({});

        const errors = {};
        let firstErrorEl = null;

        // 아이디
        if (!userId.trim()) {
            errors.userId = "아이디를 입력해 주세요.";
            if (!firstErrorEl && userIdRef.current) firstErrorEl = userIdRef.current;
        } else if (userId.trim().length < 4) {
            errors.userId = "아이디는 최소 4글자 이상이어야 합니다.";
            if (!firstErrorEl && userIdRef.current) firstErrorEl = userIdRef.current;
        }

        // 아이디 중복 검사 여부
        if (userIdStatus !== "ok") {
            errors.userId = errors.userId || "아이디 중복 확인을 해 주세요.";
            if (!firstErrorEl && userIdRef.current) firstErrorEl = userIdRef.current;
        }

        // 나이
        if (!age || Number(age) <= 0) {
            errors.age = "나이를 입력해 주세요.";
            if (!firstErrorEl && ageRef.current) firstErrorEl = ageRef.current;
        }

        // 닉네임
        if (!nickname.trim()) {
            errors.nickname = "닉네임을 입력해 주세요.";
            if (!firstErrorEl && nicknameRef.current) firstErrorEl = nicknameRef.current;
        } else if (nickname.trim().length < 2) {
            errors.nickname = "닉네임은 최소 2글자 이상이어야 합니다.";
            if (!firstErrorEl && nicknameRef.current) firstErrorEl = nicknameRef.current;
        }

        // 닉네임 중복 검사 여부
        if (nickStatus !== "ok") {
            errors.nickname = errors.nickname || "닉네임 중복 확인을 해 주세요.";
            if (!firstErrorEl && nicknameRef.current) firstErrorEl = nicknameRef.current;
        }

        // 비밀번호
        if (!password.trim()) {
            errors.password = "비밀번호를 입력해 주세요.";
            if (!firstErrorEl && passwordRef.current) firstErrorEl = passwordRef.current;
        }

        // 비밀번호 확인
        if (!confirmPassword.trim()) {
            errors.confirmPassword = "비밀번호 확인을 입력해 주세요.";
            if (!firstErrorEl && confirmPasswordRef.current)
                firstErrorEl = confirmPasswordRef.current;
        } else if (password.trim() && password !== confirmPassword) {
            errors.confirmPassword = "비밀번호가 서로 일치하지 않습니다.";
            if (!firstErrorEl && confirmPasswordRef.current)
                firstErrorEl = confirmPasswordRef.current;
        }

        // 아바타
        if (!selectedAvatar) {
            errors.avatar = "프로필 아바타를 하나 선택해 주세요.";
            if (!firstErrorEl && avatarRef.current) firstErrorEl = avatarRef.current;
        }

        // 에러 있으면 표시 + 포커스
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            if (firstErrorEl && typeof firstErrorEl.focus === "function") {
                firstErrorEl.focus();
            }
            return;
        }

        if (!canSubmit) return;

        setIsSubmitting(true);

        try {
            // 선택된 id 로부터 실제 SVG 경로 구하기
            const selectedAvatarObj = avatarOptions.find(
                (a) => a.id === selectedAvatar
            );
            const profileImageUrl =
                selectedAvatarObj?.src || "/avatars/avatar-blue.svg";

            const payload = {
                userId: userId.trim(),
                password,
                nickname: nickname.trim(),
                gender,
                age: Number(age),
                email: initialEmail,
                profileImage: profileImageUrl, // ✅ 실제 SVG 경로 전송
            };

            console.log("회원가입 요청 payload:", payload);
            const data = await registerUser(payload);
            console.log("회원가입 성공:", data);

            alert("회원가입이 완료되었습니다. 로그인해 주세요.");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("회원가입 실패:", error);
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
            setSubmitError(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <section className="login signup-form">
            <div className="login-orbit login-orbit--one" />
            <div className="login-orbit login-orbit--two" />

            <div className="login-inner">
                {/* 왼쪽 설명 영역 */}
                <div className="login-copy">
                    <p className="section-eyebrow">AI 콜렉터 회원가입</p>
                    <h2 className="login-title">
                        거의 다 됐어요,
                        <br />
                        <span>AI 콜렉터에서 사용할 정보를 알려 주세요.</span>
                    </h2>
                    <p className="login-desc">
                        아이디와 나이, 그리고 서비스에서 사용할 닉네임을 설정합니다.
                        <br />
                        프로필 이미지는 먼저 기본 아바타 중 하나를 선택하고,
                        <br />
                        나중에 마이페이지에서 직접 업로드 해 변경할 수 있습니다.
                    </p>
                </div>

                {/* 오른쪽 카드 영역 */}
                <div className="login-card">
                    <h3 className="login-card-title">회원 정보 입력</h3>
                    <p className="login-card-sub">
                        앞으로 AI 콜렉터에서 사용할 기본 정보를 입력해 주세요.
                    </p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {/* 이메일 (읽기 전용) */}
                        <div className="form-field">
                            <label htmlFor="signup-email">이메일</label>
                            <input
                                id="signup-email"
                                type="email"
                                value={initialEmail}
                                readOnly
                            />
                        </div>

                        {/* 아이디 + 중복 검사 */}
                        <div className="form-field">
                            <label htmlFor="signup-userid">아이디</label>

                            <div className="nickname-input-row">
                                <input
                                    id="signup-userid"
                                    type="text"
                                    value={userId}
                                    onChange={(e) => {
                                        setUserId(e.target.value);
                                        setUserIdStatus("idle");
                                        setUserIdMessage("");
                                    }}
                                    ref={userIdRef}
                                />

                                <button
                                    type="button"
                                    className="nickname-check-link"
                                    onClick={handleCheckUserId}
                                    disabled={userIdStatus === "checking"}
                                >
                                    {userIdStatus === "checking"
                                        ? "검사 중..."
                                        : "중복 검사"}
                                </button>
                            </div>

                            {userIdMessage && (
                                <p className={`nickname-status nickname-status--${userIdStatus}`}>
                                    {userIdMessage}
                                </p>
                            )}
                            {fieldErrors.userId && (
                                <p
                                    style={{
                                        color: "#e53e3e",
                                        fontSize: "0.8rem",
                                        marginTop: 4,
                                    }}
                                >
                                    {fieldErrors.userId}
                                </p>
                            )}
                        </div>

                        {/* 나이 + 성별 */}
                        <div className="form-field">
                            <label htmlFor="signup-age">나이 / 성별</label>

                            <div className="age-gender-row">
                                {/* 왼쪽: 나이 */}
                                <div className="age-group">
                                    <span className="age-label">나이</span>

                                    <div className="age-input-wrapper">
                                        <input
                                            id="signup-age"
                                            type="number"
                                            className="age-input"
                                            value={age}
                                            onChange={handleAgeChange}
                                            min={1}
                                            max={120}
                                            ref={ageRef}
                                        />
                                    </div>
                                </div>

                                {/* 오른쪽: 성별 */}
                                <div className="gender-group">
                                    <span className="gender-label">성별</span>

                                    <label
                                        className={`gender-pill ${
                                            gender === "M" ? "is-active" : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="M"
                                            onChange={() => setGender("M")}
                                            ref={genderRef}
                                        />
                                        남자
                                    </label>

                                    <label
                                        className={`gender-pill ${
                                            gender === "F" ? "is-active" : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="F"
                                            onChange={() => setGender("F")}
                                        />
                                        여자
                                    </label>
                                </div>
                            </div>

                            {/* 에러를 행 아래로 */}
                            {fieldErrors.age && (
                                <p className="field-error">{fieldErrors.age}</p>
                            )}
                            {fieldErrors.gender && (
                                <p className="field-error">{fieldErrors.gender}</p>
                            )}
                        </div>

                        {/* 닉네임 + 중복 검사 */}
                        <div className="form-field">
                            <label htmlFor="signup-nickname">사용할 닉네임</label>

                            <div className="nickname-input-row">
                                <input
                                    id="signup-nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => {
                                        setNickname(e.target.value);
                                        setNickStatus("idle");
                                        setNickMessage("");
                                    }}
                                    ref={nicknameRef}
                                />

                                <button
                                    type="button"
                                    className="nickname-check-link"
                                    onClick={handleCheckNickname}
                                    disabled={nickStatus === "checking"}
                                >
                                    {nickStatus === "checking"
                                        ? "검사 중..."
                                        : "중복 검사"}
                                </button>
                            </div>

                            {nickMessage && (
                                <p className={`nickname-status nickname-status--${nickStatus}`}>
                                    {nickMessage}
                                </p>
                            )}
                            {fieldErrors.nickname && (
                                <p
                                    style={{
                                        color: "#e53e3e",
                                        fontSize: "0.8rem",
                                        marginTop: 4,
                                    }}
                                >
                                    {fieldErrors.nickname}
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div className="form-field">
                            <label htmlFor="signup-password">비밀번호</label>
                            <input
                                id="signup-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                ref={passwordRef}
                                autoComplete="new-password"
                            />
                            {fieldErrors.password && (
                                <p
                                    style={{
                                        color: "#e53e3e",
                                        fontSize: "0.8rem",
                                        marginTop: 4,
                                    }}
                                >
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div className="form-field">
                            <label htmlFor="signup-confirm-password">비밀번호 확인</label>
                            <input
                                id="signup-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                ref={confirmPasswordRef}
                                autoComplete="new-password"
                            />
                            {fieldErrors.confirmPassword && (
                                <p
                                    style={{
                                        color: "#e53e3e",
                                        fontSize: "0.8rem",
                                        marginTop: 4,
                                    }}
                                >
                                    {fieldErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* 프로필 아바타 선택 */}
                        <div className="form-field">
                            <label>프로필 이미지 선택</label>
                            <p className="avatar-desc">
                                먼저 기본 아바타 중 하나를 선택해 주세요. 나중에 직접 이미지를
                                업로드할 수 있습니다.
                            </p>

                            <div className="profile-avatars">
                                {avatarOptions.map((avatar, idx) => (
                                    <button
                                        type="button"
                                        key={avatar.id}
                                        className={`avatar-option ${
                                            selectedAvatar === avatar.id
                                                ? "avatar-option--selected"
                                                : ""
                                        }`}
                                        onClick={() => setSelectedAvatar(avatar.id)}
                                        ref={idx === 0 ? avatarRef : null}
                                    >
                                        {/* 실제 SVG 이미지 */}
                                        <img
                                            src={avatar.src}
                                            alt={avatar.label}
                                            className="avatar-img"
                                        />
                                        <span className="avatar-label">
                                            {avatar.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.avatar && (
                                <p
                                    style={{
                                        color: "#e53e3e",
                                        fontSize: "0.8rem",
                                        marginTop: 4,
                                    }}
                                >
                                    {fieldErrors.avatar}
                                </p>
                            )}
                        </div>

                        {/* 에러 메시지 */}
                        {submitError && (
                            <p
                                className="form-error-message"
                                style={{ marginTop: "8px", color: "#e53e3e" }}
                            >
                                {submitError}
                            </p>
                        )}

                        {/* 제출 버튼 */}
                        <div className="login-actions-top">
                            <button
                                type="submit"
                                className="btn btn-primary signup-submit"
                                disabled={!canSubmit}
                            >
                                {isSubmitting ? "회원가입 중..." : "회원가입 완료"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default SignUpForm;
