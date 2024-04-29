# zkPaper

Zk Paper is a private document editor where you can write and share documents anonymously. It's perfect for storing sensitive data like passwords and confidential information. Once you save a document on our database you can access anywhere using your wallet. Our security protocol does not allow peaking into your documents as we only save them encrypted on our database. We leverage wallet signature for authentication and a mixture of AES encryption and metamask's decryption features. We use noir for writing and generating ZKPs and everything runs locally in the browser. We provide features for users to save small and medium-sized documents as long as it's written in some text encoding format. With ZKP we can attest a document was written and we can also attest a document was changed, proving to other parties we modified the document. When saving user data on our DB we only save either public or encrypted data, and when users share documents they only need to share public information to request read permission.

## Running the project

### Frontend

1. Install the packages with yarn:

``yarn``

2. Start the development node with:

``npm run node``

3. Run the frontend with

``yarn dev``

### Backend

1. Install the packages with yarn:

``yarn``

2. Run the backend with:

``yarn dev``

### Envs

Be sure to use environment variables for you application database, contract address and more

1. Frontend env:

```

VITE_API_URL=http://localhost:3000/api

VITE_APP_CONTRACT_ADDRESS=0x0E5438f1f3aa7454b7C3496E9E276f19Acfb3FCc

VITE_APP_ENV=localVITE_APP_ENV

```

2. Backend env:

```

MONGODB_URI=...

MONGODB_DB=zkpaper

BACKEND_PORT=3001

SECRET_KEY=...

```
