# CivicSense AI: Your Context-Aware Civic Decision Engine

## Chosen Vertical
**Civic Education, Election Readiness & Public Information**

CivicSense AI is a production-grade AI-powered assistant designed to empower citizens with verified election information, personalized voting guidance, and real-time civic education. It bridges the gap between complex bureaucratic data and the average voter through a sleek, engaging, and high-fidelity interface.

---

## Approach and Logic

### 1. Hybrid AI Knowledge Strategy
We implemented a dual-layer AI approach using **Google Gemini 1.5/2.0**:
- **Generative Layer:** Provides context-aware civic advice, explaining complex political terms and voting rights based on user history.
- **Structured Knowledge Layer (Civic AI Assistant):** Uses strictly-bounded prompting and local JSON data sources (Candidates, Elections, FAQs) to provide 100% accurate, non-hallucinated facts with verified source citations.

### 2. Scalable State Management
The application uses **Zustand** coupled with **Firebase Firestore**. 
- **Subcollection Architecture:** Messages are stored in `users/{userId}/messages` rather than a single array. This ensures fast loading, scalability, and prevents document size limits.
- **Real-time Sync:** Sessions are automatically restored upon login, ensuring a seamless multi-device experience.

### 3. Integrated Civic Services
- **Location Intelligence:** Integrated **Google Maps Geocoding** and **Places API** to allow users to find nearby polling stations based on their Pincode or City, restricted specifically to India for compliance.
- **Engagement Analytics:** Centralized **Google Analytics** tracking for every critical user action (flow started, score generated, map viewed) to understand the voter engagement funnel.

---

## How the Solution Works

1.  **Authentication:** Users log in via Google Auth. Their session is unique and persisted in Firestore.
2.  **Context Building:** As users chat, the "Voting Readiness" score increases, reflecting their preparation level.
3.  **Knowledge Retrieval:** Users can use "Quick Actions" to pull verified data from local sources (e.g., WB Candidates) which Gemini explains clearly while citing official ECI links.
4.  **Utility Tools:** Users can trigger the interactive map to find their physical polling station.
5.  **Analytics:** All interactions are logged silently to Firebase Analytics for behavioral insights.

---

## Assumptions Made

- **API Availability:** Assumes valid `VITE_GEMINI_API_KEY`, `VITE_FIREBASE_API_KEY`, and `VITE_GOOGLE_MAPS_API_KEY` are provided in the environment.
- **Regional Focus:** The map and candidate data are primarily focused on the Indian electoral context (ECI).
- **Security:** Assumes Firestore Security Rules are deployed to restrict `userId` access as per the provided implementation plan.
- **Browser Environment:** Assumes a modern browser with `localStorage` and `WebCrypto` support for Firebase.

---

## Quality Assurance & Security

### 1. Automated Testing
We have integrated **Vitest** to ensure the reliability of our core logic. 
- **Core Tests:** `src/store.test.js` validates the state transitions, message handling, and readiness score calculations.
- **Run Tests:** `npm test`

### 2. Production Security
- **Row-Level Security:** The included `firestore.rules` file defines a zero-trust architecture. Users can only read or write to their specific `users/{uid}` path.
- **AI Safety:** Strictly controlled "Structured Knowledge" prompt engineering prevents model injection and hallucination by forcing the AI to rely on provided JSON datasets.

### 3. Accessibility & SEO
- **WCAG Compliance:** Implemented ARIA labels, semantic landmark roles (`main`, `log`), and `aria-live` regions for screen readers.
- **SEO Ready:** Full metadata suite including Open Graph, Twitter Cards, and Meta Descriptions for professional social sharing.

---

## Technology Stack
- **Core:** React 18, Vite
- **Testing:** Vitest, JSDOM
- **Styling:** Vanilla CSS (Glassmorphism), Framer Motion (Animations), Lucide React (Icons)
- **Database:** Firebase Firestore (Subcollection architecture)
- **Auth:** Firebase Authentication (Google Social)
- **AI:** Google Generative AI (Gemini SDK)
- **Maps:** Google Maps JS API (@react-google-maps/api)
- **Analytics:** Firebase Analytics
