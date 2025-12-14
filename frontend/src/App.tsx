import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentLayout } from './layouts/StudentLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LearningJourney } from './pages/student/LearningJourney';
import { StudentLibrary } from './pages/student/StudentLibrary';
import { StudentMaterials } from './pages/student/StudentMaterials';
import { StudentQuizSession } from './pages/student/StudentExercises';
import StudentPracticeHub from './pages/student/StudentPracticeHub';
import { StudentAchievements } from './pages/student/StudentAchievements';
import { StudentMaterialView } from './pages/student/StudentMaterialView';
import { StudentLeaderboard } from './pages/student/StudentLeaderboard';
import { StudentHistory } from './pages/student/StudentHistory';
import { StudentClasses } from './pages/student/StudentClasses';
import { TeacherLayout } from './layouts/TeacherLayout';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClasses } from './pages/teacher/TeacherClasses';
import { TeacherMaterials } from './pages/teacher/TeacherMaterials';
import { TeacherCurriculum } from './pages/teacher/TeacherCurriculum';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes - Protected */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="journey" element={<LearningJourney />} />
            <Route path="classes" element={<StudentClasses />} />
            <Route path="classes/:id" element={<div>Class Detail (Coming Soon)</div>} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="materials/:id" element={<StudentMaterialView />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="practice" element={<StudentPracticeHub />} />
            <Route path="practice/:id" element={<StudentQuizSession />} />
            <Route path="leaderboard" element={<StudentLeaderboard />} />
            <Route path="achievements" element={<StudentAchievements />} />
            <Route path="history" element={<StudentHistory />} />
            <Route path="material/:id" element={<StudentMaterialView />} />
          </Route>

          {/* Teacher Routes - Protected */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="materials" element={<TeacherMaterials />} />
            <Route path="curriculum" element={<TeacherCurriculum />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
          </Route>

          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="content" element={<div>Content Management (Coming Soon)</div>} />
            <Route path="billing" element={<div>Billing (Coming Soon)</div>} />
            <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
