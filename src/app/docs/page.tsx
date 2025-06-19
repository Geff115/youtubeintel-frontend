'use client'

import { useState } from 'react'
import { 
  Search, 
  BookOpen, 
  Code, 
  Zap, 
  Users, 
  BarChart3, 
  ExternalLink,
  ChevronRight,
  Play,
  Download,
  MessageCircle,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const quickStart = [
    {
      title: "1. Sign Up & Get Credits",
      description: "Create your account and receive 25 free credits to get started",
      icon: Users,
      time: "2 min"
    },
    {
      title: "2. Discover Channels",
      description: "Use our 6 discovery methods to find relevant channels in your niche",
      icon: Search,
      time: "5 min"
    },
    {
      title: "3. Analyze & Export",
      description: "Get detailed analytics and export your discoveries",
      icon: BarChart3,
      time: "3 min"
    }
  ]

  const features = [
    {
      title: "Channel Discovery",
      description: "6+ advanced methods to discover related channels",
      icon: Search,
      methods: ["SocialBlade Analysis", "Content Similarity", "Collaboration Detection", "Keyword Matching", "Audience Overlap", "Featured Channels"]
    },
    {
      title: "Deep Analytics",
      description: "Comprehensive metadata and performance analysis",
      icon: BarChart3,
      methods: ["Subscriber Growth", "Video Performance", "Content Analysis", "Publishing Patterns", "Engagement Metrics", "Trend Detection"]
    },
    {
      title: "Bulk Processing",
      description: "Process thousands of channels simultaneously",
      icon: Zap,
      methods: ["Batch Discovery", "Mass Metadata Fetch", "Bulk Video Analysis", "Automated Processing", "Queue Management", "Progress Tracking"]
    }
  ]

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/api/discover-channels",
      description: "Discover related channels using various methods",
      credits: "5 credits"
    },
    {
      method: "POST", 
      endpoint: "/api/fetch-metadata",
      description: "Fetch detailed channel metadata",
      credits: "10 credits"
    },
    {
      method: "POST",
      endpoint: "/api/fetch-videos", 
      description: "Analyze channel videos and content",
      credits: "15 credits"
    },
    {
      method: "GET",
      endpoint: "/api/stats",
      description: "Get your account statistics",
      credits: "Free"
    }
  ]

  const faqs = [
    {
      question: "How do discovery methods work?",
      answer: "Our platform uses 6 different methods including SocialBlade analysis, content similarity matching, collaboration detection, and audience overlap analysis to find channels related to your targets."
    },
    {
      question: "What's included in channel metadata?",
      answer: "We provide subscriber counts, video statistics, channel descriptions, keywords, topic categories, publishing schedules, and growth metrics for comprehensive analysis."
    },
    {
      question: "How does credit consumption work?",
      answer: "Credits are consumed based on the operation: 1 credit for discovery, 2 credits for full analysis, 5 credits for batch processing 100 channels. Free tier includes 25 credits monthly."
    },
    {
      question: "Can I export my discoveries?",
      answer: "Yes! Export your channel lists and analytics in CSV, JSON, or Excel formats. All exports include metadata, statistics, and discovery information."
    },
    {
      question: "What are the rate limits?",
      answer: "Rate limits vary by plan: Free (10 requests/hour), Starter (100/hour), Professional (500/hour), Enterprise (unlimited). Batch operations have separate limits."
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Documentation
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Everything you need to master YouTube channel intelligence
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="w-5 h-5 mr-2" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Get up and running with YouTubeIntel in under 10 minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickStart.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {step.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {step.time}
                    </Badge>
                  </div>
                </div>
                {index < quickStart.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Core Features
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <feature.icon className="w-5 h-5 mr-2" />
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.methods.map((method, methodIndex) => (
                    <div key={methodIndex} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{method}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Code className="w-5 h-5 mr-2" />
              API Reference
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://docs.youtubeintel.com" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Full API Docs
              </Link>
            </Button>
          </CardTitle>
          <CardDescription>
            Key endpoints for integrating YouTubeIntel into your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant={endpoint.method === 'GET' ? 'success' : 'info'}
                    className="font-mono"
                  >
                    {endpoint.method}
                  </Badge>
                  <div>
                    <code className="text-sm font-mono text-slate-900 dark:text-white">
                      {endpoint.endpoint}
                    </code>
                    <p className="text-sm text-slate-500 mt-1">
                      {endpoint.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {endpoint.credits}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Learning Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/tutorials" className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <h3 className="font-medium">Video Tutorials</h3>
                <p className="text-sm text-slate-500">Step-by-step video guides</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
            
            <Link href="/guides" className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <h3 className="font-medium">Best Practices</h3>
                <p className="text-sm text-slate-500">Tips for effective channel discovery</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
            
            <Link href="/case-studies" className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <h3 className="font-medium">Case Studies</h3>
                <p className="text-sm text-slate-500">Real-world success stories</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Downloads & Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <h3 className="font-medium">Postman Collection</h3>
                <p className="text-sm text-slate-500">API testing made easy</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <h3 className="font-medium">Python SDK</h3>
                <p className="text-sm text-slate-500">Official Python library</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <h3 className="font-medium">CSV Templates</h3>
                <p className="text-sm text-slate-500">Import/export templates</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Our support team is here to help you succeed with YouTubeIntel
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="mailto:support@youtubeintel.com">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/community" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Community
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}