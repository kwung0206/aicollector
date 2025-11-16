// src/App.jsx

import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SignUpEmail from "./pages/SignUpEmail";
import SignUpForm from "./pages/SignUpForm";
import ProfilePage from "./pages/ProfilePage";
import VideoGallery from "./pages/VideoGallery";
import VideoUpload from "./pages/VideoUpload";
import Finding from "./pages/Finding";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
    const location = useLocation();

    // ✅ /admin, /admin/dashboard, /admin/xxx 전부 여기서 true
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <div className="app">
            {/* 관리자 관련 페이지가 아닐 때만 배경 + 헤더 출력 */}
            {!isAdminRoute && (
                <>
                    <div className="bg-orbit orbit-1" />
                    <div className="bg-orbit orbit-2" />
                    <div className="bg-orbit orbit-3" />
                    <Header />
                </>
            )}

            <main className="main">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/signup/email" element={<SignUpEmail />} />
                    <Route path="/signup/form" element={<SignUpForm />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/videos" element={<VideoGallery />} />
                    <Route path="/videos/upload" element={<VideoUpload />} />
                    <Route path="/finding" element={<Finding />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />

                    {/* 관리자 */}
                    <Route path="/admin" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                </Routes>
            </main>

            {/* 관리자 페이지가 아닐 때만 푸터 출력 */}
            {!isAdminRoute && <Footer />}
        </div>
    );
}

export default App;
