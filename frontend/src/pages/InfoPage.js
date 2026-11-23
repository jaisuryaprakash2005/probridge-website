import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2, PhoneCall, ShieldCheck,
  ChevronRight, MapPin, Mail, Clock,
  CheckCircle2, Award, Sparkles, Send,
  Users, TrendingUp, Globe, Heart,
  Briefcase, X, Upload, Star
} from 'lucide-react';
import styles from './InfoPage.module.css';
import { getCareers, applyForCareer } from '../services/api';

/* ─€─€ Scroll Reveal Hook ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay') || 0;
            setTimeout(() => {
              entry.target.classList.add(styles.revealed);
            }, Number(delay));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

/* ─€─€ Main Page ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
export default function InfoPage({ page }) {
  const location = useLocation();
  const pathSlug = location.pathname.replace(/^\//, '');
  const currentSlug = pathSlug || page || 'about-us';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  useScrollReveal();

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setContactSubmitted(true);
  };

  return (
    <div className={styles.pageWrap}>
      {renderPageContent(currentSlug, {
        formData, setFormData, contactSubmitted, handleContactSubmit,
      })}
    </div>
  );
}

function renderPageContent(slug, contactState) {
  switch (slug) {
    case 'about-us': return <AboutUsView />;
    case 'careers': return <CareersView />;
    case 'contact-us': return <ContactUsView {...contactState} />;
    case 'privacy': return <PrivacyPolicyView />;
    case 'guide': return <PropGuideView />;
    case 'nri-services': return <NriServicesView />;
    case 'how-to-buy': return <HowToBuyView />;
    default: return <AboutUsView />;
  }
}

/* ─€─€ Breadcrumb helper ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
function Breadcrumb({ label }) {
  return (
    <div className={styles.breadcrumbBar}>
      <div className={styles.breadcrumbInner}>
        <Link to="/" className={styles.breadLink}>Home</Link>
        <ChevronRight size={13} />
        <span className={styles.breadCurrent}>{label}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. ABOUT US
═══════════════════════════════════════════════════════════════ */
function AboutUsView() {
  return (
    <>
      {/* Hero */}
      <div
        className={styles.fullHero}
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80')` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Breadcrumb label="About Us" />
          <span className={styles.heroTag}>Corporate Overview</span>
          <h1 className={styles.heroTitle}>About ProBridge</h1>
          <p className={styles.heroSub}>
            India's premier tech-enabled real estate advisory platform — connecting homebuyers, verified owners, and trusted developers with complete transparency.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsStrip} data-reveal data-delay="0">
        {[
          { val: '10,000+', label: 'Properties Listed' },
          { val: '500+', label: 'Cities Covered' },
          { val: '98%', label: 'Customer Satisfaction' },
          { val: '₹5000 Cr+', label: 'Transactions Facilitated' },
        ].map((s) => (
          <div key={s.label} className={styles.statItem}>
            <div className={styles.statVal}>{s.val}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Vision & Mission */}
      <div className={styles.section}>
        <div className={styles.splitRow} data-reveal data-delay="0">
          <div className={styles.splitText}>
            <span className={styles.sectionTag}>Our Foundation</span>
            <h2 className={styles.sectionTitle}>Vision &amp; Mission</h2>
            <p className={styles.paragraph}>
              Probridge.co.in is built on the foundation of trust and empowerment. Founded with a mission to bring complete transparency to India's dynamic property market, we bridge the gap between discerning homebuyers, verified property owners, and trusted corporate developers.
            </p>
            <p className={styles.paragraph}>
              From discovery to physical site visits, document verification, home loan assistance, and final key handover, ProBridge supports buyers at every step of their journey.
            </p>
          </div>
          <div className={styles.splitImage}>
            <img
              src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80"
              alt="ProBridge real estate advisory team"
              className={styles.roundedImg}
            />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitleCenter} data-reveal data-delay="0">Why Homebuyers Choose ProBridge</h2>
          <div className={styles.grid4} data-reveal data-delay="100">
            {[
              { icon: <ShieldCheck size={28} />, title: '100% Physical Verification', text: 'Every home and plot listed undergoes rigorous on-ground inspection and legal paperwork vetting.' },
              { icon: <Award size={28} />, title: 'Zero Brokerage Options', text: 'Thousands of direct owner listings and premium builder-partner units without middleman charges.' },
              { icon: <Building2 size={28} />, title: 'Top Developers & Projects', text: 'Official partnerships with Prestige, Godrej, Sobha, Brigade, and DLF.' },
              { icon: <PhoneCall size={28} />, title: 'Dedicated Relationship Managers', text: 'Personalized advisory, site-visit cab arrangements, negotiation support, and home loan assistance.' },
            ].map((f) => (
              <div key={f.title} className={styles.iconCard} data-reveal data-delay="150">
                <div className={styles.iconWrap}>{f.icon}</div>
                <h3 className={styles.iconCardTitle}>{f.title}</h3>
                <p className={styles.iconCardText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitleCenter} data-reveal data-delay="0">What Our Clients Say</h2>
          <div className={styles.grid3} data-reveal data-delay="100">
            {[
              { name: 'Ramesh Nair', city: 'Chennai', rating: 5, text: 'ProBridge helped me find my dream 3BHK in Perambur with zero brokerage. The entire process was smooth and transparent.' },
              { name: 'Priya Sharma', city: 'Bengaluru', rating: 5, text: 'The relationship manager arranged 4 site visits in a single day. Got the best deal on a Prestige project!' },
              { name: 'Karthik Menon', city: 'Hyderabad', rating: 5, text: 'As an NRI, I was skeptical but the video walkthroughs and legal verification gave me complete confidence.' },
            ].map((t) => (
              <div key={t.name} className={styles.testimonialCard} data-reveal data-delay="200">
                <div className={styles.stars}>{Array(t.rating).fill(0).map((_, i) => <Star key={i} size={14} fill="#FDE047" color="#FDE047" />)}</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.avatarCircle}>{t.name[0]}</div>
                  <div>
                    <div className={styles.authorName}>{t.name}</div>
                    <div className={styles.authorCity}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   2. CAREERS (CONNECTED TO BACKEND API & ADMIN DASHBOARD)
══════════════════════════════════════════════════════════════════ */
function CareersView() {
  const DEFAULT_ROLES = [
    {
      title: 'Real Estate Portfolio Advisor',
      dept: 'Advisory & Sales',
      loc: 'Chennai & Bengaluru',
      type: 'Full-time',
      experience: '2-5 years',
      salary: '₹6L - ₹12L PA',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    },
    {
      title: 'Frontend React / React Native Engineer',
      dept: 'Technology & Product',
      loc: 'Remote / Hybrid',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹8L - ₹16L PA',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    },
    {
      title: 'Property Verification Specialist',
      dept: 'Field Operations',
      loc: 'Chennai',
      type: 'Full-time',
      experience: '1-3 years',
      salary: '₹4L - ₹7L PA',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    },
    {
      title: 'Digital Growth Marketing Manager',
      dept: 'Marketing',
      loc: 'Bengaluru',
      type: 'Full-time',
      experience: '3-6 years',
      salary: '₹10L - ₹18L PA',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    },
  ];

  const [careersList, setCareersList] = useState(DEFAULT_ROLES);
  const [, setLoadingCareers] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [appForm, setAppForm] = useState({ name: '', email: '', phone: '', experience: '', coverLetter: '', resume: null });
  const [submitting, setSubmitting] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef(null);

  // Fetch live careers from backend
  useEffect(() => {
    let active = true;
    setLoadingCareers(true);
    getCareers()
      .then((res) => {
        const results = res.data?.results || [];
        if (active && results.length > 0) {
          setCareersList(results);
        }
      })
      .catch((err) => {
        console.warn('Could not load live careers, showing default listings:', err.message);
      })
      .finally(() => {
        if (active) setLoadingCareers(false);
      });
    return () => { active = false; };
  }, []);

  const openModal = (role) => {
    setSelectedRole(role);
    setAppForm({ name: '', email: '', phone: '', experience: '', coverLetter: '', resume: null });
    setAppSubmitted(false);
    setSubmitError('');
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = '';
  };

  const handleAppSubmit = async (e) => {
    e.preventDefault();
    if (!appForm.name.trim() || !appForm.email.trim()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      const roleTitle = selectedRole?.title || (typeof selectedRole === 'string' ? selectedRole : '');
      formData.append('roleTitle', roleTitle);
      formData.append('name', appForm.name.trim());
      formData.append('email', appForm.email.trim());
      if (appForm.phone) formData.append('phone', appForm.phone.trim());
      if (appForm.experience) formData.append('experience', appForm.experience.trim());
      if (appForm.coverLetter) formData.append('coverLetter', appForm.coverLetter.trim());
      if (appForm.resume) formData.append('resume', appForm.resume);
      if (selectedRole?._id || selectedRole?.id) {
        formData.append('careerId', selectedRole._id || selectedRole.id);
      }

      await applyForCareer(formData);
      setAppSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRoleTitle = selectedRole?.title || (typeof selectedRole === 'string' ? selectedRole : '');

  return (
    <>
      {/* Hero */}
      <div
        className={styles.fullHero}
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80')` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Breadcrumb label="Careers" />
          <span className={styles.heroTag}>Join Our Team</span>
          <h1 className={styles.heroTitle}>Careers at ProBridge</h1>
          <p className={styles.heroSub}>
            Shape the future of Indian proptech. We are looking for passionate innovators, advisors, and engineers to build a better real estate ecosystem.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitleCenter} data-reveal data-delay="0">Why Work With Us</h2>
          <div className={styles.grid4} data-reveal data-delay="100">
            {[
              { icon: <TrendingUp size={26} />, title: 'High Growth', text: 'Fast-track career growth in one of India\'s fastest growing proptech companies.' },
              { icon: <Heart size={26} />, title: 'Health Benefits', text: 'Comprehensive medical, dental, and wellness coverage for you and your family.' },
              { icon: <Users size={26} />, title: 'Meritocracy', text: 'Performance-driven culture where your work directly impacts your rewards.' },
              { icon: <Globe size={26} />, title: 'Remote Friendly', text: 'Flexible hybrid work options across Chennai, Bengaluru, and remote roles.' },
            ].map((b) => (
              <div key={b.title} className={styles.iconCard} data-reveal data-delay="150">
                <div className={styles.iconWrap}>{b.icon}</div>
                <h3 className={styles.iconCardTitle}>{b.title}</h3>
                <p className={styles.iconCardText}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }} data-reveal data-delay="0">
                Open Positions ({careersList.length})
              </h2>
              <p style={{ margin: '4px 0 0', color: '#6D857C', fontSize: 14 }}>
                Explore open roles across technology, advisory, marketing, and operations.
              </p>
            </div>
          </div>

          <div className={styles.rolesList}>
            {careersList.filter(Boolean).map((role, i) => {
              const dept = role.department || role.dept || 'General';
              const loc = role.location || role.loc || 'Chennai';
              const type = role.type || 'Full-time';
              return (
                <div key={role.id || role._id || role.title + i} className={styles.roleCard}>
                  <div className={styles.roleLeft}>
                    <div className={styles.roleIconWrap}>
                      {role.image ? (
                        <img
                          src={role.image}
                          alt={role.title}
                          className={styles.roleImg}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector(`.${styles.roleFallbackIcon}`);
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={styles.roleFallbackIcon}
                        style={{ display: role.image ? 'none' : 'flex' }}
                      >
                        <Briefcase size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className={styles.roleTitle}>{role.title}</h3>
                      <p className={styles.roleMeta}>
                        {dept} &nbsp;·&nbsp; <MapPin size={12} style={{ verticalAlign: -2 }} /> {loc}
                        {role.experience ? ` · ${role.experience}` : ''}
                        {role.salary ? ` · ${role.salary}` : ''}
                      </p>
                      {role.description && (
                        <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0', lineHeight: 1.45, maxWidth: 650 }}>
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={styles.roleRight}>
                    <span className={styles.roleBadge}>{type}</span>
                    <button className={styles.applyBtn} onClick={() => openModal(role)}>
                      Apply Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button className={styles.modalClose} onClick={closeModal}><X size={20} /></button>
            {appSubmitted ? (
              <div className={styles.modalSuccess}>
                <CheckCircle2 size={52} color="#16a34a" />
                <h3>Application Submitted!</h3>
                <p>
                  Thank you, <strong>{appForm.name}</strong>! We've received your application for <strong>{activeRoleTitle}</strong>.
                  Our HR & hiring team will review your profile and reach out to you at <strong>{appForm.email}</strong> within 3–5 business days.
                </p>
                <button className={styles.submitBtn} onClick={closeModal} style={{ marginTop: 8 }}>
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <span className={styles.heroTag} style={{ marginBottom: 8 }}>Apply for Position</span>
                  <h2 className={styles.modalTitle}>{activeRoleTitle}</h2>
                  <p className={styles.modalSub}>Fill in your details and attach your resume below.</p>
                </div>

                {submitError && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                    {submitError}
                  </div>
                )}

                <form className={styles.modalForm} onSubmit={handleAppSubmit}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={appForm.name}
                      onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@gmail.com"
                      value={appForm.email}
                      onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Total Experience / Current Role</label>
                    <input
                      type="text"
                      placeholder="e.g. 2.5 years as Real Estate Advisor"
                      value={appForm.experience}
                      onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Upload Resume / CV *</label>
                    <div
                      className={styles.fileUploadBox}
                      onClick={() => fileRef.current && fileRef.current.click()}
                      style={{ cursor: 'pointer', padding: '16px', border: '2px dashed #CBD5E1', borderRadius: 10, textAlign: 'center', background: '#F8FAFC' }}
                    >
                      <Upload size={22} color="#0D5F4E" style={{ margin: '0 auto 6px', display: 'block' }} />
                      <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                        {appForm.resume ? appForm.resume.name : 'Click to select PDF, DOC, or DOCX'}
                      </span>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={(e) => setAppForm({ ...appForm, resume: e.target.files[0] })}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Note / Cover Letter (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Briefly tell us why you are interested in this role..."
                      value={appForm.coverLetter}
                      onChange={(e) => setAppForm({ ...appForm, coverLetter: e.target.value })}
                      className={styles.inputField}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    <Send size={15} style={{ verticalAlign: -2, marginRight: 6 }} />
                    {submitting ? 'Submitting Application”¦' : 'Submit Application'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
/* ═══════════════════════════════════════════════════════════════
   3. CONTACT US
═══════════════════════════════════════════════════════════════ */
function ContactUsView({ formData, setFormData, contactSubmitted, handleContactSubmit }) {
  return (
    <>
      <div
        className={styles.fullHero}
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80')` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Breadcrumb label="Contact Us" />
          <span className={styles.heroTag}>Get in Touch</span>
          <h1 className={styles.heroTitle}>Contact ProBridge</h1>
          <p className={styles.heroSub}>
            Have queries about a property listing, project booking, or partnership? Reach out to our advisory desk anytime.
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.contactGrid} data-reveal data-delay="0">
            {[
              { icon: <MapPin size={22} />, label: 'Corporate Office', val: 'First Floor, i5 Complex, 10-B, Ekambaram Industrial Estate Rd, Alapakkam, Karpaga Vinayagar Colony, Valasaravakkam, Chennai, Tamil Nadu 600116' },
              { icon: <PhoneCall size={22} />, label: 'Phone & WhatsApp', val: '+91 9176663200' },
              { icon: <Mail size={22} />, label: 'Support Email', val: 'info@probridge.co.in' },
              { icon: <Clock size={22} />, label: 'Advisory Desk Hours', val: 'Monday to Saturday: 9:30 AM – 6:30 PM' },
            ].map((c) => (
              <div key={c.label} className={styles.contactBox} data-reveal data-delay="100">
                <div className={styles.contactBoxIcon}>{c.icon}</div>
                <div>
                  <div className={styles.contactBoxLabel}>{c.label}</div>
                  <div className={styles.contactBoxVal}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Form side by side */}
      <div className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.contactSplitRow}>
            {/* Map */}
            <div className={styles.mapWrap} data-reveal data-delay="0">
              <h2 className={styles.sectionTitle}>Find Us</h2>
              <iframe
                title="ProBridge Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.6753967854836!2d77.0405!3d28.4564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d18f2b9b5b10b%3A0x0!2zMjjCsDI3JzIzLjAiTiA3N8KwMDInMjkuNCJF!5e0!3m2!1sen!2sin!4v1234567890123"
                className={styles.mapIframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact Form */}
            <div className={styles.formWrap} data-reveal data-delay="100">
              <h2 className={styles.sectionTitle}>Send Us a Message</h2>
              {contactSubmitted ? (
                <div className={styles.callout} style={{ background: '#E6F4EA', borderColor: '#16a34a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
                    <CheckCircle2 size={18} color="#16a34a" /> Thank You! We've Received Your Message
                  </div>
                  <p style={{ margin: '6px 0 0', color: '#166534' }}>
                    One of our senior property advisors will get in touch with you at <strong>{formData.phone}</strong> shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                  <div className={styles.formRow2}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Your Name *</label>
                      <input type="text" required placeholder="e.g. Ramesh Kumar"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Phone Number *</label>
                      <input type="tel" required placeholder="e.g. 9876543210"
                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={styles.inputField} />
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email Address</label>
                    <input type="email" placeholder="e.g. ramesh@example.com"
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>How Can We Help?</label>
                    <textarea rows={4} placeholder="Tell us what you are looking for..."
                      value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={styles.inputField} style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    <Send size={15} style={{ verticalAlign: -2, marginRight: 6 }} />
                    Submit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PRIVACY POLICY
═══════════════════════════════════════════════════════════════ */
function PrivacyPolicyView() {
  const sections = [
    { num: '01', title: '1. Introduction', text: 'Probridge.co.in ("ProBridge", "we", "us", or "our") is dedicated to safeguarding your privacy. This Privacy Policy outlines our practices regarding data collection, storage, and usage when you visit our website, mobile apps, or engage our property advisory services.' },
    { num: '02', title: '2. Information We Collect', text: 'When you register, schedule a site visit, or submit an enquiry, we collect information including your name, contact phone number, email address, property preferences, and location details. We also collect technical diagnostic information such as IP addresses, device identifiers, and browser cookies to provide a personalized browsing experience.' },
    { num: '03', title: '3. How We Use Your Information', text: 'We use your data solely to connect you with verified sellers or builder partners, arrange site visits, process enquiry requests, provide customer support, and inform you of new matching property launches. We never sell your personal data to unauthorized third-party advertisers.' },
    { num: '04', title: '4. Data Security', text: 'All information transmitted through ProBridge is protected using industry-standard SSL encryption and strict database access controls. For privacy inquiries or data removal requests, contact our compliance officer at info@probridge.co.in' },
  ];
  return (
    <>
      <div className={styles.fullHero} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Breadcrumb label="Privacy Policy" />
          <span className={styles.heroTag}>Legal &amp; Privacy</span>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroSub}>How ProBridge collects, protects, and handles your personal data in compliance with Indian data protection laws.</p>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          {sections.map((s, i) => (
            <div key={s.num} className={styles.policyCard} data-reveal data-delay={i * 80}>
              <div className={styles.policyNum}>{s.num}</div>
              <div>
                <h2 className={styles.policyTitle}>{s.title}</h2>
                <p className={styles.paragraph}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PropGuideView() {
  const ARTICLES = [
    { title: 'First-Time Homebuyer Complete Checklist (2026 Edition)', category: 'Buying Guide', readTime: '6 min read', desc: 'Step-by-step guidance from down payments and credit scores to builder verification, legal checks, and registration costs.', img: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&q=80' },
    { title: 'Understanding RERA: How Real Estate Regulation Protects You', category: 'Legal & Compliance', readTime: '5 min read', desc: 'Why every project must have an active RERA number, how to check project delivery deadlines, and your rights if possession is delayed.', img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80' },
    { title: 'Carpet Area vs Built-Up Area vs Super Built-Up Area Explained', category: 'Property Specs', readTime: '4 min read', desc: 'Never overpay for loading. Learn the mathematical difference between usable carpet area, balcony spaces, and common amenities.', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
    { title: 'Top Emerging Real Estate Investment Hubs in India', category: 'Investment Trends', readTime: '7 min read', desc: 'Comprehensive analysis of high-growth corridors in Bengaluru, Chennai, Hyderabad, and Pune driven by metro expansions and IT hubs.', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
  ];
  return (
    <>
      <div className={styles.fullHero} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Breadcrumb label="Bridge Guide" />
          <span className={styles.heroTag}>Real Estate Knowledge Hub</span>
          <h1 className={styles.heroTitle}>Bridgeguide by ProBridge</h1>
          <p className={styles.heroSub}>Expert guides, legal insights, taxation tips, and market analysis to help you make confident real estate investment decisions.</p>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} data-reveal data-delay="0">Featured Real Estate Guides</h2>
          <div className={styles.articleGrid}>
            {ARTICLES.map((art, i) => (
              <div key={art.title} className={styles.articleCard} data-reveal data-delay={i * 80}>
                <div className={styles.articleImgWrap}>
                  <img src={art.img} alt={art.title} className={styles.articleImg} />
                  <div className={styles.articleImgOverlay} />
                  <span className={styles.articleCat}>{art.category}</span>
                </div>
                <div className={styles.articleBody}>
                  <span className={styles.articleReadTime}>{art.readTime}</span>
                  <h3 className={styles.articleTitle}>{art.title}</h3>
                  <p className={styles.articleDesc}>{art.desc}</p>
                  <button className={styles.readMoreBtn}>Read Guide →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. NRI SERVICES
═══════════════════════════════════════════════════════════════ */
function NriServicesView() {
  return (
    <>
      <div className={styles.fullHero} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Breadcrumb label="NRI Services" />
          <span className={styles.heroTag}>Global Indian Solutions</span>
          <h1 className={styles.heroTitle}>NRI Real Estate Services</h1>
          <p className={styles.heroSub}>Dedicated overseas property desk. Helping Non-Resident Indians effortlessly buy, manage, and monitor high-yielding Indian properties from anywhere in the world.</p>
        </div>
      </div>

      <div className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitleCenter} data-reveal data-delay="0">Tailored Assistance for Overseas Buyers</h2>
          <div className={styles.grid4} data-reveal data-delay="100">
            {[
              { icon: <Sparkles size={28} />, title: 'Dedicated Concierge & Video Walkthroughs', text: 'HD live virtual site visits, drone views, and regular construction milestone updates delivered directly to your device.' },
              { icon: <ShieldCheck size={28} />, title: 'FEMA & Legal Compliance', text: 'Complete guidance on NRE/NRO bank account remittances, Power of Attorney (PoA) documentation, and tax optimization under Indian laws.' },
              { icon: <Award size={28} />, title: 'Grade-A Developer Portfolios', text: 'Direct institutional access to top-tier gated communities, luxury villas, and high-rental-yield pre-leased commercial assets.' },
              { icon: <Building2 size={28} />, title: 'End-to-End Tenancy Management', text: 'Tenant screening, rental agreement execution, rent collection, and property upkeep while you are abroad.' },
            ].map((f) => (
              <div key={f.title} className={styles.iconCard} data-reveal data-delay="150">
                <div className={styles.iconWrap}>{f.icon}</div>
                <h3 className={styles.iconCardTitle}>{f.title}</h3>
                <p className={styles.iconCardText}>{f.text}</p>
              </div>
            ))}
          </div>
          <div className={styles.callout} data-reveal data-delay="200">
            📞 Connect with our NRI advisory team on WhatsApp at <strong>+91 9176663200</strong> or write to <strong>customer.service@probridge.co.in</strong>.
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. HOW TO BUY
═══════════════════════════════════════════════════════════════ */
function HowToBuyView() {
  const STEPS = [
    { num: 1, title: 'Search & Shortlist Verified Listings', desc: 'Use ProBridge filters to search by city, locality, budget, configuration (1, 2, 3 BHK), possession timeline, and zero-brokerage direct owner homes.', img: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&q=80' },
    { num: 2, title: 'Schedule a Guided Site Visit', desc: 'Book convenient on-site inspections or live digital walkthroughs. Our relationship managers coordinate access with builders and owners.', img: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&q=80' },
    { num: 3, title: 'Legal Vetting & Title Verification', desc: 'Review RERA registrations, encumbrance certificates, layout approvals, and title deeds with our in-house legal advisory support.', img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80' },
    { num: 4, title: 'Home Loan Approval & Sanction', desc: 'Get fast-track approvals through our partnerships with leading banks (SBI, HDFC, ICICI, Axis) with the lowest home loan interest rates.', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
    { num: 5, title: 'Token Payment, Sale Deed & Key Handover', desc: 'Pay your booking amount securely, complete registered agreement to sale, and receive seamless key handover on possession day.', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
  ];
  return (
    <>
      <div className={styles.fullHero} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1600&q=80')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Breadcrumb label="How to Buy" />
          <span className={styles.heroTag}>Buyer Roadmap</span>
          <h1 className={styles.heroTitle}>How to Buy Property with ProBridge</h1>
          <p className={styles.heroSub}>A simple, transparent 5-step roadmap to discovering and purchasing your dream home without hidden surprises.</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitleCenter} data-reveal data-delay="0">Your 5-Step Journey to Home Ownership</h2>
          <div className={styles.timeline}>
            {STEPS.map((s, i) => (
              <div key={s.num} className={`${styles.timelineItem} ${i % 2 === 0 ? styles.timelineLeft : styles.timelineRight}`} data-reveal data-delay={i * 100}>
                <div className={styles.timelineImg}>
                  <img src={s.img} alt={s.title} />
                </div>
                <div className={styles.timelineConnector}>
                  <div className={styles.timelineNum}>{s.num}</div>
                  <div className={styles.timelineLine} />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
