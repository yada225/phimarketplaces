import { useState } from "react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";

const Auth = () => {
  const { lang } = useI18n();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const isFr = lang === "fr";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate(`/${lang}/dashboard`);
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) setError(error);
      else setSuccessMsg(isFr ? "Vérifiez votre email pour confirmer votre inscription." : "Check your email to confirm your registration.");
    }
    setLoading(false);
  };

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-6">
            {isLogin ? (isFr ? "Connexion" : "Sign In") : (isFr ? "Inscription" : "Sign Up")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {isFr ? "Nom complet" : "Full Name"}
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> {isFr ? "Mot de passe" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {successMsg && <p className="text-sm text-primary">{successMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? "..."
                : isLogin
                ? (isFr ? "Se connecter" : "Sign In")
                : (isFr ? "S'inscrire" : "Sign Up")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin
              ? (isFr ? "Pas de compte ?" : "No account?")
              : (isFr ? "Déjà un compte ?" : "Already have an account?")}
            {" "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); setSuccessMsg(""); }} className="text-primary font-medium hover:underline">
              {isLogin ? (isFr ? "S'inscrire" : "Sign Up") : (isFr ? "Se connecter" : "Sign In")}
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Auth;
