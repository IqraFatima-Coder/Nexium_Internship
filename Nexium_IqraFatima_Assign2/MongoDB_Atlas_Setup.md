# MongoDB Atlas Setup Guide for Assignment 2

## 🔧 MongoDB Atlas Configuration Steps

### 1. **Database Access Setup**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Select your project (should show Cluster0)
4. Navigate to **Database Access** in the left sidebar
5. Verify user `iqrafatima` exists with password access
6. Ensure the user has **Read and write to any database** permissions

### 2. **Network Access Configuration**
1. Navigate to **Network Access** in the left sidebar
2. Add your current IP address (or `0.0.0.0/0` for development - **NOT for production**)
3. Click **Add IP Address** > **Add Current IP Address**
4. Save the configuration

### 3. **Database and Collection Setup**
1. Navigate to **Database** (formerly "Clusters")
2. Click **Browse Collections** on your Cluster0
3. You should see your database and collections here

### 4. **Viewing Your Data**
- Database name: Will be created automatically when first document is inserted
- Collection name: `blogcontents` (from your BlogContent model)
- You can browse, edit, and manage documents directly in the Atlas interface

### 5. **Connection String Verification**
Your current connection string is:
```
mongodb+srv://iqrafatima:0NvV5JdGsNmqJJ2f@cluster0.ynkki1g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

✅ **This looks correct!**

## 🔍 **Testing Your Connection**

### Test 1: Verify Environment Variables
Your `.env.local` file should contain:
```bash
MONGODB_URI=mongodb+srv://iqrafatima:0NvV5JdGsNmqJJ2f@cluster0.ynkki1g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Test 2: Check Database Connection
Use our verification system at: `http://localhost:3000/verify`

### Test 3: Manual Test
You can also test manually:
1. Go to your app
2. Submit a blog URL for summarization
3. Check MongoDB Atlas > Browse Collections
4. You should see the full content stored in `blogcontents` collection

## 📊 **What You'll See in MongoDB Atlas**

### Collection Structure: `blogcontents`
```json
{
  "_id": "ObjectId(...)",
  "url": "https://example.com/blog-post",
  "content": "Full scraped text content goes here...",
  "title": "Blog Post Title",
  "summary": "Generated summary",
  "createdAt": "2025-01-07T...",
  "updatedAt": "2025-01-07T..."
}
```

### Expected Data Flow:
1. **User submits URL** → App scrapes content
2. **Full text content** → Stored in MongoDB
3. **Generated summary** → Stored in Supabase
4. **Urdu translation** → Also stored in Supabase

## 🚨 **Common Issues & Solutions**

### Issue 1: "Authentication failed"
- Verify username/password in connection string
- Check Database Access permissions in Atlas

### Issue 2: "Connection timeout"
- Check Network Access IP whitelist
- Ensure your IP is allowed

### Issue 3: "Database not visible"
- Database only appears after first document insertion
- Try submitting a test blog URL first

### Issue 4: "Read-only access"
- Verify user has "Read and write" permissions
- Check user roles in Database Access

## 🎯 **Assignment 2 Requirements Verification**

According to your assignment:
- ✅ **Full text in MongoDB**: Stored in `blogcontents` collection
- ✅ **Summary in Supabase**: Stored in `blog_summaries` table
- ✅ **Urdu translation**: JS dictionary + Google Translate API

## 🔗 **Quick Links**
- [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
- [Your Cluster0](https://cloud.mongodb.com/v2/675c5b47e36d1171ddaa3df2#/clusters)
- [Database Access](https://cloud.mongodb.com/v2/675c5b47e36d1171ddaa3df2#/database/users)
- [Network Access](https://cloud.mongodb.com/v2/675c5b47e36d1171ddaa3df2#/network/access)

---

**Next Step**: Run the verification tool at `/verify` to test all connections!
