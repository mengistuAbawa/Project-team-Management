import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleBasedRoute } from './RoleBasedRoute.jsx';
import { ROLES } from '../config/roles.js';

const MainLayout = lazy(() => import('../components/layout/MainLayout.jsx').then((module) => ({ default: module.MainLayout })));
const AuthLayout = lazy(() => import('../components/layout/AuthLayout.jsx').then((module) => ({ default: module.AuthLayout })));
const PublicLayout = lazy(() => import('../layouts/PublicLayout.jsx').then((module) => ({ default: module.PublicLayout })));
const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage.jsx').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../modules/auth/pages/RegisterPage.jsx').then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('../modules/dashboard/pages/DashboardPage.jsx').then((module) => ({ default: module.DashboardPage })));
const UsersPage = lazy(() => import('../modules/users/pages/UsersPage.jsx').then((module) => ({ default: module.UsersPage })));
const ProjectsPage = lazy(() => import('../modules/projects/pages/ProjectsPage.jsx').then((module) => ({ default: module.ProjectsPage })));
const TeamsPage = lazy(() => import('../modules/teams/pages/TeamsPage.jsx').then((module) => ({ default: module.TeamsPage })));
const TasksPage = lazy(() => import('../modules/tasks/pages/TasksPage.jsx').then((module) => ({ default: module.TasksPage })));
const MessagesPage = lazy(() => import('../modules/communication/pages/MessagesPage.jsx').then((module) => ({ default: module.MessagesPage })));
const MeetingsPage = lazy(() => import('../modules/meetings/pages/MeetingsPage.jsx').then((module) => ({ default: module.MeetingsPage })));
const DocumentsPage = lazy(() => import('../modules/documents/pages/DocumentsPage.jsx').then((module) => ({ default: module.DocumentsPage })));
const ReviewsPage = lazy(() => import('../modules/reviews/pages/ReviewsPage.jsx').then((module) => ({ default: module.ReviewsPage })));
const NotificationsPage = lazy(() => import('../modules/notifications/pages/NotificationsPage.jsx').then((module) => ({ default: module.NotificationsPage })));
const ReportsPage = lazy(() => import('../modules/reports/pages/ReportsPage.jsx').then((module) => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import('../modules/settings/pages/SettingsPage.jsx').then((module) => ({ default: module.SettingsPage })));
const ActivityPage = lazy(() => import('../modules/activity/pages/ActivityPage.jsx').then((module) => ({ default: module.ActivityPage })));
const ProfilePage = lazy(() => import('../modules/users/pages/UserProfilePage.jsx').then((module) => ({ default: module.ProfilePage })));
const HomePage = lazy(() => import('../pages/public/HomePage.jsx').then((module) => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('../pages/public/AboutPage.jsx').then((module) => ({ default: module.AboutPage })));
const FeaturesPage = lazy(() => import('../pages/public/FeaturesPage.jsx').then((module) => ({ default: module.FeaturesPage })));
const HowItWorksPage = lazy(() => import('../pages/public/HowItWorksPage.jsx').then((module) => ({ default: module.HowItWorksPage })));
const RolesPage = lazy(() => import('../pages/public/RolesPage.jsx').then((module) => ({ default: module.RolesPage })));
const ContactPage = lazy(() => import('../pages/public/ContactPage.jsx').then((module) => ({ default: module.ContactPage })));
const RequestAccessPage = lazy(() => import('../pages/public/RequestAccessPage.jsx').then((module) => ({ default: module.RequestAccessPage })));
const AdminPublicRequestsPage = lazy(() => import('../modules/users/pages/AdminPublicRequestsPage.jsx').then((module) => ({ default: module.AdminPublicRequestsPage })));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/request-access" element={<RequestAccessPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/admin/requests" element={<AdminPublicRequestsPage />} />
          </Route>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
