import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface CourseWithCount {
  id: string
  subject: string
  classYear: number
  classSection: string
  schoolType: string
  isActive: boolean
  modules: Array<{
    _count: { lessons: number }
  }>
}

interface CourseCardProps {
  course: CourseWithCount
}

export function CourseCard({ course }: CourseCardProps) {
  const lessonCount = course.modules.reduce(
    (sum, m) => sum + m._count.lessons,
    0
  )

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#534AB7] hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[#534AB7] font-semibold text-lg leading-tight group-hover:text-[#3C3489]">
            {course.subject}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              course.isActive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {course.isActive ? 'Attivo' : 'Archiviato'}
          </span>
        </div>

        {/* Classe */}
        <p className="text-sm text-gray-600 mb-4">
          {course.classYear}ª {course.classSection} — {course.schoolType}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <BookOpen size={13} />
          <span>
            {lessonCount} {lessonCount === 1 ? 'lezione' : 'lezioni'}
          </span>
        </div>
      </div>
    </Link>
  )
}
