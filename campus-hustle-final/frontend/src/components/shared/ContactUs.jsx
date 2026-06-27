import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalNav, Button } from './index';

const ContactUs = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
    <GlobalNav />
    <main className="contact-page page-enter">
      <section className="contact-panel">
        <img src="/logo.svg" alt="HustleGrad" className="contact-logo" />
        <h1>Contact Us</h1>
        <p>
          For support, marketplace concerns, account help, or general feedback, reach the Campus
          Marketplace System team by email.
        </p>
        <a className="contact-email" href="mailto:campus.marketplace.system@gmail.com">
          campus.marketplace.system@gmail.com
        </a>
        <div style={{ marginTop: 24 }}>
          <Button onClick={() => window.location.href = 'mailto:campus.marketplace.system@gmail.com'}>
            Email Support
          </Button>
        </div>
        <Link to="/marketplace" className="contact-back">Back to marketplace</Link>
      </section>
    </main>
  </div>
);

export default ContactUs;
