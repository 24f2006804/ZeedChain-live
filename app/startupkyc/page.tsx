"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
export default function StartupKYCForm() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Founder Information
    founderName: "",
    founderEmail: "",
    founderPhone: "",
    aadharNumber: "",
    panNumber: "",
    walletAddress: "",
    selfieImage: null,
    
    // Financial Information
    annualRunRate: "",
    monthlyRunRate: "",
    cogs: "",
    marketingExpenses: "",
    cac: "",
    logistics: "",
    grossMargin: "",
    ebidta: "",
    pat: "",
    salaries: "",
    miscPercentage: "",
    gstNumber: "",
    
    // Additional Information
    ipfsLink: "",
    additionalNotes: ""
  })

  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Unable to access camera. Please ensure you have given camera permissions.")
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')
    setFormData(prev => ({ ...prev, selfieImage: dataUrl }))
    stopCamera()
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  // Add wallet verification
  const verifyWalletOwnership = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!')
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const walletAddress = accounts[0]
      
      // Check if wallet has already completed KYC
      const hasCompletedKYC = await checkWalletKYCStatus(walletAddress)
      if (hasCompletedKYC) {
        alert('This wallet has already completed KYC!')
        return
      }

      // Check if wallet already has a registered startup
      const hasStartup = await checkWalletStartup(walletAddress)
      if (hasStartup) {
        alert('This wallet already has a registered startup!')
        return
      }

      setFormData(prev => ({ ...prev, walletAddress }))
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    }
  }

  // Update Gross Margin when COGS changes
  useEffect(() => {
    if (formData.cogs && !isNaN(Number(formData.cogs))) {
      // Only auto-update if gross margin is empty or was previously auto-calculated
      const cogsValue = Number(formData.cogs)
      setFormData(prev => ({
        ...prev,
        grossMargin: (100 - cogsValue).toString()
      }))
    }
  }, [formData.cogs])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const submitForm = () => {
    setIsSubmitting(true)
    router.push('/create')
    // Bundle all data into a single payload
    const payload = {
      ...formData,
      // Calculate miscPercentage 
      miscPercentage: calculateMiscPercentage()
    }
    
    // Console log the payload
    console.log("Form payload:", payload)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Form submitted successfully!")
    }, 1500)
  }

  const calculateMiscPercentage = () => {
    const total = [
      'cogs', 'marketingExpenses', 'cac', 'logistics'
      , 'ebidta', 'pat', 'salaries'
    ].reduce((sum, field) => sum + (Number(formData[field]) || 0), 0)
    
    return (100 - total).toString()
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-3xl border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">Startup KYC Form</CardTitle>
              <CardDescription className="text-zinc-400">
                Complete the verification process for your startup
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "border border-zinc-700"}`}
              >
                {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
              </span>
              <Separator className="h-px w-6 bg-zinc-800" />
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "border border-zinc-700"}`}
              >
                {step > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
              </span>
              <Separator className="h-px w-6 bg-zinc-800" />
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "border border-zinc-700"}`}
              >
                "3"
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form>
            <form className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Founder Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input 
                        name="founderName"
                        value={formData.founderName}
                        onChange={handleChange}
                        placeholder="John Doe" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input 
                        name="founderEmail"
                        value={formData.founderEmail}
                        onChange={handleChange}
                        placeholder="john@example.com" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input 
                      name="founderPhone"
                      value={formData.founderPhone}
                      onChange={handleChange}
                      placeholder="9876543210" 
                      className="bg-zinc-800 border-zinc-700" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Aadhar Number</label>
                      <Input 
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        placeholder="123456789012" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                      <p className="text-xs text-zinc-500">Your 12-digit Aadhar number</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PAN Number</label>
                      <Input 
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        placeholder="ABCDE1234F" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                      <p className="text-xs text-zinc-500">Your 10-character PAN</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wallet Address</label>
                    <div className="flex gap-2">
                      <Input 
                        value={formData.walletAddress}
                        readOnly
                        placeholder="Connect your wallet"
                        className="bg-zinc-800 border-zinc-700 flex-1"
                      />
                      <Button 
                        type="button"
                        onClick={verifyWalletOwnership}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Connect Wallet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selfie Verification</label>
                    {showCamera ? (
                      <div className="space-y-2">
                        <video 
                          ref={videoRef}
                          autoPlay
                          className="w-full max-w-[320px] bg-zinc-800 rounded-lg"
                        />
                        <div className="flex gap-2">
                          <Button type="button" onClick={capturePhoto}>Capture</Button>
                          <Button type="button" variant="outline" onClick={stopCamera}>Cancel</Button>
                        </div>
                      </div>
                    ) : formData.selfieImage ? (
                      <div className="space-y-2">
                        <img 
                          src={formData.selfieImage} 
                          alt="Captured selfie"
                          className="w-full max-w-[320px] bg-zinc-800 rounded-lg"
                        />
                        <Button type="button" onClick={() => setFormData(prev => ({ ...prev, selfieImage: null }))}>
                          Retake
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" onClick={startCamera}>Take Selfie</Button>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Financial Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Annual Run Rate (ARR)</label>
                      <Input 
                        name="annualRunRate"
                        value={formData.annualRunRate}
                        onChange={handleChange}
                        placeholder="₹1,000,000" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monthly Run Rate (MRR)</label>
                      <Input 
                        name="monthlyRunRate"
                        value={formData.monthlyRunRate}
                        onChange={handleChange}
                        placeholder="₹83,333" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                    </div>
                  </div>

                  {/* Percentages Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* COGS */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">COGS (%)</label>
                      <Input 
                        name="cogs"
                        value={formData.cogs}
                        onChange={handleChange}
                        placeholder="%" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                      <p className="text-xs text-zinc-500">Gross Margin will be auto-calculated as (100-COGS)%</p>
                    </div>

                    {/* Gross Margin - Auto-calculated but still editable */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gross Margin (%)</label>
                      <Input 
                        name="grossMargin"
                        value={formData.grossMargin}
                        onChange={handleChange}
                        placeholder="%" 
                        className="bg-zinc-800 border-zinc-700" 
                      />
                      <p className="text-xs text-zinc-500">Auto-calculated as (100-COGS)%, but can be edited</p>
                    </div>

                    {/* Other percentage fields */}
                    {[
                      { name: "marketingExpenses", label: "Marketing Expenses (%)" },
                      { name: "cac", label: "CAC (%)" },
                      { name: "logistics", label: "Transport & Logistics (%) (Optional)" },
                      { name: "ebidta", label: "EBIDTA (%)" },
                      { name: "pat", label: "PAT (%)" },
                      { name: "salaries", label: "Salaries (%)" }
                    ].map((item) => (
                      <div key={item.name} className="space-y-2">
                        <label className="text-sm font-medium">{item.label}</label>
                        <Input 
                          name={item.name}
                          value={formData[item.name]}
                          onChange={handleChange}
                          placeholder="%" 
                          className="bg-zinc-800 border-zinc-700" 
                        />
                      </div>
                    ))}

                    {/* Misc Percentage - Auto Calculation */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Miscellaneous (%) (Auto-filled)</label>
                      <Input
                        name="miscPercentage"
                        value={calculateMiscPercentage()}
                        readOnly
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">GST Number (Optional)</label>
                    <Input
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <p className="text-xs text-zinc-500">Your 15-character GST identification number</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Additional Information</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">IPFS Link</label>
                    <div className="flex">
                      <Input
                        name="ipfsLink"
                        value={formData.ipfsLink}
                        onChange={handleChange}
                        placeholder="ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
                        className="bg-zinc-800 border-zinc-700 rounded-r-none"
                      />
                      <Button type="button" variant="secondary" className="rounded-l-none">
                        <Upload className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500">Link to any documents you wish to share</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Notes (Optional)</label>
                    <Textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      placeholder="Any additional information you'd like to share"
                      className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-zinc-800 pt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitForm}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}