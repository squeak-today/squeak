import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';
import Home from './pages/Home';
import Educators from './pages/Educators';
import Learn from './pages/Learn';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Read from './pages/Read';
import Welcome from './pages/Welcome';
import BecomeStudent from './pages/BecomeStudent';
import Profile from './pages/Profile';
import DeckView from './pages/DeckView';

const App: React.FC = () => {
	return (
		<AuthProvider>
		<PlatformProvider>
		<NotificationProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/educators" element={<Educators />} />
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
					<Route path="/profile/:getPremium" element={
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
					<Route 
						path="/decks/:id" 
						element={
							<ProtectedRoute>
								<DeckView />
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
		</PlatformProvider>
		</AuthProvider>
	);
};

export default App; 