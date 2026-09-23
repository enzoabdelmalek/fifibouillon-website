/**
 * Lecture des variables d'environnement, sous les deux conventions en usage :
 * les noms serveur (`BUSINESS_ID`, `SUPABASE_URL`…) et les noms
 * `NEXT_PUBLIC_…` repris des autres sites de l'agence (Toscana).
 *
 * Toutes ces lectures ont lieu côté serveur (routes d'API, layout) :
 * le préfixe NEXT_PUBLIC_ n'expose rien au navigateur tant que la variable
 * n'est pas lue dans un composant client.
 */
const first = (...values: (string | undefined)[]) =>
  values.find((v) => v && v.trim() && !/^a remplir$/i.test(v.trim()))?.trim();

export const env = {
  businessId: () => first(process.env.BUSINESS_ID, process.env.NEXT_PUBLIC_BUSINESS_ID),
  supabaseUrl: () => first(process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL),
  /** La service role est préférée ; la clé anon suffit si les RLS autorisent l'accès. */
  supabaseKey: () =>
    first(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  resendApiKey: () => first(process.env.RESEND_API_KEY),
  resendFrom: () => first(process.env.RESEND_FROM),
  adminMail: () => first(process.env.ADMIN_MAIL),
};
