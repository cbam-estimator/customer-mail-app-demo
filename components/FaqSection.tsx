"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqItems = [
  {
    question: "What is CBAM?",
    answer:
      "The Carbon Border Adjustment Mechanism (CBAM) is a climate measure that puts a fair price on the carbon emitted during the production of carbon-intensive goods that are entering the EU. It encourages cleaner industrial production in non-EU countries and ensures that the EU's climate policies don't push carbon-intensive production outside Europe.",
  },
  {
    question: "When does CBAM come into effect?",
    answer:
      "CBAM has a transitional phase that started on October 1, 2023. During this phase, importers must report the embedded emissions in their goods without paying a financial adjustment. The definitive phase with financial adjustments will begin in January 2026.",
  },
  {
    question: "Which products are covered by CBAM?",
    answer:
      "CBAM initially covers imports of cement, iron and steel, aluminium, fertilizers, electricity, and hydrogen. The scope may be extended to other goods in the future.",
  },
  {
    question: "How does the CBAM Estimator help with compliance?",
    answer:
      "Our CBAM Estimator tool helps importers calculate the embedded emissions in their products, manage supplier data, generate reports for compliance, and forecast potential financial impacts of CBAM on their business.",
  },
  {
    question: "How accurate are the emissions calculations?",
    answer:
      "Our calculations follow the methodologies prescribed by the EU Commission for CBAM compliance. The accuracy depends on the quality of data provided by suppliers. We continuously update our algorithms to align with the latest regulatory guidance.",
  },
  {
    question: "Can I export CBAM reports directly from the tool?",
    answer:
      "Yes, the CBAM Estimator allows you to generate and export compliant reports in various formats that can be submitted to the relevant authorities.",
  },
  {
    question: "Is my data secure in the CBAM Estimator?",
    answer:
      "Absolutely. We implement industry-standard security measures to protect your data. All information is encrypted both in transit and at rest, and we never share your data with third parties without your explicit consent.",
  },
]

export function FaqSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
