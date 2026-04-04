import { CareerData } from '@/data/careers';
import { MarketProfile } from '@/types';

export interface MarketRealityContext {
  affordability_level?: 'aspirational' | 'accessible' | 'tight';
  time_to_decision?: string;
  tier?: 'tier1' | 'tier2' | 'tier3';
}

export interface RealityCheckNote {
  careerId: string;
  reality_check_notes: string[];
  adjusted_salary_inr?: string;
  is_blocked?: boolean; 
}

export function applyMarketRealities(
  careers: CareerData[],
  context: MarketRealityContext
): RealityCheckNote[] {
  const notes: RealityCheckNote[] = [];

  for (const career of careers) {
    if (!career.market_profile) {
      notes.push({ careerId: career.id, reality_check_notes: [] });
      continue;
    }

    const { entry_cost, time_to_yield_years, demand_trend, tier_3_starting_salary_inr } = career.market_profile;
    const careerNotes: string[] = [];
    let is_blocked = false;

    // 1. Entry cost vs Affordability
    if (context.affordability_level === 'tight' && (entry_cost === 'high' || entry_cost === 'extreme')) {
      careerNotes.push('Market Reality: High risk due to extreme educational costs. Requires heavy loans or exceptional scholarship path.');
    }

    // 2. Demand trend
    if (demand_trend === 'oversupplied') {
      careerNotes.push('Market Reality: Oversupplied market at entry level. Prepare for intense off-campus struggle unless graduating from a top-tier college.');
    } else if (demand_trend === 'high_growth') {
      careerNotes.push('Market Reality: High-growth hiring trend, but skills matter more than degree name.');
    }

    // 3. Salary realism
    let adjusted_salary_inr = career.salary_range_inr;
    if (context.tier === 'tier3' && tier_3_starting_salary_inr) {
      const lakhs = (tier_3_starting_salary_inr / 100000).toFixed(1);
      const upperLakhs = (tier_3_starting_salary_inr / 100000 + 2).toFixed(1);
      adjusted_salary_inr = `~₹${lakhs}L - ₹${upperLakhs}L per annum (Realistic Tier-3 start)`;
      careerNotes.push(`Market Reality: Expect realistic starting salary of around ₹${lakhs}LPA from a local tier-3 college, not the advertised averages.`);
    }

    notes.push({
      careerId: career.id,
      reality_check_notes: careerNotes,
      adjusted_salary_inr,
      is_blocked
    });
  }

  return notes;
}
