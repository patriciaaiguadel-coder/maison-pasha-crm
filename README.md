# 🏠 Maison Pasha CRM

**Système de Gestion de Relation Client (CRM)** pour boutiques Shopify avec synchronisation temps réel, gestion des commandes, et système de fidélité.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

---

## ✨ Fonctionnalités Principales

- ✅ **Sync Shopify** - Webhooks temps réel (commandes, clients)
- ✅ **Authentification** - Rôles admin/supplier
- ✅ **Gestion Clients** - Profils, historique, notes CRM
- ✅ **Gestion Commandes** - Statuts, suivi fournisseur
- ✅ **Notifications Email** - Auto au fournisseur et client
- ✅ **Fidélité** - Points de récompense + 4 niveaux
- ✅ **Dashboard** - Statistiques en temps réel

---

## 🚀 Démarrage Rapide

### Installation
```bash
# 1. Cloner
git clone https://github.com/YOUR_USERNAME/maison-pasha-crm.git
cd maison-pasha-crm

# 2. Installer dépendances
npm install

# 3. Configurer .env.local
cp .env.example .env.local
# Éditer avec vos clés API

# 4. Initialiser BD
npm run db:push
npm run db:seed

# 5. Démarrer
npm run dev
```

Accéder à : http://localhost:3000

### Comptes de Test
```
Admin:    patricia@maison-pasha.com / admin123
Supplier: mandy@maison-pasha.com / supplier123
```

---

## 📖 Documentation Complète

- [SETUP.md](SETUP.md) - Guide installation détaillé
- [DEPLOYMENT.md](DEPLOYMENT.md) - Déployer sur Vercel
- [ETAPE_*.md](.) - Guides techniques par fonctionnalité

---

## 🛠 Tech Stack

- **Frontend** : Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Database** : PostgreSQL (Neon/Supabase)
- **Email** : Resend
- **Auth** : NextAuth.js
- **Deployment** : Vercel

---

## 🎯 Cas d'Usage

### 👤 Patricia (Admin)
- Voir tous les clients et commandes
- Éditer infos clients
- Gérer points de fidélité
- Ajouter notes CRM
- Envoyer emails manuellement

### 🚚 Mandy (Supplier)
- Voir commandes à préparer
- Mettre à jour status de préparation
- Ajouter notes
- Recevoir emails auto pour chaque commande

---

## 📡 API REST

```bash
# Clients
GET    /api/customers
GET    /api/customers/[id]
PUT    /api/customers/[id]/update
POST   /api/customers/[id]/notes

# Commandes
GET    /api/orders
GET    /api/orders/[id]
PUT    /api/orders/[id]/update

# Fidélité
GET    /api/customers/[id]/loyalty
POST   /api/customers/[id]/loyalty
PUT    /api/customers/[id]/loyalty

# Shopify
POST   /api/shopify/sync
POST   /api/webhooks/shopify

# Emails
POST   /api/notifications/send
POST   /api/notifications/test
```

---

## 🚀 Déploiement Production

### Sur Vercel
```bash
# 1. Pousser sur GitHub
git push origin main

# 2. Aller à https://vercel.com
# 3. Importer le repository
# 4. Configurer variables d'env
# 5. Déployer automatiquement
```

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour instructions complètes.

---

## 🔑 Commandes Utiles

```bash
npm run dev              # Dev server
npm run build            # Build prod
npm run db:push          # Sync schema
npm run db:seed          # Seed data
npm run db:studio        # Database UI
npm run lint             # ESLint check
```

---

## 📁 Structure

```
src/
├── app/                 # Pages & API
├── components/          # React components
├── lib/                 # Utilities & services
└── types/               # TypeScript types
```

---

## 🆘 Aide

1. Consulter les guides étape par étape (ETAPE_*.md)
2. Lire [SETUP.md](SETUP.md) pour installation
3. Vérifier [DEPLOYMENT.md](DEPLOYMENT.md) pour production

---

**Créé pour Maison Pasha 🏠**
