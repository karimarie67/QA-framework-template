# 📊 QA Metrics Dashboard

> **Automated Quality Gate Report**

**Last Updated:** Thursday, October 1, 2026 at 9:25 AM | **Env:** STAGING | **Branch:** main
**Run:** [#37](https://github.com/karimarie67/QA-framework-template/actions/runs/36867977008)

---

## 🎯 Executive Summary

| Metric | Current Value | Status |
|--------|---------------|----------------|
| **Pass Rate** | **12.9%** | 🔴 Attention |
| **Duration** | **2m 48s** | ✅ Good |
| **Total Tests** | 31 | 4 Pass (0 flaky) / 27 Fail / 0 Skipped |
| **Functional** | 25 Tests | ✅ Active |

---

### 🌐 Browser Breakdown

| Project | Pass Rate | Status |
|---|---|---|
| **staging** | 12.9% | 🔴 |


---

## 🔍 Detailed Test Results

### 🔥 Smoke Tests
| Test Name | Status | Duration | Project |
|-----------|--------|----------|---------|
| Homepage loads with key elements | ❌ failed | 5.3s | staging |
| Navigation menu links work correctly | ❌ failed | 5.1s | staging |
| a listing page displays expected items and links to detail pages | ❌ failed | 5.0s | staging |
| Download section works correctly | ❌ failed | 5.0s | staging |
| Search bar works with basic query | ❌ failed | 5.0s | staging |
| Homepage is responsive on mobile | ❌ failed | 5.2s | staging |


### 🧩 Functional Tests (Errors, Docs, Search)
| Test Name | Status | Duration | Project |
|-----------|--------|----------|---------|
| 404 page displays appropriate error message | ❌ failed | 5.1s | staging |
| Broken documentation link returns appropriate error | ❌ failed | 30.4s | staging |
| Invalid search query handles gracefully | ❌ failed | 5.1s | staging |
| Malformed URL redirects or shows error appropriately | ✅ passed | <1s | staging |
| Broken external links are identified | ❌ failed | 5.0s | staging |
| Form validation errors display correctly | ❌ failed | 5.0s | staging |
| Download links return valid HTTP status codes | ❌ failed | 5.1s | staging |
| Download file names are correct format | ❌ failed | 5.0s | staging |
| Version selector displays available versions | ❌ failed | 5.0s | staging |
| Download page displays file sizes | ❌ failed | 5.0s | staging |
| Search returns relevant results for common queries | ❌ failed | 5.0s | staging |
| Search with special characters handles gracefully | ❌ failed | 5.2s | staging |
| Empty search shows appropriate message | ❌ failed | 5.0s | staging |
| Search result pagination works correctly | ❌ failed | 5.0s | staging |
| Search autocomplete/suggestions appear | ❌ failed | 5.1s | staging |
| Documentation page loads with table of contents | ❌ failed | 5.1s | staging |
| Library documentation links are accessible | ❌ failed | 5.0s | staging |
| Code examples are properly formatted | ❌ failed | 5.0s | staging |
| Documentation breadcrumbs navigation works | ❌ failed | 5.0s | staging |
| Documentation version switcher works | ❌ failed | 5.1s | staging |
| Documentation search within docs works | ❌ failed | 5.7s | staging |
| Documentation anchor links work correctly | ✅ passed | 2.5s | staging |
| Documentation external links open correctly | ✅ passed | 2.4s | staging |
| Documentation page titles are descriptive | ✅ passed | <1s | staging |
| Documentation PDF/print versions are accessible | ❌ failed | 5.0s | staging |


---

## 📈 History (Last 10 Runs)
| Date | Pass Rate | Duration | Failures |
|------|-----------|----------|----------|
| Oct 1 | 12.9% | 2m 48s | 27 |
| Sep 22 | 16.0% | 1m 11s | 21 |

---
