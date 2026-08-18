# ASTRA OS — Self-Development & Continuous Evolution Policy

ASTRA is designed with the capability to inspect its own architecture, run diagnostics, and propose improvements. However, to guarantee absolute system stability and prevent accidental breakage, ASTRA enforces strict self-modification guardrails.

---

## 🔒 The Self-Development Safety Protocol

```
ASTRA Autonomous Inspection
        │
        ▼
Identify Bottleneck / Optimization
        │
        ▼
Create Isolated Git Branch (`git checkout -b astra-patch-<id>`)
        │
        ▼
Apply Code Changes
        │
        ▼
Execute Test Suite (`oxlint` + `tsc -b && vite build` + Subsystem Diagnostics)
        │
        ▼
Security Vulnerability & Sandbox Scan
        │
        ▼
Generate Diff Preview & User Approval Request (NEEDS_APPROVAL)
        │
        ├── [IF APPROVED] ──► Merge to Release Branch & Health Check
        │
        └── [IF REJECTED] ──► Diagnostic Rollback & Revert
```

---

## 🚫 Hard Constraints

1. **No Direct Production Overwrite**: ASTRA will never modify production code without generating an explicit Git feature branch and passing all automated test suites.
2. **Mandatory Human-in-the-Loop for Critical Operations**: Destructive actions (dropping database tables, deleting master branches, modifying hardware interlocks) unconditionally require explicit user confirmation.
3. **Automatic Rollback**: If a newly merged patch fails the post-deployment health check (`/health`), the kernel triggers an immediate rollback to the previous stable commit.
