"use client";

import * as React from "react";
import { Cake, Contact, Lock, Mail, MapPin, Phone, ShieldAlert, User } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { DirectoryPerson } from "../shared";
import { Section, InfoGrid, Info } from "./parts";

export function AboutTab({ person }: { person: DirectoryPerson }) {
  const { currentUser, hasPermission } = useCurrentUser();
  const isSelf = currentUser.id === person.id;
  // Sensitive personal fields are visible to the person themselves, or to
  // anyone who can edit employees (HR / Admin / Super Admin).
  const canSeeSensitive = isSelf || hasPermission("employees.edit");

  const e = person.extra;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Section title="Personal Information" icon={User}>
        <InfoGrid>
          <Info label="Full Name" value={person.name} />
          <Info label="Preferred Name" value={e?.preferredName} />
          {canSeeSensitive ? (
            <>
              <Info label="Date of Birth" value={<span className="inline-flex items-center gap-1"><Cake className="h-3.5 w-3.5 text-text-tertiary" />{e?.dateOfBirth}</span>} />
              <Info label="Gender" value={e?.gender} />
            </>
          ) : (
            <Info label="Personal Details" value={<Restricted />} />
          )}
        </InfoGrid>
      </Section>

      <Section title="Contact" icon={Contact} tint="#38BDF8">
        <InfoGrid>
          <Info label="Work Email" value={<span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-text-tertiary" />{person.email}</span>} />
          <Info label="Phone" value={<span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-text-tertiary" />{e?.phone}</span>} />
          {canSeeSensitive ? (
            <>
              <Info label="Personal Email" value={e?.personalEmail} />
              <Info label="Current Address" value={<span className="inline-flex items-start gap-1"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />{e?.currentAddress}</span>} />
              <Info label="Permanent Address" value={<span className="inline-flex items-start gap-1"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />{e?.permanentAddress}</span>} />
            </>
          ) : (
            <Info label="Address & Personal Contact" value={<Restricted />} />
          )}
        </InfoGrid>
      </Section>

      <Section title="Emergency Contact" icon={ShieldAlert} tint="#FB7185" className="lg:col-span-2">
        {canSeeSensitive ? (
          <InfoGrid cols={3}>
            <Info label="Name" value={e?.emergencyContact.name} />
            <Info label="Relationship" value={e?.emergencyContact.relationship} />
            <Info label="Phone" value={e?.emergencyContact.phone} />
          </InfoGrid>
        ) : (
          <Restricted />
        )}
      </Section>
    </div>
  );
}

function Restricted() {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-text-tertiary">
      <Lock className="h-3.5 w-3.5" /> Restricted — visible to the employee and HR only
    </span>
  );
}
