
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Play, ArrowDown, Smartphone, Shield, List, Globe, MessageSquare, ExternalLink } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import PageTransition from '@/components/common/PageTransition';

const Landing = () => {
  const features = [
    { 
      icon: <Play className="text-accent" />,
      title: "Watch Together", 
      description: "Sync YouTube videos with friends in real-time" 
    },
    { 
      icon: <MessageSquare className="text-accent" />,
      title: "Live Chat", 
      description: "Chat with friends while watching videos together" 
    },
    { 
      icon: <List className="text-accent" />,
      title: "Shared Playlists", 
      description: "Create and manage shared video playlists" 
    },
    { 
      icon: <Shield className="text-accent" />,
      title: "Personal Library", 
      description: "Save favorite videos to your personal playlist" 
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[85vh] px-4 md:px-8 py-10 relative overflow-hidden">
          {/* Background animated circles */}
          <motion.div 
            className="absolute w-[500px] h-[500px] bg-accent/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute w-[300px] h-[300px] bg-accent/10 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut",
            }}
          />

          <div className="z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center subtle-glow"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                >
                  <Play size={36} className="text-accent ml-2" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-accent/10 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1.8],
                    opacity: [0.3, 0.1, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeOut"
                  }}
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-4 text-gradient"
            >
              Sync Tube Party
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8"
            >
              Watch YouTube videos together with friends in real-time, chat, and create shared playlists.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/auth">
                <CustomButton variant="glow" size="lg">
                  Get Started
                </CustomButton>
              </Link>
              <Link to="/download">
                <CustomButton variant="outline" size="lg">
                  <Smartphone size={18} />
                  Download App
                </CustomButton>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="cursor-pointer"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ArrowDown size={24} className="text-muted-foreground" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the joy of watching videos together with these amazing features
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="h-full">
                    <div className="flex flex-col items-center text-center p-2">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 md:px-8 bg-accent/5">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Ready to Watch Together?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already enjoying synchronized video experiences with friends and family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <CustomButton variant="glow" size="lg">
                  Sign Up Now
                </CustomButton>
              </Link>
              <Link to="/download">
                <CustomButton variant="outline" size="lg">
                  <Smartphone size={18} />
                  Get the App
                </CustomButton>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 md:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <Play className="text-accent mr-2" />
              <span className="font-bold text-lg">SyncTube Party</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/download" className="text-muted-foreground hover:text-foreground transition-colors">
                Download
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SyncTube Party
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Landing;
