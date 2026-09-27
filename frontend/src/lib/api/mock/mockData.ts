import { User } from '@/types/auth';
import { Project } from '@/types/project';
import { Transformation } from '@/types/transformation';
import { Artifact } from '@/types/artifact';
import { KnowledgeDocument } from '@/types/knowledge';
import { AuditLog } from '@/types/audit';

export const mockUser: User = {
  id: 'usr_mock_001',
  email: 'admin@revamp.ai',
  full_name: 'Senior Threat Analyst',
  role: 'analyst',
  is_active: true,
};

export const mockProjects: Project[] = [
  {
    id: 'proj_01',
    name: 'Critical Ransomware Campaign Analysis',
    description: 'Investigation into APT29 zero-day gateway vulnerability and ransomware payloads.',
    status: 'active',
    owner_id: 'usr_mock_001',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'proj_02',
    name: 'Industrial ICS SCADA Threat Advisory',
    description: 'Substation SCADA protocol exploit intelligence transformation deck.',
    status: 'active',
    owner_id: 'usr_mock_001',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  }
];

export const mockTransformations: Transformation[] = [
  {
    id: 'trans_demo_101',
    project_id: 'proj_01',
    status: 'completed',
    current_stage: 'completed',
    target_audience: 'executive',
    tone: 'urgent',
    objective: 'action_required',
    urgency_level: 'critical',
    language: 'English',
    output_formats: ['executive_brief', 'advisory', 'social', 'presentation', 'infographic', 'video'],
    source_document_ids: ['doc_001'],
    central_context: {
      core_topic: 'Gateway Zero-Day Vulnerability & Cobalt Strike Exploitation',
      executive_summary: 'An unauthenticated Remote Code Execution (RCE) vulnerability in edge perimeter firewalls has been actively exploited in the wild. Attackers deploy Cobalt Strike beacons to compromise Active Directory Domain Controllers within 4 hours of initial access.',
      key_findings: [
        'CVSS 9.8 Critical vulnerability in perimeter gateway software.',
        'Exploit vector involves custom memory overflow payload over TCP/443.',
        'Immediate lateral movement detected targeting primary Domain Controllers.'
      ],
      entities: ['APT29', 'CVE-2026-1001', 'Cobalt Strike', 'Exchange Server'],
      threat_indicators: ['192.168.1.100', '10.0.4.5', 'sha256: 44d88612fea8a8f36de82e1278abb02f'],
      affected_systems: ['Enterprise Edge Firewalls', 'Primary Active Directory Domain Controllers'],
      timeline: ['02:00 UTC - Initial exploit attempt', '03:15 UTC - Beacon callback established'],
      technical_details: ['Buffer overflow in SSL VPN parser', 'Shellcode injection via heap spray'],
      urgency_level: 'critical',
      recommended_actions: [
        'Apply emergency firmware update v4.2.1 immediately.',
        'Isolate compromised IPs at border routers.',
        'Reset Domain Admin credentials.'
      ],
      references: ['CISA Advisory AA26-080A', 'NIST NVD CVE-2026-1001']
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

export const mockArtifacts: Artifact[] = [
  {
    id: 'art_exec_01',
    transformation_id: 'trans_demo_101',
    type: 'executive_brief',
    title: 'Executive Brief Report',
    status: 'generated',
    content: {
      title: 'Executive Brief: Critical Perimeter Breach Alert',
      executive_summary: 'A critical perimeter vulnerability (CVE-2026-1001) has been confirmed active in enterprise networks.',
      business_impact: 'Potential operational shutdown of core identity servers; high risk of ransom deployment within 12 hours.',
      operational_risk: 'High financial & regulatory compliance liability if customer data repository is accessed.',
      immediate_decisions: ['Approve emergency system maintenance window.', 'Authorize external incident response team deployment.'],
      recommended_actions: ['Isolate affected gateway nodes.', 'Deploy mandatory multi-factor authentication reset.']
    },
    size: 24500,
    validation_status: {
      status: 'passed',
      warnings: [],
      issues: [],
      checks: { source_grounding: true, severity_consistency: true, pii_detection: true }
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'art_adv_01',
    transformation_id: 'trans_demo_101',
    type: 'advisory',
    title: 'Security Advisory Alert',
    status: 'generated',
    content: {
      title: 'SECURITY ADVISORY: Emergency Gateway Vulnerability',
      severity: 'CRITICAL',
      threat_overview: 'Active exploitation of heap buffer overflow in perimeter gateway SSL module.',
      affected_systems: ['Primary Firewall Gateway', 'Domain Controllers'],
      indicators: ['192.168.1.100', 'hash: 44d88612fea8a8f36de82e1278abb02f'],
      mitigation_steps: ['Patch gateway to v4.2.1', 'Block remote management interface over WAN'],
      recommended_actions: ['Conduct full memory dump audit of Domain Controller 01'],
      references: ['CISA Advisory AA26-080A']
    },
    file_path: '/storage/pdf/trans_demo_101_advisory.pdf',
    mime_type: 'application/pdf',
    size: 148000,
    validation_status: { status: 'passed' },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

export const mockKnowledgeDocuments: KnowledgeDocument[] = [
  {
    id: 'kb_doc_01',
    title: 'APT29 Attack Tactics & Infrastructure Playbook',
    source_type: 'pdf',
    chunk_count: 42,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'kb_doc_02',
    title: 'Enterprise SCADA Threat Matrix Baseline',
    source_type: 'docx',
    chunk_count: 28,
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit_01',
    user_id: 'usr_mock_001',
    action: 'approve_ico',
    resource: 'transformation',
    resource_id: 'trans_demo_101',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'audit_02',
    user_id: 'usr_mock_001',
    action: 'download_artifact',
    resource: 'artifact:executive_brief',
    resource_id: 'art_adv_01',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'audit_03',
    user_id: 'system',
    action: 'vector_indexing',
    resource: 'knowledge_doc:APT29',
    resource_id: 'kb_doc_01',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'audit_04',
    user_id: 'usr_mock_001',
    action: 'export_pptx_deck',
    resource: 'presentation_deck',
    resource_id: 'art_pptx_01',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'audit_05',
    user_id: 'usr_mock_001',
    action: 'configure_llm_engine',
    resource: 'engine:gemini',
    resource_id: 'settings_01',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];
