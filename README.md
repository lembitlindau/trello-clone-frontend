# Trello Kloon Frontend

See rakendus on Trello kloon, mis võimaldab kasutajatel luua ja hallata tahvleid, nimekirju ja kaarte. Rakendus suhtleb Trello kloon API-ga, et pakkuda täielikku projektihalduse funktsionaalsust.

## Funktsionaalsus

- **Autentimine**: Kasutajate registreerimine ja sisselogimine
- **Tahvlite haldamine**: Tahvlite loomine, kuvamine, muutmine ja kustutamine
- **Nimekirjade haldamine**: Nimekirjade loomine, kuvamine, muutmine ja kustutamine tahvlite sees
- **Kaartide haldamine**: Kaartide loomine, kuvamine, muutmine ja kustutamine nimekirjade sees
- **Drag and Drop**: Kaartide liigutamine nimekirjade vahel drag and drop funktsionaalsuse abil
- **Lemmikud**: Tahvlite lisamine lemmikutesse ja eemaldamine lemmikutest
- **Arhiveerimine**: Tahvlite arhiveerimine ja taastamine

## Tehnoloogiad

- React + TypeScript
- Vite
- Material-UI
- React Router
- Formik + Yup
- React Beautiful DnD
- Axios
- React Context API
- date-fns

## Installeerimine ja käivitamine

### Eeltingimused

- Node.js (versioon 18 või uuem)
- npm või yarn
- Trello kloon API (backend)

### Installeerimine

1. Klooni repositoorium

```bash
git clone <repositooriumi-url>
cd trello-clone-frontend
```

2. Installeeri sõltuvused

```bash
npm install --legacy-peer-deps
# või
yarn install --legacy-peer-deps
```

3. Loo `.env` fail projekti juurkausta ja lisa sinna API URL

```
VITE_API_URL=http://localhost:3000
```

4. Käivita arendusserver

```bash
npm run dev
# või
yarn dev
```

5. Ava brauser aadressil http://localhost:5173

## Projekti struktuur

```
src/
├── assets/         # Staatilised failid (pildid jms)
├── components/     # Korduvkasutatavad komponendid
│   ├── auth/       # Autentimisega seotud komponendid
│   ├── board/      # Tahvlitega seotud komponendid
│   ├── list/       # Nimekirjadega seotud komponendid
│   └── card/       # Kaartidega seotud komponendid
├── contexts/       # React kontekstid
├── hooks/          # Kohandatud React hookid
├── pages/          # Rakenduse lehed
├── services/       # API teenused
├── types/          # TypeScript tüübid
├── utils/          # Abifunktsioonid
├── App.tsx         # Rakenduse peakomponent
└── main.tsx        # Rakenduse sisenemispunkt
```

## API integratsioon

Rakendus suhtleb backend API-ga, mis on implementeeritud eraldi projektina. API endpointid on defineeritud `src/services/api.ts` failis.

## Arendus

### Uute funktsioonide lisamine

1. Lisa vajalikud tüübid `src/types/index.ts` faili
2. Lisa vajalikud API endpointid `src/services/api.ts` faili
3. Uuenda kontekste vastavalt vajadusele
4. Loo uued komponendid või muuda olemasolevaid

### Buildimine tootmiskeskkonna jaoks

```bash
npm run build
# või
yarn build
```
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
