
import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/common/PageTransition';

const TermsConditions = () => {
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
              <h1 className="text-3xl font-bold mb-6 text-gradient">Terms & Conditions</h1>
              
              <div className="space-y-6 text-foreground/90">
                <p>
                  Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Agreement to Terms</h2>
                  <p>
                    By accessing or using SyncTube Party ("the Service"), you agree to be bound by these Terms and Conditions ("Terms"). 
                    If you disagree with any part of the terms, you may not access the Service.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
                  <p>
                    SyncTube Party is a service that allows users to watch YouTube videos synchronously with others, 
                    communicate via chat, and manage shared playlists. The Service is provided "as is" and "as available" without warranties of any kind.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Accounts</h2>
                  <p className="mb-3">
                    When you create an account with us, you must provide accurate, complete, and current information.
                    Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                  </p>
                  <p className="mb-3">
                    You are responsible for safeguarding the password and for all activities that occur under your account.
                    You agree not to disclose your password to any third party.
                  </p>
                  <p>
                    You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">User Conduct</h2>
                  <p className="mb-3">You agree not to use the Service to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on the rights of others</li>
                    <li>Share harmful, obscene, or offensive content</li>
                    <li>Impersonate any person or entity</li>
                    <li>Interfere with or disrupt the Service</li>
                    <li>Attempt to gain unauthorized access to the Service</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
                  <p>
                    The Service and its original content, features, and functionality are owned by SyncTube Party and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Third-Party Content</h2>
                  <p>
                    Our Service allows you to watch videos from YouTube. We do not host any of the videos displayed through our Service.
                    All content remains the property of YouTube and its content creators, and we do not claim any ownership of such content.
                    You must comply with YouTube's terms of service when using our Service.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Termination</h2>
                  <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
                    Upon termination, your right to use the Service will immediately cease.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
                  <p>
                    In no event shall SyncTube Party, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
                  <p>
                    We reserve the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.
                    Your continued use of the Service following the posting of any changes constitutes acceptance of those changes.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                  <p>
                    If you have any questions about these Terms, please contact us at support@synctubeparty.com.
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

export default TermsConditions;
