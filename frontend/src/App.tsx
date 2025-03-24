import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Read from './pages/Read';
import Welcome from './pages/Welcome';
import TeacherDashboard from './pages/TeacherDashboard';
import BecomeTeacher from './pages/BecomeTeacher';
import BecomeStudent from './pages/BecomeStudent';
import Profile from './pages/Profile';
import TeacherAnalytics from './components/TeacherAnalytics';
import TeacherContent from './components/TeacherContent';
import TeacherStudents from './components/TeacherStudents';

const App: React.FC = () => {
	return (
		<AuthProvider>
		<NotificationProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					
					<Route path="/teacher" element={
						<ProtectedRoute>
							<TeacherDashboard />
						</ProtectedRoute>
					} />
					<Route path="/teacher/dashboard" element={
						<ProtectedRoute>
							<TeacherDashboard />
						</ProtectedRoute>
					} />
					<Route path="/teacher/content" element={
						<ProtectedRoute>
							<TeacherContent />
						</ProtectedRoute>
					} />
					<Route path="/teacher/Analytics" element={
						<ProtectedRoute>
							<TeacherAnalytics />
						</ProtectedRoute>
					} />
					<Route path="/teacher/students" element={
						<ProtectedRoute>
							<TeacherStudents />
						</ProtectedRoute>
					} />
					
					<Route path="/teacher/become" element={
						<ProtectedRoute>
							<BecomeTeacher />
						</ProtectedRoute>
					} />
					<Route path="/student/become" element={
						<ProtectedRoute>
							<BecomeStudent />
						</ProtectedRoute>
					} />
					<Route path="/profile" element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					} />

					<Route path="/auth/:mode" element={<Auth />} />
					<Route 
						path="/learn" 
						element={
							<ProtectedRoute>
								<Learn />
							</ProtectedRoute>
						} 
					/>
					<Route 
						path="/read/:type/:id" 
						element={
							<ProtectedRoute>
								<Read />
							</ProtectedRoute>
						} 
					/>
					<Route path="/welcome" element={
						<ProtectedRoute>
							<Welcome />
						</ProtectedRoute>
					} />
				</Routes>
			</Router>
		</NotificationProvider>
		</AuthProvider>
	);
};

export default App; 