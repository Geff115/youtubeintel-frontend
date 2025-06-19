'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Zap, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  ArrowRight,
  Shield,
  Clock,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCurrentUser, useCreditPackages } from '@/hooks/use-dashboard-data'

export default function CreditsPage() {
  const { data: userData, isLoading: userLoading } = useCurrentUser()
  const { data: packagesData, isLoading: packagesLoading } = useCreditPackages()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState('')

  const user = userData?.user

  const handlePurchase = async (packageId: string) => {
    if (!user?.email) {
      setPurchaseError('User email not found')
      return
    }

    setPurchaseLoading(packageId)
    setPurchaseError('')

    try {
      const response = await fetch('/api/purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          package_id: packageId,
          email: user.email
        })
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to Korapay checkout
        window.open(data.checkout_url, '_blank')
      } else {
        setPurchaseError(data.error || 'Purchase failed')
      }
    } catch (error) {
      setPurchaseError('Network error. Please try again.')
      console.error('Purchase error:', error)
    } finally {
      setPurchaseLoading(null)
    }
  }

  const features = [
    "Channel discovery across 6+ methods",
    "Advanced metadata analysis", 
    "Bulk processing capabilities",
    "Priority processing queue",
    "Data export in multiple formats",
    "Email support and assistance"
  ]

  if (userLoading || packagesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Credits & Billing
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Purchase credits to unlock powerful YouTube channel intelligence features
        </p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.credits_balance || 0} Credits
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Current balance • {user?.total_credits_purchased || 0} total purchased
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {purchaseError && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-400">
            {purchaseError}
          </AlertDescription>
        </Alert>
      )}

      {/* Credit Packages */}
      {packagesData?.packages && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Choose Your Credit Package
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(packagesData.packages).map(([packageId, packageInfo]: [string, any]) => {
              const isPopular = packageId === 'credits_500' // Most popular package
              const isPurchasing = purchaseLoading === packageId
              
              return (
                <Card key={packageId} className={`relative transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  isPopular ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20' : ''
                }`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{packageInfo.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        ${packageInfo.price_usd}
                      </div>
                      <div className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                        {packageInfo.credits.toLocaleString()} Credits
                      </div>
                      <div className="text-sm text-slate-500">
                        ${(packageInfo.price_usd / packageInfo.credits).toFixed(3)} per credit
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {packageInfo.description}
                    </div>
                    
                    <div className="space-y-2">
                      {packageInfo.features?.slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        isPopular 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                          : ''
                      }`}
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => handlePurchase(packageId)}
                      disabled={isPurchasing}
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Purchase Credits
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Secure Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Powered by Korapay</h3>
                <p className="text-sm text-slate-500">Secure payment processing</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>• SSL encrypted transactions</p>
              <p>• Multiple payment methods</p>
              <p>• Instant credit delivery</p>
              <p>• 24/7 transaction monitoring</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Choose Package</h4>
                  <p className="text-sm text-slate-500">Select the credit package that fits your needs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Secure Payment</h4>
                  <p className="text-sm text-slate-500">Complete payment through Korapay</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Instant Delivery</h4>
                  <p className="text-sm text-slate-500">Credits added to your account immediately</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Guide</CardTitle>
          <CardDescription>
            Understand how credits are used across different features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</div>
              <div className="font-medium">Credit</div>
              <div className="text-sm text-slate-500 mt-1">Channel Discovery</div>
            </div>
            
            <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">2</div>
              <div className="font-medium">Credits</div>
              <div className="text-sm text-slate-500 mt-1">Full Channel Analysis</div>
            </div>
            
            <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">5</div>
              <div className="font-medium">Credits</div>
              <div className="text-sm text-slate-500 mt-1">100 Channel Batch Process</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Tier Info */}
      {packagesData?.free_tier && (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle>Free Tier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">What's Included</h3>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <li>• {packagesData.free_tier.credits} free credits {packagesData.free_tier.renewable}</li>
                  <li>• Basic channel discovery</li>
                  <li>• Limited analytics access</li>
                  <li>• Email support</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Upgrade Benefits</h3>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Advanced discovery methods</li>
                  <li>• Bulk processing</li>
                  <li>• Priority support</li>
                  <li>• Data export features</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact for Larger Packages */}
      {packagesData?.larger_packages && (
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Need More Credits?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {packagesData.larger_packages.note}
            </p>
            <Button asChild variant="outline">
              <a href={`mailto:${packagesData.larger_packages.email}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Sales Team
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}