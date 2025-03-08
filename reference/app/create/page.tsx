"use client"
// StartupCreatePage.tsx
import React, { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { PlusCircle, X, Plus, Trash, Upload, Link, Image } from 'lucide-react';

// This would typically be in a separate file (types.ts)
export interface StartupListing {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  tags: string[];
  links: {
    website?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
  investmentGoal: {
    amount: number;
    raised: number;
    currency: string;
  };
  equityoffered: {
    amount: number;
  }
}

// Function to create and store startup data (would be in a separate utility file)
export const createStartup = (startup: StartupListing): void => {
  // In a real application, this would connect to a database or API
  localStorage.setItem(`startup-${startup.id}`, JSON.stringify(startup));
  console.log(`Created startup: ${startup.name}`);
};

const StartupCreatePage: React.FC = () => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<StartupListing>>({
    name: '',
    description: '',
    logo: '',
    banner: '',
    tags: [],
    links: {
      website: '',
      twitter: '',
    },
    investmentGoal: {
      amount: 50,
      raised: 0,
      currency: 'ETH'
    },
    equityoffered: {
      amount: 0
    }
  });
  
  const [newTag, setNewTag] = useState('');
  const [newLinkKey, setNewLinkKey] = useState('');
  const [newLinkValue, setNewLinkValue] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [logoUploadMethod, setLogoUploadMethod] = useState<'link' | 'upload'>('link');
  const [bannerUploadMethod, setBannerUploadMethod] = useState<'link' | 'upload'>('link');
  
  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleLinkChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      links: { ...formData.links, [key]: value }
    });
  };
  
  const handleInvestmentChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      investmentGoal: { ...(formData.investmentGoal || { amount: 50, raised: 0, currency: 'ETH' }), [field]: value }
    });
  };

  const handleEquityChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      equityoffered: { ...(formData.equityoffered || { amount: 0 }), [field]: value }
    });
  };
  
  const handleFileUpload = (field: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server and get back a URL
      // For this demo, we'll use a local object URL
      const localUrl = URL.createObjectURL(file);
      setFormData({ ...formData, [field]: localUrl });
    }
  };
  
  const addNewLink = () => {
    if (newLinkKey && newLinkValue) {
      setFormData({
        ...formData,
        links: { ...formData.links, [newLinkKey]: newLinkValue }
      });
      setNewLinkKey('');
      setNewLinkValue('');
    }
  };
  
  const removeLink = (key: string) => {
    const updatedLinks = { ...formData.links };
    delete updatedLinks[key];
    setFormData({ ...formData, links: updatedLinks });
  };
  
  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag]
      });
      setNewTag('');
    }
  };
  
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate an ID from the name
    const id = formData.name?.toLowerCase().replace(/\s+/g, '-') || '';
    
    // Create the full startup object
    const startupData: StartupListing = {
      id,
      name: formData.name || '',
      description: formData.description || '',
      logo: formData.logo || '/api/placeholder/300/100', // Fallback to placeholder
      banner: formData.banner || '/api/placeholder/1200/300', // Fallback to placeholder
      tags: formData.tags || [],
      links: formData.links || {},
      investmentGoal: formData.investmentGoal || { amount: 50, raised: 0, currency: 'ETH' },
      equityoffered: formData.equityoffered || { amount: 0 }
    };
    
    createStartup(startupData);
    alert('Startup created successfully!');
  };
  
  // Calculate investment progress percentage
  const investmentProgress = formData.investmentGoal 
    ? (formData.investmentGoal.raised / formData.investmentGoal.amount) * 100
    : 0;
    const equityProgress = (formData.equityoffered?.amount || 0) / 100;
  
  return (
    <div className="container mx-auto py-6 px-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Create Zeeds</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="preview-mode">Preview</Label>
          <Switch
            id="preview-mode"
            checked={previewMode}
            onCheckedChange={setPreviewMode}
          />
        </div>
      </div>
      
      {previewMode ? (
        /* Preview Mode */
        <div>
          {/* Banner */}
          <div 
            className="h-48 rounded-lg mb-6 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden"
            style={formData.banner ? { backgroundImage: `url(${formData.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <img 
                    src={formData.logo || "/api/placeholder/300/100"} 
                    alt={`${formData.name} logo`}
                    className="h-20 w-20 rounded-full object-cover border-4 border-white"
                  />
                </div>
                <h1 className="text-3xl font-bold text-white">{formData.name || "Your Startup Name"}</h1>
                <p className="text-white/80 max-w-2xl mx-auto mt-2">{formData.description || "Your startup description will appear here"}</p>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {formData.tags && formData.tags.length > 0 ? (
              formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No tags added yet</p>
            )}
          </div>
          
          {/* Investment Goal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Investment Goal</CardTitle>
              <CardDescription>Fundraising target and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">
                    {formData.investmentGoal?.raised || 0} / {formData.investmentGoal?.amount || 50} {formData.investmentGoal?.currency || 'ETH'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {investmentProgress.toFixed(1)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full" 
                    style={{ width: `${Math.min(100, investmentProgress)}%` }}
                  ></div>
                </div>
                <div className=''>Equity Offered</div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">
                    {formData.equityoffered?.amount || 0}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {equityProgress.toFixed(1)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-600 h-4 rounded-full" 
                    style={{ width: `${Math.min(100, equityProgress)}%` }}
                  ></div>
                </div>
                

              </div>
            </CardContent>
          </Card>
          
          
          {/* Links Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Connect with {formData.name || "your startup"}</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.links && Object.keys(formData.links).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(formData.links).map(([key, url]) => (
                    url && (
                      <div 
                        key={key}
                        className="flex items-center p-2 bg-gray-100 rounded-md text-sm capitalize"
                      >
                        {key}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No links added yet</p>
              )}
            </CardContent>
          </Card>
          
        
          
          <div className="mt-6">
            <Button 
              onClick={() => setPreviewMode(false)}
              variant="outline"
              className="w-full"
            >
              Back to Edit
            </Button>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the core details about your startup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Startup Name</Label>
                <Input 
                  id="name" 
                  value={formData.name || ''} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your startup name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description || ''} 
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your startup in a few sentences"
                  rows={3}
                  required
                />
              </div>
              
              {/* Logo Section with Upload or Link options */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex gap-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="logo-link" 
                      checked={logoUploadMethod === 'link'} 
                      onChange={() => setLogoUploadMethod('link')} 
                    />
                    <Label htmlFor="logo-link" className="cursor-pointer">Link</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="logo-upload" 
                      checked={logoUploadMethod === 'upload'} 
                      onChange={() => setLogoUploadMethod('upload')} 
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">Upload</Label>
                  </div>
                </div>
                
                {logoUploadMethod === 'link' ? (
                  <Input 
                    id="logo" 
                    value={formData.logo || ''} 
                    onChange={(e) => handleInputChange('logo', e.target.value)}
                    placeholder="https://yourwebsite.com/logo.png"
                  />
                ) : (
                  <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md">
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      onChange={(e) => handleFileUpload('logo', e)} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    
                    {formData.logo && logoUploadMethod === 'upload' ? (
                      <div className="text-center">
                        <img 
                          src={formData.logo} 
                          alt="Logo preview" 
                          className="w-32 h-32 mx-auto mb-2 object-cover rounded-md" 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" /> Upload Logo
                      </Button>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {logoUploadMethod === 'link' 
                    ? "Enter a URL for your logo or leave empty to use a placeholder" 
                    : "Upload an image file or leave empty to use a placeholder"}
                </p>
              </div>
              
              {/* Banner Section with Upload or Link options */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="flex gap-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="banner-link" 
                      checked={bannerUploadMethod === 'link'} 
                      onChange={() => setBannerUploadMethod('link')} 
                    />
                    <Label htmlFor="banner-link" className="cursor-pointer">Link</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="banner-upload" 
                      checked={bannerUploadMethod === 'upload'} 
                      onChange={() => setBannerUploadMethod('upload')} 
                    />
                    <Label htmlFor="banner-upload" className="cursor-pointer">Upload</Label>
                  </div>
                </div>
                
                {bannerUploadMethod === 'link' ? (
                  <Input 
                    id="banner" 
                    value={formData.banner || ''} 
                    onChange={(e) => handleInputChange('banner', e.target.value)}
                    placeholder="https://yourwebsite.com/banner.png"
                  />
                ) : (
                  <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md">
                    <input 
                      type="file" 
                      ref={bannerInputRef} 
                      onChange={(e) => handleFileUpload('banner', e)} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    
                    {formData.banner && bannerUploadMethod === 'upload' ? (
                      <div className="text-center">
                        <div 
                          className="w-full h-24 mx-auto mb-2 bg-cover bg-center rounded-md" 
                          style={{ backgroundImage: `url(${formData.banner})` }}
                        ></div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => bannerInputRef.current?.click()}
                        >
                          Change Banner
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" /> Upload Banner
                      </Button>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {bannerUploadMethod === 'link' 
                    ? "Enter a URL for your banner or leave empty to use a gradient background" 
                    : "Upload an image file or leave empty to use a gradient background"}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Investment Goal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Investment Goal</CardTitle>
              <CardDescription>Set your fundraising target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Target Amount ({formData.investmentGoal?.currency || 'ETH'})</Label>
                    <span className="text-lg font-medium">{formData.investmentGoal?.amount || 50}</span>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <Slider 
                      value={[formData.investmentGoal?.amount || 50]}
                      min={1}
                      max={1000}
                      step={1}
                      onValueChange={(value) => handleInvestmentChange('amount', value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={formData.investmentGoal?.amount || 50}
                      onChange={(e) => handleInvestmentChange('amount', Number(e.target.value))}
                      className="w-24"
                      min={1}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Currency</Label>
                  <div className="flex gap-2">
                    {['ETH', 'USDC', 'USDT', 'EDU'].map(currency => (
                      <Button
                        key={currency}
                        type="button"
                        variant={formData.investmentGoal?.currency === currency ? 'default' : 'outline'}
                        onClick={() => handleInvestmentChange('currency', currency)}
                        className="flex-1"
                      >
                        {currency}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="raised">Current Amount Raised</Label>
                  <Input
                    id="raised"
                    type="number"
                    value={formData.investmentGoal?.raised || 0}
                    onChange={(e) => handleInvestmentChange('raised', Number(e.target.value))}
                    min={0}
                    max={formData.investmentGoal?.amount || 50}
                  />
                </div>
                
                {/* Preview of progress bar */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span>Progress Preview</span>
                    <span className="text-sm">{investmentProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, investmentProgress)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equity">Equity Offered(%)</Label>
                  <Input
                    id="equity"
                    type="number"
                    value={formData.equityoffered?.amount || 0}
                    onChange={(e) => handleEquityChange('amount', Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>
                
                {/* Preview of progress bar */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span>Progress Preview</span>
                    <span className="text-sm">{(equityProgress*100).toFixed(5)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, equityProgress*100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tags */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add relevant tags for your startup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags && formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input 
                  value={newTag} 
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Links */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Connect your startup's online presence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {formData.links && Object.entries(formData.links).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <div className="w-24 capitalize">{key}:</div>
                    <Input 
                      value={value || ''} 
                      onChange={(e) => handleLinkChange(key, e.target.value)}
                      placeholder={`https://${key}.com/yourprofile`}
                      className="flex-1"
                    />
                    {!['website', 'twitter', 'whitepaper'].includes(key) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(key)}
                        className="p-0 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Add Custom Link</h4>
                <div className="flex gap-2">
                  <Input 
                    value={newLinkKey} 
                    onChange={(e) => setNewLinkKey(e.target.value)}
                    placeholder="Name (e.g. medium)"
                    className="w-1/3"
                  />
                  <Input 
                    value={newLinkValue} 
                    onChange={(e) => setNewLinkValue(e.target.value)}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={addNewLink} 
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
        
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => setPreviewMode(true)}
            >
              Preview
            </Button>
            <Button type="submit" className="flex-1">Create Startup</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StartupCreatePage;