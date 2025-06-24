'use client'

import React, { useState, useEffect } from 'react'
import { Search, Play, Loader2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useWebSocket } from '@/components/websocket-provider'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/use-dashboard-data'

interface DiscoveryMethod {
  id: string
  name: string
  description: string
  credits: number
  confidence: string
  estimated_time: string
  enabled: boolean
}

const discoveryMethods: DiscoveryMethod[] = [
  {
    id: 'socialblade',
    name: 'SocialBlade Analysis',
    description: 'Find similar channels using SocialBlade rankings and categories',
    credits: 2,
    confidence: 'High',
    estimated_time: '2-3 min',
    enabled: true
  },
  {
    id: 'content_similarity',
    name: 'Content Similarity',
    description: 'AI-powered content analysis to find channels with similar topics',
    credits: 3,
    confidence: 'Very High',
    estimated_time: '3-5 min',
    enabled: true
  },
  {
    id: 'collaboration_detection',
    name: 'Collaboration Detection',
    description: 'Discover channels through collaboration and cross-promotion analysis',
    credits: 2,
    confidence: 'Medium',
    estimated_time: '2-4 min',
    enabled: true
  },
  {
    id: 'keyword_search',
    name: 'Keyword Matching',
    description: 'Find channels using extracted keywords and tags',
    credits: 1,
    confidence: 'Medium',
    estimated_time: '1-2 min',
    enabled: true
  },
  {
    id: 'audience_overlap',
    name: 'Audience Overlap',
    description: 'Identify channels with similar audience demographics',
    credits: 4,
    confidence: 'High',
    estimated_time: '4-6 min',
    enabled: false // Premium feature
  },
  {
    id: 'featured_channels',
    name: 'Featured Channels',
    description: 'Extract channels from featured/recommended sections',
    credits: 1,
    confidence: 'Low',
    estimated_time: '1-2 min',
    enabled: true
  }
]

export default function DiscoveryPageWithWebSocket() {
  const [sourceChannels, setSourceChannels] = useState('')
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['socialblade', 'content_similarity'])
  const [limit, setLimit] = useState(50)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  
  const { connected, subscribeToJob, jobUpdates, discoveryResults } = useWebSocket()
  const { data: userData } = useCurrentUser()
  const router = useRouter()

  // Calculate total credits needed
  const totalCredits = selectedMethods.reduce((total, methodId) => {
    const method = discoveryMethods.find(m => m.id === methodId)
    return total + (method?.credits || 0)
  }, 0)

  // Get current job progress
  const currentJob = currentJobId 
    ? jobUpdates.find(job => job.job_id === currentJobId)
    : null

  // Listen for discovery completion
  useEffect(() => {
    if (currentJobId && discoveryResults.length > 0) {
      const latestResult = discoveryResults[0]
      if (latestResult.job_id === currentJobId) {
        setIsDiscovering(false)
        setCurrentJobId(null)
        // Redirect to channels page to see results
        router.push('/dashboard/channels')
      }
    }
  }, [discoveryResults, currentJobId, router])

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    )
  }

  const handleDiscovery = async () => {
    if (!sourceChannels.trim() || selectedMethods.length === 0) {
      return
    }

    // Check if user has enough credits
    const userCredits = userData?.user?.credits_balance || 0
    if (userCredits < totalCredits) {
      alert(`Insufficient credits. You need ${totalCredits} credits but have ${userCredits}.`)
      router.push('/dashboard/credits')
      return
    }

    setIsDiscovering(true)

    try {
      // Parse channel IDs/URLs
      const channelIds = sourceChannels
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Extract channel ID from various YouTube URL formats
          if (line.includes('youtube.com/channel/')) {
            return line.split('youtube.com/channel/')[1].split('/')[0]
          } else if (line.includes('youtube.com/@')) {
            return line.split('youtube.com/@')[1].split('/')[0]
          } else if (line.includes('youtube.com/c/')) {
            return line.split('youtube.com/c/')[1].split('/')[0]
          } else if (line.match(/^[A-Za-z0-9_-]{24}$/)) {
            // Already a channel ID
            return line
          } else {
            // Treat as handle/username
            return line
          }
        })

      const response = await fetch('/api/discover-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          source_channel_ids: channelIds,
          methods: selectedMethods,
          limit: limit
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Discovery failed')
      }

      // Subscribe to job updates
      setCurrentJobId(data.job_id)
      subscribeToJob(data.job_id)

    } catch (error) {
      console.error('Discovery error:', error)
      alert('Discovery failed. Please try again.')
      setIsDiscovering(false)
    }
  }

  const getProgressMessage = () => {
    if (!currentJob) return 'Initializing discovery...'
    
    if (currentJob.status === 'running') {
      return `${currentJob.message || 'Processing'} (${currentJob.progress || 0}%)`
    }
    
    return currentJob.message || currentJob.status
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Discover Channels
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Find related YouTube channels using advanced discovery methods
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {connected ? 'Real-time updates connected' : 'Connecting to real-time updates...'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Channels</CardTitle>
              <CardDescription>
                Enter YouTube channel URLs, IDs, or handles (one per line)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                placeholder="https://youtube.com/@channelname&#10;UCChannelID123456789&#10;@anotherchannel"
                value={sourceChannels}
                onChange={(e) => setSourceChannels(e.target.value)}
                disabled={isDiscovering}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {sourceChannels.split('\n').filter(line => line.trim()).length} channels entered
                </span>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Limit:</label>
                  <Input
                    type="number"
                    min="10"
                    max="200"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                    className="w-20"
                    disabled={isDiscovering}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discovery Methods</CardTitle>
              <CardDescription>
                Select which methods to use for channel discovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discoveryMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border border-slate-200 dark:border-slate-700 rounded-lg p-4 ${
                      !method.enabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={method.id}
                        checked={selectedMethods.includes(method.id)}
                        onCheckedChange={() => handleMethodToggle(method.id)}
                        disabled={!method.enabled || isDiscovering}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor={method.id}
                            className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer"
                          >
                            {method.name}
                          </label>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {method.credits} credits
                            </Badge>
                            <Badge 
                              variant={method.confidence === 'Very High' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {method.confidence}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {method.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          Est. {method.estimated_time}
                        </p>
                        {!method.enabled && (
                          <Badge variant="outline" className="text-xs mt-2">
                            Premium Feature
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Action Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Source Channels:
                </span>
                <span className="text-sm font-medium">
                  {sourceChannels.split('\n').filter(line => line.trim()).length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Methods Selected:
                </span>
                <span className="text-sm font-medium">
                  {selectedMethods.length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Discovery Limit:
                </span>
                <span className="text-sm font-medium">
                  {limit} channels
                </span>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Total Credits:
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {totalCredits}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Your Balance:
                  </span>
                  <span className="text-sm font-medium">
                    {userData?.user?.credits_balance || 0}
                  </span>
                </div>
              </div>

              {isDiscovering && currentJob && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Discovery in Progress
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentJob.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {getProgressMessage()}
                  </p>
                  {currentJob.status === 'failed' && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">
                        {currentJob.error || 'Discovery failed'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleDiscovery}
                disabled={
                  isDiscovering ||
                  !sourceChannels.trim() ||
                  selectedMethods.length === 0 ||
                  (userData?.user?.credits_balance || 0) < totalCredits
                }
                className="w-full"
              >
                {isDiscovering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Start Discovery
                  </>
                )}
              </Button>

              {(userData?.user?.credits_balance || 0) < totalCredits && (
                <p className="text-xs text-red-600 text-center">
                  Insufficient credits. Purchase more to continue.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Discoveries */}
          {discoveryResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Recent Discoveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discoveryResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {result.channel_count} channels found
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          via {result.discovery_method}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}