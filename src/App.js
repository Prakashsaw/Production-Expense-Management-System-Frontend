import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PageNotFound from "./pages/PageNotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TermsAndConditions from "./pages/UserAgreement/TermsAndConditions";
import PrivacyAndPolicy from "./pages/UserAgreement/PrivacyAndPolicy";
import EmailSent from "./pages/EmailSent";
import EmailVerification from "./pages/EmailVerification/EmailVerification";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <HomePage />
            </ProtectedRoutes>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/email-verification/:_id/:token" element={<EmailVerification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:_id/:token" element={<ResetPassword />} />
        <Route path="/terms-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyAndPolicy />} />
        <Route path="/forgot-email-sent" element={<EmailSent />} />
        {/* if path is not correct then navigate to page not found page */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export function ProtectedRoutes(props) {
  if (localStorage.getItem("user")) {
    return props.children;
  } else {
    return <Navigate to="/login" />;
  }
}

export default App;
