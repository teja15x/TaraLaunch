'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface ActionItem {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'missed';
  due_date: string;
}

export function AccountabilityWidget() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/action-items');
        if (res.ok) {
          const data = await res.json();
          setItems(data.actionItems || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch action items:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (currentStatus === 'missed') return; // Cannot toggle missed items simply

    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const res = await fetch('/api/action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('API failure');
    } catch (err) {
      // Revert if API fails
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: currentStatus as any } : item))
      );
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white/5 border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-white/5 rounded-xl mb-3"></div>
        <div className="h-16 bg-white/5 rounded-xl"></div>
      </Card>
    );
  }

  if (error) {
    return null; // Silent fail if database not fully migrated / disconnected
  }

  const pendingItems = items.filter((item) => item.status === 'pending');
  const upcomingItems = pendingItems.slice(0, 3); // Show top 3 pending only
  
  if (items.length === 0) {
    // Hidden completely if no tasks have ever been assigned
    return null; 
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-900/30 to-slate-950/60 border-indigo-500/20 shadow-lg relative overflow-hidden">
      {/* Decorative pulse background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎯</span> Counselor Action Plan
        </h2>
        <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
          {pendingItems.length} Pending Actions
        </span>
      </div>

      {upcomingItems.length === 0 ? (
        <div className="text-center py-8 bg-white/[0.03] rounded-2xl border border-white/[0.05] relative z-10">
          <span className="text-3xl mb-3 block">✨</span>
          <p className="text-white/90 font-medium">You are crushing it!</p>
          <p className="text-white/50 text-sm mt-1">You've completed all tasks assigned by your career mentor.</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {upcomingItems.map((item) => {
            const dueDate = new Date(item.due_date);
            const isLate = dueDate < new Date();
            const dateStr = dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

            return (
              <div 
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all hover:border-indigo-500/30 group"
              >
                <button
                  onClick={() => toggleStatus(item.id, item.status)}
                  className="mt-0.5 w-6 h-6 rounded-full border-2 border-indigo-400/50 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-400 group-hover:bg-emerald-400/10 transition-all cursor-pointer"
                  aria-label="Mark task as complete"
                >
                  {/* Empty circle waiting to be clicked */}
                </button>
                <div>
                  <p className="text-white/90 font-medium text-sm leading-snug pr-2">{item.title}</p>
                  <p className={`text-xs mt-1.5 font-medium ${isLate ? 'text-red-400' : 'text-indigo-300/80'}`}>
                    {isLate ? 'Late • ' : 'Due by '} {dateStr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}