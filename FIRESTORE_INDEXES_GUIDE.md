// Firestore Index Setup Guide for ScholarHunt

## The Issue

Your Firebase queries require composite indexes because you're using:

1. `where()` clause on a field
2. `orderBy()` clause on a different field

## Required Indexes

### For Blog Collection:

1. **Blog Status + CreatedAt**: `status` (ASC) + `createdAt` (DESC)
2. **Blog Status + Category + CreatedAt**: `status` (ASC) + `category` (ASC) + `createdAt` (DESC)

### For Scholarships Collection:

1. **Scholarship Status + CreatedAt**: `status` (ASC) + `createdAt` (DESC)
2. **Scholarship Status + Level + CreatedAt**: `status` (ASC) + `level` (ASC) + `createdAt` (DESC)
3. **Scholarship Status + Country + CreatedAt**: `status` (ASC) + `country` (ASC) + `createdAt` (DESC)

## Deployment Steps

### Option 1: Deploy via Firebase CLI (Recommended)

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy the indexes
firebase deploy --only firestore:indexes
```

### Option 2: Manual Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `verilyblog-d1235`
3. Go to Firestore Database > Indexes
4. Click "Create Index" for each required index above

### Option 3: Use the Direct Link (Immediate Fix)

Click this link to create the main blog index that's causing the current error:
https://console.firebase.google.com/v1/r/project/verilyblog-d1235/firestore/indexes?create_composite=Ck1wcm9qZWN0cy92ZXJpbHlibG9nLWQxMjM1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ibG9nL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI

## Files Created/Updated:

- ✅ `firebase.json` - Updated to include indexes configuration
- ✅ `firestore.indexes.json` - Complete index definitions
- ✅ This guide for deployment steps

## Expected Build Time:

Indexes typically take 2-10 minutes to build, depending on data size.
Since you have no data yet, they should build quickly.

## Verification:

After deployment, refresh your blog page. The error should be resolved!
