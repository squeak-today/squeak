import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Auth from './pages/Auth';

function App() {
	return (
		<NotificationProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/learn" element={<Learn />} />
					<Route path="/auth/:mode" element={<Auth />} />
				</Routes>
			</Router>
		</NotificationProvider>
	);
}

export default App;
