import { useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/public/PageMeta.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';
import { getRequestErrorMessage, publicService } from '../../services/publicService.js';

export function RequestAccessPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await publicService.submitAccessRequest({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        organization: formData.get('organization'),
        jobTitle: formData.get('jobTitle'),
        phone: formData.get('phone') || undefined,
        reason: formData.get('reason'),
      });
      setSuccess(response.data.message);
      form.reset();
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta title="Request access" description="Request access to PTMS for administrator review. Submitting a request does not create an account or assign a role." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner"><span className="public-eyebrow">Request workspace access</span><h1>Tell us about<br /><span>your team’s needs.</span></h1><p>Send an access request for an administrator to review. Public visitors cannot assign themselves a role or create an account.</p></div>
      </section>
      <section className="public-section public-section-muted">
        <div className="public-container public-contact-layout">
          <aside className="public-contact-aside">
            <span className="public-eyebrow">What happens next</span><h2>Your request goes to a system administrator.</h2>
            <p>An administrator reviews your organization and reason for access. If approved, they select an appropriate role and send you a secure, expiring invitation.</p>
            <div className="public-contact-info"><span><ShieldCheck size={20} /></span><div><b>Role assigned by an administrator</b><p>You cannot request or grant yourself system administrator or other privileged access.</p></div></div>
            <div className="public-contact-info"><span><LockKeyhole size={20} /></span><div><b>Request is not an account</b><p>Submitting this form does not create an account or provide access to PTMS.</p><Link to="/login" className="public-text-link">Already invited? Sign in <ArrowRight size={14} /></Link></div></div>
          </aside>
          <div className="public-contact-card">
            <SectionHeading align="left" eyebrow="Access request" title="Share a few details" description="Your request will be stored for administrator review. Fields marked required must be completed." />
            <form className="public-form" onSubmit={handleSubmit}>
              <div className="public-form-row">
                <label>Full name<input name="fullName" type="text" autoComplete="name" placeholder="Your name" minLength={2} maxLength={150} required /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@organization.com" maxLength={180} required /></label>
              </div>
              <label>Organization<input name="organization" type="text" autoComplete="organization" placeholder="Your organization" minLength={2} maxLength={180} required /></label>
              <div className="public-form-row">
                <label>Job title<input name="jobTitle" type="text" autoComplete="organization-title" placeholder="Your role at the organization" minLength={2} maxLength={120} required /></label>
                <label>Phone number <span className="public-optional">(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" maxLength={30} /></label>
              </div>
              <label>Why are you requesting access?<textarea name="reason" rows="5" placeholder="Tell us how you plan to use PTMS..." minLength={10} maxLength={3000} required /></label>
              {error && <p className="public-form-notice public-form-error" role="alert">{error}</p>}
              {success && <p className="public-form-notice public-form-success" role="status">{success}</p>}
              <button type="submit" className="public-button" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit access request'} <ArrowRight size={17} /></button>
              <p className="public-form-footnote">Your details are only used to review this request. Do not include passwords or other sensitive information.</p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
