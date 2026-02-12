import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

const LOGO_URL = 'https://cdn.prod.website-files.com/663ac0da330d80e57a7c4303/663ac1eb30ba4d4311696982_Screen_AdversisLogo-horizontal1-01.png';

const DIMENSIONS = [
  {
    id: 'compliance',
    name: 'Compliance Artifacts',
    intro: 'What buyers see before they ever talk to you. These artifacts shape their first impression — and first impressions set the tone for every conversation that follows.',
    questions: [
      {
        id: 'q1',
        title: 'SOC 2 Report Scope and Currency',
        whyItMatters: "Buyers' security teams read the scope section first. A narrow scope or stale report doesn't just look incomplete — it signals you're either hiding something or don't understand what they're evaluating.",
        options: [
          { score: 0, label: 'No SOC 2 report', description: 'You rely on verbal assurances, a self-authored security overview, or a compliance platform dashboard screenshot.' },
          { score: 1, label: 'Type I or limited Type II', description: 'SOC 2 Type I completed, or Type II with scope limited to a single trust service criterion (Security only). Report is older than 12 months.' },
          { score: 2, label: 'Current Type II with good scope', description: 'SOC 2 Type II current (within 12 months). Covers Security plus at least one additional criterion. Scope includes your production environment.' },
          { score: 3, label: 'Comprehensive current Type II', description: 'SOC 2 Type II current with scope that matches what buyers actually evaluate. Continuous monitoring in place. You can explain your scope decisions if asked.' },
        ],
      },
      {
        id: 'q2',
        title: 'Penetration Test as a Compliance Artifact',
        whyItMatters: "Buyers increasingly ask for pen test reports alongside SOC 2 — and SOC 2 doesn't require penetration testing. A missing or weak pen test report tells sophisticated buyers your compliance program covers the minimum, not what matters.",
        options: [
          { score: 0, label: 'No pen test', description: 'No penetration test in the past 18 months, or the test is an internal vulnerability scan labeled as a pen test.' },
          { score: 1, label: 'Scanner-based test', description: 'Vulnerability scanner output repackaged as a pen test report. Scope covers network perimeter or marketing site, not the core product.' },
          { score: 2, label: 'Real pen test on core product', description: 'Real pen test by a qualified firm covering the core product API and authentication. Attestation letter available for sharing.' },
          { score: 3, label: 'Comprehensive annual pen test', description: 'Annual pen test scoped to what buyers care about: product API, auth flows, multi-tenant boundaries, cloud config. Clean attestation letter on your trust center.' },
        ],
      },
      {
        id: 'q3',
        title: 'Security Questionnaire Response Capability',
        whyItMatters: "The questionnaire is often your first security interaction with a buyer. A 200-question SIG that takes your CTO three weeks to complete doesn't get a second chance.",
        options: [
          { score: 0, label: 'No standardized answers', description: 'Each questionnaire answered from scratch by whoever is available. The CTO spends 15-20 hours per questionnaire.' },
          { score: 1, label: 'Partial answer bank', description: 'Some answers exist in a shared document, but they are inconsistent or partially stale. Still takes a week or more.' },
          { score: 2, label: 'Maintained answer bank', description: 'Answer bank covering common frameworks (SIG, CAIQ). Answers are accurate, current, and in buyer vocabulary. Turnaround under a week.' },
          { score: 3, label: 'Comprehensive, evidence-linked answers', description: 'Answer bank covers 80%+ of incoming questions. New questionnaires completed in 2-3 business days. Answers verified against actual controls.' },
        ],
      },
      {
        id: 'q4',
        title: 'Policy and Documentation Alignment',
        whyItMatters: "Buyers compare your security policies to your pen test report, your architecture answers, and your questionnaire responses. Inconsistencies get flagged — and once a buyer spots one contradiction, they go looking for more.",
        options: [
          { score: 0, label: 'Template policies', description: 'Policies are templates with your company name swapped in. Documented controls don\'t reflect actual practices.' },
          { score: 1, label: 'Customized but aspirational', description: 'Core policies exist and were customized. But they describe aspirational state more than current reality.' },
          { score: 2, label: 'Policies reflect reality', description: 'Policies reflect what you actually do. Your team can point to specific controls. Updated at least annually.' },
          { score: 3, label: 'Consistent security story', description: 'Policies, architecture docs, pen test report, and questionnaire answers tell one consistent story. Controls are structural.' },
        ],
      },
      {
        id: 'q5',
        title: 'Shareable Security Artifacts and Trust Center',
        whyItMatters: "Your buyer's security analyst needs something to bring back to their CISO. If you can't provide it in a format they can forward internally, they can't champion you.",
        options: [
          { score: 0, label: 'No shareable documentation', description: 'No shareable security documentation beyond your marketing security page.' },
          { score: 1, label: 'Manual artifact sharing', description: 'SOC 2 report available under NDA through a manual process. No trust center. Buyers must ask for everything individually.' },
          { score: 2, label: 'Basic trust center', description: 'Trust center with SOC 2 report access, pen test attestation letter, and security overview. Available with minimal friction.' },
          { score: 3, label: 'Comprehensive self-serve trust center', description: 'Trust center with current SOC 2, pen test attestation, security whitepaper, and compliance mappings. Self-serve access.' },
        ],
      },
    ],
  },
  {
    id: 'pentest',
    name: 'Pen Test Quality',
    intro: "The pen test report is the single document most likely to land on a buyer's security leader's desk. Open yours while you answer these — if what's described below doesn't match what you see, that's the gap.",
    questions: [
      {
        id: 'q6',
        title: 'What Did Your Pen Test Actually Cover?',
        whyItMatters: "A pen test that covers your marketing site or network perimeter but not your actual product is worse than no pen test — it signals you don't understand what enterprise buyers are evaluating.",
        options: [
          { score: 0, label: 'No pen test', description: 'No pen test, or the last test was more than 18 months ago.' },
          { score: 1, label: 'Infrastructure or perimeter only', description: 'Report covers network infrastructure or your external perimeter. Your core product — the APIs, login flows, and features customers use — wasn\'t tested. Look for: does the scope section mention your product by name?' },
          { score: 2, label: 'Core product tested', description: 'Report covers your product: API endpoints, authentication, key business workflows, and cloud configuration. Look for: specific product features and API routes referenced in the findings.' },
          { score: 3, label: 'Comprehensive, buyer-aligned scope', description: 'Scope matches what enterprise buyers expect: product API, login and access controls, customer data separation, cloud configuration, and deployment pipeline. Look for: a scope section that reads like your product\'s architecture, not a generic network diagram.' },
        ],
      },
      {
        id: 'q7',
        title: 'How Was Your Product Actually Tested?',
        whyItMatters: "Enterprise security teams spot the difference between automated scanner output and real human testing in under a minute. A report that reads like a tool dump undermines every other security claim you make.",
        options: [
          { score: 0, label: 'No testing or automated scans only', description: 'No testing, or a scanning tool ran against your environment and produced a list of findings. Look for: if every finding has a CVE number and no narrative, it\'s automated.' },
          { score: 1, label: 'Compliance-platform or scanner only', description: 'Automated scan from your compliance platform (Drata, Vanta) or a standalone scanner. Report is a list of vulnerabilities with severity ratings — no narrative explaining what they mean for your product. Look for: are there any findings that are specific to your business logic?' },
          { score: 2, label: 'Scanning + manual analysis', description: 'Testing firm combined scanning with manual analysis. Report includes findings specific to your product\'s logic — things a scanner couldn\'t have found on its own. Look for: findings that reference your specific features, roles, or workflows.' },
          { score: 3, label: 'Expert manual testing', description: 'Report clearly shows human expertise — testers chained findings together, wrote custom test cases for your product, and found flaws in business logic. Look for: attack narratives that tell a story, not just a list of individual issues.' },
        ],
      },
      {
        id: 'q8',
        title: 'Was Customer Data Separation Tested?',
        whyItMatters: "If your product serves multiple customers from shared infrastructure, enterprise buyers will ask whether one customer can access another\'s data. This is the question that separates mid-market deals from enterprise ones.",
        options: [
          { score: 0, label: 'Never tested', description: 'No external party has tested whether one customer can access another customer\'s data in your product.' },
          { score: 1, label: 'Basic cross-account testing', description: 'Testers tried some cross-account access at the API level, but didn\'t systematically test every place customer data could leak. Look for: a few findings mentioning "authorization" but no dedicated section on data separation.' },
          { score: 2, label: 'Systematic across app and database', description: 'Report shows dedicated testing of customer data boundaries at both the application and database level. Look for: test cases showing "logged in as Customer A, attempted to access Customer B\'s data" with specific results.' },
          { score: 3, label: 'Comprehensive across all shared layers', description: 'Testing covered every place customers share infrastructure: the application, database, file storage, caching, and background job systems. Look for: a dedicated section on isolation testing with coverage across your full architecture.' },
        ],
      },
      {
        id: 'q9',
        title: 'What Happened After the Findings?',
        whyItMatters: "A pen test with dozens of unresolved findings tells buyers you test for show, not for security. What matters is evidence that you fixed the root causes — not just patched the symptoms.",
        options: [
          { score: 0, label: 'No formal follow-up', description: 'Findings weren\'t formally tracked. Some may have been fixed, but there\'s no record or process.' },
          { score: 1, label: 'Findings tracked, fixes not verified', description: 'Findings are in a ticketing system and critical ones were addressed, but no one went back to verify the fixes actually worked.' },
          { score: 2, label: 'Prioritized fixes with some retesting', description: 'Findings were prioritized by real risk (not just severity labels). Fixes addressed root causes, not just symptoms. Some fixes were verified through retesting.' },
          { score: 3, label: 'All critical fixes verified by retesting', description: 'All critical and high findings fixed at the root cause. The testing firm retested and confirmed fixes work. You have a clean retest report ready to share.' },
        ],
      },
      {
        id: 'q10',
        title: 'Could You Hand This Report to a Buyer?',
        whyItMatters: "Your pen test report will end up in front of your buyer's security leader. It either builds confidence or raises questions that take weeks to answer.",
        options: [
          { score: 0, label: 'No shareable report', description: 'No report, or it\'s raw scanner output with a cover page. You wouldn\'t want a buyer to see it.' },
          { score: 1, label: 'Technical findings only', description: 'A list of findings sorted by severity. No executive summary, no business context, no explanation of what was tested or why. A buyer\'s security team could read it, but their leadership couldn\'t.' },
          { score: 2, label: 'Professional, buyer-ready report', description: 'Clear executive summary plus technical detail. Findings explain business impact, not just technical severity. You also have an attestation letter — a one-page summary confirming the test was done.' },
          { score: 3, label: 'Two-audience deliverable', description: 'Executive summary written for business stakeholders, plus technical detail for security teams. Report demonstrates real testing through attack narratives. Attestation letter on your trust center.' },
        ],
      },
    ],
  },
  {
    id: 'architecture',
    name: 'Architecture Maturity',
    intro: "This is what sophisticated buyers are really evaluating. Compliance artifacts get you to the conversation — architecture answers determine whether you pass.",
    questions: [
      {
        id: 'q11',
        title: 'Authentication Architecture',
        whyItMatters: "Authentication is the first technical system buyers evaluate. No SSO is a deal-killer at enterprise scale. \"We support SSO\" and \"SSO is a first-class feature\" are very different answers.",
        options: [
          { score: 0, label: 'Username/password only', description: 'No SSO. No MFA option. Token management is ad hoc.' },
          { score: 1, label: 'Basic SSO support', description: 'SSO supported but requires custom integration or isn\'t on standard plans. MFA available but not enforceable.' },
          { score: 2, label: 'SSO + enforceable MFA', description: 'SSO via SAML and OIDC as standard features. MFA enforceable at org level. Token lifecycle documented.' },
          { score: 3, label: 'SSO + SCIM + full lifecycle', description: 'SSO as first-class feature with SCIM provisioning. MFA enforced. Tokens with defined TTL and immediate revocation.' },
        ],
      },
      {
        id: 'q12',
        title: 'Authorization Enforcement Model',
        whyItMatters: "BOLA/IDOR is the #1 vulnerability class in multi-tenant SaaS. \"In each route handler\" is the answer that makes CISOs nervous.",
        options: [
          { score: 0, label: 'Scattered route-handler checks', description: 'Authorization checks scattered across individual route handlers. No consistent pattern.' },
          { score: 1, label: 'Per-endpoint checks', description: 'Most endpoints have checks, but enforcement is at the route-handler level. Basic RBAC (admin/user).' },
          { score: 2, label: 'Framework-level enforcement', description: 'Authorization enforced at middleware or framework level. New endpoints inherit security by default.' },
          { score: 3, label: 'Structural defense-in-depth', description: 'Middleware/policy engine ensures no endpoint is accessible without explicit authorization. Database-layer constraints back app-layer.' },
        ],
      },
      {
        id: 'q13',
        title: 'Multi-Tenant Data Isolation',
        whyItMatters: "A single cross-tenant data leak can end your enterprise business overnight. \"Our ORM adds a WHERE clause\" is not an isolation architecture.",
        options: [
          { score: 0, label: 'Application-layer filtering only', description: 'Shared tables with WHERE tenant_id = ?. No isolation at cache, storage, or queue layers.' },
          { score: 1, label: 'Structural support at DB layer', description: 'Application-layer filtering with some structural support (ORM base queries). Other layers rely on key prefixing.' },
          { score: 2, label: 'Multi-layer isolation', description: 'Database isolation beyond app filtering (row-level security, schema-per-tenant). Cache namespaced. IAM-level storage boundaries.' },
          { score: 3, label: 'Validated multi-layer isolation', description: 'Isolation validated at every shared boundary. Adversarial testing covers all layers. Architecture documented and explainable.' },
        ],
      },
      {
        id: 'q14',
        title: 'Secrets and Credential Management',
        whyItMatters: "\"How do you manage secrets?\" is a standard buyer question. \"Environment variables\" is the answer that makes experienced CISOs stop taking notes.",
        options: [
          { score: 0, label: 'Environment variables / .env files', description: 'Secrets in env vars or config. No secrets manager. No rotation. Some may exist in version control history.' },
          { score: 1, label: 'Inconsistent secrets manager use', description: 'Secrets manager for production but inconsistent coverage. Some long-lived credentials remain. No rotation schedule.' },
          { score: 2, label: 'Secrets manager with rotation', description: 'All production secrets in secrets manager with audit logging. Rotation schedule defined and followed.' },
          { score: 3, label: 'Automated short-lived credentials', description: 'Secrets manager for all environments. Automated rotation. Short-lived credentials where possible. Human access requires JIT approval.' },
        ],
      },
      {
        id: 'q15',
        title: 'CI/CD and Supply Chain Security',
        whyItMatters: "Supply chain attacks are the question du jour for enterprise security teams. If a compromised dependency can reach production unchecked, buyers will find that.",
        options: [
          { score: 0, label: 'No branch protection', description: 'Developers can push directly to main. No automated security checks. Dependencies pulled without version pinning.' },
          { score: 1, label: 'Basic branch protection', description: 'Branch protection with PR required. Basic CI but no security tooling. Dependencies managed but no vulnerability scanning.' },
          { score: 2, label: 'Security tooling in CI', description: 'Branch protection with reviews. SAST/DAST in CI. Dependency scanning with defined response process. Deployment gated on CI.' },
          { score: 3, label: 'Comprehensive pipeline security', description: 'Enforced PR workflow. SAST, dependency scanning, secrets scanning in CI. Container scanning. SBOM generation available.' },
        ],
      },
    ],
  },
  {
    id: 'operations',
    name: 'Security Operations',
    intro: "Compliance artifacts and architecture describe what you've built. Operations describe whether it works when something goes wrong — and buyers increasingly care about the difference.",
    questions: [
      {
        id: 'q16',
        title: 'Incident Response Readiness',
        whyItMatters: "\"Walk me through your incident response process\" is a standard buyer question. If the answer is \"we have a policy document,\" buyers know it's never been tested.",
        options: [
          { score: 0, label: 'No IR plan', description: 'No documented incident response plan. Response would be entirely ad hoc.' },
          { score: 1, label: 'Documented but untested plan', description: 'IR plan exists as a policy document. Roles defined on paper. Never tested or exercised.' },
          { score: 2, label: 'Tested through exercises', description: 'IR plan tested through at least one tabletop exercise in the past year. Communication channels verified.' },
          { score: 3, label: 'Regularly exercised with realistic scenarios', description: 'Exercised regularly with realistic scenarios. Includes customer notification procedures and regulatory reporting.' },
        ],
      },
      {
        id: 'q17',
        title: 'Security Monitoring and Detection',
        whyItMatters: "\"We check the logs when something goes wrong\" isn't a monitoring strategy — it tells the buyer no one would notice a breach until a customer reports it.",
        options: [
          { score: 0, label: 'No security monitoring', description: 'No security-specific monitoring. You would learn about a breach from a customer complaint.' },
          { score: 1, label: 'Infrastructure monitoring only', description: 'Basic infrastructure monitoring (uptime, error rates) but no security-specific detection or alerting.' },
          { score: 2, label: 'Security-specific monitoring', description: 'Monitoring covers auth anomalies, authorization failures, infrastructure changes. Alerts for critical events.' },
          { score: 3, label: 'Integrated detection with response', description: 'Monitoring across application, infrastructure, and cloud. Detection rules tuned to your threat model. Alert triage with SLAs.' },
        ],
      },
      {
        id: 'q18',
        title: 'Audit Logging and Customer Observability',
        whyItMatters: "Your buyer's security operations team needs visibility into what's happening in your product. If they can't see who did what, that's a deal-blocker for any company with a SOC.",
        options: [
          { score: 0, label: 'No user-facing audit logs', description: 'Application logging covers errors and debugging only. Customers have zero visibility.' },
          { score: 1, label: 'Basic audit logging', description: 'Basic audit logs (login events, major actions) but not queryable or exportable by customers.' },
          { score: 2, label: 'Comprehensive queryable logs', description: 'Comprehensive logging: user actions, permission changes, data access. Queryable and exportable by customers.' },
          { score: 3, label: 'Full audit trail with SIEM integration', description: 'Full audit trail with UI and API access. Log streaming to buyer\'s SIEM. 1+ year retention.' },
        ],
      },
      {
        id: 'q19',
        title: 'Vulnerability Management and Prioritization',
        whyItMatters: "Buyers want to see a process, not just tools. \"We run scanners\" is different from \"we have a prioritized remediation process informed by what's actually exploitable.\"",
        options: [
          { score: 0, label: 'No formal process', description: 'Vulnerabilities discovered reactively — pen tests, incidents, or customer reports. Tracked informally if at all.' },
          { score: 1, label: 'Scanning with basic tracking', description: 'Vulnerability scanning in place. Findings tracked in tickets. No prioritization beyond CVSS scores.' },
          { score: 2, label: 'Prioritized process with SLAs', description: 'Scanning covers infrastructure, dependencies, and application. Triage considers exploitability. Defined remediation SLAs.' },
          { score: 3, label: 'Risk-based prioritization with metrics', description: 'Prioritized by real attack paths and business impact. SLAs consistently met. Metrics tracked and reportable.' },
        ],
      },
      {
        id: 'q20',
        title: 'Security Program Direction and Roadmap',
        whyItMatters: "Sophisticated buyers evaluate your trajectory, not just your current state. \"We're doing everything\" is less convincing than \"here's what we prioritized and why.\"",
        options: [
          { score: 0, label: 'No security roadmap', description: 'Investment decisions are reactive — driven by the last audit finding or the latest buyer question.' },
          { score: 1, label: 'Informal priorities', description: 'Informal priorities exist but no documented roadmap. Driven by compliance frameworks or complaints.' },
          { score: 2, label: 'Documented prioritized roadmap', description: 'Documented roadmap with sequenced initiatives. Some items explicitly deprioritized with rationale.' },
          { score: 3, label: 'Threat-model-driven roadmap', description: 'Roadmap grounded in threat model. Priorities sequenced by attacker reality and buyer expectations. Board-level narrative available.' },
        ],
      },
    ],
  },
  {
    id: 'livecall',
    name: 'Live Call Readiness',
    intro: "Everything above can be polished on paper. This dimension measures what happens when your buyer's CISO gets on a Zoom call and starts asking questions your documents don't cover.",
    questions: [
      {
        id: 'q21',
        title: 'Architecture Narrative Capability',
        whyItMatters: "\"Walk me through your multi-tenant architecture\" separates companies that pass security review from those that don't. Describing implementation details loses the room; explaining security properties wins the deal.",
        options: [
          { score: 0, label: 'No one can explain it', description: 'No one can explain the security architecture to a non-engineering audience. Discussions default to implementation details.' },
          { score: 1, label: 'Ad hoc engineering explanations', description: 'CTO or tech lead can describe the architecture, but explanations are ad hoc and engineering-focused.' },
          { score: 2, label: 'Designated spokesperson, prepared', description: 'A designated person can walk through auth, authorization, data isolation using buyer vocabulary. Consistent across calls.' },
          { score: 3, label: 'Fluent, executive-to-technical range', description: 'Security spokesperson fluently explains architecture decisions and trade-offs. Pivots between executive and technical levels.' },
        ],
      },
      {
        id: 'q22',
        title: 'Gap Acknowledgment and Roadmap Communication',
        whyItMatters: "What kills deals isn't having gaps — it's the inability to acknowledge them honestly and show a plan. Defensiveness is a red flag buyers see constantly.",
        options: [
          { score: 0, label: 'Gaps denied or deflected', description: '"We\'re SOC 2 compliant" is the response to every security question. No honest assessment of limitations.' },
          { score: 1, label: 'Defensive acknowledgment', description: 'Team acknowledges gaps when pressed, but responses are vague: "we\'re working on it" with no specifics.' },
          { score: 2, label: 'Proactive acknowledgment with roadmap', description: 'Team proactively acknowledges gaps, explains why they exist, and references specific roadmap items.' },
          { score: 3, label: 'Gaps addressed before buyers raise them', description: 'Team addresses gaps before buyers raise them. Frames limitations with clear business rationale and timeline.' },
        ],
      },
      {
        id: 'q23',
        title: 'Security Spokesperson Credibility',
        whyItMatters: "Enterprise CISOs evaluate vendors for a living. They spot the difference between someone who understands security and someone reading from a script within two minutes.",
        options: [
          { score: 0, label: 'No designated person', description: 'No one designated for security calls. CTO takes them with no preparation, or sales tries with marketing talking points.' },
          { score: 1, label: 'Technical but not security-fluent', description: 'CTO or security lead speaks from engineering experience but can\'t translate to the buyer\'s evaluation framework.' },
          { score: 2, label: 'Credible designated spokesperson', description: 'Designated security point person who speaks the buyer\'s language. Credible on core topics. Handles most scenarios.' },
          { score: 3, label: 'Practitioner-level peer credibility', description: 'Spokesperson with practitioner credibility. Comfortable with unexpected questions. Buyer\'s CISO treats them as a peer.' },
        ],
      },
      {
        id: 'q24',
        title: 'Artifact-to-Conversation Consistency',
        whyItMatters: "Buyers compare what you wrote in the questionnaire to what you say on the call to what's in your pen test report. Inconsistencies are the #1 red flag.",
        options: [
          { score: 0, label: 'No coordination between artifacts', description: 'Questionnaire answers, pen test report, and call explanations produced by different people with no coordination.' },
          { score: 1, label: 'Same team, different emphasis', description: 'Same team handles questionnaires and calls, but responses aren\'t standardized. Different emphasis depending on context.' },
          { score: 2, label: 'Reviewed and consistent', description: 'Questionnaire answers reviewed before calls. Key claims consistent across formats. Evidence can be discussed live.' },
          { score: 3, label: 'Unified security narrative', description: 'All artifacts tell one coherent story. The person on the call knows exactly what\'s in every document.' },
        ],
      },
      {
        id: 'q25',
        title: 'Buyer-Side Awareness',
        whyItMatters: "Understanding how your buyer's security team evaluates vendors — what they check first, what triggers deeper scrutiny — is the difference between surviving the review and controlling it.",
        options: [
          { score: 0, label: 'No understanding of buyer process', description: 'No understanding of what enterprise security teams evaluate or how their approval process works.' },
          { score: 1, label: 'General awareness', description: 'General awareness that buyers examine SOC 2, pen tests, and architecture. No understanding of how they evaluate these.' },
          { score: 2, label: 'Understands the evaluation pattern', description: 'Team understands what gets reviewed first, what signals competence, what triggers escalation to their CISO.' },
          { score: 3, label: 'Internalized the buyer perspective', description: 'Team has internalized the buyer\'s perspective. Security materials designed for the buyer\'s workflow, not yours.' },
        ],
      },
    ],
  },
];

const STAGES = [
  {
    id: 'foundation',
    name: 'Foundation',
    range: [0, 20],
    description: "You're probably not ready for formal enterprise security review. Fine for SMB and mid-market deals where security is a checkbox, but enterprise deals with real security teams will stall or die in review.",
    typicalProfile: '$3-10M ARR. No or early SOC 2. First enterprise deals landing. Security handled by the CTO or a recent first hire.',
    focus: [
      { text: 'Get a real pen test covering your product (not just infrastructure) — Dimension 2 is your fastest path to credibility', link: 'https://adversis.io/blog/penetration-testing-for-growth-stage-saas-companies' },
      { text: 'Implement SSO and tighten your authorization model — these are the architecture deal-killers buyers check first', link: 'https://adversis.io/blog/product-security-for-saas' },
      'Build a basic questionnaire answer bank so your CTO isn\'t spending 20 hours per questionnaire',
      'Get an attestation letter on a trust center page',
    ],
    defer: [
      'Sophisticated monitoring and detection — focus on good architecture first',
      'SIEM log streaming — basic exportable audit logs are enough',
      'Formal vulnerability management process — your pen test findings are your vulnerability backlog for now',
      'SCIM provisioning — SSO first, automated lifecycle later',
    ],
  },
  {
    id: 'early-enterprise',
    name: 'Early Enterprise',
    range: [21, 35],
    description: "You pass lightweight security reviews and can close deals where the buyer's security team does a checklist evaluation. But sophisticated buyers find gaps. Your artifacts get you to the call; the call doesn't always go well.",
    typicalProfile: '$10-25M ARR. SOC 2 in hand. Closing some enterprise deals. Starting to see buyers who ask harder questions. Security lead (team of 1-2) drowning in questionnaires.',
    focus: [
      { text: 'Invest in pen test quality — upgrade from scanner-level to manual testing with attack chains', link: 'https://adversis.io/blog/penetration-testing-for-growth-stage-saas-companies' },
      'Shore up security operations — incident response testing and audit logging are now table stakes',
      'Designate and prepare a security spokesperson for calls — this is where deals are won or lost',
      { text: 'Align your artifacts — make sure your questionnaire, pen test report, and call narrative don\'t contradict each other', link: 'https://adversis.io/blog/enterprise-security-readiness-what-to-build-before-buyers-ask' },
    ],
    defer: [
      'Comprehensive supply chain security — branch protection with SAST is enough',
      'Automated secrets rotation — proper secrets management with manual rotation is fine',
      'Board-level security narrative — a documented roadmap with clear priorities is sufficient',
      'SIEM integration and log streaming — exportable audit logs cover most buyer needs',
    ],
  },
  {
    id: 'growth-enterprise',
    name: 'Growth Enterprise',
    range: [36, 52],
    description: "You compete credibly with most enterprise buyers. Your artifacts are solid, your architecture passes review, and your team can handle security calls. Some sophisticated CISOs still find gaps, but you have a coherent story.",
    typicalProfile: '$25-75M ARR. Enterprise revenue is a real channel. Small security team (3-6). Security program has matured beyond compliance.',
    focus: [
      { text: 'Close gaps in operations maturity and call readiness — these now separate you from competitors', link: 'https://adversis.io/blog/enterprise-security-readiness-what-to-build-before-buyers-ask' },
      'Invest in detection capabilities and monitoring — sophisticated buyers in regulated industries ask specifically',
      'Exercise your incident response plan — tabletop exercises are the difference between a policy and a program',
      'Build buyer-side awareness into your security team\'s DNA — understand the evaluation, don\'t just survive it',
    ],
    defer: [
      'Zero-trust architecture — you\'re not regulated enough yet for the ROI',
      'Real-time automated remediation — solid SLAs with tracked metrics are sufficient',
      'Your roadmap trajectory matters more than current perfection — buyers at this stage evaluate direction',
    ],
  },
  {
    id: 'enterprise-ready',
    name: 'Enterprise-Ready',
    range: [53, 75],
    description: "Your security program is a competitive advantage, not just a box to check. You don't merely survive security review — buyers come out of the process more confident in choosing you.",
    typicalProfile: '$75M+ ARR. Enterprise-dominant revenue. Established security team. Selling into regulated industries or large enterprises.',
    focus: [
      { text: 'Continuous improvement: keep expanding pen test scope as your product evolves', link: 'https://adversis.io/blog/penetration-testing-for-growth-stage-saas-companies' },
      'Exercise IR plan with increasingly realistic scenarios',
      'Ensure your security story evolves with your architecture — stale narratives undermine current investment',
      'Push toward structural controls everywhere — security that works when humans make mistakes',
      { text: 'Mentor your broader team on buyer awareness — readiness shouldn\'t depend on one spokesperson', link: 'https://adversis.io/services' },
    ],
    defer: [],
  },
];

const PATTERNS = [
  {
    id: 'high-compliance-low-architecture',
    name: 'High Compliance, Low Architecture',
    detect: (scores) => scores.compliance >= 10 && scores.architecture <= 6,
    description: 'You optimized for the audit, not for the buyer\'s technical evaluation. Common after a fast SOC 2 push. Sophisticated buyers will spot the gap between your compliance artifacts and your actual architecture.',
  },
  {
    id: 'high-architecture-low-compliance',
    name: 'High Architecture, Low Compliance',
    detect: (scores) => scores.architecture >= 10 && scores.compliance <= 6,
    description: 'Your engineering is solid but you can\'t prove it. Typical of technical founders who built well but never documented it. You\'re losing deals before you ever get to show what you\'ve built.',
  },
  {
    id: 'high-everything-low-livecall',
    name: 'High Everything, Low Live Call',
    detect: (scores) => {
      const avg = (scores.compliance + scores.pentest + scores.architecture + scores.operations) / 4;
      return avg >= 9 && scores.livecall <= 7;
    },
    description: 'Your program is real but your team can\'t communicate it. Often solved by getting the right person on the call — or preparing the person you have.',
  },
  {
    id: 'flat-low',
    name: 'Flat Low Scores Across Dimensions',
    detect: (scores) => {
      const vals = Object.values(scores);
      return vals.every(v => v <= 7) && vals.reduce((a, b) => a + b, 0) <= 25;
    },
    description: 'Start with Compliance Artifacts and Architecture — these are the foundation everything else builds on. Don\'t try to improve everything at once.',
  },
  {
    id: 'strong-artifacts-weak-ops',
    name: 'Strong Artifacts, Weak Operations',
    detect: (scores) => (scores.compliance + scores.pentest) >= 18 && scores.operations <= 6,
    description: 'Your artifacts look good on paper but your operations tell buyers the program is static — built for audit, not for real threats. Investing in monitoring and IR exercises will close this gap.',
  },
];

// ─── Utility Functions ───────────────────────────────────────────────────────

const encodeAnswersToUrl = (answersObj) => {
  try {
    const json = JSON.stringify(answersObj);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    return '';
  }
};

const decodeAnswersFromUrl = (encoded) => {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

const calculateResults = (answers) => {
  const dimensionScores = {};
  let totalScore = 0;

  DIMENSIONS.forEach((dim) => {
    let dimScore = 0;
    dim.questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        dimScore += answer;
      }
    });
    dimensionScores[dim.id] = dimScore;
    totalScore += dimScore;
  });

  return { dimensionScores, totalScore };
};

const getStage = (totalScore) => {
  for (const stage of STAGES) {
    if (totalScore >= stage.range[0] && totalScore <= stage.range[1]) {
      return stage;
    }
  }
  return STAGES[STAGES.length - 1];
};

const detectPatterns = (dimensionScores) => {
  return PATTERNS.filter((p) => p.detect(dimensionScores));
};

// ─── SVG Radar Chart ─────────────────────────────────────────────────────────

const RadarChart = ({ scores, size = 400 }) => {
  const center = size / 2;
  const radius = size * 0.38;
  const labels = DIMENSIONS.map((d) => d.name);
  const values = DIMENSIONS.map((d) => scores[d.id] || 0);
  const maxVal = 15;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;

  const getPoint = (index, value) => {
    const angle = startAngle + index * angleStep;
    const r = (value / maxVal) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const gridPolygons = gridLevels.map((level) => {
    const points = Array.from({ length: 5 }, (_, i) => {
      const angle = startAngle + i * angleStep;
      const r = level * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
    return points;
  });

  const dataPoints = values.map((v, i) => getPoint(i, v));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const axisLines = Array.from({ length: 5 }, (_, i) => {
    const angle = startAngle + i * angleStep;
    return {
      x2: center + radius * Math.cos(angle),
      y2: center + radius * Math.sin(angle),
    };
  });

  const labelPositions = Array.from({ length: 5 }, (_, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = radius + 30;
    return {
      x: center + labelR * Math.cos(angle),
      y: center + labelR * Math.sin(angle),
      anchor: Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end',
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} overflow="visible" className="w-full max-w-sm mx-auto">
      {/* Grid polygons */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#9FD9D5"
          strokeWidth="0.5"
          opacity="0.5"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={line.x2}
          y2={line.y2}
          stroke="#9FD9D5"
          strokeWidth="0.5"
          opacity="0.5"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="#F05F62"
        fillOpacity="0.2"
        stroke="#F05F62"
        strokeWidth="2"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#F05F62" />
      ))}

      {/* Labels */}
      {labelPositions.map((pos, i) => (
        <text
          key={i}
          x={pos.x}
          y={pos.y}
          textAnchor={pos.anchor}
          dominantBaseline="middle"
          className="text-xs fill-navy font-medium"
          style={{ fontSize: '11px' }}
        >
          {labels[i]}
        </text>
      ))}

      {/* Score labels at data points */}
      {dataPoints.map((p, i) => (
        <text
          key={`score-${i}`}
          x={p.x}
          y={p.y - 10}
          textAnchor="middle"
          className="text-xs fill-coral-600 font-bold"
          style={{ fontSize: '10px' }}
        >
          {values[i]}
        </text>
      ))}
    </svg>
  );
};

// ─── Email Gate ──────────────────────────────────────────────────────────────

const EmailGate = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidWorkEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return false;
    const freeProviders = [
      'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
      'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com',
      'aol.com', 'icloud.com', 'me.com', 'mac.com',
      'mail.com', 'email.com', 'usa.com',
      'protonmail.com', 'proton.me', 'pm.me',
      'zoho.com', 'zohomail.com',
      'yandex.com', 'yandex.ru',
      'tutanota.com', 'tuta.io',
      'fastmail.com', 'fastmail.fm',
      'gmx.com', 'gmx.net', 'gmx.de',
      'web.de', 'mail.ru', 'inbox.com',
      'hey.com', 'duck.com',
    ];
    const domain = email.split('@')[1].toLowerCase();
    return !freeProviders.includes(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your work email.');
      return;
    }

    if (!isValidWorkEmail(email)) {
      setError('Please use your work email — we built this for security teams evaluating their programs, not personal accounts.');
      return;
    }

    if (!consent) {
      setError('Please agree to the consent below to continue.');
      return;
    }

    setLoading(true);

    try {
      await fetch('https://submit-form.com/VL1qRrueE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, source: 'enterprise-readiness-assessment' }),
      });
    } catch (err) {
      // Soft gate — let them through on network failure
    }

    sessionStorage.setItem('adversis_email_submitted', 'true');
    sessionStorage.setItem('adversis_email', email);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
      <div className="max-w-xl w-full fade-in">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Adversis" className="h-10 mx-auto mb-8" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100">
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy leading-tight mb-4">
            Your SOC 2 report passed the audit. Your pen test came back clean.
            <span className="text-coral-500"> And the deal is still stuck in security review.</span>
          </h1>

          <p className="text-gray-600 mb-3 leading-relaxed">
            This assessment evaluates your security program the way enterprise buyers actually evaluate it — not by what frameworks you've adopted, but by what their security team will scrutinize, question, and use to decide whether you're worth the risk.
          </p>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-navy font-medium mb-2">What you'll get:</p>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-coral-500 font-bold mt-0.5">&#8250;</span> Score across 5 dimensions enterprise buyers evaluate</li>
              <li className="flex items-start gap-2"><span className="text-coral-500 font-bold mt-0.5">&#8250;</span> Your readiness stage with specific focus areas</li>
              <li className="flex items-start gap-2"><span className="text-coral-500 font-bold mt-0.5">&#8250;</span> Pattern analysis showing where your program has gaps</li>
              <li className="flex items-start gap-2"><span className="text-coral-500 font-bold mt-0.5">&#8250;</span> What to prioritize and what to defer at your stage</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="block text-sm font-semibold text-navy mb-2">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent mb-2"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <label className="flex items-start gap-2.5 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-coral-500 focus:ring-coral-500 accent-coral-500 flex-shrink-0"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                By providing your email, you consent to Adversis contacting you about your assessment results and our services. We will never sell or share your email with third parties.
              </span>
            </label>

            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Your answers and results stay private — they're stored in your browser, not on our servers.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Start Assessment'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-4 text-center">
            25 questions. 5-10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Question Card (extracted to avoid hooks-in-loop) ────────────────────────

const QuestionCard = ({ question, questionNumber, selectedScore, onSelect, refCallback, animDelay }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      ref={refCallback}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 slide-in"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="mb-4">
        <h3 className="text-base font-bold text-navy mb-1">
          Q{questionNumber}. {question.title}
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
        >
          {expanded ? 'Hide context' : 'Why this matters'}
        </button>
        {expanded && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed bg-gray-50 rounded-lg p-3">
            {question.whyItMatters}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedScore === option.score;
          return (
            <button
              key={option.score}
              onClick={() => onSelect(question.id, option.score)}
              className={`w-full text-left rounded-xl border-2 p-3.5 transition-all flex items-start gap-3 ${
                isSelected
                  ? 'border-coral-500 bg-coral-50'
                  : 'border-gray-150 hover:border-gray-300 hover:bg-gray-50'
              }`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(question.id, option.score);
                }
              }}
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  isSelected
                    ? 'bg-coral-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {option.score}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${isSelected ? 'text-navy' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Assessment Wizard ───────────────────────────────────────────────────────

const Assessment = ({ answers, setAnswers, onComplete }) => {
  const [currentDimension, setCurrentDimension] = useState(0);
  const questionRefs = useRef([]);

  const dimension = DIMENSIONS[currentDimension];
  const allQuestionIds = dimension.questions.map((q) => q.id);
  const answeredCount = allQuestionIds.filter((id) => answers[id] !== undefined).length;
  const allAnswered = answeredCount === 5;

  const handleSelect = (questionId, score) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);

    // Auto-scroll to next unanswered question
    const qIndex = dimension.questions.findIndex((q) => q.id === questionId);
    if (qIndex < dimension.questions.length - 1) {
      const nextQ = dimension.questions[qIndex + 1];
      if (newAnswers[nextQ.id] === undefined) {
        setTimeout(() => {
          questionRefs.current[qIndex + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  };

  const handleNext = () => {
    if (currentDimension < DIMENSIONS.length - 1) {
      setCurrentDimension(currentDimension + 1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentDimension > 0) {
      setCurrentDimension(currentDimension - 1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={LOGO_URL} alt="Adversis" className="h-8" />
          <span className="text-sm font-medium text-gray-400">Enterprise Security Readiness</span>
        </div>

        {/* Progress bar — 5 segments */}
        <div className="flex gap-1.5 mb-8">
          {DIMENSIONS.map((dim, i) => {
            const dimQuestionIds = dim.questions.map((q) => q.id);
            const dimAnsweredCount = dimQuestionIds.filter((id) => answers[id] !== undefined).length;
            const isComplete = dimAnsweredCount === 5;
            const isCurrent = i === currentDimension;

            return (
              <div key={dim.id} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    isComplete ? 'bg-gold' : isCurrent ? 'bg-teal-300' : 'bg-gray-200'
                  }`}
                />
                <p className={`text-xs mt-1.5 truncate ${isCurrent ? 'text-navy font-semibold' : 'text-gray-400'}`}>
                  {dim.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dimension intro */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 fade-in" key={dimension.id}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-coral-500 bg-coral-50 px-2.5 py-1 rounded-full">
              Dimension {currentDimension + 1} of 5
            </span>
            <span className="text-xs text-gray-400">{answeredCount}/5 answered</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-2">{dimension.name}</h2>
          <p className="text-gray-600 text-sm leading-relaxed italic">{dimension.intro}</p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {dimension.questions.map((question, qIdx) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={parseInt(question.id.replace('q', ''))}
              selectedScore={answers[question.id]}
              onSelect={handleSelect}
              refCallback={(el) => (questionRefs.current[qIdx] = el)}
              animDelay={qIdx * 50}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 mb-12">
          <button
            onClick={handleBack}
            disabled={currentDimension === 0}
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            &larr; Back
          </button>
          <button
            onClick={handleNext}
            disabled={!allAnswered}
            className="px-8 py-3 bg-coral-500 hover:bg-coral-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {currentDimension === DIMENSIONS.length - 1 ? 'See Your Results' : 'Next Dimension'} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Results Page ────────────────────────────────────────────────────────────

const Results = ({ answers, onRetake }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [contactRequested, setContactRequested] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const { dimensionScores, totalScore } = calculateResults(answers);
  const stage = getStage(totalScore);
  const patterns = detectPatterns(dimensionScores);

  // Animated count-up
  useEffect(() => {
    let current = 0;
    const step = totalScore / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= totalScore) {
        setAnimatedScore(totalScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [totalScore]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleRetake = () => {
    window.history.replaceState(null, '', window.location.pathname);
    onRetake();
  };

  const stageColorMap = {
    'foundation': 'bg-red-100 text-red-800',
    'early-enterprise': 'bg-orange-100 text-orange-800',
    'growth-enterprise': 'bg-teal-100 text-teal-800',
    'enterprise-ready': 'bg-green-100 text-green-800',
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Adversis" className="h-8" />
            <span className="text-sm font-medium text-gray-400">Enterprise Security Readiness</span>
          </div>
        </div>

        {/* Score Hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center mb-6 fade-in">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Readiness Score</p>
          <div className="count-up">
            <span className="text-7xl md:text-8xl font-extrabold text-navy">{animatedScore}</span>
            <span className="text-2xl text-gray-300 font-bold ml-1">/75</span>
          </div>
          <div className="mt-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${stageColorMap[stage.id] || 'bg-gray-100 text-gray-800'}`}>
              {stage.name}
            </span>
          </div>
        </div>

        {/* Stage Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 fade-in">
          <h2 className="text-lg font-bold text-navy mb-3">What This Means</h2>
          <p className="text-gray-600 leading-relaxed mb-4">{stage.description}</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Typical Profile</p>
            <p className="text-sm text-gray-600">{stage.typicalProfile}</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 fade-in">
          <h2 className="text-lg font-bold text-navy mb-4">Dimension Breakdown</h2>
          <RadarChart scores={dimensionScores} />
        </div>

        {/* Dimension Bars */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 fade-in">
          <h2 className="text-lg font-bold text-navy mb-4">Score by Dimension</h2>
          <div className="space-y-4">
            {DIMENSIONS.map((dim) => {
              const score = dimensionScores[dim.id] || 0;
              const pct = (score / 15) * 100;
              return (
                <div key={dim.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-navy">{dim.name}</span>
                    <span className="text-sm font-bold text-gray-500">{score}/15</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, #F05F62, ${pct > 60 ? '#9FD9D5' : '#F47E80'})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACTION callout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-teal-400 p-5 mb-6 fade-in">
          <p className="text-sm font-bold text-navy mb-1">Go deeper with TRACTION</p>
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            Map your scores to specific product security controls with the TRACTION framework — a free, tiered maturity model built for SaaS teams scaling into enterprise.
          </p>
          <a
            href="https://traction.fyi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            &rarr; Explore at traction.fyi
          </a>
        </div>

        {/* What to Focus On / Defer */}
        {stage.focus.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-in">
              <h2 className="text-lg font-bold text-navy mb-3">What to Focus On</h2>
              <ul className="space-y-3">
                {stage.focus.map((item, i) => {
                  const isObj = typeof item === 'object';
                  const text = isObj ? item.text : item;
                  const link = isObj ? item.link : null;
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-coral-500 font-bold mt-0.5 flex-shrink-0">&#8250;</span>
                      <span>
                        {text}
                        {link && (
                          <>
                            {' '}
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-coral-500 hover:text-coral-600 font-medium whitespace-nowrap">
                              Learn more &rarr;
                            </a>
                          </>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {stage.defer.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-in">
                <h2 className="text-lg font-bold text-navy mb-3">What You Can Defer</h2>
                <ul className="space-y-3">
                  {stage.defer.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="text-gray-300 font-bold mt-0.5 flex-shrink-0">&#8250;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Pattern Analysis */}
        {patterns.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 fade-in">
            <h2 className="text-lg font-bold text-navy mb-4">Pattern Analysis</h2>
            <div className="space-y-4">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="border-l-4 border-coral-500 bg-coral-50 rounded-r-lg p-4">
                  <h3 className="text-sm font-bold text-navy mb-1">{pattern.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Card */}
        <div className="bg-navy rounded-2xl p-8 md:p-10 text-center mb-6 fade-in">
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to close the gaps?</h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto leading-relaxed">
            Schedule a readiness review with Adversis. We'll walk through your results, prioritize what matters for your buyer tier, and build a 90-day action plan.
          </p>
          <button
            disabled={contactRequested || contactLoading}
            onClick={async () => {
              if (contactRequested || contactLoading) return;
              setContactLoading(true);
              try {
                await fetch('https://submit-form.com/VL1qRrueE', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                  body: JSON.stringify({
                    email: sessionStorage.getItem('adversis_email') || '',
                    source: 'enterprise-readiness-results-contact',
                    totalScore,
                    stage: stage.name,
                  }),
                });
              } catch (err) {
                // Best-effort — don't block the user
              }
              setContactLoading(false);
              setContactRequested(true);
            }}
            className="inline-block px-8 py-3.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
          >
            {contactLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : contactRequested ? "We'll be in touch!" : 'Have Someone Reach Out About My Results'}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={handleRetake}
            className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-navy border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
          >
            Retake Assessment
          </button>
          <button
            onClick={handleCopyLink}
            className="px-6 py-2.5 text-sm font-medium text-coral-500 hover:text-coral-600 border border-coral-200 rounded-xl hover:border-coral-300 transition-colors"
          >
            {copySuccess ? 'Link Copied!' : 'Copy Results Link'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-8">
          &copy; 2026{' '}
          <a href="https://adversis.io" target="_blank" rel="noopener noreferrer" className="text-coral-500 hover:text-coral-600">
            Adversis, LLC
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────────────────

const EnterpriseReadinessAssessment = () => {
  const [page, setPage] = useState('loading');
  const [answers, setAnswers] = useState({});

  // On mount: check URL hash for results, then sessionStorage for gate bypass
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#answers=')) {
      const encoded = hash.substring(9);
      const decoded = decodeAnswersFromUrl(encoded);
      if (decoded && Object.keys(decoded).length > 0) {
        setAnswers(decoded);
        // If they have a results URL, check if email gate was already passed
        if (sessionStorage.getItem('adversis_email_submitted')) {
          setPage('results');
        } else {
          // Show email gate first, then go to results
          setPage('gate');
        }
        return;
      }
    }

    if (sessionStorage.getItem('adversis_email_submitted')) {
      setPage('assessment');
    } else {
      setPage('gate');
    }
  }, []);

  // Update URL when answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const encoded = encodeAnswersToUrl(answers);
      window.history.replaceState(null, '', `#answers=${encoded}`);
    }
  }, [answers]);

  const handleGateComplete = () => {
    // If we had answers from URL hash, go straight to results
    if (Object.keys(answers).length === 25) {
      setPage('results');
    } else {
      setPage('assessment');
    }
  };

  const handleAssessmentComplete = () => {
    setPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setAnswers({});
    setPage('assessment');
  };

  if (page === 'loading') {
    return null;
  }

  if (page === 'gate') {
    return <EmailGate onComplete={handleGateComplete} />;
  }

  if (page === 'assessment') {
    return <Assessment answers={answers} setAnswers={setAnswers} onComplete={handleAssessmentComplete} />;
  }

  if (page === 'results') {
    return <Results answers={answers} onRetake={handleRetake} />;
  }

  return null;
};

export default EnterpriseReadinessAssessment;
