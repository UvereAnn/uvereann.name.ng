/**
 * components/Layout.jsx
 *
 * CONCEPT — Layout Component:
 * Every page shares the same Navbar and Footer.
 * Instead of importing them in every page, we create a
 * Layout component that wraps all pages.
 *
 * <Outlet /> is where React Router renders the current page.
 * Layout renders once; only the Outlet content changes
 * as you navigate.
 */
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
