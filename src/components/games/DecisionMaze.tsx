'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface MazeNode {
  id: string;
  text: string;
  emoji?: string;
  options: {
    label: string;
    nextNode: string;
    traits: Partial<TraitScores>;
  }[];
}

interface Maze {
  id: string;
  title: string;
  emoji: string;
  description: string;
  startNode: string;
  nodes: Record<string, MazeNode>;
}

const mazes: Maze[] = [
  {
    id: 'maze1',
    title: 'The Startup Dilemma',
    emoji: '🚀',
    description: 'Navigate the twists and turns of launching a startup.',
    startNode: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'You have a great app idea that could help Indian farmers track weather and crop prices. You have some savings. Where do you begin?',
        emoji: '💡',
        options: [
          { label: 'Build a prototype yourself first', nextNode: 'build', traits: { technical: 15, creative: 10, adaptability: 10 } },
          { label: 'Research the market and talk to farmers', nextNode: 'research', traits: { analytical: 15, empathy: 15, communication: 10 } },
          { label: 'Find a co-founder with farming knowledge', nextNode: 'cofounder', traits: { leadership: 15, communication: 15, empathy: 10 } },
        ],
      },
      build: {
        id: 'build',
        text: 'You built a basic prototype. It works but farmers find it confusing. What now?',
        emoji: '🔧',
        options: [
          { label: 'Visit villages and watch farmers try to use it', nextNode: 'user_test', traits: { empathy: 20, adaptability: 10, communication: 10 } },
          { label: 'Hire a UI designer to make it simpler', nextNode: 'design', traits: { leadership: 10, creative: 15, analytical: 10 } },
          { label: 'Add voice commands so they don\'t need to read', nextNode: 'innovate', traits: { creative: 20, technical: 15, empathy: 10 } },
        ],
      },
      research: {
        id: 'research',
        text: 'Your research reveals 3 key pain points: weather unpredictability, unfair middlemen pricing, and lack of storage info. Which do you tackle first?',
        emoji: '📊',
        options: [
          { label: 'Weather alerts — highest immediate impact', nextNode: 'weather', traits: { analytical: 20, detail_oriented: 10, empathy: 10 } },
          { label: 'Fair pricing — biggest economic impact', nextNode: 'pricing', traits: { leadership: 15, empathy: 15, analytical: 10 } },
          { label: 'All three with a phased approach', nextNode: 'phased', traits: { analytical: 15, detail_oriented: 15, leadership: 10 } },
        ],
      },
      cofounder: {
        id: 'cofounder',
        text: 'You found Suresh, a farmer\'s son with an MBA. He wants 50% equity. Your call?',
        emoji: '🤝',
        options: [
          { label: 'Accept — his knowledge is invaluable', nextNode: 'equal_split', traits: { empathy: 15, leadership: 15, adaptability: 10 } },
          { label: 'Counter with 30% + performance milestones', nextNode: 'negotiate', traits: { analytical: 15, leadership: 15, communication: 10 } },
          { label: 'Offer an advisory role instead, keep building solo', nextNode: 'solo', traits: { technical: 10, leadership: 10, detail_oriented: 15 } },
        ],
      },
      user_test: {
        id: 'user_test', text: 'Farmers love the concept but most don\'t have smartphones. You need to reach them differently.',
        options: [
          { label: 'Partner with local kirana shops that have smartphones', nextNode: 'end_community', traits: { creative: 15, communication: 15, empathy: 15 } },
          { label: 'Build an SMS/USSD version for basic phones', nextNode: 'end_tech', traits: { technical: 20, adaptability: 15, analytical: 10 } },
        ],
      },
      design: {
        id: 'design', text: 'The new design is beautiful but the designer wants ₹5L which is most of your savings.',
        options: [
          { label: 'Pay it — great design is worth the investment', nextNode: 'end_invest', traits: { leadership: 15, creative: 15, adaptability: 10 } },
          { label: 'Offer equity instead of cash payment', nextNode: 'end_equity', traits: { communication: 15, leadership: 15, analytical: 10 } },
        ],
      },
      innovate: {
        id: 'innovate', text: 'The voice feature goes viral! A VC offers ₹50L funding but wants you to pivot to serving all of Southeast Asia.',
        options: [
          { label: 'Take the funding and expand — huge opportunity', nextNode: 'end_scale', traits: { leadership: 20, adaptability: 15, creative: 10 } },
          { label: 'Decline and stay focused on Indian farmers first', nextNode: 'end_focus', traits: { empathy: 15, detail_oriented: 15, analytical: 10 } },
        ],
      },
      weather: {
        id: 'weather', text: 'Your weather alert system works great! IMD wants to partner. But they move slowly — it could take 6 months.',
        options: [
          { label: 'Wait for IMD — government backing is huge', nextNode: 'end_govt', traits: { analytical: 15, detail_oriented: 15, leadership: 10 } },
          { label: 'Launch independently and let IMD join later', nextNode: 'end_indie', traits: { adaptability: 15, leadership: 15, creative: 10 } },
        ],
      },
      pricing: {
        id: 'pricing', text: 'Your fair pricing tool is disrupting middlemen. Some are threatening local farmers who use your app.',
        options: [
          { label: 'Partner with local police and government officials', nextNode: 'end_authority', traits: { leadership: 20, communication: 15, analytical: 10 } },
          { label: 'Make the app anonymous so farmers can\'t be identified', nextNode: 'end_privacy', traits: { technical: 15, empathy: 20, creative: 10 } },
        ],
      },
      phased: {
        id: 'phased', text: 'Your phased roadmap impresses an angel investor. They offer ₹25L but want a board seat.',
        options: [
          { label: 'Accept — their experience will be valuable', nextNode: 'end_mentor', traits: { leadership: 15, communication: 15, adaptability: 10 } },
          { label: 'Negotiate: advisory role without board seat', nextNode: 'end_negotiate', traits: { analytical: 15, leadership: 15, communication: 15 } },
        ],
      },
      equal_split: {
        id: 'equal_split', text: 'Suresh\'s connections get you 1000 farmers in month one! But he wants to change the product direction.',
        options: [
          { label: 'Hear him out — his farmer insight is why you partnered', nextNode: 'end_collab', traits: { empathy: 20, adaptability: 15, communication: 10 } },
          { label: 'Set up a formal decision framework for disagreements', nextNode: 'end_process', traits: { analytical: 15, leadership: 15, detail_oriented: 15 } },
        ],
      },
      negotiate: {
        id: 'negotiate', text: 'Suresh agrees to 35% with milestones. He\'s motivated and hits the first milestone in 2 weeks!',
        options: [
          { label: 'Celebrate and accelerate — this partnership is working', nextNode: 'end_momentum', traits: { leadership: 15, empathy: 15, adaptability: 15 } },
          { label: 'Document everything and set up the next milestones carefully', nextNode: 'end_structured', traits: { detail_oriented: 20, analytical: 15, leadership: 10 } },
        ],
      },
      solo: {
        id: 'solo', text: 'Going solo is harder but you have full control. You\'re burning through savings fast.',
        options: [
          { label: 'Apply to a startup incubator for funding and mentorship', nextNode: 'end_incubator', traits: { adaptability: 15, communication: 15, leadership: 10 } },
          { label: 'Launch a minimal paid version to generate early revenue', nextNode: 'end_bootstrap', traits: { analytical: 15, technical: 15, creative: 10 } },
        ],
      },
      // End nodes
      end_community: { id: 'end_community', text: 'Your kirana shop partnership model becomes a case study at IIM Bangalore! You\'ve built a sustainable community-driven platform.', options: [] },
      end_tech: { id: 'end_tech', text: 'Your SMS system reaches 50,000 farmers in 6 months. The government approaches you to scale it nationally.', options: [] },
      end_invest: { id: 'end_invest', text: 'The beautiful design wins a design award and attracts more users. The investment paid off!', options: [] },
      end_equity: { id: 'end_equity', text: 'The designer becomes a passionate co-owner. Having skin in the game made them deliver their best work.', options: [] },
      end_scale: { id: 'end_scale', text: 'Your app becomes the leading agri-tech platform in Southeast Asia. The pivot was risky but it paid off!', options: [] },
      end_focus: { id: 'end_focus', text: 'By staying focused, you become the #1 trusted app for Indian farmers. Depth beat breadth.', options: [] },
      end_govt: { id: 'end_govt', text: 'The IMD partnership gives you credibility. Within a year, your app is the official weather alert partner.', options: [] },
      end_indie: { id: 'end_indie', text: 'Launching fast gave you first-mover advantage. IMD eventually partners on your terms.', options: [] },
      end_authority: { id: 'end_authority', text: 'With government backing, the middlemen can\'t threaten farmers anymore. Your app becomes a force for fair trade.', options: [] },
      end_privacy: { id: 'end_privacy', text: 'Anonymous pricing becomes your key feature. Farmers safely report prices, creating India\'s largest crop price database.', options: [] },
      end_mentor: { id: 'end_mentor', text: 'The investor\'s guidance helps you avoid common mistakes. You scale to 10 states in year one.', options: [] },
      end_negotiate: { id: 'end_negotiate', text: 'The advisory arrangement works perfectly — you get wisdom without losing control.', options: [] },
      end_collab: { id: 'end_collab', text: 'Suresh\'s pivot idea — adding a marketplace — doubles your revenue. True collaboration beats ego.', options: [] },
      end_process: { id: 'end_process', text: 'The decision framework prevents conflicts. Other startups adopt your co-founder agreement template.', options: [] },
      end_momentum: { id: 'end_momentum', text: 'The momentum carries you to 5,000 users. Suresh earns his full equity and you both thrive.', options: [] },
      end_structured: { id: 'end_structured', text: 'Structured milestones keep both of you aligned. You hit profitability in 18 months.', options: [] },
      end_incubator: { id: 'end_incubator', text: 'The incubator provides ₹10L and mentors. You graduate as the top startup of the batch.', options: [] },
      end_bootstrap: { id: 'end_bootstrap', text: 'Early revenue proves product-market fit. You never need to give up equity — a bootstrapper\'s dream.', options: [] },
    },
  },
  {
    id: 'maze2',
    title: 'The College Crossroads',
    emoji: '🎓',
    description: 'Navigate the biggest decisions of your academic journey.',
    startNode: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'You just got your 12th board results. You scored well in both Science and Commerce. Your parents want you to do engineering. What do you do?',
        emoji: '📋',
        options: [
          { label: 'Follow your passion for design — apply to NID/NIFT', nextNode: 'design', traits: { creative: 20, adaptability: 15, leadership: 5 } },
          { label: 'Take JEE coaching — engineering opens many doors', nextNode: 'jee', traits: { analytical: 15, technical: 15, detail_oriented: 10 } },
          { label: 'Have an honest conversation with parents about your interests', nextNode: 'talk', traits: { communication: 20, empathy: 15, leadership: 10 } },
        ],
      },
      design: {
        id: 'design',
        text: 'You got into NID! But your family is worried about job prospects. A relative offers an internship at their tech company instead.',
        options: [
          { label: 'Join NID — you know design is your calling', nextNode: 'nid_path', traits: { creative: 15, leadership: 15, adaptability: 10 } },
          { label: 'Take the internship to prove you can earn, then pursue design', nextNode: 'intern_first', traits: { analytical: 10, adaptability: 15, empathy: 15 } },
        ],
      },
      jee: {
        id: 'jee',
        text: 'JEE coaching is intense. You scored well in Mains but you\'re burning out. Advanced exam is in 2 months.',
        options: [
          { label: 'Push through — you\'re so close to IIT', nextNode: 'push', traits: { detail_oriented: 20, analytical: 15, technical: 10 } },
          { label: 'Take a balanced approach — study smart, not just hard', nextNode: 'balance', traits: { adaptability: 15, analytical: 15, empathy: 10 } },
          { label: 'Realize engineering isn\'t your passion — switch to CLAT prep', nextNode: 'pivot', traits: { adaptability: 20, leadership: 10, creative: 10 } },
        ],
      },
      talk: {
        id: 'talk',
        text: 'Your parents listen. They agree to support you but ask you to pick something with a "backup plan." You choose:',
        options: [
          { label: 'BBA + self-study in UX design on the side', nextNode: 'hybrid', traits: { creative: 15, analytical: 10, adaptability: 15 } },
          { label: 'B.Com Honours + CA preparation', nextNode: 'ca', traits: { analytical: 20, detail_oriented: 15, technical: 5 } },
          { label: 'Liberal arts degree — explore before specializing', nextNode: 'liberal', traits: { creative: 15, empathy: 10, communication: 15 } },
        ],
      },
      nid_path: {
        id: 'nid_path', text: 'At NID, you discover you\'re amazing at UX research. A startup offers a paid fellowship before you even graduate.',
        options: [
          { label: 'Take the fellowship — real-world experience is gold', nextNode: 'end_ux', traits: { adaptability: 20, creative: 10, leadership: 10 } },
          { label: 'Complete your degree first — finish what you started', nextNode: 'end_degree', traits: { detail_oriented: 15, analytical: 10, leadership: 10 } },
        ],
      },
      intern_first: {
        id: 'intern_first', text: 'The internship teaches you that tech + design is a powerful combination. You realize you want both.',
        options: [
          { label: 'Apply for a design + tech hybrid program abroad', nextNode: 'end_abroad', traits: { creative: 15, technical: 10, adaptability: 15 } },
          { label: 'Join a design bootcamp while working part-time', nextNode: 'end_bootcamp', traits: { adaptability: 20, technical: 10, leadership: 10 } },
        ],
      },
      push: {
        id: 'push', text: 'You got into IIT! But your rank gives you Metallurgy, not CS. Do you take it?',
        options: [
          { label: 'Take it — IIT brand opens all doors regardless of branch', nextNode: 'end_iit', traits: { analytical: 15, adaptability: 15, leadership: 10 } },
          { label: 'Choose CS at a top NIT instead', nextNode: 'end_nit', traits: { technical: 15, analytical: 15, detail_oriented: 10 } },
        ],
      },
      balance: {
        id: 'balance', text: 'Your balanced approach worked! You got a good rank and feel healthy. You pick CS at a top NIT.',
        options: [
          { label: 'Focus on competitive programming and placement prep', nextNode: 'end_cp', traits: { technical: 20, analytical: 15, detail_oriented: 10 } },
          { label: 'Explore clubs, hackathons, and build side projects', nextNode: 'end_explore', traits: { creative: 15, leadership: 15, communication: 10 } },
        ],
      },
      pivot: {
        id: 'pivot', text: 'You crack CLAT and get into NLSIU! Law turns out to be your true calling.',
        options: [
          { label: 'Focus on corporate law — lucrative and growing', nextNode: 'end_corporate', traits: { analytical: 15, communication: 15, detail_oriented: 10 } },
          { label: 'Pursue public interest law — make a difference', nextNode: 'end_public', traits: { empathy: 20, communication: 15, leadership: 10 } },
        ],
      },
      hybrid: {
        id: 'hybrid', text: 'Your UX side-projects get noticed on Behance. A Mumbai agency wants to hire you part-time!',
        options: [
          { label: 'Accept and balance both — you love the hustle', nextNode: 'end_hustle', traits: { adaptability: 20, creative: 15, leadership: 10 } },
          { label: 'Focus on BBA first, freelance during breaks only', nextNode: 'end_focused', traits: { detail_oriented: 15, analytical: 15, adaptability: 10 } },
        ],
      },
      ca: {
        id: 'ca', text: 'CA Foundation was tough but you cleared it. Now Inter awaits — it\'s grueling. A fintech startup offers you a role.',
        options: [
          { label: 'Complete CA first — the qualification lasts a lifetime', nextNode: 'end_ca', traits: { detail_oriented: 20, analytical: 15, technical: 10 } },
          { label: 'Join the fintech — finance + tech is the future', nextNode: 'end_fintech', traits: { adaptability: 15, technical: 15, creative: 10 } },
        ],
      },
      liberal: {
        id: 'liberal', text: 'Liberal arts exposed you to philosophy, economics, and data science. You found your niche: behavioral economics!',
        options: [
          { label: 'Apply for a master\'s in behavioral economics', nextNode: 'end_masters', traits: { analytical: 20, empathy: 10, communication: 10 } },
          { label: 'Start a podcast about decision-making and psychology', nextNode: 'end_podcast', traits: { communication: 20, creative: 15, leadership: 10 } },
        ],
      },
      // End nodes
      end_ux: { id: 'end_ux', text: 'Your UX fellowship leads to a full-time role at a top startup. You\'re designing products used by millions!', options: [] },
      end_degree: { id: 'end_degree', text: 'Your degree + portfolio makes you the top pick at campus placements. Companies fight to hire you.', options: [] },
      end_abroad: { id: 'end_abroad', text: 'You get into a design + tech program at MIT Media Lab. Your unique blend of skills makes you stand out.', options: [] },
      end_bootcamp: { id: 'end_bootcamp', text: 'Your bootcamp portfolio lands you a Product Design role. Your tech internship + design skills = unicorn candidate.', options: [] },
      end_iit: { id: 'end_iit', text: 'At IIT, you switch to CS through minor + projects. The IIT network opens doors you didn\'t know existed.', options: [] },
      end_nit: { id: 'end_nit', text: 'NIT CS gives you deep technical skills. You crack interviews at top tech companies on your first try.', options: [] },
      end_cp: { id: 'end_cp', text: 'You become a red coder on Codeforces. Google hires you straight out of college.', options: [] },
      end_explore: { id: 'end_explore', text: 'Your hackathon project gets VC funding. You become a founder before graduating!', options: [] },
      end_corporate: { id: 'end_corporate', text: 'You join a top law firm. By 28, you\'re handling multi-crore M&A deals.', options: [] },
      end_public: { id: 'end_public', text: 'Your PIL changes a national policy. You\'re featured in India Today\'s 30 Under 30.', options: [] },
      end_hustle: { id: 'end_hustle', text: 'Your dual expertise in business + design makes you a sought-after product manager.', options: [] },
      end_focused: { id: 'end_focused', text: 'Your BBA gold medal + design portfolio creates a unique niche. You start a design consulting firm.', options: [] },
      end_ca: { id: 'end_ca', text: 'CA + your commerce background makes you CFO material. You join a Big 4 firm and rise fast.', options: [] },
      end_fintech: { id: 'end_fintech', text: 'Your finance + tech combination is perfect. The fintech grows and you become VP of Finance.', options: [] },
      end_masters: { id: 'end_masters', text: 'Your behavioral economics research gets published. You advise the government on policy design.', options: [] },
      end_podcast: { id: 'end_podcast', text: 'Your podcast hits 1M subscribers. You become India\'s go-to voice on decision science.', options: [] },
    },
  },
  {
    id: 'maze3',
    title: 'The Ethical Tightrope',
    emoji: '⚖️',
    description: 'Navigate morally complex situations where there\'s no "right" answer.',
    startNode: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'You\'re a junior developer. You discover your company\'s app is collecting user data without proper consent. What do you do?',
        emoji: '🔐',
        options: [
          { label: 'Report it to your manager formally via email', nextNode: 'report', traits: { communication: 15, leadership: 15, detail_oriented: 10 } },
          { label: 'Quietly fix the consent flow yourself and push the code', nextNode: 'fix', traits: { technical: 20, adaptability: 10, empathy: 10 } },
          { label: 'Talk to senior engineers first to understand if it\'s intentional', nextNode: 'investigate', traits: { analytical: 15, communication: 15, empathy: 10 } },
        ],
      },
      report: {
        id: 'report',
        text: 'Your manager says "it\'s not a priority right now." But you feel it\'s a serious privacy issue.',
        options: [
          { label: 'Escalate to the CTO — this is too important to ignore', nextNode: 'escalate', traits: { leadership: 20, communication: 10, adaptability: 10 } },
          { label: 'Document everything and raise it at the next all-hands', nextNode: 'document', traits: { detail_oriented: 20, communication: 10, analytical: 10 } },
        ],
      },
      fix: {
        id: 'fix',
        text: 'Your fix works. But QA catches it and asks why you changed consent flows without a ticket.',
        options: [
          { label: 'Explain honestly — you found a privacy issue and fixed it', nextNode: 'honest', traits: { communication: 20, leadership: 10, empathy: 10 } },
          { label: 'Create a retroactive ticket and follow proper process next time', nextNode: 'process', traits: { detail_oriented: 15, analytical: 15, adaptability: 10 } },
        ],
      },
      investigate: {
        id: 'investigate',
        text: 'Turns out it was a known issue but nobody prioritized it. The senior engineer agrees it should be fixed.',
        options: [
          { label: 'Volunteer to lead the fix — take ownership', nextNode: 'own_it', traits: { leadership: 20, technical: 10, empathy: 10 } },
          { label: 'Write a proper RFC document proposing the fix', nextNode: 'rfc', traits: { analytical: 15, detail_oriented: 15, communication: 10 } },
        ],
      },
      escalate: {
        id: 'escalate', text: 'The CTO takes it seriously and assigns a task force. You\'re asked to lead it. Scary but exciting!',
        options: [
          { label: 'Accept — this is your chance to make a real impact', nextNode: 'end_lead', traits: { leadership: 20, adaptability: 10, communication: 10 } },
          { label: 'Suggest a more senior engineer leads, you\'ll support', nextNode: 'end_support', traits: { empathy: 15, analytical: 10, detail_oriented: 10 } },
        ],
      },
      document: {
        id: 'document', text: 'Your all-hands presentation about the privacy gap goes viral internally. The CEO personally thanks you.',
        options: [
          { label: 'Use the momentum to propose a privacy-first company policy', nextNode: 'end_policy', traits: { leadership: 15, communication: 15, analytical: 10 } },
          { label: 'Stay humble and focus on implementing the actual fix', nextNode: 'end_humble', traits: { detail_oriented: 15, technical: 15, empathy: 10 } },
        ],
      },
      honest: {
        id: 'honest', text: 'Your honesty earns respect. The team creates a "privacy champion" role and offers it to you.',
        options: [
          { label: 'Accept — privacy engineering is a growing field', nextNode: 'end_champion', traits: { leadership: 15, empathy: 15, technical: 10 } },
          { label: 'Appreciate the offer but prefer to stay in core development', nextNode: 'end_core', traits: { technical: 15, analytical: 10, adaptability: 10 } },
        ],
      },
      process: {
        id: 'process', text: 'The process approach works smoothly. You learn that following procedures can be as impactful as breaking them.',
        options: [
          { label: 'Propose an automated privacy audit tool for the team', nextNode: 'end_automate', traits: { technical: 15, analytical: 15, creative: 10 } },
          { label: 'Mentor new developers about privacy-first coding', nextNode: 'end_mentor', traits: { communication: 15, empathy: 15, leadership: 10 } },
        ],
      },
      own_it: {
        id: 'own_it', text: 'You lead the privacy fix. It takes 3 weeks but the result is solid. Your manager is impressed.',
        options: [
          { label: 'Ask for a promotion — you proved your leadership', nextNode: 'end_promote', traits: { leadership: 20, communication: 10, adaptability: 10 } },
          { label: 'Write a blog about the experience to help others', nextNode: 'end_blog', traits: { communication: 20, empathy: 10, creative: 10 } },
        ],
      },
      rfc: {
        id: 'rfc', text: 'Your RFC is so well-written it becomes the template for all future security proposals.',
        options: [
          { label: 'Start a privacy engineering newsletter at the company', nextNode: 'end_newsletter', traits: { communication: 15, creative: 15, leadership: 10 } },
          { label: 'Focus on building privacy tools that automate checks', nextNode: 'end_tools', traits: { technical: 20, analytical: 15, detail_oriented: 10 } },
        ],
      },
      // End nodes
      end_lead: { id: 'end_lead', text: 'Leading the task force earns you a fast-track promotion. You become the youngest tech lead in the company.', options: [] },
      end_support: { id: 'end_support', text: 'Your humility and teamwork earn deep respect. The senior engineer becomes your mentor for life.', options: [] },
      end_policy: { id: 'end_policy', text: 'Your privacy policy becomes an industry standard. You\'re invited to speak at a national tech conference.', options: [] },
      end_humble: { id: 'end_humble', text: 'Your solid implementation skills make you the go-to person for critical projects. Actions speak louder than words.', options: [] },
      end_champion: { id: 'end_champion', text: 'As Privacy Champion, you build India\'s first open-source privacy toolkit. It\'s used by 500+ startups.', options: [] },
      end_core: { id: 'end_core', text: 'Your deep technical skills + privacy awareness make you the perfect architect. You design secure systems by default.', options: [] },
      end_automate: { id: 'end_automate', text: 'Your privacy audit tool catches 47 issues company-wide. It\'s open-sourced and gets 10K GitHub stars.', options: [] },
      end_mentor: { id: 'end_mentor', text: 'Your mentees go on to champion privacy at their own companies. Your impact multiplies across the industry.', options: [] },
      end_promote: { id: 'end_promote', text: 'You get the promotion. At 24, you\'re one of the youngest team leads in Indian tech.', options: [] },
      end_blog: { id: 'end_blog', text: 'Your blog goes viral on Hacker News. Three companies reach out with job offers within a week.', options: [] },
      end_newsletter: { id: 'end_newsletter', text: 'Your newsletter builds a community of privacy-conscious engineers across India.', options: [] },
      end_tools: { id: 'end_tools', text: 'Your privacy tools become a product. You spin it off as a SaaS company and become a founder!', options: [] },
    },
  },
];

export default function DecisionMaze() {
  const [currentMaze, setCurrentMaze] = useState(0);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [phase, setPhase] = useState<'intro' | 'play' | 'maze_end' | 'complete'>('intro');
  const [pathTraits, setPathTraits] = useState<Record<string, number>>({});
  const [allTraits, setAllTraits] = useState<Record<string, number>>({});
  const [stepsInMaze, setStepsInMaze] = useState(0);
  const [traits, setFinalTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  const maze = mazes[currentMaze];
  const node = maze.nodes[currentNodeId];
  const isEndNode = node.options.length === 0;

  const handleChoice = (optIdx: number) => {
    const opt = node.options[optIdx];
    const updated = { ...pathTraits };
    Object.entries(opt.traits).forEach(([k, v]) => {
      updated[k] = (updated[k] || 0) + (v as number);
    });
    setPathTraits(updated);
    setStepsInMaze((s) => s + 1);

    const nextNode = maze.nodes[opt.nextNode];
    if (nextNode.options.length === 0) {
      // End of this maze
      setCurrentNodeId(opt.nextNode);
      // Merge path traits into all traits
      const merged = { ...allTraits };
      Object.entries(updated).forEach(([k, v]) => {
        merged[k] = (merged[k] || 0) + v;
      });
      setAllTraits(merged);

      if (currentMaze + 1 >= mazes.length) {
        // Final calculation
        const maxPossible = mazes.length * 50;
        const calculated: TraitScores = {
          analytical: Math.min(100, Math.round(((merged.analytical || 0) / maxPossible) * 100)),
          creative: Math.min(100, Math.round(((merged.creative || 0) / maxPossible) * 100)),
          leadership: Math.min(100, Math.round(((merged.leadership || 0) / maxPossible) * 100)),
          empathy: Math.min(100, Math.round(((merged.empathy || 0) / maxPossible) * 100)),
          technical: Math.min(100, Math.round(((merged.technical || 0) / maxPossible) * 100)),
          communication: Math.min(100, Math.round(((merged.communication || 0) / maxPossible) * 100)),
          adaptability: Math.min(100, Math.round(((merged.adaptability || 0) / maxPossible) * 100)),
          detail_oriented: Math.min(100, Math.round(((merged.detail_oriented || 0) / maxPossible) * 100)),
        };
        const final = traitScores
          ? (Object.keys(calculated) as (keyof TraitScores)[]).reduce((acc, key) => {
              acc[key] = Math.round((traitScores[key] + calculated[key]) / 2);
              return acc;
            }, { ...traitScores })
          : calculated;
        setTraitScores(final);
        setFinalTraits(final);
        setPhase('complete');
      } else {
        setPhase('maze_end');
      }
    } else {
      setCurrentNodeId(opt.nextNode);
    }
  };

  const nextMaze = () => {
    setCurrentMaze((c) => c + 1);
    setCurrentNodeId('start');
    setPathTraits({});
    setStepsInMaze(0);
    setPhase('play');
  };

  if (phase === 'complete' && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-2">Decision Maze Complete!</h2>
          <p className="text-primary-200 mb-4">You navigated {mazes.length} branching scenarios!</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar
                key={trait}
                label={trait.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                value={val}
                color={val >= 60 ? 'bg-cyan-500' : 'bg-white/30'}
              />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/results')}>View Results →</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center py-8">
          <div className="text-6xl mb-4">🌀</div>
          <h1 className="text-3xl font-bold text-white mb-3">Decision Maze</h1>
          <p className="text-primary-200 mb-2 max-w-md mx-auto">
            Navigate branching paths where every choice leads to a different outcome. There are no wrong answers — only YOUR answers.
          </p>
          <p className="text-white/50 text-sm mb-6">
            Measures: Intrapersonal (Gardner) + Investigative (RIASEC) + Conscientiousness (Big Five)
          </p>
          <p className="text-white/40 text-xs mb-6">~10 minutes · {mazes.length} scenarios</p>
          <Button size="lg" onClick={() => setPhase('play')}>Enter the Maze 🌀</Button>
        </Card>
      </div>
    );
  }

  if (phase === 'maze_end') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ProgressBar value={currentMaze + 1} max={mazes.length} label={`Scenario ${currentMaze + 1} of ${mazes.length}`} />
        <Card className="text-center py-8">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="text-xl font-bold text-white mb-2">Path Complete!</h2>
          <p className="text-primary-200 mb-1">{node.text}</p>
          <p className="text-white/50 text-sm mb-6">You made {stepsInMaze} decisions to reach this outcome.</p>
          <Button onClick={nextMaze}>Next Scenario →</Button>
        </Card>
      </div>
    );
  }

  // Playing
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🌀 Decision Maze</h1>
        <p className="text-primary-200 text-sm">{maze.title}</p>
      </div>
      <ProgressBar value={currentMaze + 1} max={mazes.length} label={`Scenario ${currentMaze + 1} of ${mazes.length}`} />

      <Card>
        {node.emoji && (
          <div className="text-center mb-4">
            <span className="text-4xl">{node.emoji}</span>
          </div>
        )}
        <p className="text-white text-lg font-medium mb-6 text-center">{node.text}</p>

        {isEndNode ? (
          <div className="text-center">
            <p className="text-emerald-300 text-sm mb-4">🎯 You reached an ending!</p>
            <p className="text-white/50 text-xs">Decisions made: {stepsInMaze}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {node.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(idx)}
                className="w-full text-left px-4 py-4 rounded-xl border bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <p className="text-white/30 text-xs">Step {stepsInMaze + 1}</p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(stepsInMaze, 8) }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-cyan-500/50" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
