export default function Navbar() {
  const currentPath = window.location.pathname;

  return (
    <nav className="navbar" aria-label="Main navigation">
      <a className="navbar-brand" href="/">React Nest</a>
      <div className="navbar-links">
        <a className={currentPath === '/' ? 'nav-link active' : 'nav-link'} href="/">
          Dashboard
        </a>
        <a className={currentPath === '/hello' ? 'nav-link active' : 'nav-link'} href="/hello">
          Hello Page
        </a>
      </div>
    </nav>
  );
}
