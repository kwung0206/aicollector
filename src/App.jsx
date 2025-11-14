// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import SignUpForm from "./pages/SignUpForm.jsx";
import SignUpEmail from "./pages/SignUpEmail.jsx"
import ProfilePage from "./pages/ProfilePage.jsx";
function App() {
    return (
        <div className="app">
            <div className="bg-orbit orbit-1" />
            <div className="bg-orbit orbit-2" />
            <div className="bg-orbit orbit-3" />

            <Header />

            <main className="main">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />          {/* 약관 */}
                    <Route path="/signup/email" element={<SignUpEmail />} /> {/* 이메일 인증 */}
                    <Route path="/signup/form" element={<SignUpForm />} /> {/* 실제 회원가입 */}
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;
