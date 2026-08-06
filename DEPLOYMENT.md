# 🚀 Guide de Déploiement Vercel - Maison Pasha CRM

## Prérequis

- Compte GitHub avec le repository du projet
- Compte Vercel (gratuit)
- Compte Neon ou Supabase (PostgreSQL gratuit)
- Compte Resend (emails gratuit)
- Clés API Shopify

## ✅ Étape 1 : Préparer le Repository GitHub

### 1. Initialiser Git (si pas déjà fait)
```bash
cd maison-pasha-crm
git init
git add .
git commit -m "Initial commit: Maison Pasha CRM v1.0"
```

### 2. Créer un repository sur GitHub
- Aller sur https://github.com/new
- Créer un repository `maison-pasha-crm` (public ou privé)
- Ne pas initialiser avec README

### 3. Pousser le code
```bash
git remote add origin https://github.com/YOUR_USERNAME/maison-pasha-crm.git
git branch -M main
git push -u origin main
```

## ✅ Étape 2 : Configurer la Base de Données

### Option A : Neon (Recommandé - Gratuit)
1. Aller sur https://neon.tech
2. Créer un compte
3. Créer un nouveau projet "maison-pasha-crm"
4. Copier la CONNECTION STRING (URL de connexion)
5. Garder pour l'étape 3

### Option B : Supabase (Gratuit aussi)
1. Aller sur https://supabase.com
2. Créer un compte
3. Créer un nouveau projet
4. Aller à Settings > Database > Connection String
5. Copier la PostgreSQL URL
6. Garder pour l'étape 3

## ✅ Étape 3 : Configurer Vercel

### 1. Se connecter à Vercel
- Aller sur https://vercel.com
- Cliquer "Sign up"
- S'inscrire avec GitHub

### 2. Importer le projet
- Cliquer "Add New" > "Project"
- Sélectionner le repository `maison-pasha-crm`
- Cliquer "Import"

### 3. Configurer les variables d'environnement

Dans la section "Environment Variables", ajouter :

```
DATABASE_URL = postgresql://user:password@host/dbname
NEXTAUTH_SECRET = (générer avec: openssl rand -base64 32)
NEXTAUTH_URL = https://maison-pasha-crm.vercel.app
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = maison-pasha.com
SHOPIFY_ADMIN_API_PASSWORD = votre-clé-shopify
RESEND_API_KEY = re_xxxxxxxxxxxxx
SUPPLIER_EMAIL = mandy@maison-pasha.com
```

### 4. Générer NEXTAUTH_SECRET

Depuis votre terminal :
```bash
openssl rand -base64 32
```

Copier le résultat et le coller dans Vercel.

### 5. Cliquer "Deploy"

Vercel va :
- Installer les dépendances
- Builder le projet
- Déployer sur https://maison-pasha-crm.vercel.app

## ✅ Étape 4 : Initialiser la Base de Données

Une fois que le déploiement est terminé :

### 1. Exécuter les migrations Prisma
```bash
# Depuis votre terminal local
DATABASE_URL="votre-url-postgres" npx prisma migrate deploy
```

### 2. Seeder les données initiales
```bash
DATABASE_URL="votre-url-postgres" npx prisma db seed
```

### 3. Vérifier la BD
```bash
DATABASE_URL="votre-url-postgres" npx prisma studio
```

Cela ouvre une UI pour voir/éditer les données.

## ✅ Étape 5 : Tester l'Application

1. Aller sur https://maison-pasha-crm.vercel.app
2. Vous verrez : "Redirection vers /dashboard"
3. Cliquer sur l'URL ou aller à `/auth/signin`
4. Se connecter avec :
   - Email: `patricia@maison-pasha.com`
   - Password: `admin123`

## ✅ Étape 6 : Configurer Shopify Webhooks

### Enregistrer les webhooks

1. Aller à `/dashboard/settings`
2. Cliquer "Enregistrer les Webhooks"
3. Vérifier que les webhooks sont bien enregistrés

### Tester un webhook

1. Aller à `/dashboard/settings`
2. Cliquer "Tester les Webhooks"
3. Vérifier que les emails de test sont reçus

## ✅ Étape 7 : Optimisations Production

### 1. Changer les mots de passe par défaut
```bash
# Dans Prisma Studio
DATABASE_URL="..." npx prisma studio
```

Modifier :
- patricia@maison-pasha.com → nouveau mot de passe
- mandy@maison-pasha.com → nouveau mot de passe

### 2. Ajouter un domaine personnalisé

Dans Vercel :
1. Aller à Settings > Domains
2. Ajouter `crm.maison-pasha.com` (ou votre domaine)
3. Configurer les DNS records selon les instructions Vercel

### 3. Activer la Protection de Branche GitHub

Dans GitHub :
1. Settings > Branches > Add rule
2. Pattern: `main`
3. Require status checks to pass before merging
4. Cela empêche les mauvais déploiements

## 🔧 Variables d'Environnement (Référence)

| Variable | Description | Exemple |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pw@host/db` |
| NEXTAUTH_SECRET | Secret pour sessions JWT | `openssl rand -base64 32` |
| NEXTAUTH_URL | URL de l'app | `https://crm.maison-pasha.com` |
| NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN | Domaine Shopify | `maison-pasha.com` |
| SHOPIFY_ADMIN_API_PASSWORD | Token Shopify | `shpat_xxxxx` |
| RESEND_API_KEY | Clé API Resend | `re_xxxxx` |
| SUPPLIER_EMAIL | Email fournisseur | `mandy@example.com` |

## 🆘 Dépannage

### Erreur : "Invalid DATABASE_URL"
- Vérifier que l'URL PostgreSQL est correcte
- Vérifier que la BD Neon/Supabase est accessible

### Erreur : "NEXTAUTH_SECRET is missing"
- Générer une clé : `openssl rand -base64 32`
- L'ajouter dans Vercel environment variables

### Webhooks ne reçoivent pas les données
- Vérifier que `NEXTAUTH_URL` pointe vers votre domaine Vercel
- Vérifier les logs Vercel (Deployments > Logs)

### Email non reçu
- Vérifier la clé Resend dans `.env`
- Vérifier l'email du fournisseur
- Tester avec `/api/notifications/test`

## 📊 Monitoring

### Logs Vercel
- Aller à Deployments
- Cliquer sur le déploiement
- Voir les logs en temps réel

### Emails Resend
- Aller à https://resend.com
- Voir le dashboard des emails
- Vérifier les emails envoyés/échoués

### Base de Données Neon/Supabase
- Voir le monitoring dans leur dashboard
- Vérifier la consommation de ressources

## 🎉 Déploiement Réussi !

Votre CRM est maintenant en ligne 🚀

**URLs Utiles :**
- App: https://maison-pasha-crm.vercel.app
- Vercel Dashboard: https://vercel.com/dashboard
- Database: (Neon/Supabase console)
- Shopify Admin: https://admin.shopify.com

---

**Prochaines Étapes :**
1. Synchroniser les commandes existantes (`/dashboard/settings`)
2. Enregistrer les webhooks (`/dashboard/settings`)
3. Commencer à gérer les clients et commandes
4. Inviter le fournisseur (Mandy) avec ses identifiants
