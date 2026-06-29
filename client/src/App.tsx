import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, isAdmin, isTeacher } from './store/authStore';
import MainLayout from './components/layout/MainLayout';
import ExamLayout from './components/layout/ExamLayout';

// Auth
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage   from './pages/auth/ResetPasswordPage';

// Student
import StudentDashboard        from './pages/dashboard/StudentDashboard';
import ExamsPage               from './pages/exams/ExamsPage';
import ResultsPage             from './pages/results/ResultsPage';
import StatsPage               from './pages/stats/StatsPage';
import LeaderboardPage         from './pages/leaderboard/LeaderboardPage';
import StudentWaitingRoomPage  from './pages/student/StudentWaitingRoomPage';

// Profile (all roles)
import ProfilePage from './pages/profile/ProfilePage';

// Teacher
import ExamManagementPage      from './pages/teacher/ExamManagementPage';
import QuestionManagerPage     from './pages/teacher/QuestionManagerPage';
import TeacherDashboard        from './pages/teacher/TeacherDashboard';
import BadgeManagerPage        from './pages/teacher/BadgeManagerPage';
import ManualGradingPage       from './pages/teacher/ManualGradingPage';
import TeacherResultsPage      from './pages/teacher/TeacherResultsPage';
import ExamAnalyticsPage       from './pages/teacher/ExamAnalyticsPage';
import TeacherWaitingRoomPage  from './pages/teacher/TeacherWaitingRoomPage';

// Admin
import AdminDashboard              from './pages/admin/AdminDashboard';
import AdminUsersPage              from './pages/admin/AdminUsersPage';
import AdminSettingsPage           from './pages/admin/AdminSettingsPage';
import AdminAuditLogsPage          from './pages/admin/AdminAuditLogsPage';
import AdminExamsPage              from './pages/admin/AdminExamsPage';
import AdminResultsPage            from './pages/admin/AdminResultsPage';

// Exam taking
import ExamInterface from './pages/exam/ExamInterface';

const RoleGuard = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    const dashboardPath = user.role === 'ROLE_ADMIN' ? '/admin' : user.role === 'ROLE_TEACHER' ? '/teacher/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }
  return <Outlet />;
};

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user            = useAuthStore((s) => s.user);

  // Determine default dashboard by role
  const dashboardPath = isAdmin(user) ? '/admin' : isTeacher(user) ? '/teacher/dashboard' : '/dashboard';

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            border: '1px solid #DDE8F0',
            boxShadow: '0 4px 24px rgba(5,63,92,0.10)',
            color: '#053F5C',
          },
          success: { style: { borderColor: '#86EFAC' } },
          error:   { style: { borderColor: '#FECDD3', color: '#E11D48' } },
        }}
      />
      <Routes>
        {/* ── Public Auth Routes ─────────────────────── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* ── Protected Main Layout ─────────────────── */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          {/* Root redirect by role */}
          <Route path="/" element={<Navigate to={dashboardPath} replace />} />

          {/* ── Student ───────────────────────────── */}
          <Route element={<RoleGuard allowedRoles={['ROLE_STUDENT']} />}>
            <Route path="/dashboard"      element={<StudentDashboard />} />
            <Route path="/exams"          element={<ExamsPage />} />
            <Route path="/results"        element={<ResultsPage />} />
            <Route path="/stats"          element={<StatsPage />} />
            <Route path="/leaderboard"    element={<LeaderboardPage />} />
          </Route>

          {/* ── Teacher ───────────────────────────── */}
          <Route element={<RoleGuard allowedRoles={['ROLE_TEACHER']} />}>
            <Route path="/teacher/dashboard"                  element={<TeacherDashboard />} />
            <Route path="/teacher/exams"                      element={<ExamManagementPage />} />
            <Route path="/teacher/exams/:examId/questions"    element={<QuestionManagerPage />} />
            <Route path="/teacher/badges"                     element={<BadgeManagerPage />} />
            <Route path="/teacher/grading"                    element={<ManualGradingPage />} />
            <Route path="/teacher/results"                    element={<TeacherResultsPage />} />
            <Route path="/teacher/analytics/:examId"          element={<ExamAnalyticsPage />} />
            <Route path="/teacher/exam/:examId/waiting-room"  element={<TeacherWaitingRoomPage />} />
          </Route>

          {/* ── Admin ─────────────────────────────── */}
          <Route element={<RoleGuard allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin"                        element={<AdminDashboard />} />
            <Route path="/admin/users"                  element={<AdminUsersPage />} />
            <Route path="/admin/settings"               element={<AdminSettingsPage />} />
            <Route path="/admin/audit-logs"             element={<AdminAuditLogsPage />} />
            <Route path="/admin/exams"                  element={<AdminExamsPage />} />
            <Route path="/admin/results"                element={<AdminResultsPage />} />
          </Route>

          {/* ── Common ────────────────────────────── */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* ── Exam Taking Layout ────────────────────── */}
        <Route element={isAuthenticated ? <ExamLayout /> : <Navigate to="/login" replace />}>
          <Route path="/exam/:examId/waiting-room" element={<StudentWaitingRoomPage />} />
          <Route path="/exam/:examId"              element={<ExamInterface />} />
        </Route>

        {/* ── Catch-all ─────────────────────────────── */}
        <Route path="*" element={<Navigate to={isAuthenticated ? dashboardPath : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

