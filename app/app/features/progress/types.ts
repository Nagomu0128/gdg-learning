// 進捗・ゲーミフィケーションの契約型(CONTRACTS §5)。型は契約なので完成品。
import type { FileMap } from "@codesteps/lesson-kit";

export type LessonStatus = "not_started" | "in_progress" | "passed";

export type CourseOverview = {
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
  passedCount: number;
  firstLessonSlug: string;
};

export type CourseDetail = {
  slug: string;
  title: string;
  description: string;
  lessons: {
    slug: string;
    title: string;
    estMinutes: number;
    order: number;
    slideCount: number;
    status: LessonStatus;
  }[];
  passedCount: number;
  lessonCount: number;
};

export type ExerciseState = {
  status: LessonStatus;
  failedCount: number;
  unlockedHintCount: number;
  solutionAvailable: boolean;
  solutionViewed: boolean;
};

export type VerdictPayload = {
  passed: boolean;
  timedOut: boolean;
  details: { checkId: string; passed: boolean }[];
};

export type BadgeView = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: number | null;
};

export type SubmitResult = {
  passed: boolean;
  streak: { current: number; longest: number; extended: boolean } | null;
  newBadges: { id: string; title: string; description: string; icon: string }[];
  unlockedHintCount: number;
  solutionAvailable: boolean;
};

export type MypageData = {
  stats: { totalPassed: number; currentStreak: number; longestStreak: number };
  badges: { earned: BadgeView[]; locked: BadgeView[] };
  courses: CourseOverview[];
  solutions: { lessonSlug: string; lessonTitle: string; code: FileMap }[];
  resume: {
    courseSlug: string;
    courseTitle: string;
    lessonSlug: string;
    lessonTitle: string;
    target: "slides" | "exercise";
  } | null;
};
