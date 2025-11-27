import React, { useEffect, useState } from 'react';
import { getProjects } from './api';

function ProjectsList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then((data) => setProjects(data));
  }, []);

  return (
    <section className="projects-section">
      <h2>All Fundraising Projects</h2>
      <div className="project-grid">
        {projects.map((p) => (
          <div key={p.id} className="project-card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p><strong>Target:</strong> ${p.targetAmount}</p>
            <p><strong>Raised:</strong> ${p.currentAmount}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProjectsList;
