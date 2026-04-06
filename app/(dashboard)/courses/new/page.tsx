import { CourseForm } from '@/components/courses/CourseForm'

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Nuovo corso</h1>
        <p className="text-gray-500 text-sm mt-1">
          Inserisci i dettagli del tuo nuovo corso
        </p>
      </div>

      <CourseForm mode="create" />
    </div>
  )
}
