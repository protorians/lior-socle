"use client";

// Client SSO de sentient-socle vers `sentient-auth`.
// La logique est centralisée dans le SDK (@sentients/sdk) pour être partagée
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
} from "@sentients/sdk/infrastructure/utilities/sso-auth.util";