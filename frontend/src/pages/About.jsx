/**
 * pages/About.jsx — About Me Page
 *
 * INSTRUCTIONS — Edit these sections with your real details:
 * 1. BIO_TEXT — your personal story
 * 2. SKILLS — your actual skill levels
 * 3. TIMELINE — your real learning/work history
 * 4. STATS — your real numbers
 *
 * PHOTO: Same photo as Home — put it at frontend/public/profile.jpg
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── Edit this with your real bio ──────────────────────────────
const BIO = {
  name: 'Ivuaku Annastassia Ugwuonu',                          // ← your name
  role: 'DevOps & Cloud Engineer',
  location: 'Portugal 🇵🇹',
  email: 'ann.ugwuonu@gmail.com',           // ← your email
  github: 'https://github.com/uvereann',  // ← your github
  linkedin: 'https://linkedin.com/in/annuvere',  // ← your linkedin

  // ← Edit this paragraph with your real story
  intro: `I am a passionate DevOps and Cloud Engineer based in Lisbon Portugal,
    focused on building reliable, automated infrastructure that lets
    development teams ship faster and more safely.`,

  // ← Edit this paragraph
  background: `My journey into DevOps started with a simple question:
    why does deploying software have to be so painful? That question led me
    deep into CI/CD pipelines, containerisation, cloud architecture, and
    the philosophy that everything — infrastructure, deployments, security checks —
    should be automated, repeatable, and version-controlled.`,

  // ← Edit this paragraph
  approach: `I believe in right-sizing solutions. Kubernetes is powerful,
    but a portfolio site does not need cluster orchestration. I choose the
    simplest tool that solves the problem reliably, then build the automation
    around it. Security is never an afterthought — it is built into every
    layer from day one.`,

  // ← What kind of role you want
  lookingFor: `I am actively looking for DevOps, Cloud Engineering, or
    Site Reliability Engineering roles where I can contribute to building
    robust infrastructure and help teams deliver software with confidence.`
}

// ── Edit your skills and honest proficiency levels ────────────
const SKILL_GROUPS = [
  {
    category: 'Containerisation & Orchestration',
    color: 'accent',
    skills: [
      { name: 'Docker',               level: 100 },
      { name: 'Docker Compose',       level: 100 },
      { name: 'Kubernetes',           level: 100 },
      { name: 'microk8s',             level: 100 },
      { name: 'minikube',             level: 100 },
    ]
  },
  {
    category: 'CI/CD & Automation',
    color: 'purple',
    skills: [
      { name: 'GitHub Actions',       level: 100 },
      { name: 'Git / GitHub Flow',    level: 100 },
      { name: 'Trivy Security Scan',  level: 100 },
      { name: 'Shell Scripting',      level: 100 },
      { name: 'Jenkins',              level: 100 },
    ]
  },
  {
    category: 'Cloud & Infrastructure',
    color: 'accent',
    skills: [
      { name: 'GCP',                  level: 100 },
      { name: 'AWS',                  level: 100 },
      { name: 'Oracle Cloud',         level: 100 },
      { name: 'Terraform',            level: 100 },
      { name: 'Ansible',              level: 100 },
      { name: 'Nginx',                level: 100 },
    ]
  },
  {
    category: 'Development',
    color: 'purple',
    skills: [
      { name: 'Node.js / Express',    level: 100 },
      { name: 'Python / Flask',       level: 100 },
      { name: 'Go',                   level: 100 },
      { name: 'REST APIs',             level: 100 },
      { name: 'React / Vite',         level: 100 },
      { name: 'SQLite / SQL',         level: 100 },
      { name: 'Linux / Ubuntu',       level: 100 },
    ]
  },
]

// ── Edit your timeline with real dates and events ─────────────
const TIMELINE = [
  {
    period: '2024 — Present',
    title: `CloudOps Infrastructure & Platform Engineering
    One Time Education Effects Ltd`,
    desc: `Engineered and maintained automated cloud-native platforms across multi-environment infrastructures. Scaled and managed containerized workloads using Docker, Kubernetes, microk8s, and minikube while driving continuous delivery automation through GitHub Actions pipelines, cutting deployment times by 20%. Embedded automated Trivy Security Scans directly into production gates to protect application lifecycles. 
    Driven by a freelance and corporate focus on infrastructure resiliency, standardizing cloud provisioning using Terraform (IaC) templates to achieve 99%+ service availability across AWS and GCP clouds.`,
    tags: ['React', 'Node.js','AWS', 'GCP','Git/Github', 'Docker','Terraform','Ansible','Nginx', 'GitHub Actions', 'Trivy'],
    color: 'accent'
  },
  {
    period: '2022 — 2024',
    title: `Enterprise Systems Engineering & ERP Operations 
    Attain Enterprise Solutions Ltd`,
    desc: `Maintained, updated, and troubleshooted core financial and operational workflows inside Microsoft Dynamics NAV (Navision) environments for 50+ enterprise users. Managed the business logic tier and underlying relational database layer built on MS SQL Server, utilizing T-SQL queries and stored procedures to resolve data synchronization issues and optimize operational reporting.
    Supported and diagnosed internal web portals and business applications built with MS dynamics Navison, ensuring smooth frontend behavior and system usability.`,
    tags: ['Dynamics NAV', 'C/SIDE (Object Designer)', 'C/AL Language', 'MS SQL Server', 'T-SQL', 'Windows Server'],
    color: 'purple'
  },
  {
    period: '2020 — 2021',
    title: `Full-Stack & Core Web Development
    DNL Global Consult | Internships & Personal Gigs`,
    desc: `Began the engineering journey building responsive, accessible web applications and data services for various clients. Developed scalable backend microservices and RESTful API structures using Node.js / Express and Python, integrating light data stores with SQLite / SQL and MongoDB
    Orchestrated local application setups natively across Linux / Ubuntu operating systems, establishing rigorous source code control and peer-review workflows using Git / GitHub Flow..`,
    tags: ['Node.js/Express', 'Python','ReactJs', 'SQL', 'SQLite', 'REST APIs', 'Git/Github'],
    color: 'accent'
  }
]

// ── Stats — edit with your real numbers ───────────────────────
const STATS = [
  { value: '12+',    label: 'Projects Built'    },
  { value: '100%',   label: 'Tests Passing'     },
  { value: '0',      label: 'Critical CVEs'     },
  { value: 'Daily',  label: 'Deploy Frequency'  },
]

// ── Skill bar component ───────────────────────────────────────
function SkillBar({ name, level, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 6,
        fontSize: '0.85rem'
      }}>
        <span style={{ color: 'var(--text)' }}>{name}</span>
        {/*<span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem',
          color: color === 'accent' ? 'var(--accent)' : 'var(--accent2)'
        }}>
          {level}%
        </span>*/}
        {/* Replaced {level}% with a Tailwind-styled checkmark */}
        <span className={`font-sans text-xs font-bold ${
          color === 'accent' ? 'text-[var(--accent)]' : 'text-[var(--accent2)]'
        }`}>
          ✓
        </span>
      </div>
      <div style={{
        height: 4,
        background: 'var(--surface2)',
        borderRadius: 99,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${level}%`,
          borderRadius: 99,
          background: color === 'accent'
            ? 'linear-gradient(90deg, var(--accent), #34d399)'
            : 'linear-gradient(90deg, var(--accent2), #a78bfa)',
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  )
}

export default function About() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="page-container">

      {/* ── Hero with photo ───────────────────────────────────── */}
      <section style={{ marginBottom: 80 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 60,
          alignItems: 'start'
        }} className="about-hero-grid">

          {/* Photo column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', inset: -4,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                opacity: 0.5,
                filter: 'blur(10px)',
                zIndex: 0
              }} />

              {!imgError ? (
                <img
                  src="/profile.jpg"
                  alt={BIO.name}
                  onError={() => setImgError(true)}
                  style={{
                    width: 240,
                    height: 280,
                    borderRadius: 16,
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    border: '2px solid var(--accent)',
                    position: 'relative',
                    zIndex: 1,
                    display: 'block'
                  }}
                />
              ) : (
                <div style={{
                  width: 240,
                  height: 280,
                  borderRadius: 16,
                  background: 'var(--surface2)',
                  border: '2px solid var(--accent)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  gap: 8
                }}>
                  <span style={{ fontSize: '4rem' }}>👤</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--muted)',
                    textAlign: 'center',
                    padding: '0 16px'
                  }}>
                    Add profile.jpg to<br />frontend/public/
                  </span>
                </div>
              )}
            </div>

            {/* Contact card */}
            <div className="card" style={{ padding: 20, width: '100%', textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--text)',
                marginBottom: 4
              }}>
                {BIO.name}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--accent)',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 12
              }}>
                {BIO.role}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--muted)',
                marginBottom: 16
              }}>
                📍 {BIO.location}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={BIO.github} target="_blank" rel="noreferrer"
                  className="btn-ghost"
                  style={{ fontSize: '0.82rem', justifyContent: 'center' }}>
                  GitHub
                </a>
                <a href={BIO.linkedin} target="_blank" rel="noreferrer"
                  className="btn-ghost"
                  style={{ fontSize: '0.82rem', justifyContent: 'center' }}>
                  LinkedIn
                </a>
                <Link to="/contact" className="btn-primary"
                  style={{ fontSize: '0.82rem', justifyContent: 'center' }}>
                  Contact Me
                </Link>
              </div>
            </div>
          </div>

          {/* Bio column */}
          <div>
            <div className="section-label">About</div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 24,
              lineHeight: 1.2
            }}>
              Building infrastructure<br />
              <span style={{ color: 'var(--accent)' }}>that ships itself</span>
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[BIO.intro, BIO.background, BIO.approach].map((para, i) => (
                <p key={i} style={{
                  color: 'var(--muted)',
                  lineHeight: 1.85,
                  fontSize: '0.95rem'
                }}>
                  {para}
                </p>
              ))}

              {/* Looking for */}
              <div style={{
                marginTop: 8,
                padding: '16px 20px',
                borderRadius: 10,
                background: 'rgba(110,231,183,0.06)',
                border: '1px solid rgba(110,231,183,0.2)'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--accent)',
                  marginBottom: 6
                }}>
                  Currently looking for
                </div>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {BIO.lookingFor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section style={{ marginBottom: 80 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16
        }} className="stats-grid">
          {STATS.map(({ value, label }) => (
            <div key={label} className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--accent)',
                marginBottom: 6
              }}>
                {value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Education & Certifications Section ─────────────────────────────────── */}
<section style={{ marginBottom: 80 }}>
  <div className="section-label">Credentials</div>
  
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 32,
    marginTop: 16
  }}>
    {/* Left Column: Education */}
    <div className="card" style={{ padding: 24, background: 'var(--surface2)', borderRadius: 16 }}>
      <h3 style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '1.3rem',
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>🎓</span> Education
      </h3>
      
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem' }}>
          BS in Computer Science 
        </h4>
        <div style={{ 
          fontFamily: 'JetBrains Mono, monospace', 
          fontSize: '0.75rem', 
          color: 'var(--accent)',
          margin: '4px 0'
        }}>
          Federal University of Lafia, Nigeria | 2015 - 2019
        </div>
        <p style={{ color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.5, textAlign: 'justify' }}>
          CGPA: 4.15 / 5.0
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5, textAlign: 'justify' }}>
          Graduated with a Bachelor of Science in Computer Science, where I developed a strong foundation in algorithms, data structures, and software engineering principles. My coursework included operating systems, database management, and network security, which sparked my interest in DevOps and cloud infrastructure. <br />
          I completed a capstone project focused on building a scalable web application using microservices architecture, 
          which further solidified my passion for automation and cloud technologies.  
        </p>
      </div>
    </div>

    {/* Right Column: Certifications */}
    <div className="card" style={{ padding: 24, background: 'var(--surface2)', borderRadius: 16 }}>
      <h3 style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '1.3rem',
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>🏅</span> Certifications
      </h3>

      {/* Cert 1 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem' }}>
          KCNA: Kubernetes and Cloud Native Associate
        </h4>
        <div style={{ 
          fontFamily: 'JetBrains Mono, monospace', 
          fontSize: '0.75rem', 
          color: 'var(--accent2)',
          marginTop: 4
        }}>
          The Linux Foundation • Issued 2026
        </div>
      </div>

      {/* Cert 2 */}
      <div>
        <h4 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem' }}>
          Associate Cloud Engineer Certification(ACE)
        </h4>
        <div style={{ 
          fontFamily: 'JetBrains Mono, monospace', 
          fontSize: '0.75rem', 
          color: 'var(--accent2)',
          marginTop: 4
        }}>
          Google Cloud • Issued 2026
        </div>
      </div><br />
      {/* Cert 3 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem' }}>
          Microsoft Certified: Dynamics 365 Fundamentals (CRM)
        </h4>
        <div style={{ 
          fontFamily: 'JetBrains Mono, monospace', 
          fontSize: '0.75rem', 
          color: 'var(--accent2)',
          marginTop: 4
        }}>
          Microsoft • Issued 2023 (Does not expire)
        </div>
      </div>

      {/* Cert 4 */}
      <div>
        <h4 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem' }}>
          Microsoft Certified: Azure AI Fundamentals
        </h4>
        <div style={{ 
          fontFamily: 'JetBrains Mono, monospace', 
          fontSize: '0.75rem', 
          color: 'var(--accent2)',
          marginTop: 4
        }}>
          Microsoft • Issued 2022 (Does not expire)
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ── Skills ────────────────────────────────────────────── */}
      <section style={{ marginBottom: 80 }}>
        <div className="section-label">Skills</div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 32
        }}>
          Technical Skills
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {SKILL_GROUPS.map(({ category, color, skills }) => (
            <div key={category} className="card" style={{ padding: 24 }}>
              <h3 style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem',
                color: color === 'accent' ? 'var(--accent)' : 'var(--accent2)',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {category}
              </h3>
              {skills.map(skill => (
                <SkillBar key={skill.name} {...skill} color={color} />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────── */}
      <section style={{ marginBottom: 80 }}>
        <div className="section-label">Journey</div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 40
        }}>
          My Cloud/DevOps Journey
        </h2>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--border)'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} >
            {TIMELINE.map(({ period, title, desc, tags, color }, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 32,
                paddingBottom: 40,
                paddingLeft: 8
              }}>
                {/* Dot on timeline */}
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: color === 'accent' ? 'var(--accent)' : 'var(--accent2)',
                  border: '3px solid var(--bg)',
                  flexShrink: 0,
                  marginTop: 4,
                  zIndex: 1
                }} />

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    color: color === 'accent' ? 'var(--accent)' : 'var(--accent2)',
                    marginBottom: 6
                  }}>
                    {period}
                  </div>
                  <h3 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: 8,
                    fontSize: '1.05rem',
                    whiteSpace: 'pre-line'
                  }}>
                    {title}
                  </h3>
                  <p style={{
                    color: 'var(--muted)',
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    marginBottom: 12,
                    whiteSpace: 'pre-line'
                  }}>
                    {desc}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tags.map(tag => (
                      <span key={tag}
                        className={color === 'accent' ? 'tag' : 'tag tag-purple'}
                        style={{ fontSize: '0.68rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section>
        <div className="card" style={{
          padding: '48px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(110,231,183,0.05), rgba(129,140,248,0.05))'
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 12
          }}>
            Let us build something together
          </h2>
          <p style={{
            color: 'var(--muted)',
            marginBottom: 28,
            maxWidth: 480,
            margin: '0 auto 28px'
          }}>
            Open to DevOps, Cloud, and SRE roles. Always happy to talk
            infrastructure, automation, and engineering.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary">Get in touch →</Link>
            <Link to="/projects" className="btn-ghost">View Projects</Link>
          </div>
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .about-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  
)
}