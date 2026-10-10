import React, { useState, useEffect, useMemo } from 'react';
import { COMPETITION_MILESTONES, type CompetitionMilestone } from '../data';

interface CompetitionsPageProps {
  isActive: boolean;
  onNavigate?: (page: string) => void;
}

const CATEGORIES = [
  'All',
  'Off-Road',
  'Formula',
  'Aerospace',
  'Clean Tech',
  'Innovation',
] as const;

type CategoryType = (typeof CATEGORIES)[number];

const categoryBadgeClassMap: Record<CompetitionMilestone['category'], string> = {
  'Off-Road': 'cat-off-road',
  'Formula': 'cat-formula',
  'Aerospace': 'cat-aerospace',
  'Clean Tech': 'cat-clean-tech',
  'Innovation': 'cat-innovation',
};

export const CompetitionsPage: React.FC<CompetitionsPageProps> = ({ isActive, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [activePhotoModal, setActivePhotoModal] = useState<CompetitionMilestone | null>(null);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    if (selectedCategory === 'All') return COMPETITION_MILESTONES;
    return COMPETITION_MILESTONES.filter((m) => m.category === selectedCategory);
  }, [selectedCategory]);

  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(
    filteredMilestones[0]?.id || COMPETITION_MILESTONES[0].id
  );

  // Sync activeMilestoneId when filter changes
  useEffect(() => {
    if (filteredMilestones.length > 0) {
      const exists = filteredMilestones.some((m) => m.id === activeMilestoneId);
      if (!exists) {
        setActiveMilestoneId(filteredMilestones[0].id);
      }
    }
  }, [filteredMilestones, activeMilestoneId]);

  // Current active milestone object & progress percentage
  const activeIndex = useMemo(() => {
    const idx = filteredMilestones.findIndex((m) => m.id === activeMilestoneId);
    return idx >= 0 ? idx : 0;
  }, [filteredMilestones, activeMilestoneId]);

  const activeMilestone = filteredMilestones[activeIndex] || filteredMilestones[0];
  const progressPercent = useMemo(() => {
    if (filteredMilestones.length <= 1) return 100;
    return ((activeIndex + 1) / filteredMilestones.length) * 100;
  }, [activeIndex, filteredMilestones.length]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: COMPETITION_MILESTONES.length };
    COMPETITION_MILESTONES.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, []);

  // IntersectionObserver for tracking active milestone on scroll
  useEffect(() => {
    if (!isActive) return;

    const cards = document.querySelectorAll<HTMLElement>('[data-milestone-id]');
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          const id = (visible.target as HTMLElement).dataset.milestoneId;
          if (id) setActiveMilestoneId(id);
        }
      },
      { rootMargin: '-25% 0px -45% 0px', threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [isActive, filteredMilestones]);

  // Scroll to milestone
  const scrollToMilestone = (id: string) => {
    setActiveMilestoneId(id);
    const target = document.querySelector<HTMLElement>(`[data-milestone-id="${id}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePhotoModal(null);
      }
    };
    if (activePhotoModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoModal]);

  return (
    <section className={`page ${isActive ? 'active' : ''}`} id="page-competitions">
      <div className="comp-page-wrapper">
        {/* ===================== HERO BANNER ===================== */}
        <section className="comp-hero">
          <div className="comp-hero-inner">
            <div className="comp-hero-eyebrow-row">
              <span className="comp-eyebrow-line" />
              <p className="eyebrow text-signal" style={{ margin: 0 }}>
                // OUR COMPETITIVE LEGACY
              </p>
            </div>

            <h1 className="comp-hero-heading">
              Fifteen years.
              <span className="text-signal" style={{ display: 'block' }}>
                Proven on track &amp; sky.
              </span>
            </h1>

            <div className="comp-hero-meta-bar">
              <p className="comp-hero-desc">
                From our first national podium in 2011 to multidisciplinary aerial and automotive championship
                finals. Explore our journey across 14 milestones spanning BAJA, SUPRA, Quad Torc, Aerothon, Effi-Cycle, and Laws of Motion.
              </p>
              <span className="comp-hero-stats-badge">
                14 National Milestones · 2011—2026
              </span>
            </div>
          </div>
        </section>

        {/* ===================== CATEGORY FILTERS ===================== */}
        <nav className="comp-filter-section" aria-label="Competition Categories">
          <div className="comp-filter-container">
            <div className="comp-filter-pills" role="tablist">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isSelected}
                    className={`comp-filter-btn ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            <span className="comp-filter-count">
              Showing {filteredMilestones.length} of {COMPETITION_MILESTONES.length} events
            </span>
          </div>
        </nav>

        {/* ===================== TIMELINE GRID ===================== */}
        <div className="comp-timeline-grid">
          {/* STICKY SIDEBAR (Desktop) */}
          <aside className="comp-sidebar" aria-label="Timeline navigation">
            <div className="comp-sidebar-sticky">
              <div className="comp-sidebar-header">
                <p className="comp-active-year-label">Active Milestone</p>
                <p className="comp-active-year-val" aria-live="polite">
                  {activeMilestone?.year || '2011'}
                </p>
                <p className="comp-active-event-name" title={activeMilestone?.competition}>
                  {activeMilestone?.competition}
                </p>
              </div>

              <div className="comp-timeline-track">
                <span className="comp-timeline-line-base" />
                <span
                  className="comp-timeline-line-fill"
                  style={{ height: `calc((100% - 2.5rem) * ${progressPercent / 100})` }}
                />

                <div className="comp-timeline-nav-list">
                  {filteredMilestones.map((m, idx) => {
                    const isCurrent = m.id === activeMilestoneId;
                    const isPassed = idx <= activeIndex;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => scrollToMilestone(m.id)}
                        className={`comp-timeline-nav-btn ${isCurrent ? 'is-active' : ''} ${
                          isPassed ? 'is-passed' : ''
                        }`}
                        aria-label={`Jump to ${m.year} ${m.competition}`}
                      >
                        <span className="comp-nav-dot" />
                        <span className="comp-nav-text">{m.year}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="comp-sidebar-footer">
                <p className="comp-progress-label">Journey Progress</p>
                <div className="comp-progress-bar-bg">
                  <div
                    className="comp-progress-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="comp-progress-count">
                  {String(activeIndex + 1).padStart(2, '0')} / {filteredMilestones.length}
                </p>
              </div>
            </div>
          </aside>

          {/* ARTICLES STREAM */}
          <div className="comp-articles-stream">
            {filteredMilestones.map((m) => {
              const globalIndex = COMPETITION_MILESTONES.findIndex((item) => item.id === m.id) + 1;
              const watermark = m.year.slice(2);
              const badgeClass = categoryBadgeClassMap[m.category] || 'cat-formula';

              return (
                <article
                  key={m.id}
                  id={m.id}
                  data-milestone-id={m.id}
                  className="comp-milestone-card"
                >
                  {/* Watermark Year */}
                  <span className="comp-watermark-year" aria-hidden="true">
                    {watermark}
                  </span>

                  <div className="comp-card-content">
                    {/* Badge Row */}
                    <div className="comp-card-badge-row">
                      <span className={`comp-cat-badge ${badgeClass}`}>
                        {m.categoryLabel}
                      </span>
                      <span className="comp-team-pill">{m.team}</span>
                      <span className="comp-milestone-index">
                        Milestone {String(globalIndex).padStart(2, '0')} / {COMPETITION_MILESTONES.length}
                      </span>
                    </div>

                    {/* Year & Title */}
                    <div className="comp-card-year">{m.year}</div>
                    <h2 className="comp-card-title">{m.competition}</h2>

                    {/* Accolade Tag */}
                    <div className="comp-highlight-tag">
                      <span>★</span> {m.highlight}
                    </div>

                    {/* Photo Showcase Card */}
                    <div
                      className="comp-photo-frame"
                      role="button"
                      tabIndex={0}
                      onClick={() => setActivePhotoModal(m)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActivePhotoModal(m);
                        }
                      }}
                      title="Click to view full image"
                    >
                      <div className="comp-photo-aspect">
                        <img
                          src={m.image}
                          alt={m.imageAlt}
                          className="comp-photo-img"
                          loading="lazy"
                        />
                        <div className="comp-photo-overlay" />
                        <div className="comp-photo-caption">
                          <span className="comp-photo-caption-text">
                            {m.competition} — {m.team}
                          </span>
                          <span className="comp-photo-zoom-hint">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.35-4.35" />
                              <path d="M11 8v6M8 11h6" />
                            </svg>
                            EXPAND
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Narrative Story */}
                    <p className="comp-card-copy">{m.copy}</p>

                    {/* Accolade Callout */}
                    <div className="comp-stat-callout">
                      <strong className="comp-stat-number">{m.stat}</strong>
                      <div className="comp-stat-label-wrap">
                        <span className="comp-stat-badge-lead">OFFICIAL RESULT</span>
                        <span className="comp-stat-label">{m.statLabel}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ===================== NEXT MILESTONE CTA ===================== */}
        <section className="comp-bottom-cta">
          <div className="comp-cta-inner">
            <div>
              <p className="comp-cta-eyebrow">// THE NEXT CHAPTER</p>
              <h2 className="comp-cta-heading">Is yours to build.</h2>
            </div>
            <button
              type="button"
              className="comp-cta-btn effect-shine"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('join');
                } else {
                  window.location.hash = '#join';
                }
              }}
            >
              Join SAE BIT SINDRI
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </section>

        {/* ===================== LIGHTBOX MODAL ===================== */}
        {activePhotoModal && (
          <div
            className="comp-lightbox-backdrop"
            onClick={() => setActivePhotoModal(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="comp-lightbox-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="comp-lightbox-close"
                onClick={() => setActivePhotoModal(null)}
                aria-label="Close photo preview"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="comp-lightbox-img-wrap">
                <img
                  src={activePhotoModal.image}
                  alt={activePhotoModal.imageAlt}
                  className="comp-lightbox-img"
                />
              </div>

              <div className="comp-lightbox-footer">
                <div>
                  <h3 id="modal-title" className="comp-lightbox-title">
                    {activePhotoModal.competition}
                  </h3>
                  <p className="comp-lightbox-sub">
                    {activePhotoModal.team} · {activePhotoModal.year} · {activePhotoModal.stat}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
