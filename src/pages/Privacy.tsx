
import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';

const Privacy = () => {
  return (
    <PageTransition>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard>
              <div className="p-6 md:p-8">
                <h1 className="text-3xl font-bold mb-6 text-gradient">Privacy Policy</h1>
                <div className="space-y-6 text-muted-foreground">
                  <p>Last updated: {new Date().toLocaleDateString()}</p>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">1. Introduction</h2>
                    <p>
                      SyncTube Party ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our services.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">2. Information We Collect</h2>
                    <p>We collect information in the following ways:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>
                        <strong>Account Information:</strong> When you create an account, we collect your email address, username, and password.
                      </li>
                      <li>
                        <strong>Usage Information:</strong> We collect information about how you use our service, including the videos you watch, playlists you create, and rooms you join.
                      </li>
                      <li>
                        <strong>Device Information:</strong> We collect information about the device you use to access our service, including device type, operating system, and browser type.
                      </li>
                      <li>
                        <strong>Log Information:</strong> When you use our service, our servers automatically record certain information, including your IP address, browser type, and the pages you visit.
                      </li>
                    </ul>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">3. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>Provide, maintain, and improve our services.</li>
                      <li>Process and complete transactions.</li>
                      <li>Send you technical notices, updates, security alerts, and support messages.</li>
                      <li>Respond to your comments, questions, and requests.</li>
                      <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
                      <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
                      <li>Personalize and improve your experience using our services.</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">4. Sharing of Information</h2>
                    <p>
                      We may share information about you as follows or as otherwise described in this Privacy Policy:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>With other users in accordance with the privacy settings you choose.</li>
                      <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
                      <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process.</li>
                      <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of us or others.</li>
                      <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">5. Your Choices</h2>
                    <p>
                      You have several choices available when it comes to information about you:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>
                        <strong>Account Information:</strong> You may update, correct, or delete your account information at any time by logging into your account settings. If you wish to delete your account, please contact us.
                      </li>
                      <li>
                        <strong>Cookies:</strong> Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies.
                      </li>
                      <li>
                        <strong>Promotional Communications:</strong> You may opt out of receiving promotional emails from us by following the instructions in those emails.
                      </li>
                    </ul>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">6. Contact Us</h2>
                    <p>
                      If you have any questions about this Privacy Policy, please contact us at:
                      <br />
                      <a href="mailto:privacy@synctubeparty.com" className="text-accent hover:underline">privacy@synctubeparty.com</a>
                    </p>
                  </section>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Privacy;
