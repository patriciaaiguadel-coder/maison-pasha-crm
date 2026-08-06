# Setup Guide - Maison Pasha CRM

## Étape 1 : Configuration Base de Données

### Option A : Utiliser Neon (Recommandé - gratuit)

1. Créer un compte sur [Neon.tech](https://neon.tech)
2. Créer un nouveau projet PostgreSQL
3. Copier l'URL de connexion (format: `postgresql://user:password@host/dbname`)
4. Remplacer `DATABASE_URL` dans `.env.local`

### Option B : Utiliser Supabase (Gratuit)

1. Créer un compte sur [Supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans Settings > Database > Connection string
4. Copier la connection string PostgreSQL
5. Remplacer `DATABASE_URL` dans `.env.local`

### Option C : Base de données locale (PostgreSQL)

1. Installer PostgreSQL localement
2. Créer une base de données: `createdb maison_pasha_crm`
3. Utiliser: `postgresql://postgres:password@localhost:5432/maison_pasha_crm`

## Étape 2 : Initialiser la Base de Données

```bash
# Générer Prisma Client
npx prisma generate

# Créer les tables
npx prisma migrate dev --name init

# (Optionnel) Visualiser la BD avec Prisma Studio
npx prisma studio
```

## Étape 3 : Variables d'Environnement

Remplir le fichier `.env.local` :

```env
# Database (voir étape 1)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Shopify
# Pour obtenir les clés :
# 1. Aller sur https://admin.shopify.com
# 2. Settings > Apps and integrations > Develop apps
# 3. Create an app -> Custom app
# 4. Admin API access scopes :
#    - read_customers, read_orders, read_products
# 5. Copier : API key (SHOPIFY_ADMIN_API_KEY) et API access token (SHOPIFY_ADMIN_API_PASSWORD)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="maison-pasha.com"
SHOPIFY_ADMIN_API_KEY="your-api-key"
SHOPIFY_ADMIN_API_PASSWORD="your-access-token"

# Email Notifications (Resend)
RESEND_API_KEY="..."
SUPPLIER_EMAIL="mandy@example.com"
```

## Étape 4 : Créer le Premier Utilisateur Admin

```bash
npm run seed
```

Ou manuellement via Prisma Studio :
```bash
npx prisma studio
```

Ajouter un utilisateur dans la table `users` :
- email: `patricia@example.com`
- password: hasher avec bcrypt
- role: `ADMIN`

## Étape 5 : Démarrer le Serveur

```bash
npm run dev
```

Accéder à : http://localhost:3000

## Prochaines Étapes

- ✅ Étape 1 : Setup Base de Données (TERMINÉ)
- ⬜ Étape 2 : Connexion API Shopify
- ⬜ Étape 3 : Webhooks Shopify
- ⬜ Étape 4 : Authentification UI
- ⬜ Étape 5 : Interface CRM (Dashboard, Clients, Commandes)
- ⬜ Étape 6 : Système de Notifications
- ⬜ Étape 7 : Fidélité et Notes
- ⬜ Étape 8 : Déploiement Vercel
