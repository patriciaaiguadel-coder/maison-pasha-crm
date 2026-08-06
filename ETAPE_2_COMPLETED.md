# ✅ ÉTAPE 2 TERMINÉE : Connexion API Shopify (Lecture Seule)

## Résumé

L'étape 2 du CRM Maison Pasha est maintenant **complète** ! Vous pouvez maintenant récupérer les clients et commandes existants de votre boutique Shopify.

### 📦 Packages installés

- ✅ `@shopify/shopify-api` : SDK officiel Shopify

### 🔗 Services Shopify créés

#### 1. **`src/lib/shopify.ts`** - Client API Shopify
- `shopifyGraphQL()` : Exécute des requêtes GraphQL vers Shopify Admin API
- `fetchShopifyOrders()` : Récupère les commandes avec pagination
- `fetchShopifyCustomers()` : Récupère les clients avec pagination
- `parseShopifyId()` : Extrait l'ID numérique des IDs globaux Shopify

#### 2. **`src/lib/shopify-sync.ts`** - Synchronisation Shopify → BD locale
- `syncShopifyCustomers()` : Importe tous les clients Shopify
- `syncShopifyOrders()` : Importe toutes les commandes + articles
- `fullShopifySyncInitial()` : Sync complète (clients puis commandes)

### 🛣️ Routes API créées

#### 1. **`POST /api/shopify/sync`**
- Lance la synchronisation initiale (tous les clients + commandes)
- Réponse : `{ success: true, data: { customers: 150, orders: 300 } }`
- ⚠️ TODO : Ajouter vérification d'authentification (admin only)

#### 2. **`GET /api/customers?page=1&limit=10&search=""`**
- Liste tous les clients avec pagination
- Paramètres :
  - `page` : numéro de page (défaut: 1)
  - `limit` : clients par page (défaut: 10)
  - `search` : recherche par email/prénom/nom
- Inclut les 5 dernières commandes par client

#### 3. **`GET /api/customers/[id]`**
- Détails complets d'un client
- Inclut : toutes les commandes + articles + notes CRM

#### 4. **`GET /api/orders?page=1&limit=20&status=PENDING&supplierStatus=PENDING`**
- Liste toutes les commandes avec pagination
- Filtres : `status` (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED)
- Filtres : `supplierStatus` (PENDING/PREPARING/READY/SHIPPED/DELIVERED)

### 🚀 Comment utiliser

#### **1. Configurer les clés Shopify**

1. Aller sur : https://admin.shopify.com
2. **Settings** > **Apps and integrations** > **Develop apps**
3. **Create an app** → **Custom app**
4. Donner un nom : `Maison Pasha CRM`
5. Aller à **Configuration** > **Admin API access scopes**
6. Cocher :
   - ✅ read_customers
   - ✅ read_orders
   - ✅ read_products
7. **Save** et **Install app**
8. Copier :
   - **API key** → `SHOPIFY_ADMIN_API_KEY`
   - **Admin API access token** → `SHOPIFY_ADMIN_API_PASSWORD`
9. Coller dans `.env.local`

#### **2. Lancer la synchronisation initiale**

```bash
# Depuis le navigateur ou Postman
POST http://localhost:3000/api/shopify/sync

# Réponse (exemple) :
{
  "success": true,
  "message": "Shopify sync completed",
  "data": {
    "customers": 150,
    "orders": 487
  }
}
```

#### **3. Vérifier les données synchronisées**

```bash
# Tous les clients
GET http://localhost:3000/api/customers

# Client spécifique
GET http://localhost:3000/api/customers/{id}

# Toutes les commandes
GET http://localhost:3000/api/orders
```

### 📋 Contenu synchronisé

**Clients (depuis Shopify) :**
- ✅ Email (unique)
- ✅ Prénom / Nom
- ✅ Téléphone
- ✅ Adresse complète
- ✅ Montant total dépensé
- ✅ Date de création

**Commandes (depuis Shopify) :**
- ✅ Numéro de commande
- ✅ Montant total + devise
- ✅ Statut de paiement
- ✅ Produits commandés (nom, quantité, prix)
- ✅ Date de création
- ✅ Client associé (FK)

### 🔐 Sécurité

- ⚠️ **TODO** : Les routes API `/api/shopify/sync` et `/api/orders` n'ont pas encore d'authentification
- ⚠️ Ajouter des vérifications : `if (session?.user?.role !== "ADMIN")`
- 🔑 Les clés Shopify sont stockées de manière sécurisée (variables d'env)

### 📊 Données disponibles après sync

Après synchronisation, vous pouvez accéder à :

```typescript
// Dans la base de données Prisma
prisma.customer.findMany()      // Tous les clients
prisma.order.findMany()         // Toutes les commandes
prisma.customer.findUnique({    // Client + historique
  where: { id: "..." },
  include: { orders: true, notes: true }
})
```

### ✨ Prochaines Étapes

- ✅ Étape 1 : Setup Base de Données → **COMPLÉTÉ**
- ✅ Étape 2 : Connexion API Shopify → **COMPLÉTÉ**
- ⬜ **Étape 3** : Webhooks Shopify (synchronisation temps réel)
- ⬜ Étape 4 : Authentification UI (login)
- ⬜ Étape 5 : Interface CRM (dashboard, clients, commandes)
- ⬜ Étape 6 : Système de Notifications (email au fournisseur)
- ⬜ Étape 7 : Fidélité et Notes
- ⬜ Étape 8 : Déploiement Vercel

---

**Prêt pour l'étape 3 : Webhooks Shopify** 🚀

Les webhooks permettront de synchroniser les commandes en **temps réel** dès qu'une nouvelle commande est passée.
