'use client'

import React, { useState, useEffect } from 'react'
import { Play, BarChart3, Search, Zap, Shield, Globe, Check, Menu, X, Star, ArrowRight, Database } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Search,
      title: "Intelligent Discovery",
      description: "Find related channels using 6+ advanced discovery methods powered by AI",
      color: "bg-blue-500"
    },
    {
      icon: BarChart3,
      title: "Deep Analytics", 
      description: "Comprehensive metadata analysis for millions of channels with real-time insights",
      color: "bg-green-500"
    },
    {
      icon: Zap,
      title: "Batch Processing",
      description: "Process thousands of channels simultaneously with enterprise-grade performance",
      color: "bg-purple-500"
    },
    {
      icon: Database,
      title: "Scalable Architecture",
      description: "Handle 5-15M channels with optimized cloud infrastructure",
      color: "bg-orange-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "JWT authentication, rate limiting, and SOC2 compliant infrastructure",
      color: "bg-red-500"
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Worldwide deployment with 99.9% uptime and lightning-fast response times",
      color: "bg-indigo-500"
    }
  ]

  const stats = [
    { value: "15M+", label: "Channels Analyzed" },
    { value: "500K+", label: "Discoveries Made" },
    { value: "99.9%", label: "Uptime" },
    { value: "50ms", label: "Avg Response" }
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      credits: "25",
      period: "month",
      features: [
        "25 credits monthly",
        "Basic channel discovery",
        "Limited analytics",
        "Email support"
      ],
      popular: false,
      cta: "Get Started"
    },
    {
      name: "Starter",
      price: "9",
      credits: "100",
      period: "month",
      features: [
        "100 credits included",
        "Advanced discovery methods",
        "Full analytics suite",
        "Priority support",
        "Data export"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "39",
      credits: "500",
      period: "month", 
      features: [
        "500 credits included",
        "Bulk processing",
        "API access",
        "Advanced analytics",
        "Custom integrations"
      ],
      popular: false,
      cta: "Go Professional"
    },
    {
      name: "Enterprise",
      price: "499",
      credits: "10,000",
      period: "month",
      features: [
        "10,000 credits included",
        "White-label solutions",
        "Dedicated support",
        "Custom features",
        "SLA guarantee"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                YouTubeIntel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Pricing
              </a>
              <a href="#docs" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Docs
              </a>
              <ThemeToggle />
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-slate-600 dark:text-slate-300">Features</a>
              <a href="#pricing" className="block text-slate-600 dark:text-slate-300">Pricing</a>
              <a href="#docs" className="block text-slate-600 dark:text-slate-300">Docs</a>
              <Link href="/auth/signin" className="block">
                <Button variant="ghost" className="w-full justify-start">Sign In</Button>
              </Link>
              <Link href="/auth/signup" className="block">
                <Button className="w-full gradient-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10,000+ content creators
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Discover YouTube's
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hidden Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Professional YouTube channel intelligence platform for creators, marketers, and researchers. 
              Discover, analyze, and scale with AI-powered insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need for YouTube Intelligence
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              From channel discovery to deep analytics, our platform provides enterprise-grade tools 
              for YouTube intelligence gathering and analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How YouTubeIntel Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Simple, powerful, and scalable YouTube intelligence in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Input Target Channels",
                description: "Start with any YouTube channel you want to analyze or find similar channels to. Our AI-powered system begins the discovery process.",
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "2", 
                title: "AI-Powered Discovery",
                description: "Our 6 discovery methods analyze content, collaborations, and audience overlap to find relevant channels you never knew existed.",
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "3",
                title: "Actionable Insights", 
                description: "Get comprehensive analytics, export data, and turn discoveries into actionable strategies for growth and partnerships.",
                color: "from-green-500 to-green-600"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Choose Your Intelligence Level
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              From hobbyists to enterprises, we have the right plan for your YouTube intelligence needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      /{plan.period}
                    </span>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 font-medium mb-6">
                    {plan.credits} credits included
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        : 'border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              All plans include our core features. Need something custom?
            </p>
            <Button variant="link" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
              Contact our sales team →
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Unlock YouTube's Intelligence?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators, marketers, and researchers who trust YouTubeIntel 
            for their channel intelligence needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">YouTubeIntel</span>
              </div>
              <p className="text-slate-400">
                Professional YouTube channel intelligence for the modern creator economy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/guides" className="hover:text-white transition-colors">Guides</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 YouTubeIntel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}