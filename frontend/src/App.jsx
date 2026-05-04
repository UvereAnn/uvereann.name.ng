/**
 * App.jsx — Route Definitions
 *
 * CONCEPT — Client-Side Routing:
 * React Router intercepts URL changes and renders
 * the matching component WITHOUT reloading the page.
 * This is what makes React a "Single Page Application" (SPA).
 *
 * Route path="/" → renders Home component
 * Route path="/projects" → renders Projects component
 * etc.
 *
 * Layout wraps all pages with the shared Navbar and Footer.
 */
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About    from './pages/About'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Pipeline from './pages/Pipeline'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"           element={<Home />} />
        <Route path="/about"      element={<About />}    />
        <Route path="/projects"   element={<Projects />} />
        <Route path="/blog"       element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/pipeline"   element={<Pipeline />} />
        <Route path="/contact"    element={<Contact />} />
        <Route path="*"           element={<NotFound />} />
      </Route>
    </Routes>
  )
}
