# 📊 QA Metrics Dashboard

> **Automated Quality Gate Report**

**Last Updated:** Monday, October 5, 2026 at 9:06 AM | **Env:** STAGING | **Branch:** feat/logged-in-apps
**Run:** [#68](https://github.com/karimarie67/QA-framework-template/actions/runs/37314075829)

---

## 🎯 Executive Summary

| Metric | Current Value | Status |
|--------|---------------|----------------|
| **Pass Rate** | **0.0%** | 🔴 Attention |
| **Duration** | **6.0s** | ✅ Good |
| **Total Tests** | 13 | 0 Pass (0 flaky) / 8 Fail / 5 Skipped |
| **Functional** | 13 Tests | ✅ Active |

---

### 🌐 Browser Breakdown

| Project | Pass Rate | Status |
|---|---|---|
| **staging-setup** | NaN% | 🔴 |
| **staging** | 0.0% | 🔴 |
| **staging-mobile** | 0.0% | 🔴 |
| **staging-auth** | NaN% | 🔴 |
| **staging-auth-mobile** | NaN% | 🔴 |


---

## 🔍 Detailed Test Results

### 🔥 Smoke Tests
> *No tests found in this category* 


### 🧩 Functional Tests
| Test Name | Status | Duration | Project |
|-----------|--------|----------|---------|
| TC_AUTH_001 Logs in and saves the session | ⏭️ skipped | <1s | staging-setup |
| TC_A11Y_001 No page has a serious or critical accessibility violation | ❌ failed | <1s ×2 | staging |
| TC_A11Y_001 No page has a serious or critical accessibility violation | ❌ failed | <1s ×2 | staging-mobile |
| TC_ERROR_001 An unknown address shows a not-found page | ❌ failed | <1s ×2 | staging |
| TC_ERROR_002 A malformed address never causes a server error | ❌ failed | <1s ×2 | staging |
| TC_ERROR_001 An unknown address shows a not-found page | ❌ failed | <1s ×2 | staging-mobile |
| TC_ERROR_002 A malformed address never causes a server error | ❌ failed | <1s ×2 | staging-mobile |
| TC_FORM_001 Every form field has its label, type, and required state | ❌ failed | <1s ×2 | staging |
| TC_FORM_001 Every form field has its label, type, and required state | ❌ failed | <1s ×2 | staging-mobile |
| TC_AUTH_002 A page that needs a login opens with the saved session | ⏭️ skipped | <1s | staging-auth |
| TC_AUTH_002 A page that needs a login opens with the saved session | ⏭️ skipped | <1s | staging-auth-mobile |
| TC_AUTH_003 Without a session, that page sends you to the login page | ⏭️ skipped | <1s | staging-auth |
| TC_AUTH_003 Without a session, that page sends you to the login page | ⏭️ skipped | <1s | staging-auth-mobile |


---

## 📈 History (Last 10 Runs)
| Date | Pass Rate | Duration | Failures |
|------|-----------|----------|----------|
| Oct 5 | 0.0% | 6.0s | 8 |
| Oct 2 | 0.0% | 5.8s | 8 |
| Oct 1 | 12.9% | 2m 48s | 27 |
| Sep 22 | 16.0% | 1m 11s | 21 |

---
