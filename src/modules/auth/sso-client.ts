"use client";

// Client SSO de liorian-socle vers `liorian-auth`.
// La logique est centralisée dans le SDK (@liorian/sdk) pour être partagée
// avec le composant `AuthLockScreen` ; ce fichier en expose l'API publique.
export {
    startSsoLogin,
    startSsoLoginPopup,
    handleSsoCallback,
    isSsoCallbackInPopup,
    buildSsoLoginUrl,
    SSO_CLIENT_ID,
    SSO_REDIRECT_PATH,
    SSO_CALLBACK_MESSAGE,
} from "@liorian/sdk/infrastructure/utilities/sso-auth.util";