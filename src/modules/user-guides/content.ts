export const docs: Record<string, any> = {
  "access-control": {
    title: "Access Control",
    summary: "Gérer les rôles et permissions.",
    content: `Purpose: Manage roles, permissions and access policies for users and services.\n\nUI: Manager → Settings → Access Control\n\nCommon tasks:\n- Create a role\n- Assign role to user\n\nCode references: frontend/sentient-manager/src/modules/access-control`
  },
  "billing": {
    title: "Billing",
    summary: "Facturation : factures, paiements et abonnements.",
    content: `Purpose: Manage invoices, collect payments, and configure payment methods.\n\nUI: Manager → Billing\n\nCommon tasks:\n- View and send invoices\n- Update payment method\n\nCode references: frontend/sentient-manager/src/modules/billing`
  },
  "users": {
    title: "Users",
    summary: "Gestion des utilisateurs : inviter, désactiver, profils.",
    content: `Purpose: Manage user lifecycle and settings.\n\nUI: Manager → Users\n\nCommon tasks:\n- Invite a user\n- Reset password / deactivate user\n\nCode references: frontend/sentient-manager/src/modules/users`
  },
  "auth": {
    title: "Auth",
    summary: "Authentification et gestion de session.",
    content: `Purpose: Describe sign-in flows, MFA, and token lifecycle.\n\nUI: Manager → Sign In / Settings → Security\n\nCommon tasks:\n- Enable/disable MFA\n- Rotate API keys\n\nCode references: frontend/sentient-manager/src/modules/auth`
  },
  "crm": {
    title: "CRM",
    summary: "Gestion des relations clients: leads, contacts, pipelines.",
    content: `Purpose: Track customer interactions and manage sales pipelines.\n\nUI: Manager → CRM\n\nCommon tasks:\n- Create lead and convert to customer\n- Log interactions\n\nCode references: frontend/sentient-manager/src/modules/crm`
  }
};
