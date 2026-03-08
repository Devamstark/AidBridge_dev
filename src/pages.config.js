/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import BreakGlass from './pages/BreakGlass';
import Dashboard from './pages/Dashboard';
import Disasters from './pages/Disasters';
import Distributions from './pages/Distributions';
import EmergencyDispatch from './pages/EmergencyDispatch';
import Locations from './pages/Locations';
import Login from './pages/Login';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import SurvivorIntake from './pages/SurvivorIntake';
import Survivors from './pages/Survivors';
import Unauthorized from './pages/Unauthorized';
import VolunteerProfiles from './pages/VolunteerProfiles';
import Volunteers from './pages/Volunteers';
import Reports from './pages/Reports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BreakGlass": BreakGlass,
    "Dashboard": Dashboard,
    "Disasters": Disasters,
    "Distributions": Distributions,
    "EmergencyDispatch": EmergencyDispatch,
    "Locations": Locations,
    "Login": Login,
    "Reports": Reports,
    "Resources": Resources,
    "Settings": Settings,
    "SurvivorIntake": SurvivorIntake,
    "Survivors": Survivors,
    "Unauthorized": Unauthorized,
    "VolunteerProfiles": VolunteerProfiles,
    "Volunteers": Volunteers,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};