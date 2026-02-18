export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2a5885] to-[#1a3a5c] p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
