# CSV Import Feature - Security & Limits Audit

**Date**: 2026-06-22  
**Branch**: csv-importer  
**Focus**: Import limits, rate limiting, and security controls

---

## 🚨 CRITICAL FINDINGS - Import Limits

### ⚠️ CRITICAL #1: No Server-Side Enforcement of Images Per Book
**Severity**: 🔴 CRITICAL  
**Files**: 
- `src/client/components/bulkCoverUpload.ts` (line 34)
- `src/fs-routes/dashboard/books/import/covers/upload.tsx` (line 63)

**Issue**: The 10-image-per-book limit is only enforced client-side. A malicious user can bypass this by:
1. Modifying the `count` field in the FormData
2. Adding more `book_${bookId}_image_${index}` fields
3. Sending 100+ images per book

```typescript
// Client-side only (easily bypassed)
const maxImages = 10;
this.bookImages[bookId] = combined.slice(0, maxImages);

// Server accepts any count
const count = parseInt(String(body[countKey] ?? "0"));
// NO VALIDATION that count <= 10
```

**Impact**: 
- Attacker uploads 100 books × 1000 images = 100,000 images
- Storage exhaustion
- Database flooding (100k rows in bookImages table)
- Server CPU/memory exhaustion from processing

**Fix Required**:
```typescript
// In covers/upload.tsx
const MAX_IMAGES_PER_BOOK = 10;
const count = parseInt(String(body[countKey] ?? "0"));

if (count > MAX_IMAGES_PER_BOOK) {
  await setFlash(c, "danger", `Maximum ${MAX_IMAGES_PER_BOOK} images per book`);
  return c.redirect("/dashboard/books");
}
```

---

### ⚠️ CRITICAL #2: No Total Upload Size Limit
**Severity**: 🔴 CRITICAL  
**Files**: `src/fs-routes/dashboard/books/import/covers/upload.tsx`

**Issue**: No limit on total upload size across all books. User can upload:
- 100 books × 10 images × 50MB each = **50GB in one request**

**Current State**:
- CSV upload: ✅ Limited to 1MB
- Individual book images: ✅ Limited via sharp processing
- **BULK upload**: ❌ NO LIMIT

**Impact**:
- Server DoS from memory exhaustion
- Long-running requests causing timeouts
- Network bandwidth saturation
- Storage quota exhaustion

**Fix Required**:
```typescript
const MAX_TOTAL_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB total
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image

// Validate each file size
for (let i = 0; i < count; i++) {
  const file = body[key] as File;
  if (file.size > MAX_IMAGE_SIZE) {
    errors.push(`Image ${i+1} exceeds ${MAX_IMAGE_SIZE/1024/1024}MB limit`);
  }
  totalSize += file.size;
}

if (totalSize > MAX_TOTAL_UPLOAD_SIZE) {
  await setFlash(c, "danger", "Total upload size exceeds 100MB");
  return c.redirect("/dashboard/books");
}
```

---

### ⚠️ CRITICAL #3: No Rate Limiting on Import Endpoints
**Severity**: 🔴 CRITICAL  
**Files**: 
- `src/fs-routes/dashboard/books/import.tsx`
- `src/fs-routes/dashboard/books/import/covers/upload.tsx`

**Issue**: Users can spam imports infinitely:
- Import 100 books → Import 100 books → Import 100 books (repeat)
- No cooldown between imports
- No daily/hourly limits

**Attack Scenarios**:
1. **Stub Creator Pollution**: Import 1000 CSVs with different artist names = 100,000 stub creators
2. **Database Flooding**: Create millions of draft books
3. **Admin Notification Spam**: Trigger thousands of moderation notifications
4. **Storage Exhaustion**: Upload terabytes of images via repeated bulk uploads

**Current Limits**:
- ✅ 100 rows per CSV
- ✅ 1MB CSV file size
- ❌ NO limit on number of imports per hour/day
- ❌ NO limit on total books created per day

**Fix Required**:
```typescript
// Add to constants.ts
export const MAX_IMPORTS_PER_HOUR = 5;
export const MAX_BOOKS_PER_DAY = 500;
export const MAX_COVER_UPLOADS_PER_HOUR = 10;

// Implement rate limiting middleware or check in route:
const recentImports = await db
  .select()
  .from(bookImports) // needs new table
  .where(
    and(
      eq(bookImports.userId, user.id),
      gte(bookImports.createdAt, new Date(Date.now() - 3600000))
    )
  );

if (recentImports.length >= MAX_IMPORTS_PER_HOUR) {
  return c.html(
    <Alert type="danger" message="Rate limit exceeded. Try again in 1 hour." />
  );
}
```

---

### 🟠 HIGH #4: Sequential DB Operations Cause Timeout Risk
**Severity**: 🟠 HIGH  
**File**: `src/features/dashboard/books/import/importBooks.ts` (lines 124-175)

**Issue**: Imports run sequentially with multiple DB queries per book:
```typescript
for (const row of rows) {
  // 3-5 DB queries per iteration
  const [resolveError, artist, publisher] = await resolveCreatorsForImportRow();
  const bookData = await buildCreateBookData();
  const book = await createBook();
  await notifyAdminBookPendingReview();
}
```

**Performance Analysis**:
- 100 rows × 4 queries × 50ms = **20 seconds minimum**
- With network latency: 30-60 seconds
- Hono default timeout: typically 30 seconds
- **RESULT: Imports of 75+ books will likely timeout**

**Additional Issues**:
1. No transaction: partial failures leave inconsistent state
2. No batch creator resolution: same artist queried 100 times
3. No progress indicator: users think it's frozen

**Fix Priority**: HIGH (not critical, but will cause user frustration)

**Recommended Fix**:
1. Batch creator resolution before loop
2. Use database transactions
3. Add progress tracking via SSE or polling endpoint
4. Consider background job queue for large imports

---

### 🟠 HIGH #5: BookIds Array Not Validated
**Severity**: 🟠 HIGH  
**File**: `src/fs-routes/dashboard/books/import/covers.tsx` (line 39)

**Issue**: No limit on number of book IDs in query string:
```typescript
const bookIds = bookIdsParam.split(",").filter(Boolean);
// NO CHECK: if (bookIds.length > MAX_BOOKS_FOR_COVER_UPLOAD)
```

**Attack**:
```
/dashboard/books/import/covers?books=id1,id2,id3,...(10,000 IDs)
```

**Impact**:
1. SQL `IN` clause with 10k items = slow query
2. Large response rendering 10k dropzones = browser crash
3. DB connection held open for extended period

**Fix Required**:
```typescript
const MAX_BOOKS_FOR_BULK_UPLOAD = 100;

if (bookIds.length > MAX_BOOKS_FOR_BULK_UPLOAD) {
  return c.html(
    <InfoPage 
      errorMessage={`Maximum ${MAX_BOOKS_FOR_BULK_UPLOAD} books for bulk upload`}
      user={user}
    />
  );
}
```

---

### 🟠 HIGH #6: Memory Leak in File Previews
**Severity**: 🟠 HIGH  
**File**: `src/client/components/bulkCoverUpload.ts` (lines 43-48)

**Issue**: Blob URLs created but never revoked:
```typescript
getFilePreview(file: File): string {
  this.filePreviews[key] = URL.createObjectURL(file);
  // NEVER REVOKED
}
```

**Impact**:
- 100 books × 10 images = 1000 blob URLs
- Each holds file in memory
- Total: potentially 500MB-5GB leaked
- Browser slowdown/crash on large imports

**Fix Required**:
```typescript
// Add cleanup method
cleanup() {
  Object.values(this.filePreviews).forEach(url => URL.revokeObjectURL(url));
  this.filePreviews = {};
}

// Call on component destroy or before navigation
```

---

## 📊 Current Limit Summary

| Resource | Client Limit | Server Limit | Status |
|----------|--------------|--------------|--------|
| **CSV Rows** | None | ✅ 100 | GOOD |
| **CSV File Size** | None | ✅ 1MB | GOOD |
| **Images Per Book** | ✅ 10 | ❌ NONE | **CRITICAL** |
| **Image File Size** | None | ⚠️ Implicit (sharp) | WEAK |
| **Total Upload Size** | None | ❌ NONE | **CRITICAL** |
| **Imports Per Hour** | None | ❌ NONE | **CRITICAL** |
| **Books Per Day** | None | ❌ NONE | **CRITICAL** |
| **Books in Bulk Upload** | None | ❌ NONE | HIGH |
| **Cover Uploads Per Hour** | None | ❌ NONE | **CRITICAL** |

---

## 🔒 Additional Security Issues

### 🔴 CRITICAL #7: Creator Stub Authorization Bypass
**File**: `src/features/dashboard/books/import/importBooks.ts` (lines 49, 67)

**Issue**: Regular users calling admin-only function `createStubCreatorProfileAdmin`

**Impact**: Users can create fake creator profiles for anyone

**Fix**: Create separate non-admin function or add permission checks

---

### 🔴 CRITICAL #8: ILIKE Wildcard Injection  
**File**: `src/features/dashboard/books/import/importBooks.ts` (line 36)

**Issue**: Artist names with `%` or `_` act as SQL wildcards:
```typescript
.where(ilike(creators.displayName, trimmed))
// User inputs "%" → matches ALL creators
```

**Fix**: Escape wildcards or use exact case-insensitive match:
```typescript
.where(sql`LOWER(${creators.displayName}) = LOWER(${trimmed})`)
```

---

### 🟠 HIGH #9: No CSRF Protection on Confirm Form
**File**: `src/features/dashboard/books/import/components/BookImportForm.tsx` (line 85)

**Issue**: Hidden form with validated data can be manipulated:
```html
<input type="hidden" name="rows_json" value={JSON.stringify(validRows)} />
```

**Current Mitigation**: Server re-validates with Zod ✅  
**Remaining Risk**: CSRF attacks possible

**Fix**: Add CSRF token to form

---

### 🟡 MEDIUM #10: No Duplicate Import Detection
**File**: `src/features/dashboard/books/import/importBooks.ts`

**Issue**: Same CSV can be imported infinite times creating duplicates

**Impact**: Accidental duplicate books

**Fix**: Check for existing book with same title+artist before creating

---

### 🟡 MEDIUM #11: Client-Side Image Type Validation Only
**File**: `src/client/components/bulkCoverUpload.ts` (line 29)

**Issue**: Only checks MIME type which can be spoofed:
```typescript
files.filter((f) => f.type.startsWith("image/"))
```

**Current Mitigation**: `removeInvalidImages` does basic checks ✅  
**Missing**: Magic byte validation

**Fix**: Add server-side magic byte verification in addition to sharp processing

---

## 🎯 Recommended Action Plan

### Must Fix Before Merge (Blocking)
1. ❌ **Add server-side 10-image-per-book limit** (#1)
2. ❌ **Add total upload size limit (100MB)** (#2)
3. ❌ **Add per-image size limit (10MB)** (#2)
4. ❌ **Add rate limiting on import endpoints** (#3)
5. ❌ **Add bookIds array length validation** (#5)
6. ❌ **Fix creator stub authorization** (#7)
7. ❌ **Escape ILIKE wildcards** (#8)

### Should Fix (High Priority)
8. 🟡 **Fix memory leak in previews** (#6)
9. 🟡 **Add progress indicators** (#4)
10. 🟡 **Add CSRF tokens** (#9)
11. 🟡 **Improve error messages**
12. 🟡 **Add duplicate detection** (#10)

### Nice to Have (Medium Priority)
13. 🟢 **Batch DB operations** (#4)
14. 🟢 **Add audit logging**
15. 🟢 **Add magic byte validation** (#11)
16. 🟢 **Add monitoring/metrics**

---

## 📝 Required Constants File Updates

Create `src/features/dashboard/books/import/limits.ts`:

```typescript
// CSV Import Limits
export const MAX_IMPORT_ROWS = 100;
export const MAX_IMPORT_FILE_BYTES = 1 * 1024 * 1024; // 1MB

// Image Upload Limits
export const MAX_IMAGES_PER_BOOK = 10;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB

// Rate Limiting
export const MAX_IMPORTS_PER_HOUR = 5;
export const MAX_BOOKS_CREATED_PER_DAY = 500;
export const MAX_COVER_UPLOADS_PER_HOUR = 10;

// Bulk Operations
export const MAX_BOOKS_FOR_BULK_UPLOAD = 100;
```

---

## 🧪 Testing Checklist

### Limit Testing
- [ ] Try to import 101 rows (should fail)
- [ ] Try to upload CSV > 1MB (should fail)
- [ ] Try to upload 11 images to one book (should block at 10)
- [ ] Try to upload images > 10MB each (should fail)
- [ ] Try to upload 100 books with 10 images each (should fail if > 100MB total)
- [ ] Try to import 6 times in 1 hour (should rate limit)
- [ ] Try to access /import/covers?books=(1000 IDs) (should fail)

### Security Testing
- [ ] Try artist name with "%" wildcard
- [ ] Try to upload .exe file with image MIME type
- [ ] Modify hidden form `rows_json` in DevTools
- [ ] Import same CSV twice (duplicate detection)
- [ ] Try to upload images for someone else's books

### Performance Testing
- [ ] Import 100 rows (measure time)
- [ ] Upload 100 books × 5 images (measure time)
- [ ] Monitor memory during preview (check for leaks)

---

## 🎚️ Risk Assessment

**Overall Security Risk**: 🔴 **HIGH** (8/10)

**Breakdown**:
- Import Limits: 🔴 CRITICAL (3 critical issues)
- Rate Limiting: 🔴 CRITICAL (no limits)
- Authorization: 🔴 CRITICAL (bypass possible)
- Input Validation: 🟠 HIGH (SQL injection risk)
- Memory Safety: 🟠 HIGH (leaks present)
- Error Handling: 🟡 MEDIUM (acceptable)

**Recommendation**: ❌ **DO NOT MERGE** until critical issues are resolved

---

## 📈 Estimated Fix Effort

- **Critical Fixes (1-4, 7-8)**: ~4-6 hours
- **High Priority (6, 9-12)**: ~3-4 hours
- **Total Required**: ~7-10 hours
- **Additional Testing**: ~2-3 hours

**Target**: Complete critical fixes within 1 work day

---

**Auditor**: Claude Sonnet 4.5  
**Report Generated**: 2026-06-22 10:27 AM UTC+2
