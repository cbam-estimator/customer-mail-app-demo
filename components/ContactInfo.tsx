import { Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ContactInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4">
          <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-sm text-gray-500">contact@cbam-estimator.com</p>
            <p className="text-sm text-gray-500">support@cbam-estimator.com</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="font-medium">Phone</h3>
            <p className="text-sm text-gray-500">+49 (0) 123 456 789</p>
            <p className="text-sm text-gray-500">Mon-Fri, 9:00-17:00 CET</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="font-medium">Office Location</h3>
            <p className="text-sm text-gray-500">CBAM Estimator GmbH</p>
            <p className="text-sm text-gray-500">Hauptstraße 123</p>
            <p className="text-sm text-gray-500">10115 Berlin, Germany</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Location Map</h3>
          <div className="bg-gray-100 rounded-md h-[200px] flex items-center justify-center">
            <p className="text-gray-500 text-sm">Map placeholder</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
