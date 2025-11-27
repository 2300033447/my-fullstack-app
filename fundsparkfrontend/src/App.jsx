import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";
import axios from "axios";

import yourCauseIcon from "./assets/Your Cause.png";
import medicalIcon from "./assets/Medical.png";
import emergencyIcon from "./assets/Emergency.png";
import educationIcon from "./assets/Education.png";
import animalIcon from "./assets/Animal.png";
import businessIcon from "./assets/Business.png";

const API_BASE = "http://localhost:8080";

/* ----------------------------------
   CATEGORY FLOAT OBJECTS
---------------------------------- */
const categories = [
  { name: "Your cause", icon: yourCauseIcon, top: "10%", left: "18%", speed: 0.2 },
  { name: "Medical", icon: medicalIcon, top: "28%", left: "8%", speed: 0.3 },
  { name: "Emergency", icon: emergencyIcon, top: "62%", left: "18%", speed: 0.15 },
  { name: "Education", icon: educationIcon, top: "10%", left: "72%", speed: 0.25 },
  { name: "Animal", icon: animalIcon, top: "28%", left: "82%", speed: 0.35 },
  { name: "Business", icon: businessIcon, top: "62%", left: "72%", speed: 0.2 },
];

/* ----------------------------------
   CAMPAIGN CARD COMPONENT
---------------------------------- */
function CampaignCard({ project, img, onDonateClick, onOpenDetails }) {
  const raised = project.currentAmount || 0;
  const goal = project.targetAmount || 0;
  const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <div
      className="campaign-card"
      onClick={() => onOpenDetails(project)}
      style={{ cursor: "pointer" }}
    >
      {img && <img src={img} alt={project.title || "Campaign image"} />}
      <div className="card-header">
        <h3>{project.title || "Untitled campaign"}</h3>
        {project.verified && <span className="badge-verified">✔ Verified</span>}
      </div>
      {project.description && <p className="campaign-desc">{project.description}</p>}

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>

      <p className="raised-text">
        ₹{raised.toLocaleString("en-IN")} raised of ₹{goal.toLocaleString("en-IN")}
      </p>

      <button
        className="cta small"
        onClick={(e) => {
          e.stopPropagation();
          onDonateClick(project);
        }}
      >
        Donate Now
      </button>
    </div>
  );
}

/* ----------------------------------
   HOME PAGE
---------------------------------- */
function HomePage({ setShowSignUp }) {
  const [scrollY, setScrollY] = useState(0);
  const [amountRaised, setAmountRaised] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // animate counter once
  useEffect(() => {
    const target = 2340000;
    let current = 0;
    const increment = target / 150;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAmountRaised(Math.floor(current));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">
      <main className="hero-wrap">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="floating-cat"
            style={{
              top: cat.top,
              left: cat.left,
              transform: `translateY(${scrollY * cat.speed}px)`,
            }}
          >
            <div className="ring small-ring">
              <img src={cat.icon} alt={cat.name} className="category-img" />
            </div>
            <span className="cat-label">{cat.name}</span>
          </div>
        ))}

        {/* Centered hero content */}
        <header className="center-message">
          <h2 className="eyebrow">#1 crowdfunding platform</h2>
          <h1 className="hero-title">
            Successful <br /> fundraisers <br /> start here
          </h1>

          <button className="cta" onClick={() => setShowSignUp(true)}>
            Start a Fundspark
          </button>
        </header>
      </main>

      {/* Counter section below hero */}
      <section className="counter-section">
        <div className="counter-box">
          <span className="emoji">💰</span>
          Over ₹{amountRaised.toLocaleString("en-IN")} raised by our community!
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------
   DONATE PAGE — WITH SEARCH/FILTER/SORT
---------------------------------- */
function DonatePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [donorName, setDonorName] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donateLoading, setDonateLoading] = useState(false); // <-- NEW
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const activeRef = useRef(null);
  const navigate = useNavigate();

  const imagePool = [medicalIcon, educationIcon, emergencyIcon, animalIcon, businessIcon];

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/projects`)
      .then((res) => setProjects(res.data))
      .catch(() => setError("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  const scrollToActive = () => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openDonateModal = (project) => {
    setSelectedProject(project);
    setDonorName("");
    setDonationAmount("");
  };

  const closeDonateModal = () => {
    if (donateLoading) return; // prevent closing while processing
    setSelectedProject(null);
  };

  // 🔥 UPDATED: donation with PDF receipt
  const handleDonate = async () => {
    if (!selectedProject) return;
    const amount = parseFloat(donationAmount);
    if (!donorName || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid name and amount.");
      return;
    }

    try {
      setDonateLoading(true);
      const res = await axios.post(
        `${API_BASE}/api/donations/${selectedProject.id}`,
        {
          donorName,
          amount,
        }
      );

      const donation = res.data; // backend returns Donation object
      alert("Donation successful! Your receipt will download now.");

      // update UI currentAmount locally
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? { ...p, currentAmount: (p.currentAmount || 0) + amount }
            : p
        )
      );

      // Open PDF receipt in new tab if donation.id is present
      if (donation && donation.id) {
        window.open(`${API_BASE}/api/donations/${donation.id}/receipt`, "_blank");
      }

      setSelectedProject(null);
    } catch (err) {
      console.error(err);
      alert("Donation failed. Please try again.");
    } finally {
      setDonateLoading(false);
    }
  };

  // --- Safe filter + sort logic (handles null title/description/category) ---
  const filteredAndSortedProjects = projects
    .filter((p) => {
      const q = search.toLowerCase();

      const title = (p.title || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const category = (p.category || "").toLowerCase();

      const matchesText = title.includes(q) || desc.includes(q);

      const matchesCategory =
        categoryFilter === "All" || category === categoryFilter.toLowerCase();

      const matchesVerified = !showVerifiedOnly || p.verified === true;

      // hide deactivated projects if backend sets active=false
      const isActive = p.active !== false;

      return matchesText && matchesCategory && matchesVerified && isActive;
    })
    .sort((a, b) => {
      if (sortBy === "mostFunded") {
        const pa = (a.currentAmount || 0) / (a.targetAmount || 1);
        const pb = (b.currentAmount || 0) / (b.targetAmount || 1);
        return pb - pa;
      }
      if (sortBy === "almostFunded") {
        const pa = (a.currentAmount || 0) / (a.targetAmount || 1);
        const pb = (b.currentAmount || 0) / (b.targetAmount || 1);
        return Math.abs(1 - pa) - Math.abs(1 - pb);
      }
      // default: newest (fallback to id if no createdAt)
      const da = a.createdAt ? new Date(a.createdAt).getTime() : a.id || 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : b.id || 0;
      return db - da;
    });

  const openDetailsPage = (project) => {
    navigate(`/campaign/${project.id}`);
  };

  return (
    <div className="page-layout">
      <div className="page-hero">
        <h1>💜 Donate to a Cause</h1>
        <p>Explore verified fundraisers and make a real impact today.</p>

        <button className="cta" onClick={scrollToActive}>
          View Active Campaigns
        </button>

        {/* Search + filters */}
        <div className="filter-bar">
          <input
            type="text"
            className="modern-input"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="modern-input select-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All categories</option>
            <option value="Medical">Medical</option>
            <option value="Education">Education</option>
            <option value="Emergency">Emergency</option>
            <option value="Animal">Animal</option>
            <option value="Business">Business</option>
          </select>

          <select
            className="modern-input select-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="mostFunded">Most funded</option>
            <option value="almostFunded">Almost funded</option>
          </select>

          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
            />
            Only verified
          </label>
        </div>
      </div>

      <div className="campaign-grid" ref={activeRef}>
        {loading && <p>Loading campaigns...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading &&
          !error &&
          filteredAndSortedProjects.map((p, index) => (
            <CampaignCard
              key={p.id}
              project={p}
              img={imagePool[index % imagePool.length]}
              onDonateClick={openDonateModal}
              onOpenDetails={openDetailsPage}
            />
          ))}
      </div>

      {/* Donation Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={closeDonateModal}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDonateModal} disabled={donateLoading}>
              ×
            </button>
            <h2>Donate to {selectedProject.title || "this campaign"}</h2>
            <p>
              Current: ₹{(selectedProject.currentAmount || 0).toLocaleString("en-IN")} of ₹
              {(selectedProject.targetAmount || 0).toLocaleString("en-IN")}
            </p>

            <input
              type="text"
              className="modern-input"
              placeholder="Your name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              disabled={donateLoading}
            />
            <input
              type="number"
              className="modern-input"
              placeholder="Amount (₹)"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              disabled={donateLoading}
            />

            <button
              className="modern-btn"
              onClick={handleDonate}
              disabled={donateLoading}
            >
              {donateLoading ? "Processing..." : "Confirm Donation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------
   FUNDRAISE PAGE — CREATE NEW PROJECT
---------------------------------- */
function FundraisePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);

    if (!title || !description || isNaN(target) || target <= 0) {
      alert("Please fill all fields with a valid goal amount.");
      return;
    }

    try {
      setLoading(true);
      const ownerEmail = localStorage.getItem("userEmail") || null;

      const res = await axios.post(`${API_BASE}/api/projects`, {
        title,
        description,
        targetAmount: target,
        ownerEmail, // backend must accept this field
      });
      alert("Fundraiser created! ID: " + res.data.id);

      setTitle("");
      setDescription("");
      setTargetAmount("");
    } catch (err) {
      console.error(err);
      alert("Failed to create fundraiser. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-hero">
        <h1>🚀 Start a Fundraiser</h1>
        <p>Begin your journey to raise funds for a cause you care about.</p>

        <form onSubmit={handleCreate} style={{ marginTop: "20px" }}>
          <input
            type="text"
            className="modern-input"
            placeholder="Fundraiser title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <textarea
            className="modern-input"
            placeholder="Describe your cause"
            style={{ minHeight: "80px", resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <input
            type="number"
            className="modern-input"
            placeholder="Target amount (₹)"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            disabled={loading}
          />

          <button className="modern-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Fundraiser"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------------
   CAMPAIGN DETAIL PAGE /campaign/:id
---------------------------------- */
function CampaignPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [recentDonors, setRecentDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // project details
    axios
      .get(`${API_BASE}/api/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));

    // recent donors (optional — backend: GET /api/projects/{id}/donations)
    axios
      .get(`${API_BASE}/api/projects/${id}/donations`)
      .then((res) => setRecentDonors(res.data))
      .catch(() => setRecentDonors([]));
  }, [id]);

  if (loading) {
    return (
      <div className="page-layout">
        <div className="page-hero">
          <h1>Loading campaign...</h1>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-layout">
        <div className="page-hero">
          <h1>Campaign not found</h1>
        </div>
      </div>
    );
  }

  const raised = project.currentAmount || 0;
  const goal = project.targetAmount || 0;
  const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  const shareLink = window.location.href;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Campaign link copied!");
  };

  return (
    <div className="page-layout">
      <div className="page-hero campaign-hero">
        <div className="campaign-header">
          <h1>{project.title || "Untitled campaign"}</h1>
          {project.verified && <span className="badge-verified large">✔ Verified</span>}
        </div>
        <p className="campaign-desc-long">{project.description}</p>

        <div className="progress-bar large">
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
        <p className="raised-text">
          ₹{raised.toLocaleString("en-IN")} raised of ₹{goal.toLocaleString("en-IN")}
        </p>

        <div className="campaign-actions">
          <a href="/donate" className="cta">
            Donate now
          </a>
          <button className="sign-btn" onClick={copyShareLink}>
            Copy share link
          </button>
        </div>

        {recentDonors.length > 0 && (
          <div className="recent-donors">
            <h3>Recent donors</h3>
            <ul>
              {recentDonors.map((d) => (
                <li key={d.id}>
                  <strong>{d.donorName}</strong> donated ₹
                  {d.amount.toLocaleString("en-IN")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------
   PROFILE PAGE /profile
---------------------------------- */
function ProfilePage({ userEmail }) {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE}/api/projects`)
      .then((res) => {
        const mine = res.data.filter((p) => p.ownerEmail === userEmail);
        setMyProjects(mine);
      })
      .finally(() => setLoading(false));
  }, [userEmail]);

  if (!userEmail) {
    return (
      <div className="page-layout">
        <div className="page-hero">
          <h1>Profile</h1>
          <p>Please sign in to see your campaigns.</p>
        </div>
      </div>
    );
  }

  const totalRaised = myProjects.reduce(
    (sum, p) => sum + (p.currentAmount || 0),
    0
  );

  return (
    <div className="page-layout">
      <div className="page-hero">
        <h1>👤 My Profile</h1>
        <p>{userEmail}</p>

        {loading ? (
          <p>Loading your campaigns...</p>
        ) : (
          <>
            <p style={{ marginTop: "10px" }}>
              Total raised across your campaigns:{" "}
              <strong>₹{totalRaised.toLocaleString("en-IN")}</strong>
            </p>

            <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>
              Your campaigns
            </h3>
            {myProjects.length === 0 && <p>You haven&apos;t created any campaigns yet.</p>}

            <div className="campaign-grid">
              {myProjects.map((p) => (
                <div key={p.id} className="campaign-card">
                  <div className="card-header">
                    <h3>{p.title}</h3>
                    {p.verified && <span className="badge-verified">✔ Verified</span>}
                  </div>
                  <p className="campaign-desc">{p.description}</p>
                  <p className="raised-text">
                    ₹{(p.currentAmount || 0).toLocaleString("en-IN")} of ₹
                    {(p.targetAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------
   ADMIN DASHBOARD /admin
---------------------------------- */
function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    axios
      .get(`${API_BASE}/api/admin/projects`)
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const verifyProject = async (id) => {
    await axios.put(`${API_BASE}/api/admin/projects/${id}/verify`);
    fetchProjects();
  };

  const deactivateProject = async (id) => {
    await axios.put(`${API_BASE}/api/admin/projects/${id}/deactivate`);
    fetchProjects();
  };

  return (
    <div className="page-layout">
      <div className="page-hero admin-hero">
        <h1>🧑‍💼 Admin Dashboard</h1>
        <p>Manage and moderate all campaigns on Fundspark.</p>

        {loading ? (
          <p>Loading campaigns...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Raised</th>
                  <th>Goal</th>
                  <th>Verified</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.title}</td>
                    <td>{p.ownerEmail || "-"}</td>
                    <td>₹{(p.currentAmount || 0).toLocaleString("en-IN")}</td>
                    <td>₹{(p.targetAmount || 0).toLocaleString("en-IN")}</td>
                    <td>{p.verified ? "✔" : "✖"}</td>
                    <td>{p.active === false ? "❌" : "✅"}</td>
                    <td>
                      {!p.verified && (
                        <button
                          className="admin-btn verify"
                          onClick={() => verifyProject(p.id)}
                        >
                          Verify
                        </button>
                      )}
                      {p.active !== false && (
                        <button
                          className="admin-btn deactivate"
                          onClick={() => deactivateProject(p.id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------
   APP ROUTER + AUTH MODALS
---------------------------------- */
export default function App() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // auth form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedUser) setUserName(storedUser);
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  const isAdmin = userEmail === "admin@fundspark.com"; // simple demo rule

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      setUserName("");
      setUserEmail("");
    }
  };

  const handleSignIn = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signin`, {
        email: signInEmail,
        password: signInPassword,
      });
      alert(res.data);

      if (res.data === "Login successful!") {
        const namePart = signInEmail.split("@")[0];
        setUserName(namePart);
        setUserEmail(signInEmail);
        localStorage.setItem("userName", namePart);
        localStorage.setItem("userEmail", signInEmail);
        setShowSignIn(false);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Check your backend or credentials.");
    }
  };

  const handleSignUp = async () => {
    if (signUpPassword !== signUpConfirm) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup`, {
        fullName: signUpName,
        email: signUpEmail,
        password: signUpPassword,
      });
      alert(res.data);
      setShowSignUp(false);
      setShowSignIn(true);
    } catch (err) {
      console.error(err);
      alert("Sign-up failed. Check your backend.");
    }
  };

  return (
    <Router>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <NavLink
            to="/donate"
            className={({ isActive }) => `nav-item ${isActive ? "active-link" : ""}`}
          >
            Donate
          </NavLink>
          <NavLink
            to="/fundraise"
            className={({ isActive }) => `nav-item ${isActive ? "active-link" : ""}`}
          >
            Fundraise
          </NavLink>
          {userName && (
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-item ${isActive ? "active-link" : ""}`}
            >
              Profile
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item ${isActive ? "active-link" : ""}`}
            >
              Admin
            </NavLink>
          )}
        </div>

        <div className="nav-center">
          <NavLink to="/" className="logo">
            Fundspark
          </NavLink>
        </div>

        <div className="nav-right">
          <span className="nav-item">About ▾</span>
          {userName ? (
            <>
              <span className="nav-item">👋 {userName}</span>
              <button className="sign-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className="sign-btn"
                onClick={() => {
                  setShowSignIn(true);
                  setShowSignUp(false);
                }}
              >
                Sign in
              </button>
              <button
                className="start-fund outline"
                onClick={() => {
                  setShowSignUp(true);
                  setShowSignIn(false);
                }}
              >
                Start a Fundspark
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<HomePage setShowSignUp={setShowSignUp} />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/fundraise" element={<FundraisePage />} />
        <Route path="/campaign/:id" element={<CampaignPage />} />
        <Route path="/profile" element={<ProfilePage userEmail={userEmail} />} />
        {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
      </Routes>

      {/* SIGN-IN MODAL */}
      {showSignIn && (
        <div className="modal-overlay" onClick={() => setShowSignIn(false)}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSignIn(false)}>
              ×
            </button>
            <h2>Welcome Back</h2>

            <input
              type="email"
              placeholder="Email address"
              className="modern-input"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="modern-input"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
            />

            <button className="modern-btn" onClick={handleSignIn}>
              Sign in
            </button>
            <p>
              Don’t have an account?{" "}
              <span
                className="link-text"
                onClick={() => {
                  setShowSignIn(false);
                  setShowSignUp(true);
                }}
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      )}

      {/* SIGN-UP MODAL */}
      {showSignUp && (
        <div className="modal-overlay" onClick={() => setShowSignUp(false)}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSignUp(false)}>
              ×
            </button>
            <h2>Create Account</h2>

            <input
              type="text"
              placeholder="Full name"
              className="modern-input"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email address"
              className="modern-input"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="modern-input"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm password"
              className="modern-input"
              value={signUpConfirm}
              onChange={(e) => setSignUpConfirm(e.target.value)}
            />

            <button className="modern-btn" onClick={handleSignUp}>
              Sign up
            </button>
            <p>
              Already have an account?{" "}
              <span
                className="link-text"
                onClick={() => {
                  setShowSignUp(false);
                  setShowSignIn(true);
                }}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      )}
    </Router>
  );
}
