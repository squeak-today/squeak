import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
	return (
		<NotificationProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/auth/:mode" element={<Auth />} />
					<Route 
						path="/learn" 
						element={
							<ProtectedRoute>
								<Learn />
							</ProtectedRoute>
						} 
					/>
				</Routes>
			</Router>
		</NotificationProvider>
	);
}

export default App;
