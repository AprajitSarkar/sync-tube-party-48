
import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';

const Terms = () => {
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
                <h1 className="text-3xl font-bold mb-6 text-gradient">Terms and Conditions</h1>
                <div className="space-y-6 text-muted-foreground">
                  <p>Last updated: {new Date().toLocaleDateString()}</p>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">1. Acceptance of Terms</h2>
                    <p>
                      By accessing or using the SyncTube Party service, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">2. Description of Service</h2>
                    <p>
                      SyncTube Party is a service that allows users to watch YouTube videos together in synchronized rooms, chat with other users, and create and share playlists.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">3. User Accounts</h2>
                    <p>
                      To use certain features of the service, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>Provide accurate and complete information when creating your account.</li>
                      <li>Update your information to keep it accurate and complete.</li>
                      <li>Notify us immediately of any unauthorized use of your account or any other breach of security.</li>
                      <li>Ensure that you exit from your account at the end of each session.</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">4. User Content</h2>
                    <p>
                      When you submit, upload, or post content to SyncTube Party, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media. You represent and warrant that you own or control all rights to the content you post and that the content does not violate these Terms and Conditions.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">5. Prohibited Uses</h2>
                    <p>
                      You agree not to use the service:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
                      <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation.</li>
                      <li>To impersonate or attempt to impersonate SyncTube Party, a SyncTube Party employee, another user, or any other person or entity.</li>
                      <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the service, or which, as determined by us, may harm SyncTube Party or users of the service or expose them to liability.</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">6. Intellectual Property</h2>
                    <p>
                      The service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of SyncTube Party and its licensors. The service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of SyncTube Party.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">7. Termination</h2>
                    <p>
                      We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">8. Limitation of Liability</h2>
                    <p>
                      In no event shall SyncTube Party, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">9. Changes to Terms</h2>
                    <p>
                      We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">10. Contact Us</h2>
                    <p>
                      If you have any questions about these Terms, please contact us at:
                      <br />
                      <a href="mailto:terms@synctubeparty.com" className="text-accent hover:underline">terms@synctubeparty.com</a>
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

export default Terms;
