# 🚀 Guide de Déploiement — M&A Radar Maroc Dashboard

## Ce que tu vas faire en 4 étapes (30 minutes max)

---

## ÉTAPE 1 — Créer ta base de données (10 min)

1. Va sur https://supabase.com et crée un compte gratuit
2. Clique "New Project" → donne-lui un nom (ex: ma-radar-maroc)
3. Choisis une région : "West EU (Ireland)" → clique "Create Project"
4. Une fois créé, va dans l'onglet **"SQL Editor"**
5. Copie-colle ce SQL et clique "Run" :

```sql
CREATE TABLE opportunites (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entreprise      text,
  secteur         text,
  score_final     integer DEFAULT 0,
  niveau_alerte   text,
  type_deal       text,
  source          text,
  signaux         jsonb,
  recommandation  text,
  memo_origination text,
  statut          text DEFAULT 'nouveau',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE signaux (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source      text,
  titre       text,
  entreprise  text,
  signal_type text,
  score_ia    integer,
  url         text,
  raw_text    text,
  created_at  timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE opportunites;
ALTER PUBLICATION supabase_realtime ADD TABLE signaux;
```

6. Va dans **Settings → API** et copie :
   - Project URL → c'est ton REACT_APP_SUPABASE_URL
   - anon/public key → c'est ton REACT_APP_SUPABASE_KEY

---

## ÉTAPE 2 — Configurer le projet (5 min)

1. Télécharge le dossier `ma_radar_dashboard`
2. Dans le dossier, copie `.env.example` en `.env.local`
3. Ouvre `.env.local` et remplace les valeurs :
   ```
   REACT_APP_SUPABASE_URL=https://TON-VRAI-PROJECT.supabase.co
   REACT_APP_SUPABASE_KEY=ta-vraie-cle-anon
   ```

---

## ÉTAPE 3 — Déployer sur Vercel (5 min)

### Option A — Sans installer quoi que ce soit (recommandé)
1. Va sur https://github.com et crée un compte
2. Crée un nouveau repository "ma-radar-maroc"
3. Uploade tous les fichiers du dossier `ma_radar_dashboard`
4. Va sur https://vercel.com → "Add New Project" → importe ton repo GitHub
5. Dans la section "Environment Variables", ajoute :
   - REACT_APP_SUPABASE_URL = ton URL Supabase
   - REACT_APP_SUPABASE_KEY = ta clé Supabase
6. Clique "Deploy" → en 2 minutes tu as une URL publique ! 🎉

### Option B — Avec Node.js installé sur ton ordi
```bash
cd ma_radar_dashboard
npm install
npm start
# → s'ouvre sur http://localhost:3000
```

---

## ÉTAPE 4 — Ajouter des données de test (5 min)

1. Dans Supabase → "Table Editor" → table "opportunites"
2. Clique "Insert row" et ajoute une première opportunité :
   - entreprise: "Label'Vie Group"
   - secteur: "Distribution"
   - score_final: 91
   - niveau_alerte: "CRITIQUE"
   - type_deal: "acquisition"
   - source: "AMMC"
   - recommandation: "Contact CA dans les 3 semaines"
   - signaux: ["changement_direction", "transmission_succession"]

3. Rafraîchis ton dashboard → la ligne apparaît en temps réel ! ⚡

---

## ✅ Résultat final

Tu as un dashboard en ligne, accessible depuis ton téléphone et ton bureau,
qui affiche en temps réel les opportunités scorées par ton système.

La prochaine étape : connecter les scrapers Python pour que tout
s'alimente automatiquement.

---

## 🆘 En cas de problème

Copie l'erreur que tu vois et envoie-la à Claude — je te dis exactement quoi faire.
