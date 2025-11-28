export default function NotFound(){
  return (
    <div className="h-[70vh] grid place-items-center text-center">
      <div>
        <div className="text-6xl font-bold">404</div>
        <div className="text-gray-500">Page not found</div>
        <a className="inline-block mt-4 px-3 py-2 rounded bg-gray-900 text-white" href="/">Go Home</a>
      </div>
    </div>
  )
}
