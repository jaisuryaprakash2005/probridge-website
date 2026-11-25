import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Building2, PhoneCall, ShieldCheck,
  ChevronRight, MapPin, Mail, Clock,
  CheckCircle2, Award, Sparkles, Send,
  Users, TrendingUp, Globe, Heart,
  X, Upload, Star, Calendar,
  ExternalLink, BookOpen, FileText, Download,
  Eye, User as UserIcon, ArrowLeft, Share2, Check
} from 'lucide-react';
import styles from './InfoPage.module.css';
import { useAuth } from '../context/AuthContext';
import { getCareers, applyForCareer, getBlogs, getBlogById, sendEnquiry, getContactStatus, getBridgeGuides } from '../services/api';

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
  const params = useParams();
  const pathSlug = location.pathname.replace(/^\//, '');
  const currentSlug = pathSlug || page || 'about-us';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  useScrollReveal();

  const { user, openLoginModal } = useAuth();

  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  // Whenever account changes or user logs out, refresh "Send Us a Message" field
  useEffect(() => {
    if (!user) {
      setContactSubmitted(false);
      setSubmissionInfo(null);
      setFormData({ name: '', phone: '', email: '', message: '' });
      return;
    }

    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      message: '',
    });

    const userKey = user._id || user.id;
    const phoneKey = user.phone;
    const emailKey = user.email;

    let locallySubmitted = false;
    let savedData = null;

    if (userKey && localStorage.getItem(`pb_contact_submitted_${userKey}`) === 'true') {
      locallySubmitted = true;
      try { savedData = JSON.parse(localStorage.getItem(`pb_contact_sub_data_${userKey}`)); } catch (_) {}
    } else if (phoneKey && localStorage.getItem(`pb_contact_submitted_${phoneKey}`) === 'true') {
      locallySubmitted = true;
      try { savedData = JSON.parse(localStorage.getItem(`pb_contact_sub_data_${phoneKey}`)); } catch (_) {}
    } else if (emailKey && localStorage.getItem(`pb_contact_submitted_${emailKey}`) === 'true') {
      locallySubmitted = true;
      try { savedData = JSON.parse(localStorage.getItem(`pb_contact_sub_data_${emailKey}`)); } catch (_) {}
    }

    if (locallySubmitted) {
      setContactSubmitted(true);
      if (savedData) setSubmissionInfo(savedData);
    } else {
      setContactSubmitted(false);
      setSubmissionInfo(null);
      getContactStatus({ phone: user.phone, email: user.email })
        .then((res) => {
          if (res.data?.submitted) {
            setContactSubmitted(true);
            if (userKey) localStorage.setItem(`pb_contact_submitted_${userKey}`, 'true');
            if (phoneKey) localStorage.setItem(`pb_contact_submitted_${phoneKey}`, 'true');
            if (emailKey) localStorage.setItem(`pb_contact_submitted_${emailKey}`, 'true');
            if (res.data?.enquiry) {
              const enq = res.data.enquiry;
              const rec = {
                name: enq.senderName || user.name,
                phone: enq.senderPhone || user.phone,
                email: enq.senderEmail || user.email,
                date: new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              };
              setSubmissionInfo(rec);
              if (userKey) localStorage.setItem(`pb_contact_sub_data_${userKey}`, JSON.stringify(rec));
              else if (phoneKey) localStorage.setItem(`pb_contact_sub_data_${phoneKey}`, JSON.stringify(rec));
            }
          }
        })
        .catch(() => { });
    }
  }, [user]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }
    if (!formData.name?.trim() || !formData.phone?.trim()) return;
    setContactSubmitting(true);

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = (formData.email || '').trim();
    const trimmedMessage = formData.message?.trim() || 'General inquiry submitted from Contact Us page';

    const payload = {
      name: trimmedName,
      senderName: trimmedName,
      phone: trimmedPhone,
      senderPhone: trimmedPhone,
      email: trimmedEmail,
      senderEmail: trimmedEmail,
      message: trimmedMessage,
      isContactUs: true,
      source: 'contact_us',
      requestType: 'contact_us',
      type: 'contact_us',
      propertyTitle: 'Contact Us Submission',
      title: `Contact Us Message from ${trimmedName}`,
      subject: 'Website Contact Inquiry',
      contactUsSubject: 'Website Contact Inquiry',
    };

    try {
      await sendEnquiry(payload);

      const userKey = user._id || user.id;
      const phoneKey = trimmedPhone;
      const emailKey = trimmedEmail;

      if (userKey) localStorage.setItem(`pb_contact_submitted_${userKey}`, 'true');
      if (phoneKey) localStorage.setItem(`pb_contact_submitted_${phoneKey}`, 'true');
      if (emailKey) localStorage.setItem(`pb_contact_submitted_${emailKey}`, 'true');

      const subRecord = {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        message: trimmedMessage,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      if (userKey) localStorage.setItem(`pb_contact_sub_data_${userKey}`, JSON.stringify(subRecord));
      else if (phoneKey) localStorage.setItem(`pb_contact_sub_data_${phoneKey}`, JSON.stringify(subRecord));
      setSubmissionInfo(subRecord);

      // Also persist to localStorage so Admin Dashboard demo/local state picks it up
      try {
        const stored = localStorage.getItem('probridge_store_leads');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({
          _id: 'lead-contact-' + Date.now(),
          id: 'lead-contact-' + Date.now(),
          senderName: payload.name,
          senderPhone: payload.phone,
          senderEmail: payload.email,
          message: payload.message,
          propertyTitle: 'Contact Us Submission',
          type: 'contact_us',
          requestType: 'contact_us',
          isContactUs: true,
          source: 'contact_us',
          status: 'New',
          subject: 'Website Contact Inquiry',
          contactUsSubject: 'Website Contact Inquiry',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('probridge_store_leads', JSON.stringify(list));
      } catch (_) { }

      setContactSubmitted(true);
    } catch (err) {
      console.warn('[ContactUs] submission warning:', err);
      setContactSubmitted(true);
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrap}>
      {renderPageContent(currentSlug, {
        formData, setFormData, contactSubmitted, contactSubmitting, submissionInfo, handleContactSubmit,
      }, params)}
    </div>
  );
}

function renderPageContent(slug, contactState, params) {
  const parts = slug.split('/').filter(Boolean);
  const root = parts[0] || 'about-us';
  const detailId = params?.id || (parts.length > 1 ? parts[1] : null);

  if (root === 'blogs' || root === 'blog') {
    if (detailId) {
      return <BlogDetailView blogId={detailId} />;
    }
    return <BlogsView />;
  }
  switch (root) {
    case 'about-us': return <AboutUsView />;
    case 'careers': return <CareersView />;
    case 'contact-us': return <ContactUsView {...contactState} />;
    case 'privacy': return <PrivacyPolicyView />;
    case 'bridgeguide':
    case 'guide': return <PropGuideView />;
    case 'nri-services': return <NriServicesView />;
    case 'how-to-buy': return <HowToBuyView />;
    default: return <AboutUsView />;
  }
}

/* ─€─€ Breadcrumb helper ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
// eslint-disable-next-line no-unused-vars
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
          {/* <Breadcrumb label="About Us" /> */}
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
  const getCareerImage = (role) => {
    if (role?.image && typeof role.image === 'string' && role.image.trim()) {
      return role.image;
    }
    const text = `${role?.title || ''} ${role?.department || role?.dept || ''}`.toLowerCase();
    if (text.includes('react') || text.includes('engineer') || text.includes('tech') || text.includes('frontend') || text.includes('developer')) {
      return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80';
    }
    if (text.includes('marketing') || text.includes('growth') || text.includes('social') || text.includes('brand')) {
      return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80';
    }
    if (text.includes('verif') || text.includes('field') || text.includes('inspect') || text.includes('site')) {
      return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80';
    }
    if (text.includes('advisor') || text.includes('sales') || text.includes('portfolio') || text.includes('consultant')) {
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
  };

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

  const [careersList, setCareersList] = useState([]);
  const [, setLoadingCareers] = useState(true);

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
        if (active) {
          // Connected with database: show ONLY database value (or default roles if none added yet)
          setCareersList(results.length > 0 ? results : DEFAULT_ROLES);
        }
      })
      .catch((err) => {
        console.warn('Could not connect to database, showing dummy career listings:', err.message);
        // Disconnected from database: fallback to dummy data
        if (active) setCareersList(DEFAULT_ROLES);
      })
      .finally(() => {
        if (active) setLoadingCareers(false);
      });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {/* <Breadcrumb label="Careers" /> */}
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
                      <img
                        src={getCareerImage(role)}
                        alt={role.title}
                        className={styles.roleImg}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
                        }}
                      />
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
function ContactUsView({ formData, setFormData, contactSubmitted, contactSubmitting, submissionInfo, handleContactSubmit }) {
  return (
    <>
      <div
        className={styles.fullHero}
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80')` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {/* <Breadcrumb label="Contact Us" /> */}
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
              { icon: <MapPin size={22} />, label: 'Corporate Office', val: '314,IT Plaza - Nadd Hessa,Dubai Silicon Oasis,Dubai' },
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
              <div className={styles.mapHeaderRow}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Find Us</h2>
                  <p style={{ margin: '4px 0 0', color: '#6D857C', fontSize: 13 }}>
                    ProBridge Corporate Headquarters
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=314,+IT+Plaza+-+Nadd+Hessa,+Dubai+Silicon+Oasis,+Dubai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.openMapBtn}
                  title="Open location in Google Maps"
                >
                  <MapPin size={16} />
                  <span>Open Map</span>
                  <ExternalLink size={13} style={{ marginLeft: 2, opacity: 0.85 }} />
                </a>
              </div>
              <iframe
                title="ProBridge Office Location - 314, IT Plaza, Dubai Silicon Oasis, Dubai"
                src="https://maps.google.com/maps?q=314,%20IT%20Plaza%20-%20Nadd%20Hessa,%20Dubai%20Silicon%20Oasis,%20Dubai&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className={styles.mapIframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className={styles.mapAddressBanner}>
                <MapPin size={16} color="#0D5F4E" style={{ flexShrink: 0 }} />
                <span>314, IT Plaza - Nadd Hessa, Dubai Silicon Oasis, Dubai</span>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.formWrap} data-reveal data-delay="100">
              <h2 className={styles.sectionTitle}>Send Us a Message</h2>
              {contactSubmitted ? (
                <div className={styles.submittedCard}>
                  <div className={styles.submittedHeader}>
                    <div className={styles.submittedIconWrap}>
                      <CheckCircle2 size={26} color="#0D5F4E" />
                    </div>
                    <div>
                      <div className={styles.submittedBadge}>Request Already Registered</div>
                      <h3 className={styles.submittedTitle}>Inquiry Already Submitted</h3>
                    </div>
                  </div>

                  <p className={styles.submittedDesc}>
                    Thank you, <strong>{submissionInfo?.name || formData.name || 'valued customer'}</strong>! Your inquiry has already been received and logged in our system. Each account is limited to one active inquiry at a time.
                  </p>

                  <div className={styles.submittedDetailsBox}>
                    <div className={styles.submittedDetailRow}>
                      <span className={styles.submittedLabel}>Contact Name:</span>
                      <span className={styles.submittedVal}>{submissionInfo?.name || formData.name || 'Valued Client'}</span>
                    </div>
                    <div className={styles.submittedDetailRow}>
                      <span className={styles.submittedLabel}>Phone Number:</span>
                      <span className={styles.submittedVal}>{submissionInfo?.phone || formData.phone || '+91 9176663200'}</span>
                    </div>
                    {(submissionInfo?.email || formData.email) && (
                      <div className={styles.submittedDetailRow}>
                        <span className={styles.submittedLabel}>Email:</span>
                        <span className={styles.submittedVal}>{submissionInfo?.email || formData.email}</span>
                      </div>
                    )}
                    {submissionInfo?.date && (
                      <div className={styles.submittedDetailRow}>
                        <span className={styles.submittedLabel}>Date Submitted:</span>
                        <span className={styles.submittedVal}>{submissionInfo.date}</span>
                      </div>
                    )}
                    <div className={styles.submittedDetailRow}>
                      <span className={styles.submittedLabel}>Account Limit:</span>
                      <span className={styles.submittedVal}>1 submission per account (Completed)</span>
                    </div>
                    <div className={styles.submittedDetailRow}>
                      <span className={styles.submittedLabel}>Status:</span>
                      <span className={styles.submittedStatusBadge}>Assigned to Senior Advisor</span>
                    </div>
                  </div>

                  <div className={styles.submittedNoteBox}>
                    <p style={{ margin: 0, fontSize: 13, color: '#166534', lineHeight: 1.5 }}>
                      📞 <strong>Need immediate assistance?</strong> Since your inquiry is already registered, you can also speak directly with our senior advisory desk at{' '}
                      <a href="tel:+919176663200" style={{ color: '#0D5F4E', fontWeight: 700 }}>+91 9176663200</a>{' '}
                      or email <a href="mailto:info@probridge.co.in" style={{ color: '#0D5F4E', fontWeight: 700 }}>info@probridge.co.in</a>.
                    </p>
                  </div>
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
                  <button type="submit" className={styles.submitBtn} disabled={contactSubmitting}>
                    <Send size={15} style={{ verticalAlign: -2, marginRight: 6 }} />
                    {contactSubmitting ? 'Sending Message...' : 'Submit Message'}
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
      <div className={styles.fullHero} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {/* <Breadcrumb label="Privacy Policy" /> */}
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
  const { user, openLoginModal } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [readingGuide, setReadingGuide] = useState(null);

  const handleReadGuide = (e, guide) => {
    if (!user) {
      if (e) e.preventDefault();
      openLoginModal();
      return;
    }
  };

  const handlePreviewGuide = (guide) => {
    if (!user) {
      openLoginModal();
      return;
    }
    setReadingGuide(guide);
  };

  const handleDownloadPdf = (e) => {
    if (!user) {
      if (e) e.preventDefault();
      openLoginModal();
      return;
    }
  };

  const getSafePdfUrl = (guide, forDownload = false) => {
    if (!guide) return '#';
    const publicSamplePdf = `${process.env.PUBLIC_URL || ''}/probridge-guide.pdf`;

    // 1. If explicit downloadUrl is set and reachable
    if (forDownload && guide.downloadUrl) {
      if (!guide.downloadUrl.includes('localhost') || window.location.hostname === 'localhost') {
        return guide.downloadUrl;
      }
    }

    // 2. If fileUrl is set and reachable
    if (guide.fileUrl) {
      if (!guide.fileUrl.includes('localhost') || window.location.hostname === 'localhost') {
        return forDownload ? `${guide.fileUrl}?download=true` : guide.fileUrl;
      }
    }

    const raw = guide.pdfUrl || '';

    // 3. If it's a Cloudinary raw upload, check if backend proxy is reachable
    if (raw.includes('res.cloudinary.com') && raw.includes('/raw/upload/') && !raw.includes('/api/cloudinary.com')) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiBase = process.env.REACT_APP_API_URL || (isLocal ? 'http://localhost:5001/api' : '');
      const guideId = guide._id || guide.id;
      if (apiBase && guideId) {
        return `${apiBase}/bridge-guides/file/${guideId}${forDownload ? '?download=true' : ''}`;
      }
      return publicSamplePdf;
    }

    // 4. If raw is empty or blocked w3.org dummy URL, use bundled local PDF
    if (!raw || raw === '#' || raw.includes('w3.org')) {
      return publicSamplePdf;
    }

    return raw;
  };

  const CATEGORY_IMAGES = {
    'Legal & Verification': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    'Buyer Handbook': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'Financial Planning': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    'NRI Investment': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'Tax & Stamp Duty': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&q=80',
    'Home Construction Guide': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
    'General': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  };

  useEffect(() => {
    getBridgeGuides()
      .then(({ data }) => {
        const list = data?.guides || [];
        setGuides(list);
      })
      .catch((err) => {
        console.error('Failed to load bridge guides:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(guides.map((g) => g.category).filter(Boolean)))];

  const filteredGuides = activeCategory === 'All'
    ? guides
    : guides.filter((g) => (g.category || '').toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      <div className={styles.fullHero} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1600&q=80')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {/* <Breadcrumb label="Bridge Guide" /> */}
          <span className={styles.heroTag}>Real Estate Knowledge Hub</span>
          <h1 className={styles.heroTitle}>Bridgeguide by ProBridge</h1>
          <p className={styles.heroSub}>Expert guides, legal insights, taxation tips, and downloadable PDF handbooks to help you make confident real estate investment decisions.</p>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }} data-reveal data-delay="0">
                Official Bridge Guides &amp; Handbooks ({filteredGuides.length})
              </h2>
              <p style={{ margin: '4px 0 0', color: '#6D857C', fontSize: 13.5 }}>
                Curated by senior property legal advisors. Click &quot;Read Guide&quot; to open the full PDF handbook.
              </p>
            </div>
            {/* <Link to="/blogs" className={styles.readMoreBtn} style={{ fontSize: '14.5px', fontWeight: 800 }}>
              Read ProBridge Blogs &amp; Market Insights →
            </Link> */}
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className={styles.blogFilterPills} style={{ marginBottom: 28 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.blogFilterPill} ${activeCategory === cat ? styles.blogFilterPillActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6D857C' }}>
              Loading Bridge Guides...
            </div>
          ) : filteredGuides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6D857C' }}>
              No guides found in this category.
            </div>
          ) : (
            <div className={styles.guideGrid}>
              {filteredGuides.map((guide, i) => {
                const coverImg = guide.image ||
                  CATEGORY_IMAGES[guide.category] ||
                  CATEGORY_IMAGES['Buyer Handbook'];

                return (
                  <div key={guide._id || guide.id || i} className={styles.guideCard} data-reveal data-delay={i * 80}>
                    <div className={styles.guideImgWrap}>
                      <img
                        src={coverImg}
                        alt={guide.title}
                        className={styles.guideImg}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = CATEGORY_IMAGES['Buyer Handbook'];
                        }}
                      />
                      <div className={styles.articleImgOverlay} />
                      <span className={styles.articleCat}>{guide.category || 'Buyer Handbook'}</span>
                      <span className={styles.guidePdfBadge}>
                        <FileText size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                        PDF
                      </span>
                    </div>

                    <div className={styles.guideBody}>
                      <div className={styles.guideDocMeta}>
                        <span className={styles.guideFileName}>
                          📄 {guide.fileName || 'guide.pdf'}
                        </span>
                        {guide.fileSize && (
                          <span className={styles.guideFileSize}>({guide.fileSize})</span>
                        )}
                      </div>

                      <h3 className={styles.guideTitle}>{guide.title}</h3>
                      <p className={styles.guideDesc}>{guide.description}</p>

                      <div className={styles.guideActionRow}>
                        {/* Primary button: Click to go directly to PDF page */}
                        <a
                          href={getSafePdfUrl(guide)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.readGuidePrimaryBtn}
                          title={`Read PDF: ${guide.title}`}
                          onClick={(e) => handleReadGuide(e, guide)}
                        >
                          <BookOpen size={15} />
                          <span>Read Guide</span>
                          <ExternalLink size={13} style={{ marginLeft: 3, opacity: 0.85 }} />
                        </a>

                        {/* Secondary button: In-page quick preview */}
                        <button
                          type="button"
                          className={styles.readGuidePreviewBtn}
                          onClick={() => handlePreviewGuide(guide)}
                          title="Preview guide in browser"
                        >
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>

                        {/* Download button */}
                        {guide.pdfUrl && (
                          <a
                            href={getSafePdfUrl(guide, true)}
                            download={guide.fileName || 'guide.pdf'}
                            className={styles.guideDownloadBtn}
                            title="Download PDF Handbook"
                            onClick={(e) => handleDownloadPdf(e)}
                          >
                            <Download size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── PDF Guide In-Page Reader Modal ── */}
      {readingGuide && (
        <div className={styles.modalBackdrop} onClick={() => setReadingGuide(null)}>
          <div
            className={`${styles.modalBox} ${styles.guideModalBox}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setReadingGuide(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className={styles.guideModalHeader}>
              <div>
                <span className={styles.articleCat} style={{ position: 'static', display: 'inline-block', marginBottom: 6 }}>
                  {readingGuide.category || 'Buyer Handbook'}
                </span>
                <h3 className={styles.guideModalTitle}>{readingGuide.title}</h3>
                <p className={styles.guideModalMeta}>
                  📄 {readingGuide.fileName || 'guide.pdf'} {readingGuide.fileSize ? `(${readingGuide.fileSize})` : ''}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href={getSafePdfUrl(readingGuide)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.openMapBtn}
                  style={{ textDecoration: 'none' }}
                  onClick={(e) => handleReadGuide(e, readingGuide)}
                >
                  <ExternalLink size={14} />
                  <span>Open PDF Page</span>
                </a>
                <a
                  href={getSafePdfUrl(readingGuide, true)}
                  download={readingGuide.fileName || 'guide.pdf'}
                  className={styles.guideDownloadBtnModal}
                  onClick={(e) => handleDownloadPdf(e)}
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>
              {readingGuide.description}
            </p>

            <div className={styles.guideIframeWrap}>
              <iframe
                src={getSafePdfUrl(readingGuide)}
                title={readingGuide.title}
                className={styles.guideIframe}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   6.5. BRIDGEGUIDE BLOGS & ARTICLES (From Admin Dashboard)
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
function BlogsView() {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const handleReadArticle = (blog) => {
    if (!user) {
      openLoginModal();
      return;
    }
    const targetId = blog._id || blog.slug || blog.id;
    navigate(`/blogs/${targetId}`);
  };

  useEffect(() => {
    getBlogs()
      .then(({ data }) => {
        const list = data?.blogs || [];
        setBlogs(list);
      })
      .catch((err) => {
        console.error('Failed to load blogs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))];

  const filteredBlogs = activeCategory === 'All'
    ? blogs
    : blogs.filter((b) => (b.category || '').toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      {/* ── Hero Banner ── */}
      <div
        className={styles.fullHero}
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80')` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.breadcrumbBar}>
            <div className={styles.breadcrumbInner}>
              <Link to="/" className={styles.breadLink}>Home</Link>
              <ChevronRight size={13} />
              <Link to="/guide" className={styles.breadLink}>BridgeGuide</Link>
              <ChevronRight size={13} />
              <span className={styles.breadCurrent}>Blogs</span>
            </div>
          </div>
          <span className={styles.heroTag}>Knowledge &amp; Insights</span>
          <h1 className={styles.heroTitle}>BridgeGuide Blogs &amp; Articles</h1>
          <p className={styles.heroSub}>
            Real estate market intelligence, RERA compliance, high-yielding commercial assets, and sustainable architecture tips published by ProBridge experts.
          </p>
        </div>
      </div>

      {/* ── Category Filter Bar & Content ── */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.blogFilterHeader}>
            <div>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 6 }}>All Articles</h2>
              <p className={styles.sectionSub} style={{ margin: 0 }}>
                Explore expert articles curated to give you clarity and maximum investment ROI
              </p>
            </div>
            {/* Category Pills */}
            <div className={styles.blogFilterPills}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.blogFilterPill} ${activeCategory === cat ? styles.blogFilterPillActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6D857C' }}>
              Loading articles...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6D857C' }}>
              No articles found in this category.
            </div>
          ) : (
            <div className={styles.blogGrid}>
              {filteredBlogs.map((blog, i) => {
                const factors = Array.isArray(blog.keyfactors)
                  ? blog.keyfactors
                  : (typeof blog.keyfactors === 'string' ? blog.keyfactors.split('\n').filter(Boolean) : []);

                const formattedDate = blog.createdAt
                  ? new Date(blog.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                  : null;

                return (
                  <article
                    key={blog._id || blog.slug || i}
                    className={styles.blogCard}
                    data-reveal
                    data-delay={i * 60}
                  >
                    <div
                      className={styles.blogImgWrap}
                      onClick={() => handleReadArticle(blog)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={blog.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
                        alt={blog.title}
                        className={styles.blogImg}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
                        }}
                      />
                      <div className={styles.articleImgOverlay} />
                      <span className={styles.articleCat}>{blog.category || 'Article'}</span>
                    </div>

                    <div className={styles.blogBody}>
                      <div className={styles.blogMetaRow}>
                        <span className={styles.blogMetaAuthor}>
                          <UserIcon size={11} style={{ display: 'inline', marginRight: 3 }} />
                          {blog.author || 'ProBridge Editorial'}
                        </span>
                        {formattedDate && (
                          <span className={styles.blogMetaDate}>
                            <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />
                            {formattedDate}
                          </span>
                        )}
                        <span className={styles.articleReadTime}>{blog.readTime || '5 min'}</span>
                      </div>

                      <h3
                        className={styles.blogTitle}
                        onClick={() => handleReadArticle(blog)}
                        style={{ cursor: 'pointer' }}
                      >
                        {blog.title}
                      </h3>
                      <p className={styles.blogDesc}>{blog.description}</p>

                      {factors.length > 0 && (
                        <div className={styles.blogFactorsCompact}>
                          ✦ {factors[0]}
                        </div>
                      )}

                      <button
                        type="button"
                        className={styles.blogReadBtn}
                        onClick={() => handleReadArticle(blog)}
                      >
                        Read Article →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </>
  );
}

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   6.6. BLOG ARTICLE DETAILS PAGE (Dedicated Article View)
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
function BlogDetailView({ blogId }) {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    let active = true;
    setLoading(true);

    getBlogById(blogId)
      .then(({ data }) => {
        if (!active) return;
        setBlog(data?.blog || null);
      })
      .catch((err) => {
        console.error('Failed to load blog article:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    getBlogs()
      .then(({ data }) => {
        if (!active) return;
        const all = data?.blogs || [];
        setRelatedBlogs(all.filter((b) => (b._id || b.slug || b.id) !== blogId).slice(0, 3));
      })
      .catch(() => {});

    return () => { active = false; };
  }, [blogId]);

  const handleShare = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: blog?.title || 'ProBridge Article', url: currentUrl }).catch(() => { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className={styles.section} style={{ textAlign: 'center', padding: '120px 20px' }}>
        <div className={styles.loadingSpinner} />
        <p style={{ marginTop: 16, color: '#6D857C', fontSize: 15, fontWeight: 600 }}>Loading article details...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.section} style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className={styles.sectionInner}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F241D', marginBottom: 12 }}>Article Not Found</h2>
          <p style={{ color: '#6D857C', marginBottom: 24, fontSize: 15 }}>
            The requested article could not be located or may have been updated.
          </p>
          <Link to="/blogs" className={styles.backPillBtn}>
            <ArrowLeft size={16} /> Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  const factors = Array.isArray(blog.keyfactors)
    ? blog.keyfactors
    : String(blog.keyfactors || '').split('\n').map((s) => s.trim()).filter(Boolean);

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const paragraphs = String(blog.description || '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {/* ── Article Header Banner ── */}
      <div className={styles.blogDetailHero}>
        <div className={styles.blogDetailHeroInner}>
          <div className={styles.blogDetailTopNav}>
            <Link to="/blogs" className={styles.backPillBtn}>
              <ArrowLeft size={15} /> All Articles
            </Link>
            <div className={styles.breadcrumbBar} style={{ padding: 0, background: 'none' }}>
              <div className={styles.breadcrumbInner}>
                <Link to="/" className={styles.breadLink}>Home</Link>
                <ChevronRight size={13} />
                <Link to="/guide" className={styles.breadLink}>BridgeGuide</Link>
                <ChevronRight size={13} />
                <Link to="/blogs" className={styles.breadLink}>Blogs</Link>
                <ChevronRight size={13} />
                <span className={styles.breadCurrent}>{blog.title.slice(0, 32)}...</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <span className={styles.articleCatBadge}>{blog.category || 'Real Estate Analysis'}</span>
            <h1 className={styles.blogDetailPageTitle}>{blog.title}</h1>

            <div className={styles.blogDetailMetaRow}>
              <div className={styles.blogDetailMetaLeft}>
                <span className={styles.blogMetaAuthorDetail}>
                  <UserIcon size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: -2 }} />
                  {blog.author || 'ProBridge Editorial'}
                </span>
                {formattedDate && (
                  <span className={styles.blogMetaDateDetail}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: -2 }} />
                    {formattedDate}
                  </span>
                )}
                <span className={styles.blogMetaTimeDetail}>
                  <Clock size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: -2 }} />
                  {blog.readTime || '5 min read'}
                </span>
              </div>

              <button type="button" className={styles.blogShareBtn} onClick={handleShare} title="Share article link">
                {copied ? <Check size={14} color="#10B981" /> : <Share2 size={14} />}
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Article Body Content ── */}
      <div className={styles.blogDetailMainSection}>
        <div className={styles.blogDetailContentWrap}>
          {/* Cover Photo */}
          {blog.image && (
            <div className={styles.blogDetailImgWrap}>
              <img
                src={blog.image}
                alt={blog.title}
                className={styles.blogDetailImg}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80';
                }}
              />
              <span className={styles.blogDetailImgOverlayCat}>{blog.category || 'Article'}</span>
            </div>
          )}

          {/* Login Gate Protection: if user is not logged in, prompt them to log in */}
          {!user ? (
            <div className={styles.blogLoginGateCard}>
              <div className={styles.blogLoginGateIconWrap}>
                <ShieldCheck size={28} color="#0D5F4E" />
              </div>
              <h3 className={styles.blogLoginGateTitle}>Sign In to Read Full Article</h3>
              <p className={styles.blogLoginGateDesc}>
                This premium real estate analysis is exclusively available for verified ProBridge members. Log in or create a free account to unlock all insights and market trends.
              </p>
              <button
                type="button"
                className={styles.blogLoginGateBtn}
                onClick={openLoginModal}
              >
                Log In to Unlock Article
              </button>
            </div>
          ) : (
            <>
              {/* Full Article Text */}
              <div className={styles.blogDetailBodyText}>
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, idx) => (
                    <p key={idx} className={idx === 0 ? styles.blogDetailLeadPara : styles.blogDetailPara}>
                      {p}
                    </p>
                  ))
                ) : (
                  <p className={styles.blogDetailLeadPara}>{blog.description}</p>
                )}
              </div>

              {/* Key Factors & Strategic Highlights Box */}
              {factors.length > 0 && (
                <div className={styles.blogDetailFactorsCard}>
                  <div className={styles.blogDetailFactorsHeader}>
                    <div className={styles.factorsIconCircle}>
                      <Sparkles size={18} color="#0D5F4E" />
                    </div>
                    <div>
                      <h4 className={styles.blogDetailFactorsTitle}>Key Factors &amp; Strategic Highlights</h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#6D857C' }}>
                        Crucial takeaways verified by ProBridge property consultants.
                      </p>
                    </div>
                  </div>
                  <ul className={styles.blogDetailFactorsList}>
                    {factors.map((f, i) => (
                      <li key={i} className={styles.blogDetailFactorItem}>
                        <CheckCircle2 size={18} className={styles.factorCheckIcon} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advisory Consultation Card */}
              <div className={styles.blogDetailCtaCard}>
                <div>
                  <h4 className={styles.blogDetailCtaTitle}>Need Tailored Guidance on this Topic?</h4>
                  <p className={styles.blogDetailCtaText}>
                    Connect with our dedicated real estate portfolio managers for verified developer due-diligence and site visits.
                  </p>
                </div>
                <Link to="/contact-us" className={styles.blogDetailCtaBtn}>
                  Speak with an Advisor →
                </Link>
              </div>
            </>
          )}

          {/* Bottom Navigation */}
          <div className={styles.blogDetailBottomNav}>
            <Link to="/blogs" className={styles.backPillBtn}>
              <ArrowLeft size={15} /> Back to All Articles
            </Link>
            <button type="button" className={styles.blogShareBtn} onClick={handleShare}>
              {copied ? <Check size={14} color="#10B981" /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Related Articles ── */}
      {relatedBlogs.length > 0 && (
        <div className={styles.sectionAlt} style={{ padding: '60px 0 80px' }}>
          <div className={styles.sectionInner}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className={styles.heroTag} style={{ marginBottom: 4 }}>Keep Exploring</span>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Related Articles &amp; Insights</h2>
              </div>
              <Link to="/blogs" className={styles.readMoreBtn} style={{ fontSize: 13.5 }}>
                View All Articles →
              </Link>
            </div>

            <div className={styles.blogGrid}>
              {relatedBlogs.map((rb) => {
                const targetId = rb._id || rb.slug || rb.id;
                return (
                  <article key={targetId} className={styles.blogCard}>
                    <div
                      className={styles.blogImgWrap}
                      onClick={() => {
                        if (!user) {
                          openLoginModal();
                          return;
                        }
                        navigate(`/blogs/${targetId}`);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={rb.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'} alt={rb.title} className={styles.blogImg} />
                      <div className={styles.articleImgOverlay} />
                      <span className={styles.articleCat}>{rb.category || 'Article'}</span>
                    </div>

                    <div className={styles.blogBody}>
                      <div className={styles.blogMetaRow}>
                        <span className={styles.blogMetaAuthor}>{rb.author || 'ProBridge Editorial'}</span>
                        <span className={styles.articleReadTime}>{rb.readTime || '5 min'}</span>
                      </div>
                      <h3
                        className={styles.blogTitle}
                        onClick={() => {
                          if (!user) {
                            openLoginModal();
                            return;
                          }
                          navigate(`/blogs/${targetId}`);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {rb.title}
                      </h3>
                      <p className={styles.blogDesc}>{rb.description}</p>
                      <button
                        type="button"
                        className={styles.blogReadBtn}
                        onClick={() => {
                          if (!user) {
                            openLoginModal();
                            return;
                          }
                          navigate(`/blogs/${targetId}`);
                        }}
                      >
                        Read Article →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
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
          {/* <Breadcrumb label="NRI Services" /> */}
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
          {/* <Breadcrumb label="How to Buy" /> */}
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
