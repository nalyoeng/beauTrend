import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  TrendingUp,
  Scale,
  ShieldCheck,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "../components/common/Logo"
import { useAuth } from "../context/AuthContext"

const features = [
  [
    "/dashboard",
    LayoutDashboard,
    "Dashboard",
    "See trending products and clear market highlights at a glance.",
  ],
  [
    "/trends",
    TrendingUp,
    "Trend Analysis",
    "Compare 3–5 products in the same category and market on one chart.",
  ],
  [
    "/comparison",
    Scale,
    "Market Comparison",
    "See which Asian countries are most interested in a product.",
  ],
  [
    "/reports",
    FileText,
    "Business Reports",
    "Create downloadable sample summaries of trends, markets, and opportunities.",
  ],
]

export default function LandingPage() {
  const { startDemo } = useAuth()
  const navigate = useNavigate()
  const openDemo = (path = "/dashboard") => {
    startDemo()
    navigate(path)
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Logo />
        <nav>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </nav>
        <div>
          <Link className="text-button" to="/login">
            Log in
          </Link>
          <Link className="button button--primary" to="/signup">
            Get started
          </Link>
        </div>
      </header>
      <main>
        <section className="landing-hero">
          <div>
            <span className="eyebrow-label">
              Beauty business intelligence, made simple
            </span>
            <h1>Know what beauty products to sell next.</h1>
            <p>
              Discover cosmetic trends across Asia, compare countries, and
              create practical business reports without complicated analytics.
            </p>
            <div className="landing-hero__actions">
              <button
                className="button button--primary button--large"
                onClick={() => openDemo()}
              >
                Explore live demo <ArrowRight size={17} />
              </button>
              <Link
                className="button button--outline button--large"
                to="/signup"
              >
                Create free account
              </Link>
            </div>
            <div className="landing-benefits">
              <span>
                <ShieldCheck size={16} />
                Simple business language
              </span>
              <span>
                <ShieldCheck size={16} />
                Clear market comparisons
              </span>
              <span>
                <ShieldCheck size={16} />
                Professional reports
              </span>
            </div>
          </div>
          <div
            className="landing-preview"
            aria-label="BeautyTrend dashboard preview"
          >
            <div className="landing-preview__header">
              <span>Today’s opportunity</span>
              <b>BeautyTrend</b>
            </div>
            <h2>What should I sell?</h2>
            <article>
              <span className="product-mark" />
              <div>
                <strong>Centella Serum</strong>
                <small>Skincare · South Korea</small>
              </div>
              <em>High interest</em>
            </article>
            <div className="preview-market">
              <span>
                <b>South Korea</b>
                <i>
                  <em style={{ width: "92%" }} />
                </i>
                <strong>92</strong>
              </span>
              <span>
                <b>Thailand</b>
                <i>
                  <em style={{ width: "81%" }} />
                </i>
                <strong>81</strong>
              </span>
              <span>
                <b>Cambodia</b>
                <i>
                  <em style={{ width: "61%" }} />
                </i>
                <strong>61</strong>
              </span>
            </div>
            <div className="preview-recommendation">
              <span>Suggested selling price</span>
              <b>$20</b>
              <small>Balanced demand and revenue</small>
            </div>
          </div>
        </section>
        <section className="landing-question-strip">
          <span>What is trending?</span>
          <span>Where is it popular?</span>
          <span>Which opportunities should I explore?</span>
        </section>
        <section className="landing-features" id="features">
          <div className="landing-section-heading">
            <span className="eyebrow-label">Explore every feature</span>
            <h2>Everything you need for a clearer beauty business decision.</h2>
            <p>Open any feature below to explore the interactive demo.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(([path, Icon, title, description]) => (
              <article key={path}>
                <span>
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
                <button onClick={() => openDemo(path)}>
                  Open {title} <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-how" id="how">
          <div>
            <span className="eyebrow-label">How BeautyTrend works</span>
            <h2>From a product idea to a business decision in three steps.</h2>
            <p>No complicated dashboard knowledge is required.</p>
          </div>
          <div>
            {[
              ["01", "Discover beauty trends"],
              ["02", "Compare Asian markets"],
              ["03", "Explore business opportunities"],
            ].map(([number, title]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <div>
            <span className="eyebrow-label">Ready to explore?</span>
            <h2>Make your next beauty decision with more clarity.</h2>
          </div>
          <button
            className="button button--gold button--large"
            onClick={() => openDemo()}
          >
            Open live demo <ArrowRight size={17} />
          </button>
        </section>
      </main>
      <footer className="public-footer">
        <Logo light />
        <span>BeautyTrend prototype · Illustrative data</span>
      </footer>
    </div>
  )
}
