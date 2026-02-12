import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import StudentDashboard from './pages/student/Dashboard';
import StudentOnboarding from './pages/student/Onboarding';
import StudentAssessment from './pages/student/Assessment';
import StudentResults from './pages/student/Results';
import StudentPathways from './pages/student/Pathways';
import StudentCareerDetail from './pages/student/CareerDetail';
import StudentPathwayPlan from './pages/student/PathwayPlan';
import AdminLogin from './pages/admin/Login';

import AdminDashboard from './pages/admin/Dashboard';
import QuestionBank from './pages/admin/QuestionBank';
import QuestionEditor from './pages/admin/QuestionEditor';
import TraitManager from './pages/admin/Traits';
import ClusterManager from './pages/admin/Clusters';
import BranchingTool from './pages/admin/Branching';
import PublishManager from './pages/admin/Publish';
import ImportExport from './pages/admin/ImportExport';
import Simulator from './pages/admin/Simulator';
import TeacherReports from './pages/teacher/Reports';
import ReportView from './pages/teacher/ReportView';
import ParentAccess from './pages/parent/ParentAccess';
import CounselorReports from './pages/counselor/Reports';
import { useAuthStore } from './store/auth';

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/onboarding" element={<StudentOnboarding />} />
      <Route path="/student/assessment" element={<StudentAssessment />} />
      <Route path="/student/results/:sessionId" element={<StudentResults />} />
      <Route path="/student/pathways" element={<StudentPathways />} />
      <Route path="/student/careers/:clusterId" element={<StudentCareerDetail />} />
      <Route path="/student/plan/:clusterId" element={<StudentPathwayPlan />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <RequireAdmin>
            <QuestionBank />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/questions/new"
        element={
          <RequireAdmin>
            <QuestionEditor />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/questions/:id"
        element={
          <RequireAdmin>
            <QuestionEditor />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/traits"
        element={
          <RequireAdmin>
            <TraitManager />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/clusters"
        element={
          <RequireAdmin>
            <ClusterManager />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/branching"
        element={
          <RequireAdmin>
            <BranchingTool />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/publish"
        element={
          <RequireAdmin>
            <PublishManager />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/import-export"
        element={
          <RequireAdmin>
            <ImportExport />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/simulator"
        element={
          <RequireAdmin>
            <Simulator />
          </RequireAdmin>
        }
      />

      <Route path="/teacher" element={<TeacherReports />} />
      <Route path="/teacher/:id" element={<ReportView />} />

      <Route path="/parent" element={<ParentAccess />} />

      <Route path="/counselor" element={<CounselorReports />} />
      <Route path="/counselor/:id" element={<ReportView />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
