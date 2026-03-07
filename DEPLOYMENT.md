# 🚀 Guide de Déploiement - OLUWATOBI CORPORATION

Ce guide vous explique comment déployer votre site e-commerce sur **Vercel** avec **MongoDB Atlas** comme base de données.

---

## 📋 Prérequis

- Un compte [GitHub](https://github.com) ✅ (vous l'avez déjà !)
- Un compte [Vercel](https://vercel.com) (pour le déploiement)
- Un compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (pour la base de données - GRATUIT)

---

## 🎯 Déploiement Rapide

### Étape 1 : Créer un cluster MongoDB Atlas (GRATUIT)

1. Allez sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquez sur **"Try Free"** ou **"Start Free"**
3. Créez votre compte (ou connectez-vous avec Google)
4. Choisissez le plan **M0 FREE**
5. Sélectionnez la région : **Europe (Frankfurt)** ou **Europe (Ireland)** (le plus proche de la Côte d'Ivoire)
6. Donnez un nom à votre cluster : `oluwatobi-cluster`
7. Cliquez sur **"Create"**
8. Attendez ~5 minutes que le cluster soit créé

### Étape 2 : Créer un utilisateur de base de données

1. Dans le menu de gauche, allez dans **Database Access**
2. Cliquez sur **"Add New Database User"**
3. Choisissez **"Password"** comme méthode d'authentification
4. Entrez un **username** : `oluwatobi-admin`
5. Entrez un **mot de passe** (cliquez sur "Autogenerate Secure Password" ou créez le vôtre)
6. ⚠️ **Gardez ce mot de passe !** Vous en aurez besoin
7. Cliquez sur **"Add User"**

### Étape 3 : Configurer l'accès réseau

1. Dans le menu de gauche, allez dans **Network Access**
2. Cliquez sur **"Add IP Address"**
3. Cliquez sur **"Allow Access from Anywhere"** (pour Vercel)
4. Cliquez sur **"Confirm"**

### Étape 4 : Obtenir l'URL de connexion

1. Dans le menu de gauche, allez dans **Database**
2. Cliquez sur **"Connect"** sur votre cluster
3. Choisissez **"Connect your application"**
4. Driver : **Node.js**
5. Version : la plus récente
6. Copiez l'URL de connexion

Elle ressemble à :
```
mongodb+srv://oluwatobi-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. ⚠️ **Remplacez `<password>` par votre mot de passe**
8. Ajoutez le nom de la base de données après `mongodb.net/` :
```
mongodb+srv://oluwatobi-admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/oluwatobi?retryWrites=true&w=majority
```

### Étape 5 : Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"** ou **"Log In"** avec **GitHub**
3. Autorisez Vercel à accéder à vos repositories
4. Cliquez sur **"Add New..."** → **"Project"**
5. Sélectionnez le repository `Armandodino/oluwatobi-corporation`
6. Cliquez sur **"Import"**

#### Configuration importante :

Dans la section **"Environment Variables"**, ajoutez :

| Name | Value |
|------|-------|
| `DATABASE_URL` | `mongodb+srv://oluwatobi-admin:MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/oluwatobi?retryWrites=true&w=majority` |

7. Cliquez sur **"Deploy"**
8. Attendez ~2-3 minutes

### Étape 6 : Initialiser la base de données

Une fois le déploiement terminé :

1. Visitez votre site : `https://votre-site.vercel.app`
2. Allez à : `https://votre-site.vercel.app/api/seed`
   - Cela crée les catégories et produits de démonstration
3. Créez l'admin via cette commande (dans votre navigateur ou avec curl) :

```
https://votre-site.vercel.app/api/init
```

Ou connectez-vous simplement avec :
- **ID** : `max`
- **Mot de passe** : `Oluwatobi@@`

---

## 🔄 Mises à jour

Pour mettre à jour votre site :

```bash
# Faire vos modifications localement
git add .
git commit -m "Mise à jour"
git push

# Vercel redéploie automatiquement !
```

---

## 📱 Domaine personnalisé

Pour ajouter votre propre domaine :

1. Allez dans **Settings** → **Domains** sur Vercel
2. Ajoutez votre domaine (ex: `oluwatobi-ci.com`)
3. Configurez les DNS :

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

---

## 🔒 Sécurité

⚠️ **Changez le mot de passe admin en production !**

Connectez-vous et changez le mot de passe, ou mettez à jour via MongoDB Atlas.

---

## 🆘 Dépannage

### Erreur "MongoServerError: Authentication failed"
- Vérifiez que le mot de passe dans l'URL est correct
- Vérifiez que l'utilisateur existe dans Database Access

### Erreur "connection timeout"
- Vérifiez que Network Access autorise toutes les IP (0.0.0.0/0)

### Site lent au premier chargement
- Normal : le cluster MongoDB se "réveille" après inactivité
- Les requêtes suivantes seront rapides

---

## 📞 Liens utiles

- **Votre repository** : https://github.com/Armandodino/oluwatobi-corporation
- **MongoDB Atlas** : https://cloud.mongodb.com
- **Vercel Dashboard** : https://vercel.com/dashboard

---

## 🎉 Résumé des identifiants

| Service | Identifiant |
|---------|-------------|
| GitHub | Votre compte GitHub |
| MongoDB Atlas | Créez un compte gratuit |
| Admin du site | ID: `max` / Mot de passe: `Oluwatobi@@` |
| WhatsApp | +225 07 15 54 14 |

**Bonne chance avec votre boutique OLUWATOBI CORPORATION !** 🛠️🇨🇮
