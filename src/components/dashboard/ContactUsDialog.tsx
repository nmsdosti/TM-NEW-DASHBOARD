import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TMLogoEmblem } from './TMIndustrialLogo';
import { useContactInfo, ContactInfo } from '@/lib/contactStore';
import { toast } from 'sonner';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  Edit3,
  Save,
  RotateCcw,
  Check,
  Copy,
  Building,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ContactUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactUsDialog: React.FC<ContactUsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { contactInfo, updateContact, resetContact } = useContactInfo();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState<ContactInfo>(contactInfo);

  // Sync form data when dialog opens or contactInfo updates
  React.useEffect(() => {
    setFormData(contactInfo);
  }, [contactInfo, open]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact(formData);
    setIsEditing(false);
    toast.success('Contact details updated successfully across the app and reports!');
  };

  const handleReset = () => {
    resetContact();
    setFormData(contactInfo);
    setIsEditing(false);
    toast.info('Contact details reset to standard defaults.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-2xl">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <TMLogoEmblem className="h-12 w-12 shadow-md border border-red-700/50 rounded-sm" />
              <div>
                <DialogTitle className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  TM Industrial Solution
                  <Badge variant="outline" className="bg-red-950/80 text-red-400 border-red-800 text-[10px] uppercase font-bold tracking-wider">
                    Diagnostic Hub
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 mt-0.5">
                  Condition Monitoring • Vibration Analysis • Laser Alignment Services
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 px-3 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all shrink-0"
            >
              {isEditing ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  View Card
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit Details
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Update Official Contact Details
                </span>
                <span className="text-[11px] text-slate-400">
                  Changes apply immediately to UI & PDF reports
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    Phone / Helpline Number
                  </Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value, phoneDisplay: e.target.value })}
                    placeholder="e.g. 8140989168"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    Official Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. tmindustrialsolution@gmail.com"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-website" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-600" />
                    Website Domain
                  </Label>
                  <Input
                    id="edit-website"
                    value={formData.website}
                    onChange={(e) => {
                      const val = e.target.value;
                      const url = val.startsWith('http') ? val : `https://${val}`;
                      setFormData({ ...formData, website: val, websiteUrl: url });
                    }}
                    placeholder="e.g. tmsolution.in"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-maps" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-red-600" />
                    Google Maps URL
                  </Label>
                  <Input
                    id="edit-maps"
                    value={formData.mapsUrl}
                    onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    className="h-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-tagline" className="text-xs font-semibold text-slate-700">
                  Tagline & Services Summary
                </Label>
                <Input
                  id="edit-tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Services summary"
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset Defaults
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Contact Details
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* View Cards */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Phone Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone / Helpline</span>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(contactInfo.phone, 'Phone number')}
                      className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200"
                      title="Copy Phone Number"
                    >
                      {copiedField === 'Phone number' ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      title="Call Now"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* 2. Email Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Email Support</span>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                        title={contactInfo.email}
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(contactInfo.email, 'Email address')}
                      className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200"
                      title="Copy Email Address"
                    >
                      {copiedField === 'Email address' ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* 3. Website Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-100 border border-purple-200 text-purple-800 flex items-center justify-center shrink-0">
                      <Globe className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Website</span>
                      <a
                        href={contactInfo.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-extrabold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {contactInfo.website}
                        <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                      </a>
                    </div>
                  </div>
                  <a
                    href={contactInfo.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    title="Open Website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {/* 4. Google Maps Location Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-red-100 border border-red-200 text-red-800 flex items-center justify-center shrink-0">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Location & Directions</span>
                      <a
                        href={contactInfo.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-extrabold text-red-700 hover:underline flex items-center gap-1"
                      >
                        Google Maps
                        <ExternalLink className="h-3.5 w-3.5 text-red-700" />
                      </a>
                    </div>
                  </div>
                  <a
                    href={contactInfo.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                    title="Open Google Maps Location"
                  >
                    <MapPin className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Google Maps Quick Link Banner */}
              <div className="p-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-slate-50 to-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-600 text-white shadow-xs shrink-0 mt-0.5 sm:mt-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      Visit Technical Facility & Head Office
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 text-[9px] px-1.5 py-0 font-bold">
                        Live Map
                      </Badge>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Navigate to TM Industrial Solution engineering center via Google Maps.
                    </p>
                  </div>
                </div>

                <a
                  href={contactInfo.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Service Badges */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>ISO 18436 Certified Category II & III Vibration Diagnostics</span>
                </div>
                <Badge variant="outline" className="bg-white text-slate-700 text-[10px]">
                  24/7 Support
                </Badge>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
