// src/components/NavBarHome.jsx
import React from "react";

function NavBarHome({ setDemoOpen }) {
  return (
    <header role="banner" aria-label="Main header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#hero">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="me-2"
            >
              <path d="M4 12h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 4v16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Overview
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#features">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how">
                  How It Works
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#demo"
                  onClick={(e) => {
                    e.preventDefault();
                    if (setDemoOpen) setDemoOpen(true);
                  }}
                >
                  Live Demo
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default NavBarHome;
