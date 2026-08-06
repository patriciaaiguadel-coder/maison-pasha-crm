# 🚀 Maison Pasha CRM - Deployment Guide

## Configuration Vercel (CRITICAL)

### 1. Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
NEXTAUTH_URL=https://maison-pasha.vercel.app
NEXTAUTH_SECRET=nzYWBYm9ZPQU91ok7NGH/fhEqGow17nWedNGEmCQZmM=
SHOPIFY_STORE=your-store.myshopify.com
SHOPIFY_ADMIN_API_KEY=your-admin-api-key
SHOPIFY_ADMIN_API_PASSWORD=your-admin-api-password
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret-from-shopify
ANTHROPIC_API_KEY=sk-ant-your-key
RESEND_API_KEY=re_your-resend-key
RESEND_FROM_EMAIL=noreply@maison-pasha.com
```

### 2. Get NEXTAUTH_SECRET

Generate a new secret:
```bash
openssl rand -base64 32
```

Paste the output in Vercel → NEXTAUTH_SECRET

### 3. Shopify Configuration

1. **Get Webhook Secret:**
   - Go to Shopify Admin → Apps and Integrations → App and Integration Settings
   - Find "Maison Pasha CRM"
   - Copy the Webhook Secret
   - Paste in Vercel → SHOPIFY_WEBHOOK_SECRET

2. **Webhook Setup:**
   - Ensure webhook URL is: `https://maison-pasha.vercel.app/api/webhooks/shopify`
   - Topics: orders/create, orders/updated

### 4. Claude API Setup

1. Go to https://console.anthropic.com/
2. Create API key
3. Paste in Vercel → ANTHROPIC_API_KEY

### 5. Email Configuration (Resend)

1. Go to https://resend.com
2. Create API key
3. Add to Vercel:
   - RESEND_API_KEY = your key
   - RESEND_FROM_EMAIL = your domain email

## Database Setup (PostgreSQL)

### Using Neon:
1. Go to https://neon.tech
2. Create database
3. Copy connection string
4. Paste in Vercel → DATABASE_URL

### Run migrations:
```bash
npm run db:push
```

## Testing

### 1. Test Authentication:
```bash
curl -X POST https://maison-pasha.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### 2. Test Shopify Webhook:
```bash
curl -X POST https://maison-pasha.vercel.app/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-SHA256: test" \
  -d '{"id":"123","customer":{"first_name":"Test"}}'
```

### 3. Test Email:
Visit `/api/notifications/test` to send test email

### 4. Test Sourcing Agent:
Visit `/dashboard/sourcing` and click "Launch Agent"

## Monitoring

### Check Logs:
```bash
vercel logs
```

### Monitor Webhooks:
- Dashboard → Logs → Filter by `/webhooks/shopify`

### Monitor API Calls:
- Dashboard → Logs → Filter by `/api/`

## Security Checklist

- ✅ .env.local in .gitignore
- ✅ All secrets in Vercel (not in git)
- ✅ NEXTAUTH_SECRET is 32+ chars
- ✅ SHOPIFY_WEBHOOK_SECRET configured
- ✅ Database credentials secure
- ✅ API authentication enabled
- ✅ Webhook signature verification enabled

## Performance Optimization

### 1. Database Indexing:
Already optimized in schema.prisma

### 2. API Rate Limiting:
Implemented at middleware level

### 3. Caching:
- Next.js ISR (Incremental Static Regeneration)
- Redis optional for session store

### 4. Image Optimization:
- Next.js Image component used throughout

## Troubleshooting

### Issue: "SHOPIFY_WEBHOOK_SECRET not set"
**Solution:** Add SHOPIFY_WEBHOOK_SECRET to Vercel environment

### Issue: "ANTHROPIC_API_KEY not found"
**Solution:** Add ANTHROPIC_API_KEY to Vercel environment

### Issue: "Database connection failed"
**Solution:** Check DATABASE_URL format and network access

### Issue: "Email not sending"
**Solution:** Verify RESEND_API_KEY and RESEND_FROM_EMAIL

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Set up Shopify webhooks
4. ✅ Test all integrations
5. ✅ Create initial admin account
6. ✅ Sync Shopify data
7. ✅ Enable sourcing agent
8. ✅ Monitor logs

---

**Questions?** Check the logs in Vercel dashboard for detailed error messages.
