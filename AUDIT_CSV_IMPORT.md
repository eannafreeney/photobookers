# CSV Import Feature Audit Report

**Date**: 2026-06-22  
**Feature**: CSV book import with bulk cover upload  
**Branch**: csv-importer

---

## Executive Summary

The CSV import feature is **generally well-implemented** with good separation of concerns, proper validation, and security measures. However, there are **several critical issues** that should be addressed before merging to production.

**Risk Level**: 🟡 MEDIUM (6 critical, 8 high-priority, 12 medium issues identified)

---

## 🔴 Critical Issues

### 1. **Authorization Bypass in Creator Stub Creation** ⚠️ SECURITY
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Lines**: 49, 67

**Issue**: The `createStubCreatorProfileAdmin` function is being called from a non-admin context. Regular creators can create stub creator profiles for artists/publishers they don't own.

```typescript
// Called by regular creators, not admins
const [err, created] = await createStubCreatorProfileAdmin(
  artistName,
  userId,
  "artist",
);
```

**Impact**: Regular users can pollute the creator database with stub profiles that might conflict with real creator signups.

**Recommendation**: 
- Create a separate `createStubCreatorProfile` function for non-admin use OR
- Add proper permission checks in `createStubCreatorProfileAdmin` OR
- Use existing creator lookup and require manual linking for unknown creators

---

### 2. **SQL Injection via ILIKE Query** ⚠️ SECURITY
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Line**: 36

**Issue**: User input (artist/publisher names from CSV) is passed to `ilike()` without sanitization. While Drizzle helps, special characters like `%` and `_` act as wildcards.

```typescript
.where(ilike(creators.displayName, trimmed))
```

**Impact**: Users could craft artist names like `%` to match all creators, or use `_` for partial matching.

**Recommendation**: Escape ILIKE special characters or use exact match with case-insensitive comparison:
```typescript
.where(sql`LOWER(${creators.displayName}) = LOWER(${trimmed})`)
```

---

### 3. **Sequential Database Operations (N+1 Problem)** 🐌 PERFORMANCE
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Lines**: 124-175

**Issue**: Books are imported sequentially in a loop with multiple DB calls per iteration. For 100 books, this could mean 400+ sequential queries.

```typescript
for (const row of rows) {
  // Multiple await calls per iteration
  const [resolveError, artist, publisher] = await resolveCreatorsForImportRow(...);
  const bookData = await buildCreateBookData(...);
  const book = await createBook(...);
  await notifyAdminBookPendingReview(...);
}
```

**Impact**: Import of 100 books could take 30+ seconds. Timeout risk.

**Recommendation**: 
- Batch creator resolution before the loop
- Use `Promise.all()` for parallel operations where safe
- Consider database transactions
- Add progress indicator for user feedback

---

### 4. **Memory Leak in File Preview URLs** 🐛 MEMORY
**File**: `src/client/components/bulkCoverUpload.ts`  
**Lines**: 43-48

**Issue**: `URL.createObjectURL()` creates blob URLs that are never revoked, causing memory leaks.

```typescript
getFilePreview(file: File): string {
  const key = `${file.name}_${file.size}`;
  if (!this.filePreviews[key]) {
    this.filePreviews[key] = URL.createObjectURL(file);
  }
  return this.filePreviews[key];
}
```

**Impact**: Each preview image leaks memory. For 50 books × 10 images = 500 blob URLs in memory.

**Recommendation**: Add cleanup in component destruction:
```typescript
cleanup() {
  Object.values(this.filePreviews).forEach(url => URL.revokeObjectURL(url));
  this.filePreviews = {};
}
```

---

### 5. **Unvalidated Image Upload Size** 🔒 SECURITY / PERFORMANCE
**File**: `src/fs-routes/dashboard/books/import/covers/upload.tsx`  
**Lines**: 82-104

**Issue**: No file size validation before uploading images. User could upload 100 books × 10 images of 50MB each = 50GB upload.

**Impact**: 
- Server DoS
- Storage quota exhaustion
- Long upload times causing timeouts

**Recommendation**: Add per-file and total upload size limits:
```typescript
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_UPLOAD = 100 * 1024 * 1024; // 100MB total
```

---

### 6. **Case-Sensitive Creator Matching** 🐛 DATA INTEGRITY
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Line**: 39

**Issue**: After `ilike` returns multiple matches, `find()` does exact case-sensitive comparison for type filtering.

```typescript
return existing.find((c) => c.type === type) ?? null;
```

**Impact**: Could create duplicate artist profiles: "John Doe" (artist) vs "john doe" (artist) if they come from different CSV imports.

**Recommendation**: Add proper case-insensitive unique constraints in DB or normalize names before lookup.

---

## 🟠 High Priority Issues

### 7. **No Transaction Rollback on Partial Failures**
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Lines**: 116-178

**Issue**: If book creation succeeds but notification fails, the book exists but admin is never notified.

**Recommendation**: Wrap in database transaction or implement compensating actions.

---

### 8. **Hidden Form Data Manipulation Risk**
**File**: `src/features/dashboard/books/import/components/BookImportForm.tsx`  
**Lines**: 83-88

**Issue**: Validated rows are passed as JSON in a hidden form field. Users could modify this in DevTools to bypass validation.

```typescript
<input type="hidden" name="rows_json" value={JSON.stringify(validRows)} />
```

**Recommendation**: Server must re-validate ALL data (currently does with Zod, which is good) and never trust client data. Add CSRF token validation.

---

### 9. **Undefined Behavior on Empty Artist Names**
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Line**: 87

**Issue**: `row.artist ?? ""` passes empty string to `resolveArtistByName`, which then tries to create a creator with empty name.

```typescript
const [artistError, artist] = await resolveArtistByName(
  row.artist ?? "",  // Empty string allowed
  user.id,
);
```

**Recommendation**: Early validation:
```typescript
if (!row.artist?.trim()) {
  return ["Artist name is required for publisher imports", null, null];
}
```

---

### 10. **Incorrect Image Type Validation**
**File**: `src/fs-routes/dashboard/books/import/covers/upload.tsx`  
**Line**: 71

**Issue**: `removeInvalidImages(file)` function name suggests it removes images, but it's used as a boolean check. Confusing API.

```typescript
if (file && removeInvalidImages(file)) {
  imageFiles.push(file as File);
}
```

**Recommendation**: Rename to `isValidImage(file)` or review the function to understand its actual behavior.

---

### 11. **Race Condition in Book Ownership Check**
**File**: `src/fs-routes/dashboard/books/import/covers/upload.tsx`  
**Lines**: 38-48

**Issue**: Books are verified at request start, but could be transferred/deleted before processing. Window of several seconds.

**Recommendation**: Re-verify ownership before each book's cover update operation.

---

### 12. **No Rate Limiting on Import Endpoint**
**File**: `src/fs-routes/dashboard/books/import.tsx`

**Issue**: Users could spam CSV imports (100 books × N requests) to create thousands of stub creators or books.

**Recommendation**: Add rate limiting (e.g., 5 imports per hour per user).

---

### 13. **Ambiguous Error Messages**
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Lines**: 135, 157

**Issue**: Generic "Could not resolve creators" and "Failed to create book" don't help users debug.

**Recommendation**: Return specific error messages from DB/service layer.

---

### 14. **Missing MIME Type Validation**
**File**: `src/client/components/bulkCoverUpload.ts`  
**Line**: 29

**Issue**: Only checks `file.type.startsWith("image/")` which can be spoofed. Malicious user could upload `.exe` with MIME `image/png`.

**Recommendation**: Server-side magic byte validation in addition to client-side filtering.

---

## 🟡 Medium Priority Issues

### 15. **CSV Injection Risk**
**File**: `src/features/dashboard/books/import/parseCsv.ts`

**Issue**: CSV values starting with `=`, `+`, `@`, `-` could be executed as formulas in Excel/Sheets when exported.

**Recommendation**: Sanitize values starting with formula characters on export/template.

---

### 16. **No Duplicate Detection**
**File**: `src/features/dashboard/books/import/importBooks.ts`

**Issue**: Same CSV can be imported multiple times, creating duplicate books. No uniqueness check on title+artist.

**Recommendation**: Check for existing books with same title+artist before creating. Show warning to user.

---

### 17. **Large Gallery Image Count**
**File**: `src/client/components/bulkCoverUpload.ts`  
**Line**: 34

**Issue**: Max 10 images per book is enforced client-side only. Server doesn't validate.

**Recommendation**: Add server-side validation in `covers/upload.tsx`.

---

### 18. **Missing Image Alt Text**
**File**: `src/features/dashboard/books/import/components/BulkCoverUpload.tsx`

**Issue**: Image previews use filename as alt text, not descriptive.

**Recommendation**: Use book title or "Cover preview for {title}".

---

### 19. **No Progress Feedback for Long Operations**
**Files**: Import and upload operations

**Issue**: User sees no progress during 30+ second imports. Appears frozen.

**Recommendation**: Add SSE or polling for real-time progress updates.

---

### 20. **Inconsistent Error Handling**
**File**: Multiple files

**Issue**: Some functions return `[error, null]` tuples, others throw, others return `{ ok: false }`.

**Recommendation**: Standardize on one error handling pattern across import module.

---

### 21. **Missing Accessibility Labels**
**File**: `src/features/dashboard/books/import/components/BulkCoverUpload.tsx`

**Issue**: Dropzones and buttons lack ARIA labels for screen readers.

**Recommendation**: Add `aria-label` and `aria-describedby` attributes.

---

### 22. **Weak File Extension Matching**
**File**: `src/features/dashboard/books/import/matchCovers.ts`  
**Line**: 42

**Issue**: Removes extension with simple regex that could fail on edge cases like `file.backup.jpg.txt`.

**Recommendation**: Use `path.parse()` or more robust extension extraction.

---

### 23. **No Audit Logging**
**Files**: Import operations

**Issue**: No audit trail for bulk operations. Can't track who imported what when.

**Recommendation**: Log import events with user ID, row count, and timestamp.

---

### 24. **Hardcoded Alert Messages**
**File**: `src/client/components/bulkCoverUpload.ts`  
**Lines**: 39, 111, 116

**Issue**: User-facing messages in JavaScript, not i18n-ready.

**Recommendation**: Extract to constants or i18n system.

---

### 25. **Missing Database Indexes**
**Impact**: Creator lookups with `ilike` on `displayName` will be slow without index.

**Recommendation**: Add case-insensitive index:
```sql
CREATE INDEX idx_creators_display_name_lower ON creators (LOWER(display_name));
```

---

### 26. **Unclear Moderation Flow**
**File**: `src/features/dashboard/books/import/importBooks.ts`  
**Lines**: 160-166

**Issue**: Books with pending approval are created but users might not understand they're not visible yet.

**Recommendation**: Add clear messaging: "X books created (Y pending review)".

---

## ✅ Good Practices Observed

1. ✅ **Zod validation** on both client and server
2. ✅ **Type safety** throughout with TypeScript
3. ✅ **Test coverage** for critical parsing/matching logic
4. ✅ **Modular architecture** with clear separation of concerns
5. ✅ **Reuse of existing services** (`buildCreateBookData`, `createBook`)
6. ✅ **User feedback** with flash messages and detailed error display
7. ✅ **CSV format flexibility** (semicolon and comma delimiters)
8. ✅ **Header normalization** for user-friendly CSV column names
9. ✅ **File size limits** on CSV upload (1MB)
10. ✅ **Row count limits** (100 rows per import)

---

## Recommended Actions Before Merge

### Must Fix (Blocking)
1. ❌ Fix creator stub authorization (#1)
2. ❌ Escape ILIKE wildcards (#2)
3. ❌ Add image size validation (#5)
4. ❌ Fix memory leak in previews (#4)

### Should Fix (High Priority)
5. 🟡 Add transaction handling (#7)
6. 🟡 Validate artist name not empty (#9)
7. 🟡 Add rate limiting (#12)
8. 🟡 Improve error messages (#13)
9. 🟡 Server-side MIME validation (#14)

### Nice to Have (Medium Priority)
10. 🟢 Batch/parallelize DB operations (#3)
11. 🟢 Duplicate detection (#16)
12. 🟢 Progress indicators (#19)
13. 🟢 Audit logging (#23)
14. 🟢 Database indexes (#25)

---

## Testing Recommendations

### Manual Testing Checklist
- [ ] Import 100 rows (max limit)
- [ ] Import with special characters in artist names (`%`, `_`, `;`, `'`)
- [ ] Upload 10 images per book (max)
- [ ] Upload very large images (>10MB each)
- [ ] Try to import someone else's books via URL manipulation
- [ ] Import same CSV twice (duplicate detection)
- [ ] Import with missing required fields
- [ ] Import with invalid dates, long descriptions
- [ ] Test CSV with semicolon delimiters
- [ ] Test CSV with Unicode characters
- [ ] Interrupt upload mid-operation
- [ ] Test with slow connection (timeout behavior)

### Additional Automated Tests Needed
- [ ] Integration test for full import flow
- [ ] Security test for creator authorization
- [ ] Load test for 100-row import performance
- [ ] Test for memory leak in file previews
- [ ] Test ILIKE special character handling

---

## Performance Metrics

**Current Estimated Performance** (pessimistic):
- CSV parsing: ~100ms
- Validation: ~50ms  
- Import 100 books: ~30-40s (sequential DB operations)
- Upload 100 covers: ~20-30s (depends on image sizes)
- Total for max import: **~60-90 seconds**

**Risk**: Timeout on slower connections or under load.

**Recommended Improvements**:
- Target: Import 100 books in <10s
- Strategy: Batch DB operations, use transactions, parallelize safe operations

---

## Security Checklist

- [x] Input validation with Zod
- [x] SQL parameterization (Drizzle)
- [ ] ⚠️ ILIKE escape characters
- [ ] ⚠️ Authorization on creator stub creation
- [x] File size limits (CSV)
- [ ] ⚠️ File size limits (images) 
- [x] File type validation (client)
- [ ] ⚠️ File type validation (server magic bytes)
- [ ] ⚠️ Rate limiting
- [ ] ⚠️ CSRF protection on confirm form
- [x] User ownership verification (books)
- [ ] ⚠️ Race condition in ownership check

**Security Score**: 6/12 ✅ (50%)

---

## Conclusion

The CSV import feature demonstrates **solid engineering fundamentals** but has **several security and performance concerns** that should be addressed before production deployment. 

The architecture is sound, testing is adequate for core logic, and user experience is well-considered. With the recommended fixes, this feature will be production-ready.

**Recommendation**: Request changes, merge after critical issues resolved.

---

**Auditor Notes**: This audit focused on the git diff from the csv-importer branch. Pre-existing issues in related services (e.g., `createStubCreatorProfileAdmin` permissions) are noted but may require separate PRs to fix.
