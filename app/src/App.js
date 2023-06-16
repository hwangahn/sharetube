import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import LandingPage from "./LandingPage";
import Home from './Home';

export default function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route exact path='/' Component={LandingPage} />
					<Route path="/:roomID" Component={Home} />
				</Routes>
			</BrowserRouter>
		</>
	)
}

