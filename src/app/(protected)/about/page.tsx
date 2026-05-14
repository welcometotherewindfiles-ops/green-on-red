// ============================================================
// About Page — static club info
// ============================================================
export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-3xl font-semibold mb-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
        About Green on Red
      </h1>
      <div
        className="h-px mb-8"
        style={{ backgroundColor: 'var(--color-border)' }}
      />
      <div
        className="prose"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <p>
          Green on Red is a private investment club — a group of friends learning
          to trade together, sharing strategies, and building knowledge around
          stocks, ETFs, options, swing trading, leveraged ETFs, and inverse ETFs.
        </p>
        <p>
          This site is the club&apos;s central knowledge hub. The admin publishes
          content here — meeting notes, research, strategies, and resources —
          and members come to learn and review. All live discussion happens in
          our WhatsApp group.
        </p>
        <h2>What we cover</h2>
        <ul>
          <li><strong>Strategies</strong> — Trading setups, playbooks, and systems</li>
          <li><strong>Fundamentals</strong> — Core market concepts and analysis frameworks</li>
          <li><strong>Risk Management</strong> — Position sizing, stops, and portfolio risk</li>
          <li><strong>Brokerages</strong> — Platform guides, comparisons, and tips</li>
          <li><strong>Backtesting</strong> — Historical testing methodology and tools</li>
          <li><strong>Automation</strong> — Algorithmic approaches and workflow scripts</li>
        </ul>
        <h2>Access</h2>
        <p>
          Membership is by invitation only. If you need account help, contact
          the admin directly through WhatsApp.
        </p>
      </div>
    </div>
  )
}
