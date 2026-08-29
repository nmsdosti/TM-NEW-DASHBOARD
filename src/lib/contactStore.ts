import { useState, useEffect } from 'react';

export interface ContactInfo {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  website: string;
  websiteUrl: string;
  mapsUrl: string;
  address: string;
  headOffice: string;
  technicalLead: string;
}

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  companyName: 'TM INDUSTRIAL SOLUTION',
  tagline: 'Vibration Diagnostics • Laser Alignment • Condition Monitoring & Reliability Engineering',
  email: 'tmindustrialsolution@gmail.com',
  phone: '8140989168',
  phoneDisplay: '+91 81409 89168',
  website: 'tmsolution.in',
  websiteUrl: 'https://tmsolution.in',
  mapsUrl: 'https://maps.app.goo.gl/NT2DfKYV1dFCRHyk7',
  address: 'Gujarat, India',
  headOffice: 'TM INDUSTRIAL SOLUTION • Head Office & Technical Center',
  technicalLead: 'Head - Reliability Engineering & Diagnostics',
};

const STORAGE_KEY = 'tm_contact_info_v1';

export function getStoredContactInfo(): ContactInfo {
  if (typeof window === 'undefined') return DEFAULT_CONTACT_INFO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTACT_INFO;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONTACT_INFO,
      ...parsed,
    };
  } catch {
    return DEFAULT_CONTACT_INFO;
  }
}

export function saveStoredContactInfo(info: ContactInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    window.dispatchEvent(new Event('tm-contact-updated'));
  } catch (e) {
    console.error('Failed to save contact info:', e);
  }
}

export function resetStoredContactInfo(): ContactInfo {
  if (typeof window === 'undefined') return DEFAULT_CONTACT_INFO;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('tm-contact-updated'));
  } catch (e) {
    console.error('Failed to reset contact info:', e);
  }
  return DEFAULT_CONTACT_INFO;
}

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(getStoredContactInfo);

  useEffect(() => {
    const handleUpdate = () => {
      setContactInfo(getStoredContactInfo());
    };
    window.addEventListener('tm-contact-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('tm-contact-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateContact = (newInfo: ContactInfo) => {
    saveStoredContactInfo(newInfo);
    setContactInfo(newInfo);
  };

  const resetContact = () => {
    const def = resetStoredContactInfo();
    setContactInfo(def);
  };

  return { contactInfo, updateContact, resetContact };
}
