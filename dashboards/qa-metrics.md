# 📊 QA Metrics Dashboard

> **Automated Quality Gate Report**

**Last Updated:** Monday, October 5, 2026 at 11:27 AM | **Env:** STAGING | **Branch:** feat/tags-and-schedule
**Run:** [#93](https://github.com/karimarie67/QA-framework-template/actions/runs/37332798372)

---

## 🎯 Executive Summary

| Metric | Current Value | Status |
|--------|---------------|----------------|
| **Pass Rate** | **0.0%** | 🔴 Attention |
| **Duration** | **10.3s** | ✅ Good |
| **Total Tests** | 19 | 0 Pass (0 flaky) / 14 Fail / 5 Skipped |
| **Functional** | 13 Tests | ✅ Active |

---

### 🌐 Browser Breakdown

| Project | Pass Rate | Status |
|---|---|---|
| **staging** | 0.0% | 🔴 |
| **staging-mobile** | 0.0% | 🔴 |
| **staging-setup** | NaN% | 🔴 |
| **staging-auth** | NaN% | 🔴 |
| **staging-auth-mobile** | NaN% | 🔴 |


---

## 🔍 Detailed Test Results

### 🔥 Smoke Tests
| Test Name | Status | Duration | Project |
|-----------|--------|----------|---------|
| TC_SMOKE_001 Every page loads with its title and one main heading | ❌ failed | <1s ×2 | staging |
| TC_SMOKE_002 The header menu links reach their pages | ❌ failed | <1s ×2 | staging |
| TC_SMOKE_003 The footer is there, with its links | ❌ failed | <1s ×2 | staging |
| TC_SMOKE_001 Every page loads with its title and one main heading | ❌ failed | <1s ×2 | staging-mobile |
| TC_SMOKE_002 The header menu links reach their pages | ❌ failed | <1s ×2 | staging-mobile |
| TC_SMOKE_003 The footer is there, with its links | ❌ failed | <1s ×2 | staging-mobile |


### 🧩 Functional Tests
| Test Name | Status | Duration | Project |
|-----------|--------|----------|---------|
| TC_A11Y_001 No page has a serious or critical accessibility violation | ❌ failed | <1s ×2 | staging |
| TC_A11Y_001 No page has a serious or critical accessibility violation | ❌ failed | <1s ×2 | staging-mobile |
| TC_ERROR_001 An unknown address shows a not-found page | ❌ failed | <1s ×2 | staging |
| TC_ERROR_002 A malformed address never causes a server error | ❌ failed | <1s ×2 | staging |
| TC_ERROR_001 An unknown address shows a not-found page | ❌ failed | <1s ×2 | staging-mobile |
| TC_ERROR_002 A malformed address never causes a server error | ❌ failed | <1s ×2 | staging-mobile |
| TC_FORM_001 Every form field has its label, type, and required state | ❌ failed | <1s ×2 | staging |
| TC_FORM_001 Every form field has its label, type, and required state | ❌ failed | <1s ×2 | staging-mobile |
| TC_AUTH_001 Logs in and saves the session | ⏭️ skipped | <1s | staging-setup |
| TC_AUTH_002 A page that needs a login opens with the saved session | ⏭️ skipped | <1s | staging-auth |
| TC_AUTH_002 A page that needs a login opens with the saved session | ⏭️ skipped | <1s | staging-auth-mobile |
| TC_AUTH_003 Without a session, that page sends you to the login page | ⏭️ skipped | <1s | staging-auth |
| TC_AUTH_003 Without a session, that page sends you to the login page | ⏭️ skipped | <1s | staging-auth-mobile |


---

## 📈 History (Last 10 Runs)
| Date | Pass Rate | Duration | Failures |
|------|-----------|----------|----------|
| Oct 5 | 0.0% | 10.3s | 14 |
| Oct 5 | 0.0% | 10.7s | 14 |
| Oct 5 | 0.0% | 6.0s | 8 |
| Oct 2 | 0.0% | 5.8s | 8 |
| Oct 1 | 12.9% | 2m 48s | 27 |
| Sep 22 | 16.0% | 1m 11s | 21 |

---
