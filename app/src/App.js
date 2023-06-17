import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import LandingPage from "./LandingPage";
import ProtectedRoute from './ProtectedRoute';
import Home from './Home';

export default function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route exact path='/' Component={LandingPage} />
					<Route Component={ProtectedRoute}> 
						<Route path='/:roomID' Component={Home} />
					</Route>
				</Routes>
			</BrowserRouter>
		</>
	)
}

