import React, { useMemo, useState } from 'react'
import { usePluginData } from '@docusaurus/useGlobalData'

export type TutorialEntry = {
  id: string
  title: string
  description: string
  href: string
  tags: string[]
  time: string
}

/** Filters shown before "More": the most used tags. */
const VISIBLE_TAGS = 10

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

function TutorialCard({ tutorial: t }: { tutorial: TutorialEntry }) {
  return (
    <a href={t.href} className="rd-card">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {t.tags.map((tag) => (
          <span key={tag} className="rd-tag">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="rd-card__title">{t.title}</h3>
      <p className="t-small m-0 grow pb-5">{t.description}</p>
      <div className="flex items-center justify-between border-t border-lp-border pt-3">
        <span className="t-meta">{t.time}</span>
        <span className="t-label">Read →</span>
      </div>
    </a>
  )
}

/** Lists the tutorials of one docs version (`2.x` by default). */
export default function TutorialsIndex({ version = '2.x' }: { version?: string }) {
  const tutorials = (usePluginData('tutorials-data') as Record<string, TutorialEntry[]>)[version] ?? []
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showAllTags, setShowAllTags] = useState(false)

  // Tags by how many tutorials use them, most used first.
  const allTags = useMemo<string[]>(() => {
    const counts = new Map<string, number>()
    for (const tutorial of tutorials) {
      for (const tag of tutorial.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag)
  }, [tutorials])

  const visibleTags =
    showAllTags ? allTags : (
      allTags.slice(0, VISIBLE_TAGS).concat(activeTag && !allTags.slice(0, VISIBLE_TAGS).includes(activeTag) ? [activeTag] : [])
    )

  const filtered = useMemo(() => {
    return tutorials.filter((tutorial) => {
      const query = search.toLowerCase()
      const matchesSearch =
        !search ||
        tutorial.title.toLowerCase().includes(query) ||
        tutorial.description.toLowerCase().includes(query)
      const matchesTag = !activeTag || tutorial.tags.includes(activeTag)
      return matchesSearch && matchesTag
    })
  }, [tutorials, search, activeTag])

  return (
    <div className="not-prose">
      <h1>Tutorials</h1>
      <p className="mb-8 max-w-2xl">Hands-on guides to build real things with RushDB.</p>

      <div className="relative mb-4 max-w-xl">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-lp-subtle">
          <SearchIcon />
        </span>
        <input
          type="search"
          aria-label="Search tutorials"
          placeholder="Search tutorials"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rd-input"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
        {['All', ...visibleTags].map((tag) => {
          const isActive = tag === 'All' ? !activeTag : tag === activeTag
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                setActiveTag(
                  tag === 'All' ? null
                  : activeTag === tag ? null
                  : tag
                )
              }
              className="rd-filter"
            >
              {tag}
            </button>
          )
        })}
        {allTags.length > VISIBLE_TAGS && (
          <button type="button" className="rd-filter" onClick={() => setShowAllTags((v) => !v)} aria-expanded={showAllTags}>
            {showAllTags ? 'Fewer' : `More +${allTags.length - VISIBLE_TAGS}`}
          </button>
        )}
      </div>

      {filtered.length > 0 ?
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tutorial) => (
            <TutorialCard key={tutorial.href} tutorial={tutorial} />
          ))}
        </div>
      : <div className="border border-lp-border px-6 py-16">
          <p className="m-0 text-lp-text">No tutorials match your search.</p>
          <button
            type="button"
            className="rd-filter mt-4"
            onClick={() => {
              setSearch('')
              setActiveTag(null)
            }}
          >
            Clear filters
          </button>
        </div>
      }
    </div>
  )
}
