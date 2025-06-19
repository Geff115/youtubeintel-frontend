'use client'

import { Download, FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Export Data
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Download your channel discoveries and analytics data
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Export functionality will be available after we implement the channel management system.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export Options
            </CardTitle>
            <CardDescription>
              Choose your preferred export format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">CSV Export</h3>
                    <p className="text-sm text-slate-500">Spreadsheet compatible</p>
                  </div>
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">JSON Export</h3>
                    <p className="text-sm text-slate-500">For developers</p>
                  </div>
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Channel metadata</li>
              <li>• Subscriber counts</li>
              <li>• Discovery methods used</li>
              <li>• Analysis timestamps</li>
              <li>• Custom tags and notes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}