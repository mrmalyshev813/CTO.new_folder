import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const documents = await prisma.document.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2a5885]">Documents</h1>
        <button className="vk-button text-sm px-3 py-1.5">Upload Document</button>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        {documents.length > 0 ? (
          <table className="w-full">
            <thead className="bg-[#f0f2f5]">
              <tr>
                <th className="text-left p-3 font-medium text-sm">Name</th>
                <th className="text-left p-3 font-medium text-sm">Type</th>
                <th className="text-left p-3 font-medium text-sm">Size</th>
                <th className="text-left p-3 font-medium text-sm">Date</th>
                <th className="text-right p-3 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3d9de]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#f0f2f5]">
                  <td className="p-3">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2688eb] hover:underline font-medium"
                    >
                      {doc.title}
                    </a>
                  </td>
                  <td className="p-3 text-sm text-[#818c99]">{doc.type}</td>
                  <td className="p-3 text-sm text-[#818c99]">{formatFileSize(doc.size)}</td>
                  <td className="p-3 text-sm text-[#818c99]">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-red-500 hover:text-red-600 text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-[#818c99]">No documents yet. Upload your first document!</p>
          </div>
        )}
      </div>
    </div>
  )
}
