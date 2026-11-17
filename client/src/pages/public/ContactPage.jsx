import { useState } from 'react';
import { ArrowRight, CircleHelp, LockKeyhole, Mail, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/public/PageMeta.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';
import { getRequestErrorMessage, publicService } from '../../services/publicService.js';

export function ContactPage() {
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
      const response = await publicService.sendContactMessage({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        organization: formData.get('organization'),
        subject: formData.get('subject'),
        message: formData.get('message'),
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
      <PageMeta title="Contact" description="Send a message to the PTMS team or request access to a workspace." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner"><span className="public-eyebrow">We’re here to help</span><h1>Let’s get your team<br /><span>moving forward.</span></h1><p>Send a message to the PTMS administrators or request access to your organization’s workspace.</p></div>
      </section>
      <section className="public-section public-section-muted">
        <div className="public-container public-contact-layout">
          <aside className="public-contact-aside">
            <span className="public-eyebrow">Contact information</span><h2>Access is managed by your organization.</h2>
            <p>PTMS accounts are created by a system administrator. Submit an access request or, if your organization already uses PTMS, contact your administrator directly.</p>
            <div className="public-contact-info"><span><CircleHelp size={20} /></span><div><b>Need workspace access?</b><p>Submit a request for administrator review. A request does not create an account or grant access.</p><Link to="/request-access" className="public-text-link">Request access <ArrowRight size={14} /></Link></div></div>
            <div className="public-contact-info"><span><LockKeyhole size={20} /></span><div><b>Already have an account?</b><p>Sign in using your existing PTMS credentials.</p><Link to="/login" className="public-text-link">Go to sign in <ArrowRight size={14} /></Link></div></div>
            <div className="public-no-endpoint"><Mail size={18} /><span>Messages are stored for administrator review. PTMS does not currently send email notifications.</span></div>
          </aside>
          <div className="public-contact-card">
            <SectionHeading align="left" eyebrow="Send an inquiry" title="How can we help?" description="Submit your message to the PTMS administrators. Please do not include passwords or other sensitive information." />
            <form className="public-form" onSubmit={handleSubmit}>
              <div className="public-form-row">
                <label>Full name<input name="fullName" type="text" autoComplete="name" placeholder="Your name" minLength={2} maxLength={150} required /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@organization.com" maxLength={180} required /></label>
              </div>
              <label>Organization<input name="organization" type="text" autoComplete="organization" placeholder="Your organization" minLength={2} maxLength={180} required /></label>
              <label>Subject<select name="subject" defaultValue="" required><option value="" disabled>Select a topic</option><option value="access">Access question</option><option value="information">Product information</option><option value="other">Other question</option></select></label>
              <label>Message<textarea name="message" rows="5" placeholder="Tell us a little about your question..." minLength={10} maxLength={3000} required /></label>
              {error && <p className="public-form-notice public-form-error" role="alert"><MessageSquareText size={17} />{error}</p>}
              {success && <p className="public-form-notice public-form-success" role="status"><MessageSquareText size={17} />{success}</p>}
              <button type="submit" className="public-button" disabled={submitting}>{submitting ? 'Sending…' : 'Send message'} <ArrowRight size={17} /></button>
              <p className="public-form-footnote">Your message will be saved securely for administrator review.</p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
