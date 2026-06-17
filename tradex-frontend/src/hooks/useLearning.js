import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useLearning(userId) {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`);
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/progress/${userId}`);
      const data = await res.json();
      setProgress(data.progress || {});
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
  }, [userId]);

  const fetchCertificates = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/certificates/${userId}`);
      const data = await res.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    }
  }, [userId]);

  const markChapterComplete = useCallback(async (courseId, chapterId, timeSpent = 0) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/progress/${userId}/${courseId}/${chapterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time_spent_seconds: timeSpent }),
      });
      const data = await res.json();
      await fetchProgress();
      return data.progress;
    } catch (err) {
      console.error("Failed to mark chapter complete:", err);
      setError(err.message);
      throw err;
    }
  }, [userId, fetchProgress]);

  const submitQuiz = useCallback(async (courseId, quizId, score, totalQuestions) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/quiz/${userId}/${courseId}/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, total_questions: totalQuestions }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const requestCertificate = useCallback(async (courseId) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/certificates/${userId}/${courseId}`, {
        method: "POST",
      });
      const data = await res.json();
      await fetchCertificates();
      return data;
    } catch (err) {
      console.error("Failed to request certificate:", err);
      setError(err.message);
      throw err;
    }
  }, [userId, fetchCertificates]);

  const getCourseProgress = useCallback((courseId) => {
    const courseProgress = progress[courseId] || [];
    const completed = courseProgress.filter(p => p.completed).length;
    return { completed, total: courseProgress.length };
  }, [progress]);

  useEffect(() => {
    fetchCourses();
    if (userId) {
      fetchProgress();
      fetchCertificates();
    }
  }, [fetchCourses, fetchProgress, fetchCertificates, userId]);

  return {
    courses,
    progress,
    certificates,
    loading,
    error,
    markChapterComplete,
    submitQuiz,
    requestCertificate,
    getCourseProgress,
    refresh: () => Promise.all([fetchCourses(), fetchProgress(), fetchCertificates()]),
  };
}
