// "Certified by IIT" applies to the IIT Roorkee and IIT Jammu programs only — never to
// IIIT Bangalore. A program counts when its name, course page, certifying partner or an
// add-on certificate names IIT Roorkee / IIT Jammu, unless its main certifier is an IIIT.

type ProgramLike = {
  name: string;
  courseUrl?: string | null;
  certifications?: { name: string; partnerInstitution: string }[];
  addOnCertificates?: { name: string }[];
};

const IIT_RE = /(^|[^i])iit[\s,—–-]*(roorkee|jammu)/i;
const IIIT_RE = /\biiit\b|iiit[\s-]/i;

export function isIitCertified(p: ProgramLike): boolean {
  const certs = p.certifications ?? [];
  if (certs.some((c) => IIIT_RE.test(c.partnerInstitution))) return false;
  const texts = [
    p.name,
    p.courseUrl,
    ...certs.flatMap((c) => [c.name, c.partnerInstitution]),
    ...(p.addOnCertificates ?? []).map((a) => a.name),
  ];
  return texts.some((t) => !!t && IIT_RE.test(t));
}

export const IIT_PROGRAM_SELECT = {
  name: true,
  slug: true,
  duration: true,
  mode: true,
  courseUrl: true,
  certifications: { select: { name: true, partnerInstitution: true } },
  addOnCertificates: { select: { name: true } },
} as const;
