export default function Footer(){
  return (
    <footer className="mt-12">
      <div className="container mx-auto px-4 py-6 text-sm text-gray-500 flex justify-between">
        <div>© {new Date().getFullYear()} The Elephant</div>
        <div className="flex gap-4">
          <a href="/legal/terms">Terms</a>
          <a href="/legal/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  )
}
