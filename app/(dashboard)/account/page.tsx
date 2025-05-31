"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, Mail, Phone, Lock, Camera, Building, Globe, Briefcase, 
  Award, Languages, MapPin, Layers, Facebook, FileText, CreditCard, Printer 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { getSignedFileUrl } from "@/lib/s3";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Basic profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole] = useState("");
  
  // Custom fields state
  const [website, setWebsite] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [title, setTitle] = useState("");
  const [license, setLicense] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [faxNumber, setFaxNumber] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [serviceAreaInput, setServiceAreaInput] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [aboutAgency, setAboutAgency] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // Load user data
  useEffect(() => {
    async function loadUserData() {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          throw new Error("Failed to load profile data");
        }
        
        const userData = await response.json();
        
        // Basic profile
        setName(userData.name || "");
        setEmail(userData.email || "");
        setRole(userData.role || "user");
        setPhone(userData.memberProfile?.phone || "");
        setCompany(userData.memberProfile?.company || "");
        
        // Custom fields
        if (userData.customFields) {
          setWebsite(userData.customFields.website || "");
          setAgencyName(userData.customFields.agencyName || "");
          setTitle(userData.customFields.title || "");
          setLicense(userData.customFields.license || "");
          setWhatsapp(userData.customFields.whatsapp || "");
          setTaxNumber(userData.customFields.taxNumber || "");
          setFaxNumber(userData.customFields.faxNumber || "");
          setLanguages(userData.customFields.languages || []);
          setServiceAreas(userData.customFields.serviceAreas || []);
          setSpecialties(userData.customFields.specialties || []);
          setAboutAgency(userData.customFields.aboutAgency || "");
          setFacebookUsername(userData.customFields.facebookUsername || "");
        }
        
        // Load profile image if it exists
        if (userData.image && userData.image.startsWith('profiles/')) {
          try {
            const signedUrl = await getSignedFileUrl(userData.image);
            setAvatarUrl(signedUrl);
          } catch (error) {
            console.error('Error loading profile image:', error);
          }
        } else if (userData.image) {
          setAvatarUrl(userData.image);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load profile data. Please try again.");
      }
    }
    
    loadUserData();
  }, [toast]);
  
  // Handle profile image change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      // Clean up the object URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  // Handle array field additions
  const addLanguage = () => {
    if (languageInput && !languages.includes(languageInput)) {
      setLanguages([...languages, languageInput]);
      setLanguageInput("");
    }
  };
  
  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };
  
  const addServiceArea = () => {
    if (serviceAreaInput && !serviceAreas.includes(serviceAreaInput)) {
      setServiceAreas([...serviceAreas, serviceAreaInput]);
      setServiceAreaInput("");
    }
  };
  
  const removeServiceArea = (area: string) => {
    setServiceAreas(serviceAreas.filter(a => a !== area));
  };
  
  const addSpecialty = () => {
    if (specialtyInput && !specialties.includes(specialtyInput)) {
      setSpecialties([...specialties, specialtyInput]);
      setSpecialtyInput("");
    }
  };
  
  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    
    try {
      const formData = new FormData();
      
      // Basic profile data
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("company", company);
      
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
      
      // Custom fields
      formData.append("website", website);
      formData.append("agencyName", agencyName);
      formData.append("title", title);
      formData.append("license", license);
      formData.append("whatsapp", whatsapp);
      formData.append("taxNumber", taxNumber);
      formData.append("faxNumber", faxNumber);
      
      // Array fields
      languages.forEach(lang => formData.append("languages", lang));
      serviceAreas.forEach(area => formData.append("serviceAreas", area));
      specialties.forEach(specialty => formData.append("specialties", specialty));
      
      formData.append("aboutAgency", aboutAgency);
      formData.append("facebookUsername", facebookUsername);
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsProfileLoading(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setIsPasswordLoading(true);
    
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Account</h2>
        <p className="text-muted-foreground">
          Manage your account settings and profile information
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 w-[400px] mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="professional">Professional Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
      <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2">
          <CardHeader>
                <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
              <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                  {/* <AvatarImage src={avatarUrl || "/placeholder-avatar.jpg"} alt="Profile" /> */}
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  {/* <Label htmlFor="profile-image" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </div>
                  </Label> */}
                  <Input 
                    id="profile-image" 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                      {/* <p className="text-sm text-muted-foreground mt-1">
                        Recommended size: 300x300px
                      </p> */}
                </div>
              </div>
              
                  <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                      <Label htmlFor="name">Full Name*</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="name" 
                      placeholder="Enter your full name"
                      className="pl-9"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                          required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                      <Label htmlFor="email">Email Address*</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                          required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number*</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="Enter your phone number"
                      className="pl-9"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                          required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="website" 
                          type="url" 
                          placeholder="https://yourwebsite.com"
                          className="pl-9"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select value={role} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Your role determines your access level in the system
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isProfileLoading}
                  >
                    {isProfileLoading ? "Saving..." : "Save Basic Information"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Professional Info Tab */}
        <TabsContent value="professional">
          <div className="grid gap-6">
            {/* Agency Information */}
            <Card>
              <CardHeader>
                <CardTitle>Agency Information</CardTitle>
                <CardDescription>Enter details about your agency</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="agencyName">Agency Name*</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                          id="agencyName" 
                          placeholder="Enter agency name"
                          className="pl-9"
                          value={agencyName}
                          onChange={(e) => setAgencyName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title or Position</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="title" 
                          placeholder="Enter your title/position"
                          className="pl-9"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="license">License*</Label>
                      <div className="relative">
                        <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="license" 
                          placeholder="Enter your license number"
                          className="pl-9"
                          value={license}
                          onChange={(e) => setLicense(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="whatsapp" 
                          placeholder="Enter WhatsApp with country code"
                          className="pl-9"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="taxNumber">Tax Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="taxNumber" 
                          placeholder="Enter your tax number"
                          className="pl-9"
                          value={taxNumber}
                          onChange={(e) => setTaxNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="faxNumber">Fax Number</Label>
                      <div className="relative">
                        <Printer className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="faxNumber" 
                          placeholder="Enter your fax number"
                          className="pl-9"
                          value={faxNumber}
                          onChange={(e) => setFaxNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="facebookUsername">Facebook Username</Label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="facebookUsername" 
                          placeholder="Enter your Facebook username"
                      className="pl-9"
                          value={facebookUsername}
                          onChange={(e) => setFacebookUsername(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="aboutAgency">About Agency</Label>
                    <Textarea 
                      id="aboutAgency" 
                      placeholder="Tell us about your agency"
                      rows={4}
                      value={aboutAgency}
                      onChange={(e) => setAboutAgency(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isProfileLoading}
                  >
                    {isProfileLoading ? "Saving..." : "Save Agency Information"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Specializations & Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations & Areas</CardTitle>
                <CardDescription>Enter your expertise and service areas</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="languages">Languages</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Languages className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="languages" 
                            placeholder="Add language (e.g., English, Spanish)"
                            className="pl-9"
                            value={languageInput}
                            onChange={(e) => setLanguageInput(e.target.value)}
                          />
                        </div>
                        <Button type="button" onClick={addLanguage} variant="outline">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {lang}
                            <button 
                              type="button" 
                              onClick={() => removeLanguage(lang)}
                              className="ml-1 rounded-full hover:bg-muted p-1"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="serviceAreas">Service Areas</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="serviceAreas" 
                            placeholder="Add area (e.g., Downtown, North Side)"
                            className="pl-9"
                            value={serviceAreaInput}
                            onChange={(e) => setServiceAreaInput(e.target.value)}
                          />
                        </div>
                        <Button type="button" onClick={addServiceArea} variant="outline">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {serviceAreas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {area}
                            <button 
                              type="button" 
                              onClick={() => removeServiceArea(area)}
                              className="ml-1 rounded-full hover:bg-muted p-1"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="specialties">Specialties</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="specialties" 
                            placeholder="Add specialty (e.g., Residential, Commercial)"
                            className="pl-9"
                            value={specialtyInput}
                            onChange={(e) => setSpecialtyInput(e.target.value)}
                          />
                        </div>
                        <Button type="button" onClick={addSpecialty} variant="outline">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {specialty}
                            <button 
                              type="button" 
                              onClick={() => removeSpecialty(specialty)}
                              className="ml-1 rounded-full hover:bg-muted p-1"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isProfileLoading}
              >
                    {isProfileLoading ? "Saving..." : "Save Specializations & Areas"}
              </Button>
            </form>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your password and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Enter current password"
                      className="pl-9"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="Enter new password"
                      className="pl-9"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Confirm new password"
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 