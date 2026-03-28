import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
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
import { ClassSelection } from './pages/student/ClassSelection';
import { ClassDiscovery } from './pages/student/ClassDiscovery';
import { ClassDashboard } from './pages/student/ClassDashboard';
import { ClassMaterials } from './pages/student/ClassMaterials';
import { ClassExercises } from './pages/student/ClassExercises';
import { ClassLibrary } from './pages/student/ClassLibrary';
import { ClassJourney } from './pages/student/ClassJourney';
import { ClassCanvas } from './pages/student/ClassCanvas';
import { ClassAchievements } from './pages/student/ClassAchievements';
import { ClassForum } from './pages/student/ClassForum';
import { ClassLeaderboard } from './pages/student/ClassLeaderboard';
import { BookReader } from './pages/student/BookReader';
import { GeometryPractice } from './pages/student/GeometryPractice';
import { TeacherLayout } from './layouts/TeacherLayout';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClasses } from './pages/teacher/TeacherClasses';
import { TeacherMaterials } from './pages/teacher/TeacherMaterials';
import { TeacherCurriculum } from './pages/teacher/TeacherCurriculum';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';
import { TeacherClassDetail } from './pages/teacher/TeacherClassDetail';
import { BookEditor } from './pages/teacher/BookEditor';
import { ExerciseEditor } from './pages/teacher/ExerciseEditor';
import { ExerciseReview } from './pages/teacher/ExerciseReview';
import { ExerciseSession } from './pages/student/ExerciseSession';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
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
            <Route index element={<ClassSelection />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="journey" element={<LearningJourney />} />
            <Route path="classes" element={<ClassSelection />} />
            <Route path="discover" element={<ClassDiscovery />} />
            <Route path="class/:classId" element={<ClassDashboard />} />
            <Route path="class/:classId/materials" element={<ClassMaterials />} />
            <Route path="class/:classId/exercises" element={<ClassExercises />} />
            <Route path="class/:classId/library" element={<ClassLibrary />} />
            <Route path="class/:classId/library/:bookId" element={<BookReader />} />
            <Route path="class/:classId/journey" element={<ClassJourney />} />
            <Route path="class/:classId/canvas" element={<ClassCanvas />} />
            <Route path="class/:classId/achievements" element={<ClassAchievements />} />
            <Route path="class/:classId/leaderboard" element={<ClassLeaderboard />} />
            <Route path="class/:classId/forum" element={<ClassForum />} />
            <Route path="class/:classId/exercise/:exerciseId" element={<ExerciseSession />} />
            <Route path="geometry" element={<GeometryPractice />} />
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
            <Route path="classes/:id" element={<TeacherClassDetail />} />
            <Route path="materials" element={<TeacherMaterials />} />
            <Route path="curriculum" element={<TeacherCurriculum />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="classes/:classId/book-editor" element={<BookEditor />} />
            <Route path="classes/:classId/book-editor/:bookId" element={<BookEditor />} />
            <Route path="classes/:classId/exercise-editor" element={<ExerciseEditor />} />
            <Route path="classes/:classId/exercise-editor/:exerciseId" element={<ExerciseEditor />} />
            <Route path="classes/:classId/exercise-review/:exerciseId" element={<ExerciseReview />} />
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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
