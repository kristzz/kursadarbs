'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Video, 
  Briefcase,
  Globe,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Heart,
  UserPlus,
  Search
} from 'lucide-react';

export default function Home() {
  const t = useTranslations('Home');
  const params = useParams();
  const locale = params.locale as string;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Search,
      title: "Smart Job Search",
      description: "Browse through carefully curated job opportunities that match your skills and career goals."
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Chat directly with recruiters and employers in real-time without leaving the platform."
    },
    {
      icon: FileText,
      title: "Profile Builder",
      description: "Create comprehensive professional profiles that showcase your skills and experience."
    },
    {
      icon: Video,
      title: "Video Interviews",
      description: "Conduct seamless video interviews directly through our platform."
    },
    {
      icon: Briefcase,
      title: "Task Management",
      description: "Complete pre-interview tasks and showcase your skills to potential employers."
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Build connections with industry professionals and expand your network."
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-bgc via-bgc to-primaryc/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primaryc/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-textc mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-textc/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              {t('description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href={`/${locale}/jobs`}
                className="group bg-primaryc hover:bg-primaryc/90 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border-0 shadow-none outline-none no-underline-effect"
              >
                Find Your Dream Job
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href={`/${locale}/auth/register`}
                className="group bg-primaryc/10 text-primaryc hover:bg-primaryc hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-none outline-none no-underline-effect"
              >
                Join as Employer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-textc mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-textc/70 max-w-3xl mx-auto">
              From job search to career growth, we've got all the tools you need to succeed in your professional journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-br from-primaryc/5 to-primaryc/10 backdrop-blur-sm rounded-2xl p-8 hover:from-primaryc/10 hover:to-primaryc/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-primaryc/20"
              >
                <div className="bg-primaryc/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primaryc/30 transition-colors">
                  <feature.icon className="w-8 h-8 text-primaryc" />
                </div>
                <h3 className="text-xl font-bold text-textc mb-4">
                  {feature.title}
                </h3>
                <p className="text-textc/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-r from-primaryc/5 to-primaryc/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-textc mb-6">
              How Paidn Works
            </h2>
            <p className="text-xl text-textc/70 max-w-3xl mx-auto">
              Get started in just a few simple steps and unlock your career potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up for free and choose whether you're looking for work or hiring talent."
              },
              {
                step: "02",
                title: "Build Your Profile",
                description: "Create a comprehensive profile showcasing your skills, experience, and career goals."
              },
              {
                step: "03",
                title: "Browse Opportunities",
                description: "Explore job listings posted by verified employers or find talented candidates."
              },
              {
                step: "04",
                title: "Connect Directly",
                description: "Use our messaging system to communicate directly with potential matches."
              },
              {
                step: "05",
                title: "Complete Tasks",
                description: "Showcase your abilities through pre-interview tasks and assessments."
              },
              {
                step: "06",
                title: "Succeed Together",
                description: "Find the perfect match and build lasting professional relationships."
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-primaryc text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-textc mb-4">
                  {step.title}
                </h3>
                <p className="text-textc/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primaryc to-primaryc/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join thousands of professionals who have already found their dream jobs through Paidn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href={`/${locale}/auth/register`}
              className="group bg-white text-primaryc hover:bg-white/90 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border-0 shadow-none outline-none no-underline-effect"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href={`/${locale}/jobs`}
              className="group bg-white/10 text-white hover:bg-white hover:text-primaryc px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-none outline-none no-underline-effect"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-textc/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-textc mb-4">Paidn</h3>
              <p className="text-textc/70 mb-6 max-w-md">
                The all-in-one platform where perfect jobs find perfect candidates. 
                Build your career with confidence.
              </p>
              <div className="flex space-x-4">
                {[Globe, Heart, Shield].map((Icon, index) => (
                  <div key={index} className="w-10 h-10 bg-primaryc/10 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primaryc" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-textc mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-textc/70">
                <li><Link href={`/${locale}/jobs`} className="hover:text-primaryc transition-colors">Browse Jobs</Link></li>
                <li><Link href={`/${locale}/profile`} className="hover:text-primaryc transition-colors">Build Profile</Link></li>
                <li><Link href={`/${locale}/messages`} className="hover:text-primaryc transition-colors">Messages</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-textc mb-4">For Employers</h4>
              <ul className="space-y-2 text-textc/70">
                <li><Link href={`/${locale}/auth/register`} className="hover:text-primaryc transition-colors">Post Jobs</Link></li>
                <li><Link href={`/${locale}/profile`} className="hover:text-primaryc transition-colors">Company Profile</Link></li>
                <li><Link href={`/${locale}/messages`} className="hover:text-primaryc transition-colors">Find Talent</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-textc/10 mt-12 pt-8 text-center text-textc/60">
            <p>&copy; 2024 Paidn. All rights reserved. Built with ❤️ for your career success.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
