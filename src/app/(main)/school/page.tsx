'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useRouter } from 'next/navigation';

interface StudentSummary {
  id: string;
  full_name: string;
  email: string;
  assessment_progress: number;
  completed_games: string[];
  top_holland_code: string;
  top_career: string;
  top_career_score: number;
}

interface SchoolStats {
  total_students: number;
  avg_progress: number;
  games_played: number;
  top_career_categories: { category: string; count: number }[];
  riasec_distribution: Record<string, number>;
}

export default function SchoolDashboard() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'students' | 'insights'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      const res = await fetch('/api/school/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch school data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/10 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  const views = [
    { id: 'overview' as const, label: 'Overview', emoji: '📊' },
    { id: 'students' as const, label: 'Students', emoji: '👨‍🎓' },
    { id: 'insights' as const, label: 'Insights', emoji: '💡' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">🏫 School Dashboard</h1>
          <p className="text-primary-200 text-sm">Manage students, track progress, and view career insights</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/school/invite')}>
          + Invite Students
        </Button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === v.id
                ? 'bg-primary-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {v.emoji} {v.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeView === 'overview' && stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">{stats.total_students}</div>
                <p className="text-white/60 text-sm mt-1">Total Students</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{stats.avg_progress}%</div>
                <p className="text-white/60 text-sm mt-1">Avg Progress</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{stats.games_played}</div>
                <p className="text-white/60 text-sm mt-1">Games Played</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">
                  {students.filter(s => s.assessment_progress >= 80).length}
                </div>
                <p className="text-white/60 text-sm mt-1">Assessments Done</p>
              </div>
            </Card>
          </div>

          {/* RIASEC Distribution */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">RIASEC Distribution Across Students</h2>
            <div className="space-y-3">
              {Object.entries(stats.riasec_distribution).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-white font-medium text-sm w-28 capitalize">{type}</span>
                  <div className="flex-1">
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                        style={{ width: `${Math.round((count / Math.max(1, stats.total_students)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white/50 text-sm w-10 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Career Categories */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Popular Career Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.top_career_categories.map(({ category, count }) => (
                <div key={category} className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-white font-medium text-sm">{category}</div>
                  <div className="text-primary-400 font-bold">{count} students</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* No stats fallback */}
      {activeView === 'overview' && !stats && (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-white mb-2">No Data Yet</h2>
          <p className="text-white/60 mb-4">Invite students and data will appear here as they complete assessments.</p>
          <Button onClick={() => router.push('/school/invite')}>Invite Students</Button>
        </Card>
      )}

      {/* STUDENTS LIST */}
      {activeView === 'students' && (
        <>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <span className="text-white/50 text-sm">{filteredStudents.length} students</span>
          </div>

          {filteredStudents.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-white/60">No students found. Invite students to get started.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} hover>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-600/30 rounded-full flex items-center justify-center text-primary-300 font-bold">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{student.full_name}</h3>
                      <p className="text-white/40 text-xs truncate">{student.email}</p>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-primary-400 font-bold text-sm">{student.top_holland_code || '—'}</div>
                      <div className="text-white/40 text-xs">Holland</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-white font-medium text-sm">{student.top_career || '—'}</div>
                      <div className="text-white/40 text-xs">Top Career</div>
                    </div>
                    <div className="w-24">
                      <ProgressBar value={student.assessment_progress} label="" />
                      <p className="text-white/40 text-xs text-center mt-1">{student.assessment_progress}%</p>
                    </div>
                    <div className="text-white/40 text-xs">{student.completed_games.length}/10 games</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* INSIGHTS */}
      {activeView === 'insights' && (
        <>
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">💡 Counselor Insights</h2>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-lg">
                <h3 className="text-emerald-300 font-medium text-sm mb-1">Students Needing Attention</h3>
                <p className="text-white/60 text-sm">
                  {students.filter(s => s.assessment_progress < 30).length} students have less than 30% progress.
                  Consider following up to encourage them.
                </p>
              </div>
              <div className="p-4 bg-amber-600/10 border border-amber-500/20 rounded-lg">
                <h3 className="text-amber-300 font-medium text-sm mb-1">Career Diversity</h3>
                <p className="text-white/60 text-sm">
                  {stats?.top_career_categories.length || 0} different career categories are represented.
                  {(stats?.top_career_categories.length || 0) < 5
                    ? ' Consider exposing students to more career options.'
                    : ' Great diversity in career interests!'}
                </p>
              </div>
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-blue-300 font-medium text-sm mb-1">Assessment Completion</h3>
                <p className="text-white/60 text-sm">
                  {students.filter(s => s.assessment_progress >= 80).length} of {students.length} students
                  have completed 80%+ of their assessment. Encourage remaining students to finish.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">📋 Recommended Actions</h2>
            <div className="space-y-3">
              {students.filter(s => s.assessment_progress < 30).length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-2xl">📩</span>
                  <div className="flex-1">
                    <p className="text-white text-sm">Send reminders to inactive students</p>
                    <p className="text-white/40 text-xs">{students.filter(s => s.assessment_progress < 30).length} students with low progress</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <p className="text-white text-sm">Schedule counseling sessions for completed assessments</p>
                  <p className="text-white/40 text-xs">{students.filter(s => s.assessment_progress >= 80).length} students ready for review</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <p className="text-white text-sm">Share career reports with parents</p>
                  <p className="text-white/40 text-xs">Generate PDF reports for parent-teacher meetings</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
