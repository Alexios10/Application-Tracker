import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Shield } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LoginPage = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Skjema-felter
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  // Allerede innlogget? Gå til forsiden
  if (user) {
    return <Navigate to="/" replace />;
  }

  function showPasswordToggle() {
    setShowPassword(!showPassword);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result: string | null;

    if (isRegister) {
      result = await register(username, email, fullName, password);
    } else {
      result = await login(username, password);
    }

    if (result) {
      setError(result);
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-emerald-300 shadow-lg shadow-emerald-500/40">
            <Briefcase className="h-7 w-7 text-slate-950" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
            Jobbsøknad Tracker
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {isRegister
              ? "Opprett en ny konto for å komme i gang"
              : "Logg inn for å se søknadene dine"}
          </p>
        </div>

        {/* Skjema */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-xl backdrop-blur"
        >
          {/* Feilmelding */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Registrerings-felter */}
          {isRegister && (
            <>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                NB: Veldig viktig at du registrerer riktig e-postadresse
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">
                  Fullt navn
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ola Nordmann"
                  required
                  className="border-slate-700/80 bg-slate-900/70 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  E-post
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ola@eksempel.no"
                  required
                  className="border-slate-700/80 bg-slate-900/70 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
                />
              </div>
            </>
          )}

          {/* Brukernavn */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Brukernavn
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="brukernavn"
              required
              className="border-slate-700/80 bg-slate-900/70 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
            />
          </div>

          {/* Passord */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Passord
            </Label>
            <div className="flex justify-center items-center relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minst 6 tegn, inkl. et tall"
                required
                minLength={6}
                className="border-slate-700/80 bg-slate-900/70 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
              />
              <span
                className="text-slate-50 absolute right-3 cursor-pointer"
                onClick={showPasswordToggle}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          {/* Glemt passord-lenke kun for login */}
          {!isRegister && (
            <div className="text-right mb-2">
              <a
                href="/forgot-password"
                className="text-blue-500 hover:underline text-sm"
              >
                Glemt passord?
              </a>
            </div>
          )}

          {/* Knapp */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-emerald-400 font-semibold text-slate-950 hover:from-sky-400 hover:to-emerald-300"
          >
            {loading
              ? "Vennligst vent..."
              : isRegister
                ? "Opprett konto"
                : "Logg inn"}
          </Button>

          {/* Bytt mellom login/register */}
          <p className="text-center text-sm text-slate-400">
            {isRegister
              ? "Har du allerede en konto? "
              : "Har du ikke en konto? "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="font-medium text-sky-400 hover:text-sky-300"
            >
              {isRegister ? "Logg inn" : "Registrer deg"}
            </button>
          </p>
        </form>

        {/* Personvern */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="mx-auto flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300">
              <Shield className="h-3.5 w-3.5" />
              Personvern og rettigheter
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-700/60 bg-slate-900 text-slate-200 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-50">
                Personvern og rettigheter
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-relaxed text-slate-300">
              <section>
                <h3 className="mb-1 font-semibold text-slate-100">
                  Datainnsamling
                </h3>
                <p>
                  Vi lagrer kun informasjon du oppgir ved registrering
                  (brukernavn, e-postadresse og fullt navn) samt jobbsøknadene
                  du registrerer. Vi samler ikke inn data fra tredjeparter.
                </p>
              </section>
              <section>
                <h3 className="mb-1 font-semibold text-slate-100">
                  Bruk av data
                </h3>
                <p>
                  Dataene brukes utelukkende for å gi deg oversikt over dine
                  jobbsøknader. Vi selger eller deler aldri dine opplysninger
                  med andre.
                </p>
              </section>
              <section>
                <h3 className="mb-1 font-semibold text-slate-100">
                  Lagring og sikkerhet
                </h3>
                <p>
                  Passord lagres kryptert. All kommunikasjon mellom nettleseren
                  din og serveren skjer over HTTPS.
                </p>
              </section>
              <section>
                <h3 className="mb-1 font-semibold text-slate-100">
                  Dine rettigheter
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Du kan når som helst be om innsyn i dataene vi lagrer om
                    deg.
                  </li>
                  <li>Du kan be om at dataene dine blir slettet.</li>
                  <li>Du kan oppdatere eller korrigere opplysningene dine.</li>
                </ul>
              </section>
              <section>
                <h3 className="mb-1 font-semibold text-slate-100">Kontakt</h3>
                <p>
                  Har du spørsmål om personvern? Ta kontakt på{" "}
                  <a
                    href="mailto:sattar_saud@hotmail.com"
                    className="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    sattar_saud@hotmail.com
                  </a>
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LoginPage;
