// Home.jsx
import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import heroImg from "../assets/back.jpg"; // keep your asset
import feature1 from "../assets/back-round.jpg";
import feature2 from "../assets/back.jpg";
import feature3 from "../assets/back.jpg";
import feature4 from "../assets/back.jpg";
import DemoVisualizer from "../components/DemoVisualizer";
import NavBarHome from "../components/NavBarHome";
import { Link } from "react-router-dom"; // <-- add this at top




function Home() {
  // demo modal visibility
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      // global shortcut: "d" toggles demo
      if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
        setDemoOpen((s) => !s);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="home-page" lang="en">
      {/* Inline styles for quick drop-in; move to CSS file later. */}
      <style>{`
        .hero {
          position: relative;
          color: white;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(6,21,50,0.55), rgba(6,21,50,0.65));
        }
        .hero-content {
          position: relative;
          z-index: 2;
          padding-top: 6rem;
          padding-bottom: 6rem;
        }
        .visual-card { min-height: 260px; }
        .feature-emoji { font-size: 2rem; margin-bottom: 0.5rem; }
        .demo-modal {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000;
        }
        .demo-panel { background: #fff; border-radius:8px; padding:18px; max-width:900px; width:95%; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .bars { display:flex; align-items:end; height:160px; gap:6px; padding:12px; }
        .bar { flex:1; background: linear-gradient(180deg,#4f46e5,#6366f1); border-radius:4px; transition: height 300ms ease, background 150ms; display:flex; align-items:flex-end; justify-content:center; color:rgba(255,255,255,0.95); font-weight:700; }
        .bar.compare { background: linear-gradient(180deg,#f59e0b,#f97316); color:#111827; }
        .small-muted { color:#6b7280; }
        .sr-only { position:absolute; left:-9999px; }
        @media (max-width:768px){ .hero-content{ padding-top:3rem; padding-bottom:3rem; } }
      `}</style>

     <NavBarHome setDemoOpen={setDemoOpen} />

      <main role="main">
        {/* HERO */}
        <section
          className="hero d-flex align-items-center text-white"
          style={{
            minHeight: "82vh",
            backgroundImage: `linear-gradient(rgba(6,21,50,0.45), rgba(6,21,50,0.52)), url(${feature1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="hero-overlay" aria-hidden="true" />
          <div className="container hero-content text-center">
            <h1 className="display-4 fw-bold">Learn Algorithms by Playing With Them</h1>
            <p className="lead my-3" style={{ maxWidth: 820, margin: "0 auto" }}>
              Visualize algorithms and data structures step-by-step, manipulate inputs live,
              save runs, and practice with auto-judged exercises — built for CS students.
            </p>

            <div className="d-flex justify-content-center gap-3 mt-4" role="group" aria-label="Primary calls to action">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setDemoOpen(true)}
                aria-haspopup="dialog"
                aria-controls="demo-panel"
              >
                Try Live Demo
              </button>
                        <Link className="btn btn-outline-light btn-lg" to="/exercises">
              Explore Exercises
            </Link>
            </div>

            <div className="mt-4 small-muted">
              <span className="me-3">Tip: press <kbd>d</kbd> to toggle demo</span>
              <span className="me-3">•</span>
              <a href="#how" className="text-white text-decoration-underline">How it works</a>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-5">
          <div className="container">
            <h2 className="mb-4 text-center">What you can do</h2>
            <div className="row gy-4">
              {[
  {
    emoji: "⚙️",
    title: "understand algorithms better",
    desc: "understand algorithms better in the intuative algorithm visualizer.",
    link: "/visualizer"
  },
  {
    emoji: "🌳",
    title: "create your own algorithm",
    desc: "create your own algorithm and watch it at work in the dynamic algorithm creater",
    link: "/builder"
  },
  {
    emoji: "🧪",
    title: "Exercises & Judging",
    desc: "Auto-graded exercises with persistence and feedback for students.",
    link: "/exercises"
  },
  {
    emoji: "🤖",
    title: "AI Helper",
    desc: "Lightweight classifier helps with algorithm/problem types from a description.",
    link: "/ai-chat"
  }
].map((f, i) => (
  <div key={i} className="col-md-3">
    <div className="card h-100 visual-card shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="feature-emoji">{f.emoji}</div>
        <h5 className="card-title">{f.title}</h5>
        <p className="card-text small-muted">{f.desc}</p>
        <div className="mt-auto">
          <Link className="btn btn-sm btn-outline-primary" to={f.link}>
  Go →
</Link>
        </div>
      </div>
    </div>
  </div>
))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-5 "style={{  backgroundImage:` url(${heroImg})` }}>
          <div className="container">
            <h2 className="mb-4 text-center text-white">How it works</h2>
            <div className="row align-items-center text-white">
              <div className="col-md-4 text-center text-white">
                <div className="p-3 border rounded">
                  <h5>1. Write or pick</h5>
                  <p className="small-muted text-white">Choose an algorithm or data structure, or type a short problem description.</p>
                </div>
              </div>
              <div className="col-md-4 text-center">
                <div className="p-3 border rounded">
                  <h5>2. Visualize & Manipulate</h5>
                  <p className="small-muted text-white">Step through execution, change inputs, and see complexity metrics in real time.</p>
                </div>
              </div>
              <div className="col-md-4 text-center">
                <div className="p-3 border rounded">
                  <h5>3. Practice & Save</h5>
                  <p className="small-muted text-white">Attempt exercises, submit runs, and track your progress over time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo teaser (inline) */}
        <section id="demo" className="py-5">
          <div className="container">
            <h2 className="mb-3 text-center">Quick demo — BubbleSort visualization</h2>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card shadow-sm p-3">
                  <div className="card-body">
                    <DemoVisualizer ariaLiveId="demo-status" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video / Explainers - keep but updated */}
        <section className="py-5 bg-dark text-white">
          <div className="container">
            <h3 className="mb-3 text-center">Learn with short explainers</h3>
            <div className="ratio ratio-16x9 shadow-lg">
              <iframe
                src="https://www.youtube.com/embed/xli_FI7CuzA"
                title="Intro Video"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-center mt-3 small-muted">Short, focused tutorials for each algorithm & data structure.</p>
          </div>
        </section>

      </main>

      <footer className="footer text-center"style={{ backgroundColor: "#6bffc4ff", padding: "1rem" }}>
        <div className="container">
          <div className="mb-2">
            <a href="/about" className="me-3">About</a>
            <a href="/privacy" className="me-3">Privacy</a>
            <a href="/contact">Contact</a>
          </div>
          <p className="mb-0 small-muted">© 2025 AlgoVisualizer+. Built for CS students — accessible and extensible.</p>
        </div>
      </footer>

      {/* Demo Modal (overlay) */}
      {demoOpen && (
        <div className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-title" id="demo-panel">
          <div className="demo-panel" role="document">
            <div className="d-flex justify-content-between align-items-start">
              <h4 id="demo-title">Live BubbleSort Demo</h4>
              <div>
                <button className="btn btn-sm btn-link" onClick={() => setDemoOpen(false)} aria-label="Close demo">Close ✕</button>
              </div>
            </div>
            <hr />
            <DemoVisualizer ariaLiveId="demo-status-modal" />
            <div className="text-end mt-2">
              <button className="btn btn-secondary me-2" onClick={() => setDemoOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default Home;
