import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import LandingPage from "./LandingPage";
import ProtectedRoute from './ProtectedRoute';
import Home from './Home';
import { Helmet } from 'react-helmet';

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
			<Helmet>
				<script>
					{`
					let tag;
					let player;
					let state = 1;

					window.getState = () => {
						return state;
					}
					`}
				</script>
			</Helmet>
		</>
	)
}

