
import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/common/PageTransition';

const PrivacyPolicy = () => {
  return (
    <PageTransition>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
          
          <GlassCard>
            <div className="p-6 md:p-8">
              <h1 className="text-3xl font-bold mb-6 text-gradient">Privacy Policy</h1>
              
              <div className="space-y-6 text-foreground/90">
                <p>
                  Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                  <p className="mb-3">
                    Welcome to WatchTube ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the application.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
                  <p className="mb-3">We may collect information that you provide directly to us, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (email address, username, password)</li>
                    <li>Profile information (display name, profile picture)</li>
                    <li>Communication information (messages sent within the platform)</li>
                    <li>Content information (playlists, room preferences)</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
                  <p className="mb-3">We may use the information we collect for various purposes, including to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Create and manage your account</li>
                    <li>Process transactions</li>
                    <li>Send you technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Sharing Your Information</h2>
                  <p className="mb-3">We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Service providers who perform services on our behalf</li>
                    <li>Other users (for collaborative features like chat and shared rooms)</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information. 
                    However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
                  <p className="mb-3">Depending on your location, you may have certain rights regarding your personal information, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and update your information</li>
                    <li>Request deletion of your information</li>
                    <li>Object to processing of your information</li>
                    <li>Data portability</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Changes to This Privacy Policy</h2>
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at cozmoim@gmail.com.
                  </p>
                </section>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;
