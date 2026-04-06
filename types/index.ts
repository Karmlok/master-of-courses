import type { Course, Lesson, Module, Activity, User } from '@prisma/client'

// Re-export Prisma types per uso globale
export type { Course, Lesson, Module, Activity, User }

// Tipi composti
export type CourseWithModules = Course & {
  modules: (Module & {
    lessons: Lesson[]
    _count?: { lessons: number }
  })[]
  _count?: { modules: number }
}

export type LessonWithModule = Lesson & {
  module: Module & {
    course: Course
  }
}

export type LessonWithActivities = Lesson & {
  module: Module & {
    course: Course
  }
  activities: Activity[]
}

// Risposta API standard
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}
