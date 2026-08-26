// Verbatim content from the user-supplied "Career Services Policy 12 Aug 26.docx".
// Wording, including its typos ("PLACEMENT ASSITANCE", "Releiving letter"), is kept
// exactly as written in the source document — this is legal/policy text, not
// something to silently "clean up". Section numbering skips from 2 to 4 in the
// source document itself (there is no Section 3) — reproduced as-is rather than
// renumbered.

export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "h4"; text: string }
  | { type: "strong"; text: string };

export type Section = {
  number: string;
  title: string;
  blocks: Block[];
};

export const POLICY_VERSION = "Version 1.0";
export const POLICY_EFFECTIVE_DATE = "Effective Date: [DD/MM/YYYY]";

export const POLICY_SECTIONS: Section[] = [
  {
    number: "1",
    title: "OBJECTIVE",
    blocks: [
      {
        type: "p",
        text: 'The purpose of this Policy is to define the framework governing Career Services and Placement Assistance provided by upGrad Education Private Limited ("upGrad") to learners enrolled in eligible programs.',
      },
      {
        type: "p",
        text: "Career Services are designed to help learners develop professional readiness through profile building, interview preparation, project showcasing, employer interactions, and placement assistance activities.",
      },
      {
        type: "p",
        text: "Placement Assistance is intended to facilitate employment opportunities and improve employability. It does not constitute a guarantee of employment, internship, interview calls, compensation, designation, employer, or any specific career outcome. All hiring decisions are made solely by independent employers.",
      },
    ],
  },
  {
    number: "2",
    title: "PLACEMENT ASSITANCE PROGRAM",
    blocks: [
      { type: "p", text: "The learner acknowledges and agrees that:" },
      {
        type: "ul",
        items: [
          "upGrad does not guarantee employment, placement, internship, interview opportunities, salary levels, or job roles.",
          "Placement Assistance is a facilitative service and not a guaranteed outcome.",
          "Hiring decisions remain solely at the discretion of prospective employers.",
          "Failure to secure employment shall not give rise to any refund, fee adjustment, compensation claim, or liability on upGrad.",
          "Placement Assistance may be suspended, restricted, or withdrawn in accordance with this Policy.",
        ],
      },
    ],
  },
  {
    number: "4",
    title: "PLACEMENT READINESS FRAMEWORK",
    blocks: [
      { type: "strong", text: "4.1 Placement Ready Status" },
      {
        type: "p",
        text: "Learners may be granted access to placement opportunities before completion of the academic program upon achieving Placement Ready Status.",
      },
      {
        type: "p",
        text: "Being Placement Ready indicates that the learner has demonstrated sufficient professional preparedness to participate in recruitment opportunities.",
      },
      { type: "p", text: "Placement Ready Status shall be determined solely by the Career Services team." },
      { type: "strong", text: "4.2 Placement Readiness Requirements" },
      { type: "p", text: "A learner shall be considered Placement Ready only after meeting all applicable requirements below." },
      { type: "h4", text: "A. LinkedIn Profile Readiness" },
      { type: "p", text: "The learner must maintain a professional LinkedIn profile that includes:" },
      {
        type: "ul",
        items: [
          "Professional photograph",
          "Appropriate headline",
          "Summary/About section",
          "Education details",
          "Skills section",
          "Certifications (where applicable)",
          "Project showcase",
        ],
      },
      { type: "p", text: "The profile must meet standards prescribed by Career Services." },
      { type: "h4", text: "B. Resume Readiness" },
      { type: "p", text: "The learner must possess a placement-ready resume that:" },
      {
        type: "ul",
        items: [
          "Accurately reflects qualifications, projects and experience",
          "Meets prescribed formatting standards",
          "Has been reviewed by Career Services",
          "Has received approval from the Domain Trainer",
          "Has received approval from the Soft Skills/Employability Team",
        ],
      },
      { type: "p", text: "Only approved resumes may be used for employer submissions." },
      { type: "h4", text: "C. Project Portfolio Readiness" },
      { type: "p", text: "The learner must demonstrate practical competency through project work." },
      { type: "p", text: "Minimum expectations may include:" },
      {
        type: "ul",
        items: [
          "Two industry-relevant projects",
          "Proper project documentation",
          "Demonstrated ownership and understanding of project outcomes",
        ],
      },
      { type: "p", text: "Availability of project portfolio on approved platforms such as:" },
      { type: "ul", items: ["GitHub", "Kaggle", "Portfolio websites", "Other approved repositories"] },
      { type: "p", text: "Additional portfolio requirements may be prescribed program-wise." },
      { type: "h4", text: "D. Career Readiness Assessment" },
      {
        type: "p",
        text: "The learner must successfully participate in activities prescribed by Career Services, including but not limited to:",
      },
      {
        type: "ul",
        items: [
          "Mock Interviews",
          "Employability Assessments",
          "Communication Assessments",
          "Technical Assessments",
          "Resume Evaluations",
          "Placement Readiness Reviews",
        ],
      },
      {
        type: "p",
        text: "Learners are expected to act upon feedback and recommended improvements shared during these evaluations.",
      },
    ],
  },
  {
    number: "5",
    title: "ACTIVATION OF PLACEMENT ASSISTANCE",
    blocks: [
      { type: "p", text: "Placement Assistance shall be activated once a learner is declared Placement Ready by Career Services." },
      { type: "p", text: "Activation of Placement Assistance:" },
      {
        type: "ul",
        items: [
          "Is not linked to curriculum completion.",
          "Is not linked to attendance percentage.",
          "Is not linked to certification status.",
          "Is not linked to LMS completion levels.",
          "Is not linked to semester progression.",
        ],
      },
      { type: "p", text: "These requirements may apply separately for academic completion and certification." },
      {
        type: "p",
        text: "Career Services may activate placement support before program completion if Placement Readiness standards have been met.",
      },
      { type: "p", text: "The final decision regarding activation of Placement Assistance shall remain solely with upGrad." },
    ],
  },
  {
    number: "6",
    title: "VALIDITY OF PLACEMENT ASSISTANCE",
    blocks: [
      {
        type: "p",
        text: "Placement Assistance shall remain available for a period of three (3) years from the date Placement Assistance is activated, unless otherwise specified by upGrad.",
      },
      {
        type: "p",
        text: "upGrad reserves the right to suspend, discontinue or withdraw Placement Assistance in cases of non-compliance with this Policy.",
      },
    ],
  },
  {
    number: "7",
    title: "LEARNER RESPONSIBILITIES",
    blocks: [
      { type: "p", text: "Learners availing Placement Assistance shall:" },
      { type: "h4", text: "Communication" },
      {
        type: "ul",
        items: [
          "Maintain updated email and phone details.",
          "Check communications regularly.",
          "Respond within timelines communicated by the Career Services team.",
        ],
      },
      {
        type: "p",
        text: "upGrad shall not be responsible for missed opportunities arising due to incorrect contact details or lack of responsiveness.",
      },
      { type: "h4", text: "Professional Conduct" },
      { type: "p", text: "Learners shall:" },
      {
        type: "ul",
        items: [
          "Maintain professionalism throughout recruitment activities.",
          "Follow instructions issued by employers and Career Services.",
          "Participate responsibly in all scheduled processes.",
        ],
      },
      { type: "h4", text: "Documentation" },
      { type: "p", text: "Learners shall maintain updated copies of:" },
      {
        type: "ul",
        items: [
          "Resume",
          "Government ID",
          "Academic documents",
          "Certificates",
          "Portfolio links",
          "Project documentation",
          "Releiving letter and previous employment documents to be clear",
        ],
      },
    ],
  },
  {
    number: "8",
    title: "PARTICIPATION IN RECRUITMENT PROCESSES",
    blocks: [
      { type: "p", text: "Learners may participate in recruitment opportunities for which they satisfy employer-specific requirements." },
      { type: "p", text: "Once registered for a process, learners are expected to:" },
      {
        type: "ul",
        items: [
          "Attend all scheduled rounds.",
          "Complete the recruitment process.",
          "Adhere to timelines communicated by recruiters.",
          "Behave professionally throughout the process.",
        ],
      },
      { type: "p", text: "Failure to participate after confirming availability may attract disciplinary action." },
    ],
  },
  {
    number: "9",
    title: "ONE LEARNER - ONE OFFER POLICY",
    blocks: [
      { type: "p", text: "upGrad follows the principle of One Learner - One Offer." },
      { type: "p", text: "Accordingly:" },
      {
        type: "ul",
        items: [
          "Learners securing an offer through upGrad-facilitated opportunities may not ordinarily be considered for subsequent opportunities unless the next opportunity is 1.5 times in compensation of the previous opportunity",
          "Learners undertaking internships, apprenticeships or OJT assignments may continue to receive support toward full-time opportunities.",
        ],
      },
      { type: "p", text: "Exceptions may be considered solely at the discretion of Career Services." },
      { type: "p", text: "Any exception granted shall not create a precedent for future cases." },
    ],
  },
  {
    number: "10",
    title: "MISCONDUCT",
    blocks: [
      { type: "p", text: "The following actions shall be treated as misconduct:" },
      { type: "h4", text: "Recruitment Process Violations" },
      {
        type: "ul",
        items: [
          "Registering and failing to attend interviews.",
          "Missing interview rounds without prior approval.",
          "Leaving a recruitment process midway.",
          "Repeated unresponsiveness to placement communications.",
        ],
      },
      { type: "h4", text: "Integrity Violations" },
      {
        type: "ul",
        items: [
          "Resume fraud.",
          "Submission of false information.",
          "Fake experience claims.",
          "Plagiarism.",
          "Project misrepresentation.",
          "Forged documentation.",
          "Proxy interviews.",
        ],
      },
      { type: "h4", text: "Behavioural Violations" },
      {
        type: "ul",
        items: [
          "Misbehaviour with recruiters.",
          "Misbehaviour with upGrad employees.",
          "Unprofessional conduct.",
          "Unauthorized communication with hiring partners.",
          "Any action resulting in reputational harm to upGrad or hiring partners.",
        ],
      },
      { type: "h4", text: "Assessment Violations" },
      {
        type: "ul",
        items: ["Cheating during assessments.", "Use of unfair means.", "Sharing confidential assessment material."],
      },
      {
        type: "p",
        text: "Misconduct may result in temporary suspension or permanent withdrawal of Placement Assistance.",
      },
    ],
  },
  {
    number: "11",
    title: "DISCIPLINARY ACTIONS",
    blocks: [
      { type: "h4", text: "Category A Violations" },
      { type: "p", text: "Examples include:" },
      {
        type: "ul",
        items: [
          "Interview no-show.",
          "Missing scheduled interview rounds.",
          "Missing mandatory recruiter briefing sessions.",
          "Repeated communication defaults.",
        ],
      },
      { type: "strong", text: "Consequences" },
      { type: "strong", text: "First Instance" },
      { type: "p", text: "Debarment from the next two placement opportunities." },
      { type: "strong", text: "Second Instance" },
      { type: "p", text: "Suspension from Placement Assistance, subject to review by Career Services." },
      { type: "h4", text: "Category B Violations" },
      { type: "p", text: "Examples include:" },
      {
        type: "ul",
        items: [
          "Resume fraud.",
          "Fake projects.",
          "Plagiarism.",
          "Proxy interviews.",
          "Forged documents.",
          "Serious misconduct.",
          "Declining an accepted offer without a valid reason after formally accepting the opportunity.",
          "Actions causing reputational damage to upGrad or employer partners.",
        ],
      },
      { type: "strong", text: "Consequence" },
      { type: "p", text: "Immediate and permanent withdrawal of Placement Assistance." },
    ],
  },
  {
    number: "12",
    title: "DATA SHARING CONSENT",
    blocks: [
      {
        type: "p",
        text: "To facilitate recruitment opportunities, learners authorize upGrad to share relevant information with prospective employers, including:",
      },
      {
        type: "ul",
        items: [
          "Resume",
          "LinkedIn profile",
          "Project portfolio",
          "Assessment outcomes",
          "Interview readiness status",
          "Placement readiness information",
        ],
      },
      { type: "p", text: "Such sharing shall be limited to employment facilitation purposes." },
    ],
  },
  {
    number: "13",
    title: "APPEALS",
    blocks: [
      {
        type: "p",
        text: "A learner may submit an appeal against a disciplinary action within seven (7) calendar days of receiving written notification.",
      },
      { type: "p", text: "The decision of the Head of Career Services or designated authority shall be final and binding." },
    ],
  },
  {
    number: "14",
    title: "POLICY AMENDMENT",
    blocks: [
      {
        type: "p",
        text: "upGrad reserves the right to amend, modify, suspend or withdraw any provision of this Policy at its sole discretion.",
      },
      { type: "p", text: "Continued participation in Career Services shall constitute acceptance of the revised Policy." },
    ],
  },
];
