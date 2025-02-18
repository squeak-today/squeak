import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Read from './pages/Read';
import Welcome from './pages/Welcome';
import Teacher from './pages/Teacher'

function App() {
	return (
		<NotificationProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/Teacher" element={<Teacher />} />
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
