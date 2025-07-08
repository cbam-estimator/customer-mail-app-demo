"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, BarChart } from "lucide-react"

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("emissions")

  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="mt-8 mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-semibold">Insights</CardTitle>
        </CardHeader>
        <CardContent className="border-t pt-4">
          <Tabs defaultValue="emissions" onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6 bg-gray-200 p-1">
              <TabsTrigger
                value="emissions"
                className="flex items-center gap-2 flex-1 py-2 px-4 text-base data-[state=active]:bg-gray-800 data-[state=active]:text-white transition-all duration-200 ease-in-out"
              >
                <BarChart className="h-4 w-4" />
                <span>Emissions</span>
              </TabsTrigger>
              <TabsTrigger
                value="forecast"
                className="flex items-center gap-2 flex-1 py-2 px-4 text-base data-[state=active]:bg-gray-800 data-[state=active]:text-white transition-all duration-200 ease-in-out"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Forecast</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emissions" className="p-4 bg-white rounded-lg border min-h-[500px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">Emissions Daten</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Hier werden zukünftig Emissionsdaten und Analysen angezeigt.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forecast" className="p-4 bg-white rounded-lg border min-h-[500px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">Prognosen</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Hier werden zukünftig Prognosen und Vorhersagen angezeigt.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
