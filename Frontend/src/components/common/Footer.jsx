export default function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} BeautyTrend</span>
      <span className="prototype-status">
        <i />
        Prototype mode
      </span>
    </footer>
  )
}
