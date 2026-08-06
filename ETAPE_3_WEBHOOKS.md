# ✅ ÉTAPE 3 : Webhooks Shopify (Synchronisation Temps Réel)

## 📌 Résumé

Les webhooks Shopify permettent de synchroniser les commandes et clients en **temps réel** dès qu'ils sont créés ou modifiés dans votre boutique, sans avoir besoin de poller l'API.

## 🔧 Architecture

```
Shopify Store
    ↓
    ├── Nouvelle commande créée
    ├── Webhook POST → https://votre-domaine.com/api/webhooks/shopify
    │
    ↓ (Vérification signature)
    
    ↓ (Traitement)
    ├── handleOrderCreate()
    ├── Mise à jour DB
    └── Log webhook
    
    ↓
Votre CRM (à jour en temps réel)
```

## 📦 Services créés

### 1. **`src/lib/webhook-verify.ts`**
- `verifyShopifyWebhook()` : Valide la signature HMAC-SHA256
- Sécurité : s'assure que les webhooks viennent bien de Shopify

### 2. **`src/lib/webhook-handlers.ts`**
- `handleOrderCreate()` : Crée/met à jour les commandes
- `handleCustomerCreate()` : Crée/met à jour les clients
- `logWebhook()` : Archive les webhooks dans la BD

### 3. **Routes API**
```
POST   /api/webhooks/shopify          ← Reçoit les webhooks Shopify
POST   /api/webhooks/register         ← Enregistre les webhooks auprès de Shopify
GET    /api/webhooks/register         ← Liste les webhooks enregistrés
GET    /api/webhooks/logs             ← Consulte les logs des webhooks traités
```

## 🚀 Configuration des Webhooks

### Étape 1 : Déployer votre CRM (IMPORTANT!)

Les webhooks Shopify doivent pouvoir atteindre une URL publique. Avant de continuer :

**Option A : Déployer sur Vercel (recommandé)**
```bash
cd maison-pasha-crm
npm run build
# Puis pousser sur GitHub et connecter à Vercel
```

Votre CRM sera accessible à : `https://votre-app.vercel.app`

**Option B : Tunnel ngrok (développement)**
```bash
# Terminal séparé
ngrok http 3000
# Vous obtenez une URL comme : https://abc123.ngrok.io
```

**Option C : Deployment local (test)**
- Localhost ne fonctionne pas (pas accessible de l'extérieur)
- Shopify ne peut pas envoyer les webhooks

### Étape 2 : Enregistrer les Webhooks

Une fois déployé, enregistrer les webhooks en faisant une requête POST :

```bash
curl -X POST http://localhost:3000/api/webhooks/register

# Réponse (exemple) :
{
  "success": true,
  "message": "Webhook registration completed",
  "webhookUrl": "https://votre-app.vercel.app/api/webhooks/shopify",
  "results": [
    {
      "topic": "orders/create",
      "success": true,
      "data": { ... }
    },
    {
      "topic": "orders/updated",
      "success": true,
      "data": { ... }
    },
    ...
  ]
}
```

### Étape 3 : Vérifier les Webhooks Enregistrés

```bash
curl http://localhost:3000/api/webhooks/register

# Voir tous les webhooks actuellement enregistrés auprès de Shopify
```

### Étape 4 : Tester les Webhooks

**Depuis le Shopify Admin :**
1. Settings > Apps and integrations > Develop apps
2. Votre custom app > Configuration
3. Webhooks > Test webhook → "Send test notification"

**Vérifier les logs :**
```bash
curl "http://localhost:3000/api/webhooks/logs?limit=10"

# Vous devriez voir :
# [
#   {
#     "topic": "orders/create",
#     "shopifyId": "123456",
#     "processed": true,
#     "data": { ... },
#     "createdAt": "2024-02-01T..."
#   }
# ]
```

## 📊 Webhooks Gérés

### **orders/create**
Déclenché quand une nouvelle commande est passée.
```json
{
  "id": 123456789,
  "order_number": 1001,
  "customer": { ... },
  "line_items": [ ... ],
  "total_price": "299.99",
  "financial_status": "paid",
  "currency": "AED"
}
```

**Action :** Crée la commande + le client dans le CRM

### **orders/updated**
Déclenché quand une commande est modifiée.

**Action :** Met à jour le statut et les infos de la commande

### **customers/create**
Déclenché quand un nouveau client est créé.

**Action :** Ajoute le client au CRM

### **customers/update**
Déclenché quand les infos client sont modifiées.

**Action :** Met à jour le client

## 🔐 Sécurité

### Vérification de Signature
Chaque webhook Shopify inclut un header `X-Shopify-HMAC-SHA256` :
```
X-Shopify-HMAC-SHA256: base64(HMAC-SHA256(body, api_secret))
```

Notre code vérifie cette signature avant de traiter le webhook :
```typescript
if (!verifyShopifyWebhook(rawBody, signature)) {
  return 401; // Rejecter le webhook
}
```

### API Scopes Requis
Dans votre custom app Shopify, assurez-vous que les scopes suivants sont activés :
```
✅ read_customers
✅ read_orders
✅ read_products
✅ write_webhooks  (important!)
```

## 🐛 Débogage

### Voir tous les webhooks Shopify enregistrés
```bash
curl http://localhost:3000/api/webhooks/register
```

### Voir les derniers webhooks traités
```bash
curl "http://localhost:3000/api/webhooks/logs?limit=20"
```

### Filtrer par topic
```bash
curl "http://localhost:3000/api/webhooks/logs?topic=orders%2Fcreate"
```

### Logs serveur
Regardez la console du serveur Next.js pour voir les logs détaillés :
```
📨 Webhook received: orders/create
   ID: 123456789
📦 Processing order #1001
✅ Order #1001 synced successfully
```

## 📋 Flux Complet

1. **Nouvelle commande sur Shopify** → 
2. **Webhook POST envoyé** → `https://votre-app.vercel.app/api/webhooks/shopify`
3. **Signature vérifiée** (HMAC-SHA256)
4. **Données extraites** (client, commande, articles)
5. **Client créé/mis à jour** dans la BD
6. **Commande créée/mise à jour** dans la BD
7. **Articles liés** à la commande
8. **Webhook loggé** pour audit
9. **Réponse 200 OK** envoyée à Shopify

### ⏱️ Temps : ~100ms (immédiat)

## 🎯 Prochaines Étapes

- ✅ Étape 1 : Setup Base de Données
- ✅ Étape 2 : Connexion API Shopify
- ✅ **Étape 3 : Webhooks Shopify** → **COMPLÉTÉ**
- ⬜ **Étape 4** : Authentification UI (login/signup)
- ⬜ Étape 5 : Interface CRM (dashboard, clients)
- ⬜ Étape 6 : Notifications fournisseur (email à Mandy)
- ⬜ Étape 7 : Fidélité et notes
- ⬜ Étape 8 : Déploiement Vercel

---

**Prêt pour l'étape 4 : Authentification UI** 🚀

Nous allons créer les pages de login/signup pour accéder au CRM.
