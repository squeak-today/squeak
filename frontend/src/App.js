import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Read from './pages/Read';
import Welcome from './pages/Welcome';
import Teacher from './pages/Teacher'
import TeacherAuth from './pages/TeacherAuth';
import BecomeTeacher from './pages/BecomeTeacher';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
	return (
		<NotificationProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					
					// Teacher Routes
					<Route path="/teacher" element={<Teacher />} />
					<Route path="/teacher/auth/:mode" element={<TeacherAuth />} />
					<Route path="/teacher/dashboard" element={<TeacherDashboard />} />
					<Route path="/teacher/become" element={<BecomeTeacher />} />

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
	);
}

export default App;
